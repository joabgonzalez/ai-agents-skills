---
name: domain-driven-design
description: "Domain-Driven Design for complex business domains. Trigger: When modeling business rules, defining bounded contexts, or building ubiquitous language."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Domain-Driven Design (DDD)

Builds software that closely models complex business domains through shared language between developers and domain experts. Apply to complex business logic; overkill for simple CRUD.

## When to Use

- Complex business rules with many domain interactions
- Multiple teams working on different business areas
- Codebase has concepts that mean different things in different contexts
- Long-lived projects where domain knowledge is central

Don't use for:

- Simple CRUD without real business logic
- Small services (<200 LOC)
- Tight deadlines with no team DDD experience

---

## Critical Patterns

### ✅ REQUIRED: Ubiquitous Language

Use domain terms in code, docs, and conversations. Eliminate technical jargon from domain model.

```typescript
// ❌ WRONG: Technical terms
class Record { process() {} }

// ✅ CORRECT: Business terms
class Order { confirm() {} cancel() {} }  // "confirm" is what the business calls it
```

### ✅ REQUIRED: Bounded Context

Explicit boundary within which a model is valid. Same word can mean different things in different contexts.

```
Sales Context:    Product { name, price, description }
Inventory Context: Product { sku, quantity, location }
Shipping Context:  Package { trackingNumber, weight, dimensions }
```

Don't force a single `Product` model across all contexts. Each context has its own model.

### ✅ REQUIRED: Entity

Object with **identity** that persists over time. Two entities with the same attributes are NOT the same entity if their IDs differ.

- Has a unique, stable identity (never changes)
- Mutable — attributes can change across its lifecycle
- Equality is identity-based, not attribute-based

```typescript
class User {                           // Entity
  constructor(
    readonly id: UserId,               // identity — never changes
    private email: Email,              // state — can change
    private name: string,
  ) {}

  changeEmail(newEmail: Email): void { this.email = newEmail; }

  equals(other: User): boolean {
    return this.id.equals(other.id);   // same id = same user
  }
}

// Two users with same email but different id → NOT the same entity
// Two Money objects with same amount/currency → ARE equal (Value Object)
```

**Entity vs Value Object:** Entity = has lifecycle and identity (User, Order, Product). Value Object = defined entirely by its attributes (Money, Email, Address).

### ✅ REQUIRED: Aggregate + Aggregate Root

Cluster of objects treated as a unit. Only access internals through the Aggregate Root.

```typescript
class Order {  // Aggregate Root
  private items: OrderItem[];  // Only accessible via Order
  addItem(item: OrderItemDTO): void { this.items.push(new OrderItem(item)); }
  removeItem(itemId: string): void  { this.items = this.items.filter(i => i.id !== itemId); }
}
// ❌ Never: orderItem.save() — always go through Order
```

### ✅ REQUIRED: Value Objects

Objects defined entirely by their **attributes**. No identity, no mutable state. Two Value Objects with the same attributes are always equal and interchangeable.

Key characteristics: immutable (return new instance to "change"), self-validating (throw in constructor), side-effect-free operations, conceptual whole (Money = amount + currency, never just a number).

```typescript
class Money {
  constructor(readonly amount: number, readonly currency: string) {
    if (amount < 0) throw new Error("Amount cannot be negative");
  }
  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### ✅ REQUIRED: Domain Events

Capture significant domain occurrences. Decouple side effects from domain logic.

```typescript
class OrderConfirmedEvent {
  constructor(readonly orderId: string, readonly confirmedAt: Date) {}
}

class Order {
  confirm(): OrderConfirmedEvent {
    this._status = "confirmed";
    return new OrderConfirmedEvent(this.id, new Date());
  }
}
```

### ✅ REQUIRED: Repository — Abstract Persistence

Interface that hides database details from the domain. Domain only knows about the interface; infrastructure implements it.

```typescript
// Domain layer: interface only
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure layer: concrete implementation
class PostgresOrderRepository implements OrderRepository {
  async findById(id: string) { /* SQL query */ }
  async save(order: Order)   { /* SQL insert/update */ }
}
```

### ✅ REQUIRED: Domain Service — Cross-Aggregate Logic

Stateless service for business logic that doesn't naturally belong to a single entity or value object.

```typescript
// ✅ CORRECT: logic spans multiple aggregates → Domain Service
class PricingService {
  calculate(order: Order, customer: Customer): Money {
    const base = order.totalPrice();
    const discount = customer.loyaltyDiscount();
    return base.subtract(discount);
  }
}

