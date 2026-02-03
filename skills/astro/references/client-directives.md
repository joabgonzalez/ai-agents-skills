# Client Directives

> Hydration strategies for adding interactivity with minimal JavaScript

## When to Read This

- Adding interactive components to Astro pages
- Choosing the right hydration strategy
- Optimizing JavaScript bundle size
- Understanding client:load, client:visible, client:idle, client:only

---

## Directive Comparison

| Directive        | When JS Loads                | Use Case                  | Bundle Impact |
| ---------------- | ---------------------------- | ------------------------- | ------------- |
| `client:load`    | Immediately on page load     | Critical UI (nav, modals) | High priority |
| `client:visible` | When element enters viewport | Below-fold content        | Lazy loaded   |
| `client:idle`    | After page becomes idle      | Non-critical features     | Low priority  |
| `client:media`   | When media query matches     | Responsive components     | Conditional   |
| `client:only`    | Client-side only (no SSR)    | Browser-only APIs         | CSR only      |
| (no directive)   | Never                        | Static components         | Zero JS       |

---

## client:load (Immediate)

### ✅ When to Use

- Critical UI components
- Above-the-fold interactivity
- Components users immediately interact with

```astro
---
import Navigation from '../components/Navigation';
import SearchBar from '../components/SearchBar';
---

<!-- Loads immediately -->
<Navigation client:load />
<SearchBar client:load />
```

**Warning:** Every `client:load` adds to initial bundle. Use sparingly.

---

## client:visible (Lazy Load)

### ✅ When to Use

- Below-the-fold components
- Content that appears on scroll
- Conditional features

```astro
---
import Comments from '../components/Comments';
import Newsletter from '../components/Newsletter';
import RelatedPosts from '../components/RelatedPosts';
---

<article>
  <h1>Blog Post</h1>
  <div>Content...</div>
</article>

<!-- Loads when scrolled into view -->
<Comments client:visible />
<Newsletter client:visible />
<RelatedPosts client:visible />
```

**Benefit:** Reduces initial JavaScript, improves Time to Interactive (TTI).

---

## client:idle (Low Priority)

### ✅ When to Use

- Non-critical features
- Analytics, tracking
- Features users may not use immediately

```astro
---
import ChatWidget from '../components/ChatWidget';
import Analytics from '../components/Analytics';
import SocialShare from '../components/SocialShare';
---

<!-- Loads after browser is idle -->
<ChatWidget client:idle />
<Analytics client:idle />
<SocialShare client:idle />
```

**Benefit:** Doesn't block page load or user interaction.

---

## client:media (Responsive)

### ✅ When to Use

- Mobile vs desktop components
- Conditional features based on screen size

```astro
---
import MobileNav from '../components/MobileNav';
import DesktopNav from '../components/DesktopNav';
---

<!-- Loads only on mobile -->
<MobileNav client:media="(max-width: 768px)" />

<!-- Loads only on desktop -->
<DesktopNav client:media="(min-width: 769px)" />
```

---

## client:only (Client-Side Rendering)

### ✅ When to Use

- Components using browser-only APIs (window, document)
- Third-party widgets (Google Maps, Stripe)
- Libraries that break during SSR

```astro
---
import MapWidget from '../components/MapWidget';
import StripeCheckout from '../components/StripeCheckout';
---

<!-- No SSR, only runs in browser -->
<MapWidget client:only="react" />
<StripeCheckout client:only="react" />
```

**Drawback:** No SEO, no server rendering, potential layout shift.

---

## No Directive (Static)

### ✅ When to Use

- Static content (headers, footers, text)
- Components without interactivity
- Pure presentation components

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<!-- No JavaScript, pure HTML -->
<Header />
<main>
  <h1>Content</h1>
</main>
<Footer />
```

**Benefit:** Zero JavaScript, fastest performance, best for static content.

---

## Performance Impact

### Bundle Size Comparison

```astro
---
import Counter from '../components/Counter'; // 5KB component
---

<!-- Option 1: 5KB immediately -->
<Counter client:load />

<!-- Option 2: 5KB when visible (lazy) -->
<Counter client:visible />

<!-- Option 3: 5KB when idle -->
<Counter client:idle />

<!-- Option 4: 0KB (no JS) -->
<!-- Can't use Counter without directive if it needs state -->
```

### Multiple Components

```astro
<!-- ❌ BAD: 50KB JavaScript immediately -->
<ComponentA client:load /> <!-- 10KB -->
<ComponentB client:load /> <!-- 10KB -->
<ComponentC client:load /> <!-- 10KB -->
<ComponentD client:load /> <!-- 10KB -->
<ComponentE client:load /> <!-- 10KB -->

<!-- ✅ GOOD: 10KB immediately, 40KB lazy loaded -->
<ComponentA client:load /> <!-- Critical: 10KB -->
<ComponentB client:visible /> <!-- Below fold: 10KB -->
<ComponentC client:visible /> <!-- Below fold: 10KB -->
<ComponentD client:idle /> <!-- Non-critical: 10KB -->
<ComponentE client:idle /> <!-- Non-critical: 10KB -->
```

---

## Decision Tree

**Is component interactive?**

- No → No directive (static HTML)
- Yes → Continue

**Does it use browser-only APIs (window, document)?**

- Yes → `client:only`
- No → Continue

**Is it critical for initial UX (navigation, search)?**

- Yes → `client:load`
- No → Continue

**Is it visible on page load (above fold)?**

- No → `client:visible` (lazy load when scrolled into view)
- Yes → Continue

**Is it essential for user's first interaction?**

- No → `client:idle` (load after page is interactive)
- Yes → `client:load`

**Is it responsive (mobile/desktop specific)?**

- Yes → `client:media="(condition)"`

---

## Common Patterns

### ✅ Progressive Enhancement

```astro
---
import Accordion from '../components/Accordion';
---

<!-- Works without JS (CSS-only), enhanced with JS -->
<Accordion client:visible />
```

### ✅ Critical + Non-Critical

```astro
<!-- Critical: Nav must work immediately -->
<Navigation client:load />

<!-- Non-critical: Chat can load later -->
<ChatWidget client:idle />
```

### ✅ Conditional Rendering

```astro
---
import AdminPanel from '../components/AdminPanel';
const user = Astro.locals.user;
---

{user?.role === 'admin' && (
  <AdminPanel client:load />
)}
```

---

## References

- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Partial Hydration](https://docs.astro.build/en/concepts/islands/)
