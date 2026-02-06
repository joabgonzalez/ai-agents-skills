---
name: bun
description: "Fast JavaScript/TypeScript runtime with bundling and testing. Trigger: When using Bun for server apps, scripts, or tooling."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    bun: ">=1.0.0 <2.0.0"
---
# Bun Skill
All-in-one JavaScript/TypeScript runtime with native bundling, testing, and package management optimized for speed.
## When to Use
- Running JS/TS apps that benefit from fast startup and native TS support
- Using Bun's built-in bundler, test runner, or package manager
- Writing HTTP servers, scripts, or CLI tools
- Don't use for: projects needing full Node.js API compatibility, native C++ addons, LTS stability guarantees
## Critical Patterns
### Bun.serve() for HTTP Servers
Built-in HTTP server with streaming -- no framework needed for simple services.
```typescript
// CORRECT: zero-dependency HTTP with Bun.serve
Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/health') return Response.json({ ok: true });
    return new Response('Not found', { status: 404 });
  },
});
// WRONG: importing express just for a simple endpoint
import express from 'express';
```
### Bun.file() for File I/O
Native file API with lazy `BunFile` references for fast reads and writes.
```typescript
// CORRECT: Bun-native file operations
const file = Bun.file('./config.json');
const config = await file.json();
await Bun.write('./output.txt', 'Hello from Bun');
// WRONG: Node fs/promises in a Bun project
import { readFile } from 'fs/promises';
```
### bun:test for Testing
Jest-compatible test runner built into the runtime -- no install, no config.
```typescript
import { test, expect, describe, mock } from 'bun:test';
describe('math utils', () => {
  test('adds numbers', () => {
    expect(2 + 3).toBe(5);
  });
  test('mocks fetch', async () => {
    const fn = mock(() => Response.json({ ok: true }));
    globalThis.fetch = fn;
    const res = await fetch('/api');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```
### bunx for Package Execution
Run any npm package binary without global install -- like npx but faster.
```bash
bunx tsc --noEmit
bunx prettier --write src/
bunx drizzle-kit generate
```
### Workspace Configuration
Monorepo support via npm-style workspaces in `package.json`.
```json
{
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "bun run --filter './apps/*' dev",
    "test": "bun test --recursive"
  }
}
```
## Decision Tree
- Simple HTTP service? -> `Bun.serve()` with no framework
- Reading/writing files? -> `Bun.file()` and `Bun.write()`
- Running tests? -> `bun test` (Jest-compatible, zero config)
- One-off package binary? -> `bunx <package>`
- Bundling for production? -> `bun build --target=browser` or `--target=bun`
- Monorepo? -> Configure `workspaces` in root `package.json`
- Node API not supported? -> Check compatibility docs; fall back to Node
- Shell scripting? -> `Bun.spawn()` or `Bun.$` tagged template
## Example
```typescript
// server.ts -- HTTP server with route map
const routes: Record<string, (req: Request) => Response | Promise<Response>> = {
  '/': () => new Response('Welcome to the Bun server'),
  '/health': () => Response.json({ status: 'ok' }),
  '/file': async () => {
    const file = Bun.file('./data.txt');
    if (await file.exists()) return new Response(file);
    return new Response('Not found', { status: 404 });
  },
};
Bun.serve({
  port: Number(Bun.env.PORT) || 3000,
  fetch(req) {
    const handler = routes[new URL(req.url).pathname];
    return handler ? handler(req) : new Response('Not found', { status: 404 });
  },
});
```
## Edge Cases
- **Node.js gaps**: Some built-ins (`vm`, `worker_threads`) have partial support -- check docs.
- **Native modules**: C++ addons for Node may not load; use Bun's FFI or WASM alternatives.
- **Hot reloading**: `bun --watch` for restart; `--hot` for HMR without restart.
- **Env variables**: `Bun.env.VAR_NAME` like `process.env`; `.env` loads automatically.
- **Large files**: `Bun.file()` is lazy -- stream into `new Response(file)` without buffering.
## Checklist
- [ ] Use `Bun.serve()` for simple HTTP services instead of frameworks
- [ ] Use `Bun.file()` / `Bun.write()` instead of `fs`
- [ ] Tests use `bun:test` with no external runner
- [ ] Scripts use `bun run` instead of `npm run`
- [ ] Production builds use `bun build` with correct `--target`
- [ ] Node API compatibility verified for imported modules
## Resources
- [Bun Documentation](https://bun.sh/docs)
- [Bun API Reference](https://bun.sh/docs/api/http)
- [Bun Node.js Compatibility](https://bun.sh/docs/runtime/nodejs-apis)
