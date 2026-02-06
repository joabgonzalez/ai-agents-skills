---
name: typescript
description: "Strict typing and type-safe development. Trigger: When implementing TypeScript in .ts/.tsx files, adding types, or enforcing safety."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - javascript
  dependencies:
    typescript: ">=5.0.0 <6.0.0"
---

# TypeScript Skill

Strict typing, type safety, and modern TypeScript patterns. Avoid `any`, leverage generics and utility types, and enforce compile-time correctness.

## When to Use

**Use when:**

- Writing or refactoring `.ts`/`.tsx` files
- Adding type definitions, interfaces, or type aliases
- Working with generics, utility types, or advanced type features
- Configuring `tsconfig.json`
- Resolving type errors or improving type inference

**Don't use for:**

- Runtime validation (use zod/yup)
- JavaScript-only patterns (use javascript skill)
- Framework-specific typing (delegate to react, mui, etc.)

## Critical Patterns

### Never use `any`

```typescript
// BAD: Disables type checking
function process(data: any) {
  return data.value;
}

// GOOD: Use unknown with type guards
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}
```

### Enable strict mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Use proper types for object shapes

```typescript
// Interface for extensible objects
interface User {
  id: number;
  name: string;
}

// Type alias for unions/intersections
type Status = "pending" | "approved" | "rejected";
type UserWithStatus = User & { status: Status };

// BAD: Empty object type (too permissive)
const user: {} = { anything: "allowed" };
```

### Constrain generics

```typescript
// GOOD: Constrained generic
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// BAD: Unconstrained (no type safety)
function getProperty<T>(obj: T, key: string): any {
  return obj[key];
}
```

### Use `import type` for type-only imports

```typescript
import type { User, Product } from "./types";
import { fetchUser } from "./api";
```

### Use `satisfies` for type validation without widening

```typescript
const config = {
  endpoint: "/api/users",
  timeout: 5000,
} satisfies Config;
// Inferred as { endpoint: string, timeout: number }, validated against Config
```

### Use `as const` for literal types

```typescript
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
} as const;

type Route = (typeof ROUTES)[keyof typeof ROUTES]; // '/' | '/about'
```

## Decision Tree

- **Runtime validation needed?** -> Use zod/yup. TypeScript is compile-time only.
- **Transforming types?** -> See [references/utility-types.md](references/utility-types.md) for Partial, Pick, Omit, Record, and 20+ more.
- **Unknown data?** -> Use `unknown`, never `any`. See [references/type-guards.md](references/type-guards.md).
- **Missing third-party types?** -> Install `@types/*` or declare custom types in `types/`.
- **Complex object shape?** -> `interface` for extensibility, `type` for unions/intersections/computed.
- **Reusable logic across types?** -> See [references/generics-advanced.md](references/generics-advanced.md).
- **External API response?** -> Define interface from actual response shape. Use quicktype for generation.
- **New project setup?** -> See [references/config-patterns.md](references/config-patterns.md).
- **Type-safe error handling?** -> See [references/error-handling.md](references/error-handling.md).

## Example

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type UserUpdate = Partial<Pick<User, "name" | "email">>;

function updateUser<T extends User>(user: T, updates: UserUpdate): T {
  return { ...user, ...updates };
}

const result: User = updateUser(
  { id: 1, name: "John", email: "john@example.com" },
  { name: "Jane" },
);
```

## Edge Cases

**Discriminated unions for type narrowing:**

```typescript
type Result =
  | { success: true; data: string }
  | { success: false; error: Error };

function handle(result: Result) {
  if (result.success) {
    console.log(result.data); // TypeScript knows data exists
  }
}
```

**Custom type guards:**

```typescript
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

- **Circular type references:** Break cycles by extracting shared interfaces or using type parameters.
- **Index signatures:** Use `Record<string, Type>` for dynamic keys; mapped types for known keys with dynamic values.
- **Const assertions:** `as const` creates `{ readonly mode: 'development' }`, not `{ mode: string }`.

## Checklist

- [ ] `strict: true` in `tsconfig.json`
- [ ] No `any` usage -- use `unknown` with type guards
- [ ] `import type` for type-only imports
- [ ] Interfaces for object shapes, type aliases for unions/intersections
- [ ] Generics constrained with `extends`
- [ ] `satisfies` for validation without type widening
- [ ] `as const` for literal inference

## Resources

- [references/](references/README.md) -- utility types, generics, type guards, config patterns, error handling
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
