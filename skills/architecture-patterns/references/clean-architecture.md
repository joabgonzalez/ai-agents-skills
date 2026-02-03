# Clean Architecture

> Layer-based architecture with strict dependency rules: outer layers depend on inner layers, never the reverse.

## Overview

Clean Architecture organizes code into concentric circles (layers) where dependencies point inward. Inner layers contain business logic and are independent of frameworks, UI, databases, or external services.

**Core principle**: Dependencies flow inward. Outer circles can depend on inner circles, but inner circles cannot depend on outer circles.

**Layers** (from inside out):

1. **Domain** (Entities) - Core business objects and rules
2. **Application** (Use Cases) - Application-specific business rules
3. **Infrastructure** (Adapters) - External interfaces (DB, API, UI)
4. **Presentation** (Controllers/UI) - User interface

---

## The Dependency Rule

```
┌─────────────────────────────────────────────┐
│  Presentation (UI, Controllers)             │ ← Frameworks, HTTP
│  ┌───────────────────────────────────────┐  │
│  │  Infrastructure (Adapters)            │  │ ← DB, External APIs
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Application (Use Cases)        │  │  │ ← Business workflows
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │  Domain (Entities)        │  │  │  │ ← Core business rules
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

Dependencies: → → → (always point inward)
```

**Rule**: Source code dependencies must point inward only. Nothing in an inner circle can know about anything in an outer circle.

---

## Layer 1: Domain (Entities)

**Contains**: Core business objects, business rules, domain logic.

**Characteristics**:

- No dependencies on other layers
- No framework dependencies
- Pure business logic
- Can be reused across applications

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    private _status: OrderStatus,
  ) {}

  get total(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  get status(): OrderStatus {
    return this._status;
  }

  // Business rule: Only pending orders can be confirmed
  confirm(): void {
    if (this._status !== "pending") {
      throw new DomainError("Can only confirm pending orders");
    }
    this._status = "confirmed";
  }

  // Business rule: Confirmed orders can be cancelled within 24h
  cancel(): void {
    if (this._status === "delivered") {
      throw new DomainError("Cannot cancel delivered orders");
    }
    this._status = "cancelled";
  }

  // Domain validation
  validate(): ValidationResult {
    const errors: string[] = [];

    if (this.items.length === 0) {
      errors.push("Order must have at least one item");
    }

    if (this.total < 0) {
      errors.push("Total cannot be negative");
    }

    return { valid: errors.length === 0, errors };
  }
}

// domain/entities/OrderItem.ts
export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number,
  ) {
    if (quantity <= 0) {
      throw new DomainError("Quantity must be positive");
    }
    if (price < 0) {
      throw new DomainError("Price cannot be negative");
    }
  }
}
```

---

## Layer 2: Application (Use Cases)

**Contains**: Application-specific business rules, orchestration, use cases.

**Characteristics**:

- Orchestrates domain entities
- Defines interfaces (ports) for infrastructure
- No knowledge of UI or database specifics
- Depends only on Domain layer

```typescript
// application/ports/IOrderRepository.ts (Interface/Port)
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}

// application/ports/IPaymentGateway.ts (Interface/Port)
export interface IPaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<void>;
}

// application/use-cases/PlaceOrder.ts
export class PlaceOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentGateway: IPaymentGateway,
    private emailService: IEmailService,
  ) {}

  async execute(
    customerId: string,
    items: OrderItemDTO[],
    paymentToken: string,
  ): Promise<Result<Order>> {
    // 1. Create domain entity
    const orderItems = items.map(
      (i) => new OrderItem(i.productId, i.quantity, i.price),
    );
    const order = new Order(generateId(), customerId, orderItems, "pending");

    // 2. Domain validation
    const validation = order.validate();
    if (!validation.valid) {
      return Result.fail(validation.errors.join(", "));
    }

    // 3. Process payment (infrastructure dependency via port)
    const paymentResult = await this.paymentGateway.charge(
      order.total,
      paymentToken,
    );
    if (!paymentResult.success) {
      return Result.fail("Payment failed");
    }

    // 4. Confirm order
    order.confirm();

    // 5. Persist (infrastructure dependency via port)
    await this.orderRepository.save(order);

    // 6. Send notification (side effect)
    await this.emailService.sendOrderConfirmation(customerId, order);

    return Result.ok(order);
  }
}

