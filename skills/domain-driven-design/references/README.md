# Domain-Driven Design References

Per-pattern reference files for DDD tactical and advanced building blocks, each with concept explanation, TypeScript implementation, and common mistakes.

## Quick Navigation

| File | Pattern | When to Read |
|------|---------|--------------|
| [entity.md](entity.md) | Entity | When modeling objects with identity and lifecycle (User, Order, Account) |
| [value-objects.md](value-objects.md) | Value Object | When modeling immutable concepts defined by attributes (Money, Email, Address) |
| [aggregate.md](aggregate.md) | Aggregate | When defining consistency boundaries and invariant enforcement |
| [domain-events.md](domain-events.md) | Domain Events | When decoupling side effects from aggregate state changes |
| [repository.md](repository.md) | Repository | When wiring aggregate persistence and infrastructure abstraction |
| [domain-service.md](domain-service.md) | Domain Service | When business logic spans multiple aggregates or entities |
| [advanced-patterns.md](advanced-patterns.md) | ACL, Sagas, Context Mapping | When integrating contexts, orchestrating workflows, or mapping boundaries |

---

## Reading Strategy

### Modeling a new domain

1. Read [SKILL.md](../SKILL.md) — Critical Patterns and Decision Tree
2. Read [entity.md](entity.md) + [value-objects.md](value-objects.md) — understand the Entity vs VO distinction first
3. Read [aggregate.md](aggregate.md) — define consistency boundaries
4. Read [domain-events.md](domain-events.md) — add events for significant state changes

### Implementing a specific pattern

Go directly to the file for that pattern. Each file is self-contained with concept + code + mistakes.

### Integrating with external systems

Read [advanced-patterns.md](advanced-patterns.md) — Anti-Corruption Layer section.

### Long-running workflows

Read [advanced-patterns.md](advanced-patterns.md) — Sagas / Process Managers section.

---

## File Descriptions

**entity.md** — Identity-based equality, mutable state, lifecycle. Includes Entity vs Value Object decision table and common mistakes (attribute equality, mutable ID, anemic model).

**value-objects.md** — Value-based equality, immutability, self-validation, conceptual whole. Includes Money, Email, and DateRange examples with full operations and equality contracts.

**aggregate.md** — Consistency boundary, invariant enforcement, single-transaction save, external reference by ID. Includes Order + OrderItem example with controlled access rules.

**domain-events.md** — Immutable facts, past-tense naming, event collection inside aggregates, publish-after-save pattern, event bus interface. Includes full use case orchestration example.

**repository.md** — Collection-oriented persistence abstraction, domain interface + infrastructure implementation, in-memory test double. Includes Prisma implementation and common mistakes (partial loading, business logic in repo).

**domain-service.md** — Cross-aggregate stateless business logic. Includes PricingService, TransferService, and AuthorizationService examples. Contrasts domain service vs application service.

**advanced-patterns.md** — Three sections: (1) Anti-Corruption Layer with translator and adapter examples; (2) Sagas with choreography and orchestration patterns, compensating transactions, idempotency; (3) Context Mapping with Partnership, Customer-Supplier, Conformist, ACL, Published Language decision guide.

---

## Cross-Reference Map

- Entity ↔ Value Object — see [entity.md](entity.md) decision table
- Aggregate uses Value Objects and raises Domain Events — see [aggregate.md](aggregate.md) + [domain-events.md](domain-events.md)
- Repository persists Aggregates — see [repository.md](repository.md)
- Domain Service operates on Aggregates — see [domain-service.md](domain-service.md)
- ACL translates between Bounded Contexts — see [advanced-patterns.md](advanced-patterns.md)
- Related skills: [clean-architecture](../../clean-architecture/SKILL.md) (DDD fits in the Domain layer), [solid](../../solid/SKILL.md)
