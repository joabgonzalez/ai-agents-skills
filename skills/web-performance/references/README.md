## Quick Navigation

| Reference | Purpose | Read When |
| --- | --- | --- |
| [core-web-vitals.md](./core-web-vitals.md) | LCP, INP, CLS benchmarks, root-cause diagnosis, measurement tools | Diagnosing slow Lighthouse scores or poor field data |
| [resource-optimization.md](./resource-optimization.md) | JS/CSS bundle size, tree-shaking, code splitting, compression | Bundle > 300KB or page load feels slow |
| [image-video.md](./image-video.md) | Modern formats, responsive images, lazy loading, video delivery | Optimizing images or replacing GIFs |
| [font-loading.md](./font-loading.md) | font-display strategies, preloading, fallback tuning | Fonts causing FOIT, CLS, or slow LCP |

---

## Reading Strategy

Start with the main [SKILL.md](../SKILL.md) Decision Tree to identify which metric or area is the problem, then jump to the relevant reference.

- **LCP > 2.5s** → `core-web-vitals.md` (LCP section) + `image-video.md` or `font-loading.md` depending on LCP element
- **INP > 200ms** → `core-web-vitals.md` (INP section)
- **CLS > 0.1** → `core-web-vitals.md` (CLS section) + `font-loading.md` if font-related
- **Bundle too large** → `resource-optimization.md`
- **Images not optimized** → `image-video.md`
- **Font causing layout shift** → `font-loading.md`

---

## File Descriptions

**core-web-vitals.md** — Covers the three Core Web Vitals in depth: LCP root causes (slow TTFB, render-blocking resources, unoptimized images), INP diagnosis (long tasks, heavy handlers, Web Workers), and CLS fixes (explicit dimensions, font-display, layout-stable animations). Includes measurement with DevTools, web-vitals library, and Lighthouse CI setup.

**resource-optimization.md** — Covers JavaScript bundle analysis (Rollup visualizer, source-map-explorer), tree-shaking patterns (lodash-es, barrel file pitfalls), route-level and feature-level code splitting, CSS purging and critical CSS extraction, and compression + caching strategies (Brotli, immutable cache headers, resource hints).

**image-video.md** — Covers modern image formats (WebP, AVIF, format selection guide), responsive images (`srcset` + `sizes`, art direction with `<picture>`), lazy loading (`loading="lazy"`, `fetchpriority`, `decoding="async"`), and video optimization (replacing GIFs with `<video>`, `preload` strategy, poster images, lazy loading video).

**font-loading.md** — Covers `font-display` values and when to use each (`swap` vs `optional` vs `fallback`), preloading self-hosted fonts (with required `crossorigin`), fallback font metric overrides (`size-adjust`, `ascent-override`) to minimize CLS, variable fonts, Google Fonts self-hosting, and Next.js `next/font` automatic optimization.

---

## Cross-Reference Map

| Problem | Primary Reference | Related Reference |
| --- | --- | --- |
| LCP > 2.5s (image) | core-web-vitals.md | image-video.md |
| LCP > 2.5s (font/text) | core-web-vitals.md | font-loading.md |
| INP > 200ms | core-web-vitals.md | — |
| CLS > 0.1 (images) | core-web-vitals.md | image-video.md |
| CLS > 0.1 (fonts) | core-web-vitals.md | font-loading.md |
| JS bundle > 300KB | resource-optimization.md | core-web-vitals.md |
| Unoptimized images | image-video.md | core-web-vitals.md |
| Font FOIT/CLS | font-loading.md | core-web-vitals.md |
| Video replacing GIF | image-video.md | resource-optimization.md |
