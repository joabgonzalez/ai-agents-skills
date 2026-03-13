# Next.js Performance Optimization

> next/image, next/font, next/dynamic, Partial Prerendering, and bundle optimization

## Core Patterns

- next/image for LCP and CLS
- next/font for Font CLS Elimination
- next/dynamic for Code Splitting
- Partial Prerendering (PPR)
- Bundle and Build Optimization

---

## next/image for LCP and CLS

The `<Image>` component from `next/image` automates best practices: WebP/AVIF conversion, responsive `srcset`, lazy loading, and explicit dimensions to prevent CLS.

### Basic Usage

```typescript
import Image from 'next/image';

// ✅ CORRECT: next/image handles format, srcset, and lazy loading
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={400}
      height={300}
      className="product-image"
    />
  );
}
```

### Priority for LCP Image

```typescript
// ✅ Set priority on the above-fold LCP image — disables lazy loading
// Only ONE image per page should have priority
export default function HeroSection() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority        // ← fetchpriority="high" + no lazy loading
    />
  );
}
```

### fill for Unknown Dimensions (Responsive)

```typescript
// ✅ Use fill when parent container controls size
function Banner() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 400 }}>
      <Image
        src="/banner.webp"
        alt="Banner"
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
```

### sizes for Responsive Images

```typescript
// ✅ Provide sizes to help browser pick the correct srcset entry
function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

Without `sizes`, browser assumes 100vw and may download a 1200px image for a 300px slot.

### Remote Images Require Domain Config

```javascript
// next.config.js — add allowed image domains
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/images/**' },
    ],
  },
};
```

---

## next/font for Font CLS Elimination

`next/font` self-hosts Google Fonts at build time, generates `size-adjust` CSS automatically, and eliminates font-related CLS and FOIT without configuration.

### Google Fonts

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',          // font-display: swap
  variable: '--font-inter', // CSS variable for use in Tailwind/CSS
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

```css
/* Use CSS variables in global styles or Tailwind */
body { font-family: var(--font-inter), system-ui, sans-serif; }
code { font-family: var(--font-roboto-mono), monospace; }
```

### Local Fonts

```typescript
import localFont from 'next/font/local';

const brandFont = localFont({
  src: [
    { path: './fonts/brand-regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/brand-bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-brand',
  display: 'swap',
});
```

**What next/font does automatically:**

- Downloads and self-hosts Google Fonts at build time (no runtime CDN request)
- Generates `size-adjust`, `ascent-override`, `descent-override` to minimize layout shift during font swap
- Adds preload link in `<head>` for the font
- Applies `font-display: swap` (or `optional` if specified)

---

## next/dynamic for Code Splitting

`next/dynamic` is a Next.js wrapper around `React.lazy` with additional options for SSR control.

### Basic Dynamic Import

```typescript
import dynamic from 'next/dynamic';

// ✅ Component loaded only when rendered — code-split automatically
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,  // shown while loading
});

export default function Dashboard() {
  return <HeavyChart data={chartData} />;
}
```

### Disable SSR for Browser-Only Components

```typescript
// ✅ Components using window/document must skip SSR
const ClientOnlyMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});
```

### Conditional Loading (Feature Flags, Admin)

```typescript
// ✅ Load admin panel only when user is admin
function AdminPage({ isAdmin }: { isAdmin: boolean }) {
  const AdminPanel = dynamic(() => import('./AdminPanel'));
  return isAdmin ? <AdminPanel /> : <Redirect to="/" />;
}
```

### Named Export

```typescript
// Component.tsx exports { ChartWidget }
const ChartWidget = dynamic(
  () => import('./Component').then(mod => mod.ChartWidget),
);
```

---

## Partial Prerendering (PPR)

PPR (Next.js 14 experimental, stable in 15) renders a static shell at build time with `<Suspense>`-wrapped dynamic sections streamed in. Pages feel instantly loaded while dynamic data streams.

### Enable PPR

```javascript
// next.config.js
const nextConfig = {
  experimental: { ppr: true }, // Next.js 14
  // or: ppr: 'incremental' for opt-in per route in Next.js 15
};
```

### PPR Page Structure

```typescript
import { Suspense } from 'react';

// ✅ Static shell renders immediately from CDN
// Dynamic sections stream in as data becomes available
export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* ✅ Static: rendered at build time, served from CDN */}
      <StaticHeader />
      <StaticNav />

      {/* ✅ Dynamic: Suspense boundary creates PPR boundary */}
      <Suspense fallback={<ProductSkeleton />}>
        <DynamicProductDetails id={params.id} />
      </Suspense>

      {/* ✅ Static: more static content below */}
      <StaticFooter />
    </div>
  );
}

// This component fetches fresh data on every request
async function DynamicProductDetails({ id }: { id: string }) {
  const product = await fetch(`/api/products/${id}`, { cache: 'no-store' });
  return <ProductCard product={await product.json()} />;
}
```

### When to Use PPR

- Landing pages with dynamic sections (personalization, cart count, user avatar)
- Product pages with static layout but dynamic inventory/pricing
- Any page where most content is static but some data must be fresh

---

## Bundle and Build Optimization

### Analyze Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ...your config
});
```

```bash
ANALYZE=true npm run build
# Opens browser with interactive bundle visualization
```

### Compiler Options

```javascript
// next.config.js
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // strip console.log
  },
  // SWC minifier is on by default in Next.js 13+
};
```

### Optimize Third-Party Scripts

```typescript
import Script from 'next/script';

// ✅ afterInteractive: loads after page is interactive (analytics)
<Script
  src="https://www.googletagmanager.com/gtag/js"
  strategy="afterInteractive"
/>

// ✅ lazyOnload: loads during browser idle time (chat widgets)
<Script src="https://widget.example.com/chat.js" strategy="lazyOnload" />

// ✅ beforeInteractive: critical scripts only (polyfills)
<Script src="/polyfills.js" strategy="beforeInteractive" />

// ❌ WRONG: Raw <script> bypasses Next.js optimizations
<script src="analytics.js" />
```

---

## Common Pitfalls

**Using `priority` on multiple images:** Only one image per page should have `priority`. Multiple priority images compete for bandwidth and defeat the purpose.

**Forgetting `sizes` with `fill`:** When using `fill`, always provide `sizes` matching the CSS-constrained container size. Without it, browser downloads images larger than displayed.

**`next/font` with CSS `@import`:** Importing Google Fonts directly in CSS (`@import url('https://fonts.googleapis.com/...')`) bypasses `next/font` optimizations. Always use the `next/font/google` module.

**PPR and `cookies()` / `headers()`:** Server Components using `cookies()`, `headers()`, or `searchParams` inside a Suspense boundary automatically become dynamic, enabling PPR for that boundary. Outside Suspense, they opt the entire page out of PPR.

---

## Related Topics

- [data-fetching-patterns.md](data-fetching-patterns.md) — fetch() cache options, unstable_cache, ISR
- [routing-patterns.md](routing-patterns.md) — generateStaticParams for pre-generating dynamic pages
- [react/references/performance.md](../../react/references/performance.md) — React-level re-render optimization
- [web-performance](../../web-performance/SKILL.md) — Framework-agnostic Core Web Vitals
