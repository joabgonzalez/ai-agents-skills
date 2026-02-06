---
name: express
description: "Express.js routing, middleware, and error handling. Trigger: When building REST APIs or server logic with Express."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - nodejs
    - typescript
    - architecture-patterns
  dependencies:
    express: ">=4.18.0 <5.0.0"
---

# Express.js Skill

Build REST APIs and server logic with Express.js v4.x middleware and routing.

## When to Use
- Building REST APIs
- Composing middleware stacks
- Handling HTTP requests/responses

Don't use for:
- Static site generation (use Next.js or Astro)
- GraphQL-first APIs (use Apollo Server)
- Edge/serverless with zero cold-start needs (use Hono)

## Critical Patterns

### Router Modularization
Group related routes into Router instances to keep `app.ts` clean.
```typescript
// CORRECT: modular router in routes/users.ts
const router = Router();
router.get("/", listUsers);
router.post("/", createUser);
export default router;
// WRONG: all routes dumped directly in app.ts
```

### Async Error Wrapper
Express 4.x does not catch rejected promises. Wrap async handlers.
```typescript
// CORRECT: wrapper forwards rejections to error middleware
const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await db.findUser(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  res.json(user);
}));
```

### Centralized Error Middleware
Define a single error handler as the last middleware in the stack.
```typescript
// CORRECT: 4-argument signature signals error middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: err.message });
};
app.use(errorHandler);
// WRONG: try/catch in every route returning res.status(500)
```

### Input Validation Middleware
Validate request bodies before they reach route logic.
```typescript
const CreateUser = z.object({ name: z.string(), email: z.string().email() });
const validate = (schema: z.ZodSchema): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error.flatten());
    req.body = result.data;
    next();
  };
```

### Proper Status Codes
Return semantically correct HTTP status codes for each operation.
```typescript
// CORRECT: 201 for creation, 204 for no-content delete
router.post("/users", asyncHandler(async (req, res) => {
  const user = await db.createUser(req.body);
  res.status(201).json(user);
}));
router.delete("/users/:id", asyncHandler(async (req, res) => {
  await db.deleteUser(req.params.id);
  res.status(204).end();
}));
```

## Decision Tree
- Multiple resource routes? -> Group into a Router per resource
- Async handler? -> Wrap with asyncHandler utility
- Need auth? -> Add auth middleware before route handlers
- Input from client? -> Validate with schema middleware
- Creating a resource? -> Return 201, not 200
- Deleting a resource? -> Return 204 with no body
- Unhandled error? -> Let centralized error middleware respond

## Example
```typescript
import express from "express";
import { z } from "zod";
const app = express();
app.use(express.json());
const asyncHandler = (fn: Function) =>
  (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
const UserSchema = z.object({ name: z.string(), email: z.string().email() });
app.get("/users/:id", asyncHandler(async (req: any, res: any) => {
  const user = await db.findUser(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
}));
app.post("/users", asyncHandler(async (req: any, res: any) => {
  const data = UserSchema.parse(req.body);
  res.status(201).json(await db.createUser(data));
}));
```

## Edge Cases
- **Async error propagation**: Express 4 silently swallows rejected promises; always use an async wrapper or upgrade to Express 5.
- **Middleware ordering**: Error middleware must be registered after all routes; auth middleware must come before protected routes.
- **Large payloads**: Set `express.json({ limit: "1mb" })` explicitly to prevent 413 errors or memory abuse.
- **Double response**: Calling `res.json()` twice throws; guard with `if (res.headersSent) return next(err)`.
- **Missing Content-Type**: Clients omitting `Content-Type: application/json` get an empty `req.body`; validate early.

## Checklist
- [ ] Every async route handler is wrapped or uses express-async-errors
- [ ] A centralized error middleware is the last `app.use` call
- [ ] Routes are grouped into Router modules by resource
- [ ] Request bodies are validated before business logic runs
- [ ] Correct HTTP status codes are used (201, 204, 400, 404, 500)
- [ ] `express.json()` has an explicit size limit
- [ ] Sensitive headers (CORS, Helmet) are configured

## Resources
- [Express.js 4.x API Reference](https://expressjs.com/en/4x/api.html)
- [Error Handling Guide](https://expressjs.com/en/guide/error-handling.html)
- [Express Best Practices - Production](https://expressjs.com/en/advanced/best-practice-performance.html)
