# Design Thinking

> Structured design process for UI/UX decisions.

## Core Patterns

- The Design Process
- Flow Template
- Example: Password Reset Flow
- Page Structure Principles

---

## The Design Process

### 1. Understand (Research)

Before designing, answer these questions:

```markdown
**User Profile:**
- Who uses this feature? (role, experience level)
- What's their primary goal?
- What device/context? (desktop, mobile, both)

**Business Context:**
- What problem does this solve?
- How does success look? (metrics)
- What constraints exist? (time, tech, brand)
```

### 2. Map (User Flows)

Document the journey from entry to goal completion.

```markdown
## Flow Template

[Entry Point] → [Step 1] → [Decision] → [Step 2] → [Success]
                                └→ [Error] → [Recovery] → [Retry]

## Example: Password Reset Flow

Login Page → "Forgot Password" link
→ Enter email → [Validate: registered?]
  → Yes: Send reset email → Confirmation screen
  → No: Show "email not found" + Register link
→ Click email link → [Validate: token expired?]
  → Valid: Show reset form → New password → Success → Auto-login
  → Expired: Show "link expired" + Resend option
```

### 3. Structure (Information Architecture)

Organize content hierarchy and navigation.

```markdown
## Page Structure Principles

1. **Progressive disclosure** — Show essential info first, details on demand
2. **Visual hierarchy** — Most important content gets most visual weight
3. **Grouping** — Related items together, unrelated items separated
4. **Consistency** — Same patterns for same interactions across the app
```

### 4. Wireframe (Low-Fidelity)

Sketch layout before picking components.

```markdown
## ASCII Wireframe: Product Page

┌─────────────────────────────────┐
│ [← Back]        [Logo]   [Cart] │  ← Navigation
├────────────┬────────────────────┤
│            │  Product Name       │
│  [Image]   │  ★★★★☆ (42 reviews)│
│            │  $99.00             │
│            │  [Add to Cart]      │
│            │  [Buy Now]          │
├────────────┴────────────────────┤
│ [Description] [Reviews] [FAQ]   │  ← Tabs
├─────────────────────────────────┤
│ Tab content here                │
│                                 │
├─────────────────────────────────┤
│ Related Products                │
│ [Card] [Card] [Card] [Card]    │
└─────────────────────────────────┘
```

### 5. Validate (Design Review)

Check design against requirements before implementing.

---

## UI Pattern Comparisons

### Navigation Patterns

| Pattern | Best For | Avoid When |
|---------|----------|------------|
| **Top nav** | <7 items, desktop-first | Mobile (use hamburger or bottom nav) |
| **Side nav** | 7+ items, admin panels | Simple apps, mobile |
| **Bottom nav** | Mobile, 3-5 main sections | Desktop, many items |
| **Breadcrumbs** | Deep hierarchy | Flat navigation |
| **Tabs** | Related content sections | >5 tabs (use side nav) |

### Data Display Patterns

| Pattern | Best For | Avoid When |
|---------|----------|------------|
| **Table** | Structured data, comparison | Mobile (use cards) |
| **Cards** | Visual content, browsing | Dense data comparison |
| **List** | Sequential items | Complex multi-field data |
| **Grid** | Image-heavy content | Text-heavy content |
| **Timeline** | Chronological events | Non-temporal data |

### Input Patterns

| Pattern | Best For | Avoid When |
|---------|----------|------------|
| **Inline form** | 1-3 fields, quick actions | Many fields |
| **Full page form** | 4+ fields, focused task | Quick edits |
| **Multi-step wizard** | 7+ fields, complex flows | Simple forms |
| **Inline editing** | Quick updates to existing data | New item creation |
| **Modal form** | Contextual quick add | Complex multi-step |

### Feedback Patterns

| Pattern | Best For | Avoid When |
|---------|----------|------------|
| **Toast/snackbar** | Success confirmations | Errors needing action |
| **Inline error** | Field validation errors | Global errors |
| **Alert banner** | System-wide messages | Field-specific errors |
| **Modal dialog** | Destructive confirmations | Non-critical messages |
| **Empty state** | No data scenarios | Data exists |

---

## Responsive Design Strategy

```markdown
## Mobile-First Approach

1. Design for smallest screen first (320px)
2. Add complexity as screen grows
3. Don't hide essential features on mobile — reorganize them

## Breakpoint Strategy

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| <640px | Mobile | Single column, stacked |
| 640-1024px | Tablet | 2 columns, collapsible sidebar |
| >1024px | Desktop | Multi-column, expanded navigation |

## Common Responsive Patterns

- **Stack → Side-by-side**: Mobile stacks vertically, desktop places side-by-side
- **Full-width → Fixed-width**: Mobile uses full width, desktop constrains max-width
- **Hamburger → Full nav**: Mobile hides nav, desktop shows full navigation
- **Cards → Table**: Mobile shows cards, desktop shows data table
```

---

## Design Validation Questions

Before implementing, answer:

1. Can the user accomplish their goal in ≤3 clicks?
2. Is the most important action visually prominent?
3. Can the user always go back or undo?
4. Are error messages actionable (tell user what to do)?
5. Does the design work without color (for colorblind users)?
6. Is the mobile experience usable with one thumb?
7. Are loading states informative (skeleton > spinner)?
8. Is the empty state helpful (not just "no data")?

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for quick design process
- See [a11y](../../a11y/SKILL.md) for accessibility patterns
- See [composition-pattern](../../composition-pattern/SKILL.md) for component API design
