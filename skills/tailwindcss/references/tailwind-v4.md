# Tailwind CSS v4 Migration Guide

CSS-first configuration using `@theme` blocks, OKLCH colors, `size-*` utilities, and `@custom-variant` dark mode replace JavaScript config patterns.

---

## Core Patterns

- CSS-First Configuration
- @theme Blocks
- OKLCH Color Space
- New Utilities

---

## CSS-First Configuration

### Before (v3): JavaScript Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#9333ea',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
};
```

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### After (v4): CSS-First

```css
/* globals.css */
@import 'tailwindcss';

@theme {
  /* Colors */
  --color-primary: #4f46e5;
  --color-secondary: #9333ea;

  /* Typography */
  --font-family-sans: Inter, sans-serif;

  /* Spacing */
  --spacing-128: 32rem;
}
```

**Benefits:**

- No JavaScript config needed (unless using plugins)
- Faster builds (CSS parsing > JS execution)
- Better IDE support (CSS IntelliSense)
- Clearer source of truth (all in CSS)

---

## @theme Blocks

Define all customization in `@theme` blocks.

### Colors

```css
@theme {
  /* Brand colors (OKLCH recommended) */
  --color-primary: oklch(60% 0.2 260);
  --color-secondary: oklch(70% 0.15 300);
  --color-accent: oklch(65% 0.18 140);

  /* Or hex (converted to OKLCH internally) */
  --color-brand: #4f46e5;
}

/* Usage */
<div class="bg-primary text-secondary">Content</div>
```

### Typography

```css
@theme {
  --font-family-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-family-serif: Merriweather, ui-serif, Georgia, serif;
  --font-family-mono: 'Fira Code', ui-monospace, monospace;

  /* Font sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

### Spacing

```css
@theme {
  --spacing-0: 0px;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  /* ... */
  --spacing-128: 32rem;
}
```

### Breakpoints

```css
@theme {
  --breakpoint-sm: 40rem;    /* 640px */
  --breakpoint-md: 48rem;    /* 768px */
  --breakpoint-lg: 64rem;    /* 1024px */
  --breakpoint-xl: 80rem;    /* 1280px */
  --breakpoint-2xl: 96rem;   /* 1536px */
}
```

---

## OKLCH Color Space

OKLCH provides better perceptual uniformity than HSL/RGB.

### Syntax

```
oklch(L% C H)

L = Lightness (0-100%)
C = Chroma (saturation, 0-0.4 typical)
H = Hue (0-360 degrees)
```

### Examples

```css
@theme {
  /* Blue spectrum */
  --color-blue-light: oklch(70% 0.2 260);
  --color-blue-base: oklch(60% 0.2 260);
  --color-blue-dark: oklch(40% 0.2 260);

  /* Green spectrum */
  --color-green-light: oklch(75% 0.15 140);
  --color-green-base: oklch(60% 0.15 140);
  --color-green-dark: oklch(40% 0.15 140);

  /* Neutral gray (C = 0) */
  --color-gray-50: oklch(98% 0 0);
  --color-gray-100: oklch(96% 0 0);
  /* ... */
  --color-gray-900: oklch(20% 0 0);
  --color-gray-950: oklch(15% 0 0);
}
```

### Why OKLCH?

| Feature | HSL | RGB | OKLCH |
|---------|-----|-----|-------|
| Perceptual uniformity | ❌ | ❌ | ✅ |
| Predictable lightness | ❌ | ❌ | ✅ |
| Better gradients | ❌ | ❌ | ✅ |
| Wide gamut (P3) | ❌ | ❌ | ✅ |

**Example: Gradient**

```css
/* HSL: Muddy midtone */
background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(240, 100%, 50%));

/* OKLCH: Smooth, vibrant */
background: linear-gradient(to right, oklch(60% 0.2 25), oklch(60% 0.2 260));
```

---

## New Utilities

### size-* Shorthand

Replaces separate `w-*` and `h-*` utilities.

```html
<!-- v3: Separate width/height -->
<div class="w-10 h-10"></div>
<div class="w-full h-screen"></div>

<!-- v4: Single size utility -->
<div class="size-10"></div>
<div class="size-full"></div>
```

**When to use:**

- Square elements (icons, avatars, buttons)
- Full-width/height containers

**When to use separate w/h:**

- Rectangular elements (cards, images)
- Different responsive sizing (w-full md:w-1/2 h-64 md:h-96)

### Improved Spacing

More intuitive spacing values aligned with rem units.

```css
/* v4: Clearer rem-based spacing */
--spacing-0: 0rem;
--spacing-px: 1px;
--spacing-0.5: 0.125rem;  /* 2px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-1.5: 0.375rem;  /* 6px */
--spacing-2: 0.5rem;      /* 8px */
/* ... */
```

---

## Native Dark Mode

Use `@custom-variant` for dark mode instead of config-based approach.

### Before (v3): Config-Based

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
};
```

