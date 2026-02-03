# Hybrid Strategies (SSG + SSR)

> Mixing static and dynamic rendering, migration paths, and per-page decisions

## When to Read This

- Combining static and dynamic pages in one project
- Migrating from SSG-only to Hybrid
- Deciding which pages should be SSG vs SSR
- Optimizing performance with mixed rendering

---

## Hybrid Mode Setup

```javascript
// astro.config.mjs
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid", // Default to SSG, opt-in to SSR
  adapter: node({ mode: "standalone" }), // Adapter REQUIRED
});
```

**Key difference from SSR mode:**

- `output: 'server'` → All pages SSR by default, opt-in to SSG with `prerender: true`
- `output: 'hybrid'` → All pages SSG by default, opt-in to SSR with `prerender: false`

---

## Decision Matrix

| Page Type                 | Rendering | Reason                             |
| ------------------------- | --------- | ---------------------------------- |
| Homepage, About, Pricing  | **SSG**   | Static content, rarely changes     |
| Blog posts, Documentation | **SSG**   | Content-driven, many pages, SEO    |
| Dashboard, Profile        | **SSR**   | User-specific data, auth required  |
| Admin panel               | **SSR**   | Real-time data, permissions        |
| Search results            | **SSR**   | Dynamic queries                    |
| Product catalog           | **SSG**   | Static product data, many SKUs     |
| Cart, Checkout            | **SSR**   | User-specific, real-time inventory |

---

## Hybrid Patterns

### ✅ Static Homepage with Dynamic Dashboard

```astro
// src/pages/index.astro (SSG by default)
---
const posts = await getPosts(); // Fetched at build time
---
<h1>Welcome</h1>
{posts.map(p => <article>{p.title}</article>)}
```

```astro
// src/pages/dashboard.astro (SSR opt-in)
---
export const prerender = false; // Enable SSR for this page

const user = Astro.locals.user;
if (!user) return Astro.redirect('/login');

const data = await fetchUserData(user.id); // Fetched per-request
---
<h1>Welcome, {user.name}</h1>
```

### ✅ Static Blog with Dynamic Search

```astro
// src/pages/blog/[slug].astro (SSG)
---
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
---
```

```astro
// src/pages/search.astro (SSR)
---
export const prerender = false;

const query = Astro.url.searchParams.get('q');
const results = query ? await searchPosts(query) : [];
---
<form method="GET">
  <input name="q" value={query} />
  <button>Search</button>
</form>
{results.map(r => <div>{r.title}</div>)}
```

---

## Migration from SSG to Hybrid

### Step 1: Install Adapter

```bash
npm install @astrojs/node
```

### Step 2: Update Config

```javascript
// astro.config.mjs
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid", // Change from 'static'
  adapter: node(),
});
```

### Step 3: Identify Dynamic Pages

Mark pages that need SSR:

```astro
---
// Pages that need SSR
export const prerender = false;

// All other pages remain SSG (no change needed)
---
```

### Step 4: Update API Routes

```typescript
// Before (SSG): Static JSON generation
export const GET: APIRoute = async () => {
  const data = await fetchData();
  return new Response(JSON.stringify(data));
};

// After (Hybrid): Can handle dynamic requests
export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user; // Now available
  const data = await fetchUserData(user.id);
  return new Response(JSON.stringify(data));
};
```

---

## Performance Optimization

### ✅ Maximize SSG Usage

```astro
---
// ✅ GOOD: Static pages for most content
export async function getStaticPaths() {
  const pages = await getAllPages();
  return pages.map(page => ({
    params: { slug: page.slug },
  }));
}
---
```

### ✅ Minimize SSR Usage

```astro
---
// ✅ GOOD: SSR only for truly dynamic pages
export const prerender = false;

// Check if page can be static
if (!requiresDynamicData) {
  // Consider making this SSG instead
}
---
```

### ✅ Cache SSR Responses

```typescript
// src/pages/api/trending.ts
export const GET: APIRoute = async () => {
  const data = await getExpensiveData();

  return new Response(JSON.stringify(data), {
    headers: {
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
    },
  });
};
```

---

## Common Patterns

### ✅ Partial Hydration with SSG

```astro
---
// SSG page with interactive components
const staticData = await getStaticData();
---

<div>
  <h1>{staticData.title}</h1>
  <!-- Static HTML -->

  <SearchWidget client:load />
  <!-- Interactive component -->
</div>
```

### ✅ API Routes in Hybrid

```typescript
// Static endpoint (no prerender directive)
// src/pages/api/posts.json.ts
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts));
};

// Dynamic endpoint
// src/pages/api/user/profile.json.ts
export const prerender = false; // SSR required

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  const profile = await getUserProfile(user.id);
  return new Response(JSON.stringify(profile));
};
```

---

## Edge Cases

### ⚠️ Mixed Data Sources

```astro
---
// Hybrid page: Static data + Dynamic data
export const prerender = false;

// Static data (could be from build-time)
const categories = await getCategories(); // Could cache this

// Dynamic data (per-request)
const user = Astro.locals.user;
const recommendations = user ? await getRecommendations(user.id) : [];
---

<div>
  <nav>
    {categories.map(c => <a href={`/category/${c.slug}`}>{c.name}</a>)}
  </nav>

  {recommendations.length > 0 && (
    <section>
      <h2>Recommended for you</h2>
      {recommendations.map(r => <article>{r.title}</article>)}
    </section>
  )}
</div>
```

### ⚠️ Environment Variables

```astro
---
// SSG pages: Only build-time and PUBLIC_ vars
const buildTime = import.meta.env.BUILD_TIME;
const publicApi = import.meta.env.PUBLIC_API_URL;

// SSR pages: All vars available
export const prerender = false;
const dbUrl = import.meta.env.DATABASE_URL; // ✅ Available in SSR
const secret = import.meta.env.API_SECRET; // ✅ Available in SSR
---
```

---

## Best Practices

1. **Default to SSG**: Use SSG for most pages, SSR only when necessary
2. **Profile performance**: Measure SSR response times, optimize or cache
3. **Separate concerns**: Keep static content in SSG, dynamic data in SSR
4. **Use client directives**: Add interactivity to SSG pages without SSR
5. **Cache aggressively**: Use HTTP caching for SSR endpoints
6. **Monitor costs**: SSR uses server resources, SSG is essentially free

---

## References

- [Astro Hybrid Rendering](https://docs.astro.build/en/guides/server-side-rendering/#hybrid-rendering)
- [On-Demand Rendering](https://docs.astro.build/en/guides/server-side-rendering/#opting-in-to-pre-rendering-in-server-mode)
