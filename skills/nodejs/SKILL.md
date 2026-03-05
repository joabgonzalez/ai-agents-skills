---
name: nodejs
description: "Node.js backend patterns with async I/O and process management. Trigger: When building backend services, CLI tools, or server scripts."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: language
  skills:
    - typescript
  dependencies:
    node: ">=18.0.0 <23.0.0"
---

# Node.js

Async I/O, process management, backend services with Node.js runtime.

> Examples use TypeScript. For JavaScript, remove type annotations (`: string`, `interface`, `<T>`, `Promise<T>`) — patterns apply identically.

## When to Use

- Building backend services or REST/GraphQL APIs
- Writing CLI tools, build scripts, or automation tasks
- Managing long-running processes (workers, daemons)
- Handling file I/O, streams, or network operations
- Developing real-time applications (WebSockets, SSE)

Don't use for:

- CPU-intensive tasks (worker threads/separate processes)
- Browser code (javascript/typescript skills)
- Framework patterns (express, nest, hono skills)

---

## Critical Patterns

### ✅ REQUIRED: Use async/await for I/O

All I/O operations must be asynchronous to avoid blocking the event loop.

```typescript
// ❌ WRONG: Blocking synchronous I/O
import fs from 'fs';
const data = fs.readFileSync('/path/to/file'); // Blocks

// ✅ CORRECT: Non-blocking async I/O
import fs from 'fs/promises';
const data = await fs.readFile('/path/to/file', 'utf-8');
```

### ✅ REQUIRED: Environment variable management

Never hardcode configuration. Use environment variables with validation.

```typescript
// ✅ CORRECT: Validated environment variables
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL, // Required
};

if (!config.dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}
```

### ✅ REQUIRED: Graceful shutdown

Handle SIGTERM and SIGINT signals for clean shutdowns.

```typescript
// ✅ CORRECT: Graceful shutdown handler
const server = app.listen(3000);

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close database connections
  await db.close();
  process.exit(0);
});

process.on('SIGINT', () => process.emit('SIGTERM' as any));
```

### ✅ REQUIRED: Error handling for unhandled rejections

Catch unhandled promise rejections globally.

```typescript
// ✅ CORRECT: Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally exit after logging
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

---

## Decision Tree

```
Building an HTTP server?
  → Use framework (express, hono, nest) or http.createServer for simple cases
  → See express, hono, nest skills for framework-specific patterns

Writing a CLI tool?
  → Use process.argv for simple args
  → Use commander or yargs for complex CLI with commands/options
  → Handle process.exit codes (0 = success, 1+ = error)

Long-running process (worker, daemon)?
  → Listen for SIGTERM/SIGINT for graceful shutdown
  → Implement health checks for process monitoring
  → Use PM2 or systemd for process management in production

File I/O operations?
  → Use fs/promises for async file operations
  → Use streams for large files to avoid memory issues
  → Handle ENOENT, EACCES errors explicitly

Child process management?
  → Use child_process.spawn() for streaming output
  → Use child_process.exec() for small output
  → Always handle 'exit', 'error', and 'close' events

Memory-intensive operations?
  → Use worker_threads for CPU-bound tasks
  → Monitor process.memoryUsage() for leaks
  → Implement backpressure for streams
```

---

## Edge Cases

- **Unhandled rejections**: `.catch()` or try/catch. Use `process.on('unhandledRejection')` as fallback.

- **Memory leaks**: `--inspect` flag with Chrome DevTools. Common: event listeners not removed, closures, unbounded caches.

- **Child processes**: Don't auto-exit with parent. Listen for 'exit' event, kill explicitly.

- **File descriptors**: OS limits (default ~1024). Use `ulimit -n` or connection pooling.

- **Event loop blocking**: CPU tasks block loop. Use worker threads or `setImmediate()`.

---

## Checklist

- [ ] All I/O operations use async/await or promises
- [ ] Environment variables validated at startup
- [ ] Graceful shutdown handlers for SIGTERM/SIGINT
- [ ] Global unhandledRejection and uncaughtException handlers
- [ ] Error codes and messages follow conventions
- [ ] File paths use path.join() for cross-platform compatibility
- [ ] Streams used for large files or data
- [ ] Child processes cleaned up on exit
- [ ] Health check endpoint implemented (for services)
- [ ] Process memory usage monitored (for long-running processes)

---

## Example

```typescript
// server.ts - Complete Node.js HTTP server with best practices
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

// Configuration from environment
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  dataDir: process.env.DATA_DIR || './data',
};

// HTTP server
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  try {
    const filePath = path.join(config.dataDir, 'data.json');
    const data = await fs.readFile(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
});

server.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => process.emit('SIGTERM' as any));

// Global error handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

---

## Resources

- https://nodejs.org/en/docs/ - Official Node.js documentation
- https://nodejs.org/api/process.html - Process object API
- https://nodejs.org/api/stream.html - Streams API
- [express](../express/SKILL.md) - Express.js framework
- [nest](../nest/SKILL.md) - NestJS framework
- [hono](../hono/SKILL.md) - Hono framework
- [typescript](../typescript/SKILL.md) - TypeScript patterns for Node.js
- [architecture-patterns](../architecture-patterns/SKILL.md) - Backend architectural patterns
