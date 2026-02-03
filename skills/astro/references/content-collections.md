# Content Collections

> Type-safe content management with Markdown/MDX

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

## References

- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
