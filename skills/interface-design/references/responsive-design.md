# Responsive Design Patterns

> Mobile-first strategy for creating layouts that adapt gracefully across all screen sizes.

## Core Patterns

- Mobile-First Breakpoint Strategy
- Standard Breakpoints (Tailwind-Aligned)
- Responsive Patterns
- Responsive Images

---

## Mobile-First Breakpoint Strategy

Start with mobile constraints (smallest screen), then progressively enhance for larger screens using `min-width` media queries.

```css
/* ✅ CORRECT: Mobile-first approach */
.container {
  padding: 1rem;         /* Mobile base (< 640px) */
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .container {
    padding: 1.5rem;     /* Tablet enhancement */
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;       /* Desktop enhancement */
    font-size: 1.125rem;
  }
}

/* ❌ WRONG: Desktop-first (requires overrides) */
.container {
  padding: 2rem;         /* Desktop base */
  font-size: 1.125rem;
}

@media (max-width: 1023px) {
  .container {
    padding: 1.5rem;     /* Override for tablet */
    font-size: 1rem;
  }
}

@media (max-width: 639px) {
  .container {
    padding: 1rem;       /* Override for mobile */
    font-size: 0.875rem;
  }
}
```

**Why mobile-first?**

1. **Performance:** Mobile users download only necessary CSS (desktop styles added progressively)
2. **Constraints:** Designing for mobile forces prioritization (what's truly essential?)
3. **Progressive enhancement:** Start with core experience, add enhancements

---

## Standard Breakpoints (Tailwind-Aligned)

| Name | Min Width | Device Type | Typical Use | Prefix |
|------|-----------|-------------|-------------|--------|
| **Base** | < 640px | Mobile phones | Default styles, no media query | (none) |
| **sm** | 640px+ | Landscape phones, small tablets | Minor layout adjustments | `sm:` |
| **md** | 768px+ | Tablets | Two-column layouts | `md:` |
| **lg** | 1024px+ | Laptops, small desktops | Sidebars, multi-column | `lg:` |
| **xl** | 1280px+ | Desktops | Wide layouts, max-width containers | `xl:` |
| **2xl** | 1536px+ | Large desktops | Ultra-wide optimizations | `2xl:` |

### Content-First Breakpoints

Break when the **content** naturally breaks, not at device sizes.

```css
/* ❌ WRONG: Device-specific thinking */
@media (min-width: 768px) { /* "iPad width" */ }
@media (min-width: 375px) { /* "iPhone X width" */ }

/* ✅ CORRECT: Content-driven thinking */
@media (min-width: 45rem) {
  /* Text line becomes uncomfortably long at ~75 characters */
  .article {
    max-width: 65ch; /* Optimal reading width */
  }
}

@media (min-width: 60rem) {
  /* Enough space for sidebar navigation */
  .layout {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}
```

**Rule:** Test by resizing browser window slowly. Add breakpoints where design naturally "breaks" (text wraps awkwardly, images too small, buttons overlap, etc.).

---

## Responsive Patterns

### 1. Container Queries

Component-level responsiveness based on container width, not viewport.

```css
/* ✅ Container query: Component adapts to its container */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
  }

  .card-image {
    aspect-ratio: 1;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
    gap: 1.5rem;
  }
}

/* ❌ WRONG: Media query (breaks in narrow sidebars) */
@media (min-width: 400px) {
  .card {
    display: grid; /* Assumes viewport, not container */
  }
}
```

**Use cases:**

- **Sidebar widgets:** Same component in wide main area vs narrow sidebar
- **Grid cards:** Cards in 1-column vs 3-column layouts need different internal layouts
- **Reusable components:** Component doesn't know where it'll be placed

**Browser support:** Chrome 105+, Safari 16+, Firefox 110+ (check caniuse.com)

---

### 2. Fluid Typography

Scale typography smoothly across screen sizes using `clamp()`.

```css
/* ✅ CORRECT: Fluid scaling with clamp() */
h1 {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 3rem);
  /* min: 1.5rem (24px), preferred: grows with viewport, max: 3rem (48px) */
}

h2 {
  font-size: clamp(1.25rem, 1rem + 1.25vw, 2rem);
  /* min: 1.25rem (20px), preferred: grows, max: 2rem (32px) */
}

p {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  /* min: 1rem (16px), preferred: grows slowly, max: 1.125rem (18px) */
}

/* ❌ WRONG: Fixed jumps at breakpoints */
h1 { font-size: 1.5rem; }
@media (min-width: 768px) { h1 { font-size: 2rem; } }
@media (min-width: 1024px) { h1 { font-size: 2.5rem; } }
@media (min-width: 1280px) { h1 { font-size: 3rem; } }
```

**clamp() formula:**

```
clamp(MIN, PREFERRED, MAX)

PREFERRED = BASE + MULTIPLIER * vw

Example breakdown:
clamp(1rem, 0.9rem + 0.5vw, 1.125rem)

At 320px viewport (3.2vw):
  0.9rem + 0.5 * 3.2 = 0.9rem + 1.6 = 2.5rem (clamped to min 1rem)

At 1024px viewport (10.24vw):
  0.9rem + 0.5 * 10.24 = 0.9rem + 5.12 = 6.02rem (clamped to max 1.125rem)

Result: Smoothly scales from 1rem to 1.125rem between 320px and 1024px
```

**Calculator tool:** https://modern-fluid-typography.vercel.app/

---

### 3. Flexible Layouts

Auto-responsive grids without manual breakpoints using `auto-fit` or `auto-fill`.

```css
/* ✅ CORRECT: Auto-wrapping grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Automatically creates:
   - 1 column at < 250px
   - 2 columns at 500-749px
   - 3 columns at 750-999px
   - 4 columns at 1000px+
   No media queries needed! */

/* ❌ WRONG: Manual breakpoint grid */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

**auto-fit vs auto-fill:**

- `auto-fit`: Collapses empty columns (stretches remaining items)
- `auto-fill`: Maintains column count even if empty (items don't stretch)

```css
/* auto-fit: 2 items stretch to fill 4-column space */
.grid-fit {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* auto-fill: 2 items in 4-column grid leave 2 empty columns */
.grid-fill {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

**Use cases:**

- Product grids (1-4 columns based on width)
- Dashboard cards
- Icon/logo lists
- Image galleries

---

### 4. Dynamic Viewport Units

Better mobile compatibility than fixed `vh` (accounts for browser UI).

```css
/* ❌ WRONG: Fixed vh conflicts with mobile browser UI */
.hero {
  height: 100vh; /* Address bar covers content on scroll */
}

/* ✅ CORRECT: Dynamic viewport height */
.hero {
  height: 100dvh; /* Adjusts for browser chrome (address bar, tab bar) */
}

.modal {
  max-height: 90dvh; /* Never exceeds visible viewport */
}
```

**Viewport unit types:**

| Unit | Name | Behavior | Use Case |
|------|------|----------|----------|
| `vh` | Viewport height (fixed) | Ignores browser UI | Avoid on mobile |
| `dvh` | Dynamic viewport height | Adjusts for browser UI | Hero sections, modals |
| `svh` | Small viewport height | Smallest possible (UI visible) | Critical content (always visible) |
| `lvh` | Large viewport height | Largest possible (UI hidden) | Full-screen experiences |

**Mobile browser UI behavior:**

- **On scroll down:** Address bar hides → viewport grows
- **On scroll up:** Address bar shows → viewport shrinks
- `100vh` = **1200px** (largest), but only **1000px** visible with address bar
- `100dvh` = **1000px** (actual visible area)

---

## Responsive Images

### srcset for Resolution Switching

```html
<!-- ✅ CORRECT: Responsive with srcset -->
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w,
    image-1600.jpg 1600w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Product photo"
/>

<!-- Browser selects:
     - image-400.jpg on mobile (320px viewport)
     - image-800.jpg on tablet (768px viewport, 50% width = 384px)
     - image-1200.jpg on desktop (1280px viewport, 33% width = 422px)
-->
```

**srcset syntax:**

- `400w` = Image width is 400px
- `sizes` = Display width at different breakpoints
- Browser calculates: `sizes` * `devicePixelRatio` → selects nearest `srcset`

### picture for Art Direction

Different images for different screen sizes (cropping, orientation).

```html
<!-- ✅ CORRECT: Art direction with picture -->
<picture>
  <source
    media="(max-width: 640px)"
    srcset="hero-mobile.jpg"
  />
  <source
    media="(max-width: 1024px)"
    srcset="hero-tablet.jpg"
  />
  <img src="hero-desktop.jpg" alt="Hero image" />
</picture>

<!-- Mobile: Square crop (portrait)
     Tablet: 16:9 crop (landscape)
     Desktop: Wide panoramic (ultra-wide) -->
```

**When to use:**

- Different crops (portrait vs landscape)
- Different focal points (zoom in on mobile)
- Different images entirely (simplified for mobile)

---

## Mobile-Specific Considerations

### Touch Targets

Minimum size for tap accuracy.

```css
/* ✅ CORRECT: Adequate touch target */
.button {
  min-width: 44px;  /* iOS guideline */
  min-height: 44px; /* 48px for Android Material Design */
  padding: 12px 24px;
}

.icon-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ❌ WRONG: Too small to tap */
.tiny-button {
  width: 24px;
  height: 24px; /* User will miss and tap wrong thing */
}
```

**Touch target guidelines:**

- **iOS:** 44x44pt minimum
- **Android (Material Design):** 48x48dp minimum
- **Spacing:** 8px minimum between touch targets

### Safe Area Insets (iOS Notch)

```css
/* ✅ Account for iPhone notch and home indicator */
.sticky-header {
  position: sticky;
  top: 0;
  top: env(safe-area-inset-top); /* iOS notch */
  padding-top: env(safe-area-inset-top);
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom); /* iOS home indicator */
}
```

**meta tag required:**

```html
<meta name="viewport" content="viewport-fit=cover">
```

### Horizontal Scrolling (Mobile Cards)

```css
/* ✅ Horizontal card list on mobile */
.card-list {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
  gap: 1rem;
  padding: 1rem;
}

.card {
  scroll-snap-align: start;
  flex: 0 0 80%; /* 80% width per card (shows next card peek) */
  min-width: 280px;
}

/* Hide scrollbar */
.card-list::-webkit-scrollbar {
  display: none;
}

.card-list {
  scrollbar-width: none; /* Firefox */
}
```

**scroll-snap benefits:**

- Cards snap to alignment (not half-visible)
- Feels native (like iOS carousel)
- No JavaScript required

---

## Testing Strategy

### 1. Browser DevTools Responsive Mode

```
Chrome/Edge:
  - Cmd+Option+M (Mac) or Ctrl+Shift+M (Windows)
  - Preset devices: iPhone 12, iPad, Galaxy S20, etc.
  - Custom dimensions

Firefox:
  - Cmd+Option+M (Mac) or Ctrl+Shift+M (Windows)
  - Responsive Design Mode
```

**Limitations:** Simulates viewport size but not actual device rendering (fonts, touch, performance).

### 2. Real Device Testing

**Essential devices to test:**

- iPhone (latest + 2-3 years old)
- Android phone (Samsung, Google Pixel)
- iPad (or Android tablet)
- Desktop browser (Chrome, Firefox, Safari)

**DevTools can't simulate:**

- Touch precision
- Actual font rendering (iOS vs Android)
- Performance (animations, scroll)
- Browser-specific bugs

### 3. Touch Testing Checklist

- [ ] All buttons are 44x44px minimum
- [ ] Touch targets have 8px spacing
- [ ] Tap feedback is instant (<100ms)
- [ ] Horizontal scroll works smoothly
- [ ] Pinch-zoom disabled for app UI (enabled for content)
- [ ] Form inputs trigger correct keyboard (tel, email, number)

### 4. Orientation Testing

Test both portrait and landscape.

```css
/* ✅ Landscape-specific styles */
@media (orientation: landscape) {
  .hero {
    height: 100dvh;
    display: flex;
    align-items: center;
  }
}

@media (orientation: portrait) {
  .hero {
    height: auto;
    padding: 3rem 1rem;
  }
}
```

### 5. Content Extremes

Test with:

- **Long text:** User names, product titles
- **Missing images:** Broken src, slow network
- **Empty states:** No data, no results
- **Large datasets:** 100+ list items

---

## Responsive Layout Patterns

### Stack → Sidebar

```css
/* Mobile: Stack */
.layout {
  display: flex;
  flex-direction: column;
}

/* Desktop: Sidebar */
@media (min-width: 1024px) {
  .layout {
    flex-direction: row;
  }

  .sidebar {
    width: 250px;
    flex-shrink: 0;
  }

  .main {
    flex: 1;
  }
}
```

### Column Count Responsive

```css
/* Mobile: 1 column */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Hide/Show Elements

```css
/* Mobile: Hide desktop nav */
.desktop-nav {
  display: none;
}

.mobile-menu-button {
  display: block;
}

/* Desktop: Show desktop nav */
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }

  .mobile-menu-button {
    display: none;
  }
}
```

---

## Related Topics

- See [visual-design.md](visual-design.md) for spacing system and typography scale
- See [interaction-design.md](interaction-design.md) for mobile gestures and touch feedback
- See main [SKILL.md](../SKILL.md) for responsive planning in UX process
- See [tailwindcss](../../tailwindcss/SKILL.md) for responsive utility classes
