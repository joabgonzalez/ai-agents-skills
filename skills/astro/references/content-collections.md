# Content Collections

## Core Patterns

- Schema Definition: Use `defineCollection` with Zod schemas in `src/content/config.ts` for type-safe frontmatter validation
- Querying: Use `getCollection()` with optional filter callbacks to retrieve and filter content entries
- Dynamic Routes: Combine `getStaticPaths` with `getCollection` to generate pages for each content entry
- Content Rendering: Call `post.render()` to get the `Content` component for rendering Markdown/MDX bodies

> Type-safe content management with Markdown/MDX

---

## When to Read This

- Managing blog posts, documentation, or CMS content
- Defining content schemas
- Querying collections with type safety

---

## Setup

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content", // or 'data' for JSON/YAML
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

---

## Querying Collections

```astro
---
import { getCollection } from 'astro:content';

// Get all posts
const allPosts = await getCollection('blog');

// Filter published posts
const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date
const sortedPosts = posts.sort((a, b) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---
```

---

## Dynamic Routes

```astro
---
// src/pages/blog/[...slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<article>
  <h1>{post.data.title}</h1>
  <time>{post.data.pubDate.toLocaleDateString()}</time>
  <Content />
</article>
```

---

## Astro 5.x Content Layer API

Astro 5 introduced the Content Layer API as the new standard for content collections. The legacy `src/content/config.ts` API still works but is deprecated in 5.x.

### Key Changes in Astro 5

| Feature | Astro 4 (Legacy) | Astro 5 (Content Layer) |
| ------- | ---------------- | ----------------------- |
| Config file | `src/content/config.ts` | `src/content.config.ts` |
| Define collection | `defineCollection({ schema })` | `defineCollection({ loader, schema })` |
| Collection location | `src/content/` only | Anywhere + external loaders |
| Built-in loaders | None | `glob()`, `file()` |

### New API: src/content.config.ts

```typescript
// src/content.config.ts — Astro 5 location (note: no /content/ subdirectory)
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

// Load from a JSON file
const team = defineCollection({
  loader: file('./src/data/team.json'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string(),
  }),
});

export const collections = { blog, team };
```

### Using Collections (Same API)

The query API is unchanged — `getCollection()` and `getEntry()` work identically:

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);
---
```

### Custom Loaders (External Data)

```typescript
// src/content.config.ts — load from external API
import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  loader: async () => {
    const res = await fetch('https://api.example.com/products');
    const data = await res.json();
    // Must return array of objects with an `id` field
    return data.map((item: { id: string; name: string; price: number }) => ({
      id: item.id,
      ...item,
    }));
  },
  schema: z.object({
    name: z.string(),
    price: z.number(),
  }),
});

export const collections = { products };
```

### Migration from Astro 4

```bash
# Run the official codemod
npx @astrojs/upgrade
```

Manual steps if needed:

1. Move `src/content/config.ts` → `src/content.config.ts`
2. Add `loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' })` to each collection
3. Remove `import.meta.glob` if used for manual collection loading

---

## References

- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Content Layer API (Astro 5)](https://docs.astro.build/en/reference/content-loader-reference/)
- [Built-in Loaders](https://docs.astro.build/en/reference/content-loader-reference/#built-in-loaders)
