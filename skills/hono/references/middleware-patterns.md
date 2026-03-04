## Core Patterns

Hono middleware runs in registration order. Each middleware receives the context object `c` and a `next` function. Calling `await next()` passes control to the next middleware or the route handler; returning a `Response` from middleware short-circuits the chain. Hono middleware is platform-agnostic — the same code runs on Cloudflare Workers, Bun, and Node.js.

### Built-in Middleware Usage

Hono ships first-party middleware for common concerns. Import from the `hono/*` subpath, not from a third-party package.

```typescript
import { Hono } from 'hono';
import { logger }     from 'hono/logger';
import { cors }       from 'hono/cors';
import { compress }   from 'hono/compress';
import { bearerAuth } from 'hono/bearer-auth';
import { zValidator } from '@hono/zod-validator';
import { z }          from 'zod';

const app = new Hono();

// logger — log every request/response (register first)
app.use('*', logger());

// cors — allow cross-origin requests (before any handler)
app.use('*', cors({
  origin: ['https://app.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// compress — gzip/brotli response compression
app.use('*', compress());

// bearerAuth — protect a path prefix (scope tightly)
app.use('/api/*', bearerAuth({ token: process.env.API_SECRET! }));

// zValidator — validate request body inline at the route
const CreateItem = z.object({
  name:  z.string().min(1),
  price: z.number().positive(),
});

app.post(
  '/api/items',
  zValidator('json', CreateItem),
  (c) => {
    const data = c.req.valid('json'); // fully typed: { name: string; price: number }
    return c.json({ id: crypto.randomUUID(), ...data }, 201);
  }
);

export default app;
```

Middleware scope matters: `'*'` applies to all routes; `'/api/*'` applies only to paths starting with `/api/`. Register `cors()` before any handler, including `bearerAuth`, so OPTIONS preflight requests receive CORS headers.

### Custom Middleware with `app.use()` and `createMiddleware()`

Write custom middleware as an async function accepting `(c, next)`. Use `createMiddleware()` from `hono/factory` for type inference when the middleware sets context variables.

```typescript
import { Hono }              from 'hono';
import { createMiddleware }  from 'hono/factory';

// Simple inline middleware — good for one-off logic
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const elapsed = Date.now() - start;
  c.res.headers.set('X-Response-Time', `${elapsed}ms`);
});

// Reusable middleware function — export and apply where needed
async function requireApiKey(c: Context, next: Next) {
  const key = c.req.header('X-Api-Key');
  if (key !== process.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
}

app.use('/internal/*', requireApiKey);

// createMiddleware() — preferred when setting typed context variables
// (see Context Variables section below for variable typing)
const requestId = createMiddleware(async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
});

app.use('*', requestId);
```

Middleware factory pattern — returns a configured middleware:

```typescript
import { MiddlewareHandler } from 'hono';

function rateLimit(options: { max: number; windowMs: number }): MiddlewareHandler {
  const counts = new Map<string, { n: number; reset: number }>();

  return async (c, next) => {
    const ip  = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    const now = Date.now();
    const rec = counts.get(ip);

    if (!rec || now > rec.reset) {
      counts.set(ip, { n: 1, reset: now + options.windowMs });
      return next();
    }
    if (rec.n >= options.max) {
      return c.json({ error: 'Too many requests' }, 429);
    }
    rec.n++;
    return next();
  };
}

// Apply per route group
app.use('/api/public/*', rateLimit({ max: 60,  windowMs: 60_000 }));
app.use('/api/auth/*',   rateLimit({ max: 10,  windowMs: 60_000 }));
```

### Middleware for Different Runtimes

Hono runs on multiple runtimes via adapters. The middleware code itself does not change — only the entry point and export format differ.

```typescript
// Cloudflare Workers entry point
// wrangler.toml: main = "src/index.ts"
import { Hono } from 'hono';

type Env = {
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
    API_SECRET: string;
  };
};

const app = new Hono<Env>();

app.use('/api/*', async (c, next) => {
  // Access Cloudflare bindings via c.env — typed by Env generic
  const secret = c.env.API_SECRET;
  if (c.req.header('Authorization') !== `Bearer ${secret}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

