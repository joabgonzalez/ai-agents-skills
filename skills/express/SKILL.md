---
name: express
description: "Express.js routing, middleware, and error handling. Trigger: When building REST APIs or server logic with Express."
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
    express: ">=4.18.0 <5.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# Express.js Skill

## When to Use

- Building REST APIs
- Composing middleware stacks
- Handling HTTP requests/responses

## Critical Patterns

- Use Router for modular routes
- Centralized error handling middleware
- Async/await in route handlers

## Decision Tree

- API versioning? → Use Router
- Auth needed? → Use middleware
- Error handling? → Use error middleware

## Edge Cases

- Async error propagation
- Middleware order bugs
- Large payload handling
