## Core Patterns

Next.js App Router uses a file-system-based routing model inside the `app/` directory.
Folders define URL segments; special files (`page.tsx`, `layout.tsx`, `route.ts`, etc.)
determine rendering and behavior.

### Parallel Routes with @slot Notation

Parallel routes render multiple pages simultaneously within the same layout. Each slot
is an independent navigable section.

```typescript
// Directory structure for a split-view dashboard:
// app/
//   dashboard/
//     layout.tsx           ← receives both slots
//     @analytics/
//       page.tsx
//     @team/
//       page.tsx

// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3">
      <main>{children}</main>
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </div>
  );
}
```

Parallel routes also power modal patterns: one slot renders the modal overlay while the
other continues to display the background page.

### Intercepting Routes

Intercepting routes load a route from a different segment while keeping the current URL
context visible (e.g., opening a photo in a modal without leaving the feed).

| Convention | Intercepts |
| --- | --- |
| `(.)segment` | Same level |
| `(..)segment` | One level above |
| `(..)(..)segment` | Two levels above |
| `(...)segment` | From the app root |

```typescript
// Directory structure — intercept /photo/[id] from within /feed
// app/
//   feed/
//     page.tsx
//     (.)photo/
//       [id]/
//         page.tsx         ← renders as modal when navigating from /feed
//   photo/
//     [id]/
//       page.tsx           ← renders as full page on direct URL visit

// app/feed/(.)photo/[id]/page.tsx
import { Modal } from "@/components/modal";
import PhotoDetail from "@/components/photo-detail";

export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <PhotoDetail id={params.id} />
    </Modal>
  );
}
```

### Middleware for Auth, Redirects, and Locale Detection

`middleware.ts` at the project root runs before every matched request on the Edge Runtime.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard — redirect unauthenticated users
  const token = request.cookies.get("auth-token")?.value;
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Locale detection and redirect
  const locale = request.headers.get("accept-language")?.split(",")[0] ?? "en";
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.next();
}

// Restrict middleware to specific paths (skip _next/static, api, etc.)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Constraints: Edge Runtime only — no `fs`, no Node.js-only modules, no DB drivers.

### Catch-All and Optional Catch-All Routes

```typescript
// app/docs/[...slug]/page.tsx
// Matches: /docs/intro, /docs/api/auth, /docs/api/auth/tokens
// Does NOT match: /docs  (slug is required)
export default function DocsPage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join("/");   // e.g. "api/auth/tokens"
  return <Docs path={path} />;
}

// app/shop/[[...slug]]/page.tsx
// Matches: /shop  AND  /shop/clothing  AND  /shop/clothing/tshirts
// slug is undefined when path is /shop
export default function ShopPage({ params }: { params: { slug?: string[] } }) {
  const category = params.slug?.join("/") ?? "all";
  return <ProductGrid category={category} />;
}
```

### Route Groups for Layout Organization

Wrap segments in parentheses to group them without affecting the URL path.

```typescript
// Directory structure:
// app/
//   (marketing)/
//     layout.tsx           ← marketing layout (no auth header)
//     page.tsx             ← renders at /
//     about/
//       page.tsx           ← renders at /about
//   (app)/
//     layout.tsx           ← app layout (with auth header + sidebar)
//     dashboard/
//       page.tsx           ← renders at /dashboard
//     settings/
//       page.tsx           ← renders at /settings

// Route groups allow multiple root layouts with different shells.
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PublicNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

### Dynamic Routes with generateStaticParams()

Pre-generate dynamic route segments at build time for static output.

```typescript
// app/posts/[slug]/page.tsx

// Tell Next.js which slugs to pre-render at build time
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
  // Returns: [{ slug: "hello-world" }, { slug: "nextjs-routing" }, ...]
}

// The page component receives params for each pre-generated slug
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await db.posts.findUnique({ where: { slug: params.slug } });
  if (!post) notFound();
  return <Article post={post} />;
}

// Optional: control behavior for slugs not returned by generateStaticParams
// "block"  — render on demand and cache (default with generateStaticParams)
// "empty"  — return 404 immediately
// false    — render on every request without caching
export const dynamicParams = true;
```
