# Backend Integration Guide

Concrete backend implementation examples for all architecture patterns. Node.js ecosystem focused; principles apply universally.

---

## Core Patterns

- Complete Example: Order Service
- NestJS Implementation
- Testing
- Environment-Based Adapter Selection

---

## Complete Example: Order Service

### Folder Structure

```
src/
├── domain/
│   ├── entities/          # Order.ts, OrderItem.ts
│   ├── value-objects/     # Money.ts
│   └── errors/            # DomainError.ts
├── application/
│   ├── use-cases/         # PlaceOrder.ts, CancelOrder.ts
│   ├── ports/             # IOrderRepository.ts, IPaymentGateway.ts, IEmailService.ts
│   └── dto/               # PlaceOrderDTO.ts
├── infrastructure/
│   ├── repositories/      # PostgresOrderRepository.ts
│   ├── gateways/          # StripePaymentGateway.ts
│   ├── services/          # SendGridEmailService.ts
│   └── database/prisma/
├── presentation/
│   ├── http/
│   │   ├── controllers/   # OrderController.ts
│   │   ├── routes/        # orderRoutes.ts
│   │   └── middleware/    # errorHandler.ts
│   └── cli/               # OrderCLI.ts
└── main.ts                # Composition root
```

### Domain Entity

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    private _status: OrderStatus,
  ) {}

  get status(): OrderStatus { return this._status; }

  get total(): Money {
    return this.items.reduce((sum, item) => sum.add(item.subtotal), new Money(0, "USD"));
  }

  confirm(): void {
    if (this._status !== "pending") throw new DomainError("Can only confirm pending orders");
    if (this.items.length === 0) throw new DomainError("Cannot confirm empty order");
    this._status = "confirmed";
  }

  cancel(): void {
    if (this._status === "delivered") throw new DomainError("Cannot cancel delivered orders");
    this._status = "cancelled";
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    if (this.items.length === 0) errors.push("Order must have at least one item");
    if (this.total.amount < 0) errors.push("Total cannot be negative");
    return { valid: errors.length === 0, errors };
  }
}
```

### Use Case (Application Layer)

```typescript
// application/use-cases/PlaceOrder.ts
export class PlaceOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentGateway: IPaymentGateway,
    private emailService: IEmailService,
    private logger: ILogger,
  ) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order>> {
    // 1. Create and validate domain entity
    const items = dto.items.map(
      (i) => new OrderItem(i.productId, i.quantity, new Money(i.price, "USD")),
    );
    const order = new Order(generateId(), dto.customerId, items, "pending");

    const validation = order.validate();
    if (!validation.valid) return Result.fail(validation.errors.join(", "));

    // 2. Process payment
    const paymentResult = await this.paymentGateway.charge(order.total.amount, dto.paymentToken);
    if (!paymentResult.success) return Result.fail("Payment failed");

    // 3. Confirm, persist, notify
    order.confirm();
    await this.orderRepo.save(order);
    await this.emailService.sendOrderConfirmation(dto.customerId, order.id);

    this.logger.info("Order placed", { orderId: order.id });
    return Result.ok(order);
  }
}
```

### Repository (Infrastructure Layer)

```typescript
// infrastructure/repositories/PostgresOrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    return row ? this.toDomain(row) : null;
  }

  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id, customerId: order.customerId,
          status: order.status, total: order.total.amount, currency: order.total.currency,
        },
        update: { status: order.status, total: order.total.amount },
      });
      await Promise.all(order.items.map((item) =>
        tx.orderItem.upsert({
          where: { orderId_productId: { orderId: order.id, productId: item.productId } },
          create: {
            orderId: order.id, productId: item.productId,
            quantity: item.quantity, price: item.price.amount, currency: item.price.currency,
          },
          update: { quantity: item.quantity, price: item.price.amount },
        }),
      ));
    });
  }

  private toDomain(row: any): Order {
    const items = row.items.map(
      (i: any) => new OrderItem(i.productId, i.quantity, new Money(i.price, i.currency)),
    );
    return new Order(row.id, row.customerId, items, row.status);
  }
}
```

### Controller (Presentation Layer)

```typescript
// presentation/http/controllers/OrderController.ts
export class OrderController {
  constructor(
    private placeOrder: PlaceOrderUseCase,
    private cancelOrder: CancelOrderUseCase,
    private getOrder: GetOrderUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.placeOrder.execute({
        customerId: req.body.customerId,
        items: req.body.items,
        paymentToken: req.body.paymentToken,
      });

      if (result.isSuccess) {
        res.status(201).json({
          id: result.value.id, status: result.value.status, total: result.value.total.amount,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) { next(error); }
  }

  // cancel() and getById() follow same pattern: call use case → map Result to HTTP response
}
```

### Composition Root

```typescript
// main.ts — Wires all dependencies
async function bootstrap() {
  const prisma = new PrismaClient();
  const stripe = new Stripe(process.env.STRIPE_KEY!);

  const orderRepo = new PostgresOrderRepository(prisma);
  const paymentGateway = new StripePaymentGateway(stripe);
  const emailService = new SendGridEmailService(new SendGridClient(process.env.SENDGRID_KEY!));
  const logger = new WinstonLogger();

  const placeOrderUseCase = new PlaceOrderUseCase(orderRepo, paymentGateway, emailService, logger);
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepo, paymentGateway, logger);
  const getOrderUseCase = new GetOrderUseCase(orderRepo, logger);

  const orderController = new OrderController(placeOrderUseCase, cancelOrderUseCase, getOrderUseCase);

  const app = express();
  app.use(express.json());
  app.post("/orders", (req, res, next) => orderController.create(req, res, next));
  app.delete("/orders/:id", (req, res, next) => orderController.cancel(req, res, next));
  app.get("/orders/:id", (req, res, next) => orderController.getById(req, res, next));
  app.use(errorHandler);

  app.listen(process.env.PORT || 3000);
}

bootstrap().catch(console.error);
```

---

## NestJS Implementation

NestJS provides built-in DI and modules — no manual composition root needed:

```typescript
// order.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [
    PlaceOrderUseCase, CancelOrderUseCase, GetOrderUseCase,
    { provide: "IOrderRepository", useClass: PostgresOrderRepository },
    { provide: "IPaymentGateway", useClass: StripePaymentGateway },
    { provide: "IEmailService", useClass: SendGridEmailService },
  ],
})
export class OrderModule {}

