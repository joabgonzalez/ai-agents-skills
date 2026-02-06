---
name: jest
description: "Unit, integration, and snapshot testing with Jest. Trigger: When writing or running tests with Jest."
compatibility: "javascript"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    jest: ">=29.0.0 <30.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# Jest Skill

## When to Use

- Unit, integration, or snapshot testing
- Testing JS/TS codebases
- Mocking dependencies

## Critical Patterns

- Use describe/it for structure
- Use beforeEach/afterEach for setup/teardown
- Prefer jest.mock for isolation

## Decision Tree

- Unit or integration? → Structure tests accordingly
- Need mocks? → Use jest.mock
- Async code? → Use async/await in tests

## Edge Cases

- Mocking ES modules
- Flaky async tests
- Snapshot drift
