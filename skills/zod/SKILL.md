---
name: zod
description: TypeScript-first schema validation with static type inference.
skills:
  - conventions
  - typescript
dependencies:
  zod: ">=3.0.0 <4.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Zod Skill

## Overview

TypeScript-first schema validation library with automatic type inference and excellent developer experience.

## Objective

Enable developers to define runtime-safe schemas with full TypeScript integration and type inference.

## Conventions

Refer to conventions for:

- Error handling

Refer to typescript for:

- Type patterns

### Zod Specific

- Define schemas with z.object, z.string, etc.
- Use z.infer for automatic type extraction
- Implement custom refinements
- Use transforms for data manipulation
- Handle validation errors with proper types

## Example

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().int().positive().min(18, "Must be 18 or older"),
});

type User = z.infer<typeof userSchema>;

const result = userSchema.safeParse({
  name: "John",
  email: "john@example.com",
  age: 25,
});

if (result.success) {
  const user: User = result.data;
} else {
  console.error(result.error.format());
}
```

## References

- https://zod.dev/
