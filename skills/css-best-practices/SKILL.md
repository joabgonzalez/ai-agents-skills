---
name: css-best-practices
description: "CSS quality patterns: naming, specificity architecture, dark mode, and layout. Trigger: When reviewing CSS quality or stylesheet architecture."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# CSS Best Practices

Quality patterns for CSS architecture, specificity management, theming, and layout. Applies to plain CSS, SCSS, and CSS Modules.

## When to Use

- Reviewing CSS or SCSS for scalability and maintainability
- Evaluating naming conventions (BEM, utility, custom properties)
- Designing dark mode or theming strategy
- Diagnosing specificity conflicts or cascade issues

Don't use for:

- Tailwind utility class patterns (use tailwindcss)
- CSS-in-JS patterns (use relevant framework skill)
- Animation performance (use web-performance)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Custom Properties for Design Tokens

Define semantic tokens, not raw values. One change point, consistent everywhere.

```css
/* ❌ WRONG — raw value duplicated in 40+ places */
.button { background: #3b82f6; }
.link { color: #3b82f6; }

/* ✅ CORRECT — semantic token defined once */
:root { --color-brand-primary: #3b82f6; }
.button { background: var(--color-brand-primary); }
.link { color: var(--color-brand-primary); }
```

### ✅ REQUIRED: Specificity Budget

Single class selectors maximum. Avoid ID selectors and `!important`. If you need `!important`, the architecture is broken.

```css
/* ❌ WRONG — specificity escalation */
#sidebar .nav > ul li a.active { color: red; }

/* ✅ CORRECT — single class */
.nav-link--active { color: var(--color-brand-primary); }
```

### ✅ REQUIRED: Cascade Layers

Use `@layer` to establish explicit cascade order: reset → base → components → utilities.

```css
/* ✅ CORRECT — predictable cascade, no order-dependency */
@layer reset, base, components, utilities;

@layer reset { *, *::before, *::after { box-sizing: border-box; } }
@layer components { .card { padding: var(--spacing-md); } }
@layer utilities { .mt-4 { margin-top: 1rem; } }
```

### ✅ REQUIRED: Dark Mode via Custom Properties

Override custom properties at the theme level. Never duplicate color values per-component.

```css
/* ❌ WRONG — color duplication per component */
@media (prefers-color-scheme: dark) {
  .card { background: #1a1a1a; }
  .nav { background: #1a1a1a; }
}

/* ✅ CORRECT — one override point for all components */
@media (prefers-color-scheme: dark) {
  :root { --color-surface: #1a1a1a; }
}
[data-theme="dark"] { --color-surface: #1a1a1a; }
```

### ✅ REQUIRED: Layout with Modern Primitives

Grid for 2D layout, Flexbox for 1D alignment. No floats, no percentage hacks.

```css
/* ❌ WRONG — fragile percentage grid */
.col { float: left; width: 33.33%; }

/* ✅ CORRECT — intrinsic grid */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
```

### ❌ NEVER: Magic Numbers

Unexplained values become unmaintainable. Extract to custom properties with naming that communicates intent.

```css
/* ❌ WRONG — where did 23px come from? */
.modal { margin-top: 23px; }

/* ✅ CORRECT — documented offset */
/* 24px base - 1px border = 23px visual alignment */
.modal { margin-top: calc(var(--spacing-lg) - 1px); }
```

### ❌ NEVER: Mixed Naming Conventions

BEM and utility classes in the same component scope cause naming chaos. Pick one per scope.

```html
<!-- ❌ WRONG — BEM + Tailwind + arbitrary classes -->
<div class="card card--featured mt-4 text-blue-600 card__title">

<!-- ✅ CORRECT — consistent convention per component -->
<div class="card card--featured">          <!-- BEM scope -->
<div class="mt-4 text-blue-600 font-bold"> <!-- Utility scope -->
```

### Symptom → Solution

| Symptom | Cause | Fix |
|---------|-------|-----|
| Style needs `!important` to apply | Specificity war | Flatten with single-class selectors + @layer |
| Dark mode colors duplicated across components | Class-based overrides | Custom properties + media/data-theme override |
| "Why is this 23px?" | Magic number | Extract to custom property with comment |
| Cascade breaks when file order changes | No explicit layer ordering | Add `@layer` declaration |
| BEM + utility classes mixed in same element | Inconsistent convention | Pick one pattern per component scope |
| Colors wrong in one theme but not another | Raw values, not tokens | Replace with semantic custom properties |

---

## Decision Tree

```
Defining a color, spacing, or size used in 2+ places?
  → Custom property (design token) — not a raw value

Style not applying?
  → Check specificity — is a higher-specificity rule winning?
  → Use browser DevTools to inspect computed styles
  → Fix by lowering specificity of the winning rule, not raising the losing one

Need dark mode?
  → Override custom properties in @media (prefers-color-scheme: dark)
  → Also add [data-theme="dark"] selector for JS-controlled toggle

2D layout (rows AND columns)?
  → CSS Grid

1D layout (row OR column)?
  → Flexbox

Number with no obvious origin?
  → Magic number — extract to custom property or document with comment

BEM or utility classes?
  → New component in isolation → BEM (scoped, semantic)
  → Rapid composition of existing design tokens → utility
  → Never mix in same element's class list

File order matters for correct rendering?
  → Add @layer to make cascade order explicit and file-order-independent
```

---

## Example

```css
/* Design tokens */
:root {
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-brand: #3b82f6;
  --spacing-md: 1rem;
  --radius-card: 0.5rem;
}

/* Dark mode: single override point */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1f2937;
    --color-text: #f9fafb;
  }
}
[data-theme="dark"] {
  --color-surface: #1f2937;
  --color-text: #f9fafb;
}

/* Component uses tokens — works in both themes automatically */
.card {
  background: var(--color-surface);
  color: var(--color-text);
  padding: var(--spacing-md);
  border-radius: var(--radius-card);
}

/* Responsive grid using modern primitive */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}
```

---

## Edge Cases

**Legacy browser support:** Use `@supports (--foo: bar)` for feature detection rather than static compilation. For environments without custom property support, define fallback values inline before the `var()` call: `color: #3b82f6; color: var(--color-brand-primary);`

**CSS Modules and custom properties:** Custom properties defined in `:root` are global even in CSS Modules — tokens still work. Component-scoped variables must be defined on the component's root element.

**SCSS variables vs custom properties:** SCSS variables are compile-time (no runtime theming); custom properties are runtime (theme switching works). Prefer custom properties for any value that changes with theme, viewport, or user preference.

**Specificity in third-party overrides:** When overriding a third-party library with high specificity, use `@layer` to wrap the library styles — then your layer-less styles automatically win without `!important`.
