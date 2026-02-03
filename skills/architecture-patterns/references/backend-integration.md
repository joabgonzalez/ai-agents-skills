# Backend Integration Guide

> Complete implementation guide for applying architecture patterns in backend projects (Node.js, NestJS, Express).

## Overview

This guide provides concrete backend implementation examples for all architecture patterns. Focus on Node.js ecosystem but principles apply to any backend technology.

> **Note**: Framework-specific architecture guidance (NestJS, Express, Fastify, etc.) belongs in those technology's skills when created.

---

## Complete Example: Order Service

### Folder Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Order.ts
│   │   └── OrderItem.ts
│   ├── value-objects/
│   │   └── Money.ts
│   └── errors/
│       └── DomainError.ts
├── application/
│   ├── use-cases/
│   │   ├── PlaceOrder.ts
│   │   └── CancelOrder.ts
│   ├── ports/
│   │   ├── IOrderRepository.ts
│   │   ├── IPaymentGateway.ts
│   │   └── IEmailService.ts
│   └── dto/
│       └── PlaceOrderDTO.ts
├── infrastructure/
│   ├── repositories/
│   │   └── PostgresOrderRepository.ts
│   ├── gateways/
│   │   └── StripePaymentGateway.ts
│   ├── services/
│   │   └── SendGridEmailService.ts
│   └── database/
│       └── prisma/
├── presentation/
│   ├── http/
│   │   ├── controllers/
│   │   │   └── OrderController.ts
│   │   ├── routes/
│   │   │   └── orderRoutes.ts
│   │   └── middleware/
│   │       └── errorHandler.ts
│   └── cli/
│       └── OrderCLI.ts
└── main.ts (composition root)
```

### Implementation

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    private _status: OrderStatus,
    private _createdAt: Date = new Date(),
  ) {}

  get status(): OrderStatus {
    return this._status;
  }

  get total(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0, "USD"),
    );
  }

  confirm(): void {
    if (this._status !== "pending") {
      throw new DomainError("Can only confirm pending orders");
    }
    if (this.items.length === 0) {
      throw new DomainError("Cannot confirm empty order");
    }
    this._status = "confirmed";
  }

  cancel(): void {
    if (this._status === "delivered") {
      throw new DomainError("Cannot cancel delivered orders");
    }
    this._status = "cancelled";
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (this.items.length === 0) {
      errors.push("Order must have at least one item");
    }

    if (this.total.amount < 0) {
      errors.push("Total cannot be negative");
    }

    return { valid: errors.length === 0, errors };
  }
}

// application/use-cases/PlaceOrder.ts
export class PlaceOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentGateway: IPaymentGateway,
    private emailService: IEmailService,
    private logger: ILogger,
  ) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order>> {
    this.logger.info("Placing order", { customerId: dto.customerId });

    // 1. Create domain entities
    const items = dto.items.map(
      (i) => new OrderItem(i.productId, i.quantity, new Money(i.price, "USD")),
    );

    const order = new Order(generateId(), dto.customerId, items, "pending");

    // 2. Domain validation
    const validation = order.validate();
    if (!validation.valid) {
      this.logger.warn("Order validation failed", {
        errors: validation.errors,
      });
      return Result.fail(validation.errors.join(", "));
    }

    // 3. Process payment
    this.logger.info("Processing payment", {
      orderId: order.id,
      amount: order.total.amount,
    });

    const paymentResult = await this.paymentGateway.charge(
      order.total.amount,
      dto.paymentToken,
    );

    if (!paymentResult.success) {
      this.logger.error("Payment failed", { orderId: order.id });
      return Result.fail("Payment failed");
    }

    // 4. Confirm order
    order.confirm();

    // 5. Persist
    await this.orderRepo.save(order);
    this.logger.info("Order saved", { orderId: order.id });

    // 6. Send confirmation
    await this.emailService.sendOrderConfirmation(dto.customerId, order.id);

    this.logger.info("Order placed successfully", { orderId: order.id });

    return Result.ok(order);
  }
}

// infrastructure/repositories/PostgresOrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!row) return null;

    return this.toDomain(row);
  }

  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          customerId: order.customerId,
          status: order.status,
          total: order.total.amount,
          currency: order.total.currency,
          createdAt: new Date(),
        },
        update: {
          status: order.status,
          total: order.total.amount,
        },
      });

      // Upsert items
      await Promise.all(
        order.items.map((item) =>
          tx.orderItem.upsert({
            where: {
              orderId_productId: {
                orderId: order.id,
                productId: item.productId,
              },
            },
            create: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price.amount,
              currency: item.price.currency,
            },
            update: {
              quantity: item.quantity,
              price: item.price.amount,
            },
          }),
        ),
      );
    });
  }

  private toDomain(row: any): Order {
    const items = row.items.map(
      (i: any) =>
        new OrderItem(i.productId, i.quantity, new Money(i.price, i.currency)),
    );

    return new Order(row.id, row.customerId, items, row.status, row.createdAt);
  }
}

// presentation/http/controllers/OrderController.ts
export class OrderController {
  constructor(
    private placeOrder: PlaceOrderUseCase,
    private cancelOrder: CancelOrderUseCase,
    private getOrder: GetOrderUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: PlaceOrderDTO = {
        customerId: req.body.customerId,
        items: req.body.items,
        paymentToken: req.body.paymentToken,
      };

      const result = await this.placeOrder.execute(dto);

      if (result.isSuccess) {
        res.status(201).json({
          id: result.value.id,
          status: result.value.status,
          total: result.value.total.amount,
          currency: result.value.total.currency,
        });
      } else {
        res.status(400).json({
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.cancelOrder.execute(req.params.id);

      if (result.isSuccess) {
        res.status(204).send();
      } else {
        res.status(400).json({
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.getOrder.execute(req.params.id);

      if (result.isSuccess) {
        res.json({
          id: result.value.id,
          customerId: result.value.customerId,
          status: result.value.status,
          total: result.value.total.amount,
          items: result.value.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price.amount,
          })),
        });
      } else {
        res.status(404).json({
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

// main.ts (Composition root - Dependency Injection)
async function bootstrap() {
  // Infrastructure
  const prisma = new PrismaClient();
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const sendgrid = new SendGridClient(process.env.SENDGRID_KEY!);
  const logger = new WinstonLogger();

  // Adapters (Secondary)
  const orderRepo = new PostgresOrderRepository(prisma);
  const paymentGateway = new StripePaymentGateway(stripe);
  const emailService = new SendGridEmailService(sendgrid);

  // Use Cases (Application layer)
  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepo,
    paymentGateway,
    emailService,
    logger,
  );

  const cancelOrderUseCase = new CancelOrderUseCase(
    orderRepo,
    paymentGateway,
    logger,
  );

  const getOrderUseCase = new GetOrderUseCase(orderRepo, logger);

  // Controller (Primary adapter)
  const orderController = new OrderController(
    placeOrderUseCase,
    cancelOrderUseCase,
    getOrderUseCase,
  );

  // Express setup
  const app = express();
  app.use(express.json());

  // Routes
  app.post("/orders", (req, res, next) =>
    orderController.create(req, res, next),
  );
  app.delete("/orders/:id", (req, res, next) =>
    orderController.cancel(req, res, next),
  );
  app.get("/orders/:id", (req, res, next) =>
    orderController.getById(req, res, next),
  );

  // Error handling
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

bootstrap().catch(console.error);
```

