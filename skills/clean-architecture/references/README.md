# Clean Architecture References

This directory contains a comprehensive layer-by-layer walkthrough of Clean Architecture with TypeScript examples for both backend (Node.js/Express) and frontend (React/Redux) applications.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [layer-examples.md](layer-examples.md) | Domain entities, Application use cases, Infrastructure adapters, Presentation controllers, folder structures, common mistakes | When implementing any layer, wiring dependencies, or diagnosing a dependency rule violation |

---

## Reading Strategy

### For implementing a new feature end-to-end

1. Read main [SKILL.md](../SKILL.md) for decision criteria and Critical Patterns
2. MUST read: [layer-examples.md](layer-examples.md) for the layer-by-layer breakdown and folder structure

### For reviewing or debugging a dependency violation

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [layer-examples.md](layer-examples.md) Common Mistakes section for the specific anti-pattern

### For setting up a new project structure

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [layer-examples.md](layer-examples.md) Folder Structure Examples section

---

## File Descriptions

### [layer-examples.md](layer-examples.md)

**Complete layer-by-layer reference with TypeScript code for all four Clean Architecture rings**

- Domain layer: Order and OrderItem entities with encapsulated business rules and validation
- Application layer: PlaceOrder and CancelOrder use cases with port interfaces (IOrderRepository, IPaymentGateway)
- Infrastructure layer: PostgresOrderRepository and StripePaymentGateway adapter implementations
- Presentation layer: Express OrderController with dependency wiring and route setup
- Frontend example: React/Redux equivalent using the same four-layer structure with RTK Query
- Folder structure templates for both backend (Node.js) and frontend (React) projects
- Common mistakes: domain depending on infrastructure, use case knowing about HTTP, business logic in controllers

---

## Cross-Reference Map

- [layer-examples.md](layer-examples.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Decision Tree
- Related skills: [SOLID Principles](../../solid/SKILL.md), [Hexagonal Architecture](../../hexagonal-architecture/SKILL.md), [Domain-Driven Design](../../domain-driven-design/SKILL.md)
