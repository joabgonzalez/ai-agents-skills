---
name: eslint
description: Skill for enforcing code quality and best practices using ESLint in JavaScript and TypeScript projects.
dependencies:
  eslint: ">=8.0.0 <9.0.0"
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# ESLint Skill

## Overview

This skill provides guidance for configuring and using ESLint to enforce code quality, consistency, and best practices in JavaScript and TypeScript projects.

## Objective

Enable developers to maintain code quality through automated linting with proper ESLint configuration, rules, and integration with development workflow.

## Conventions

- Use ESLint with TypeScript parser for TypeScript projects
- Extend recommended configurations
- Customize rules to match project standards
- Integrate with editor for real-time feedback
- Run ESLint in CI/CD pipeline

## Example

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
  },
};
```

## Edge Cases

- Handle monorepo configurations
- Configure for multiple environments (node, browser)
- Manage rule exceptions with inline comments
- Balance strictness with developer experience

## References

- https://eslint.org/docs/latest/
- https://typescript-eslint.io/
