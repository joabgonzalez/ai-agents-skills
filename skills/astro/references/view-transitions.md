# Astro View Transitions

> Smooth page transitions with native View Transitions API

## When to Read This

- Implementing smooth page navigation
- Adding animated transitions between pages
- Customizing transition animations
- Handling transition lifecycle events
- Persisting state across page changes

---

## Basic Setup

### ✅ Enable View Transitions

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

**Effect:** All navigation becomes SPA-like with smooth transitions.

---

## Transition Directives

### ✅ Persist Elements Across Pages

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

### ✅ Animate Specific Elements

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

### ✅ Name Elements for Morph Transitions

```astro
<!-- src/pages/index.astro -->
<img src="/hero.jpg" transition:name="hero-image" />

<!-- src/pages/about.astro -->
<!-- Same transition:name creates morphing effect -->
<img src="/hero.jpg" transition:name="hero-image" />
```

---

## Custom Animations

### ✅ Define Custom Transitions

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

### ✅ Per-Element Custom Transitions

```astro
<style>
  /* Custom transition for specific element */
  ::view-transition-old(hero-image),
  ::view-transition-new(hero-image) {
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
  }
</style>

<img src="/hero.jpg" transition:name="hero-image" />
```

---

## Lifecycle Events

### ✅ Handle Transition Events

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

## Fallback Behavior

### ✅ Disable for Specific Links

```astro
<!-- External link (no transition) -->
<a href="https://example.com" data-astro-reload>External</a>

<!-- Force full page reload -->
<a href="/page" data-astro-reload>Full Reload</a>
```

### ✅ Conditional View Transitions

```astro
---
// Disable on mobile
const isMobile = /iPhone|iPad|Android/i.test(Astro.request.headers.get('user-agent'));
---

<html>
  <head>
    {!isMobile && <ViewTransitions />}
  </head>
</html>
```

---

## Accessibility

### ⚠️ CRITICAL: Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Best Practices

1. **Use `transition:persist`** for elements that should maintain state (audio, video, forms)
2. **Name transitions** with `transition:name` for semantic morphing effects
3. **Keep animations short** (200-400ms) for perceived performance
4. **Test on slow devices** to ensure transitions don't cause jank
5. **Respect user preferences** with `prefers-reduced-motion`
6. **Provide fallback** for browsers without View Transitions API support

---

## Edge Cases

**SPA mode conflicts:** View Transitions work best with MPA routing. If using SPA mode, disable View Transitions.

**State persistence:** Use `transition:persist` or save state in `localStorage` during lifecycle events.

**Scroll position:** Astro restores scroll by default. Use `astro:after-swap` to customize.

**External libraries:** Some libraries may not work with View Transitions. Use `data-astro-reload` for those pages.

---

## References

- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
