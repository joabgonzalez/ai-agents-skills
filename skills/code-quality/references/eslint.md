# ESLint

Most mature JavaScript/TypeScript linter with the largest plugin ecosystem. Best for enterprise projects needing custom rules and framework-specific plugins.

**Dependencies:**

```json
{
  "eslint": ">=8.0.0 <10.0.0",
  "@typescript-eslint/parser": "^7.0.0",
  "@typescript-eslint/eslint-plugin": "^7.0.0"
}
```

---

## Core Patterns

### ✅ REQUIRED: Extend Recommended Configs

```javascript
// .eslintrc.js (legacy config)
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
};

// eslint.config.js (flat config - ESLint 9+)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
```

### ✅ REQUIRED: TypeScript Parser

```javascript
// ✅ CORRECT: TypeScript parser for .ts/.tsx files
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};

// ❌ WRONG: Default parser for TypeScript (misses type-aware rules)
module.exports = {
  // No parser specified
};
```

### ✅ REQUIRED: Essential Quality Rules

```javascript
module.exports = {
  rules: {
    // Type safety
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'separate-type-imports',
    }],

    // Clean code
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-require-imports': 'error',

    // JS fundamentals
    'no-var': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
  },
};
```

### ✅ REQUIRED: Import Organization

```javascript
// With eslint-plugin-import
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-duplicates': 'error',
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
      'newlines-between': 'always',
    }],
  },
};
```

---

## React Configuration

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

---

## Flat Config (ESLint 9+)

```javascript
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
);
```

---

## Integration with Prettier

```javascript
// MUST install eslint-config-prettier to prevent conflicts
// npm install -D eslint-config-prettier

// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Must be LAST to override formatting rules
  ],
};
```

---

## CI/CD Integration

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

```yaml
# GitHub Actions
- name: Lint
  run: npm run lint
```

---

## Custom Rules

```javascript
// Disable rule for specific line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = externalApi.getResponse();

// Disable rule for file
/* eslint-disable @typescript-eslint/no-explicit-any */

// Override rules per directory
module.exports = {
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow in tests
      },
    },
  ],
};
```

---

## Edge Cases

**no-shadow vs @typescript-eslint/no-shadow:** Use the TS version; base rule gives false positives on enums.

**no-unused-vars vs @typescript-eslint/no-unused-vars:** Use the TS version; base rule doesn't understand type-only usage.

**Flat config migration:** ESLint 9+ uses `eslint.config.js` instead of `.eslintrc.*`. Use `@eslint/migrate-config` for automatic migration.

**Monorepo:** Use root config with per-package overrides or multiple config files.

**Performance:** For large codebases, use `--cache` flag and configure `ignorePatterns` to skip generated files.

---

## Related Topics

- See [prettier.md](prettier.md) for formatting integration
- See [biome.md](biome.md) for modern alternative
- See main [code-quality/SKILL.md](../SKILL.md) for decision tree

---

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [typescript-eslint](https://typescript-eslint.io/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
