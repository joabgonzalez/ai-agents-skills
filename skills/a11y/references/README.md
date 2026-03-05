# a11y Skill References

## Quick Navigation

| File | When to Read |
| ---- | ------------ |
| [wai-aria-patterns.md](wai-aria-patterns.md) | Building custom widgets: accordion, tabs, dialog, combobox, menu, carousel, toggle, progressbar |
| [review-checklist.md](review-checklist.md) | Code review, accessibility remediation, or pre-assessment preparation _(optional)_ |

---

## Reading Strategy

Start with [SKILL.md](../SKILL.md) for core patterns (semantic HTML, keyboard, forms, ARIA basics). Come here when building a complex interactive widget or when auditing/reviewing existing code for accessibility compliance.

---

## File Descriptions

**wai-aria-patterns.md** — Widget-level ARIA patterns from the WAI-ARIA Authoring Practices Guide. Covers: navigation, disclosure, dialog, alert dialog, tabs, combobox, listbox, menu, live regions, breadcrumb, tooltip, carousel, toggle button, progressbar. Each pattern includes minimum ARIA markup, keyboard contract, and a code example.

**pr-review-checklist.md** — Optional compliance checklist organized by WCAG Level A / AA / AAA. Covers only code-reviewable criteria (excludes contrast, zoom, captions). Use as a pre-merge gate, during remediation, or when preparing evidence for a formal accessibility assessment.

---

## Cross-Reference Map

- Navigation landmark → SKILL.md (Semantic HTML) + wai-aria-patterns.md (full nav + list structure)
- Disclosure/accordion → SKILL.md (Critical Patterns) + wai-aria-patterns.md (multi-panel variants)
- Modal dialog → SKILL.md (Example) + wai-aria-patterns.md (full focus trap spec)
- Alert dialog (confirm/delete) → wai-aria-patterns.md (Alert Dialog section)
- Tabs, combobox, menu → wai-aria-patterns.md only
- Toggle button → wai-aria-patterns.md (Toggle Button section)
- Live regions / toasts / spinners → wai-aria-patterns.md (Live Regions, Progressbar sections)
- Compliance review / audit prep → pr-review-checklist.md
