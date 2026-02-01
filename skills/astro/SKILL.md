---
name: astro
description: Skill for building fast, optimized websites using Astro with TypeScript and optional React islands, including best practices for SSG and SSR. General conventions and accessibility are delegated to conventions and a11y skills.
skills:
  - conventions
  - a11y
  - react
  - typescript
dependencies:
  astro: ">=5.0.0 <6.0.0"
  typescript: ">=5.0.0 <6.0.0"
  react: ">=18.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Astro Skill

## Overview

This skill provides guidance for building static sites with Astro, focusing on SSG patterns, minimal JavaScript, proper directive usage, and integration with React islands.

## Objective

Enable developers to build fast, optimized static sites using Astro with proper TypeScript support, minimal runtime JavaScript, and effective use of client directives for interactivity.

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to a11y for:

- Semantic HTML
- Keyboard navigation
- ARIA usage

### Astro Specific

- Prefer static rendering over client-side JavaScript
- Use client directives appropriately (client:load, client:visible, client:idle)
- Keep components in `.astro` format when possible
- Use React/Vue/Svelte only when client interactivity is needed
- Leverage Astro's built-in optimizations (image optimization, CSS bundling)

## Example

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<article>
  <h2>{title}</h2>
  <slot />
</article>

<style>
  article {
    padding: 1rem;
  }
</style>
```

## Edge Cases

- Use `client:only` for framework-specific components
- Handle dynamic routes with `getStaticPaths`
- Manage environment variables properly
- Test build output for bundle size

## References

- https://docs.astro.build/
- https://docs.astro.build/en/guides/client-side-scripts/
