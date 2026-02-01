---
name: javascript
description: Modern JavaScript conventions and ES2020+ features.
skills:
  - conventions
allowed-tools:
  - documentation-reader
  - web-search
---

# JavaScript Skill

## Overview

Modern JavaScript patterns and best practices for ES2020+ development.

## Objective

Guide developers in writing clean, efficient JavaScript using modern language features and patterns.

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns
- Documentation

### JavaScript Specific

- Use const/let instead of var
- Prefer arrow functions for callbacks
- Use template literals for string interpolation
- Leverage destructuring for objects and arrays
- Use async/await for asynchronous operations
- Apply optional chaining (?.) and nullish coalescing (??)

## Example

```javascript
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data?.results ?? [];
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
};

const { name, age = 18 } = user;
const greeting = `Hello, ${name}!`;
```

## References

- https://developer.mozilla.org/en-US/docs/Web/JavaScript
- https://tc39.es/ecma262/
