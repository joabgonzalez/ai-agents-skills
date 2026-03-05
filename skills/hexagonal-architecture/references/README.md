# Hexagonal Architecture References

This directory contains a complete ports-and-adapters reference with TypeScript implementations covering the full stack from application core through secondary ports, secondary adapters, primary adapters, composition root, testing strategies, and adapter swapping examples.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [port-adapter-examples.md](port-adapter-examples.md) | Application core, secondary ports (interfaces), secondary adapters (Postgres, Mongo, SendGrid, AWS SES), primary adapters (HTTP, CLI), composition root, unit and integration tests, frontend analytics example, folder structure | When defining ports, implementing adapters, wiring dependencies, or writing tests against mock adapters |

---

## Reading Strategy

### For defining ports and wiring the composition root

1. Read main [SKILL.md](../SKILL.md) for Critical Patterns and when to use
2. MUST read: [port-adapter-examples.md](port-adapter-examples.md) sections 1–5 (core through composition) in order

### For swapping an existing adapter implementation

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [port-adapter-examples.md](port-adapter-examples.md) "Swapping Adapters" section for the one-line swap pattern

### For writing tests against the application core

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [port-adapter-examples.md](port-adapter-examples.md) "Testing with Adapters" section for unit (mock) and integration (real adapter) test patterns

---

## File Descriptions

### [port-adapter-examples.md](port-adapter-examples.md)

**End-to-end port/adapter reference with TypeScript covering all pattern roles from core to composition**

- Application core: User domain entity and RegisterUserUseCase with injected secondary ports
- Secondary ports: IUserRepository and IEmailService interfaces defined by the core
- Secondary adapters: PostgresUserRepository, MongoUserRepository, SendGridEmailService, AWSEmailService, ConsoleEmailService (test mock)
- Primary adapters: UserController (HTTP/Express) and UserCLI (CLI) both consuming the same use case
- Composition root: main.ts wiring all dependencies with dependency injection
- Unit testing: mock adapter objects injected directly into use case for isolated testing
- Integration testing: real adapters (Postgres, Console) used against a test database
- Adapter swapping: Postgres to MongoDB and SendGrid to AWS SES with single-line change at composition root
- Frontend example: IAnalytics port with Segment and Google Analytics adapters wired via React Context
- Folder structure: core/ports, adapters/repositories, adapters/services, adapters/http

---

## Cross-Reference Map

- [port-adapter-examples.md](port-adapter-examples.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Example section
- Related skills: [Clean Architecture](../../clean-architecture/SKILL.md), [SOLID Principles](../../solid/SKILL.md) (DIP enables ports/adapters)
