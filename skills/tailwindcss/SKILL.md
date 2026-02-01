---
name: tailwindcss
description: Utility-first CSS framework for rapid UI development.
skills:
  - conventions
  - a11y
  - css
dependencies:
  tailwindcss: ">=3.0.0 <5.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Tailwind CSS Skill

## Overview

Utility-first CSS framework for building custom designs with composable utility classes.

## Objective

Enable developers to build responsive, maintainable UIs using Tailwind's utility classes and configuration system.

## Conventions

Refer to conventions for:

- Code organization

Refer to a11y for:

- Color contrast
- Focus indicators

Refer to css for:

- Custom CSS when needed

### Tailwind Specific

- Use utility classes over custom CSS
- Configure theme in tailwind.config
- Use @apply for component classes sparingly
- Leverage JIT mode for performance
- Use responsive modifiers (sm:, md:, lg:)

## Example

```html
<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold text-gray-900 mb-4">Title</h1>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Click Me
  </button>
</div>
```

tailwind.config.js:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#1976d2",
      },
    },
  },
};
```

## References

- https://tailwindcss.com/docs
- https://tailwindcss.com/docs/configuration
