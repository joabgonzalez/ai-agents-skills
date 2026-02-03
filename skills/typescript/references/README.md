# TypeScript Skill References

> Detailed guides for utility types, generics, type guards, configuration, and error handling

## Overview

This directory contains detailed guides for advanced TypeScript features. Main [SKILL.md](../SKILL.md) provides critical patterns. These references offer deep-dives into utility types, advanced generics, and type-safe patterns.

---

## Quick Navigation

| Reference                                    | Purpose                                          | Read When                                       |
| -------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| [utility-types.md](utility-types.md)         | 30+ built-in utility types (Partial, Pick, etc.) | Transforming types, avoiding manual definitions |
| [generics-advanced.md](generics-advanced.md) | Constraints, conditional types, mapped types     | Building reusable type-safe components          |
| [type-guards.md](type-guards.md)             | Type narrowing, discriminated unions             | Runtime type checking and validation            |
| [config-patterns.md](config-patterns.md)     | tsconfig.json deep dive, strict mode             | Setting up TypeScript projects                  |
| [error-handling.md](error-handling.md)       | Type-safe error patterns, Result types           | Handling errors without exceptions              |

---

## Reading Strategy

### For Type Transformations

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [utility-types.md](utility-types.md) for Partial, Pick, Omit, Record, etc.

### For Generic Functions/Components

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [generics-advanced.md](generics-advanced.md) for constraints and conditional types

### For Runtime Validation

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [type-guards.md](type-guards.md) for type narrowing patterns

### For Project Setup

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [config-patterns.md](config-patterns.md) for strict mode and compiler options

---

## File Descriptions

### [utility-types.md](utility-types.md)

**Complete guide to 30+ built-in utility types**

- Partial, Required, Readonly
- Pick, Omit, Exclude, Extract
- Record, NonNullable, ReturnType
- Parameters, ConstructorParameters
- And 20+ more with examples

### [generics-advanced.md](generics-advanced.md)

**Advanced generic patterns**

- Generic constraints
- Conditional types
- Mapped types
- Template literal types
- Infer keyword

### [type-guards.md](type-guards.md)

**Type narrowing and validation**

- typeof, instanceof guards
- User-defined type guards
- Discriminated unions
- Assertion functions

### [config-patterns.md](config-patterns.md)

**tsconfig.json configuration**

- Strict mode options
- Module resolution
- Path mapping
- Project references

### [error-handling.md](error-handling.md)

**Type-safe error patterns**

- Result types
- never type
- Error unions
- Exception handling
