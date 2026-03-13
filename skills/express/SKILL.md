---
name: express
description: "Express.js routing, middleware, and error handling. Trigger: When building REST APIs or server logic with Express."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: framework
  skills:
    - nodejs
  dependencies:
    express: ">=4.18.0 <5.0.0"
---

# Express.js

REST APIs and server logic with Express v4.x middleware and routing.

## When to Use

- REST APIs
- Middleware stacks
- HTTP request/response handling

Don't use for:

- Static site generation (use Next.js/Astro)
- GraphQL-first APIs (use Apollo Server)
- Edge/serverless zero cold-start (use Hono)

---

## Critical Patterns

### ✅ REQUIRED: Router Modularization

Group routes into Router instances for clean `app.ts`.

```typescript
// CORRECT: modular router in routes/users.ts
const router = Router();
router.get("/", listUsers);
router.post("/", createUser);
export default router;
// WRONG: all routes dumped directly in app.ts
```

### ✅ REQUIRED: Async Error Wrapper

Express 4 doesn't catch rejected promises. Wrap async handlers.

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

### ✅ REQUIRED: Centralized Error Middleware

Single error handler as last middleware in stack.

```typescript
// CORRECT: 4-argument signature signals error middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: err.message });
};
app.use(errorHandler);
// WRONG: try/catch in every route returning res.status(500)
```

### ✅ REQUIRED: Input Validation Middleware

Validate bodies before route logic.

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

### ✅ REQUIRED: Proper Status Codes

Return correct HTTP codes per operation.

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

---

## Decision Tree

```
Multiple resource routes?
  → Group into a Router per resource

Async handler?
  → Wrap with asyncHandler utility

Need auth?
  → Add auth middleware before route handlers

Input from client?
  → Validate with schema middleware

Creating a resource?
  → Return 201, not 200

Deleting a resource?
  → Return 204 with no body

Unhandled error?
  → Let centralized error middleware respond
```

---

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

---

## Edge Cases

- **Async errors**: Express 4 swallows rejected promises; use async wrapper.
- **Middleware order**: Error middleware after routes; auth before protected routes.
- **Large payloads**: Set `express.json({ limit: "1mb" })` to prevent 413/memory issues.
- **Double response**: `res.json()` twice throws; guard with `if (res.headersSent)`.
- **Missing Content-Type**: No `Content-Type: application/json` → empty `req.body`.

---

## Checklist

- [ ] Every async route handler is wrapped or uses express-async-errors
- [ ] A centralized error middleware is the last `app.use` call
- [ ] Routes are grouped into Router modules by resource
- [ ] Request bodies are validated before business logic runs
- [ ] Correct HTTP status codes are used (201, 204, 400, 404, 500)
- [ ] `express.json()` has an explicit size limit
- [ ] Sensitive headers (CORS, Helmet) are configured

---

## Resources

- [Express.js 4.x API Reference](https://expressjs.com/en/4x/api.html)
- [Error Handling Guide](https://expressjs.com/en/guide/error-handling.html)
- [Express Best Practices - Production](https://expressjs.com/en/advanced/best-practice-performance.html)
