---
name: react-testing-library
description: "User-centric React component testing. Trigger: When testing React components with RTL."
compatibility: "react"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - react
    - jest
  dependencies:
    "@testing-library/react": ">=14.0.0 <15.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# React Testing Library Skill

## When to Use

- Testing React components
- Simulating user interactions
- Writing maintainable tests

## Critical Patterns

- Use screen and queries
- Prefer user-event over fireEvent
- Test from user perspective

## Decision Tree

- Render or shallow? → Always render
- Need async? → Use findBy\*
- Accessibility? → Use role/label queries

## Edge Cases

- Portal/modal testing
- Async UI updates
- Custom hook testing
