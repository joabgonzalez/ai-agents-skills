---
name: a11y
description: Universal skill for accessibility best practices and standards across all technologies (HTML, CSS, React, MUI, Astro, React Native, etc.).
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# Accessibility (a11y) Skill

## Overview

This skill centralizes accessibility guidelines and best practices for all technologies and frameworks used in the project, including HTML, CSS, React, MUI, Astro, React Native, and more. It covers semantic structure, ARIA usage, color contrast, keyboard navigation, and compliance with WCAG and WAI-ARIA standards.

## Objective

Ensure all user interfaces meet accessibility standards (WCAG 2.1 Level AA minimum) across all technologies. This skill provides universal accessibility guidance that technology-specific skills can reference.

## Conventions

### Semantic HTML

- Use semantic elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- Proper heading hierarchy (h1 → h2 → h3, no skipping levels)
- Use `<button>` for actions, `<a>` for navigation
- Form labels must be associated with inputs

### ARIA

- Use ARIA only when semantic HTML is insufficient
- Prefer native elements over ARIA roles
- Common patterns: `aria-label`, `aria-labelledby`, `aria-describedby`
- Required for dynamic content: `aria-live`, `aria-atomic`

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order (use tabindex only when necessary)
- Visible focus indicators
- Escape key closes modals/dropdowns

### Color and Contrast

- Text contrast ratio 4.5:1 minimum (7:1 for Level AAA)
- Large text (18pt+) minimum 3:1
- Don't rely solely on color to convey information
- Test with color blindness simulators

### Screen Readers

- Provide alternative text for images (`alt` attribute)
- Use `aria-hidden="true"` for decorative elements
- Announce dynamic content changes with `aria-live`
- Test with screen readers (NVDA, JAWS, VoiceOver)

## References

- https://www.w3.org/WAI/WCAG21/quickref/
- https://www.w3.org/WAI/ARIA/apg/
