---
name: a11y
description: "Accessibility guide (WCAG 2.1/2.2, Level A–AAA). Trigger: When building UI components, interactive elements, or auditing accessibility compliance."
license: "Apache 2.0"
metadata:
  version: "1.2"
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
- Auditing components or pages for WCAG 2.0/2.1/2.2 compliance

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

**Framework-native first:** MUI, Radix UI, React Aria, Headless UI ship accessible primitives — use them before implementing manually.

**Semantic HTML:** `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>` · heading hierarchy h1→h2→h3 (no skipping) · `<button>` for actions, `<a>` for navigation.

**ARIA:** Only when semantic HTML is insufficient. Common: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-current="page"`.

**Keyboard:** All interactive elements reachable · logical tab order · visible focus indicators · Escape closes modals/dropdowns.

**Contrast (SC 1.4.3 / 1.4.11):**

| Element | AA | AAA |
|---|---|---|
| Normal text | 4.5:1 | 7:1 |
| Large text (≥18pt / ≥14pt bold) | 3:1 | 4.5:1 |
| UI components, focus indicators | 3:1 | — |
| Disabled / decorative | none | — |

**Touch targets:** 24×24px min (WCAG 2.2), 44×44px recommended.

---

## Decision Tree

```
Does the element convey meaning visually (image, icon, SVG, badge, chart)?
  → Purely decorative (adds no information)?
      → img: alt="" | SVG inline: aria-hidden="true" focusable="false"
  → Informative?
      → img: write descriptive alt text (SC 1.1.1)
      → SVG inline: role="img" + aria-label + title element
      → Icon button: aria-label on button + aria-hidden on icon

Is color the only way information is communicated?
  → Error/success state conveyed only by color?
      → Add icon, text label, or pattern alongside color (SC 1.4.1)
  → Chart series distinguishable only by color?
      → Add patterns, direct labels, or textures
  → Link differs from surrounding text only by color?
      → Add underline or distinct non-color visual cue

Is contrast sufficient?
  → Element is disabled or purely decorative?
      → No contrast requirement
  → Text or text in image?
      → Large text (18pt+ or 14pt+ bold)?
          → Minimum 3:1 AA / 4.5:1 AAA (SC 1.4.3 / 1.4.6)
      → Normal text?
          → Minimum 4.5:1 AA / 7:1 AAA (SC 1.4.3 / 1.4.6)
  → UI component (input border, button outline, icon, chart graphic)?
      → Minimum 3:1 (SC 1.4.11)
  → Focus indicator?
      → Minimum 3:1 against adjacent colors (SC 1.4.11 / WCAG 2.2 SC 1.4.13)

Does the element have an accessible name?
  → Button or link with visible text?
      → Verify text is meaningful, not generic ("Click here", "Read more")
  → Button or link with icon only or no visible label?
      → Add aria-label or aria-labelledby (SC 4.1.2)
  → Form input?
      → Associate label via htmlFor/id or aria-labelledby (SC 1.3.1 / 3.3.2)
  → Custom widget (role="combobox", role="slider", etc.)?
      → Name via aria-label or aria-labelledby (SC 4.1.2)

Is the element keyboard operable?
  → Native element (button, a, input, select)?
      → Keyboard accessible by default — verify logical tab order
  → Custom interactive element (div/span with onClick)?
      → Add role + tabindex="0" + keydown handler for Enter/Space (SC 2.1.1)
  → Functionality requires path-based gesture (drag, swipe)?
      → Provide single-pointer or keyboard alternative (SC 2.5.1)

Does the page have proper structure and landmarks?
  → html element missing lang attribute?
      → Set lang matching the page language (SC 3.1.1)
  → Heading levels skip or no h1 exists?
      → Fix hierarchy — h1 once per page, then h2, h3 without gaps (SC 1.3.1)
  → No skip link as first focusable element?
      → Add skip link pointing to main content (SC 2.4.1)
  → Content not inside landmark regions?
      → Wrap in main, nav, header, footer, or aside (SC 1.3.6)
  → Page missing a descriptive, unique title?
      → Set document.title per page/view (SC 2.4.2)

