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

Immutable objects defined by their value, not identity. No ID, no mutable state.

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

---

## Decision Tree

```
Complex business rules?              → Apply DDD Aggregates + Entities
Multiple teams on different areas?   → Define Bounded Contexts with explicit APIs
Technical jargon in domain model?    → Build Ubiquitous Language with domain experts
Objects defined by attributes only?  → Use Value Objects (immutable, no ID)
Side effects from domain events?     → Use Domain Events to decouple
Simple CRUD?                         → Skip DDD, not worth the complexity
```

---

## Edge Cases

**Aggregate size:** Too-large aggregates cause contention (everything locks on Order). Too-small aggregates lose invariant protection. Design around business transactions, not data.

**Context boundaries vs microservices:** Bounded Contexts are logical, not necessarily microservice boundaries. One service can contain multiple contexts; one context can span services.

**DDD without OOP:** DDD applies to functional code too. Bounded contexts = modules; aggregates = immutable records with pure functions; domain events = typed messages.

**Ubiquitous Language drift:** Language agreed at project start diverges over time as business evolves. Regularly revisit with domain experts and update code to match.

---

## Resources

- [tactical-strategic.md](references/tactical-strategic.md) — Strategic + tactical DDD, Repositories, Domain Services, Context Map
