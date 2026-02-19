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

Plan UI with user flows, wireframing, component hierarchy, validation. UX decisions before implementation.

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

### ✅ REQUIRED: User-First Design Process

Process before writing UI code.

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

| Component          | State Needed              | Source            |
|-------------------|---------------------------|-------------------|
| CartReview        | items, quantities         | Redux store       |
| ShippingForm      | address fields, errors    | Local form state  |
| ShippingMethod    | methods[], selected       | API + local       |
| PaymentForm       | card fields, errors       | Local form state  |
| OrderSummary      | totals, tax, shipping     | Derived from above|
| CheckoutPage      | currentStep, isSubmitting | Local state       |
```

### ✅ REQUIRED: Validation Checkpoints

Validate design at each stage before proceeding.

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

## Checkpoint 4: Accessibility
- [ ] Keyboard navigation planned
- [ ] Screen reader flow makes sense
- [ ] Color is not the only indicator
- [ ] Focus management for modals/dialogs
```

### ❌ NEVER: Design in Code

```markdown
# ❌ WRONG: Start coding UI immediately
"Let me create the components and figure it out as I go"

# ✅ CORRECT: Plan first, then code
"Let me map the user flow, define the component hierarchy,
identify state needs, then implement."
```

---

## Visual & Interaction Principles

### ✅ REQUIRED: Apply Visual Design System

Consistent typography, spacing, color for visual harmony.

**Typography:** Modular scale (0.75rem → 3rem), line-height (headings 1.1-1.3, body 1.5-1.7), fluid `clamp()`

**Spacing:** 8pt grid (4px → 64px), consistent spacing (cards 16-24px, sections 32-64px)

**Color:** Semantic naming, WCAG ratios (4.5:1 text, 3:1 UI)

See [visual-design.md](references/visual-design.md) for complete typography scale, spacing system, color contrast calculations, and iconography patterns.

### ✅ REQUIRED: Design Responsive Layouts

Plan mobile-first, progressively enhance for larger screens.

**Breakpoints:** Content-driven (not device-specific), test by resizing until design breaks

**Patterns:** Container queries (component-level), fluid typography (`clamp()`), flexible grids (`auto-fit`)

**Viewport:** Use `dvh` for mobile browser compatibility (accounts for address bar)

See [responsive-design.md](references/responsive-design.md) for mobile-first strategy, breakpoint guidelines, touch targets (44x44px minimum), and responsive image patterns.

### ✅ REQUIRED: Add Purposeful Motion

Motion communicates state changes and guides attention — it doesn't decorate.

**Timing:** 100-150ms (feedback), 200-300ms (toggles), 300-500ms (modals), 500ms+ (choreography)

**Performance:** `transform`/`opacity` for 60fps, avoid layout properties (`width`, `height`, `top`, `left`)

**Accessibility:** Support `prefers-reduced-motion`

See [interaction-design.md](references/interaction-design.md) for micro-interactions, loading states, gesture patterns, and spring physics animations.

---

## Decision Tree

```
Designing a new page/feature?
  → User flow → Component hierarchy → State analysis → Visual design → Responsive layout → Motion → Implementation

Planning visual design?
  → See references/visual-design.md for typography scale, spacing system, color contrast, iconography

Planning responsive behavior?
  → See references/responsive-design.md for mobile-first strategy, container queries, fluid patterns, touch targets

Adding interactions/animations?
  → See references/interaction-design.md for timing guidelines, micro-interactions, feedback patterns, performance

Choosing between UI patterns?
  → See Common UI Patterns table below or references/design-thinking.md for pattern comparisons

Planning component structure?
  → Component hierarchy → Identify shared state → Slots/composition (see composition-pattern skill)

Evaluating existing UI?
  → Walk through user flows → Check validation checkpoints → Verify visual consistency → Test responsiveness

Accessibility concerns?
  → Use a11y skill for specifics, use Checkpoint 4 here for planning, see visual-design.md for contrast ratios
```

---

## Common UI Patterns

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

**Loading states**: Every async needs loading, success, error, empty.

**Empty states**: Design for zero data (first use, no results).

**Error recovery**: Always provide way forward.

---

## Checklist

- [ ] User flow mapped with entry, goal, and edge cases
- [ ] Component hierarchy reflects visual structure
- [ ] State identified and colocated appropriately
- [ ] All 4 validation checkpoints passed
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