```html
<div class="bg-white dark:bg-gray-900">Content</div>
```

### After (v4): @custom-variant

```css
@custom-variant dark (&:where(.dark, .dark *));

/* Usage: Same as v3 */
<div class="bg-white dark:bg-gray-900">Content</div>
```

**Why better?**

- No config needed
- More flexible (can create custom variants)
- Consistent with CSS-first approach

### Custom Variants Example

```css
/* Reduced motion variant */
@custom-variant motion-safe (&:where(:not([data-motion="reduce"])));

/* High contrast variant */
@custom-variant high-contrast (&:where([data-contrast="high"], [data-contrast="high"] *));

/* Usage */
<div class="transition motion-safe:duration-300">Animated</div>
<div class="border high-contrast:border-2">High contrast border</div>
```

---

## Animation in @theme

Place `@keyframes` inside `@theme` blocks for tree-shakeable animations.

### Before (v3): Config + Global Keyframes

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
      },
    },
  },
};
```

```css
/* All @keyframes always in bundle */
@keyframes fadeIn { /* ... */ }
```

### After (v4): @theme with Tree-Shaking

```css
@theme {
  --animate-fade-in: fade-in 0.3s ease-in;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-spin: spin 1s linear infinite;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

/* Only referenced @keyframes included in build */
```

**Benefits:**

- Tree-shaking: Unused animations removed
- Scoped: No global namespace pollution
- Smaller bundles: Only ship what you use

---

## Migration Checklist

### Step 1: Update Dependencies

```bash
npm install -D tailwindcss@next
# or
pnpm add -D tailwindcss@next
```

### Step 2: Replace @tailwind with @import

```css
/* ❌ OLD: v3 syntax */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ NEW: v4 syntax */
@import 'tailwindcss';
```

### Step 3: Move theme.extend to @theme

```javascript
// ❌ OLD: tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#4f46e5' },
    },
  },
};
```

```css
/* ✅ NEW: @theme block */
@theme {
  --color-primary: #4f46e5;
}
```

### Step 4: Convert Colors to OKLCH (Recommended)

```css
/* Before: Hex/RGB */
@theme {
  --color-primary: #4f46e5;
}

