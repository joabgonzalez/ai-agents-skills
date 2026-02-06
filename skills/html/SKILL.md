---
name: html
description: "Semantic HTML with proper elements and structure. Trigger: When writing HTML markup, creating structure, or implementing semantic elements."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - a11y
    - humanizer
---

# HTML Skill

Write semantic, accessible HTML following modern web standards with proper document structure, meta tags, and element selection.

## When to Use

Use when:

- Writing HTML markup for web pages
- Creating document structure with semantic elements
- Building forms with proper labels and inputs
- Adding metadata and head elements

Don't use for React JSX patterns (use react skill) or detailed accessibility guidance (use a11y skill).

## Critical Patterns

### Semantic Elements

```html
<!-- CORRECT -->
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>
<footer>Footer content</footer>

<!-- WRONG: generic divs -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">...</div>
```

### Proper Heading Hierarchy

```html
<!-- CORRECT: sequential -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- WRONG: skipping levels -->
<h1>Page Title</h1>
<h4>Section</h4>
```

### Button vs Anchor

```html
<!-- CORRECT: button for actions -->
<button type="button" onclick="doSomething()">Click</button>

<!-- CORRECT: anchor for navigation -->
<a href="/page">Go to Page</a>

<!-- WRONG: anchor for actions -->
<a href="#" onclick="doSomething()">Click</a>
```

### Essential Meta Tags

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Page description for SEO (150-160 chars)" />
    <title>Page Title - Site Name</title>

    <!-- Open Graph -->
    <meta property="og:title" content="Page Title" />
    <meta property="og:description" content="Description" />
    <meta property="og:image" content="https://example.com/image.jpg" />
    <meta property="og:url" content="https://example.com/page" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Page Title" />
  </head>
  <body><!-- Content --></body>
</html>
```

Conventions: follow **conventions** skill for organization; follow **a11y** skill for ARIA, keyboard nav, and semantic guidance.

## Decision Tree

**Interactive element?** -> `<button>` for actions, `<a>` for navigation.

**Text content?** -> `<article>` for standalone content, `<section>` for grouped content, `<aside>` for related info.

**Form field?** -> Wrap in `<label>`, associate via `for`/`id`, use appropriate `type`.

**List of items?** -> `<ul>` unordered, `<ol>` ordered, `<dl>` definitions.

**Heading?** -> `<h1>`-`<h6>` sequential; one `<h1>` per page.

**Image?** -> `<img>` with descriptive `alt`; empty `alt=""` for decorative.

**Tabular data?** -> `<table>` with `<thead>`, `<tbody>`, `<th scope>`.

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

## Edge Cases

- **Multiple h1:** HTML5 allows it, but screen readers work better with one per page
- **Empty links:** Avoid `<a href="#">`; use `<button>` for actions
- **Div soup:** Overuse of `<div>` harms semantics; prefer semantic elements
- **Form without action:** Must have `action` or JS handler; omitting both causes reload
- **Button without type:** Default is `submit`; always specify `type="button"` for non-submit buttons

## Checklist

- [ ] Semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- [ ] Sequential heading hierarchy (no skipped levels)
- [ ] `<button>` for actions, `<a>` for navigation
- [ ] `lang` attribute on `<html>`
- [ ] Essential meta tags (charset, viewport, description)
- [ ] Open Graph / Twitter Card meta for social sharing
- [ ] `alt` text on all images
- [ ] Labels on all form inputs
- [ ] Valid nesting (one `<main>`, proper structure)
- [ ] HTML validated against spec

## Resources

- https://html.spec.whatwg.org/
- https://web.dev/learn/html/
