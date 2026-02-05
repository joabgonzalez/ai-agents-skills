---
name: e2e-testing
description: "End-to-end testing patterns and best practices. Trigger: When writing or reviewing E2E tests for any layer."
compatibility: "testing"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - playwright
    - stagehand
    - typescript
    - frontend-dev
    - backend-dev
    - humanizer
  allowed-tools:
    - documentation-reader
    - web-search
---

# End-to-End Testing Skill

## Objective

Provide end-to-end testing patterns and architecture. This skill ORCHESTRATES playwright and stagehand for implementation. Use this skill for test architecture and strategy; delegate to specific tools for browser automation and test execution.

## When to Use

- Writing E2E tests for frontend or backend
- Automating browser or API flows
- Integrating with CI/CD pipelines

## Critical Patterns

- Use Playwright for browser automation
- Modularize test setup/teardown
- Use fixtures and data seeding

## Decision Tree

- UI or API E2E? → Use Playwright or fetch
- Data setup needed? → Use Stagehand
- CI integration? → Automate with scripts

## Edge Cases

- Flaky network tests
- Data race conditions
- CI environment differences
