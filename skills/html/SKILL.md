---
name: html
description: Semantic HTML best practices for web development.
skills:
  - conventions
  - a11y
allowed-tools:
  - documentation-reader
  - web-search
---

# HTML Skill

## Overview

Guidance for writing semantic, accessible HTML following modern web standards.

## Objective

Enable developers to create properly structured HTML with semantic elements, accessibility attributes, and best practices.

## Conventions

Refer to conventions for:

- Code organization
- Documentation

Refer to a11y for:

- Semantic elements
- ARIA attributes
- Keyboard navigation

### HTML Specific

- Use semantic elements (`<nav>`, `<main>`, `<article>`)
- Maintain proper heading hierarchy
- Include alt text for images
- Use `<button>` for actions, `<a>` for navigation
- Validate HTML markup

## Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title</title>
  </head>
  <body>
    <header>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <article>
        <h1>Article Title</h1>
        <p>Content</p>
      </article>
    </main>
  </body>
</html>
```

## References

- https://html.spec.whatwg.org/
- https://web.dev/learn/html/
