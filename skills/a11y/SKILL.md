---
name: a11y
description: "Accessibility guide (WCAG 2.1/2.2, Level A–AAA). Trigger: When building UI components, interactive elements, or auditing accessibility compliance."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: domain
  allowed-tools:
    - file-reader
---

# Accessibility (a11y)

Ensures WCAG 2.1/2.2 Level AA compliance: semantic structure, ARIA, contrast, keyboard nav.

## When to Use

- Building UI components with interactive elements
- Implementing forms, modals, or custom widgets
- Adding dynamic content or live regions
- Ensuring keyboard navigation or reviewing accessibility compliance

Don't use for:

- Tech-specific implementation (react, html skills)
- Backend logic (no UI)

---

## Critical Patterns

### ✅ REQUIRED: Document Language — SC 3.1.1 · Level A

```html
<!-- SC 3.1.1 Level A — required for screen reader pronunciation -->
<html lang="en">
<html lang="es-MX">
```

Rule: Always set `lang` on `<html>`. Missing `lang` causes screen readers to mispronounce all content.

### ✅ REQUIRED: Semantic HTML Elements — SC 1.3.1 · Level A

```html
<!-- ✅ CORRECT: Nav with list structure (SC 1.3.1) -->
<nav aria-label="Primary navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
<main>
  <article>Content</article>
</main>
<button onClick="{action}">Submit</button>

<!-- ❌ WRONG: Non-semantic divs -->
<div class="nav">
  <div onClick="{navigate}">Home</div>
</div>
```

### ✅ REQUIRED: Keyboard Accessibility — SC 2.1.1 · Level A

```typescript
// ✅ CORRECT: Keyboard events
<button onClick={handleClick} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>

// ❌ WRONG: Mouse-only events
<div onClick={handleClick}> // Not keyboard accessible
```

### ✅ REQUIRED: Form Labels — SC 1.3.1, SC 3.3.2 · Level A

```html
<!-- ✅ CORRECT: Associated label -->
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

<!-- ❌ WRONG: No label association -->
<div>Email Address</div>
<input type="email" />
```

### ✅ REQUIRED: Alt Text for Images — SC 1.1.1 · Level A

```html
<!-- ✅ Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q4" />

<!-- ✅ Decorative image -->
<img src="border.png" alt="" />

<!-- ❌ WRONG: Missing alt -->
<img src="chart.png" />
```

### ✅ REQUIRED: SVG Accessibility — SC 1.1.1 · Level A

SVG loaded as `<img>` respects `alt`. SVG inline or via SVGR (React) does not — use `role` and `aria-label` directly.

```tsx
<!-- Informative SVG -->
<svg role="img" aria-label="Company logo" focusable="false">
  <title>Company logo</title>
</svg>

<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false">...</svg>

// ❌ WRONG: alt is ignored by SVGR
<Logo alt="Company logo" />

// ✅ CORRECT: use role + aria-label on SVGR component
<Logo role="img" aria-label="Company logo" focusable="false" />
```

### ✅ REQUIRED: Disclosure Pattern (Accordion / Expandable) — SC 4.1.2 · Level A

```tsx
// ✅ CORRECT
<button aria-expanded={isOpen} aria-controls="panel-id">
  Details  {/* Accessible name must NOT change with state */}
</button>
<div id="panel-id" hidden={!isOpen}>Panel content</div>
```

Rules: `aria-controls` must match the panel `id`. Do not change the button's accessible name based on open/closed state.

### ✅ REQUIRED: Form Validation Errors — SC 3.3.1 Level A · SC 3.3.3 Level AA

```html
<!-- ✅ Error linked to field; announced via role="alert" -->
<label for="email">Email <span aria-hidden="true">*</span></label>
<input id="email" type="email" aria-required="true" aria-invalid="true"
       aria-describedby="email-error" />
<span id="email-error" role="alert">
  Enter a valid email address (e.g. user@example.com)
</span>

<!-- Error summary on multi-field submit — move focus here -->
<div role="alert" tabindex="-1" id="error-summary">
  <h2>3 errors prevented submission:</h2>
  <ul><li><a href="#email">Email: Enter a valid address</a></li></ul>
</div>
```

Rules: `aria-invalid="true"` on the input (not the error span). On submit with errors, move focus to error summary (`element.focus()`, needs `tabindex="-1"`).

### ✅ REQUIRED: Dynamic Page / SPA Navigation — SC 2.4.2/2.4.3 Level A · SC 4.1.3 Level AA

```javascript
// On every route change — framework-agnostic:
document.title = `${pageTitle} | My App`;  // 1. Update title
announcer.textContent = '';                // 2. Clear announcer
announcer.textContent = pageTitle;         // 3. Re-set triggers announcement
document.querySelector('main')?.focus();   // 4. Move focus to main
```

