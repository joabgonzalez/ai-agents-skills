# Astro Client Navigation

Optimizing navigation speed with prefetching and smooth page transitions.

## Core Patterns

- Strategy Selection: Choose `hover` (default), `tap`, `viewport`, or `load` via `data-astro-prefetch` attribute based on link priority
- Global Config: Enable prefetching site-wide in `astro.config.mjs` with `prefetch: { defaultStrategy, prefetchAll }`
- Priority Tiering: Apply `load` to critical next steps (1-2 links max), `hover` to navigation, `viewport` to below-fold links
- View Transitions Setup: Add `<ViewTransitions />` in `<head>` to make all navigation SPA-like with smooth animations
- Element Persistence: Use `transition:persist` to keep elements mounted (audio, video, forms) across page transitions
- Morph Transitions: Use `transition:name` on matching elements across pages to create morphing effects
- Lifecycle Events: Hook into `astro:before-swap`, `astro:after-swap`, and `astro:page-load` to manage state and cleanup
- Combined Usage: Use both prefetching and View Transitions together for instant-feeling animated navigation

---

## Prefetching Strategies

> Optimizing navigation speed with intelligent prefetching

### When to Read This

- Improving perceived performance
- Implementing instant navigation
- Reducing time-to-interactive for links
- Configuring prefetch behavior

---

### Basic Setup

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

### Prefetch Strategies

### Hover Prefetch (Default)

```astro
<!-- Prefetches on hover (300ms delay) -->
<a href="/about">About</a>

<!-- Explicit hover -->
<a href="/contact" data-astro-prefetch="hover">Contact</a>
```

**Use for:** Most links — balances performance and data usage.

### Tap Prefetch (Mobile-Friendly)

```astro
<!-- Prefetches on touchstart/mousedown (before click) -->
<a href="/products" data-astro-prefetch="tap">Products</a>
```

**Use for:** High-priority navigation on mobile devices.

### Viewport Prefetch (Proactive)

```astro
<!-- Prefetches when link enters viewport -->
<a href="/blog" data-astro-prefetch="viewport">Blog</a>
```

**Use for:** Content-heavy pages, below-the-fold links.

### Load Prefetch (Immediate)

```astro
<!-- Prefetches immediately on page load -->
<a href="/dashboard" data-astro-prefetch="load">Dashboard</a>
```

**Use for:** Critical next step (signup → dashboard).

### Disable Prefetch

```astro
<!-- Never prefetch -->
<a href="/external" data-astro-prefetch="false">External</a>

<!-- No prefetch for external links by default -->
<a href="https://example.com">Example</a>
```

**Use for:** Large pages, authenticated routes, external links.

---

### Advanced Configuration

### Global Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true, // Prefetch all internal links
  },
});
```

### Prefetch with Intent

```astro
---
const primaryLinks = ['/pricing', '/features', '/demo'];
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

### Prefetch with View Transitions

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

**Benefit:** Instant navigation + smooth animations.

---

### Performance Optimization

### Prioritize Critical Links

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

### Conditional Prefetch

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

### Save Data Mode

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

### Prefetch API Routes

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
<script>
  // Prefetch data on hover
  document.querySelector('#products-link').addEventListener('mouseenter', async () => {
    const response = await fetch('/api/products');
    const products = await response.json();
    sessionStorage.setItem('products', JSON.stringify(products));
  });
</script>

<a id="products-link" href="/products">Products</a>
```

---

### Prefetch Best Practices

1. Use `hover` as default — good balance of performance and data usage
2. Use `load` sparingly — only for critical next steps (1-2 links max)
3. Disable for large pages — avoid prefetching pages >1MB
4. Check `navigator.connection.saveData` for user preferences
5. Combine with View Transitions — prefetch + smooth animations = perceived instant
6. Use service workers or client-side caching for prefetched pages

---

### Prefetch Edge Cases

**Authenticated routes:** Middleware can block prefetch requests.

**Dynamic content:** Prefetched pages may become stale. Use short cache TTLs or disable prefetch.

**Mobile data:** Use `tap` or `viewport` strategies on mobile.

**SEO crawlers:** Bots don't trigger prefetch. Ensure pages load without prefetch dependency.

**Large pages:** Use `data-astro-prefetch="false"` for pages over 5MB.

---

### Performance Metrics

| Strategy   | Trigger         | Data Usage | Speed Gain | Mobile-Friendly |
| ---------- | --------------- | ---------- | ---------- | --------------- |
| `load`     | Page load       | High       | Best       | Caution         |
| `hover`    | Hover (300ms)   | Medium     | Great      | N/A             |
| `tap`      | Mousedown/touch | Low        | Good       | Yes             |
| `viewport` | Enter viewport  | Medium     | Good       | Yes             |
| `false`    | Never           | None       | None       | Yes             |

---

### Prefetch References

- [Astro Prefetch](https://docs.astro.build/en/guides/prefetch/)
- [Resource Hints](https://web.dev/articles/link-prefetch)

---

## View Transitions

> Smooth page transitions with native View Transitions API

### When to Read This

- Implementing smooth page navigation
- Adding animated transitions between pages
- Customizing transition animations
- Handling transition lifecycle events
- Persisting state across page changes

---

### Basic Setup

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
    <slot />
  </body>
</html>
```

