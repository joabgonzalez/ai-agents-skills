---
name: code-quality
description: "Linting and formatting across tools. Trigger: When configuring linters, formatters, enforcing code quality, or fixing style issues."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Code Quality

Unified guidance for linting and formatting across ESLint, Prettier, Biome, and oxc. Context-aware: uses your project's existing tools.

## When to Use

- Configuring linters or formatters
- Fixing linting errors or style issues
- Setting up code quality in CI/CD
- Enforcing consistent code style
- Integrating quality tools with editors

Don't use when:

- TypeScript type checking only (use typescript skill)
- Build configuration (use vite or webpack skills)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Check Context First

**Always check what tools the project uses before recommending:**

```typescript
// Step 1: Check AGENTS.md for installed skills
// Step 2: Check package.json for installed tools
// Step 3: Check config files (.eslintrc*, .prettierrc*, biome.json)
// Step 4: Use existing tools, DON'T force new ones

// ✅ CORRECT: Context-aware
// If project has ESLint → use ESLint patterns
// If project has Prettier → use Prettier patterns
// If project has Biome → use Biome patterns
// If project has ESLint + Prettier → use both (with eslint-config-prettier)

// ❌ WRONG: Force new tool
// "Let's switch to Biome" when project uses ESLint + Prettier
// "Add Prettier" when project uses Biome (already handles formatting)
```

### ✅ REQUIRED: Extend Recommended Configs

```typescript
// ✅ CORRECT: Start from recommended (any tool)
// ESLint
extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"]

// Biome
{ "linter": { "rules": { "recommended": true } } }

// ❌ WRONG: Starting from scratch
rules: { /* manually defining hundreds of rules */ }
```

### ✅ REQUIRED: Essential Quality Rules

Regardless of tool, enforce these rules:

```
1. No any type (TypeScript)
2. No unused variables
3. No variable shadowing
4. Consistent type imports (import type)
5. No duplicate imports
6. Strict equality (===)
7. Prefer const over let/var
8. Import organization (external → internal → types)
```

### ✅ REQUIRED: Run in CI/CD

```json
{
  "scripts": {
    "lint": "<tool-specific-command>",
    "format": "<tool-specific-command>",
    "check": "npm run lint && npm run format -- --check"
  }
}
```

### ✅ REQUIRED: Editor Integration

Configure format-on-save and lint-on-save for immediate feedback. See tool-specific references for editor setup.

---

## Decision Tree

```
Project has quality tools configured?
→ Yes: Check package.json and config files
  → ESLint installed? → See references/eslint.md
  → Prettier installed? → See references/prettier.md
  → Biome installed? → See references/biome.md
  → oxc installed? → See references/oxc.md
  → ESLint + Prettier? → Use both with eslint-config-prettier
→ No: Recommend modern default

New project (no tools)?
→ Small/medium project: Biome (all-in-one, fast)
→ Large/enterprise: ESLint + Prettier (mature ecosystem, more plugins)
→ Performance-critical CI: Consider Biome or oxc

TypeScript project?
→ ESLint: Use @typescript-eslint/parser + @typescript-eslint/recommended
→ Biome: Built-in TypeScript support (no extra config)

React project?
→ ESLint: Add plugin:react/recommended + plugin:react-hooks/recommended
→ Biome: Built-in React support

Formatting only?
→ Prettier or Biome (both handle formatting)
→ DON'T use ESLint for formatting alone

Linting only?
→ ESLint or Biome (both handle linting)
→ DON'T use Prettier for linting (it only formats)

ESLint conflicts with Prettier?
→ Install eslint-config-prettier (disables conflicting rules)
→ Or migrate to Biome (single tool, no conflicts)
```

---

## Example

**Context-aware quality setup:**

```typescript
// Check package.json:
// "biome": "^2.0.0"
//
// → Use Biome patterns (single tool for linting + formatting)

// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

---

## Edge Cases

**Multiple tools**: Some projects use ESLint for linting + Prettier for formatting. Use `eslint-config-prettier` to prevent conflicts.

**Monorepo**: Use root config with per-package overrides. Both ESLint and Biome support this.

**Legacy to modern migration**: Migrate one tool at a time. Biome has `biome migrate` for ESLint/Prettier migration.

**Pre-commit hooks**: Use husky + lint-staged (ESLint/Prettier) or Biome's built-in staged files support.

---

## Resources

| Reference | When to Read |
|-----------|-------------|
| [references/eslint.md](references/eslint.md) | Using ESLint for linting |
| [references/prettier.md](references/prettier.md) | Using Prettier for formatting |
| [references/biome.md](references/biome.md) | Using Biome (linter + formatter) |
| [references/oxc.md](references/oxc.md) | Using oxc (experimental, fast) |

**See [references/README.md](references/README.md) for complete navigation.**
