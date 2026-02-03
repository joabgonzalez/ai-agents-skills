# Astro Prefetching Strategies

> Optimizing navigation speed with intelligent prefetching

## When to Read This

- Improving perceived performance
- Implementing instant navigation
- Reducing time-to-interactive for links
- Optimizing resource loading
- Configuring prefetch behavior

---

## Basic Setup

### ✅ Enable Prefetch

```javascript
// astro.config.mjs
export default defineConfig({
  prefetch: true, // Enable default prefetch behavior
});
```

or

```javascript
export default defineConfig({
  prefetch: {
    defaultStrategy: "hover", // 'hover', 'tap', 'viewport', 'load'
    prefetchAll: true,
  },
});
```

---

## Prefetch Strategies

### ✅ Hover Prefetch (Default)

```astro
<!-- Prefetches on hover (300ms delay) -->
<a href="/about">About</a>

<!-- Explicit hover -->
<a href="/contact" data-astro-prefetch="hover">Contact</a>
```

**When to use:** Most links (balances performance and data usage)

### ✅ Tap Prefetch (Mobile-Friendly)

```astro
<!-- Prefetches on touchstart/mousedown (before click) -->
<a href="/products" data-astro-prefetch="tap">Products</a>
```

**When to use:** High-priority navigation on mobile devices

### ✅ Viewport Prefetch (Proactive)

```astro
<!-- Prefetches when link enters viewport -->
<a href="/blog" data-astro-prefetch="viewport">Blog</a>
```

**When to use:** Content-heavy pages, below-the-fold links

### ✅ Load Prefetch (Immediate)

```astro
<!-- Prefetches immediately on page load -->
<a href="/dashboard" data-astro-prefetch="load">Dashboard</a>
```

**When to use:** Critical next step (signup → dashboard)

### ✅ Disable Prefetch

```astro
<!-- Never prefetch -->
<a href="/external" data-astro-prefetch="false">External</a>

<!-- No prefetch for external links by default -->
<a href="https://example.com">Example</a>
```

**When to use:** Large pages, authenticated routes, external links

---

## Advanced Configuration

### ✅ Global Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true, // Prefetch all internal links

    // Or target specific patterns
    // prefetchAll: false,
    // include: ['/blog/*', '/products/*'],
    // exclude: ['/admin/*'],
  },
});
```

### ✅ Prefetch with Intent

```astro
---
// High-intent links (prefetch early)
const primaryLinks = ['/pricing', '/features', '/demo'];

// Low-intent links (prefetch on hover)
const secondaryLinks = ['/about', '/careers', '/blog'];
---

{primaryLinks.map(href => (
  <a href={href} data-astro-prefetch="load">{href}</a>
))}

{secondaryLinks.map(href => (
  <a href={href} data-astro-prefetch="hover">{href}</a>
))}
```

---

## Prefetch with View Transitions

### ✅ Combine Prefetch + View Transitions

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <!-- Prefetch + smooth transition -->
    <a href="/about" data-astro-prefetch="hover">About</a>
    <slot />
  </body>
</html>
```

**Benefit:** Instant navigation + smooth animations

---

## Performance Optimization

### ✅ Prioritize Critical Links

```astro
<nav>
  <!-- High-priority (load immediately) -->
  <a href="/signup" data-astro-prefetch="load">Sign Up</a>
  <a href="/login" data-astro-prefetch="load">Login</a>

  <!-- Medium-priority (hover) -->
  <a href="/features" data-astro-prefetch="hover">Features</a>

  <!-- Low-priority (viewport) -->
  <a href="/blog" data-astro-prefetch="viewport">Blog</a>
</nav>
```

### ✅ Conditional Prefetch

```astro
---
const user = Astro.locals.user;
const isLoggedIn = !!user;
---

<nav>
  {isLoggedIn ? (
    <a href="/dashboard" data-astro-prefetch="load">Dashboard</a>
  ) : (
    <a href="/login" data-astro-prefetch="hover">Login</a>
  )}
</nav>
```

### ✅ Save Data Mode

```astro
<script>
  // Disable prefetch on slow connections
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.saveData || connection.effectiveType === 'slow-2g') {
      document.querySelectorAll('[data-astro-prefetch]').forEach(link => {
        link.removeAttribute('data-astro-prefetch');
      });
    }
  }
</script>
```

---

## Prefetch API Routes

### ✅ Prefetch JSON Data

```typescript
// src/pages/api/products.ts
export async function GET() {
  const products = await fetchProducts();
  return new Response(JSON.stringify(products), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

```astro
---
// Prefetch data for client-side use
---

<script>
  // Prefetch data on hover
  document.querySelector('#products-link').addEventListener('mouseenter', async () => {
    const response = await fetch('/api/products');
    const products = await response.json();
    // Cache for instant access on navigation
    sessionStorage.setItem('products', JSON.stringify(products));
  });
</script>

<a id="products-link" href="/products">Products</a>
```

---

## Best Practices

1. **Use `hover` as default** - Good balance of performance and data usage
2. **Use `load` sparingly** - Only for critical next steps (1-2 links max)
3. **Disable for large pages** - Avoid prefetching pages >1MB
4. **Respect user preferences** - Check `navigator.connection.saveData`
5. **Combine with View Transitions** - Prefetch + smooth animations = perceived instant
6. **Cache prefetched pages** - Service workers or client-side caching

---

## Edge Cases

**Authenticated routes:** Prefetching may not work if page requires authentication. Middleware can block prefetch requests.

**Dynamic content:** Prefetched pages may become stale. Use short cache TTLs or disable prefetch.

**Mobile data:** Prefetching consumes data. Use `tap` or `viewport` strategies on mobile.

**SEO crawlers:** Bots don't trigger prefetch. Ensure pages load without prefetch dependency.

**Large pages:** Prefetching 5MB pages wastes bandwidth. Use `data-astro-prefetch="false"`.

---

## Performance Metrics

| Strategy   | Trigger         | Data Usage | Speed Gain | Mobile-Friendly |
| ---------- | --------------- | ---------- | ---------- | --------------- |
| `load`     | Page load       | High       | Best       | ⚠️ Caution      |
| `hover`    | Hover (300ms)   | Medium     | Great      | N/A             |
| `tap`      | Mousedown/touch | Low        | Good       | ✅ Yes          |
| `viewport` | Enter viewport  | Medium     | Good       | ✅ Yes          |
| `false`    | Never           | None       | None       | ✅ Yes          |

---

## References

- [Astro Prefetch](https://docs.astro.build/en/guides/prefetch/)
- [Resource Hints](https://web.dev/articles/link-prefetch)
