---
name: architecture-patterns
description: "SOLID, DDD, and Clean Architecture patterns. Trigger: When designing maintainable systems, complex state management, or project specifies architectural requirements."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
  dependencies:
    typescript: ">=4.5.0"
  allowed-tools:
    - read-file
---

# Architecture Patterns

SOLID, DDD, Clean/Hexagonal Architecture, and behavioral patterns (Mediator, Result) for maintainable, testable backend services. Apply to frontend only when AGENTS.md or codebase structure requires it.

## When to Use

- Codebase already has `domain/`, `application/`, `infrastructure/` folders
- AGENTS.md specifies architecture patterns
- Backend project >500 LOC with business logic
- Microservices or multi-layered services

Don't use for:
- Scripts/utilities (<200 LOC), prototypes, basic CRUD without business logic
- Frontend projects unless AGENTS.md or codebase demands it

---

## Critical Patterns

### ✅ REQUIRED: Single Responsibility Principle (SRP)

Each class/module has ONE reason to change. Separate data access, validation, and orchestration.

```typescript
// ✅ Repo for data, validator for rules, service for orchestration
export class UserRepository {
  async findById(id: string): Promise<User | null> { return await db.users.findUnique({ where: { id } }); }
  async save(user: User): Promise<void> { await db.users.create({ data: user }); }
}
export class UserValidator {
  validate(user: User): ValidationResult {
    if (!user.email.includes("@")) return { valid: false, errors: ["Invalid email"] };
    return { valid: true, errors: [] };
  }
}
export class UserService {
  constructor(private repo: UserRepository, private validator: UserValidator) {}
  async createUser(user: User): Promise<Result<User>> {
    const validation = this.validator.validate(user);
    if (!validation.valid) return Result.fail(validation.errors);
    await this.repo.save(user);
    return Result.ok(user);
  }
}
// ❌ Validation + DB + email all in one class — violates SRP
```

See [solid-principles.md](references/solid-principles.md) for all 5 SOLID principles.

### ✅ REQUIRED: Dependency Inversion (DIP)

Depend on abstractions. Enables swapping implementations and mocking in tests.

```typescript
export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}
export class UserService {
  constructor(private emailService: IEmailService) {} // ← interface, not concrete class
  async registerUser(user: User) { await this.emailService.send(user.email, "Welcome", "..."); }
}
export class SendGridEmailService implements IEmailService { /* adapter */ }
// ❌ private emailService = new SendGridEmailService() — tightly coupled
```

### ✅ REQUIRED: Layer Separation (Clean Architecture)

Dependency direction: outer to inner. Domain has zero external dependencies.

```
Infrastructure (Adapters) ← Frameworks, DB, HTTP
  Application (Use Cases) ← Business workflows
    Domain (Entities)     ← Business rules
```

```typescript
// Domain — pure business rules
export class User {
  constructor(public readonly id: string, private status: UserStatus) {}
  activate(): void {
    if (this.status === "banned") throw new Error("Cannot activate banned user");
    this.status = "active";
  }
}
// Application — orchestrates domain via ports
export class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository) {}
  async execute(email: string): Promise<Result<User>> {
    const user = new User(generateId(), "pending");
    await this.userRepo.save(user);
    return Result.ok(user);
  }
}
// Infrastructure — implements ports
export class PostgresUserRepository implements IUserRepository {
  async save(user: User): Promise<void> { await this.db.query("INSERT INTO users..."); }
}
```

See [clean-architecture.md](references/clean-architecture.md) and [hexagonal-architecture.md](references/hexagonal-architecture.md).

### ✅ REQUIRED: Port/Adapter Pattern (Hexagonal)

Define ports (interfaces) for external dependencies; swap adapters freely.

```typescript
export interface IPaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
}
export class OrderService {
  constructor(private payment: IPaymentGateway) {}
  async placeOrder(order: Order): Promise<Result<Order>> {
    const result = await this.payment.charge(order.total, order.token);
    if (!result.success) return Result.fail("Payment failed");
    return Result.ok(order);
  }
}
export class StripeAdapter implements IPaymentGateway { /* ... */ }
export class PayPalAdapter implements IPaymentGateway { /* ... */ }
// ❌ Calling stripe.charges.create() directly in service — coupled to vendor
```

