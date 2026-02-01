---
name: prettier
description: Code formatting with Prettier for consistent style across the codebase.
dependencies:
  prettier: ">=3.0.0 <4.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Prettier Skill

## Overview

Automatic code formatting with Prettier for consistent code style.

## Objective

Configure and use Prettier to maintain consistent formatting across JavaScript, TypeScript, CSS, and other supported files.

## Conventions

- Use project .prettierrc configuration
- Format on save recommended
- Integrate with ESLint

### Prettier Specific

- Configure print width (default 80)
- Set semicolons preference
- Configure quote style
- Set trailing commas
- Configure tab width

## Example

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## References

- https://prettier.io/docs/en/
- https://prettier.io/docs/en/configuration.html
