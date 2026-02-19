# Architecture Patterns References

> Integration guides showing how architectural patterns combine in real projects.

## Quick Navigation

| Reference | Purpose | Read When |
|-----------|---------|-----------|
| [backend-integration.md](backend-integration.md) | Backend implementation examples | Backend projects (Node, NestJS, Express) |
| [frontend-integration.md](frontend-integration.md) | Frontend implementation examples | Frontend projects (React, Redux, Astro) |

---

## Pattern-Specific Skills

Individual pattern details live in dedicated skills:

| Skill | Content |
|-------|---------|
| [solid](../../solid/SKILL.md) | SRP, OCP, LSP, ISP, DIP with examples |
| [clean-architecture](../../clean-architecture/SKILL.md) | Layer separation, dependency rule |
| [hexagonal-architecture](../../hexagonal-architecture/SKILL.md) | Ports and adapters |
| [domain-driven-design](../../domain-driven-design/SKILL.md) | Aggregates, bounded contexts, domain events |
| [result-pattern](../../result-pattern/SKILL.md) | Result<T>, Either, Option |
| [dry-principle](../../dry-principle/SKILL.md) | Duplication elimination |
| [mediator-pattern](../../mediator-pattern/SKILL.md) | CQRS, event bus |
| [sidecar-pattern](../../sidecar-pattern/SKILL.md) | Microservice cross-cutting concerns |

---

## Reading Strategy

### For Backend Projects

1. [backend-integration.md](backend-integration.md) — Full implementation guide (NestJS, Express)
2. [solid](../../solid/SKILL.md) → [clean-architecture](../../clean-architecture/SKILL.md) → [hexagonal-architecture](../../hexagonal-architecture/SKILL.md)
3. Optional: [domain-driven-design](../../domain-driven-design/SKILL.md) for complex domains

### For Frontend Projects

1. [frontend-integration.md](frontend-integration.md) — **Read this FIRST**
2. [solid](../../solid/SKILL.md) (SRP for components, DIP for services)
3. Optional: [result-pattern](../../result-pattern/SKILL.md) for async error handling

### For Simple CRUD or MVPs

Skip architecture patterns. Use technology-specific best practices only.

---

## Back to Main

- [architecture-patterns/SKILL.md](../SKILL.md)
