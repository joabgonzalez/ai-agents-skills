---
name: hono
description: "Lightweight edge/serverless APIs with Hono. Trigger: When building edge APIs or lightweight serverless apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    hono: ">=3.0.0 <4.0.0"
---

# Hono Skill

Build lightweight, type-safe APIs for edge and serverless platforms with Hono.

## When to Use
- Building edge/serverless APIs
- Lightweight routing and middleware
- Deploying to edge platforms (Cloudflare Workers, Deno Deploy, Bun)

Don't use for:
- Full-stack apps needing SSR and React (use Next.js)
- Apps requiring heavy ORM/session state (use Express or NestJS)
- Long-running background processes (use a traditional Node.js server)

## Critical Patterns

### Route Chaining
Define routes with method chaining for compact, readable groups.
```typescript
// CORRECT: chained routes on a single app instance
const app = new Hono()
  .get("/users", (c) => c.json(users))
  .post("/users", (c) => c.json(created, 201))
  .get("/users/:id", (c) => c.json(user));
// WRONG: separate app declarations or loose functions
```

### Middleware Composition
Use `app.use()` for cross-cutting concerns and scope middleware to paths.
```typescript
// CORRECT: scoped middleware
app.use("*", logger());
app.use("*", cors());
app.use("/api/*", bearerAuth({ token: SECRET }));
// WRONG: auth middleware applied globally to public routes
```

### Zod Validation with zValidator
Use `@hono/zod-validator` to validate request bodies, params, and queries.
```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
const CreateUser = z.object({ name: z.string(), email: z.string().email() });
app.post("/users", zValidator("json", CreateUser), (c) => {
  const data = c.req.valid("json"); // fully typed
  return c.json({ id: 1, ...data }, 201);
});
```

### Context Helpers
Use `c.json()`, `c.text()`, `c.html()` instead of manual Response construction.
```typescript
// CORRECT: context helpers set headers automatically
app.get("/health", (c) => c.text("ok"));
app.get("/data", (c) => c.json({ status: "up" }));
app.get("/old", (c) => c.redirect("/new", 301));
// WRONG: new Response(JSON.stringify({ status: "up" }))
```

### Environment Bindings (Cloudflare Workers)
Access platform bindings through the generic type parameter on Hono.
```typescript
type Env = { Bindings: { DB: D1Database; KV: KVNamespace } };
const app = new Hono<Env>();
app.get("/items", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM items").all();
  return c.json(result);
});
```

## Decision Tree
- Cloudflare Workers? -> Use `Hono<{ Bindings: ... }>` for typed env
- Need validation? -> Use `@hono/zod-validator` middleware
- Sub-routes? -> Use `app.route("/prefix", subApp)`
- Auth required? -> Scope `bearerAuth` or custom middleware to protected paths
- Returning JSON? -> Always use `c.json()` with explicit status codes
- Streaming response? -> Use `c.stream()` or `c.streamText()`
- Multiple platforms? -> Use adapter exports (`hono/cloudflare-workers`, `hono/bun`)

## Example
```typescript
import { Hono } from "hono";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
const app = new Hono();
app.use("*", logger());
const ItemSchema = z.object({ name: z.string(), price: z.number().positive() });
app.get("/items", (c) => c.json(items));
app.post("/items", zValidator("json", ItemSchema), (c) => {
  const data = c.req.valid("json");
  return c.json({ id: crypto.randomUUID(), ...data }, 201);
});
export default app;
```

## Edge Cases
- **Cold start latency**: Hono is ultralight (~14KB) but bundled deps can inflate start time; tree-shake aggressively.
- **Platform-specific limits**: CF Workers have 128MB memory, 10ms CPU (free) / 30s (paid); Deno Deploy has 50ms CPU default.
- **Streaming responses**: Use `c.stream()` for chunked transfer; not all edge platforms support full streaming.
- **No built-in body parsing**: Hono parses JSON lazily via `c.req.json()`; multipart requires `hono/multipart`.
- **Path param types**: All `c.req.param()` values are strings; parse to numbers explicitly before DB queries.
- **CORS preflight**: `cors()` middleware must be registered before route handlers to catch OPTIONS requests.

## Checklist
- [ ] Routes use method chaining or `app.route()` for sub-apps
- [ ] Middleware is scoped to relevant paths, not applied globally when unnecessary
- [ ] Request bodies are validated with `zValidator` and Zod schemas
- [ ] Responses use context helpers (`c.json`, `c.text`) with explicit status codes
- [ ] Environment bindings are typed via the Hono generic parameter
- [ ] CORS middleware is registered before route definitions
- [ ] The final export matches the target platform adapter

## Resources
- [Hono Official Documentation](https://hono.dev/)
- [Hono Middleware List](https://hono.dev/docs/middleware/builtin/basic-auth)
- [Hono Zod Validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator)
