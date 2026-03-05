---
name: bun
description: "Fast JavaScript/TypeScript runtime with bundling and testing. Trigger: When using Bun for server apps, scripts, or tooling."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: language
  dependencies:
    bun: ">=1.0.0 <2.0.0"
---
# Bun

Fast JS/TS runtime with native bundling, testing, package management.

## When to Use

- Running JS/TS apps that benefit from fast startup and native TS support
- Using Bun's built-in bundler, test runner, or package manager
- Writing HTTP servers, scripts, or CLI tools
- Don't use for: full Node.js API compat, native C++ addons, LTS stability

---

## Critical Patterns

### ✅ REQUIRED: Bun.serve() for HTTP Servers

Built-in HTTP with streaming, no framework needed.

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

### ✅ REQUIRED: Bun.file() for File I/O

Native file API with lazy `BunFile` for fast I/O.

```typescript
// CORRECT: Bun-native file operations
const file = Bun.file('./config.json');
const config = await file.json();
await Bun.write('./output.txt', 'Hello from Bun');
// WRONG: Node fs/promises in a Bun project
import { readFile } from 'fs/promises';
```

### ✅ REQUIRED: bun:test for Testing

Jest-compatible test runner, no install/config.

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

### ✅ REQUIRED: bunx for Package Execution

Run npm binaries without install (like npx, faster).

```bash
bunx tsc --noEmit
bunx prettier --write src/
bunx drizzle-kit generate
```

### ✅ REQUIRED: Workspace Configuration

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

### ✅ REQUIRED: Bun.spawn() for Shell Commands

Spawn child processes with native API -- faster than Node's `child_process`.

```typescript
// CORRECT: Bun-native process spawning
const proc = Bun.spawn(['git', 'status'], {
  stdout: 'pipe',
  stderr: 'pipe',
});

const output = await new Response(proc.stdout).text();
console.log(output);

// Alternative: Template literal syntax (shell $)
import { $ } from 'bun';
const result = await $`git status`;
console.log(result.stdout.toString());

// WRONG: Node's child_process (slower, requires import)
import { exec } from 'child_process';
exec('git status', (err, stdout) => console.log(stdout));
```

### ✅ REQUIRED: Plugin System for Custom Loaders

Extend Bun's bundler with plugins for custom file types.

```typescript
import type { BunPlugin } from 'bun';

const myPlugin: BunPlugin = {
  name: 'yaml-loader',
  setup(build) {
    build.onLoad({ filter: /\.yaml$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      const yaml = parseYAML(text); // Your YAML parser
      return {
        contents: `export default ${JSON.stringify(yaml)}`,
        loader: 'js',
      };
    });
  },
};

// Use in build
await Bun.build({
  entrypoints: ['./index.ts'],
  plugins: [myPlugin],
});
```

### ✅ REQUIRED: WebSockets with Bun.serve()

Native WebSocket support in HTTP server with zero dependencies.

```typescript
Bun.serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      if (server.upgrade(req)) return; // Upgrade to WebSocket
      return new Response('Upgrade failed', { status: 400 });
    }
    return new Response('Not found', { status: 404 });
  },
  websocket: {
    message(ws, message) {
      console.log('Received:', message);
      ws.send(`Echo: ${message}`);
    },
    open(ws) {
      console.log('Client connected');
    },
    close(ws) {
      console.log('Client disconnected');
    },
  },
});
```

---

## Decision Tree

- Simple HTTP service? -> `Bun.serve()` with no framework
- Reading/writing files? -> `Bun.file()` and `Bun.write()`
- Running tests? -> `bun test` (Jest-compatible, zero config)
- One-off package binary? -> `bunx <package>`
- Bundling for production? -> `bun build --target=browser` or `--target=bun`
- Monorepo? -> Configure `workspaces` in root `package.json`
- Node API not supported? -> Check compatibility docs; fall back to Node
- Shell scripting? -> `Bun.spawn()` or `Bun.$` tagged template

---

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

---

## Edge Cases

- **Node.js API gaps**: Some built-ins (`vm`, `worker_threads`) partial. Check [compat docs](https://bun.sh/docs/runtime/nodejs-apis).

- **Native modules**: C++ addons may not load. Use `bun:ffi` or WASM.

- **Watch modes**: `--watch` restarts process, `--hot` enables HMR (experimental).

- **Environment vars**: `Bun.env.VAR_NAME` or `process.env`. `.env` auto-loads.

- **Large files**: `Bun.file()` is lazy. Stream with `new Response(file)`.

- **TS transpilation**: On-the-fly, no type-check. Use `bunx tsc --noEmit` in CI.

- **Package resolution**: Aggressive caching. Try `bun install --force` if issues.

- **Port conflicts**: Bun crashes if port in use. Handle with try/catch.

- **Test isolation**: Same process by default. Use `--preload` or `--bail`.

- **Build targets**: `--target=bun` (Bun only), `--target=node` (Node), `--target=browser` (client).

---

## Checklist

- [ ] Use `Bun.serve()` for simple HTTP services instead of frameworks
- [ ] Use `Bun.file()` / `Bun.write()` instead of `fs`
- [ ] Tests use `bun:test` with no external runner
- [ ] Scripts use `bun run` instead of `npm run`
- [ ] Production builds use `bun build` with correct `--target`
- [ ] Node API compatibility verified for imported modules

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun API Reference](https://bun.sh/docs/api/http)
- [Bun Node.js Compatibility](https://bun.sh/docs/runtime/nodejs-apis)
