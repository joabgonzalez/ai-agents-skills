---
name: conventions
description: Skill for general coding conventions and best practices shared across multiple skills (e.g., organization, documentation, type imports).
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# Coding Conventions Skill

## Overview

This skill centralizes general coding conventions and best practices that apply across multiple technologies and frameworks. It covers code organization, documentation, naming, and type import strategies.

## Objective

Ensure consistent coding practices across the codebase regardless of technology stack. This skill delegates technology-specific conventions to their respective skills (e.g., TypeScript, React, MUI).

## Conventions

### Code Organization

- Group related imports together (external libraries, internal modules, types)
- Use consistent file/folder structure within projects
- Separate business logic from UI components
- Follow single responsibility principle for files and functions

### Documentation

- Add JSDoc comments for exported functions, classes, and interfaces
- Document complex logic with inline comments
- Keep README files updated with setup instructions and architecture notes
- Use descriptive variable and function names that reduce need for comments

### Naming

- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that reveal intent

### Type Imports

- Import types separately using `import type` when supported
- Keep type imports organized and grouped
- Avoid circular dependencies in type definitions

## References

- Individual technology skills for specific conventions
- Project-specific style guides