Is focus visible and well-managed?
  → Focus indicator not visible or low contrast?
      → Ensure visible focus ring with 3:1 contrast (SC 2.4.7 / WCAG 2.2 SC 2.4.11)
  → Positive tabindex value (tabindex="1" or higher)?
      → Remove — use DOM order to control tab sequence (SC 1.3.2)
  → Focusable element inside aria-hidden subtree?
      → Remove aria-hidden or make element non-focusable with inert or tabindex="-1"
  → Modal open — is focus trapped and restored on close?
      → Trap focus in modal + restore to trigger on close (SC 2.1.2)

Is dynamic content properly announced?
  → Non-urgent update (search results, lazy-loaded content)?
      → aria-live="polite"
  → Critical alert or error message?
      → aria-live="assertive" or role="alert"
  → Entire region replaces its content at once?
      → aria-atomic="true"
  → Status message not in a dialog (toast, save confirmation)?
      → role="status" or role="alert" without moving focus (SC 4.1.3)

Is this a form with validation?
  → Required field?
      → aria-required="true" or native required attribute (SC 3.3.2)
  → Field has validation error?
      → aria-invalid="true" + aria-describedby pointing to error span + role="alert"
  → Multi-field form submitted with errors?
      → Move focus to error summary (tabindex="-1") + role="alert" (SC 3.3.1)

Is content adaptable and not reliant on sensory characteristics alone?
  → Instructions reference only shape, color, size, or position?
      → Add text alternative (SC 1.3.3)
  → Reading or operation order depends on visual layout?
      → Verify DOM order matches visual order (SC 1.3.2)
  → Content breaks or clips when zoomed to 400%?
      → Ensure reflow at 1280px/400% without horizontal scroll (SC 1.4.10)
  → Content clips when text spacing is increased?
      → No fixed containers that overflow on spacing change (SC 1.4.12)

Is there audio or video content?
  → Video with dialogue or meaningful audio?
      → Provide synchronized captions (SC 1.2.2 AA)
  → Audio-only content (podcast, recording)?
      → Provide text transcript (SC 1.2.1 A)
  → Video has important visual info not described in audio?
      → Provide audio description (SC 1.2.5 AA)
  → Media autoplays for more than 3 seconds?
      → Provide pause, stop, or mute mechanism (SC 1.4.2)

Does content flash or blink?
  → Flashes more than 3 times per second?
      → Remove or reduce below threshold (SC 2.3.1)
  → Blinks indefinitely?
      → Remove blink or provide mechanism to stop (SC 2.2.2)

Is the markup valid and role/state/property correct?
  → Duplicate id attributes in the DOM?
      → Remove duplicates — id must be unique per page (SC 4.1.1)
  → ARIA role, state, or property has invalid value?
      → Fix to spec-valid value per WAI-ARIA (SC 4.1.2)
  → Required ARIA attributes missing for a role?
      → Add missing attributes per WAI-ARIA spec (SC 4.1.2)

SPA / route change?
  → Update document.title to reflect the new page/view
  → Announce via persistent aria-live="polite" region
  → Move focus to main or h1 with tabindex="-1"

Custom widget (tabs, combobox, slider, tree, datepicker)?
  → Follow WAI-ARIA Authoring Practices for that pattern
  → Arrow key navigation, Escape, Enter/Space
  → See references/wai-aria-patterns.md

Touch / pointer interaction?
  → Target size below 24x24px?
      → Increase to minimum 24x24px, target 44x44px (WCAG 2.2 SC 2.5.8)
  → Gesture requires specific path (drag, pinch, swipe)?
      → Provide single-pointer or keyboard alternative (SC 2.5.1)
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
