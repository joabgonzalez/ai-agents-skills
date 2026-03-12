## Quick Navigation

| File | Purpose |
| --- | --- |
| [data-fetching-patterns.md](./data-fetching-patterns.md) | Server vs Client Components, Route Handlers, fetch cache options, unstable_cache, ISR revalidation, parallel fetching |
| [routing-patterns.md](./routing-patterns.md) | Parallel routes, intercepting routes, middleware, catch-all routes, route groups, generateStaticParams |
| [performance.md](./performance.md) | next/image, next/font, next/dynamic, Partial Prerendering, bundle optimization |

---

## Reading Strategy

Start with the SKILL.md Decision Tree to identify which concern applies, then jump
directly to the relevant reference file.

- Deciding where to fetch data or how to cache it -> `data-fetching-patterns.md`
- Setting up URL structure, modals, auth guards, or static generation -> `routing-patterns.md`
- Optimizing images, fonts, bundle size, or enabling PPR -> `performance.md`

Read the Core Patterns section at the top of each file first. Each subsequent section
is self-contained; read only the section that matches your immediate need.

---

## File Descriptions

**data-fetching-patterns.md** — Covers the full data lifecycle in Next.js App Router:
choosing between Server and Client Components for data access, building REST endpoints
with Route Handlers, controlling cache behavior via `fetch()` options and
`unstable_cache`, triggering on-demand ISR with `revalidatePath()` and
`revalidateTag()`, and eliminating request waterfalls with `Promise.all()`.

**performance.md** — Covers Next.js-specific performance optimizations: `next/image` (LCP optimization, `priority`, `fill`, `sizes`), `next/font` (automatic self-hosting, CLS elimination, `size-adjust`), `next/dynamic` (code splitting, `ssr: false` for browser-only components), Partial Prerendering (PPR static shell + dynamic Suspense boundaries), and bundle analysis with `@next/bundle-analyzer`.

**routing-patterns.md** — Covers advanced App Router URL and rendering patterns:
rendering multiple independent page slots with `@slot` parallel routes, overlaying
pages as modals using intercepting route notation, enforcing auth and locale rules with
`middleware.ts`, matching variable URL segments with catch-all and optional catch-all
routes, separating layouts without changing URLs with route groups, and pre-generating
dynamic pages at build time with `generateStaticParams()`.

---

## Cross-Reference Map

| Pattern | Primary file | Related SKILL.md section |
| --- | --- | --- |
| Server vs Client Components | data-fetching-patterns.md | Critical Patterns — Server vs Client |
| Route Handlers (REST) | data-fetching-patterns.md | — |
| fetch() cache options | data-fetching-patterns.md | Critical Patterns — Data Fetching |
| unstable_cache | data-fetching-patterns.md | — |
| revalidatePath / revalidateTag | data-fetching-patterns.md | Critical Patterns — Server Actions |
| Promise.all parallel fetching | data-fetching-patterns.md | Edge Cases — Waterfall fetches |
| Parallel routes (@slot) | routing-patterns.md | — |
| Intercepting routes | routing-patterns.md | — |
| Middleware | routing-patterns.md | Decision Tree — Protecting routes |
| Catch-all routes | routing-patterns.md | — |
| Route groups | routing-patterns.md | Critical Patterns — layout.tsx |
| generateStaticParams | routing-patterns.md | Decision Tree — Periodic data refresh |
| next/image (LCP, CLS) | performance.md | Critical Patterns — Data Fetching |
| next/font (font CLS) | performance.md | — |
| next/dynamic (code split) | performance.md | — |
| Partial Prerendering (PPR) | performance.md | — |
