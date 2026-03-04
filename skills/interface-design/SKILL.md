---
name: interface-design
description: "UI/UX design patterns for software. Trigger: When designing user interfaces, planning UX flows, or evaluating UI decisions."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
  skills:
    - a11y
---

# Interface Design

Plan UI with intentional aesthetic direction, user flows, component hierarchy, and visual system. Design decisions before implementation.

## When to Use

- Planning UI for a new feature or page
- Designing user flows and interactions
- Evaluating UI/UX decisions
- Building wireframes or component hierarchies
- User asks "how should this look?" or "what's the best UX for X?"

Don't use for:

- Implementation (react, mui, css skills)
- Accessibility (a11y)
- Backend APIs (architecture-patterns)

---

## Critical Patterns

### ✅ REQUIRED: Commit to a Bold Aesthetic Direction

Before writing any UI code, define a clear conceptual direction and commit to it.

```markdown
## Aesthetic Direction

**Purpose**: What problem does this interface solve? Who uses it?
**Domain**: 5+ concepts, metaphors, or vocabulary from this product's world
**Color world**: 5+ colors that exist naturally in this domain's physical space
**Tone**: Pick ONE — brutally minimal, maximalist, editorial, luxury, brutalist,
          retro-futuristic, soft/pastel, industrial, organic... commit to an extreme.
**Differentiation**: What's the one element that could only exist for THIS product?
**Defaults rejected**: Three obvious patterns you're explicitly not doing.
```

"Bold maximalism and refined minimalism both work — the key is intentionality, not intensity."

**Typography**: choose distinctive, characterful faces over generic defaults.
**Color**: a palette that feels like it came FROM the product's world, not applied to it.
**Composition**: unexpected layouts, asymmetry, diagonal flow, generous negative space or
controlled density — all valid when intentional.
**Backgrounds**: gradient meshes, noise textures, geometric patterns, grain overlays, layered transparencies, dramatic shadows — atmosphere and depth beyond solid colors.
**Complexity**: match implementation to vision — maximalist design = elaborate animations and effects; minimalist = restraint, precision, and whitespace.

### ✅ REQUIRED: User-First Design Process

```markdown
## Design Process

1. **Understand** → Who is the user? What's the goal?
2. **Map** → What's the user flow? (entry → action → result)
3. **Structure** → What components are needed? (hierarchy)
4. **Validate** → Does the design meet the requirements?
5. **Implement** → Build with technology skills (react, css, mui)
```

### ✅ REQUIRED: Define User Flows Before UI

```markdown
## User Flow: Checkout

**Entry:** User clicks "Checkout" from cart
**Goal:** Complete purchase

Flow:
1. Review cart items → [Edit quantities] → [Remove items]
2. Enter shipping address → [Auto-fill from saved] → [Validate address]
3. Select shipping method → [Show estimated delivery]
4. Enter payment → [Validate card] → [Show errors inline]
5. Review order → [Edit any section] → [Place order]
6. Confirmation → [Order number] → [Email sent]

**Edge cases:**
- Empty cart → Redirect to shop with message
- Payment failure → Show error, keep form state, retry
- Session timeout → Save progress, prompt re-login
```

### ✅ REQUIRED: Component Hierarchy

Map the UI structure before building components.

```markdown
## Component Hierarchy: Dashboard

DashboardPage
├── DashboardHeader
│   ├── PageTitle
│   └── DateRangePicker
├── MetricsRow
│   ├── MetricCard (revenue)
│   ├── MetricCard (orders)
│   └── MetricCard (customers)
├── ChartsSection
│   ├── RevenueChart
│   └── OrdersChart
└── RecentOrdersTable
    ├── TableHeader
    ├── TableRow[]
    └── Pagination
```

### ✅ REQUIRED: State Identification

Identify what state each component needs before implementing.

```markdown
## State Analysis: Checkout

| Component       | State Needed              | Source             |
|-----------------|---------------------------|--------------------|
| CartReview      | items, quantities         | Redux store        |
| ShippingForm    | address fields, errors    | Local form state   |
| ShippingMethod  | methods[], selected       | API + local        |
| PaymentForm     | card fields, errors       | Local form state   |
| OrderSummary    | totals, tax, shipping     | Derived from above |
| CheckoutPage    | currentStep, isSubmitting | Local state        |
```

### ✅ REQUIRED: Depth Strategy — Pick One

Choose ONE depth approach and apply it consistently. Mixing strategies breaks visual coherence.

```
Borders-only      → technical, precise feel; no shadows
Subtle shadows    → layered surfaces with soft elevation
Surface shifts    → elevation via lightness (dark mode: higher = slightly lighter)
Borders + shadows → reserved for emphasis elements only

❌ Don't mix approaches — inconsistent depth is the clearest sign of no system.
```

Inputs: slightly darker than surroundings (signals "type here"). Sidebars: same background
as canvas with a subtle border — not a different hue that fragments space.

### ✅ REQUIRED: Interactive States — All 5

Every interactive element needs all five states defined before shipping.

```
Default  → resting appearance
Hover    → cursor over element
Active   → pressed/clicked (brief; gives physical feel)
Focus    → keyboard navigation — visible ring, never hidden
Disabled → reduced opacity + cursor:not-allowed

❌ Missing focus = broken keyboard accessibility
❌ Missing disabled = broken form UX
```

### ✅ REQUIRED: Validation Checkpoints

