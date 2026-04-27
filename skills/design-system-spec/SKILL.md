---
name: design-system-spec
description: "Structure a DESIGN.md so agents generate consistent UI from project tokens. Trigger: When documenting a design system for agent consumption."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Design System Spec

How to write a `DESIGN.md` that AI agents can read to generate UI consistent with your project's design system. Agents need more explicit specs than humans — no implicit knowledge, no "you know the style."

## When to Use

- Starting a new project and want agents to generate on-brand UI from day one
- Existing project where agents produce inconsistent or generic-looking UI
- Onboarding a new agent to an established design system
- Design system evolves and spec needs updating

Don't use for:

- UI/UX design decisions (use interface-design)
- CSS implementation patterns (use css-best-practices)
- Component implementation (use react-best-practices or relevant framework skill)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Tokens Must Have Concrete Values

Abstract names without values are useless to agents. Every token needs its resolved value.

```markdown
<!-- ❌ WRONG — agent cannot generate UI from this -->
## Colors
- Primary: brand blue
- Surface: light background

<!-- ✅ CORRECT — agent has everything it needs -->
## Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | `#3b82f6` | CTAs, links, active states |
| `--color-surface` | `#ffffff` | Page and card backgrounds |
| `--color-surface-raised` | `#f9fafb` | Elevated surfaces, sidebars |
| `--color-text` | `#111827` | Body text |
| `--color-text-muted` | `#6b7280` | Secondary labels, captions |
| `--color-border` | `#e5e7eb` | Dividers, input borders |
| `--color-destructive` | `#ef4444` | Errors, delete actions |
```

### ✅ REQUIRED [CRITICAL]: Guardrails Over Guidelines

Guidelines say what to do. Guardrails say what never to do — they prevent the most common agent mistakes.

```markdown
<!-- ❌ WRONG — guideline, agent will still drift -->
## Style
Use clean, minimal design with consistent spacing.

<!-- ✅ CORRECT — guardrails catch specific failure modes -->
## Guardrails
- Never use more than 2 font weights in a single view
- Never place two primary buttons side by side
- Never use color alone to convey state — always pair with icon or label
- Border radius is always 6px — never 0, never pill on non-pill components
- Never use shadows heavier than `0 1px 3px rgba(0,0,0,0.1)` on cards
```

### ✅ REQUIRED: Component Variants With States

Components need all states documented. Agents default to "happy path" only.

```markdown
## Button
**Variants:** primary · secondary · ghost · destructive
**States:** default · hover · active · disabled · loading

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| primary | `--color-brand-primary` | white | none |
| secondary | transparent | `--color-brand-primary` | `--color-brand-primary` |
| ghost | transparent | `--color-text` | none |
| destructive | `--color-destructive` | white | none |

**Disabled:** 50% opacity, `cursor: not-allowed`, no hover effect
**Loading:** replace label with spinner, keep dimensions, disable interaction
```

### ✅ REQUIRED: Spacing Scale — Named, Not Numeric

Agents using arbitrary pixel values produce inconsistent spacing. Name the scale.

```markdown
## Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Icon gaps, tight labels |
| `--space-2` | `8px` | Internal component padding |
| `--space-3` | `12px` | Between related elements |
| `--space-4` | `16px` | Standard section padding |
| `--space-6` | `24px` | Between unrelated sections |
| `--space-8` | `32px` | Major layout gaps |
| `--space-12` | `48px` | Page-level padding |

Rule: use scale tokens only — no arbitrary values like `margin: 23px`.
```

### ✅ REQUIRED: Typography With Computed Values

Font size + line height + weight — all three. Agents default to browser defaults otherwise.

```markdown
## Typography
| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| Display | Inter | 36px | 700 | 1.2 |
| Heading 1 | Inter | 24px | 600 | 1.3 |
| Heading 2 | Inter | 18px | 600 | 1.4 |
| Body | Inter | 14px | 400 | 1.6 |
| Caption | Inter | 12px | 400 | 1.5 |
| Code | JetBrains Mono | 13px | 400 | 1.5 |

Max line length: 72ch for body text. Never center-align body paragraphs.
```

### ✅ REQUIRED: Dark Mode Mappings (If Applicable)

If the project has dark mode, document both themes explicitly — not "darken the colors."

```markdown
## Dark Mode
| Token | Light | Dark |
|-------|-------|------|
| `--color-surface` | `#ffffff` | `#0f172a` |
| `--color-surface-raised` | `#f9fafb` | `#1e293b` |
| `--color-text` | `#111827` | `#f1f5f9` |
| `--color-border` | `#e5e7eb` | `#334155` |

