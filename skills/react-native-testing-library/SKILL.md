---
name: react-native-testing-library
description: "User-centric React Native component testing. Trigger: When testing React Native components with RNTL."
compatibility: "react-native"
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - react-native
    - jest
  dependencies:
    "@testing-library/react-native": ">=12.0.0 <13.0.0"
  allowed-tools:
    - documentation-reader
    - web-search
---

# React Native Testing Library Skill

## When to Use

- Testing React Native components
- Simulating user interactions
- Writing maintainable tests

## Critical Patterns

- Use queries for selection
- Prefer user-event for actions
- Test from user perspective

## Decision Tree

- Render or shallow? → Always render
- Need async? → Use findBy\*
- Accessibility? → Use accessibilityLabel queries

## Edge Cases

- Native module mocks
- Async UI updates
- Platform-specific UI
