# Complete Skill Examples

> Full skill examples for simple, medium, and complex structures

## Overview

This document provides complete, copy-pasteable skill examples demonstrating proper structure
at each complexity level. Use these as starting points for new skills.

---

## Example 1: Simple Skill (Prettier)

**Indicators:** <15 patterns, single topic, no sub-divisions

````markdown
---
name: prettier
description: Prettier code formatting configuration and integration. Trigger: When configuring code formatting or setting up Prettier.
skills:
  - conventions
dependencies:
  prettier: ">=2.0.0 <4.0.0"
---

# Prettier

## Overview

Prettier is an opinionated code formatter that enforces consistent style across projects.
Supports JavaScript, TypeScript, CSS, HTML, JSON, Markdown, and more.

## Objective

Enable automatic, consistent code formatting with minimal configuration and maximum team adoption.

---

## When to Use

Use this skill when:

- Setting up new project requiring code formatting
- Standardizing code style across team
- Integrating formatter with editors and CI/CD
- Enforcing style without manual code reviews

Don't use when:

- Project requires highly customized formatting rules (use ESLint)
- Working with language Prettier doesn't support
- Team prefers manual formatting control

---

## Critical Patterns

### ✅ REQUIRED: Project Configuration

Create `.prettierrc` in project root for consistent formatting.

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```
````

### ✅ REQUIRED: Add Format Scripts

Include format and format-check scripts in package.json.

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,ts,jsx,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,ts,jsx,tsx,json,css,md}\""
  }
}
```

### ✅ REQUIRED: Ignore Files

Create `.prettierignore` to exclude generated or vendored code.

```
build/
dist/
node_modules/
*.min.js
package-lock.json
```

### ❌ NEVER: Commit Unformatted Code

Use pre-commit hook to enforce formatting.

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx,json,css,md}": "prettier --write"
  }
}
```

---

## Decision Tree

```
New project? → Add .prettierrc + scripts
Existing project? → Run format once, then add pre-commit hook
CI/CD? → Add format:check to CI pipeline
Editor integration? → Install Prettier extension + enable format-on-save
```

---

## Conventions

Refer to [conventions](../conventions/SKILL.md) for general coding standards.

### Prettier-Specific

- Use project-level `.prettierrc` (not global config)
- Commit `.prettierrc` to version control
- Run `format:check` in CI, not `format` (read-only)
- Configure editor to format on save

---

## Example

Complete setup for TypeScript React project:

```bash
# Install
npm install --save-dev prettier

# Create .prettierrc
cat > .prettierrc << EOF
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
EOF

# Create .prettierignore
cat > .prettierignore << EOF
node_modules/
build/
dist/
coverage/
EOF

# Add scripts to package.json
npm pkg set scripts.format="prettier --write \"src/**/*.{js,ts,jsx,tsx,json,css,md}\""
npm pkg set scripts.format:check="prettier --check \"src/**/*.{js,ts,jsx,tsx,json,css,md}\""

# Format entire project
npm run format
```

---

## Edge Cases

### Large Files

Prettier may be slow on files >1000 lines. Use `--cache` flag.

```json
"scripts": {
  "format": "prettier --write --cache \"src/**/*.{js,ts}\""
}
```

### Conflicting with ESLint

Use `eslint-config-prettier` to disable conflicting rules.

```bash
npm install --save-dev eslint-config-prettier
```

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "prettier"]
}
```

---

## Commands

```bash
# Format all files
npx prettier --write .

# Check formatting (CI)
npx prettier --check .

# Format specific files
npx prettier --write src/app.ts src/utils.ts

# List files that need formatting
npx prettier --check . | grep "Code style issues"
```

---

## References