// ❌ WRONG: putting cross-aggregate logic inside an aggregate
class Order {
  calculateWithCustomer(customer: Customer) { /* Order shouldn't know Customer */ }
}
```

### ❌ NEVER: Anemic Domain Model

Objects that are only data containers with no behavior. Moves business logic to services, destroying the domain model.

```typescript
// ❌ WRONG: anemic — only data, no behavior
class Order {
  id: string; items: OrderItem[]; status: string;
  // No methods. Business logic lives in OrderService.
}
class OrderService {
  confirm(order: Order) { order.status = "confirmed"; } // leaking business rules
}

// ✅ CORRECT: rich domain model — behavior lives in the entity
class Order {
  confirm(): void {
    if (this.status !== "pending") throw new Error("Only pending orders can be confirmed");
    this.status = "confirmed";
  }
}
```

---

## Decision Tree

```
Complex business rules?                → Apply DDD Aggregates + Entities
Multiple teams on different areas?     → Define Bounded Contexts with explicit APIs
Technical jargon in domain model?      → Build Ubiquitous Language with domain experts
Has lifecycle and identity (User, Order)? → Entity (mutable, identity-based equality)
Defined entirely by attributes (Money, Email)? → Value Object (immutable, value equality)
Side effects from domain events?       → Use Domain Events to decouple
Need to persist an aggregate?          → Define a Repository interface
Logic spans multiple aggregates?       → Extract to a Domain Service
Integrating legacy system or 3rd party? → Anti-Corruption Layer (see advanced-patterns.md)
Long-running multi-aggregate workflow? → Saga / Process Manager (see advanced-patterns.md)
Simple CRUD?                           → Skip DDD, not worth the complexity
```

---

## Example

`Order` aggregate with value objects, a domain event, and a repository interface.

```typescript
// Value Object — immutable, defined by value, enforces business rules
class Money {
  constructor(readonly amount: number, readonly currency: string) {
    if (amount < 0) throw new Error("Amount cannot be negative");
  }
  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Domain Event — captures a significant occurrence
class OrderConfirmedEvent {
  constructor(readonly orderId: string, readonly total: Money, readonly confirmedAt: Date) {}
}

// Aggregate Root — enforces invariants, only entry point to OrderItems
class Order {
  private items: OrderItem[] = [];
  private _status: "pending" | "confirmed" = "pending";

  addItem(sku: string, price: Money, qty: number): void {
    if (this._status !== "pending") throw new Error("Cannot modify confirmed order");
    this.items.push(new OrderItem(sku, price, qty));
  }

  confirm(): OrderConfirmedEvent {
    if (this.items.length === 0) throw new Error("Cannot confirm empty order");
    this._status = "confirmed";
    return new OrderConfirmedEvent(this.id, this.totalPrice(), new Date());
  }

  totalPrice(): Money { return this.items.reduce((sum, i) => sum.add(i.subtotal()), new Money(0, "USD")); }
}

// Repository interface in domain layer — no DB knowledge here
interface OrderRepository { save(order: Order): Promise<void>; findById(id: string): Promise<Order | null>; }
```

Patterns applied: value object (`Money`), aggregate root (`Order`) protecting invariants, domain event (`OrderConfirmedEvent`), repository interface (infrastructure implements it).

---

## Edge Cases

**Aggregate size:** Too-large aggregates cause contention (everything locks on Order). Too-small aggregates lose invariant protection. Design around business transactions, not data.

**Context boundaries vs microservices:** Bounded Contexts are logical, not necessarily microservice boundaries. One service can contain multiple contexts; one context can span services.

**DDD without OOP:** DDD applies to functional code too. Bounded contexts = modules; aggregates = immutable records with pure functions; domain events = typed messages.

**Ubiquitous Language drift:** Language agreed at project start diverges over time as business evolves. Regularly revisit with domain experts and update code to match.

---

## Resources

**Tactical pattern references:**

- [entity.md](references/entity.md) — Identity-based equality, lifecycle, Entity vs Value Object
- [value-objects.md](references/value-objects.md) — Immutability, self-validation, equality contract, conceptual whole
- [aggregate.md](references/aggregate.md) — Consistency boundaries, invariant enforcement, root access rules
- [domain-events.md](references/domain-events.md) — Facts, naming conventions, event bus, eventual consistency
- [repository.md](references/repository.md) — Persistence abstraction, interface vs implementation, unit of work
- [domain-service.md](references/domain-service.md) — Cross-aggregate logic, stateless services, when to extract
- [advanced-patterns.md](references/advanced-patterns.md) — Anti-Corruption Layer, Sagas, Context Mapping
