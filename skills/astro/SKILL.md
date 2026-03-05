---
name: astro
description: "Fast static sites with SSG/SSR and component islands. Trigger: When building Astro websites, implementing islands, or configuring SSG/SSR."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: framework
  skills:
    - react
    - typescript
  dependencies:
    astro: ">=5.0.0 <6.0.0"
    typescript: ">=5.0.0 <6.0.0"
    react: ">=18.0.0 <19.0.0"
---

# Astro

Fast sites with SSG/SSR, minimal JS, TypeScript, and client island architecture.

> Client island examples use React (`@astrojs/react`). For Vue, Svelte, or Solid islands, replace `<ReactComp client:load />` with your framework's component — the directive syntax (`client:load`, `client:visible`, `client:idle`) is identical.

## When to Use

- Static sites (SSG), server-rendered (SSR), or hybrid
- Content-focused sites (blogs, docs, marketing)
- Partial hydration with islands

Don't use for:

- Full SPAs (use react)
- Client-heavy apps with constant state
- Real-time dashboards with WebSockets

---

## Critical Patterns

### ✅ REQUIRED: Detect Project Type First

Check `astro.config.mjs` for project type before coding.

```javascript
// SSG-only (no adapter) -- default
export default defineConfig({ output: 'static' });

// SSR (has adapter)
export default defineConfig({ output: 'server', adapter: node() });

// Hybrid (SSG default, opt-in SSR per page)
export default defineConfig({ output: 'hybrid', adapter: node() });

// WRONG: Using SSR patterns (prerender: false, Astro.locals) in SSG-only project
```

### ✅ REQUIRED: Use .astro Components by Default

```astro
---
interface Props { title: string; }
const { title } = Astro.props;
---
<h1>{title}</h1>

<!-- WRONG: React for static content (unnecessary JS) -->
<!-- <ReactHeader title={title} client:load /> -->
```

### ✅ REQUIRED: Client Directives Sparingly

```astro
<!-- CORRECT: Only interactive components get JS -->
<Counter client:load />
<StaticContent /> <!-- No directive = zero JS -->

<!-- WRONG: Everything hydrated -->
<Header client:load />
<Footer client:load />
```

### ✅ REQUIRED: getStaticPaths for Dynamic Routes (SSG)

```typescript
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
```

### ✅ REQUIRED: SSR with prerender: false

```astro
---
export const prerender = false; // Requires adapter
const user = Astro.locals.user;
const data = await fetchUserData(user.id);
---
<h1>Welcome, {user.name}</h1>
```

### ✅ REQUIRED: Configure Output Mode

```javascript
// astro.config.mjs
// SSG (default): all pages pre-rendered at build
export default defineConfig({ output: 'static' });
// SSR: all pages server-rendered
export default defineConfig({ output: 'server', adapter: node() });
// Hybrid: SSG default, opt-in SSR per page
export default defineConfig({ output: 'hybrid', adapter: node() });
```

---

## Decision Tree

- **No adapter (SSG-only)?** -> Read [ssg-patterns.md](references/ssg-patterns.md)
- **Has adapter + output: 'server'?** -> Read [ssr-patterns.md](references/ssr-patterns.md)
- **Has adapter + output: 'hybrid'?** -> Read [hybrid-strategies.md](references/hybrid-strategies.md)
- **Adding interactivity?** -> Read [client-directives.md](references/client-directives.md)
- **Managing content (blog, docs)?** -> Read [content-collections.md](references/content-collections.md)
- **Building forms?** -> Read [actions.md](references/actions.md)
- **Smooth page transitions or faster navigation?** -> Read [client-navigation.md](references/client-navigation.md)
- **Auth or request logging?** -> Read [middleware.md](references/middleware.md)
- **API keys or secrets?** -> Read [env-variables.md](references/env-variables.md)
- **Dynamic routes with known paths?** -> `getStaticPaths` (SSG)
- **Dynamic routes with user data?** -> `prerender: false` (SSR)
- **Immediate interaction?** -> `client:load`
- **Below fold interaction?** -> `client:visible`
- **Non-critical interaction?** -> `client:idle`

---

## Example

### SSG Blog Post

```astro
---
// src/pages/blog/[slug].astro
interface Props { post: { title: string; content: string }; }
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}
const { post } = Astro.props;
---
<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
</article>
```

### SSR Dashboard

```astro
---
// src/pages/dashboard.astro
export const prerender = false;
const user = Astro.locals.user;
const data = await fetchUserData(user.id);
---
<h1>Welcome, {user.name}</h1>
<p>Last login: {data.lastLogin}</p>
```

### Hybrid Config

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
});
// index.astro -> SSG (default)
// profile.astro -> SSR (export const prerender = false)
```

---

## Edge Cases

- **SSG-only errors**: No adapter → `prerender: false`/`Astro.locals`/POST fail build.
- **SSR needs adapter**: Install adapter (node/vercel/netlify) for `output: 'server'`/`'hybrid'`.
- **getStaticPaths in SSR**: Skip when `prerender: false` (routes render on request).
- **Hybrid default**: Pages default SSG; set `prerender: false` only for SSR.
- **Env variables**: `PUBLIC_` prefix for client-side, no prefix for server.
- **Client directives**: Work in both SSG and SSR.
- **Migration SSG→SSR**: Install adapter, set output `'hybrid'`, add `prerender: false` per page.
- **Architecture**: Apply Clean Architecture/SOLID only with complex server logic. See [architecture-patterns SKILL.md](../architecture-patterns/SKILL.md).

---

## Checklist

- [ ] Project type detected from `astro.config.mjs` before writing code
- [ ] `.astro` components used by default; React only for interactivity
- [ ] Client directives used sparingly (`client:load`, `client:visible`, `client:idle`)
- [ ] `getStaticPaths` used for dynamic SSG routes
- [ ] `prerender: false` only on SSR pages with adapter installed
- [ ] Semantic HTML with proper heading hierarchy
- [ ] Minimal runtime JavaScript

---

## Resources

- [references/](references/README.md) -- SSG, SSR, hybrid, client directives, content, actions, middleware, client navigation, env
- https://docs.astro.build/
- https://docs.astro.build/en/guides/client-side-scripts/