// application/use-cases/CancelOrder.ts
export class CancelOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentGateway: IPaymentGateway,
  ) {}

  async execute(orderId: string): Promise<Result<void>> {
    // 1. Retrieve order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return Result.fail("Order not found");
    }

    // 2. Business rule (in domain entity)
    try {
      order.cancel();
    } catch (error) {
      return Result.fail(error.message);
    }

    // 3. Refund payment
    await this.paymentGateway.refund(orderId);

    // 4. Update order
    await this.orderRepository.save(order);

    return Result.ok(undefined);
  }
}
```

---

## Layer 3: Infrastructure (Adapters)

**Contains**: Implementations of ports, database access, external services, frameworks.

**Characteristics**:

- Implements interfaces defined in Application layer
- Handles framework-specific code
- Depends on Application and Domain layers

```typescript
// infrastructure/repositories/PostgresOrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!row) return null;

    // Map database row to domain entity
    return this.toDomain(row);
  }

  async save(order: Order): Promise<void> {
    // Map domain entity to database model
    await this.db.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      update: {
        status: order.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.order.delete({ where: { id } });
  }

  private toDomain(row: any): Order {
    const items = row.items.map(
      (i: any) => new OrderItem(i.productId, i.quantity, i.price),
    );
    return new Order(row.id, row.customerId, items, row.status);
  }
}

// infrastructure/gateways/StripePaymentGateway.ts
export class StripePaymentGateway implements IPaymentGateway {
  constructor(private stripeClient: Stripe) {}

  async charge(amount: number, token: string): Promise<PaymentResult> {
    try {
      const result = await this.stripeClient.charges.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        source: token,
      });

      return {
        success: result.status === "succeeded",
        transactionId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refund(transactionId: string): Promise<void> {
    await this.stripeClient.refunds.create({
      charge: transactionId,
    });
  }
}
```

---

## Layer 4: Presentation (UI/Controllers)

**Contains**: User interface, HTTP controllers, CLI, GraphQL resolvers.

**Characteristics**:

- Depends on all inner layers
- Converts external requests to use case calls
- Formats use case responses for external consumption

```typescript
// presentation/controllers/OrderController.ts (Express)
export class OrderController {
  constructor(
    private placeOrder: PlaceOrderUseCase,
    private cancelOrder: CancelOrderUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { customerId, items, paymentToken } = req.body;

    // Call use case
    const result = await this.placeOrder.execute(
      customerId,
      items,
      paymentToken,
    );

    // Format response
    if (result.isSuccess) {
      res.status(201).json({
        id: result.value.id,
        status: result.value.status,
        total: result.value.total,
      });
    } else {
      res.status(400).json({
        error: result.error,
      });
    }
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const result = await this.cancelOrder.execute(req.params.id);

    if (result.isSuccess) {
      res.status(204).send();
    } else {
      res.status(400).json({
        error: result.error,
      });
    }
  }
}

// presentation/routes.ts
const orderRepo = new PostgresOrderRepository(prisma);
const paymentGateway = new StripePaymentGateway(stripe);
const emailService = new SendGridEmailService(sendgrid);

const placeOrderUseCase = new PlaceOrderUseCase(
  orderRepo,
  paymentGateway,
  emailService,
);

const cancelOrderUseCase = new CancelOrderUseCase(orderRepo, paymentGateway);

const orderController = new OrderController(
  placeOrderUseCase,
  cancelOrderUseCase,
);

app.post("/orders", (req, res) => orderController.create(req, res));
app.delete("/orders/:id", (req, res) => orderController.cancel(req, res));
```

---

## Frontend Example (React + Redux)

```
src/
├── domain/
│   └── entities/
│       └── User.ts
├── application/
│   ├── use-cases/
│   │   └── UpdateProfile.ts
│   └── ports/
│       └── IUserRepository.ts
├── infrastructure/
│   └── api/
│       └── userApi.ts (RTK Query)
└── presentation/
    └── components/
        └── UserProfile.tsx
```

```typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}

  updateProfile(name: string, email: string): void {
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
    this.name = name;
    this.email = email;
  }
}