All navigation becomes SPA-like with smooth transitions.

---

### Transition Directives

### Persist Elements Across Pages

```astro
---
// Persist header across page transitions
---
<header transition:persist>
  <nav>Navigation stays mounted</nav>
</header>

<!-- Audio continues playing across pages -->
<audio transition:persist controls>
  <source src="/music.mp3" />
</audio>
```

### Animate Specific Elements

```astro
---
import { fade, slide } from 'astro:transitions';
---

<!-- Default fade -->
<div transition:animate="fade">Content</div>

<!-- Slide animation -->
<div transition:animate="slide">Slides in</div>

<!-- Custom animation -->
<div transition:animate={{ name: 'customFade', duration: '0.5s' }}>
  Custom timing
</div>
```

### Name Elements for Morph Transitions

```astro
<!-- src/pages/index.astro -->
<img src="/hero.jpg" transition:name="hero-image" />

<!-- src/pages/about.astro -->
<!-- Same transition:name creates morphing effect -->
<img src="/hero.jpg" transition:name="hero-image" />
```

---

### Custom Animations

```css
/* global.css */
@keyframes customSlide {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::view-transition-old(root) {
  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both customSlide reverse;
}

::view-transition-new(root) {
  animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both customSlide;
}
```

### Per-Element Custom Transitions

```astro
<style>
  ::view-transition-old(hero-image),
  ::view-transition-new(hero-image) {
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
  }
</style>

<img src="/hero.jpg" transition:name="hero-image" />
```

---

### Lifecycle Events

```astro
<script>
  document.addEventListener('astro:before-preparation', (event) => {
    console.log('Before new page loads');
    // Save scroll position, form state, etc.
  });

  document.addEventListener('astro:after-preparation', (event) => {
    console.log('After new page loads, before swap');
  });

  document.addEventListener('astro:before-swap', (event) => {
    console.log('Before DOM swap');
    // Clean up event listeners, timers
  });

  document.addEventListener('astro:after-swap', (event) => {
    console.log('After DOM swap, before transition');
    // Reinitialize components, restore state
  });

  document.addEventListener('astro:page-load', (event) => {
    console.log('Page fully loaded and transitioned');
    // Analytics, scroll restoration
  });
</script>
```

---

### Fallback Behavior

### Disable for Specific Links

```astro
<!-- External link (no transition) -->
<a href="https://example.com" data-astro-reload>External</a>

<!-- Force full page reload -->
<a href="/page" data-astro-reload>Full Reload</a>
```

### Conditional View Transitions

```astro
---
const isMobile = /iPhone|iPad|Android/i.test(Astro.request.headers.get('user-agent'));
---

<html>
  <head>
    {!isMobile && <ViewTransitions />}
  </head>
</html>
```

---

### Accessibility

### CRITICAL: Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01ms !important;
  }
}
```

---

### View Transitions Best Practices

1. Use `transition:persist` for elements that should maintain state (audio, video, forms)
2. Use `transition:name` for semantic morphing effects
3. Keep animations short (200-400ms) for perceived performance
4. Test on slow devices to ensure transitions don't cause jank
5. Respect user preferences with `prefers-reduced-motion`
6. Provide fallback for browsers without View Transitions API support

---

### View Transitions Edge Cases

**SPA mode conflicts:** View Transitions work best with MPA routing. Disable View Transitions if using SPA mode.

**State persistence:** Use `transition:persist` or save state in `localStorage` during lifecycle events.

**Scroll position:** Astro restores scroll by default. Use `astro:after-swap` to customize.

**External libraries:** Some libraries may not work with View Transitions. Use `data-astro-reload` for those pages.

---

### View Transitions References

- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

---

## Combined Patterns

### REQUIRED: Combine Prefetch with View Transitions

Use both together for instant-feeling animated navigation.

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
<!-- Links automatically prefetched + animated transitions -->
<a href="/about" data-astro-prefetch="hover">About</a>
```

### NEVER: Prefetch Heavy Pages Without Limits

Prefetching with `load` strategy on many links wastes bandwidth.

```javascript
// WRONG: prefetchAll with load strategy
export default defineConfig({
  prefetch: { defaultStrategy: 'load', prefetchAll: true }
});

// CORRECT: selective prefetch
export default defineConfig({
  prefetch: { defaultStrategy: 'hover' }
});
```
