# Resource Optimization

> JavaScript and CSS bundle size, tree-shaking, code splitting, and compression

## Core Patterns

- Bundle Analysis
- JavaScript Optimization
- CSS Optimization
- Compression and Caching

---

## Bundle Analysis

### Identify What's Large Before Optimizing

```bash
# Vite — built-in visualizer
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [visualizer({ open: true, gzipSize: true })],
});
```

```bash
# Webpack — bundle analyzer
npm install --save-dev webpack-bundle-analyzer
# Then: npx webpack-bundle-analyzer stats.json
```

```bash
# source-map-explorer (any bundler)
npm install --save-dev source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

**What to look for:**

- Duplicated dependencies (same package at multiple versions)
- Large libraries imported fully when only part is needed (lodash, moment, date-fns)
- `node_modules` code larger than your app code

---

## JavaScript Optimization

### Code Splitting — Load Only What's Needed

```javascript
// ✅ Route-level splitting (React Router / Next.js auto-splits)
const LazyDashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyDashboard />
    </Suspense>
  );
}

// ✅ Feature-level splitting (heavy library)
async function exportToPDF() {
  const { jsPDF } = await import('jspdf'); // only loaded when needed
  const doc = new jsPDF();
  doc.save('file.pdf');
}
```

### Tree-Shaking — Eliminate Dead Code

```javascript
// ❌ WRONG: Imports entire lodash (~70KB gzipped)
import _ from 'lodash';
const result = _.chunk(array, 2);

// ✅ CORRECT: Imports only the function needed (~1KB)
import chunk from 'lodash/chunk';

// ✅ ALSO CORRECT: Use modern alternatives with native tree-shaking
import { chunk } from 'lodash-es'; // ESM version, fully tree-shakeable
```

```javascript
// ❌ WRONG: Imports all icons from react-icons (~500KB)
import { FaBeer, FaHome } from 'react-icons/fa';

// ✅ CORRECT: Direct imports only
import FaBeer from 'react-icons/fa/FaBeer';
```

### Avoid Re-exporting Entire Modules

```typescript
// ❌ WRONG: index.ts barrel re-exports everything — prevents tree-shaking
export * from './Button';
export * from './Input';
export * from './Modal'; // Modal = 80KB pulled into every page

// ✅ CORRECT: Direct imports from specific files
import { Button } from './components/Button';
```

### Replace Heavy Libraries

| Heavy | Lighter Alternative | Size Reduction |
| ----- | ------------------- | -------------- |
| moment.js (67KB) | date-fns or Day.js | ~60KB |
| lodash (70KB) | lodash-es + tree-shaking | ~65KB |
| axios (13KB) | native fetch | ~13KB |
| classnames (1KB) | clsx (0.5KB) | small |

### Enforce Bundle Budgets in CI

```javascript
// vite.config.ts — fail build if chunk exceeds budget
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'clsx'],
        },
      },
    },
    chunkSizeWarningLimit: 300, // warn at 300KB
  },
});
```

```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 300_000,     // 300KB per asset
    maxEntrypointSize: 300_000,
    hints: 'error',            // fail build, not just warn
  },
};
```

---

## CSS Optimization

### Purge Unused CSS (Tailwind)

```javascript
// tailwind.config.js — content glob must cover all template files
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  // PurgeCSS runs automatically in production build
};
```

### Critical CSS Extraction

```html
<!-- Inline critical above-fold CSS to eliminate render-blocking -->
<style>
  /* styles for header, hero, and first screenful only */
  body { margin: 0; font-family: system-ui; }
  .hero { background: #f5f5f5; padding: 2rem; }
</style>

<!-- Async-load full stylesheet -->
<link rel="stylesheet" href="/styles.css"
      media="print" onload="this.media='all'" />
```

### Avoid @import in CSS (blocks parallel loading)

```css
/* ❌ WRONG: @import is sequential — each blocks the next */
@import url('base.css');
@import url('components.css');

/* ✅ CORRECT: multiple <link> tags load in parallel */
```

```html
<link rel="stylesheet" href="base.css" />
<link rel="stylesheet" href="components.css" />
```

---

## Compression and Caching

### Enable Brotli/Gzip Compression

```nginx
# nginx.conf — serve pre-compressed files
gzip_static on;
brotli_static on;

# Or compress on the fly
gzip on;
gzip_types text/html text/css application/javascript application/json;
brotli on;
brotli_types text/html text/css application/javascript application/json;
```

Brotli typically achieves 15-20% better compression than gzip for text assets.

### Immutable Cache Headers for Hashed Assets

```nginx
# Vite/Webpack output filenames include content hash: main.abc123.js
location ~* \.(js|css|woff2|png|webp)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML: always revalidate (contains hashed asset references)
location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

### Resource Hints

```html
<!-- Preconnect: establish connection to third-party origin early -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- Preload: load critical resource ASAP (LCP image, critical font) -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
<link rel="preload" href="/hero.webp" as="image" />

<!-- Prefetch: load likely-needed resource during idle time -->
<link rel="prefetch" href="/dashboard.js" />

<!-- DNS Prefetch: cheaper than preconnect for non-critical origins -->
<link rel="dns-prefetch" href="//analytics.example.com" />
```

---

## Common Pitfalls

- **Barrel files**: `index.ts` re-exports break tree-shaking in some bundlers. Prefer direct imports.
- **`sideEffects: false` in package.json**: Required for bundler to tree-shake a library. Without it, entire library is included.
- **Dynamic imports in loops**: `await import('./item')` inside a loop creates multiple separate chunks. Bundle into one module instead.
- **Polyfills for modern browsers**: Polyfilling `Promise`, `fetch`, etc. for evergreen targets wastes bytes. Set `browserslist` to modern targets.

```json
// package.json — target modern browsers only
{
  "browserslist": ["> 1%", "last 2 versions", "not dead", "not ie 11"]
}
```

---

## Related Topics

- [core-web-vitals.md](core-web-vitals.md) — How bundle size affects LCP and INP
- [image-video.md](image-video.md) — Image format and size optimization
- [font-loading.md](font-loading.md) — Font file size and loading strategies
