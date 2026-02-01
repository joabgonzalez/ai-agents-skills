---
name: typescript
description: TypeScript best practices with strict typing for type-safe development.
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

## References

- https://www.typescriptlang.org/docs/
- https://www.typescriptlang.org/tsconfig
