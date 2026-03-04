## Core Patterns

Next.js 13-14 App Router provides multiple data fetching strategies. Choose based on
freshness requirements, interactivity needs, and rendering context.

### Server Components vs Client Components

Use Server Components for data fetching; use Client Components only when the browser
is required.

| Concern | Server Component | Client Component |
| --- | --- | --- |
| Data fetching | Direct `await` in component body | `useEffect` + `fetch` or SWR/React Query |
| DB / secret access | Yes (never exposed to client) | No |
| Browser APIs | No | Yes |
| Interactivity (state, events) | No | Yes |
| SEO / first-paint | Optimal | Requires hydration |

```typescript
// Server Component — fetches data at render time, no directive needed
export default async function UsersPage() {
  const users = await db.getUsers();
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client Component — needed only for interactivity
"use client";
import { useState } from "react";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Route Handlers for REST Endpoints

Place route handlers in `app/api/` (or any route segment) as `route.ts` files.
Export named HTTP-method functions.

```typescript
// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";

// GET /api/products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const products = await db.getProducts({ category });
  return NextResponse.json(products);
}

// POST /api/products
export async function POST(request: NextRequest) {
  const body = await request.json();          // parse JSON body
  const { name, price } = body as { name: string; price: number };
  const product = await db.createProduct({ name, price });
  return NextResponse.json(product, { status: 201 });
}
```

### fetch() with Next.js Cache Options

Next.js extends the native `fetch` API with cache-control options.

```typescript
// No caching — always fetch fresh data (equivalent to SSR on every request)
const res = await fetch("https://api.example.com/live-prices", {
  cache: "no-store",
});

// Cache for 60 seconds — re-validate in the background after TTL (ISR-style)
const res = await fetch("https://api.example.com/products", {
  next: { revalidate: 60 },
});

// Force static caching (default) — never re-fetched after build
const res = await fetch("https://api.example.com/config", {
  cache: "force-cache",
});

// Cache with tags for on-demand invalidation
const res = await fetch("https://api.example.com/posts", {
  next: { revalidate: 3600, tags: ["posts"] },
});
```

### unstable_cache for Fine-Grained Caching

Use `unstable_cache` to cache arbitrary async functions (e.g., ORM calls) with tags.

```typescript
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (userId: string) => {
    return db.users.findUnique({ where: { id: userId } });
  },
  ["user"],           // cache key parts
  {
    revalidate: 300,  // 5 minutes
    tags: ["users"],  // tag for on-demand invalidation
  }
);

// Usage in a Server Component
export default async function UserProfile({ params }: { params: { id: string } }) {
  const user = await getCachedUser(params.id);
  return <div>{user?.name}</div>;
}
```

### ISR with revalidatePath() and revalidateTag()

Trigger on-demand revalidation from Server Actions or Route Handlers.

```typescript
// In a Server Action — revalidate by path
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updatePost(id: string, data: FormData) {
  await db.posts.update({ where: { id }, data: { title: data.get("title") as string } });
  revalidatePath("/posts");         // clear cached page
  revalidatePath(`/posts/${id}`);   // clear specific post page
}

// Revalidate by cache tag — affects all cached fetches with that tag
export async function publishPost(id: string) {
  await db.posts.update({ where: { id }, data: { published: true } });
  revalidateTag("posts");           // invalidates all fetches tagged "posts"
}

// In a Route Handler — on-demand webhook revalidation
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const { tag, secret } = await request.json();
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true });
}
```

### Parallel Data Fetching with Promise.all()

Avoid sequential `await` chains (waterfall). Fetch independent data sources in parallel.

```typescript
// Bad — sequential, total time = A + B + C
export default async function DashboardPage() {
  const user = await getUser();       // waits
  const posts = await getPosts();     // waits after user
  const stats = await getStats();     // waits after posts
  return <Dashboard user={user} posts={posts} stats={stats} />;
}

// Good — parallel, total time = max(A, B, C)
export default async function DashboardPage() {
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats(),
  ]);
  return <Dashboard user={user} posts={posts} stats={stats} />;
}

// With Suspense boundaries for independent streaming
import { Suspense } from "react";
export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection />
      </Suspense>
    </>
  );
}
```
