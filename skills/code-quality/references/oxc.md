# oxc (OXC Toolchain)

Experimental Rust-based JavaScript/TypeScript toolchain with linter, formatter, resolver, and transformer. Targets performance-critical CI/CD pipelines.

**Status:** Experimental (2026). API and rules may change between versions.

**Dependencies:**

```json
{
  "oxlint": "latest"
}
```

---

## Core Patterns

### ✅ REQUIRED: Understand Experimental Status

```typescript
// ✅ CORRECT: Use oxc when you accept:
// - Rules may change between versions
// - Fewer rules than ESLint (~300 vs 1000+)
// - Limited plugin ecosystem
// - Breaking changes possible

// ❌ WRONG: Use as drop-in ESLint replacement
// Not all ESLint rules have oxc equivalents
// Plugin ecosystem is much smaller
```

### ✅ REQUIRED: Basic Setup

```bash
# Install
npm install -D oxlint

# Run linter
npx oxlint .

# With configuration
npx oxlint --config oxlintrc.json .
```

```json
// oxlintrc.json
{
  "rules": {
    "no-unused-vars": "error",
    "no-explicit-any": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": "error"
  }
}
```

### ✅ REQUIRED: Package.json Scripts

```json
{
  "scripts": {
    "lint": "oxlint .",
    "lint:fix": "oxlint --fix ."
  }
}
```

---

## When to Use oxc

**Good fit:**

- CI/CD where lint speed is critical (10x-100x faster than ESLint)
- Large monorepos where ESLint is slow
- As complement to ESLint (run oxc first for fast feedback, ESLint for full check)
- Projects willing to accept experimental tooling

**Bad fit:**

- Need specific ESLint plugins (react-hooks, import, etc.)
- Need stable, production-proven linting rules
- Team unfamiliar with experimental tools
- Need formatting (oxc formatter is early stage)

---

## Performance Comparison

| Tool | 1000 files | 10000 files | Memory |
|------|-----------|-------------|--------|
| ESLint | ~10s | ~60s | ~500MB |
| Biome | ~0.5s | ~3s | ~100MB |
| oxlint | ~0.2s | ~1s | ~50MB |

*Approximate benchmarks. Actual performance varies by rule set and file content.*

---

## Available Rule Categories

```json
{
  "rules": {
    // Correctness
    "no-unused-vars": "error",
    "no-undef": "error",
    "no-const-assign": "error",

    // Style
    "no-var": "error",
    "prefer-const": "error",

    // Suspicious
    "no-explicit-any": "error",
    "eqeqeq": "error",
    "no-debugger": "error",

    // TypeScript (built-in)
    "no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## Integration Strategies

### As ESLint Complement

```json
// package.json — Run oxc first (fast), then ESLint (thorough)
{
  "scripts": {
    "lint:fast": "oxlint .",
    "lint:full": "eslint . --ext .ts,.tsx",
    "lint": "npm run lint:fast && npm run lint:full"
  }
}
```

### As Standalone

```json
{
  "scripts": {
    "lint": "oxlint .",
    "lint:fix": "oxlint --fix .",
    "format": "biome format --write ."
  }
}
```

*oxc formatter is early stage. Pair with Biome or Prettier for formatting.*

---

## CI/CD Integration

```yaml
# GitHub Actions — fast lint check
- name: Fast lint
  run: npx oxlint .

# Or as pre-check before full lint
- name: Quick lint (oxc)
  run: npx oxlint .
- name: Full lint (ESLint)
  run: npm run lint
```

---

## Edge Cases

**Missing rules:** oxc has ~300 rules vs ESLint's 1000+. Check available rules before migrating.

**No plugin system:** oxc doesn't support ESLint plugins. React-specific and import-specific rules are built-in but limited.

**Formatter status:** oxc formatter is very early stage. Use Biome or Prettier for formatting.

**Breaking changes:** Pin versions in CI.

---

## Comparison with Biome

| Feature | oxc | Biome |
|---------|-----|-------|
| Speed | Fastest | Very fast |
| Rules | ~300 | ~200+ |
| Formatter | Early stage | Production-ready |
| Import sorting | Limited | Built-in |
| Configuration | Simple | Simple |
| Maturity | Experimental | Stable |
| Plugin support | None | None |

**Recommendation:** For most projects, Biome is the better modern choice. Use oxc only when raw speed is the top priority and you accept the experimental trade-offs.

---

## Related Topics

- See [biome.md](biome.md) for stable modern alternative
- See [eslint.md](eslint.md) for mature linting
- See main [code-quality/SKILL.md](../SKILL.md) for decision tree

---

## References

- [oxc Documentation](https://oxc.rs/)
- [oxlint GitHub](https://github.com/oxc-project/oxc)
- [oxc Playground](https://oxc.rs/playground/)
