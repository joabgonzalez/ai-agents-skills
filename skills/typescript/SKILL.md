---
name: typescript
description: TypeScript best practices with strict typing for type-safe development. Avoid any, use unknown, leverage generics and utility types. Trigger: When implementing or refactoring TypeScript in .ts/.tsx files, adding types/interfaces, or enforcing type safety.
skills:
  - conventions
  - javascript
dependencies:
  typescript: ">=5.0.0 <6.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# TypeScript Skill

## Overview

Comprehensive TypeScript guidance with focus on strict typing, type safety, and modern TypeScript features.

## Objective

Enable developers to write type-safe code with proper TypeScript patterns, avoiding `any`, and leveraging advanced type features.

---

## When to Use

Use this skill when:

- Writing or refactoring TypeScript code in .ts or .tsx files
- Adding type definitions, interfaces, or type aliases
- Enforcing type safety and strict typing
- Working with generics, utility types, or advanced type features
- Configuring tsconfig.json
- Resolving type errors or improving type inference

Don't use this skill for:

- Runtime validation (use zod or yup skills)
- JavaScript-only patterns (use javascript skill)
- Framework-specific typing (delegate to react, mui, etc.)

---

## Critical Patterns

### ❌ NEVER: Use `any` Type

```typescript
// ❌ WRONG: Disables type checking
function process(data: any) {
  return data.value; // No type safety
}

// ✅ CORRECT: Use unknown with type guards
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}
```

### ✅ REQUIRED: Enable Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### ✅ REQUIRED: Use Proper Type for Object Shapes

```typescript
// ✅ CORRECT: Interface for extensible objects
interface User {
  id: number;
  name: string;
}

// ✅ CORRECT: Type alias for unions/intersections
type Status = "pending" | "approved" | "rejected";
type UserWithStatus = User & { status: Status };

// ❌ WRONG: Empty object type (too permissive)
const user: {} = { anything: "allowed" };
```

### ✅ REQUIRED: Generic Constraints

```typescript
// ✅ CORRECT: Constrained generic
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  return obj[key];
}

// ❌ WRONG: Unconstrained generic (too permissive)
function getProperty<T>(obj: T, key: string): any {
  return obj[key]; // No type safety
}
```

---

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to javascript for:

- Modern JavaScript features
- Async patterns

### TypeScript Specific

- Enable strict mode in tsconfig.json
- Avoid `any` type - use `unknown` when type is uncertain
- Use interfaces for object shapes
- Use type aliases for unions and intersections
- Leverage generics for reusable components
- Use utility types (Partial, Pick, Omit, etc.)

## Decision Tree

**Need runtime validation?** → Use zod or yup for runtime schema validation, TypeScript handles compile-time only.

**Dealing with unknown data?** → Use `unknown` type, never `any`. Narrow with type guards.

**Third-party types missing?** → Install @types/\* packages or declare custom types in `types/` directory.

**Complex object shape?** → Use interface for extensibility, type alias for unions/intersections/computed types.

**Reusable logic with different types?** → Use generics with proper constraints (`T extends BaseType`).

**Need type transformation?** → Use utility types (Partial, Pick, Omit, Record, etc.) instead of manual definitions.

**External API response?** → Define interface from actual response shape, use tools like quicktype for generation.

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

---

## Edge Cases

**Type narrowing in unions:** Use discriminated unions with literal types for better type narrowing:

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

**Circular type references:** Break circular dependencies by extracting shared interfaces or using type parameters.

**Index signatures:** Use `Record<string, Type>` for dynamic keys. For known keys with dynamic values, use mapped types.

**Const assertions:** Use `as const` for literal types: `const config = { mode: 'development' } as const;` creates `{ readonly mode: 'development' }` not `{ mode: string }`.

**Type guards:** Create custom type guards with `is` keyword:

```typescript
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

---

## References

- https://www.typescriptlang.org/docs/
- https://www.typescriptlang.org/tsconfig