---

## NestJS Implementation

NestJS provides built-in dependency injection and modules:

```typescript
// order.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [
    // Use cases
    PlaceOrderUseCase,
    CancelOrderUseCase,
    GetOrderUseCase,

    // Repositories (bind to interface)
    {
      provide: "IOrderRepository",
      useClass: PostgresOrderRepository,
    },

    // Gateways
    {
      provide: "IPaymentGateway",
      useClass: StripePaymentGateway,
    },

    // Services
    {
      provide: "IEmailService",
      useClass: SendGridEmailService,
    },
  ],
})
export class OrderModule {}

// order.controller.ts
@Controller("orders")
export class OrderController {
  constructor(
    private placeOrder: PlaceOrderUseCase,
    private cancelOrder: CancelOrderUseCase,
    private getOrder: GetOrderUseCase,
  ) {}

  @Post()
  async create(@Body() dto: PlaceOrderDTO): Promise<OrderResponseDTO> {
    const result = await this.placeOrder.execute(dto);

    if (!result.isSuccess) {
      throw new BadRequestException(result.error);
    }

    return {
      id: result.value.id,
      status: result.value.status,
      total: result.value.total.amount,
    };
  }

  @Delete(":id")
  @HttpCode(204)
  async cancel(@Param("id") id: string): Promise<void> {
    const result = await this.cancelOrder.execute(id);

    if (!result.isSuccess) {
      throw new BadRequestException(result.error);
    }
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<OrderResponseDTO> {
    const result = await this.getOrder.execute(id);

    if (!result.isSuccess) {
      throw new NotFoundException(result.error);
    }

    return {
      id: result.value.id,
      status: result.value.status,
      total: result.value.total.amount,
    };
  }
}

// place-order.use-case.ts
@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject("IOrderRepository") private orderRepo: IOrderRepository,
    @Inject("IPaymentGateway") private paymentGateway: IPaymentGateway,
    @Inject("IEmailService") private emailService: IEmailService,
    private logger: Logger,
  ) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order>> {
    // Same implementation as before
  }
}
```

