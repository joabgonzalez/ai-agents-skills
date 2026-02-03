# React Skill References

> Detailed guides for React hooks, performance, state management, and form patterns

## Overview

This directory contains detailed guides for specific aspects of React development. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives into hooks, effects, performance optimization, and state patterns.

---

## Quick Navigation

### 🎣 Hooks & Effects

| Reference                                      | Purpose                                           | Read When                                                  |
| ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| [hooks-advanced.md](hooks-advanced.md)         | useState vs useReducer, custom hooks, composition | Working with complex state or creating reusable hooks      |
| [useEffect-patterns.md](useEffect-patterns.md) | Cleanup, dependencies, race conditions            | Implementing side effects, subscriptions, or data fetching |

### ⚡ Performance & Optimization

| Reference                        | Purpose                                          | Read When                                                    |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| [performance.md](performance.md) | useMemo, useCallback, React.memo, code splitting | Optimizing re-renders or working with expensive computations |

### 🏗️ State & Composition

| Reference                                  | Purpose                                        | Read When                                                  |
| ------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------- |
| [context-patterns.md](context-patterns.md) | Context API, compound components, render props | Sharing state across components or building component APIs |
| [forms-state.md](forms-state.md)           | Controlled vs uncontrolled, validation         | Building forms with state management                       |

---

## Reading Strategy

### For Basic Components

1. Read main [SKILL.md](../SKILL.md) only
2. Reference Decision Tree for specific questions

### For State-Heavy Components

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [hooks-advanced.md](hooks-advanced.md) for useState vs useReducer
3. CHECK: [context-patterns.md](context-patterns.md) if sharing state

### For Performance-Critical Components

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [performance.md](performance.md) for optimization strategies
3. Profile with React DevTools first

### For Forms & Data Fetching

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [useEffect-patterns.md](useEffect-patterns.md) for data fetching patterns
3. CHECK: [forms-state.md](forms-state.md) for form-specific patterns

---

## File Descriptions

### [hooks-advanced.md](hooks-advanced.md)

**Advanced hook patterns and state management**

- useState vs useReducer decision matrix
- Custom hooks creation and composition
- Hook dependencies and closures
- useRef for mutable values
- useImperativeHandle for ref forwarding

### [useEffect-patterns.md](useEffect-patterns.md)

**Complete guide to useEffect and side effects**

- Dependency array rules (mount-only, reactive, all deps)
- Cleanup functions for subscriptions and timers
- Race condition handling with AbortController
- Async effects patterns
- Common pitfalls and solutions

### [performance.md](performance.md)

**React performance optimization strategies**

- useMemo for expensive computations
- useCallback for stable function references
- React.memo for component memoization
- Code splitting with lazy and Suspense
- Profiling with React DevTools

### [context-patterns.md](context-patterns.md)

**State sharing and component composition**

- Context API setup and optimization
- Compound components pattern
- Render props vs hooks
- Provider composition
- Performance considerations with context

### [forms-state.md](forms-state.md)

**Form state management patterns**

- Controlled vs uncontrolled components
- Form validation strategies
- Multi-step forms
- File uploads
- Integration with form libraries
