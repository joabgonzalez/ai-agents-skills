---
name: eslint
description: "Code quality enforcement with ESLint. Trigger: When configuring ESLint rules, fixing linting errors, or enforcing quality standards."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    eslint: ">=8.0.0 <9.0.0"
  allowed-tools:
    - file-reader
---

# ESLint Skill

## Overview

This skill provides guidance for configuring and using ESLint to enforce code quality, consistency, and best practices in JavaScript and TypeScript projects.

## Objective

Enable developers to maintain code quality through automated linting with proper ESLint configuration, rules, and integration with development workflow.

---

## When to Use

Use this skill when:

- Configuring ESLint for JavaScript/TypeScript projects
- Setting up linting rules and plugins
- Fixing linting errors in code
- Integrating ESLint with editors and CI/CD
- Enforcing code quality standards

Don't use this skill for:

- Code formatting only (use prettier skill)
- TypeScript type checking (use typescript skill)
- Build configuration (use vite or webpack skills)

---

## Critical Patterns

### ✅ REQUIRED: Extend Recommended Configs

```javascript
// ✅ CORRECT: Extend recommended configs
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
};

// ❌ WRONG: Starting from scratch
module.exports = {
  rules: {
    /* manually defining everything */
  },
};
```

### ✅ REQUIRED: Use TypeScript Parser for TS Projects

```javascript
// ✅ CORRECT: TypeScript parser
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
};

// ❌ WRONG: Default parser for TypeScript
module.exports = {
  // No parser specified for .ts files
};
```

### ✅ REQUIRED: Code Quality Rules

```javascript
// Essential rules for clean, maintainable code
module.exports = {
  rules: {
    // No any type
    "@typescript-eslint/no-explicit-any": "error",

    // Enforce import type for type-only imports
    "@typescript-eslint/consistent-type-imports": ["error", {
      prefer: "type-imports",
      fixStyle: "separate-type-imports",
    }],

    // No unused variables (use _ prefix for intentional)
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    }],

    // No variable shadowing
    "@typescript-eslint/no-shadow": "error",

    // No var
    "no-var": "error",
    "prefer-const": "error",

    // No require() — use ES imports
    "@typescript-eslint/no-require-imports": "error",

    // Strict equality
    eqeqeq: ["error", "always"],
  },
};
```

### ✅ REQUIRED: Import Organization Rules

```javascript
// With eslint-plugin-import
module.exports = {
  plugins: ["import"],
  rules: {
    // No duplicate imports from same module
    "import/no-duplicates": "error",

    // Enforce import order: external -> internal -> types
    "import/order": ["error", {
      groups: ["builtin", "external", "internal", "parent", "sibling", "type"],
      "newlines-between": "always",
    }],
  },
};
```

### ✅ REQUIRED: Run in CI/CD

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

---

## Conventions

- Use ESLint with TypeScript parser for TypeScript projects
- Extend recommended configurations
- Enforce `import type` with `@typescript-eslint/consistent-type-imports`
- Enforce no `any` with `@typescript-eslint/no-explicit-any`
- Enforce no unused vars with `@typescript-eslint/no-unused-vars`
- Enforce no shadowing with `@typescript-eslint/no-shadow`
- Integrate with editor for real-time feedback
- Run ESLint in CI/CD pipeline

---

## Decision Tree

**TypeScript project?** → Use `@typescript-eslint/parser` and `@typescript-eslint/recommended`.

**React project?** → Add `plugin:react/recommended` and `plugin:react-hooks/recommended`.

**Need auto-fix?** → Run `eslint --fix`, configure editor to fix on save.

**Enforce import type?** → `@typescript-eslint/consistent-type-imports` with `prefer: "type-imports"`.

**Enforce no any?** → `@typescript-eslint/no-explicit-any` as "error".

**Enforce no unused vars?** → `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: "^_"`.

**Enforce no shadowing?** → `@typescript-eslint/no-shadow` as "error" (not base `no-shadow`).

**Enforce import order?** → `eslint-plugin-import` with `import/order` rule.

**Custom rule needed?** → Add to `rules` object with "error", "warn", or "off".

**Disable rule for line?** → Use `// eslint-disable-next-line rule-name`.

**Monorepo?** → Use multiple `.eslintrc` files or override patterns.

**Conflicting with Prettier?** → Use `eslint-config-prettier` to disable formatting rules.

---

## Example

```javascript
// .eslintrc.js — Full quality config
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // Type safety
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

    // Clean code
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-require-imports": "error",

    // JS fundamentals
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "always"],

    // Import organization
    "import/no-duplicates": "error",
    "import/order": ["error", {
      groups: ["builtin", "external", "internal", "parent", "sibling", "type"],
    }],
  },
};
```

## Edge Cases

- **`no-shadow` vs `@typescript-eslint/no-shadow`:** Use the TS version; the base rule gives false positives on enums and type declarations.
- **`no-unused-vars` vs `@typescript-eslint/no-unused-vars`:** Use the TS version; the base rule doesn't understand type-only usage.
- **Monorepo:** Use multiple `.eslintrc` files per package or override patterns in root config.
- **Flat config (ESLint 9+):** Migrate from `.eslintrc.js` to `eslint.config.js` with `@eslint/js` and `typescript-eslint` packages.
- **Prettier conflicts:** Use `eslint-config-prettier` to disable formatting-only rules.

## References

- https://eslint.org/docs/latest/
- https://typescript-eslint.io/
