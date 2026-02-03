# Static Site Generation (SSG) Patterns

> Build-time rendering, getStaticPaths, and static data fetching

## When to Read This

- Building static websites (blogs, documentation, marketing)
- Using getStaticPaths for dynamic routes
- Fetching data at build time
- No adapter installed (output: 'static')

---

## Project Detection

### ✅ Verify SSG-Only Project

```javascript
// astro.config.mjs
export default defineConfig({
  output: "static", // or omit (default)
  // NO adapter = SSG-only
});
```

**If you see an adapter (node, vercel, netlify)**, this is NOT SSG-only. See [ssr-patterns.md](ssr-patterns.md) or [hybrid-strategies.md](hybrid-strategies.md).

---

## getStaticPaths for Dynamic Routes

### ✅ Basic Dynamic Route

```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getPosts(); // Fetch at build time

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post }, // Pass data to component
  }));
}

interface Props {
  post: Post;
}

const { post } = Astro.props;
---

<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
</article>
```

### ✅ Multiple Parameters

```astro
---
// src/pages/[lang]/[category]/[slug].astro
export async function getStaticPaths() {
  const languages = ['en', 'es', 'fr'];
  const categories = await getCategories();
  const posts = await getPosts();

  const paths = [];

  for (const lang of languages) {
    for (const category of categories) {
      const categoryPosts = posts.filter(p => p.category === category);

      for (const post of categoryPosts) {
        paths.push({
          params: {
            lang,
            category,
            slug: post.slug,
          },
          props: { post },
        });
      }
    }
  }

  return paths;
}
---
```

### ✅ Fetching from API

```astro
---
export async function getStaticPaths() {
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();

  return posts.map((post) => ({
    params: { id: post.id.toString() },
    props: { post },
  }));
}
---
```

### ✅ Fetching from Database

```astro
---
import { db } from '../lib/db';

export async function getStaticPaths() {
  const products = await db.product.findMany();

  return products.map((product) => ({
    params: { id: product.id },
    props: { product },
  }));
}
---
```

---

## Pagination

### ✅ Built-in Pagination

```astro
---
// src/pages/blog/[...page].astro
export async function getStaticPaths({ paginate }) {
  const posts = await getPosts();

  // 10 posts per page
  return paginate(posts, { pageSize: 10 });
}

const { page } = Astro.props;
---

<div>
  {page.data.map((post) => (
    <article>
      <h2>{post.title}</h2>
    </article>
  ))}

  <nav>
    {page.url.prev && <a href={page.url.prev}>Previous</a>}
    <span>Page {page.currentPage} of {page.lastPage}</span>
    {page.url.next && <a href={page.url.next}>Next</a>}
  </nav>
</div>
```

### ✅ Custom Pagination Logic

```astro
---
export async function getStaticPaths() {
  const posts = await getPosts();
  const pageSize = 10;
  const pageCount = Math.ceil(posts.length / pageSize);

  return Array.from({ length: pageCount }, (_, i) => ({
    params: { page: (i + 1).toString() },
    props: {
      posts: posts.slice(i * pageSize, (i + 1) * pageSize),
      currentPage: i + 1,
      totalPages: pageCount,
    },
  }));
}
---
```

---

## Build-Time Data Fetching

### ✅ Top-Level Fetch

```astro
---
// Runs at build time (SSG)
const posts = await fetch('https://api.example.com/posts')
  .then(res => res.json());

const stats = await calculateStats(posts);
---

<div>
  <h1>Blog Statistics</h1>
  <p>Total posts: {stats.total}</p>
  <p>Published: {new Date().toISOString()}</p>
</div>
```

### ✅ Parallel Data Fetching

```astro
---
const [posts, authors, categories] = await Promise.all([
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/authors').then(r => r.json()),
  fetch('/api/categories').then(r => r.json()),
]);
---
```

### ✅ With Error Handling

