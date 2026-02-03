# Architecture Patterns References

> Detailed guides for software architecture patterns: SOLID, DDD, Clean/Hexagonal Architecture, and behavioral patterns.

## Quick Navigation

| Reference                                              | Purpose                               | Read When                                |
| ------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| [solid-principles.md](solid-principles.md)             | 5 SOLID principles with examples      | Designing classes, components, services  |
| [clean-architecture.md](clean-architecture.md)         | Layer separation and dependency rules | Organizing large codebases               |
| [hexagonal-architecture.md](hexagonal-architecture.md) | Ports and adapters pattern            | Testing, swapping dependencies           |
| [domain-driven-design.md](domain-driven-design.md)     | Domain modeling and bounded contexts  | Complex business logic                   |
| [mediator-pattern.md](mediator-pattern.md)             | Decoupled communication               | Component coordination                   |
| [result-pattern.md](result-pattern.md)                 | Explicit error handling               | Type-safe error management               |
| [backend-integration.md](backend-integration.md)       | Backend implementation examples       | Backend projects (Node, NestJS, Express) |
| [frontend-integration.md](frontend-integration.md)     | Frontend implementation examples      | Frontend projects (React, Redux, Astro)  |

## Reading Strategy

### For Backend Projects

**MUST read** (in order):

1. [solid-principles.md](solid-principles.md) - Foundation for all patterns
2. [clean-architecture.md](clean-architecture.md) - Layer organization
3. [hexagonal-architecture.md](hexagonal-architecture.md) - Port/adapter pattern
4. [backend-integration.md](backend-integration.md) - Implementation guide

**CHECK** (as needed):

- [domain-driven-design.md](domain-driven-design.md) - For complex domain logic
- [result-pattern.md](result-pattern.md) - For error handling
- [mediator-pattern.md](mediator-pattern.md) - For event-driven systems

### For Frontend Projects

**First, verify applicability**:

1. Check project's `AGENTS.md` for architecture mentions
2. If no mention → Use technology-specific patterns only
3. If mentions architecture → Proceed with reading below

**MUST read** (when applicable):

1. [frontend-integration.md](frontend-integration.md) - **Read this FIRST**
2. [solid-principles.md](solid-principles.md) - SRP for components, DIP for services
3. [result-pattern.md](result-pattern.md) - Error handling in async operations

**CHECK** (for complex apps):

- [clean-architecture.md](clean-architecture.md) - For large-scale apps
- [mediator-pattern.md](mediator-pattern.md) - For Redux/event systems

### For Simple CRUD or MVPs

**Skip architecture patterns**. Use technology-specific best practices:

- React: Component composition, custom hooks
- Redux: Normalized state, selectors
- Backend: Controller → Service → Repository (simple 3-layer)

## File Descriptions

### [solid-principles.md](solid-principles.md) (~400 lines)

Complete guide to SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion). Includes backend and frontend examples for each principle.

**Read when**: Designing any class, service, or complex component.

---

### [clean-architecture.md](clean-architecture.md) (~350 lines)

Layer-based architecture with dependency rules (outer → inner). Covers Domain, Application, Infrastructure layers with examples in Node.js, React, and Redux Toolkit.

**Read when**: Organizing projects with >1000 LOC or multiple teams.

---

### [hexagonal-architecture.md](hexagonal-architecture.md) (~300 lines)

Ports and adapters pattern for decoupling core logic from external systems. Focus on testing, dependency injection, and swappable implementations.

**Read when**: Need to swap dependencies (DB, payment gateway) or improve testability.

---

### [domain-driven-design.md](domain-driven-design.md) (~450 lines)

Strategic and tactical DDD patterns: entities, value objects, aggregates, repositories, bounded contexts, ubiquitous language.

**Read when**: Modeling complex domains (e-commerce, banking, healthcare).

---

### [mediator-pattern.md](mediator-pattern.md) (~200 lines)

Behavioral pattern for decoupled communication between components/services. Examples with Redux middleware, event bus, CQRS.

**Read when**: Components need to communicate without direct coupling.

---

### [result-pattern.md](result-pattern.md) (~250 lines)

Type-safe error handling without exceptions. Covers Result<T>, Either<L, R>, Option<T> patterns with TypeScript implementation.

**Read when**: Building robust APIs or handling async operations.

---

### [backend-integration.md](backend-integration.md) (~400 lines)

Complete backend implementation guide: NestJS, Express, Fastify examples. Covers dependency injection, testing, folder structure.

**Read when**: Implementing architecture patterns in backend projects.

---

### [frontend-integration.md](frontend-integration.md) (~450 lines)

Frontend-specific patterns: React components with SRP, Redux with Clean Architecture, Astro with layer separation. Includes when NOT to use patterns.

**Read when**: **FIRST reference for frontend developers**. Contains context verification checklist.

---

## Integration Between Patterns

These patterns complement each other:

- **SOLID + Clean Architecture**: SOLID principles guide class design within each Clean Architecture layer
- **Clean + Hexagonal**: Hexagonal provides port/adapter implementation for Clean's Infrastructure layer
- **DDD + Clean**: DDD entities/value objects live in Clean's Domain layer
- **Result + All**: Result pattern can be used in any architecture for error handling
- **Mediator + Clean**: Mediator can coordinate between Application layer use cases

## Common Questions

### Q: Do I need all patterns?

**A**: No. Start with SOLID principles (foundation), then add others as needed:

- Small backend → SOLID + simple 3-layer (Controller-Service-Repository)
- Large backend → SOLID + Clean Architecture + Hexagonal (for testing)
- Complex domain → Add DDD
- Event-driven → Add Mediator
- Error handling → Add Result

### Q: What's the difference between Clean and Hexagonal?

**A**:

- **Clean Architecture**: Focus on layers and dependency direction (outer → inner)
- **Hexagonal Architecture**: Focus on ports (interfaces) and adapters (implementations)
- **Integration**: Use Hexagonal's port/adapter pattern in Clean's Infrastructure layer

### Q: Can I use these in frontend?

**A**: Yes, **but verify context first**:

1. Check `AGENTS.md` for architecture requirements
2. If not mentioned → Use simple React/Redux patterns
3. If mentioned or very complex app → Apply selectively (SRP, Result pattern)

**See** [frontend-integration.md](frontend-integration.md) for complete guide.

### Q: How to migrate legacy code?

**A**: Incremental migration:

1. Apply to new features first
2. Create anti-corruption layer for legacy integration
3. Refactor one module at a time
4. See [backend-integration.md](backend-integration.md#legacy-migration)

### Q: Over-engineering concern?

**A**: Valid concern. Use pragmatism:

- Simple CRUD → Skip patterns
- Complex logic → Apply patterns
- Ask: "Is this abstraction paying for itself in testability/maintainability?"
- See [frontend-integration.md](frontend-integration.md#pragmatism-guide)

## Validation Checklist

Before applying patterns, verify:

- [ ] I read the SKILL.md Decision Tree
- [ ] For frontend: I checked project's AGENTS.md
- [ ] I understand which patterns apply to my context
- [ ] I read the required references for my use case
- [ ] I'm not over-engineering simple CRUD
- [ ] Team is aligned on architecture approach

## Resources

- **Skills**: [conventions](../../conventions/SKILL.md), [typescript](../../typescript/SKILL.md), [react](../../react/SKILL.md), [redux-toolkit](../../redux-toolkit/SKILL.md)
- **External**:
  - [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
  - [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
  - [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/)
