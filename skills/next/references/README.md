## Quick Navigation

| File | Purpose |
| --- | --- |
| [data-fetching-patterns.md](./data-fetching-patterns.md) | Server vs Client Components, Route Handlers, fetch cache options, unstable_cache, ISR revalidation, parallel fetching |
| [routing-patterns.md](./routing-patterns.md) | Parallel routes, intercepting routes, middleware, catch-all routes, route groups, generateStaticParams |

---

## Reading Strategy

Start with the SKILL.md Decision Tree to identify which concern applies, then jump
directly to the relevant reference file.

- Deciding where to fetch data or how to cache it -> `data-fetching-patterns.md`
- Setting up URL structure, modals, auth guards, or static generation -> `routing-patterns.md`

Read the Core Patterns section at the top of each file first. Each subsequent section
is self-contained; read only the section that matches your immediate need.

---

## File Descriptions

**data-fetching-patterns.md** — Covers the full data lifecycle in Next.js App Router:
choosing between Server and Client Components for data access, building REST endpoints
with Route Handlers, controlling cache behavior via `fetch()` options and
`unstable_cache`, triggering on-demand ISR with `revalidatePath()` and
`revalidateTag()`, and eliminating request waterfalls with `Promise.all()`.

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
