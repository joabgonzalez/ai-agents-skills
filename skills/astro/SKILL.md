---
name: astro
description: Building fast, optimized websites using Astro with TypeScript and optional React islands. SSG, SSR, partial hydration, component islands. Trigger: When building Astro websites, implementing component islands, or configuring SSG/SSR.
skills:
  - conventions
  - a11y
  - react
  - typescript
dependencies:
  astro: ">=5.0.0 <6.0.0"
  typescript: ">=5.0.0 <6.0.0"
  react: ">=18.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Astro Skill

## Overview

This skill provides guidance for building static sites with Astro, focusing on SSG patterns, minimal JavaScript, proper directive usage, and integration with React islands.

## Objective

Enable developers to build fast, optimized static sites using Astro with proper TypeScript support, minimal runtime JavaScript, and effective use of client directives for interactivity.

---

## When to Use

Use this skill when:

- Building static websites with SSG (Static Site Generation)
- Creating server-rendered sites with SSR (Server-Side Rendering)
- Implementing hybrid SSG + SSR approaches
- Creating content-focused sites (blogs, documentation, marketing)
- Implementing partial hydration with component islands
- Using React/Vue/Svelte components selectively
- Optimizing for performance and minimal JavaScript
- Building with dynamic data that needs server rendering

Don't use this skill for:

- Full SPA applications (use react or vue directly)
- Highly dynamic, client-heavy apps requiring constant client state
- Real-time dashboards with WebSocket connections

---

## Critical Patterns

### ✅ REQUIRED: Detect Project Type First

```javascript
// Check astro.config.mjs to understand project type:

// ✅ SSG-only project (no adapter)
export default defineConfig({
  output: 'static', // or omit (default)
  // No adapter = SSG-only project
});

// ✅ SSR project (has adapter)
export default defineConfig({
  output: 'server',
  adapter: node(), // Adapter present = SSR capable
});

// ✅ Hybrid project (has adapter + hybrid mode)
export default defineConfig({
  output: 'hybrid',
  adapter: node(), // Can do both SSG and SSR
});

// ❌ WRONG: Using SSR patterns in SSG-only project
// If no adapter in config, DON'T use:
// - export const prerender = false
// - Astro.locals
// - Server endpoints with POST/PUT/DELETE
```

### ✅ REQUIRED: Use .astro Components by Default

```astro
<!-- ✅ CORRECT: Astro component for static content -->
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<h1>{title}</h1>

<!-- ❌ WRONG: React for static content (unnecessary JS) -->
<ReactHeader title={title} client:load />
```

### ✅ REQUIRED: Use Client Directives Sparingly

```astro
<!-- ✅ CORRECT: Only interactive components get JS -->
<Counter client:load />
<StaticContent /> <!-- No directive = no JS -->

<!-- ❌ WRONG: Everything hydrated -->
<Header client:load />
<Footer client:load />
<StaticText client:load />
```

### ✅ REQUIRED: Use getStaticPaths for Dynamic Routes (SSG)

```typescript
// ✅ CORRECT: Pre-render all routes at build time (SSG)
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
```

### ✅ CHOOSE: SSG vs SSR Based on Project Type and Data Freshness

```typescript
// ✅ SSG-only project (output: 'static', no adapter)
// ONLY use these patterns:

// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
// All data fetched at build time

// ❌ WRONG in SSG-only: Using SSR-only features
// export const prerender = false; // ERROR: No adapter installed
// const user = Astro.locals.user; // ERROR: Only works in SSR

// ✅ SSR project (output: 'server', has adapter)
// src/pages/dashboard.astro
export const prerender = false; // Valid: adapter installed

const user = Astro.locals.user; // Access server context
const data = await fetchUserData(user.id); // Fetch on each request

// ✅ Hybrid project (output: 'hybrid', has adapter)
// Default pages are SSG (fast), opt-in to SSR when needed
// src/pages/index.astro → SSG (no prerender declaration)
// src/pages/profile.astro → SSR (export const prerender = false)

// ❌ WRONG: SSR for static content (wastes server resources)
export const prerender = false; // Don't do this for blogs/static pages
```

### ✅ REQUIRED: Configure Output Mode Correctly

```javascript
// astro.config.mjs

// ✅ SSG (default): Static site, all pages pre-rendered
export default defineConfig({
  output: 'static', // or omit (default)
});

// ✅ SSR: Server-side rendering for all pages
export default defineConfig({
  output: 'server',
  adapter: node(), // Requires adapter: node, vercel, netlify, etc.
});

// ✅ HYBRID: SSG by default, opt-in to SSR per page
export default defineConfig({
  output: 'hybrid',
  adapter: node(),
});
```

