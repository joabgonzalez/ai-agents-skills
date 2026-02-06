---
name: next
description: "Fullstack React with SSR/SSG and API routes. Trigger: When building with Next.js, configuring SSR/SSG, or deploying."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - react
    - typescript
    - architecture-patterns
    - humanizer
  dependencies:
    next: ">=13.0.0 <15.0.0"
    react: ">=18.0.0 <19.0.0"
---

# Next.js Skill

Build fullstack React applications with the App Router, server components, and server actions in Next.js 13-14.

## When to Use
- Building React apps with SSR/SSG
- Implementing API routes or middleware
- Deploying fullstack React projects

Don't use for:
- Pure static sites with no React (use Astro or Hugo)
- Backend-only APIs with no UI (use Express or Hono)
- Non-React frontends (use SvelteKit or Nuxt)

## Critical Patterns

### Server Components vs Client Components
Components are server components by default. Add `"use client"` only for browser APIs, state, or event handlers.
```typescript
// CORRECT: server component fetches data directly (no directive needed)
export default async function UsersPage() {
  const users = await db.getUsers();
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
// WRONG: adding "use client" just to render data, then using useEffect + fetch
```

### File-Based Routing with layout.tsx
Use `layout.tsx` for shared UI that persists across child routes without re-rendering.
```typescript
// app/dashboard/layout.tsx wraps all /dashboard/* pages
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

### Server Actions
Use `"use server"` functions for mutations without writing API routes.
```typescript
"use server";
import { revalidatePath } from "next/cache";
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  await db.insertUser({ name });
  revalidatePath("/users");
}
```

### Data Fetching in Server Components
Fetch data directly in async server components. Next.js deduplicates and caches `fetch` calls.
```typescript
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 },
  });
  return res.json();
}
export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList items={products} />;
}
```

### Metadata API
Export `metadata` or `generateMetadata` for SEO instead of manual `<head>` tags.
```typescript
// Static metadata
export const metadata = { title: "Dashboard", description: "User dashboard" };
// Dynamic metadata based on params
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return { title: product.name, description: product.summary };
}
```

## Decision Tree
- Needs browser APIs or state? -> Add `"use client"` directive
- Fetching data for display? -> Use async server component, not useEffect
- Form submission or mutation? -> Use a server action with `"use server"`
- Shared layout across routes? -> Create a `layout.tsx` in the parent segment
- Dynamic page title? -> Export `generateMetadata` function
- Protecting routes? -> Use `middleware.ts` at the project root
- Periodic data refresh? -> Use `fetch` with `next: { revalidate: N }`
- On-demand cache clear? -> Call `revalidatePath()` or `revalidateTag()`

## Example
```typescript
// app/posts/page.tsx - server component with client island
import LikeButton from "./like-button";
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 120 },
  });
  return res.json() as Promise<{ id: string; title: string }[]>;
}
export const metadata = { title: "Blog Posts" };
export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title} <LikeButton postId={p.id} /></li>
      ))}
    </ul>
  );
}
```

## Edge Cases
- **Client component boundaries**: `"use client"` makes the component and all its imports client-side; push it as far down the tree as possible.
- **Serialization across boundary**: Props passed from server to client must be serializable (no functions, Dates, or class instances).
- **Waterfall fetches**: Sequential `await` calls in server components create waterfalls; use `Promise.all()` for parallel fetches.
- **Middleware limitations**: Middleware runs on Edge Runtime; it cannot use Node.js APIs like `fs` or database drivers.
- **Revalidation conflicts**: Mixing `revalidate` values on the same route uses the lowest value; be deliberate about cache timing.

## Checklist
- [ ] Components are server components by default; `"use client"` only added when required
- [ ] Data fetching uses async server components, not client-side useEffect
- [ ] Layouts are used for persistent shared UI across route segments
- [ ] Server actions handle form submissions and mutations
- [ ] Metadata is set via `metadata` export or `generateMetadata` function
- [ ] `middleware.ts` handles auth redirects and rewrites
- [ ] Fetch calls include `next: { revalidate }` or `cache` options
- [ ] Client component boundaries are pushed as low in the tree as possible

## Resources
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components - React RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching)
