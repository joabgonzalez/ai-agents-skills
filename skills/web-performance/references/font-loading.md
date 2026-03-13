# Font Loading

> font-display strategies, preloading, fallback fonts, and CLS elimination

## Core Patterns

- font-display Values
- Preloading Fonts
- Fallback Font Tuning
- Google Fonts and Third-Party Fonts

---

## font-display Values

### Choose Strategy Based on Priority

```css
/* swap: fallback text visible immediately, custom font replaces it
   Best for: body text where readability matters more than perfect appearance */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}

/* optional: show fallback; only use custom font if cached or loads instantly
   Best for: minimal CLS requirement; users may always see fallback on first load */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: optional;
}

/* fallback: 100ms invisible, then fallback; custom font replaces if loads fast
   Best for: balance between readability and brand consistency */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: fallback;
}

/* block: up to 3s invisible text (FOIT) — avoid in production */
/* auto: browser decides — unpredictable across browsers */
```

| Strategy | Invisible text | CLS risk | Use when |
| -------- | -------------- | -------- | -------- |
| `swap` | None | Medium | Body text, readability critical |
| `fallback` | 100ms | Low | Balance brand vs readability |
| `optional` | 100ms | None | CLS is top priority |
| `block` | Up to 3s | None | Icon fonts only |

---

## Preloading Fonts

### Preload Self-Hosted Fonts

```html
<!-- In <head>, before stylesheets — loads font alongside HTML parse -->
<link
  rel="preload"
  href="/fonts/inter-regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- ⚠️ crossorigin is REQUIRED even for same-origin fonts
     Without it, the preloaded font is ignored and re-fetched -->
```

Preload only the most critical weight/style (e.g., regular 400). Each preload tag adds a high-priority request — preloading 5 fonts creates 5 competing high-priority requests.

### Preconnect for Third-Party Fonts

```html
<!-- Establish connection early for Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Then the actual stylesheet -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600"
      rel="stylesheet" />
```

---

## Fallback Font Tuning

Reduce CLS when `font-display: swap` causes font swap by making the fallback match the custom font's metrics.

### size-adjust and Metric Overrides

```css
/* Step 1: Measure your custom font's metrics with Fontpie or Capsize */
/* Step 2: Apply overrides to the fallback */

@font-face {
  font-family: 'InterFallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body {
  font-family: 'Inter', 'InterFallback', sans-serif;
}
```

Tools: [Fontpie](https://fontpie.vercel.app/), [Capsize](https://seek-oss.github.io/capsize/), Next.js `next/font` (handles this automatically).

### Variable Fonts — One File, Multiple Weights

```css
/* ✅ One variable font file replaces multiple weight files */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900; /* entire weight range */
  font-display: swap;
}

/* Use any weight without additional HTTP requests */
h1 { font-weight: 700; }
p  { font-weight: 400; }
.caption { font-weight: 300; }
```

Variable fonts reduce HTTP requests. Typical saving: 4 weight files (100KB each) → 1 variable font (~60KB).

---

## Google Fonts and Third-Party Fonts

### Self-Host for Best Performance

Third-party font CDNs (Google Fonts, Adobe Fonts) add a cross-origin request, DNS lookup, and connection overhead. Self-hosting eliminates these.

```bash
# Download Google Fonts for self-hosting with google-webfonts-helper
# or Fontsource npm packages
npm install @fontsource/inter
```

```javascript
// In your app entry point (Next.js, Vite, etc.)
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
```

### If You Must Use Google Fonts

```html
<!-- ✅ Minimum latency Google Fonts setup -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
      rel="stylesheet" />
<!-- display=swap sets font-display: swap for all fonts in the request -->
```

Add `&display=optional` instead of `&display=swap` to eliminate CLS at the cost of showing fallback on first visit.

### Next.js next/font (Automatic Optimization)

```javascript
// ✅ Zero CLS: next/font handles preload, size-adjust, and self-hosting
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',       // or 'optional' for zero CLS
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return <html className={inter.variable}>{children}</html>;
}
```

---

## Common Pitfalls

**Preloading without `crossorigin`:** The preloaded font is ignored; browser fetches it again from the stylesheet. Always add `crossorigin` to font preload tags.

**Preloading all font weights:** Preloading 5 weights = 5 competing high-priority requests. Preload only the weight visible above the fold (usually regular 400).

**`font-display: block` for body text:** Blocks text for up to 3 seconds on slow connections — FOIT (Flash of Invisible Text). Only use `block` for icon fonts where text is meaningless without the font.

**Not subsetting fonts:** A full Inter font family is ~200KB. Latin subset is ~30KB. Always use `unicode-range` or subsetting tools.

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* Latin subset */
  font-display: swap;
}
```

---

## Related Topics

- [core-web-vitals.md](core-web-vitals.md) — CLS and LCP affected by font loading
- [resource-optimization.md](resource-optimization.md) — Font as part of total page weight budget
- [image-video.md](image-video.md) — Image optimization alongside fonts
