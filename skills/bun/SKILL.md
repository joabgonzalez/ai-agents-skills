---
name: bun
description: "Fast JavaScript/TypeScript runtime with bundling and testing. Trigger: When using Bun for server apps, scripts, or tooling."
compatibility: "nodejs"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    bun: ">=1.0.0 <2.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# Bun Skill

## When to Use

- Running JS/TS apps with Bun
- Using Bun for fast bundling or testing
- Deploying edge/serverless apps

## Critical Patterns

- Use bun run/test for scripts
- Leverage Bun's native APIs
- Prefer Bun's bundler for speed

## Decision Tree

- Need fast startup? → Use Bun
- Bundling? → Use bun build
- Testing? → Use bun test

## Edge Cases

- Node.js compatibility gaps
- Native module support
- Edge deployment limits
