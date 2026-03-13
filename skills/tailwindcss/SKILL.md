---
name: tailwindcss
description: "Utility-first CSS with responsive design. Trigger: When styling with Tailwind utilities, creating responsive designs, or configuring Tailwind."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: tooling
  skills:
    - a11y
  dependencies:
    tailwindcss: ">=3.0.0 <5.0.0"
---

# Tailwind CSS

Utility-first CSS for responsive UIs with composable classes and configuration.

## When to Use

Use when:

- Styling with utility-first CSS
- Responsive designs with breakpoints
- Theme config (colors, spacing, typography)
- Custom utilities/plugins

Don't use for: MUI (use mui skill), plain CSS (use css skill), complex animations (use css skill).

---

## Critical Patterns

### ✅ REQUIRED: Use Utility Classes

```html
<!-- CORRECT -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click Me
</button>

<!-- WRONG: custom CSS for basic styling -->
<button class="custom-button">Click Me</button>
<style>.custom-button { background: blue; padding: 8px 16px; }</style>
```

### ✅ REQUIRED: Configure Theme (Tailwind 3)

```javascript
// CORRECT: extend theme
module.exports = {
  theme: {
    extend: {
      colors: { brand: '#1976d2' },
    },
  },
};

// WRONG: hardcoding hex in classes
// <div class="bg-[#1976d2]"> — use theme colors instead
```

### ✅ REQUIRED: Define Themes with @theme (Tailwind 4+)

```css
/* CORRECT */
@theme {
  --color-primary: #4f46e5;
  --color-secondary: #9333ea;
  --font-sans: "Inter", sans-serif;
  --radius-md: 0.375rem;
}
/* Use: <div class="bg-primary text-secondary"> */

/* WRONG in Tailwind 4+: using tailwind.config.js for theme tokens */
```

### ❌ NEVER: @apply Overuse

```css
/* WRONG: defeats utility-first purpose */
.btn {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}

/* CORRECT: use utilities directly in HTML */
```

### ✅ REQUIRED: @apply for Shared Component Patterns Only

```css
/* CORRECT: reusable patterns shared across multiple components */
.card-base {
  @apply rounded-lg shadow-md p-6 bg-white;
}

/* WRONG: single-use classes — use utilities directly */
```

---

## Conventions

### Token Hierarchy

Three layers:

**1. Brand:** Raw OKLCH (`--color-brand-blue: oklch(45% 0.2 260)`)

**2. Semantic:** Purpose names (`--color-primary`, `--color-destructive`)

**3. Component:** Implementations (`.btn-primary { @apply bg-primary; }`)

See [design-system.md](references/design-system.md) for token architecture, CVA patterns, dark mode.

### Tailwind v4

CSS-first config with `@theme` blocks and OKLCH.

**Changes:** `@import 'tailwindcss'` replaces `@tailwind`; `@theme` replaces config; `@custom-variant dark` replaces `darkMode: "class"`

**New:** `size-*` shorthand, improved spacing, tree-shakeable animations

See [tailwind-v4.md](references/tailwind-v4.md) for migration, breaking changes, OKLCH syntax.

---

## Decision Tree

```
Building a design system?
  → See design-system.md for token hierarchy, semantic naming, CVA patterns

Migrating to Tailwind v4?
  → See tailwind-v4.md for migration checklist, breaking changes, new utilities

Component with variants (size/color/state)?
  → Use CVA (Class Variance Authority) from design-system.md

Tailwind class exists?
  → Use utility class directly (e.g. bg-blue-500)

Dynamic value?
  → Inline style for computed values or arbitrary class (e.g. w-[137px])

Conditional styles?
  → Use clsx/cn: cn("base", condition && "variant")

Reusable component style?
  → Create component with utilities; avoid @apply

Custom color/spacing?
  → Add to theme.extend in config (v3) or @theme block (v4+)

Responsive?
  → Breakpoint prefixes: md:flex lg:grid

Dark mode?
  → v3: Enable in config. v4: Use @custom-variant dark (see tailwind-v4.md)

Production build?
  → Ensure all template paths in content array or classes get purged

Custom animations?
  → v3: Extend theme.animation. v4: Use @keyframes in @theme (see tailwind-v4.md)
```

---

## Example

```html
<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold text-gray-900 mb-4">Title</h1>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Click Me
  </button>
</div>
```

```javascript
// tailwind.config.js (v3)
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  darkMode: "class",
  theme: {
    extend: { colors: { brand: "#1976d2" } },
  },
};
```

### Dark Mode

```html
<html class="dark">
  <div class="bg-white dark:bg-gray-900 text-black dark:text-white">
    Content adapts to dark mode
  </div>
</html>
```

---

## Edge Cases

- **Arbitrary values:** `w-[137px]` — avoid; extend theme
- **Specificity:** Utilities same specificity; HTML order matters; use `!` sparingly
- **Purge config:** All paths in `content` or classes removed in prod
- **Third-party:** Inline styles override; use `!important` or wrappers
- **@layer:** `@layer components` for components, `@layer utilities` for custom

---

## Checklist

- [ ] Utility classes used over custom CSS
- [ ] Theme values in config (v3) or `@theme` (v4+)
- [ ] `content` paths cover all templates
- [ ] `@apply` used sparingly (shared patterns only)
- [ ] Responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoints
- [ ] Dark mode configured and `dark:` prefixes applied
- [ ] Arbitrary values `[value]` minimized
- [ ] Focus/accessibility utilities included
- [ ] Production build tested (no missing classes)
- [ ] Dynamic class names avoided (Tailwind cannot detect them)

---

## Resources

- [design-system.md](references/design-system.md) — Token hierarchy, semantic naming, CVA patterns, dark mode, color mixing
- [tailwind-v4.md](references/tailwind-v4.md) — v4 migration guide, OKLCH colors, @theme blocks, new utilities
- https://tailwindcss.com/docs — Official documentation
- https://cva.style/docs — Class Variance Authority (CVA) for type-safe variants
- https://oklch.com/ — OKLCH color picker and converter
