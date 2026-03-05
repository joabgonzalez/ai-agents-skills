# Prettier

Opinionated code formatter enforcing consistent style across JavaScript, TypeScript, CSS, JSON, and Markdown. Best for teams wanting zero-debate formatting.

**Dependencies:**

```json
{
  "prettier": ">=3.0.0 <4.0.0"
}
```

---

## Core Patterns

### ✅ REQUIRED: Use Project Config File

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

```javascript
// Or .prettierrc.js for comments/logic
module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'es5',
};
```

### ✅ REQUIRED: Ignore Generated Files

```gitignore
# .prettierignore
dist/
build/
coverage/
node_modules/
*.min.js
package-lock.json
```

### ✅ REQUIRED: Format on Save

```json
// VS Code settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Configuration Options

| Option | Default | Recommendation | Description |
|--------|---------|---------------|-------------|
| `printWidth` | 80 | 80-100 | Line length |
| `tabWidth` | 2 | 2 | Spaces per tab |
| `useTabs` | false | false | Tabs vs spaces |
| `semi` | true | true | Semicolons |
| `singleQuote` | false | true | Single quotes |
| `trailingComma` | "all" | "es5" | Trailing commas |
| `bracketSpacing` | true | true | `{ foo }` vs `{foo}` |
| `arrowParens` | "always" | "always" | `(x) =>` vs `x =>` |

### Per-File Overrides

```json
{
  "semi": true,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.json",
      "options": { "tabWidth": 4 }
    },
    {
      "files": "*.md",
      "options": { "printWidth": 120, "proseWrap": "always" }
    }
  ]
}
```

---

## Integration with ESLint

**CRITICAL:** When using both ESLint and Prettier, install `eslint-config-prettier` to prevent conflicts.

```bash
npm install -D eslint-config-prettier
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // MUST be last
  ],
};
```

**Rule of thumb:**

- ESLint: code quality rules (no-unused-vars, no-any, etc.)
- Prettier: formatting rules (semicolons, quotes, indentation, etc.)
- eslint-config-prettier: disables ESLint rules that conflict with Prettier

---

## CI/CD Integration

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

```yaml
# GitHub Actions
- name: Check formatting
  run: npm run format:check
```

---

## Pre-Commit Hooks

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,css,json,md}": "prettier --write"
  }
}
```

---

## Edge Cases

**Prettier vs ESLint conflicts:** Always use `eslint-config-prettier` as last extends entry.

**Ignored files:** Create `.prettierignore` (same syntax as `.gitignore`). Always ignore `dist/`, `build/`, `node_modules/`.

**Per-file overrides:** Use `overrides` for different settings per file type.

**Pre-commit formatting:** Use husky + lint-staged to format only staged files (faster than formatting entire project).

**CSS-in-JS:** Prettier formats template literals in tagged templates (styled-components, etc.).

---

## Related Topics

- See [eslint.md](eslint.md) for ESLint integration
- See [biome.md](biome.md) for modern alternative (replaces Prettier)
- See main [code-quality/SKILL.md](../SKILL.md) for decision tree

---

## References

- [Prettier Documentation](https://prettier.io/docs/en/)
- [Prettier Options](https://prettier.io/docs/en/options)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
