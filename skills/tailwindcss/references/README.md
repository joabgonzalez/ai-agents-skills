# Tailwind CSS References

## Quick Navigation

| Reference | Lines | Topic |
|-----------|-------|-------|
| [design-system.md](design-system.md) | ~280 | Token hierarchy, semantic naming, CVA, dark mode |
| [tailwind-v4.md](tailwind-v4.md) | ~220 | v4 migration, OKLCH, new utilities, CSS-first config |

---

## Reading Strategy

### Building a Design System with Tailwind

1. **READ:** [design-system.md](design-system.md) — Token hierarchy, semantic naming, CVA patterns
2. **READ:** [tailwind-v4.md](tailwind-v4.md) — v4-specific patterns (OKLCH, @theme, size-*)
3. **IMPLEMENT:** Configure theme, create component variants with CVA
4. **ALSO SEE:** [interface-design/visual-design.md](../../interface-design/references/visual-design.md) for typography/spacing/color foundations

### Migrating from Tailwind v3 to v4

1. **READ:** [tailwind-v4.md](tailwind-v4.md) — Migration checklist, breaking changes, new features
2. **CHECK:** [design-system.md](design-system.md) — Update token naming to semantic approach
3. **TEST:** Build, verify all utilities work, check dark mode

### Using CVA for Component Variants

1. **READ:** [design-system.md](design-system.md) — CVA setup, variant patterns, compound variants
2. **EXAMPLE:** Button with size/intent variants
3. **ALSO SEE:** [composition-pattern](../../composition-pattern/SKILL.md) for polymorphic components

### Implementing Dark Mode

1. **READ:** [design-system.md](design-system.md) — Dark mode with @custom-variant (v4)
2. **READ:** [tailwind-v4.md](tailwind-v4.md) — @custom-variant syntax
3. **CHECK:** Main [SKILL.md](../SKILL.md) — dark: prefix usage

---

## File Descriptions

### design-system.md (~280 lines)

Comprehensive guide to building design systems with Tailwind using token hierarchies and semantic naming.

**Content:**

- **Token Hierarchy:** Three-layer organization (brand → semantic → component tokens)
- **OKLCH Color Space:** Perceptual uniformity, better than HSL/RGB
- **Semantic Naming Convention:** bg-primary, bg-destructive, text-muted-foreground (not color numbers)
- **CVA (Class Variance Authority):** Type-safe component variants with defaultVariants
- **Dark Mode Patterns:** @custom-variant for native dark mode support
- **Color Mixing:** Semantic alpha variants with color-mix()
- **Animation Management:** @keyframes inside @theme (only outputs when referenced)
- **Component Examples:** Button, Card, Alert with variants

**When to use:** Building design system, creating component library, ensuring consistency, setting up dark mode

---

### tailwind-v4.md (~220 lines)

Migration guide and v4-specific features for Tailwind CSS v4+.

**Content:**

- **CSS-First Configuration:** @import 'tailwindcss' replaces tailwind.config.js
- **@theme Blocks:** Define all customization in CSS (not JavaScript)
- **New Utilities:** size-* shorthand (replaces w-* + h-*), improved spacing
- **OKLCH Color Space:** Native support, better gradients
- **Native Dark Mode:** @custom-variant replaces darkMode: "class"
- **Animation in @theme:** Scoped @keyframes, tree-shakeable
- **Migration Checklist:** Step-by-step from v3 to v4
- **Breaking Changes:** Removed utilities, config format changes
- **Examples:** Before/after comparisons for each feature

**When to use:** Migrating from v3, using v4 features, understanding new patterns, troubleshooting v4 issues

---

## Cross-Reference Map

**Token Hierarchy:**

- design-system.md → Three-layer token structure
- interface-design/visual-design.md → Typography scale, spacing system, color semantics
- tailwind-v4.md → Implementation with @theme blocks

**Semantic Naming:**

- design-system.md → bg-primary, text-muted-foreground
- interface-design/visual-design.md → Color semantic naming principles

**Dark Mode:**

- design-system.md → @custom-variant pattern, token pairing
- interface-design/visual-design.md → CSS custom properties for dark mode
- tailwind-v4.md → v4 dark mode syntax

**Component Variants:**

- design-system.md → CVA setup and patterns
- composition-pattern → Polymorphic components, variant props

**Animation:**

- design-system.md → @keyframes in @theme
- interaction-design → Motion timing guidelines
- tailwind-v4.md → Tree-shakeable animations