// application/use-cases/UpdateProfile.ts
export class UpdateProfileUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string, name: string, email: string): Promise<Result<User>> {
    const user = await this.userRepo.findById(userId);
    if (!user) return Result.fail('User not found');

    try {
      user.updateProfile(name, email);
    } catch (error) {
      return Result.fail(error.message);
    }

    await this.userRepo.save(user);
    return Result.ok(user);
  }
}

// infrastructure/api/userApi.ts (RTK Query)
export const userApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: `users/${data.userId}`,
        method: 'PUT',
        body: data
      })
    })
  })
});

// presentation/components/UserProfile.tsx
export const UserProfile = ({ userId }: Props) => {
  const [updateProfile] = userApi.useUpdateProfileMutation();

  const handleSubmit = async (data: FormData) => {
    await updateProfile({
      userId,
      name: data.name,
      email: data.email
    });
  };

  return <ProfileForm onSubmit={handleSubmit} />;
};
```

---

## Folder Structure Examples

### Backend (Node.js)

```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── errors/
├── application/
│   ├── use-cases/
│   ├── ports/
│   └── dto/
├── infrastructure/
│   ├── repositories/
│   ├── gateways/
│   ├── database/
│   └── config/
└── presentation/
    ├── controllers/
    ├── routes/
    └── middleware/
```

### Frontend (React)

```
src/
├── domain/
│   └── entities/
├── application/
│   ├── use-cases/
│   └── ports/
├── infrastructure/
│   ├── api/
│   └── storage/
└── presentation/
    ├── components/
    ├── pages/
    └── hooks/
```

---

## Benefits

1. **Independence**: Business logic doesn't depend on frameworks
2. **Testability**: Test business rules without UI/DB
3. **Flexibility**: Swap UI, database, or framework easily
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Add features without touching core

---

## Common Mistakes

### ❌ Domain Depends on Infrastructure

```typescript
// WRONG: Domain knows about database
class User {
  async save() {
    await prisma.user.update({ where: { id: this.id }, data: this });
  }
}
```

### ❌ Use Case Knows About HTTP

```typescript
// WRONG: Use case depends on Express Request
class RegisterUserUseCase {
  async execute(req: Request): Promise<Response> {
    const user = await this.repo.create(req.body);
    return res.json(user); // Coupled to Express
  }
}
```

### ❌ Controller Has Business Logic

```typescript
// WRONG: Business logic in controller
app.post("/orders", async (req, res) => {
  if (req.body.items.length === 0) {
    // Business rule in controller
    return res.status(400).json({ error: "No items" });
  }
  // ...
});
```

---

## Integration with Other Patterns

- **SOLID**: Apply within each layer
- **Hexagonal**: Infrastructure layer uses ports/adapters
- **DDD**: Domain layer contains DDD patterns
- **Result Pattern**: Use cases return Result<T>

---

## References

- [Main SKILL](../SKILL.md)
- [SOLID Principles](solid-principles.md)
- [Hexagonal Architecture](hexagonal-architecture.md)
- [Domain-Driven Design](domain-driven-design.md)
- [Backend Integration](backend-integration.md)
- [Frontend Integration](frontend-integration.md)

**External**:

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
