---
name: css
description: Skill for writing modern, maintainable, and accessible CSS using the latest features, best practices, and up-to-date conventions. General conventions and accessibility are delegated to conventions and a11y skills.
skills:
  - conventions
  - a11y
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# CSS Modern Skill

## Overview

This skill provides guidance for writing modern CSS with focus on maintainability, performance, and accessibility using current CSS features and best practices.

## Objective

Enable developers to write clean, efficient CSS that leverages modern features like CSS Grid, Flexbox, custom properties, and container queries while maintaining accessibility and browser compatibility.

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to a11y for:

- Color contrast
- Focus indicators
- Accessible animations

### CSS Specific

- Use CSS custom properties for theming
- Prefer Flexbox and Grid over floats
- Use logical properties (margin-inline, padding-block)
- Implement responsive design with container queries when appropriate
- Avoid !important except for utilities
- Use BEM or similar naming convention

## Example

```css
:root {
  --color-primary: #0066cc;
  --spacing-unit: 0.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
  padding: var(--spacing-unit);
  border-radius: 0.5rem;
  background-color: var(--color-primary);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

## Edge Cases

- Handle print stylesheets
- Support dark mode with prefers-color-scheme
- Test with different font sizes
- Verify with color blindness simulators

## References

- https://web.dev/learn/css/
- https://developer.mozilla.org/en-US/docs/Web/CSS
