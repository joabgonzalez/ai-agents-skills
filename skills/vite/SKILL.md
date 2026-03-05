---
name: vite
description: "Fast build tool with HMR for modern web development. Trigger: When configuring Vite, setting up dev server, or optimizing builds."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: tooling
  dependencies:
    vite: ">=5.0.0 <6.0.0"
---

# Vite

Fast build with native ES modules, HMR. Config, plugins, env vars, optimization.

## When to Use

- Setting up Vite build tool for modern web apps
- Configuring dev server with HMR
- Optimizing build performance and bundle size
- Using Vite plugins (React, Vue, etc.)
- Configuring environment variables

Don't use for:

- Webpack config (webpack skill)
- Legacy builds

---

## Critical Patterns

### ✅ REQUIRED: Use defineConfig

```typescript
// ✅ CORRECT: Type-safe config
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});

// ❌ WRONG: Plain object (no types)
export default {
  plugins: [react()],
};
```

### ✅ REQUIRED: Environment Variables with VITE\_ Prefix

```typescript
// ✅ CORRECT: VITE_ prefix
// .env
VITE_API_URL=https://api.example.com

// Access in code
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ WRONG: No prefix (won't be exposed)
API_URL=https://api.example.com // Not exposed
```

### ✅ REQUIRED: Use Plugins for Framework Support

```typescript
// ✅ CORRECT: Framework plugin
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

---

## Conventions

### Vite Specific

- Configure vite.config for project needs
- Use environment variables with VITE\_ prefix
- Optimize build output
- Configure plugins properly
- Use static asset handling

---

## Decision Tree

**React project?** → Install and use `@vitejs/plugin-react`.

**Vue project?** → Use `@vitejs/plugin-vue`.

**Need path aliases?** → Configure `resolve.alias` in vite.config.

**Custom dev server port?** → Set `server.port`.

**Proxy API calls?** → Configure `server.proxy` to avoid CORS.

**Slow build?** → Check bundle size, use dynamic imports, optimize dependencies.

**Environment-specific config?** → Use `mode` parameter or separate config files.

---

## Example

vite.config.ts:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

---

## Edge Cases

**CommonJS deps:** Use `optimizeDeps.include` to pre-bundle.

**Global vars:** `define` option replaces constants at build.

**Static assets:** `public/` copied as-is, imports processed/hashed.

**Base path:** Set `base` for subdirectory deploy.

**CSS splitting:** Auto-splits CSS. `build.cssCodeSplit: false` combines.

---

## Resources

- https://vitejs.dev/guide/
- https://vitejs.dev/config/
