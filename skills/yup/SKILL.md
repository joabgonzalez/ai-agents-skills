---
name: yup
description: Schema validation for JavaScript objects with expressive API.
skills:
  - conventions
  - typescript
dependencies:
  yup: ">=1.0.0 <2.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Yup Skill

## Overview

Schema-based validation library for JavaScript and TypeScript with intuitive API.

## Objective

Enable developers to define and validate data schemas with proper TypeScript integration and error handling.

## Conventions

Refer to conventions for:

- Error handling

Refer to typescript for:

- Type inference from schemas

### Yup Specific

- Define schemas with proper types
- Use TypeScript's InferType for type extraction
- Implement custom validation methods
- Handle validation errors appropriately
- Use schema composition

## Example

```typescript
import * as yup from "yup";

const userSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  age: yup.number().positive().integer().min(18, "Must be 18 or older"),
});

type User = yup.InferType<typeof userSchema>;

try {
  const validUser: User = await userSchema.validate({
    name: "John",
    email: "john@example.com",
    age: 25,
  });
} catch (error) {
  if (error instanceof yup.ValidationError) {
    console.error(error.message);
  }
}
```

## References

- https://github.com/jquense/yup