// order.controller.ts
@Controller("orders")
export class OrderController {
  constructor(private placeOrder: PlaceOrderUseCase) {}

  @Post()
  async create(@Body() dto: PlaceOrderDTO): Promise<OrderResponseDTO> {
    const result = await this.placeOrder.execute(dto);
    if (!result.isSuccess) throw new BadRequestException(result.error);
    return { id: result.value.id, status: result.value.status, total: result.value.total.amount };
  }
}

// place-order.use-case.ts — Same logic, NestJS DI via @Inject
@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject("IOrderRepository") private orderRepo: IOrderRepository,
    @Inject("IPaymentGateway") private paymentGateway: IPaymentGateway,
    @Inject("IEmailService") private emailService: IEmailService,
  ) {}
  // Same execute() implementation
}
```

---

## Testing

### Unit Tests (Use Cases)

```typescript
describe("PlaceOrderUseCase", () => {
  let useCase: PlaceOrderUseCase;
  let mockRepo: jest.Mocked<IOrderRepository>;
  let mockPayment: jest.Mocked<IPaymentGateway>;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), save: jest.fn() };
    mockPayment = { charge: jest.fn().mockResolvedValue({ success: true, transactionId: "tx-1" }) };
    const mockEmail = { sendOrderConfirmation: jest.fn() };
    const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    useCase = new PlaceOrderUseCase(mockRepo, mockPayment, mockEmail, mockLogger);
  });

  it("should place order successfully", async () => {
    const dto: PlaceOrderDTO = {
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2, price: 50 }],
      paymentToken: "tok_123",
    };
    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Order));
    expect(mockPayment.charge).toHaveBeenCalledWith(100, "tok_123");
  });

  it("should fail if payment fails", async () => {
    mockPayment.charge.mockResolvedValue({ success: false });
    const result = await useCase.execute({
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2, price: 50 }],
      paymentToken: "tok_123",
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe("Payment failed");
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe("Order API (Integration)", () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: "postgresql://test" } } });
    app = createApp(prisma);
  });
  afterEach(async () => { await prisma.order.deleteMany(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it("should create order via HTTP", async () => {
    const response = await request(app).post("/orders").send({
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2, price: 50 }],
      paymentToken: "tok_test",
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("confirmed");

    const order = await prisma.order.findUnique({ where: { id: response.body.id } });
    expect(order?.status).toBe("confirmed");
  });
});
```

---

## Environment-Based Adapter Selection

```typescript
// main.ts — Swap adapters by environment
function createEmailService(): IEmailService {
  if (process.env.NODE_ENV === "production") return new SendGridEmailService(sendgrid);
  if (process.env.NODE_ENV === "development") return new ConsoleEmailService();
  return new MockEmailService(); // tests
}

function createPaymentGateway(): IPaymentGateway {
  if (process.env.NODE_ENV === "production") return new StripePaymentGateway(stripe);
  return new FakePaymentGateway(); // always succeeds
}
```

---

## Migration Strategy

### Incremental Adoption

```
1. New features → Apply Clean Architecture to new endpoints
2. Extract use cases → Move business logic out of controllers
3. Define ports → Create IRepository interfaces, implement adapters
4. Refactor hot spots → Areas with most bugs/changes first
```

### Anti-Corruption Layer for Legacy

```typescript
export class LegacyOrderAdapter implements IOrderRepository {
  constructor(private legacyDb: LegacyDatabase) {}

  async findById(id: string): Promise<Order | null> {
    const legacyOrder = await this.legacyDb.getOrder(id);
    return legacyOrder ? this.toDomain(legacyOrder) : null;
  }

  async save(order: Order): Promise<void> {
    await this.legacyDb.saveOrder(this.toLegacy(order));
  }

  private toDomain(legacy: any): Order { /* map legacy → domain */ }
  private toLegacy(order: Order): any { /* map domain → legacy */ }
}
```

---

## Summary

1. Express requires manual DI; NestJS provides it built-in
2. Composition root (main.ts) wires all dependencies
3. Unit test use cases with mocks; integration test with real DB
4. Swap adapters by environment (prod/dev/test)
5. Migrate incrementally — new features first, hot spots second
6. For microservice cross-cutting concerns, see [sidecar-pattern.md](sidecar-pattern.md)

---

## References

- [Main SKILL](../SKILL.md)
- [Clean Architecture](clean-architecture.md), [Hexagonal Architecture](hexagonal-architecture.md), [SOLID Principles](solid-principles.md)
- [DRY Principle](dry-principle.md), [Sidecar Pattern](sidecar-pattern.md)
- [Frontend Integration](frontend-integration.md)
- **External**: [NestJS Docs](https://docs.nestjs.com/), [Clean Architecture in Node](https://dev.to/remojansen/implementing-the-clean-architecture-in-nodejs-2k2p)
