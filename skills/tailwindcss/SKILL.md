---
name: tailwindcss
description: "Utility-first CSS with responsive design. Trigger: When styling with Tailwind utilities, creating responsive designs, or configuring Tailwind."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - a11y
    - css
    - humanizer
  dependencies:
    tailwindcss: ">=3.0.0 <5.0.0"
---

# Tailwind CSS Skill

Utility-first CSS framework for building responsive, maintainable UIs with composable utility classes and a robust configuration system.

## When to Use

Use when:

- Styling components with utility-first CSS
- Creating responsive designs with Tailwind breakpoints
- Configuring theme (colors, spacing, typography)
- Building custom utilities or plugins

Don't use for MUI styling (use mui skill), plain CSS (use css skill), or complex custom animations (use css skill).

## Critical Patterns

### Use Utility Classes

```html
<!-- CORRECT -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click Me
</button>

<!-- WRONG: custom CSS for basic styling -->
<button class="custom-button">Click Me</button>
<style>.custom-button { background: blue; padding: 8px 16px; }</style>
```

### Configure Theme (Tailwind 3)

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

### Define Themes with @theme (Tailwind 4+)

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

### Avoid @apply Overuse

```css
/* WRONG: defeats utility-first purpose */
.btn {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}

/* CORRECT: use utilities directly in HTML */
```

### @apply for Shared Component Patterns Only

```css
/* CORRECT: reusable patterns shared across multiple components */
.card-base {
  @apply rounded-lg shadow-md p-6 bg-white;
}

/* WRONG: single-use classes — use utilities directly */
```

Conventions: follow **conventions** skill for organization; **a11y** for contrast/focus; **css** for custom CSS fallbacks.

## Decision Tree

**Tailwind class exists?** -> Use utility: `className="bg-blue-500"`.

**Dynamic value?** -> Inline style: `style={{ width: \`${percent}%\` }}` or arbitrary: `w-[137px]`.

**Conditional styles?** -> Use clsx/cn: `cn("base", condition && "variant")`.

**Reusable component style?** -> Create component with utilities; avoid @apply.

**Custom color/spacing?** -> Add to `theme.extend` in config (v3) or `@theme` block (v4+).

**Responsive?** -> Breakpoint prefixes: `md:flex lg:grid`.

**Dark mode?** -> Enable in config, use `dark:` prefix: `dark:bg-gray-800`.

**Production build?** -> Ensure all template paths in `content` array or classes get purged.

**Custom animations?** -> Extend `theme.animation` and `theme.keyframes` in config.

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

## Edge Cases

- **Arbitrary values:** `w-[137px]`, `top-[117px]` — avoid overuse; extend theme instead
- **Specificity conflicts:** Utilities share specificity; HTML order matters; use `!` prefix sparingly
- **Purge/content config:** All template paths must be in `content` array or classes are removed in production
- **Third-party components:** May use inline styles that override Tailwind; use `!important` or wrapper divs
- **@layer directive:** Use `@layer components` for component styles, `@layer utilities` for custom utilities

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

## Resources

- https://tailwindcss.com/docs
- https://tailwindcss.com/docs/configuration