/* After: OKLCH (better gradients, perceptual uniformity) */
@theme {
  --color-primary: oklch(60% 0.2 260);
}
```

**Conversion tool:** https://oklch.com/

### Step 5: Move @keyframes into @theme

```css
/* ❌ OLD: Global @keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ✅ NEW: @keyframes in @theme */
@theme {
  --animate-fade-in: fade-in 0.3s ease-in;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

### Step 6: Update Dark Mode to @custom-variant

```javascript
// ❌ OLD: tailwind.config.js
module.exports = {
  darkMode: 'class',
};
```

```css
/* ✅ NEW: @custom-variant */
@custom-variant dark (&:where(.dark, .dark *));
```

### Step 7: Test Build

```bash
npm run build
# Verify all utilities work
# Check dark mode
# Test animations
```

### Step 8: Remove tailwind.config.js (Optional)

If you've moved everything to CSS:

```bash
rm tailwind.config.js
```

**Keep if:**

- Using plugins (still require config)
- Complex content paths
- Custom safelist

---

## Breaking Changes

### Removed Utilities

| v3 Utility | v4 Replacement |
|------------|----------------|
| `w-{n} h-{n}` (for squares) | `size-{n}` |
| `divide-*` | Use `border-*` on children |
| `ring-offset-*` (deprecated colors) | Use semantic color tokens |

### Config Changes

| v3 | v4 |
|----|-----|
| `tailwind.config.js` theme | `@theme` blocks in CSS |
| `darkMode: "class"` | `@custom-variant dark` |
| `@tailwind` directives | `@import 'tailwindcss'` |

### Plugin API Changes

Plugins still use `tailwind.config.js`, but with updated API:

```javascript
// v4 plugin example
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, theme }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};
```

---

## Common Patterns

### Full v4 Setup

```css
/* globals.css */
@import 'tailwindcss';

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Theme configuration */
@theme {
  /* Colors (OKLCH) */
  --color-primary: oklch(60% 0.2 260);
  --color-secondary: oklch(70% 0.15 300);
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0 0);

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    --color-background: oklch(15% 0 0);
    --color-foreground: oklch(95% 0 0);
  }

  /* Typography */
  --font-family-sans: Inter, system-ui, sans-serif;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Spacing */
  --spacing-128: 32rem;

  /* Animations */
  --animate-fade-in: fade-in 0.3s ease-in;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

### Minimal Config (Plugins Only)

```javascript
// tailwind.config.js (only if using plugins)
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

---

## Troubleshooting

### Issue: Utilities Not Working

**Cause:** Missing `@import 'tailwindcss'`

**Fix:**

```css
/* Add to main CSS file */
@import 'tailwindcss';
```

### Issue: Dark Mode Not Working

**Cause:** Missing `@custom-variant dark`

**Fix:**

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### Issue: Animations Not Compiling

**Cause:** @keyframes outside @theme block

**Fix:**

```css
/* ❌ WRONG */
@keyframes spin { /* ... */ }

/* ✅ CORRECT */
@theme {
  @keyframes spin { /* ... */ }
}
```

### Issue: Custom Colors Not Available

**Cause:** Missing `--color-` prefix

**Fix:**

```css
/* ❌ WRONG */
@theme {
  primary: #4f46e5;
}

/* ✅ CORRECT */
@theme {
  --color-primary: #4f46e5;
}
```

---

## Container Queries

Native container queries replace the need for media-query workarounds. Components respond to their parent container's size, not the viewport.

### Enable Container Queries

```html
<!-- ✅ Mark parent as a container -->
<div class="@container">
  <!-- Child uses @{size}: variants -->
  <div class="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    <!-- 1 column by default, 2 at container ≥28rem, 3 at ≥32rem -->
  </div>
</div>
```

### Named Containers

```html
<!-- ✅ Named containers for nested container queries -->
<div class="@container/card">
  <div class="@container/sidebar">
    <p class="text-sm @md/card:text-base @lg/card:text-lg">
      Text size responds to "card" container, not "sidebar"
    </p>
  </div>
</div>
```

### Container Query Sizes

| Variant | Min-width |
| ------- | --------- |
| `@xs:`  | 20rem (320px) |
| `@sm:`  | 24rem (384px) |
| `@md:`  | 28rem (448px) |
| `@lg:`  | 32rem (512px) |
| `@xl:`  | 36rem (576px) |
| `@2xl:` | 42rem (672px) |

### Custom Container Size

```css
@theme { --container-card: 400px; } /* enables @card: variant */
```

### vs Media Queries

Use container queries for reusable components (cards, sidebars, widgets) that may appear in different contexts. Use media queries for page-level layout changes.

---

## @utility Directive

Register custom utility classes with full Tailwind integration (variants, responsive, hover, etc.).

### Before (v3): @layer utilities

```css
/* ❌ v3 approach — less integrated */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

### After (v4): @utility

```css
/* ✅ v4 — works with all Tailwind variants */
@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

```html
<!-- ✅ Now supports hover:, focus:, dark:, responsive prefixes -->
<div class="scrollbar-hide hover:scrollbar-hide md:scrollbar-hide">...</div>
```

### Custom Utilities with Values

```css
/* ✅ Custom utility that accepts Tailwind spacing values */
@utility tab-size-* {
  tab-size: --value(--spacing-*);
}
```

```html
<pre class="tab-size-4">  indented code</pre>
```

### When to Use @utility vs @apply

```
Custom single-property utilities → @utility
Reusable component styles (multiple properties) → @apply in @layer components
One-off styles → inline Tailwind utilities
```

---

## starting: Variant (Enter Animations)

The `starting:` variant applies styles before an element's first paint — enabling CSS-only enter animations.

### Basic Enter Animation

```html
<!-- ✅ Element enters with fade-in from below -->
<div class="
  opacity-100 translate-y-0 transition duration-300
  starting:opacity-0 starting:translate-y-2
">
  Animates in on first render
</div>
```

### Dialog / Modal Enter

```html
<!-- ✅ CSS-only dialog enter animation -->
<dialog open class="
  opacity-100 scale-100 transition duration-200
  starting:opacity-0 starting:scale-95
">
  <p>Dialog content</p>
</dialog>
```

### Toast Notification

```html
<!-- ✅ Toast slides up on appear -->
<div class="
  translate-y-0 opacity-100 transition-all duration-300 ease-out
  starting:translate-y-4 starting:opacity-0
">
  Item saved successfully
</div>
```

**Browser support:** Chrome 117+, Firefox 129+, Safari 17.5+. For wider support, use JavaScript-controlled class toggling.

---

## Related Topics

- See [design-system.md](design-system.md) for token hierarchy, semantic naming, CVA patterns
- See [interface-design/visual-design.md](../../interface-design/references/visual-design.md) for color/typography/spacing foundations
- See main [SKILL.md](../SKILL.md) for Tailwind utilities and general usage
- Official docs: https://tailwindcss.com/docs (v4 beta)
