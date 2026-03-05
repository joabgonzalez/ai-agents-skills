# Code Quality References

> Deep-dive guides for specific linting and formatting tools

## Quick Navigation

| Reference | Purpose | Read When |
| --------- | ------- | --------- |
| [eslint.md](eslint.md) | JavaScript/TypeScript linting with plugins | Using ESLint in your project |
| [prettier.md](prettier.md) | Opinionated code formatting | Using Prettier for formatting |
| [biome.md](biome.md) | All-in-one linter + formatter (Rust-based) | Using Biome or starting new project |
| [oxc.md](oxc.md) | Experimental fast linter/formatter | Performance-critical CI/CD |

---

## Reading Strategy

### For ESLint + Prettier Projects

- MUST read: [eslint.md](eslint.md) + [prettier.md](prettier.md)
- Key: Use `eslint-config-prettier` to prevent conflicts

### For Biome Projects

- MUST read: [biome.md](biome.md) only
- Biome replaces both ESLint and Prettier

### For New Projects

- Read [biome.md](biome.md) for modern default
- Read [eslint.md](eslint.md) + [prettier.md](prettier.md) for mature ecosystem

### For Migration

- Read current tool reference + target tool reference
- Key migration paths: ESLint+Prettier → Biome, ESLint → Biome

---

## Tool Comparison

| Feature | ESLint | Prettier | Biome | oxc |
|---------|--------|----------|-------|-----|
| **Type** | Linter | Formatter | Linter + Formatter | Linter + Formatter |
| **Language** | JavaScript | JavaScript | Rust | Rust |
| **Speed** | Moderate | Fast | 10-100x faster | 50-100x faster |
| **TypeScript** | Via plugin | Built-in | Built-in | Built-in |
| **React** | Via plugin | Built-in | Built-in | Built-in |
| **Plugins** | 1000+ | Limited | Growing | Limited |
| **Config** | Complex | Simple | Simple | Simple |
| **Maturity** | Very mature (2013) | Mature (2017) | Stable (2023) | Experimental (2023) |
| **Best For** | Enterprise, complex rules | Formatting only | New projects, speed | CI/CD speed |

---

## Decision Guide

**Choose ESLint + Prettier when:**

- Enterprise project with custom rules
- Need specific ESLint plugins not available in Biome
- Team already uses ESLint ecosystem
- Need `eslint-plugin-import`, `eslint-plugin-react-hooks`, etc.

**Choose Biome when:**

- New project (no existing tools)
- Want single tool (no conflicts to manage)
- Speed is important (10-100x faster)
- Simpler configuration preferred

**Choose oxc when:**

- CI/CD performance is critical
- Willing to use experimental tool
- Already evaluated and accepted limitations

---

## Context-Aware Usage

**CRITICAL:** Always check project context before recommending:

1. Read `AGENTS.md` - lists installed skills
2. Check `package.json` - shows installed tools
3. Check config files (`.eslintrc*`, `.prettierrc*`, `biome.json`)
4. Use what exists - don't force new tools
5. Only suggest migration if asked or major issues exist

---

## File Descriptions

### [eslint.md](eslint.md)

**ESLint configuration, plugins, and rule management**

- Flat config vs legacy config format
- Plugin ecosystem (eslint-plugin-react, eslint-plugin-import, etc.)
- Custom rule configuration
- Integration with Prettier via eslint-config-prettier

### [prettier.md](prettier.md)

**Prettier formatting configuration and integration**

- .prettierrc configuration options
- Editor integration and format-on-save
- Ignoring files and overrides
- Integration with ESLint and CI/CD

### [biome.md](biome.md)

**Biome all-in-one linter and formatter setup**

- biome.json configuration
- Linting rules and formatter options
- Migration from ESLint + Prettier
- IDE integration and CI/CD usage

### [oxc.md](oxc.md)

**OXC experimental high-performance linter/formatter**

- OXC CLI usage and configuration
- Performance benchmarks vs alternatives
- Current limitations and supported rules
- CI/CD integration for speed-critical pipelines

---

## Cross-Reference Map

- [eslint.md](eslint.md) → Extends SKILL.md ESLint guidance; pairs with prettier.md to avoid rule conflicts
- [prettier.md](prettier.md) → Extends SKILL.md Prettier guidance; used alongside eslint.md for formatting separation
- [biome.md](biome.md) → Extends SKILL.md Biome guidance; replaces eslint.md + prettier.md for new projects
- [oxc.md](oxc.md) → Extends SKILL.md OXC guidance; alternative to biome.md for CI/CD-critical pipelines
- Related skills: [code-conventions](../../code-conventions/SKILL.md), [typescript](../../typescript/SKILL.md)
