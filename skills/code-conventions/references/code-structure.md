# Code Structure

> File and folder organization, single responsibility for files, and project structure patterns.

## Core Patterns

- Core Principle: Single Responsibility for Files
- Patterns
- Common Pitfalls
- Related Topics

---

## Core Principle: Single Responsibility for Files

Each file should have ONE clear purpose. If a file does validation + API calls + formatting + types, split it.

```typescript
// ❌ WRONG: Everything in one file
// utils.ts — 500 lines of mixed concerns
export function validateEmail() { /* ... */ }
export function fetchUser() { /* ... */ }
export function formatDate() { /* ... */ }
export type User = { /* ... */ };

// ✅ CORRECT: Each file has one purpose
// validation/email.ts → email validation
// services/userService.ts → user API calls
// utils/date.ts → date formatting
// types/user.ts → user type definitions
```

---

## Patterns

### ✅ REQUIRED: Group by Feature or Layer

```
# Option 1: Group by feature (recommended for most projects)
src/
├── users/
│   ├── UserService.ts
│   ├── UserValidator.ts
│   ├── UserTypes.ts
│   └── __tests__/
├── orders/
│   ├── OrderService.ts
│   └── __tests__/
└── shared/
    ├── utils/
    └── types/

# Option 2: Group by layer (for architecture-patterns projects)
src/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

**Rule**: Pick one approach per project and be consistent. Feature-based is simpler; layer-based is for projects using [architecture-patterns](../../architecture-patterns/SKILL.md).

### ✅ REQUIRED: No Dead Code

```typescript
// ❌ WRONG: Unused variables, functions, imports
const unused = 42;
function neverCalled() { /* dead code */ }
// import { something } from './lib'; // commented out

// ✅ CORRECT: Delete unused code entirely
// Git history preserves old code — no need to comment it out
```

### ✅ REQUIRED: No Variable Shadowing

```typescript
// ❌ WRONG: Inner variable shadows outer
import * as p from '@clack/prompts';
const result = items.find(p => p.id === selected); // 'p' shadows import

// ✅ CORRECT: Distinct names
import * as p from '@clack/prompts';
const result = items.find(item => item.id === selected);
```

### ✅ REQUIRED: Colocation

Keep related files together. Tests next to source, styles next to components:

```
# ✅ CORRECT: Colocated
components/
├── UserProfile/
│   ├── UserProfile.tsx
│   ├── UserProfile.test.tsx
│   └── UserProfile.styles.ts

# ❌ WRONG: Separated by type
src/
├── components/UserProfile.tsx
├── tests/UserProfile.test.tsx
└── styles/UserProfile.styles.ts
```

### Shared Utilities Organization

```
src/shared/
├── utils/           # Pure functions (formatDate, parseUrl)
├── types/           # Shared TypeScript types
├── constants/       # Application constants
└── hooks/           # Shared React hooks (if applicable)
```

**Rule**: Only put truly shared code in `shared/`. If only one feature uses it, keep it in that feature's directory.

---

## Common Pitfalls

**"utils.ts" catch-all**: Avoid dumping unrelated functions into a single utils file. Group by domain: `date-utils.ts`, `string-utils.ts`, `validation-utils.ts`.

**Deep nesting**: Avoid more than 4 levels of directory nesting. Flatten when possible.

**Circular dependencies**: If A imports B and B imports A, extract shared code to a third module.

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for quick reference
- See [naming-conventions.md](naming-conventions.md) for file naming rules
- See [architecture-patterns](../../architecture-patterns/SKILL.md) for layer-based structure
