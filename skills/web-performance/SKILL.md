---
name: web-performance
description: "Web performance optimization and Core Web Vitals. Trigger: When measuring, auditing, or improving page load speed, interactivity, or visual stability."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Web Performance

Optimize loading speed, interactivity, and visual stability using Core Web Vitals and resource budgets.

## When to Use

- Improving Lighthouse performance scores
- Diagnosing slow LCP, high INP, or layout shifts (CLS)
- Reducing JavaScript or CSS bundle size
- Optimizing images, fonts, or third-party scripts
- Auditing page load performance across frameworks

Don't use for:

- React component re-render optimization (use `react`)
- Next.js image/font components (use `next`)
- Accessibility audits (use `a11y`)
- SEO meta tags or structured data (use `web-seo`)

---

## Critical Patterns

### ✅ REQUIRED: Core Web Vitals Thresholds

```
LCP (Largest Contentful Paint)  Good: ≤ 2.5s  Poor: > 4.0s
INP (Interaction to Next Paint)  Good: ≤ 200ms  Poor: > 500ms
CLS (Cumulative Layout Shift)    Good: ≤ 0.1   Poor: > 0.25
```

Measure with: Chrome DevTools Performance tab, Lighthouse, Web Vitals extension, or `web-vitals` npm package.

### ✅ REQUIRED: Resource Budgets

```
JavaScript (compressed): < 300 KB
CSS (compressed):        < 100 KB
Total page weight:       < 1.5 MB
```

Enforce with bundler size limits (Vite `build.rollupOptions`, Webpack `performance.maxAssetSize`).

### ✅ REQUIRED: Image Optimization

```html
<!-- ✅ CORRECT: Modern format, explicit size, lazy loading -->
<img src="hero.webp" width="800" height="600"
     alt="Hero image" loading="lazy" fetchpriority="high" />

<!-- ❌ WRONG: No dimensions (causes CLS), no lazy loading -->
<img src="photo.jpg" alt="Photo" />
```

Rules: Always specify `width`/`height` to prevent CLS. Use `loading="lazy"` for below-fold images. Use `fetchpriority="high"` on the LCP image only.

### ✅ REQUIRED: Font Loading — Eliminate CLS

```html
<!-- ✅ Preload critical font + swap -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="/fonts/inter.woff2" as="font"
      type="font/woff2" crossorigin />
```

```css
/* ✅ font-display: swap prevents invisible text, reduces CLS */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}
```

### ✅ REQUIRED: Script Loading

```html
<!-- ✅ Async for independent scripts -->
<script src="analytics.js" async></script>

<!-- ✅ Defer for scripts that need DOM -->
<script src="app.js" defer></script>

<!-- ❌ WRONG: Blocking render -->
<script src="app.js"></script>
```

### ❌ NEVER: Render-Blocking Resources

```html
<!-- ❌ WRONG: Blocks rendering -->
<link rel="stylesheet" href="non-critical.css" />

<!-- ✅ CORRECT: Inline critical CSS, async-load the rest -->
<style>/* critical above-fold styles */</style>
<link rel="stylesheet" href="styles.css" media="print"
      onload="this.media='all'" />
```

---

## Decision Tree

```
LCP > 2.5s?
  → Is LCP element an image? → Optimize image size, add fetchpriority="high", use WebP/AVIF
  → Is LCP element text? → Check font loading (font-display: swap + preload)
  → Slow server response? → Add SSR/SSG or caching layer
  → See references/core-web-vitals.md for full LCP diagnosis

INP > 200ms?
  → Long JS tasks on interaction? → Split tasks with scheduler.yield() or setTimeout
  → Heavy input handler? → Debounce/throttle, move work to Web Worker
  → See references/core-web-vitals.md for full INP diagnosis

CLS > 0.1?
  → Images without dimensions? → Add explicit width/height attributes
  → Font swap causing jump? → Preload font + font-display: swap or optional
  → Dynamic content inserted above fold? → Reserve space with min-height
  → See references/core-web-vitals.md for full CLS diagnosis

Bundle too large (JS > 300KB)?
  → Identify with source-map-explorer or bundler analyzer
  → Lazy-load routes and heavy components (dynamic import)
  → Tree-shake unused exports, audit dependencies
  → See references/resource-optimization.md

Images unoptimized?
  → Convert to WebP/AVIF, add responsive srcset, enable lazy loading
  → See references/image-video.md

Font causing layout shift?
  → Add font-display: swap, preload critical fonts, use size-adjust
  → See references/font-loading.md

Framework-specific?
  → React: re-render optimization → react skill
  → Next.js: next/image, next/font, PPR → next skill
  → Astro: output mode, islands → astro skill
```

---

## Example

Diagnosing and fixing poor LCP on an e-commerce product page.

```html
<!-- Before: LCP image unoptimized, no priority hint -->
<img src="product.jpg" class="hero" alt="Running shoes" />

<!-- After: WebP format, explicit dimensions, LCP hint, lazy for rest -->
<img
  src="product.webp"
  width="800" height="600"
  alt="Running shoes"
  fetchpriority="high"
  decoding="async"
/>
<img src="thumbnail.webp" width="200" height="150"
     alt="Side view" loading="lazy" />
```

```html
<!-- Preload font to prevent invisible text during load -->
<link rel="preload" href="/fonts/inter-regular.woff2"
      as="font" type="font/woff2" crossorigin />
```

```javascript
// Measure LCP with web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(({ value }) => console.log('LCP:', value));
onINP(({ value }) => console.log('INP:', value));
onCLS(({ value }) => console.log('CLS:', value));
```

Result: LCP drops from 4.2s → 1.8s after image format change + fetchpriority hint.

---

## Edge Cases

**Third-party scripts:** Ad scripts, chat widgets, and analytics are common INP offenders. Load with `async`, defer initialization, or use a Facade pattern (lazy-load on first interaction).

**Variable fonts:** A single variable font file replaces multiple weight files, reducing requests. Use `font-display: optional` if layout shift on first load is unacceptable.

**Responsive images:** Use `srcset` + `sizes` for art direction. Without `sizes`, browser downloads the wrong size.

```html
<img srcset="img-400.webp 400w, img-800.webp 800w"
     sizes="(max-width: 600px) 400px, 800px"
     src="img-800.webp" alt="..." />
```

**INP vs FID:** FID (First Input Delay) was replaced by INP in March 2024. INP measures all interactions throughout page lifetime, not just the first.

---

## Resources

- [Core Web Vitals](references/core-web-vitals.md) — LCP, INP, CLS measurement and diagnosis
- [Resource Optimization](references/resource-optimization.md) — JS/CSS budgets, bundling, tree-shaking
- [Image & Video](references/image-video.md) — Formats, responsive images, lazy loading
- [Font Loading](references/font-loading.md) — font-display strategies, preloading, CLS elimination

**See [references/README.md](references/README.md) for navigation.**