Implementation: override tokens at `[data-theme="dark"]` — never duplicate component styles.
```

### ✅ REQUIRED: Icon System Definition

Without an icon spec, agents mix libraries (`lucide-react`, `heroicons`, `font-awesome`) in the same UI.

```markdown
## Icons
Library: lucide-react
Sizes: 16px (inline), 20px (default), 24px (emphasis)
Stroke width: 1.5 — never change per icon
Color: inherit from text — never hardcode color on icons
Never scale icons with CSS transforms — use the size prop only
```

### ❌ NEVER: Describe Intent Without Values

"Modern", "clean", "professional" are not actionable. Agents need numbers.

```markdown
<!-- ❌ WRONG — no agent can act on this -->
The UI should feel modern and clean with a professional color palette.

<!-- ✅ CORRECT — every word is actionable -->
Border radius: 6px. Shadows: 0 1px 3px rgba(0,0,0,0.1).
Primary color: #3b82f6. Surface: #ffffff. Font: Inter 14px/1.6.
```

---

## Decision Tree

```
Starting DESIGN.md from scratch?
  → Include in order: Colors → Spacing → Typography → Components → Guardrails
  → Every token needs a concrete value — no abstract names

Adding a component to DESIGN.md?
  → Document all variants + all states (default, hover, active, disabled, loading)
  → Add to guardrails any constraints unique to this component

Agent producing generic-looking UI despite DESIGN.md?
  → Check if tokens have concrete values (not names)
  → Check if guardrails are specific (not principles)
  → Add examples of correct usage to the component section

Agent ignoring spacing consistency?
  → Named spacing scale missing or incomplete — add token table
  → Explicit rule: "no arbitrary px values" in guardrails

Project has dark mode but agent generates wrong colors?
  → Dark mode token mapping table missing — add explicit light/dark columns

Agent mixing icon libraries or sizes inconsistently?
  → Icon system section missing — add library, sizes, stroke-width, color rule

Design system evolves (new brand color, new component)?
  → Update DESIGN.md before generating new UI
  → Bump version comment at top of file: "v1.2 - updated brand primary"
```

---

## Example

Minimal but complete DESIGN.md for a SaaS dashboard.

```markdown
# DESIGN.md — Acme Dashboard v1.0

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#6366f1` | Primary actions, active nav |
| `--color-surface` | `#ffffff` | Page background |
| `--color-surface-raised` | `#f8fafc` | Cards, sidebars |
| `--color-text` | `#0f172a` | Body text |
| `--color-text-muted` | `#64748b` | Labels, metadata |
| `--color-border` | `#e2e8f0` | Dividers, inputs |
| `--color-success` | `#22c55e` | Positive states |
| `--color-destructive` | `#ef4444` | Errors, delete |

## Spacing
4 · 8 · 12 · 16 · 24 · 32 · 48px — use these values only.

## Typography
Inter · Body: 14px/400/1.6 · Heading: 18px/600/1.4 · Caption: 12px/400/1.5

## Components

### Button
primary (brand bg) · secondary (brand border) · ghost (no border) · destructive
States: default · hover (10% darker) · disabled (50% opacity) · loading (spinner)

### Input
Border: `--color-border` · Focus: `--color-brand` 2px outline · Error: `--color-destructive` border + message below

### Card
Background: `--color-surface-raised` · Border: `--color-border` 1px · Radius: 8px · Shadow: none

## Icons
lucide-react · sizes: 16/20/24px · stroke-width: 1.5 · color: inherit

## Guardrails
- No arbitrary spacing — use the scale
- No more than 2 font weights per view
- Never color-only state indication — pair with icon or text
- No inline styles — use tokens
- Border radius: 8px on cards, 6px on inputs/buttons, 4px on badges
```

---

## Edge Cases

**Migrating an existing project:** Extract values from the CSS/Tailwind config first — don't invent new tokens. DESIGN.md should reflect reality, not aspirations.

**Third-party component library (MUI, shadcn):** Document your theme overrides only — not the full library. Agents already know the base library; they need your customizations.

**Multiple themes (per-tenant branding):** Create a base DESIGN.md with structure, then per-tenant overrides as separate files that reference the base.

**Design system out of sync with code:** When DESIGN.md and the actual CSS diverge, agents generate UI that looks right but doesn't match the implementation. Treat DESIGN.md updates as part of design system PRs.
