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

## 📚 Extended Mandatory Read Protocol

**This skill has a `references/` directory with detailed guides for rendering strategies, content, and interactivity.**

### Reading Rules

**Read references/ when:**

- **MUST read [ssg-patterns.md](references/ssg-patterns.md)** when:
  - Building static sites (no adapter)
  - Using getStaticPaths for dynamic routes
  - Fetching data at build time

- **MUST read [ssr-patterns.md](references/ssr-patterns.md)** when:
  - Building dynamic pages with user-specific data
  - Using Astro.locals, server endpoints
  - Implementing authentication

- **MUST read [hybrid-strategies.md](references/hybrid-strategies.md)** when:
  - Combining SSG + SSR in same project
  - Migrating from SSG to Hybrid
  - Deciding which pages should be static vs dynamic

- **MUST read [client-directives.md](references/client-directives.md)** when:
  - Adding interactivity to static pages
  - Choosing load/visible/idle/only strategies
  - Optimizing JavaScript bundle size

- **CHECK [content-collections.md](references/content-collections.md)** when:
  - Managing blog posts, documentation
  - Type-safe content with schemas

- **CHECK [actions.md](references/actions.md)** when:
  - Handling form submissions
  - Server-side validation

**Quick reference only:** Use this SKILL.md for project type detection and quick decisions. Decision Tree below directs you to specific references.

### Reading Priority

| Situation                | Read This                           | Why                            |
| ------------------------ | ----------------------------------- | ------------------------------ |
| Static site (no adapter) | **ssg-patterns.md** (REQUIRED)      | 50+ SSG-specific patterns      |
| Dynamic site (adapter)   | **ssr-patterns.md** (REQUIRED)      | Authentication, server context |
| Mixing SSG + SSR         | **hybrid-strategies.md** (REQUIRED) | Decision matrix, migration     |
| Adding interactivity     | **client-directives.md** (REQUIRED) | 6 hydration strategies         |
| Content management       | **content-collections.md** (CHECK)  | Type-safe schemas              |
| Form handling            | **actions.md** (CHECK)              | Server validation              |

**See [references/README.md](references/README.md)** for complete navigation guide.

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

**First: CHECK astro.config.mjs** → Identify project type. **MUST read** corresponding reference file.

**No adapter (SSG-only)?** → **MUST read [ssg-patterns.md](references/ssg-patterns.md)** for getStaticPaths, build-time data fetching, pagination.

**Has adapter + output: 'server'?** → **MUST read [ssr-patterns.md](references/ssr-patterns.md)** for Astro.locals, server endpoints, authentication.

**Has adapter + output: 'hybrid'?** → **MUST read [hybrid-strategies.md](references/hybrid-strategies.md)** for SSG vs SSR decision matrix, then check both ssg-patterns.md and ssr-patterns.md as needed.

**Adding interactivity?** → **MUST read [client-directives.md](references/client-directives.md)** to choose: client:load (immediate), client:visible (lazy), client:idle (low priority), client:only (CSR), or no directive (static).

**Managing content (blog, docs)?** → **CHECK [content-collections.md](references/content-collections.md)** for type-safe schemas and querying.

**Building forms?** → **CHECK [actions.md](references/actions.md)** for server-side validation and progressive enhancement.

**Need smooth page transitions?** → **CHECK [view-transitions.md](references/view-transitions.md)** for animations, lifecycle events, and accessibility.

**Need authentication or request logging?** → **CHECK [middleware.md](references/middleware.md)** for auth, redirects, and request interception.

**Need to manage API keys or secrets?** → **CHECK [env-variables.md](references/env-variables.md)** for .env files, PUBLIC\_ prefix, and security.

**Want faster navigation?** → **CHECK [prefetch.md](references/prefetch.md)** for hover, tap, viewport, and load strategies.

**Static content that rarely changes?** → Use SSG. See [ssg-patterns.md](references/ssg-patterns.md).

**Content needs fresh data on every request?** → Use SSR with prerender: false. See [ssr-patterns.md](references/ssr-patterns.md).

**Dynamic routes with pre-known paths?** → Use getStaticPaths (SSG). See [ssg-patterns.md#getstaticpaths-for-dynamic-routes](references/ssg-patterns.md#getstaticpaths-for-dynamic-routes).

**Dynamic routes with user-specific data?** → Use SSR with prerender: false. See [ssr-patterns.md#database-queries](references/ssr-patterns.md#database-queries).

**Immediately visible interaction?** → Use client:load. See [client-directives.md#clientload-immediate](references/client-directives.md#clientload-immediate).

**Below fold interaction?** → Use client:visible. See [client-directives.md#clientvisible-lazy-load](references/client-directives.md#clientvisible-lazy-load).

**Non-critical interaction?** → Use client:idle. See [client-directives.md#clientidle-low-priority](references/client-directives.md#clientidle-low-priority).

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