### ✅ REQUIRED: Result Pattern

Return `Result<T>` instead of throwing for expected errors.

```typescript
export class Result<T> {
  private constructor(public readonly isSuccess: boolean, public readonly value?: T, public readonly error?: string) {}
  static ok<T>(value: T): Result<T> { return new Result(true, value); }
  static fail<T>(error: string): Result<T> { return new Result(false, undefined, error); }
}
const result = await userService.getUser("123");
if (result.isSuccess) console.log(result.value);
else console.error(result.error);
```

See [result-pattern.md](references/result-pattern.md) for Either/Option patterns.

### ❌ NEVER: Mix Domain with Infrastructure

```typescript
// ❌ Entity calls DB
export class User { async save() { await db.users.update({ where: { id: this.id }, data: this }); } }
// ✅ Entity stays pure; repository handles persistence
export class User { promote(): void { this.role = "admin"; } }
export class UserRepository { async save(u: User) { await db.users.update({ where: { id: u.id }, data: u }); } }
```

---

## Decision Tree

```
Backend project? → Apply SOLID + Clean/Hexagonal by default
Frontend project? → Check AGENTS.md:
  Mentions architecture/SOLID/DDD? → Apply
  >50 components + heavy logic?    → Consider
  Otherwise                        → Technology-specific patterns only

Which pattern?
  Class/component design  → solid-principles.md
  Layer organization      → clean-architecture.md
  Port/adapter testing    → hexagonal-architecture.md
  Domain modeling         → domain-driven-design.md
  Decoupled communication → mediator-pattern.md
  Error handling          → result-pattern.md
```

---

## Conventions

Follow [conventions](../conventions/SKILL.md) for naming/file org/imports and [typescript](../typescript/SKILL.md) for interfaces/type safety.

Skill-specific: `I` prefix for port interfaces, one class per file, organize by layer (`domain/`, `application/`, `infrastructure/`), constructor injection, ports in domain/application, adapters in infrastructure.

---

## Example

- **Backend**: [backend-integration.md](references/backend-integration.md) -- Order Service with NestJS/Express/Fastify, DI, testing
- **Frontend**: [frontend-integration.md](references/frontend-integration.md) -- React components with architecture patterns

---

## Edge Cases

**Frontend resistance:** Start with Result pattern (low friction), demonstrate testability, add layers gradually.

**Mixing styles:** Pick one primary pattern (usually Clean Architecture), use others as complements.

**Legacy migration:** Apply patterns to new features only, anti-corruption layer for legacy, refactor one module at a time.

**Over-abstraction:** Skip architecture for simple CRUD. Ask: "Is this abstraction paying for itself?"

---

## Checklist

- [ ] Verified codebase/AGENTS.md signals before applying patterns
- [ ] Each class/module has a single responsibility
- [ ] High-level modules depend on abstractions, not concretions
- [ ] Code organized by layer with correct dependency direction
- [ ] External dependencies accessed through ports/adapters
- [ ] Expected errors use Result pattern, not thrown exceptions
- [ ] Domain entities contain zero infrastructure concerns

---

## Resources

- [solid-principles.md](references/solid-principles.md), [clean-architecture.md](references/clean-architecture.md), [hexagonal-architecture.md](references/hexagonal-architecture.md), [domain-driven-design.md](references/domain-driven-design.md)
- [mediator-pattern.md](references/mediator-pattern.md), [result-pattern.md](references/result-pattern.md)
- [backend-integration.md](references/backend-integration.md), [frontend-integration.md](references/frontend-integration.md)
- Related: [conventions](../conventions/SKILL.md), [typescript](../typescript/SKILL.md), [react](../react/SKILL.md), [redux-toolkit](../redux-toolkit/SKILL.md)
