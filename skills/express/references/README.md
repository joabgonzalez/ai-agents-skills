## Quick Navigation

| File | Purpose |
| ---- | ------- |
| [middleware-patterns.md](./middleware-patterns.md) | Middleware execution order, error handling, factory pattern, auth chain, and Zod validation |
| [project-structure.md](./project-structure.md) | Feature-based folder layout, router mounting, graceful shutdown, and constructor DI |

---

## Reading Strategy

Start with the SKILL.md for the core Express patterns (router modularization, async error wrapper, centralized error middleware, input validation). Then use the reference files for deeper implementation guidance:

- Building middleware or securing routes: read `middleware-patterns.md` — it covers the full middleware execution stack, the 4-argument error handler signature, factory patterns for configurable middleware, JWT auth chains, and Zod-based validation middleware.
- Structuring a new or existing Express project: read `project-structure.md` — it covers the feature-based folder layout, how to mount routers with dependency injection, graceful SIGTERM shutdown, and constructor injection without a DI framework.

The two files are complementary. A complete Express application uses patterns from both.

---

## File Descriptions

**middleware-patterns.md** — Deep coverage of Express middleware: correct registration order (security → body → logging → rate-limit → auth → routes → 404 → error), the 4-argument `ErrorRequestHandler` signature, custom `AppError` class with status codes, middleware factory pattern for configurable and reusable middleware, JWT verification + user-load auth chain with typed `req.user`, and a generic Zod `validate()` factory for body/params/query validation.

**project-structure.md** — Project architecture patterns: feature-based folder layout with strict import layer rules, `createApp()` factory function for testable app creation, feature router factory that accepts injected dependencies, graceful shutdown with `SIGTERM`/`SIGINT` handlers, connection draining with a force-exit timeout, and constructor injection with interface types for fully mockable services, repositories, and controllers.

---

## Cross-Reference Map

| Concept | Where it appears |
| ------- | ---------------- |
| Middleware registration order | middleware-patterns.md: Execution Order section |
| 4-argument error handler | middleware-patterns.md: Error-Handling Middleware, SKILL.md: Centralized Error Middleware |
| AppError with statusCode | middleware-patterns.md: Error-Handling Middleware |
| Middleware factory pattern | middleware-patterns.md: Custom Middleware Factory |
| JWT verification + user load chain | middleware-patterns.md: Authentication Chain |
| Zod validate() factory | middleware-patterns.md: Request Validation, SKILL.md: Input Validation Middleware |
| Feature-based folder structure | project-structure.md: Feature-Based Folder Structure |
| Layer import rules | project-structure.md: Feature-Based Folder Structure |
| Router mounting with DI | project-structure.md: Router Mounting Strategy |
| Graceful shutdown (SIGTERM) | project-structure.md: Graceful Shutdown Pattern |
| Constructor injection pattern | project-structure.md: Dependency Injection Without Frameworks |
| Async handler wrapper | SKILL.md: Async Error Wrapper |
