# DRY Principle References

This directory contains a patterns-and-examples reference for the DRY principle, covering when to apply it, when to deliberately avoid it, and context-specific guidance for React, Node.js, and TypeScript codebases.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [patterns-examples.md](patterns-examples.md) | Rule of Three, configuration centralization, data normalization, shared types, custom hooks, coincidental duplication, over-abstraction, YAGNI, context-specific guidance | When deciding whether to extract repeated code or keep it inline |

---

## Reading Strategy

### For extracting repeated logic

1. Read main [SKILL.md](../SKILL.md) for trigger criteria and Critical Patterns
2. MUST read: [patterns-examples.md](patterns-examples.md) Core Patterns section for the specific extraction pattern (React hooks, middleware, config, types)

### For deciding whether duplication is intentional

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [patterns-examples.md](patterns-examples.md) "When NOT to Apply DRY" section for coincidental duplication and over-abstraction examples

### For context-specific DRY guidance (API routes, tests, CSS)

1. Read main [SKILL.md](../SKILL.md)
2. CHECK: [patterns-examples.md](patterns-examples.md) "DRY in Different Contexts" section

---

## File Descriptions

### [patterns-examples.md](patterns-examples.md)

**Comprehensive DRY reference with side-by-side wrong/correct examples across frontend and backend contexts**

- Rule of Three: email validation extraction across React forms; async error handler middleware for Express routes
- Configuration centralization: AUTH_CONFIG constant replacing scattered hardcoded values
- Data normalization: normalized entity store replacing duplicated user data in orders and invoices
- Shared TypeScript types: single User interface imported everywhere instead of redefined per file
- Custom hooks: useFetch<T> hook eliminating repeated fetch/loading/error state pattern across components
- When NOT to apply: coincidental duplication (validateUser vs validateProduct with different change reasons), over-abstraction, YAGNI single-use utilities
- Context guide: API routes, database queries, configuration, tests, and CSS/styles

---

## Cross-Reference Map

- [patterns-examples.md](patterns-examples.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Edge Cases
- Related skills: [SOLID Principles](../../solid/SKILL.md) (SRP: each piece of knowledge in one place)
