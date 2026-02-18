---
name: a11y
description: "Universal accessibility with WCAG 2.1/2.2 Level AA. Trigger: When implementing UI components, adding interactive elements, or ensuring accessibility."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
  allowed-tools:
    - file-reader
---

# Accessibility (a11y) Skill

Ensures WCAG 2.1/2.2 Level AA compliance: semantic structure, ARIA, contrast, keyboard nav.

## When to Use

- Building UI components with interactive elements
- Implementing forms, modals, or custom widgets
- Adding dynamic content or live regions
- Ensuring keyboard navigation
- Reviewing accessibility compliance
- Testing with screen readers

Don't use for:

- Tech-specific implementation (react, html skills)
- General patterns (conventions skill)
- Backend logic (no UI)

---

## Critical Patterns

### ✅ REQUIRED: Semantic HTML Elements

```html
<!-- ✅ CORRECT: Semantic elements -->
<nav>
  <a href="/home">Home</a>
</nav>
<main>
  <article>Content</article>
</main>
<button onClick="{action}">Submit</button>

<!-- ❌ WRONG: Non-semantic divs -->
<div class="nav">
  <div onClick="{navigate}">Home</div>
</div>
<div class="main">
  <div>Content</div>
</div>
<div onClick="{action}">Submit</div>
```

### ✅ REQUIRED: Keyboard Accessibility

```typescript
// ✅ CORRECT: Keyboard events
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>

// ❌ WRONG: Mouse-only events
<div onClick={handleClick}> // Not keyboard accessible
```

### ✅ REQUIRED: Form Labels

```html
<!-- ✅ CORRECT: Associated label -->
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

<!-- ❌ WRONG: No label association -->
<div>Email Address</div>
<input type="email" />
```

### ✅ REQUIRED: Alt Text for Images

```html
<!-- ✅ CORRECT: Descriptive alt for informative images -->
<img src="chart.png" alt="Sales increased 25% in Q4" />

<!-- ✅ CORRECT: Empty alt for decorative images -->
<img src="decorative-border.png" alt="" />

<!-- ❌ WRONG: Missing alt -->
<img src="chart.png" />
```

---

## Conventions

### Semantic HTML

- Semantic elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- Heading hierarchy (h1 → h2 → h3, no skipping)
- `<button>` for actions, `<a>` for navigation
- Labels associated with inputs

### ARIA

- Only when semantic HTML insufficient
- Prefer native elements
- Common: `aria-label`, `aria-labelledby`, `aria-describedby`
- Dynamic content: `aria-live`, `aria-atomic`

### Keyboard Navigation

- All interactive elements keyboard accessible
- Logical tab order (tabindex when needed)
- Visible focus indicators
- Escape closes modals/dropdowns

### Color and Contrast

- Text 4.5:1 min (7:1 AAA), large text 3:1 min
- Don't rely on color alone
- Test with color blindness simulators
- UI components 3:1 (WCAG 2.1)
- Focus indicators 3:1 (WCAG 2.2)

### Touch Targets & Interaction

- 24x24px min (WCAG 2.2), 44x44px recommended (AAA)
- Adequate spacing between targets
- No dragging required unless essential (WCAG 2.2)

### Screen Readers

- Alt text for images
- `aria-hidden="true"` for decorative elements
- `aria-live` for dynamic changes
- Test with NVDA, JAWS, VoiceOver

## Decision Tree

**Interactive element (button, link)?** → Ensure keyboard accessible (Tab, Enter/Space), visible focus indicator, proper role and semantic element.

**Form field?** → Associate `<label>` with input (htmlFor/id), provide error messages with `aria-describedby`, announce errors with `aria-live`.

**Dynamic content change?** → Use `aria-live="polite"` for non-urgent updates, `aria-live="assertive"` for critical alerts, `aria-atomic="true"` if entire region should be read.

**Custom widget (dropdown, modal, tabs)?** → Follow WAI-ARIA Authoring Practices patterns, implement keyboard navigation (Arrow keys, Escape, Enter), manage focus properly.

**Image or icon?** → Decorative: `alt=""` or `aria-hidden="true"`. Informative: descriptive `alt` text. Icon-only button: `aria-label`.

**Color conveys meaning?** → Add text label, icon, or pattern. Verify 4.5:1 contrast ratio for text, 3:1 for UI components.

**Modal or overlay?** → Trap focus inside modal, restore focus on close, allow Escape to dismiss, use `aria-modal="true"` and `role="dialog"`.

**Loading or status change?** → Use `aria-busy="true"` during loading, `role="status"` for status messages, ensure screen reader announces completion.

---

## Edge Cases

WCAG 2.2 updates:\*\*

- **24x24px minimum target size** (lowered from 44x44, but 44x44 still recommended)
- **Focus appearance:** Focus indicators must have 3:1 contrast ratio
- **Dragging movements:** Provide single-pointer alternatives for drag operations
- **Redundant entry:** Don't make users re-enter information already provided
- **Accessible authentication:** Don't require cognitive function tests (CAPTCHAs should have alternatives)

\*\*
**Skip links:** Provide "Skip to main content" link as first focusable element for keyboard users to bypass navigation.

**Focus trap issues:** Libraries like React may interfere with focus management. Test focus trap explicitly in modals.

**ARIA live regions throttling:** Rapid updates may be throttled by screen readers. Debounce updates or use atomic regions.

**Touch target size:** Minimum 44x44 pixels for touch targets (WCAG 2.1). Use padding to increase clickable area.

**Hidden content:** Use `aria-hidden="true"` for visual-only elements. Use `sr-only` class for screen-reader-only text.

**Custom controls:** For complex widgets (datepickers, sliders), follow WAI-ARIA Authoring Practices patterns exactly.

---

## References

- https://www.w3.org/WAI/WCAG21/quickref/
- https://www.w3.org/WAI/ARIA/apg/