```markdown
## Checkpoint 1: User Flow
- [ ] All user goals are achievable
- [ ] Error cases handled (empty, invalid, failure)
- [ ] Navigation is clear (user always knows where they are)

## Checkpoint 2: Component Structure
- [ ] Each component has single responsibility
- [ ] No component handles 3+ unrelated concerns
- [ ] Hierarchy reflects visual nesting

## Checkpoint 3: State Design
- [ ] State is colocated (closest to where it's used)
- [ ] No redundant state (derived values computed, not stored)
- [ ] Loading and error states accounted for

## Checkpoint 4: Craft Self-Evaluation
- [ ] Swap Test: replacing the typeface/layout with generic alternatives changes how it feels
- [ ] Squint Test: hierarchy is perceivable without reading — contrast/scale carry it
- [ ] Signature Test: 3+ specific elements feel unique to THIS product
- [ ] Token Test: CSS variable names evoke this product's world, not any generic project
```

### ❌ NEVER: Generic AI Defaults

```
❌ Generic fonts (Inter, Roboto, Arial, system-ui) when context calls for character
❌ Purple/blue gradients on white — the most overused AI aesthetic
❌ Predictable card-grid-dashboard layouts without context-specific differentiation
❌ "Clean and modern" without defining what those mean for THIS product
❌ Same aesthetic repeated — vary light/dark themes, typefaces, and palettes across projects

"No design should be the same. Make unexpected choices that feel genuinely designed
for this context."
"Extraordinary creative work is possible here — don't hold back."
```

### ❌ NEVER: Design in Code

```markdown
# ❌ WRONG
"Let me create the components and figure it out as I go."

# ✅ CORRECT
"Let me commit to an aesthetic direction, map the user flow,
define the component hierarchy, identify state needs, then implement."
```

---

## Conventions

**Visual system**: Modular type scale (0.75rem → 3rem), line-height (headings 1.1–1.3, body 1.5–1.7), fluid `clamp()`. Spacing: 8pt grid (4px → 64px). Color: semantic tokens, WCAG ratios (4.5:1 text, 3:1 UI). See [visual-design.md](references/visual-design.md).

**Responsive**: Mobile-first, content-driven breakpoints. `dvh` for mobile browser compatibility. Touch targets 44×44px minimum. See [responsive-design.md](references/responsive-design.md).

**Motion**: `transform`/`opacity` for 60fps. In React, use the Motion library for complex sequences. Timing: 100–150ms (feedback), 200–300ms (toggles), 300–500ms (modals). Support `prefers-reduced-motion`. One well-orchestrated page-load reveal creates more delight than scattered micro-interactions. See [interaction-design.md](references/interaction-design.md).

---

## Decision Tree

```
Designing a new page/feature?
  → Aesthetic direction → User flow → Component hierarchy → State analysis
  → Visual design → Responsive → Motion → Implementation

Committing to aesthetic direction?
  → Define tone (pick ONE extreme), differentiation, and 3 defaults you reject

Planning visual design?
  → See references/visual-design.md

Planning responsive behavior?
  → See references/responsive-design.md

Adding interactions/animations?
  → See references/interaction-design.md

Choosing between UI patterns?
  → See Examples table below or references/design-thinking.md

Evaluating existing UI?
  → Run 4 craft checkpoints → Verify depth strategy is consistent
  → Confirm all 5 interactive states are covered

Accessibility concerns?
  → Use a11y skill; Checkpoint 4 for planning; visual-design.md for contrast ratios
```

---

## Examples

| Pattern | Use When | Example |
|---------|----------|---------|
| **List → Detail** | Browsing collections | Products list → Product page |
| **Wizard/Steps** | Multi-step processes | Checkout, onboarding |
| **Dashboard** | Overview + drill-down | Admin panel, analytics |
| **Master-Detail** | List with inline preview | Email client, file manager |
| **Modal/Dialog** | Focused action, confirmation | Delete confirm, quick edit |
| **Tabs** | Related content sections | Settings, profile sections |
| **Search + Filter** | Large datasets | Product catalog, user list |
| **Infinite scroll** | Content feeds | Social feed, news |

---

## Edge Cases

**Responsive**: Mobile-first, then expand.

**Loading states**: Every async operation needs loading, success, error, and empty states.

**Empty states**: Design for zero data (first use, no results, filtered to nothing).

**Error recovery**: Always provide a way forward — never a dead end.

---

## Checklist

- [ ] Aesthetic direction committed (domain explored, color world, tone, differentiation, 3 defaults rejected)
- [ ] User flow mapped with entry, goal, and edge cases
- [ ] Component hierarchy reflects visual structure
- [ ] State identified and colocated appropriately
- [ ] All 4 validation checkpoints passed (including craft self-evaluation)
- [ ] Depth strategy chosen and applied consistently
- [ ] All 5 interactive states defined per interactive element
- [ ] Loading, error, and empty states designed
- [ ] Responsive behavior planned
- [ ] Accessibility considerations included

---

## Resources

- [design-thinking.md](references/design-thinking.md) — Design process, wireframing, UI pattern comparisons, validation questions
- [visual-design.md](references/visual-design.md) — Typography scale, spacing system, color contrast, iconography, layout foundations
- [interaction-design.md](references/interaction-design.md) — Motion timing, micro-interactions, feedback patterns, gesture interactions, performance optimization
- [responsive-design.md](references/responsive-design.md) — Mobile-first strategy, breakpoints, container queries, fluid typography, touch targets
- [a11y](../a11y/SKILL.md) — Accessibility patterns and ARIA
- [react](../react/SKILL.md) — React implementation patterns
- [composition-pattern](../composition-pattern/SKILL.md) — Component composition API design
- [mui](../mui/SKILL.md) — Material UI component library
- [tailwindcss](../tailwindcss/SKILL.md) — Utility-first CSS implementation