export default app; // CF Workers expects default export
```

```typescript
// Bun entry point
import { Hono } from 'hono';

const app = new Hono();
app.use('*', logger());
app.get('/', (c) => c.text('Running on Bun'));

export default {
  port: 3000,
  fetch: app.fetch,  // Bun uses the fetch export
};
```

```typescript
// Node.js adapter entry point
import { serve } from '@hono/node-server';
import { Hono }  from 'hono';

const app = new Hono();
app.use('*', logger());
app.get('/', (c) => c.text('Running on Node.js'));

// Node.js uses serve() from the adapter — not default export
serve({ fetch: app.fetch, port: 3000 });
```

The same middleware file can be imported into any of these entry points unchanged.

### Context Variables for Sharing Data Between Middleware

Use `c.set()` and `c.get()` to pass data through the middleware chain. Type context variables with a generic `Variables` map to get TypeScript inference.

```typescript
import { Hono }             from 'hono';
import { createMiddleware } from 'hono/factory';

// Declare the shape of all context variables for this app
type Variables = {
  userId:    string;
  userRole:  'admin' | 'user';
  requestId: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware sets a variable — c.set() is typed by Variables
const authenticate = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const token = c.req.header('Authorization')?.slice(7);
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const payload = await verifyJwt(token); // returns { sub: string, role: string }
    c.set('userId',   payload.sub);
    c.set('userRole', payload.role as 'admin' | 'user');
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

const addRequestId = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
});

// Apply middleware
app.use('*', addRequestId);
app.use('/api/*', authenticate);

// Route handler reads variables — fully typed, no casting needed
app.get('/api/profile', (c) => {
  const userId    = c.get('userId');    // string
  const userRole  = c.get('userRole');  // 'admin' | 'user'
  const requestId = c.get('requestId'); // string

  return c.json({ userId, userRole, requestId });
});
```

Sub-apps inherit context variables when mounted with `app.route()`:

```typescript
const apiApp = new Hono<{ Variables: Variables }>();

apiApp.get('/me', (c) => {
  // c.get('userId') works here because Variables is passed in the generic
  return c.json({ id: c.get('userId') });
});

app.use('/api/*', authenticate);
app.route('/api', apiApp);
```

### Error Handling Middleware with `app.onError()`

`app.onError()` registers a global error handler that catches any error thrown inside a route handler or middleware. Use it as the Hono equivalent of Express's 4-argument error middleware.

```typescript
import { Hono }           from 'hono';
import { HTTPException }  from 'hono/http-exception';

const app = new Hono();

// Global error handler — registered once, catches everything
app.onError((err, c) => {
  // HTTPException carries a status code and optional response
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // Zod validation errors (from zValidator middleware)
  if (err.name === 'ZodError') {
    return c.json({ error: 'Validation failed', details: err }, 400);
  }

  // Unknown errors — log and return generic 500
  console.error(`[${c.req.method}] ${c.req.path}`, err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404 handler for unmatched routes
app.notFound((c) => {
  return c.json({ error: `Route ${c.req.method} ${c.req.path} not found` }, 404);
});

// Throw HTTPException in route handlers for known error conditions
app.get('/items/:id', async (c) => {
  const item = await db.findItem(c.req.param('id'));
  if (!item) {
    throw new HTTPException(404, { message: 'Item not found' });
  }
  return c.json(item);
});

// Throw any error — onError() catches it
app.post('/items', zValidator('json', ItemSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await db.createItem(data);
  return c.json(item, 201);
});

export default app;
```

Per-route error handling with try/catch (when route-specific recovery logic is needed):

```typescript
app.delete('/items/:id', async (c) => {
  try {
    await db.deleteItem(c.req.param('id'));
    return c.body(null, 204);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return c.json({ error: 'Item not found' }, 404);
    }
    // Re-throw unknown errors to reach app.onError()
    throw err;
  }
});
```
