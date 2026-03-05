# Biome

Rust-based toolchain replacing ESLint + Prettier with linting, formatting, and import sorting. Best for new projects or teams wanting simpler tooling with better performance.

**Dependencies:**

```json
{
  "@biomejs/biome": ">=2.0.0"
}
```

---

## Core Patterns

### ✅ REQUIRED: Initialize Configuration

```bash
# Generate biome.json with defaults
npx @biomejs/biome init
```

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

### ✅ REQUIRED: Use Recommended Rules

```json
// ✅ CORRECT: Start with recommended
{
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}

// ❌ WRONG: Disable recommended and configure manually
{
  "linter": {
    "rules": {
      "recommended": false,
      "complexity": { /* ... */ },
      "correctness": { /* ... */ }
    }
  }
}
```

### ✅ REQUIRED: Package.json Scripts

```json
{
  "scripts": {
    "lint": "biome lint .",
    "lint:fix": "biome lint --fix .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "check": "biome check .",
    "check:fix": "biome check --fix ."
  }
}
```

---

## Advantages Over ESLint + Prettier

1. **Single tool:** No conflicts between linter and formatter
2. **10-100x faster:** Rust-based, parallel processing
3. **Zero config:** Works out of the box with sensible defaults
4. **Built-in TypeScript:** No parser plugins needed
5. **Built-in React:** JSX/TSX support without plugins
6. **Import sorting:** Built-in, no extra plugin
7. **Consistent:** Same rules for linting and formatting

---

## Rule Categories

```json
{
  "linter": {
    "rules": {
      "recommended": true,

      // Override specific rules
      "complexity": {
        "noForEach": "warn"  // Suggest for...of over forEach
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "style": {
        "useConst": "error",
        "noVar": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noShadowRestrictedNames": "error"
      },
      "nursery": {
        // Experimental rules (may change)
      }
    }
  }
}
```

### Equivalent Rules (ESLint → Biome)

| ESLint Rule | Biome Rule |
|------------|------------|
| `no-unused-vars` | `correctness/noUnusedVariables` |
| `no-explicit-any` | `suspicious/noExplicitAny` |
| `no-var` | `style/noVar` |
| `prefer-const` | `style/useConst` |
| `eqeqeq` | `suspicious/noDoubleEquals` |
| `no-shadow` | `suspicious/noShadowRestrictedNames` |
| `consistent-type-imports` | `style/useImportType` |
| `import/no-duplicates` | `correctness/noDuplicateImports` (planned) |
| `react-hooks/rules-of-hooks` | `correctness/useHookAtTopLevel` |
| `react-hooks/exhaustive-deps` | `correctness/useExhaustiveDependencies` |

---

## Formatter Configuration

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",     // "space" or "tab"
    "indentWidth": 2,           // Spaces per indent
    "lineWidth": 100,           // Max line width
    "lineEnding": "lf",        // "lf", "crlf", or "cr"
    "formatWithErrors": false   // Don't format files with syntax errors
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",         // "single" or "double"
      "trailingCommas": "es5",        // "all", "es5", or "none"
      "semicolons": "always",         // "always" or "asNeeded"
      "arrowParentheses": "always",   // "always" or "asNeeded"
      "bracketSpacing": true          // { foo } vs {foo}
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"  // JSON doesn't allow trailing commas
    }
  }
}
```

---

## Import Sorting

```json
{
  "organizeImports": {
    "enabled": true
  }
}
```

Biome automatically organizes imports:

```typescript
// Before
import { z } from 'zod';
import type { User } from './types';
import React from 'react';
import { Button } from '@mui/material';

// After (Biome-sorted)
import React from 'react';
import { Button } from '@mui/material';
import { z } from 'zod';

import type { User } from './types';
```

---

## Per-File Overrides

```json
{
  "overrides": [
    {
      "include": ["*.test.ts", "*.spec.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"  // Allow in tests
          }
        }
      }
    },
    {
      "include": ["*.json"],
      "formatter": {
        "indentWidth": 4
      }
    }
  ]
}
```

---

## Ignore Files

```json
{
  "files": {
    "ignore": [
      "dist/",
      "build/",
      "coverage/",
      "*.min.js"
    ]
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true  // Respects .gitignore
  }
}
```

---

## Editor Integration

### VS Code

Install **Biome VS Code extension** and configure:

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Cursor / Other Editors

Biome provides LSP support for any editor:

```bash
biome lsp-proxy
```

---

## CI/CD Integration

```json
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --fix ."
  }
}
```

```yaml
# GitHub Actions
- name: Check code quality
  run: npx @biomejs/biome check .
```

---

## Migration from ESLint + Prettier

```bash
# Automatic migration
npx @biomejs/biome migrate eslint --write
npx @biomejs/biome migrate prettier --write
```

**Manual migration steps:**

1. Install Biome: `npm install -D @biomejs/biome`
2. Initialize: `npx @biomejs/biome init`
3. Map ESLint rules to Biome equivalents (see table above)
4. Map Prettier options to Biome formatter config
5. Update scripts in package.json
6. Remove ESLint + Prettier: `npm uninstall eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`
7. Delete old configs: `.eslintrc*`, `.prettierrc*`, `.eslintignore`, `.prettierignore`

---

## Edge Cases

**Plugins not available in Biome:** Some ESLint plugins lack Biome equivalents. Check [Biome compatibility](https://biomejs.dev/linter/rules-sources/) before migrating.

**Monorepo:** Biome supports shared config with `extends` in biome.json.

**Schema version:** Always use the matching schema version in `$schema` URL.

**Experimental rules:** `nursery` rules may change between versions. Use with caution in CI.

---

## Related Topics

- See [eslint.md](eslint.md) for ESLint comparison and migration
- See [prettier.md](prettier.md) for Prettier comparison
- See main [code-quality/SKILL.md](../SKILL.md) for decision tree

---

## References

- [Biome Documentation](https://biomejs.dev/)
- [Biome Rules](https://biomejs.dev/linter/rules/)
- [Biome Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)
