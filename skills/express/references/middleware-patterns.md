## Core Patterns

Express middleware executes in the order it is registered. Each middleware either calls `next()` to pass control forward, sends a response to end the chain, or calls `next(err)` to jump to error-handling middleware. Correct ordering is not optional — it determines security, correctness, and performance.

### Middleware Execution Order and Composition

Register middleware from outermost concern (logging, body parsing) to innermost (route handlers). Auth and rate-limiting must run before business logic.

```typescript
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Layer 1 — Security headers (must be first, before any response)
app.use(helmet());

// Layer 2 — Body parsing (before any route reads req.body)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Layer 3 — Request logging (after body parse so body is available to log)
app.use(requestLogger);

// Layer 4 — Rate limiting (before auth to block floods early)
app.use('/api/', rateLimit({ windowMs: 60_000, max: 100 }));

// Layer 5 — Authentication (before any protected route)
app.use('/api/', authenticate);

// Layer 6 — Routes (after all cross-cutting middleware)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/orders', orderRouter);

// Layer 7 — 404 handler (after all routes, before error handler)
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Layer 8 — Error handler (must be last, 4-argument signature)
app.use(errorHandler);
```

### Error-Handling Middleware

Express identifies error middleware by the four-argument signature `(err, req, res, next)`. It must be the last `app.use()` call. All other middleware propagates errors by calling `next(err)`.

```typescript
import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

// Custom error class carries HTTP status
class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Centralized error handler — single place for all error responses
const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Operational errors: known, expected
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err });
  }

  // Programming errors: unknown, log and hide detail
  console.error('[Unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
};

// Usage: next(err) from any middleware or route jumps here
app.use(errorHandler);
```

Never call `next()` after sending a response. Check `res.headersSent` if there is any ambiguity:

```typescript
const safeNext = (res: Response, next: NextFunction, err?: Error) => {
  if (!res.headersSent) next(err);
};
```

### Custom Middleware Factory Pattern

A middleware factory is a function that accepts configuration and returns a middleware function. This keeps middleware configurable without global state.

```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Factory: returns middleware configured with options
function requireRole(allowedRoles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Factory: configurable rate limiter per route group
function createRateLimiter(max: number, windowMs: number): RequestHandler {
  const counts = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = counts.get(key);
    if (!entry || now > entry.reset) {
      counts.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    entry.count++;
    next();
  };
}

// Usage: compose factories per route group
app.use('/api/admin', requireRole(['admin']));
app.use('/api/public', createRateLimiter(30, 60_000));
```

### Authentication Chain Middleware

Auth is not a single middleware — it is a chain: verify token, load user, attach to request. Each step has a single responsibility.

```typescript
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

// Extend Express Request with typed user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string };
    }
  }
}

// Step 1: Extract and verify JWT from Authorization header
const verifyToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
      email: string;
    };
    // Attach minimal decoded payload — do NOT trust claims from client
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Step 2: Load full user from DB (only when route needs complete profile)
const loadUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user!.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};

// Usage: chain only what each route needs
router.get('/profile', verifyToken, loadUser, getProfile);
router.get('/feed',    verifyToken, getFeed);          // no DB lookup needed
```

### Request Validation Middleware with Zod

Validation middleware parses and replaces `req.body` with the typed, safe result. Downstream handlers receive validated data — no need to validate again.

```typescript
import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';

// Generic factory: validate any part of the request
function validate<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'params' | 'query' = 'body'
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    // Replace source with parsed, type-safe data
    (req as any)[source] = result.data;
    next();
  };
}

// Schemas
const CreateUserSchema = z.object({
  name:  z.string().min(2).max(100),
  email: z.string().email(),
  role:  z.enum(['user', 'admin']).default('user'),
});

const UserIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Applied per route
router.post(
  '/users',
  verifyToken,
  requireRole(['admin']),
  validate(CreateUserSchema, 'body'),
  createUserHandler
);

router.get(
  '/users/:id',
  verifyToken,
  validate(UserIdParamSchema, 'params'),
  getUserHandler
);
```

After validation middleware runs, handlers can cast safely:

```typescript
const createUserHandler: RequestHandler = async (req, res, next) => {
  // req.body is already validated — safe to use directly
  const data = req.body as z.infer<typeof CreateUserSchema>;
  try {
    const user = await userService.create(data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
```
