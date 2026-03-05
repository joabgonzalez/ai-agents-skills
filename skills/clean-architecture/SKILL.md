---
name: clean-architecture
description: "Layer-based architecture with inward dependency rule. Trigger: When separating business logic from frameworks, databases, and external services."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Clean Architecture

Organizes code into concentric layers where dependencies point inward. Business rules stay independent of frameworks, databases, and external systems.

## When to Use

- Backend projects >500 LOC with business logic
- Need to swap databases, frameworks, or external services
- Want business logic testable without spinning up infrastructure
- Building multi-layered services

Don't use for:

- Simple CRUD APIs without real business rules
- Scripts and utilities
- Prototypes

---

## Critical Patterns

### ✅ REQUIRED: The Dependency Rule

Dependencies must point inward only. Inner layers know nothing about outer layers.

```
Presentation (HTTP, CLI, GraphQL)
  Infrastructure (DB, APIs, Email) → implements Domain ports
    Application (Use Cases)        → orchestrates Domain, defines ports
      Domain (Entities)            ← NO external dependencies
```

### ✅ REQUIRED: Domain Layer — Pure Business Rules

Entities contain business rules. Zero framework or DB dependencies.

```typescript
class Order {
  confirm(): void {
    if (this._status !== "pending") throw new DomainError("Can only confirm pending orders");
    this._status = "confirmed";
  }
  // No prisma, no express, no external imports
}
```

### ✅ REQUIRED: Application Layer — Ports + Use Cases

Defines interfaces (ports) for what it needs. Orchestrates domain entities.

```typescript
interface IOrderRepository { save(order: Order): Promise<void>; }
interface IPaymentGateway  { charge(amount: number, token: string): Promise<PaymentResult>; }

class PlaceOrderUseCase {
  constructor(private repo: IOrderRepository, private payment: IPaymentGateway) {}
  async execute(items: OrderItemDTO[], token: string): Promise<Result<Order>> { ... }
}
```

### ✅ REQUIRED: Infrastructure Layer — Port Implementations

Implements ports with concrete tech. Only layer that knows about Prisma, Stripe, etc.

```typescript
class PostgresOrderRepository implements IOrderRepository { ... }
class StripePaymentGateway     implements IPaymentGateway  { ... }
```

### ❌ NEVER: Mix Layers

```
❌ Domain entity calls DB:       class User { async save() { await prisma.user.update(...) } }
❌ Use case knows HTTP:          async execute(req: Request): Response { ... }
❌ Controller has business logic: app.post('/orders', (req, res) => { if (items.length === 0)... })
```

### ✅ REQUIRED: Standard Folder Structure

```
src/
├── domain/         → entities/, value-objects/, errors/
├── application/    → use-cases/, ports/, dto/
├── infrastructure/ → repositories/, gateways/, database/
└── presentation/   → controllers/, routes/, middleware/
```

---

## Decision Tree

```
Has real business rules (not just CRUD)?
  → YES: Apply domain entities with business methods
  → NO: Simple folder structure is enough

Need to test business logic without DB/email/HTTP?
  → Define ports (interfaces) in application layer
  → Implement in infrastructure, inject in tests

Entity importing Prisma/Express/Stripe?
  → Move to infrastructure adapter implementing a port

Use case receiving Express Request or returning Response?
  → Move HTTP concerns to presentation layer

Frontend or backend?
  → Backend with complex logic → Clean Architecture fits well
  → Frontend SPA → Usually overkill; use state management + composition
```

---

## Example

`UserRegistration` use case passing through all four clean architecture layers.

```typescript
// Domain layer — pure business rule, no imports from outer layers
class User {
  static create(email: string, passwordHash: string): User {
    if (!email.includes("@")) throw new DomainError("Invalid email");
    return new User(crypto.randomUUID(), email, passwordHash);
  }
}

// Application layer — defines ports, orchestrates domain
interface IUserRepository { save(user: User): Promise<void>; findByEmail(email: string): Promise<User | null>; }
interface IHashService    { hash(plain: string): Promise<string>; }

class RegisterUserUseCase {
  constructor(private repo: IUserRepository, private hash: IHashService) {}
  async execute(email: string, password: string): Promise<Result<User>> {
    if (await this.repo.findByEmail(email)) return Result.fail("Email already registered");
    const hashed = await this.hash.hash(password);
    const user = User.create(email, hashed);
    await this.repo.save(user);
    return Result.ok(user);
  }
}

// Infrastructure layer — implements ports with real tech
class PostgresUserRepository implements IUserRepository { /* prisma calls */ }
class BcryptHashService    implements IHashService    { /* bcrypt calls */ }

// Presentation layer — HTTP concern only
app.post("/api/v1/users", async (req, res) => {
  const result = await registerUser.execute(req.body.email, req.body.password);
  result.isSuccess ? res.status(201).json(result.value) : res.status(400).json({ error: result.error });
});
```

Dependency rule satisfied: Domain ← Application ← Infrastructure / Presentation. Domain has zero external imports.

---

## Edge Cases

**Frontend Clean Architecture:** Usually overkill for React/Vue apps. State management + component composition covers most needs. Apply only if the frontend has substantial business logic.

**Partial adoption:** Can apply just the domain + ports/adapters without full layer separation. Start with isolating external dependencies via interfaces.

**Shared domain types:** DTOs and value objects can cross layer boundaries, but only flowing inward. Infrastructure maps external data to domain types.

**Anemic domain models:** Entities with only getters/setters and all logic in services is an anti-pattern. Business rules belong in domain entities.

---

## Resources

- [layer-examples.md](references/layer-examples.md) — Full layer examples, folder structure, React + Node.js
