---
name: nodejs-best-practices
description: "Node.js quality patterns: observability, security, and graceful shutdown. Trigger: When reviewing Node.js service quality or operational readiness."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Node.js Best Practices

Quality patterns for Node.js services in production: observability, security, reliability, and operational readiness. Complements the `nodejs` skill (which covers runtime and module syntax).

## When to Use

- Reviewing a Node.js service for production readiness
- Evaluating logging and observability strategy
- Auditing security posture (secrets, headers, rate limiting)
- Designing startup/shutdown lifecycle

Don't use for:

- Express route design (use express)
- npm dependency management (use nodejs)
- TypeScript configuration (use typescript)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Structured Logging

JSON logs with consistent fields. Never `console.log` in production services.

```ts
// ❌ WRONG — unstructured, unsearchable
console.log('User created:', user.id);

// ✅ CORRECT — structured, queryable
logger.info({ userId: user.id, email: user.email }, 'User created');
// Output: {"level":"info","userId":"123","email":"...","msg":"User created","time":...}
```

Use pino or winston. Required fields: `level`, `msg`, `time`, `requestId` (from context).

### ✅ REQUIRED [CRITICAL]: Graceful Shutdown

Drain in-flight requests and close connections before exiting on SIGTERM/SIGINT.

```ts
// ❌ WRONG — kills in-flight requests and open DB connections
process.exit(0);

// ✅ CORRECT — drain then exit
process.on('SIGTERM', async () => {
  await server.close();      // stop accepting new connections
  await db.pool.end();       // close DB pool
  process.exit(0);
});
```

### ❌ NEVER: Secrets Without Startup Validation

Validate all required environment variables at boot. Fail fast with a clear error.

```ts
// ❌ WRONG — missing env var surfaces at runtime during a user request
const conn = await db.connect(process.env.DATABASE_URL);

// ✅ CORRECT — fail at startup with actionable message
const env = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
}).parse(process.env);
```

### ✅ REQUIRED: Security Headers

Ship security headers on every response. Use your framework's security middleware or set manually.

```ts
// Express / Fastify
import helmet from 'helmet';
app.use(helmet());

// Hono
import { secureHeaders } from 'hono/secure-headers';
app.use(secureHeaders());

// Native http / any framework — set manually
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

Minimum required headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`.

### ✅ REQUIRED: Error Propagation — Never Swallow

Every async path must handle rejections. Unhandled rejections crash the process in Node 15+.

```ts
// ❌ WRONG — silent failure, no error surfaced
asyncOperation();

// ❌ WRONG — caught but swallowed
asyncOperation().catch(() => {});

// ✅ CORRECT — propagate to caller or log + respond
asyncOperation().catch((err) => {
  logger.error({ err }, 'Operation failed');
  res.status(500).json({ error: 'Internal server error' });
});
```

### ❌ NEVER: Synchronous I/O in Request Path

`fs.readFileSync`, `crypto.pbkdf2Sync`, large `JSON.parse` — all block the event loop.

```ts
// ❌ WRONG — blocks event loop for all concurrent requests
const config = fs.readFileSync('./config.json', 'utf8');

// ✅ CORRECT — async, non-blocking
const config = await fs.promises.readFile('./config.json', 'utf8');
```

### ✅ REQUIRED: Cluster or Worker Threads for CPU-Bound Work

Single Node.js process uses one CPU core. Multi-core machines need clustering.

```ts
// ✅ CORRECT — use all cores (or PM2 cluster mode in production)
import cluster from 'node:cluster';
import os from 'node:os';

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  startServer();
}
```

For CPU-bound work in a single process (image processing, crypto), use Worker Threads instead of blocking the main thread.

### Symptom → Solution

| Symptom | Cause | Fix |
|---------|-------|-----|
| Server crashes unexpectedly | Unhandled promise rejection | Add `process.on('unhandledRejection')` + fix root cause |
| Logs not searchable in Datadog/Kibana | `console.log` plain strings | Switch to structured JSON logger (pino/winston) |
| Slow responses under concurrent load | Sync I/O in request path | Audit with `clinic.js`; replace with async equivalents |
| Secrets missing at runtime | No startup env validation | Validate with zod/joi at boot; fail fast |
| Requests lost during deployment | No graceful shutdown | Add SIGTERM handler with drain + close |
| Security scanner flags missing headers | No helmet | Add `app.use(helmet())` |

---

## Decision Tree

```
Service logging to console.log?
  → Replace with structured JSON logger (pino recommended)
  → Add requestId to all log entries via async context

SIGTERM/SIGINT handled?
  → No → Add graceful shutdown: stop server, drain, close DB, exit

Environment variables read without validation?
  → Add zod/joi schema validation at process start
  → Fail fast with "Missing required env: DATABASE_URL" message

Security headers configured?
  → Express/Fastify → helmet · Hono → hono/secure-headers · native http → res.setHeader manually

Async call without .catch or try/catch?
  → Unhandled rejection risk — add error handling
  → In Express: use express-async-errors or wrap routes

Synchronous I/O in request handler?
  → Identify with --prof or clinic.js
  → Replace with async equivalent

Service on multi-core machine?
  → Using PM2? → pm2 start app.js -i max
  → Manual? → node:cluster with os.cpus().length workers

CPU-bound work in request handler?
  → Offload to Worker Threads to avoid blocking event loop
```

---

## Example

```ts
import Fastify from 'fastify';
import { z } from 'zod';
import pino from 'pino';

// ✅ Startup env validation — fail fast
const env = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
}).parse(process.env);

const logger = pino({ level: 'info' });
const app = Fastify({ logger });

// ✅ Graceful shutdown
const shutdown = async () => {
  await app.close();
  logger.info('Server closed');
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen({ port: env.PORT });
```

---

## Edge Cases

**Containerized deployments:** SIGTERM is sent by orchestrators (Kubernetes, Docker). Set `terminationGracePeriodSeconds` to at least 30s to allow in-flight requests to drain.

**Clustering with stateful connections:** WebSockets and sticky sessions don't work with round-robin clustering. Use Redis pub/sub or sticky load balancing at the proxy level.

**Long-running background jobs:** Don't run long jobs in the web process — use a separate worker process (BullMQ, pg-boss) so the web server remains responsive.

**Memory leaks in long-running processes:** Monitor heap usage with `process.memoryUsage()`. Common causes: unbounded caches, event listener accumulation, closure capturing large objects.
