## Quick Navigation

| File | Purpose |
| ---- | ------- |
| [middleware-patterns.md](./middleware-patterns.md) | Built-in middleware, custom middleware factories, runtime adapters, context variables, error handling |

---

## Reading Strategy

Start with the SKILL.md for the core Hono patterns (route chaining, middleware composition, zValidator, context helpers, Cloudflare environment bindings). Then read `middleware-patterns.md` for complete implementation details on every middleware scenario: built-in middleware configuration, writing reusable middleware factories, adapting to different runtimes, sharing typed data through the middleware chain with context variables, and handling errors globally with `app.onError()`.

This references directory has one content file covering the full middleware surface area. All middleware topics are in a single file to keep cross-referencing simple — use the section headers to navigate directly to the pattern you need.

---

## File Descriptions

**middleware-patterns.md** — Complete Hono middleware reference: built-in middleware (`logger`, `cors`, `compress`, `bearerAuth`, `zValidator`) with configuration options and registration order; custom middleware with inline `app.use()` functions and the `createMiddleware()` factory for typed context variables; runtime adapter differences for Cloudflare Workers (`export default app`), Bun (`export default { fetch: app.fetch }`), and Node.js (`serve({ fetch: app.fetch })`); context variable typing with the `Variables` generic and `c.set()`/`c.get()`; global error handling with `app.onError()` and `app.notFound()`; `HTTPException` for structured HTTP errors; per-route try/catch with re-throw for unknown errors.

---

## Cross-Reference Map

| Concept | Where it appears |
| ------- | ---------------- |
| Built-in middleware registration order | middleware-patterns.md: Built-in Middleware Usage |
| cors() before bearerAuth() | middleware-patterns.md: Built-in Middleware Usage, SKILL.md: Edge Cases |
| zValidator inline at route | middleware-patterns.md: Built-in Middleware Usage, SKILL.md: Zod Validation |
| Custom middleware with app.use() | middleware-patterns.md: Custom Middleware with app.use() |
| createMiddleware() for typed variables | middleware-patterns.md: Custom Middleware, Context Variables |
| Middleware factory pattern | middleware-patterns.md: Custom Middleware with app.use() |
| Cloudflare Workers entry point | middleware-patterns.md: Middleware for Different Runtimes, SKILL.md: Environment Bindings |
| Bun entry point | middleware-patterns.md: Middleware for Different Runtimes |
| Node.js adapter entry point | middleware-patterns.md: Middleware for Different Runtimes |
| c.set() / c.get() typed variables | middleware-patterns.md: Context Variables, SKILL.md: Context Helpers |
| Variables generic type | middleware-patterns.md: Context Variables |
| app.onError() global handler | middleware-patterns.md: Error Handling Middleware |
| HTTPException | middleware-patterns.md: Error Handling Middleware |
| app.notFound() | middleware-patterns.md: Error Handling Middleware |
| Per-route try/catch with re-throw | middleware-patterns.md: Error Handling Middleware |
| Path scoping middleware | middleware-patterns.md: Built-in Middleware, SKILL.md: Middleware Composition |
