# Review & Compliance Checklist

> **Optional reference.** Use during code reviews, accessibility remediation, or pre-assessment preparation. Not required for day-to-day implementation — see the main skill for that.

> ⚠️ **Prerequisite:** Run an automated scan first and fix all reported violations before using this checklist. Automation detects ~30-40% of WCAG issues; this list covers what tools cannot verify on their own.
>
> Zero-setup options: **axe DevTools** browser extension (Chrome/Firefox) · **Lighthouse** in Chrome DevTools › Accessibility tab

---

## Core Patterns

### Level A — Minimum conformance

Failures here are blockers. A product without Level A is not accessible.

**Semantics & Structure**

- [ ] `<html lang="...">` present and correct for the page language (SC 3.1.1)
- [ ] Single `<h1>` per page; heading hierarchy h1→h2→h3 without gaps (SC 1.3.1)
- [ ] `<nav>` wraps `<ul>/<li>`; multiple `<nav>` elements have distinct `aria-label` (SC 1.3.1)
- [ ] `<button>` for actions; `<a href>` for navigation — not `<div>` or `<span>` (SC 4.1.2)
- [ ] No context change triggered by focus alone (SC 3.2.1)

**Images & Icons**

- [ ] Informative `<img>`: `alt` describes the content, not filename or "image of" (SC 1.1.1)
- [ ] Decorative `<img>`: `alt=""` explicitly set (SC 1.1.1)
- [ ] Informative SVG / SVGR component: `role="img"` + `aria-label` present (SC 1.1.1)
- [ ] Icon-only buttons: `aria-label` on the button or `<span class="sr-only">` inside (SC 4.1.2)

**Keyboard**

- [ ] All interactive elements reachable and operable by keyboard alone (SC 2.1.1)
- [ ] No keyboard trap outside modal dialogs (SC 2.1.2)
- [ ] Skip link present as first focusable element (SC 2.4.1)

**Links**

- [ ] Link text is descriptive out of context — no "click here", "read more", "learn more" (SC 2.4.4)

**Forms**

- [ ] Every `<input>`, `<select>`, `<textarea>` has associated `<label>` or `aria-label` (SC 1.3.1, SC 3.3.2)
- [ ] Required fields: `aria-required="true"` or native `required` attribute (SC 3.3.2)
- [ ] Field error: `aria-invalid="true"` on the input + `aria-describedby` → error message id (SC 3.3.1)
- [ ] Error message text is specific — states what to correct, not just "Invalid" (SC 3.3.1)

**Dynamic Content**

- [ ] `document.title` updated on every SPA route change (SC 2.4.2)
- [ ] Disclosure (accordion/expandable): `aria-expanded` + `aria-controls` on trigger (SC 4.1.2)

---

### Level AA — Standard target

Industry standard for WCAG compliance. Most legal requirements and client contracts target AA.

**Focus**

- [ ] Focus indicator is visible beyond browser default — `focus-visible` CSS present (SC 2.4.7)
- [ ] Focus not obscured by sticky headers or fixed elements (SC 2.4.11 — WCAG 2.2)

**Dynamic Content & SPA**

- [ ] Persistent `aria-live="polite"` region announces SPA route changes (SC 4.1.3)
- [ ] Focus moved to `<main tabindex="-1">` or `<h1 tabindex="-1">` after route change (SC 2.4.3)
- [ ] Tooltip / popover dismissible with `Escape` without moving focus (SC 1.4.13)

**Widgets**

- [ ] Modal: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + focus trap + Escape (SC 4.1.2)
- [ ] Confirmation dialog: `role="alertdialog"`, default focus on safe/cancel action (SC 4.1.2)
- [ ] `aria-current="page"` on the active navigation link (SC 4.1.2)
- [ ] Toggle button: `aria-pressed` reflects current state; button label stays constant (SC 4.1.2)

**Forms (AA)**

- [ ] Submit with errors: focus moved to error summary with `tabindex="-1"` + `role="alert"` (SC 3.3.3)
- [ ] Personal data fields have correct `autocomplete` attribute (name, email, tel, etc.) (SC 1.3.5)
- [ ] Destructive or financial actions: reversible, or require confirmation step (SC 3.3.4)
- [ ] Authentication: no cognitive function test required (CAPTCHA must have alternative) (SC 3.3.8 — WCAG 2.2)

**Touch**

- [ ] Interactive targets minimum 24×24px with adequate spacing (SC 2.5.8 — WCAG 2.2)

---

### Level AAA — Enhanced (optional)

> AAA is rarely a contractual requirement. Include only when explicitly scoped.

- [ ] Touch targets minimum 44×44px (SC 2.5.5)
- [ ] Section headings used to organize and label all page regions (SC 2.4.10)
- [ ] All form submissions: error prevention applies regardless of content type (SC 3.3.6)

---

## What this checklist does NOT cover

These criteria require dedicated tools or browser testing — not code review alone:

| Criterion | Tool |
|---|---|
| Contrast 4.5:1 text, 3:1 UI (SC 1.4.3, 1.4.11) | axe DevTools · WebAIM Contrast Checker |
| Zoom 200% without loss of content (SC 1.4.4) | Browser — zoom to 200% |
| Reflow at 400% (SC 1.4.10) | Browser — zoom to 400%, viewport 1280px |
| Text spacing (SC 1.4.12) | Text Spacing Bookmarklet |
| Captions / audio description (SC 1.2.x) | Content review |

For formal WCAG assessments, use [WCAG-EM methodology](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) and document evidence per criterion.