```astro
---
let posts = [];
let error = null;

try {
  const response = await fetch('https://api.example.com/posts');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  posts = await response.json();
} catch (e) {
  error = e.message;
  console.error('Failed to fetch posts:', e);
}
---

{error ? (
  <div class="error">Failed to load posts</div>
) : (
  <ul>
    {posts.map(post => <li>{post.title}</li>)}
  </ul>
)}
```

---

## Static API Routes

### ✅ Generate JSON Endpoints

```typescript
// src/pages/api/posts.json.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const posts = await getPosts();

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
```

### ✅ Dynamic API Routes

```typescript
// src/pages/api/posts/[id].json.ts
export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { id: post.id },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const post = await getPostById(params.id);

  if (!post) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(post), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

---

## Environment Variables

### ✅ Build-Time Variables

```astro
---
// All env vars available at build time
const apiKey = import.meta.env.API_KEY;
const publicUrl = import.meta.env.PUBLIC_URL;

// PUBLIC_ vars are also available client-side
---

<script>
  const url = import.meta.env.PUBLIC_URL; // Available
  // const key = import.meta.env.API_KEY; // ERROR: Not available client-side
</script>
```

### ✅ Type-Safe Env Vars

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly API_KEY: string;
  readonly PUBLIC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Image Optimization

### ✅ Using Astro Image

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- Optimized at build time -->
<Image src={heroImage} alt="Hero" width={800} height={600} />

<!-- Remote images -->
<Image
  src="https://example.com/image.jpg"
  alt="Remote"
  width={800}
  height={600}
/>
```

---

## Incremental Regeneration (ISR)

**Note:** True ISR is NOT available in pure SSG. For ISR-like behavior, you need:

1. **Hybrid mode** with adapter
2. **On-demand regeneration** with server endpoints
3. **Partial prerendering** (Astro 4+)

See [hybrid-strategies.md](hybrid-strategies.md) for ISR patterns.

---

## Best Practices

### ✅ Cache External Data

```astro
---
// Use build-time caching for external APIs
import { cache } from '../lib/cache';

const posts = await cache.get('posts', async () => {
  const response = await fetch('https://api.example.com/posts');
  return response.json();
}, { ttl: 3600 }); // Cache for 1 hour during build
---
```

### ✅ Generate Sitemaps

```typescript
// src/pages/sitemap.xml.ts
export const GET: APIRoute = async () => {
  const posts = await getPosts();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://example.com/</loc></url>
      ${posts
        .map(
          (post) => `
        <url>
          <loc>https://example.com/blog/${post.slug}</loc>
          <lastmod>${post.updatedAt}</lastmod>
        </url>
      `,
        )
        .join("")}
    </urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
};
```

### ✅ Generate RSS Feeds

```typescript
// src/pages/rss.xml.ts
import rss from "@astrojs/rss";

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: "My Blog",
    description: "A blog about things",
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.date,
      description: post.excerpt,
      link: `/blog/${post.slug}/`,
    })),
  });
};
```

---

## Common Pitfalls

### ❌ Trying to Use SSR Features

```astro
---
// ❌ ERROR in SSG-only: No adapter installed
export const prerender = false; // Won't work

// ❌ ERROR: Astro.locals not available in SSG
const user = Astro.locals.user;

// ❌ ERROR: Request methods not supported
if (Astro.request.method === 'POST') { /* ... */ }
---
```

### ❌ Missing getStaticPaths

```astro
---
// src/pages/blog/[slug].astro

// ❌ ERROR: getStaticPaths required for dynamic routes in SSG
const { slug } = Astro.params;
const post = await getPostBySlug(slug); // Won't work without getStaticPaths
---
```

---

## References

- [Astro SSG Documentation](https://docs.astro.build/en/guides/routing/#static-ssg-mode)
- [getStaticPaths](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
- [Pagination](https://docs.astro.build/en/reference/api-reference/#paginate)