```html
<!-- Persistent live region — render once in app root -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="route-announcer"></div>
<main id="main-content" tabindex="-1">...</main>
```

Rules: `<main>` needs `tabindex="-1"` to be programmatically focusable. Do NOT move focus to `<body>`.

---

## Conventions

### Framework-Native First

Before implementing accessibility patterns manually, check if your framework or UI library already provides them. Most production stacks (Tailwind, MUI, Radix UI, React Aria, Headless UI) ship accessible primitives that handle ARIA, focus, and keyboard contracts automatically. Use them — avoid duplicating CSS or markup that diverges from the design system.

### Semantic HTML

- Semantic elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- Heading hierarchy (h1 → h2 → h3, no skipping)
- `<button>` for actions, `<a>` for navigation; labels associated with inputs

### ARIA

- Only when semantic HTML insufficient; prefer native elements
- Common: `aria-label`, `aria-labelledby`, `aria-describedby`
- Dynamic content: `aria-live`, `aria-atomic`
- Active navigation: `aria-current="page"` on current link, `aria-current="step"` in wizards

### Keyboard Navigation

- All interactive elements keyboard accessible; logical tab order
- Visible focus indicators; Escape closes modals/dropdowns

### Color and Contrast

- Text 4.5:1 min (7:1 AAA), large text 3:1 min; UI components 3:1; focus indicators 3:1 (WCAG 2.2)
- Don't rely on color alone

### Touch Targets

- 24×24px min (WCAG 2.2), 44×44px recommended; adequate spacing between targets

---

## Decision Tree

```
Interactive element (button, link)?
  → Ensure keyboard accessible (Tab, Enter/Space)
  → Visible focus indicator, proper role and semantic element

Form field?
  → Associate <label> with input (htmlFor/id)
  → Mark required: aria-required="true" (or native required)
  → Field error: aria-invalid="true" + aria-describedby → error span + role="alert"
  → Submit errors: move focus to error summary (tabindex="-1") + role="alert"

SPA / route change?
  → Update document.title to reflect new page (SC 2.4.2)
  → Announce new page via persistent aria-live="polite" region
  → Move focus to <main tabindex="-1"> or <h1 tabindex="-1"> (not <body>)

Dynamic content change?
  → Non-urgent: aria-live="polite"
  → Critical alerts: aria-live="assertive"
  → Whole region: aria-atomic="true"

Custom widget (dropdown, modal, tabs)?
  → Follow WAI-ARIA Authoring Practices patterns
  → Implement keyboard navigation (Arrow keys, Escape, Enter)
  → See references/wai-aria-patterns.md for full widget patterns

Image?
  → <img>: decorative → alt="", informative → descriptive alt text
  → Inline SVG / SVGR: decorative → aria-hidden="true", informative → role="img" aria-label="..."

Color conveys meaning?
  → Add text label, icon, or pattern; verify 4.5:1 for text, 3:1 for UI

Modal or overlay?
  → Trap focus inside modal, restore focus on close
  → Allow Escape to dismiss; use aria-modal="true" and role="dialog"
```

---

## Example

Accessible modal dialog: focus trap, ARIA labels, and keyboard navigation applied together.

```typescript
function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: ModalProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) firstFocusRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
         onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <h2 id="modal-title">Delete this item?</h2>
      <p id="modal-desc">This action cannot be undone.</p>
      <button ref={firstFocusRef} aria-describedby="modal-desc"
              onClick={onConfirm}>Confirm Delete</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
```

Patterns applied: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, focus on open, Escape to dismiss.

---

## Edge Cases

**WCAG 2.2 updates:** 24×24px min target size; focus indicators 3:1 contrast; provide pointer alternatives for drag; CAPTCHAs need alternatives (no cognitive function tests).

**Skip links:** First focusable element, visually hidden, revealed on focus.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<main id="main-content">...</main>
```

Apply `.skip-link:focus { position: fixed; top: 0; clip: auto; padding: 0.5rem 1rem; }` to reveal visually.

**`sr-only` pattern:** Visually hidden but screen-reader accessible. Use for icon-button labels and status announcements. Standard CSS: `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;`

**ARIA live regions throttling:** Rapid updates may be throttled. Debounce or use `aria-atomic="true"`.

**Focus trap issues:** Libraries like React may interfere with focus management. Test focus trap explicitly in modals.

**Custom controls:** For complex widgets (datepickers, sliders, menus, tabs), follow WAI-ARIA Authoring Practices. See [references/wai-aria-patterns.md](references/wai-aria-patterns.md).

---

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WAI-ARIA Widget Patterns](references/wai-aria-patterns.md)
- [Review & Compliance Checklist](references/review-checklist.md) _(optional — for code reviews, remediation, and accessibility audits)_
