---
name: vite
description: Vite build tool and dev server for fast modern web development.
skills:
  - conventions
dependencies:
  vite: ">=5.0.0 <6.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Vite Skill

## Overview

Fast build tool and development server with native ES modules and hot module replacement.

## Objective

Configure and optimize Vite for modern web development with fast builds and excellent developer experience.

## Conventions

Refer to conventions for:

- Project structure

### Vite Specific

- Configure vite.config for project needs
- Use environment variables with VITE\_ prefix
- Optimize build output
- Configure plugins properly
- Use static asset handling

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

## References

- https://vitejs.dev/guide/
- https://vitejs.dev/config/