---

## Testing Backend

### Unit Tests (Use Cases)

```typescript
// __tests__/unit/PlaceOrder.test.ts
describe("PlaceOrderUseCase", () => {
  let useCase: PlaceOrderUseCase;
  let mockRepo: jest.Mocked<IOrderRepository>;
  let mockPayment: jest.Mocked<IPaymentGateway>;
  let mockEmail: jest.Mocked<IEmailService>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockPayment = {
      charge: jest
        .fn()
        .mockResolvedValue({ success: true, transactionId: "tx-1" }),
    };

    mockEmail = {
      sendOrderConfirmation: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    useCase = new PlaceOrderUseCase(
      mockRepo,
      mockPayment,
      mockEmail,
      mockLogger,
    );
  });

  it("should place order successfully", async () => {
    const dto: PlaceOrderDTO = {
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2, price: 50 }],
      paymentToken: "tok_123",
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeInstanceOf(Order);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Order));
    expect(mockPayment.charge).toHaveBeenCalledWith(100, "tok_123");
    expect(mockEmail.sendOrderConfirmation).toHaveBeenCalled();
  });

  it("should fail if payment fails", async () => {
    mockPayment.charge.mockResolvedValue({ success: false });

    const dto: PlaceOrderDTO = {
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2, price: 50 }],
      paymentToken: "tok_123",
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe("Payment failed");
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/order.test.ts
describe("Order API (Integration)", () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: "postgresql://test" } },
    });
    app = createApp(prisma); // Factory function
  });

  afterEach(async () => {
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create order via HTTP", async () => {
    const response = await request(app)
      .post("/orders")
      .send({
        customerId: "customer-1",
        items: [{ productId: "product-1", quantity: 2, price: 50 }],
        paymentToken: "tok_test",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.status).toBe("confirmed");
    expect(response.body.total).toBe(100);

    // Verify in database
    const order = await prisma.order.findUnique({
      where: { id: response.body.id },
    });

    expect(order).toBeTruthy();
    expect(order?.status).toBe("confirmed");
  });
});
```

---

## Environment-Based Adapter Selection

```typescript
// main.ts
function createEmailService(): IEmailService {
  if (process.env.NODE_ENV === "production") {
    return new SendGridEmailService(sendgrid);
  } else if (process.env.NODE_ENV === "development") {
    return new ConsoleEmailService(); // Logs to console
  } else {
    return new MockEmailService(); // No-op for tests
  }
}

function createPaymentGateway(): IPaymentGateway {
  if (process.env.NODE_ENV === "production") {
    return new StripePaymentGateway(stripe);
  } else {
    return new FakePaymentGateway(); // Always succeeds
  }
}

// Use factories
const emailService = createEmailService();
const paymentGateway = createPaymentGateway();
```

---

## Migration Strategy

### Incremental Adoption

```
1. Start with new features
   └── Apply Clean Architecture to new endpoints

2. Extract use cases from existing controllers
   ├── Move business logic to use cases
   └── Keep controllers thin

3. Define ports for dependencies
   ├── Create IRepository interfaces
   └── Implement adapters

4. Refactor hot spots first
   └── Areas with most bugs/changes
```

### Anti-Corruption Layer for Legacy

```typescript
// For integrating with legacy code
export class LegacyOrderAdapter implements IOrderRepository {
  constructor(private legacyDb: LegacyDatabase) {}

  async findById(id: string): Promise<Order | null> {
    // Translate legacy format to domain model
    const legacyOrder = await this.legacyDb.getOrder(id);
    if (!legacyOrder) return null;

    return this.toDomain(legacyOrder);
  }

  async save(order: Order): Promise<void> {
    // Translate domain model to legacy format
    const legacyFormat = this.toLegacy(order);
    await this.legacyDb.saveOrder(legacyFormat);
  }

  private toDomain(legacy: any): Order {
    // Complex mapping logic
  }

  private toLegacy(order: Order): any {
    // Complex mapping logic
  }
}
```

---

## Summary

**Key takeaways**:

1. Express requires manual DI setup; NestJS provides it
2. Use composition root (main.ts) for wiring
3. Test use cases with mocks (unit tests)
4. Test controllers with real DB (integration tests)
5. Swap adapters by environment
6. Migrate incrementally, not big-bang

---

## References

- [Main SKILL](../SKILL.md)
- [Clean Architecture](clean-architecture.md)
- [Hexagonal Architecture](hexagonal-architecture.md)
- [SOLID Principles](solid-principles.md)
- [Frontend Integration](frontend-integration.md)

**External**:

- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture in Node](https://dev.to/remojansen/implementing-the-clean-architecture-in-nodejs-2k2p)
