---
name: nest
description: "NestJS modular architecture with dependency injection. Trigger: When building scalable server apps with NestJS."
compatibility: "nodejs"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - nodejs
    - typescript
    - architecture-patterns
  dependencies:
    "@nestjs/core": ">=10.0.0 <11.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# NestJS Skill

## When to Use

- Building modular server-side apps
- Using dependency injection
- Structuring scalable APIs

## Critical Patterns

- Use modules for separation
- Providers for business logic
- Decorators for routing and DI

## Decision Tree

- REST or GraphQL? → Use controllers
- Service logic? → Use providers
- Config management? → Use ConfigModule

## Edge Cases

- Circular dependency injection
- Custom provider scopes
- Module import order
