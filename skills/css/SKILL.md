---
name: css
description: "Modern CSS with Grid, Flexbox, and custom properties. Trigger: When writing CSS styles, implementing layouts, or using modern features."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - a11y
    - humanizer
  allowed-tools:
    - file-reader
---

# CSS Modern Skill

Write maintainable, performant CSS using modern features: Grid, Flexbox, custom properties, container queries, and cascade layers.

## When to Use

Use when:

- Writing CSS styles for layouts and components
- Implementing responsive designs with Grid/Flexbox
- Using custom properties, container queries, `@layer`
- Creating animations and transitions

Don't use for Tailwind utilities (use tailwindcss skill) or MUI sx prop (use mui skill).

## Critical Patterns

### Custom Properties for Theming

```css
/* CORRECT */
:root {
  --color-primary: #0066cc;
  --spacing: 1rem;
}
.button {
  background: var(--color-primary);
  padding: var(--spacing);
}

/* WRONG: hardcoded values */
.button {
  background: #0066cc;
  padding: 1rem;
}
```

### Grid/Flexbox Over Floats

```css
/* CORRECT */
.container {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

/* WRONG: floats */
.container {
  float: left;
  clear: both;
}
```

### Respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Modern Responsive Patterns

```css
/* Fluid typography */
h1 { font-size: clamp(2rem, 5vw, 4rem); }

/* Container queries */
@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}

/* Modern aspect ratio (not padding hack) */
.video-container { aspect-ratio: 16 / 9; }
```

### Modern Selectors

```css
:is(h1, h2, h3) { color: var(--color-heading); }
:where(ul, ol) { padding-left: 1rem; }       /* zero specificity */
.card:has(img) { display: grid; }             /* parent selection */
```

### Cascade Layers

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
@layer base {
  body { font-family: system-ui, sans-serif; }
}
@layer components {
  .button { padding: 0.5rem 1rem; }
}
@layer utilities {
  .text-center { text-align: center; }
}
```

Conventions: follow **conventions** skill for naming/organization; follow **a11y** skill for contrast, focus indicators, and accessible animations.

## Decision Tree

**One-dimensional layout?** -> Flexbox (`flex-direction`, `justify-content`, `align-items`).

**Two-dimensional layout?** -> CSS Grid (`grid-template-columns`, `grid-template-rows`).

**Responsive sizing?** -> `clamp()`, `min()`, `max()` for fluid values.

**Theme values?** -> Define in `:root` as custom properties, reference with `var()`.

**Center element?** -> Flexbox: `display: flex; place-content: center;` or Grid: `place-items: center`.

**Hide element?** -> `display: none` removes from flow; `visibility: hidden` keeps space; `opacity: 0` for transitions.

**Responsive breakpoints?** -> Container queries for component-level, media queries for viewport-level.

## Example

```css
:root {
  --color-primary: #0066cc;
  --spacing-unit: 0.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
  padding: var(--spacing-unit);
  border-radius: 0.5rem;
  background-color: var(--color-primary);
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## Edge Cases

- Handle print stylesheets with `@media print`
- Support dark mode via `prefers-color-scheme`
- Test with different font sizes and zoom levels
- Verify with color blindness simulators
- Avoid `!important` except in utility layers

## Checklist

- [ ] Custom properties for all theme values
- [ ] Grid/Flexbox for layout (no floats)
- [ ] `prefers-reduced-motion` respected
- [ ] `@layer` for cascade control
- [ ] Logical properties used (`margin-inline`, `padding-block`)
- [ ] Modern selectors (`:is()`, `:where()`, `:has()`)
- [ ] `clamp()`/`min()`/`max()` for fluid sizing
- [ ] `aspect-ratio` for media containers
- [ ] BEM or consistent naming convention
- [ ] Tested across target browsers

## Resources

- https://web.dev/learn/css/
- https://developer.mozilla.org/en-US/docs/Web/CSS
