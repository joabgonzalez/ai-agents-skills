---
name: hexagonal-architecture
description: "Ports and Adapters isolating application core from external concerns. Trigger: When building testable services with swappable infrastructure."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Hexagonal Architecture (Ports and Adapters)

Isolates application core from external systems. Core defines interfaces (ports), external systems provide implementations (adapters). Enables easy swapping of implementations and testing via mocks.

## When to Use

- Application needs to be testable without real DB/email/external APIs
- Need to swap infrastructure (Postgres → MySQL, SendGrid → AWS SES)
- Multiple adapters for same port (REST + CLI + GraphQL)
- Business logic must be isolated from framework details

Don't use for:

- Simple CRUD with no testability requirements
- Scripts with single external dependency
- Prototypes

---

## Critical Patterns

### ✅ REQUIRED: Define Ports in Application Core

Ports are interfaces owned by the application, not by infrastructure.

```typescript
// application/ports/IUserRepository.ts (PRIMARY — driven port)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// application/ports/IEmailService.ts (SECONDARY — driven port)
export interface IEmailService {
  sendWelcome(email: string): Promise<void>;
}
```

### ✅ REQUIRED: Adapters Implement Ports

Infrastructure adapters implement interfaces defined by the core.

```typescript
// infrastructure/PostgresUserRepository.ts
export class PostgresUserRepository implements IUserRepository {
  constructor(private db: PrismaClient) {}
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }
  async save(user: User): Promise<void> {
    await this.db.user.upsert({ where: { id: user.id }, create: user, update: user });
  }
}

// infrastructure/SendGridEmailService.ts
export class SendGridEmailService implements IEmailService {
  async sendWelcome(email: string): Promise<void> {
    await sendgrid.send({ to: email, subject: 'Welcome', text: '...' });
  }
}
```

### ✅ REQUIRED: Inject via Constructor (Composition Root)

Wire adapters to ports at the application entry point.

```typescript
// Composition root (e.g., main.ts or DI container)
const userRepo   = new PostgresUserRepository(prisma);
const emailSvc   = new SendGridEmailService();
const useCase    = new RegisterUserUseCase(userRepo, emailSvc);
const controller = new UserController(useCase);

// Testing — swap with mocks
const mockRepo  = { findById: jest.fn(), save: jest.fn() };
const mockEmail = { sendWelcome: jest.fn() };
const testCase  = new RegisterUserUseCase(mockRepo, mockEmail);
```

### ❌ NEVER: Import Infrastructure from Core

```typescript
// ❌ WRONG: Application use case imports concrete implementation
import { PrismaClient } from '@prisma/client';  // Infrastructure in application!

class RegisterUserUseCase {
  private db = new PrismaClient();  // Tightly coupled
}

// ✅ CORRECT: Depend on interface
class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository) {}  // Inject via port
}
```

### ✅ REQUIRED: Know Primary vs Secondary Ports

```
Primary (Driving) Ports:  Exposed by core, called by adapters
  → HTTP Controller calls use case (driving adapter)
  → CLI calls use case (another driving adapter)

Secondary (Driven) Ports: Defined by core, implemented by infrastructure
  → IUserRepository ← PostgresRepository
  → IEmailService   ← SendGridEmailService
```

### ✅ REQUIRED: Frontend Adapter Pattern (React)

Same principle in the browser: define the port in the feature, implement with fetch/axios, swap with mock in tests.

```typescript
// Port — owned by the feature, not by the API layer
interface IUserApi {
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
}

// Secondary adapter — implements the port with real network calls
class RestUserApi implements IUserApi {
  async getUser(id: string)                         { return fetch(`/api/users/${id}`).then(r => r.json()); }
  async updateUser(id: string, data: Partial<User>) { return fetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()); }
}

// Mock adapter — same port, no network (for tests and Storybook)
class MockUserApi implements IUserApi {
  async getUser(id: string)                         { return { id, name: 'Test User', email: 'test@example.com' }; }
  async updateUser(id: string, data: Partial<User>) { return { id, ...data } as User; }
}

// Driving adapter — hook consumes the port; concrete impl injected at composition root
function useUser(id: string, api: IUserApi = new RestUserApi()) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { api.getUser(id).then(setUser); }, [id]);
  return user;
}

// Tests: inject MockUserApi — no HTTP calls, no server needed
```

---

## Decision Tree

```
Need to test without real infrastructure?
  → Define port (interface) in application layer
  → Inject mock in tests

Need to swap DB/email/API without changing business logic?
  → Implement new adapter for existing port

Core importing concrete infra class?
  → Extract interface, move concrete to infrastructure/

Multiple ways to trigger same use case (HTTP + CLI)?
  → Create separate driving adapters, both call same use case
```

---

## Example

```typescript
// Port
interface IPaymentGateway { charge(amount: number, token: string): Promise<PaymentResult>; }

// Use Case (core — no infra imports)
// Result<T>: typed wrapper for success/failure — Result.ok(value) | Result.fail("error")
class PlaceOrderUseCase {
  constructor(private payment: IPaymentGateway) {}
  async execute(order: Order, token: string): Promise<Result<Order>> {
    const result = await this.payment.charge(order.total, token);
    if (!result.success) return Result.fail('Payment failed');
    return Result.ok(order);
  }
}

// Adapters (infrastructure)
class StripeAdapter implements IPaymentGateway { ... }
class PayPalAdapter  implements IPaymentGateway { ... }
class MockAdapter    implements IPaymentGateway { charge: jest.fn().mockResolvedValue({ success: true }) }
```

---

## Edge Cases

**Port granularity:** Too many small ports = port explosion. Group related operations (IUserRepository with findById + save + delete, not separate interfaces).

**Shared domain types:** DTOs and domain entities cross layers but only move inward. Infrastructure adapters map to/from domain types.

**Partial adoption:** Can apply hexagonal to specific layers without full Clean Architecture. Most common: isolate DB + external APIs via ports.

---

## Resources

- [port-adapter-examples.md](references/port-adapter-examples.md) — Full patterns, multi-adapter examples, testing strategies