- [Prettier Docs](https://prettier.io/docs/en/)
- [Configuration](https://prettier.io/docs/en/configuration.html)
- [CLI](https://prettier.io/docs/en/cli.html)

````

---

## Example 2: Medium Skill (Formik)

**Indicators:** 15-40 patterns, 2-3 sub-topics, needs template

```markdown
---
name: formik
description: Form handling patterns with validation using Formik library. Trigger: When implementing forms with validation in React.
skills:
  - react
  - yup
  - typescript
dependencies:
  formik: ">=2.0.0 <3.0.0"
---

# Formik

## Overview

Formik simplifies form state management, validation, and submission in React.
Handles complex forms with field-level and form-level validation.

## Objective

Implement robust, accessible forms with validation, error handling, and submission logic
using Formik's hooks and components.

---

## When to Use

Use this skill when:

- Building React forms with validation
- Need field-level error handling
- Complex forms with multiple fields
- Integration with validation schemas (Yup)

Don't use when:

- Simple form with 1-2 unvalidated inputs
- Using different form library (React Hook Form)
- Native HTML forms without React

---

## Critical Patterns

### ✅ REQUIRED: useFormik Hook

Use useFormik for basic forms.

```typescript
import { useFormik } from 'formik';

function LoginForm() {
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    onSubmit: values => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <input
        name="email"
        onChange={formik.handleChange}
        value={formik.values.email}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
````

### ✅ REQUIRED: Yup Validation Schema

Define validation with Yup schemas.

```typescript
import * as Yup from "yup";

const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Too short").required("Required"),
});

const formik = useFormik({
  initialValues: { email: "", password: "" },
  validationSchema: schema,
  onSubmit: (values) => {
    /* ... */
  },
});
```

{...10 more patterns}

---

## Decision Tree

```
Simple form (<5 fields)? → useFormik hook
Complex form (5+ fields)? → Formik component + Field
Need validation? → Add validationSchema (Yup)
Field-level validation? → Use validate prop on Field
Async validation? → Use validate function with Promise
Multi-step form? → Use Formik context + wizard pattern
```

---

## Resources

- Templates: See [assets/form-template.tsx](assets/form-template.tsx)
- Validation: See [yup skill](../yup/SKILL.md)

## References

- [Formik Docs](https://formik.org/docs/overview)
- [Yup Integration](https://formik.org/docs/guides/validation#validationschema)

````

---

## Example 3: Complex Skill (React - with references/)

**Indicators:** 40+ patterns, 4+ sub-topics, needs references

```markdown
---
name: react
description: React component patterns, hooks, performance, and server features. Trigger: When implementing React components or features.
skills:
  - javascript
  - typescript
  - a11y
dependencies:
  react: ">=18.0.0 <20.0.0"
---

# React

## Overview

React library for building user interfaces with components, hooks, and declarative rendering.
Supports client and server rendering with React 18+ features.

## Objective

Build maintainable, performant React applications using functional components, hooks,
proper state management, and modern patterns.

---

## When to Use

Use this skill when:

- Creating React functional components
- Implementing hooks for state/effects
- Optimizing component performance
- Building server-rendered React apps

Don't use when:

- Building non-React applications
- Legacy React <16.8 (pre-hooks)
- Simple static HTML (no interactivity needed)

---

## Quick Reference

| Task | Solution | Reference |
|------|----------|-----------|
| Manage state | useState/useReducer | [hooks.md](references/hooks.md) |
| Side effects | useEffect | [hooks.md](references/hooks.md) |
| Composition | Props, children, HOCs | [components.md](references/components.md) |
| Performance | useMemo, useCallback, React.memo | [performance.md](references/performance.md) |
| Server rendering | Server Components, RSC | [server-features.md](references/server-features.md) |

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Hook Dependencies

Always include all values used inside useEffect in dependency array.

```typescript
// ✅ CORRECT
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ WRONG: Missing dependency
useEffect(() => {
  fetchData(userId);
}, []);
````

See [hooks.md](references/hooks.md) for useState, useReducer, useContext, custom hooks,
and composition.

### ✅ REQUIRED [CRITICAL]: Stable Keys for Lists

Use unique IDs for list keys, never array indices.

```typescript
// ✅ CORRECT
{items.map(item => <li key={item.id}>{item.name}</li>)}

// ❌ WRONG
{items.map((item, i) => <li key={i}>{item.name}</li>)}
```

### ✅ REQUIRED [CRITICAL]: Immutable State Updates

Never mutate state directly.

```typescript
// ✅ CORRECT
setItems((items) => [...items, newItem]);

// ❌ WRONG
setItems((items) => {
  items.push(newItem);
  return items;
});
```

{...10 more critical patterns with brief examples and links to references}

---

## Decision Tree

```
Need state? → useState (simple) or useReducer (complex)
Need side effects? → useEffect
Need context? → useContext
Need memoization? → useMemo (values) or useCallback (functions)
Pure presentation? → Function component (no hooks)

Performance issue?
  → Unnecessary re-renders? → React.memo, useMemo
  → Large bundle? → Code splitting, lazy loading
  → See references/performance.md for optimization guide

Server rendering?
  → Static content? → Server Components
  → Dynamic data? → Server Components + streaming
  → See references/server-features.md
```

---

## Conventions

Refer to [conventions](../conventions/SKILL.md) for general standards.
Refer to [a11y](../a11y/SKILL.md) for accessibility requirements.

### React-Specific

- Prefer function components over class components
- Use TypeScript for prop types
- Destructure props in function signature
- Name event handlers `handleX` (handleClick, handleSubmit)
- Name custom hooks with `use` prefix

---

## Example

Complete component with hooks:

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

---

## Edge Cases

See [hooks.md](references/hooks.md#common-pitfalls) for stale closures, dependency issues.
See [performance.md](references/performance.md#edge-cases) for profiling large lists.
See [server-features.md](references/server-features.md#limitations) for Server Component constraints.

---

## Resources

### Detailed Guides

- [Hooks Patterns](references/hooks.md) - useState, useEffect, useReducer, useContext,
  custom hooks, composition
- [Component Architecture](references/components.md) - Composition, props patterns, HOCs,
  render props
- [Performance Optimization](references/performance.md) - Memoization, code splitting, profiling,
  bundle optimization
- [Server Features](references/server-features.md) - Server Components, Server Actions, streaming,
  data fetching

### Templates

- [Component Template](assets/component-template.tsx)
- [Custom Hook Template](assets/hook-template.tsx)

## References

- [React Docs](https://react.dev/)
- [Hooks API](https://react.dev/reference/react)
- [Server Components](https://react.dev/reference/react/server)

```

---

## Summary

**Simple skills:**
- All content in SKILL.md (150-300 lines)
- Inline examples for each pattern
- No assets/ or references/

**Medium skills:**
- SKILL.md (300-400 lines)
- assets/ for templates/schemas
- 15-40 patterns inline

**Complex skills:**
- SKILL.md (300 lines max, top patterns)
- assets/ for templates
- references/ (4+ files, 200-500 lines each)
- Quick Reference table
- Links to references throughout

---

## Reference

- Main guide: [SKILL.md](../SKILL.md)
- Structure: [structure.md](structure.md)
- References overview: [references-overview.md](references-overview.md)
- References implementation: [references-implementation.md](references-implementation.md)
```
