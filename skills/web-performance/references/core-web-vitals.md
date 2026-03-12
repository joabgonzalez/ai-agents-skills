# Core Web Vitals

> LCP, INP, and CLS measurement, benchmarks, and root-cause diagnosis

## Core Patterns

- LCP Diagnosis
- INP Diagnosis
- CLS Diagnosis
- Measurement Tools

---

## LCP Diagnosis

### Benchmarks

| Rating | LCP Value |
| ------ | --------- |
| Good   | ≤ 2.5s    |
| Needs improvement | 2.5s – 4.0s |
| Poor   | > 4.0s    |

### Common LCP Elements

The LCP element is the largest image or text block visible in the viewport on load. Identify it in Chrome DevTools → Performance → "LCP" marker, or Lighthouse → Diagnostics.

### Root Causes and Fixes

**Slow server response (TTFB > 600ms)**

```
Fix: Add SSR/SSG, use CDN, enable HTTP/2, compress responses (gzip/brotli)
Check: chrome://net-internals/#timing, WebPageTest waterfall
```

**Render-blocking resources**

```html
<!-- ✅ Inline critical CSS; defer the rest -->
<style>/* above-fold styles */</style>
<link rel="stylesheet" href="styles.css" media="print"
      onload="this.media='all'" />
<noscript><link rel="stylesheet" href="styles.css" /></noscript>
```

**LCP image not prioritized**

```html
<!-- ✅ fetchpriority="high" on LCP image only — one per page -->
<img src="hero.webp" fetchpriority="high"
     width="1200" height="600" alt="..." />

<!-- ❌ WRONG: fetchpriority="high" on multiple images negates effect -->
```

**LCP image not preloaded (SSR pages)**

```html
<link rel="preload" as="image" href="hero.webp"
      imagesrcset="hero-400.webp 400w, hero-800.webp 800w"
      imagesizes="100vw" />
```

**Unoptimized image format or size**

- Convert to WebP (30-50% smaller than JPEG) or AVIF (even smaller, less browser support)
- Use `srcset` to serve correct size per viewport (see [image-video.md](image-video.md))

---

## INP Diagnosis

### Benchmarks

| Rating | INP Value |
| ------ | --------- |
| Good   | ≤ 200ms   |
| Needs improvement | 200ms – 500ms |
| Poor   | > 500ms   |

INP replaced FID in March 2024. It measures all interactions (click, keydown, tap) across the page lifetime — the 98th percentile latency.

### Interaction Phases

```
Input delay → Processing time → Presentation delay
   │                │                  │
Blocked by      JS handler         Rendering +
other tasks     execution          paint
```

Reduce each phase separately.

### Root Causes and Fixes

**Long tasks blocking the main thread**

```javascript
// ✅ Yield to browser between chunks of work
async function processLargeList(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    // Yield every 50 items
    if (i % 50 === 0) {
      await scheduler.yield(); // Chrome 115+ | fallback: setTimeout(0)
    }
  }
}

// Fallback for older browsers
function yieldToMain() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

**Heavy event handler**

```javascript
// ❌ WRONG: Synchronous heavy computation in click handler
button.addEventListener('click', () => {
  const result = runExpensiveCalculation(); // blocks UI
  updateUI(result);
});

// ✅ CORRECT: Defer heavy work, update UI immediately
button.addEventListener('click', () => {
  updateUI({ loading: true }); // immediate feedback
  setTimeout(() => {
    const result = runExpensiveCalculation();
    updateUI(result);
  }, 0);
});
```

**Move CPU-intensive work to Web Worker**

```javascript
// worker.js
self.onmessage = ({ data }) => {
  const result = heavyComputation(data);
  self.postMessage(result);
};

// main.js
const worker = new Worker('./worker.js');
worker.postMessage(inputData);
worker.onmessage = ({ data }) => updateUI(data);
```

**Input debouncing for search/filter**

```javascript
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query); // React 18
  // render with deferredQuery — won't block input
}
```

---

## CLS Diagnosis

### Benchmarks

| Rating | CLS Score |
| ------ | --------- |
| Good   | ≤ 0.1     |
| Needs improvement | 0.1 – 0.25 |
| Poor   | > 0.25    |

CLS = sum of (impact fraction × distance fraction) for each unexpected layout shift.

### Root Causes and Fixes

**Images without explicit dimensions**

```html
<!-- ❌ WRONG: Browser doesn't reserve space, causes shift when loaded -->
<img src="product.jpg" alt="Product" />

<!-- ✅ CORRECT: Browser reserves exact space before image loads -->
<img src="product.webp" width="800" height="600" alt="Product" />

<!-- ✅ ALSO CORRECT: aspect-ratio CSS to reserve space responsively -->
<style>
  .product-image { aspect-ratio: 4/3; width: 100%; }
</style>
<img class="product-image" src="product.webp" alt="Product" />
```

**Font swap causing text reflow**

```css
/* ❌ WRONG: block/auto cause invisible text and potential reflow */
@font-face { font-display: block; }

/* ✅ CORRECT for most cases: visible fallback, swap when loaded */
@font-face { font-display: swap; }

/* ✅ BEST for minimal CLS: use fallback permanently if not cached */
@font-face { font-display: optional; }
```

Add `size-adjust`, `ascent-override`, `descent-override` to reduce shift between fallback and custom font:

```css
@font-face {
  font-family: 'FallbackInter';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
}
```

**Dynamic content inserted above existing content**

```css
/* ✅ Reserve space for banners/ads before they load */
.ad-slot { min-height: 90px; }
.cookie-banner { min-height: 60px; }
```

**Animations that affect layout properties**

```css
/* ❌ WRONG: animating layout properties triggers reflow */
.slide-in { animation: slideIn 0.3s; }
@keyframes slideIn { from { height: 0; } to { height: 200px; } }

/* ✅ CORRECT: animate transform/opacity only (compositor-only) */
.slide-in { animation: slideIn 0.3s; }
@keyframes slideIn { from { transform: translateY(-100%); opacity: 0; }
                     to   { transform: translateY(0);    opacity: 1; } }
```

---

## Measurement Tools

### Local Measurement

```javascript
// web-vitals library — report in production
import { onLCP, onINP, onCLS, onTTFB, onFCP } from 'web-vitals';

function sendToAnalytics({ name, value, id, rating }) {
  // Send to your analytics endpoint
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({ name, value, id, rating }),
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

### DevTools Workflow

```
1. Chrome DevTools → Performance tab
2. Check "Web Vitals" checkbox → shows LCP, CLS, INP markers
3. Click LCP marker → highlights element, shows sub-parts (TTFB, load delay, load time, render delay)
4. Click INP marker → shows interaction handler duration breakdown
```

### Lighthouse CI (automated)

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: 'https://example.com/'
    budgetPath: './budget.json'
    uploadArtifacts: true
```

```json
// budget.json — fail CI if scores drop
{
  "performance": 90,
  "accessibility": 100,
  "best-practices": 95,
  "seo": 95
}
```

---

## Common Pitfalls

- Measuring in dev mode: always profile production builds (`npm run build && npm run preview`)
- Simulated throttling: DevTools CPU 4x slowdown simulates a mid-range mobile device — use it
- INP in SPAs: route transitions add interaction latency; measure after full app load
- CLS after hydration: SSR apps may shift on hydration if server/client markup differs

---

## Related Topics

- [image-video.md](image-video.md) — Image optimization for LCP improvement
- [font-loading.md](font-loading.md) — Font strategies for CLS and LCP
- [resource-optimization.md](resource-optimization.md) — Bundle size reduction for faster parsing
