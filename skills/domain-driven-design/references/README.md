# Domain-Driven Design References

This directory contains a detailed reference covering both Strategic and Tactical DDD patterns with TypeScript examples for backend and frontend applications, including anti-patterns and a when-to-use decision guide.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [tactical-strategic.md](tactical-strategic.md) | Ubiquitous Language, Bounded Context, Entity, Value Object, Aggregate, Repository, Domain Service, Domain Event, anti-patterns | When modeling a new domain, choosing between Entity and Value Object, or wiring domain events |

## Reading Strategy

### For modeling a new domain

1. Read main [SKILL.md](../SKILL.md) for trigger criteria and Critical Patterns
2. MUST read: [tactical-strategic.md](tactical-strategic.md) Strategic DDD section to define Bounded Contexts first, then Tactical section for building blocks

### For implementing a specific tactical pattern

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [tactical-strategic.md](tactical-strategic.md) for the specific building block (Entity, Value Object, Aggregate, etc.)

### For reviewing an existing domain model

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [tactical-strategic.md](tactical-strategic.md) Anti-Patterns section to identify Anemic Domain Model or collection exposure issues

## File Descriptions

### [tactical-strategic.md](tactical-strategic.md)

**Comprehensive DDD reference covering both strategic design and tactical building blocks with TypeScript implementations**

- Strategic DDD: Ubiquitous Language with code examples, Bounded Context with separate Product models for Sales, Inventory, and Shipping contexts
- Tactical Entity: User entity with identity-based equality and mutable attributes
- Tactical Value Object: Money and Email value objects with immutability and attribute-based equality
- Tactical Aggregate: Order aggregate root enforcing invariants, controlling item access, and raising domain events
- Tactical Repository: IOrderRepository interface and PostgresOrderRepository implementation with full aggregate loading
- Tactical Domain Service: PricingService for cross-entity business rules
- Tactical Domain Event: OrderConfirmed event with aggregate event collection and use case publication
- Frontend application: ShoppingCart aggregate for React with business rules expressed in domain methods
- Anti-patterns: Anemic Domain Model and mutable collection exposure

## Cross-Reference Map

- [tactical-strategic.md](tactical-strategic.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Example section
- Related skills: [Clean Architecture](../../clean-architecture/SKILL.md) (DDD fits in the Domain layer), [SOLID Principles](../../solid/SKILL.md)