---

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to a11y for:

- Semantic HTML
- Keyboard navigation
- ARIA usage

### Astro Specific

- Prefer static rendering over client-side JavaScript
- Use client directives appropriately (client:load, client:visible, client:idle)
- Keep components in `.astro` format when possible
- Use React/Vue/Svelte only when client interactivity is needed
- Leverage Astro's built-in optimizations (image optimization, CSS bundling)

---

## Decision Tree

**First: Check astro.config.mjs** → Identify project type (SSG-only, SSR, or Hybrid).

**SSG-only project (no adapter)?** → Use ONLY: `getStaticPaths()`, build-time data fetching. DON'T use: `prerender: false`, `Astro.locals`, server endpoints.

**SSR project (output: 'server')?** → All pages render on request. Use: `Astro.locals`, server endpoints, `prerender: true` to opt-in to SSG.

**Hybrid project (output: 'hybrid')?** → Default to SSG, use `prerender: false` only for pages needing fresh data.

**Static content that rarely changes?** → Use SSG with `getStaticPaths()` (if dynamic) or static pages.

**Content needs to be fresh on every request?** → Use SSR with `prerender: false` (only if adapter installed).

**Dynamic routes with pre-known paths?** → Use `getStaticPaths()` for SSG.

**Dynamic routes with user-specific data?** → Use SSR with `prerender: false` (requires adapter).

**Static content component?** → Use `.astro` component, no client directive.

**Interactive component?** → Use framework component (React/Vue) with appropriate client directive.

**Immediately visible interaction?** → Use `client:load`.

**Below fold interaction?** → Use `client:visible` for lazy loading.

**Non-critical interaction?** → Use `client:idle` to wait for main thread.

**Framework-specific component?** → Use `client:only="react"` (no SSR).

**Shared state?** → Use `nanostores` for framework-agnostic state management.

---

## Example

### SSG (Static Site Generation)

```astro
---
// src/pages/blog/[slug].astro
interface Props {
  post: { title: string; content: string };
}

// Pre-render all blog posts at build time
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
</article>
```

### SSR (Server-Side Rendering)

```astro
---
// src/pages/dashboard.astro
export const prerender = false; // Enable SSR for this page

// Access server context (user session, cookies, etc.)
const user = Astro.locals.user;

// Fetch fresh data on each request
const data = await fetchUserData(user.id);
---

<div>
  <h1>Welcome, {user.name}</h1>
  <p>Last login: {data.lastLogin}</p>
</div>
```

### Hybrid (SSG + SSR)

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid", // SSG by default, opt-in SSR per page
  adapter: node({ mode: "standalone" }),
});
```

```astro
---
// src/pages/index.astro (SSG, pre-rendered)
const posts = await getPosts(); // Fetched at build time
---
<h1>Latest Posts</h1>
{posts.map(p => <article>{p.title}</article>)}

---
// src/pages/profile.astro (SSR, rendered on request)
export const prerender = false;
const user = Astro.locals.user; // Server-only data
---
<h1>{user.name}'s Profile</h1>
```

## Edge Cases

**Detect project type:** Check `astro.config.mjs` for `output` mode and adapter presence before suggesting SSR solutions.

**SSG-only project errors:** If no adapter, avoid `prerender: false`, `Astro.locals`, `Astro.request.method === 'POST'`. These cause build errors.

**SSR requires adapter:** Install adapter (node, vercel, netlify) when using `output: 'server'` or `output: 'hybrid'`. Cannot use SSR features without adapter.

**getStaticPaths in SSR:** Not needed when `prerender: false` (SSR mode) since routes render on request. Only use in SSG pages.

**Hybrid default behavior:** Pages without `prerender` declaration default to SSG. Explicitly set `prerender: false` only for SSR pages.

**Environment variables:** Use `PUBLIC_` prefix for client-side vars, no prefix for server-only (SSR) vars. SSG-only projects only use build-time vars.

**Client directives work everywhere:** `client:load`, `client:visible`, etc. work in both SSG and SSR projects. Only hydration strategy.

**Build vs runtime errors:** SSG errors appear at build time, SSR errors appear at request time. Test SSR pages locally with `npm run dev`.

**Migration SSG → SSR:** Install adapter, change `output` to `'hybrid'` or `'server'`, add `prerender: false` to specific pages only.

## References

- https://docs.astro.build/
- https://docs.astro.build/en/guides/client-side-scripts/
