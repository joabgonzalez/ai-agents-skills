# React Skill References

> Detailed guides for React hooks, performance, state management, and form patterns

## Overview

This directory contains detailed guides for specific aspects of React development. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives into hooks, effects, performance optimization, and state patterns.

---

## Quick Navigation

### Hooks & Effects

| Reference                                      | Purpose                                           | Read When                                                  |
| ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| [hooks-advanced.md](hooks-advanced.md)         | useState vs useReducer, custom hooks, composition | Working with complex state or creating reusable hooks      |
| [use-effect-patterns.md](use-effect-patterns.md) | Cleanup, dependencies, race conditions            | Implementing side effects, subscriptions, or data fetching |

### Performance & Optimization

| Reference                                    | Purpose                                                         | Read When                                                    |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------ |
| [performance.md](performance.md)             | useMemo, useCallback, React.memo, concurrent features, Suspense | Optimizing re-renders or working with expensive computations |
| [js-performance.md](js-performance.md)       | Passive listeners, SVG, JSX hoisting, DOM batching, selectors   | Fine-grained JS/DOM performance tuning                       |

### State & Composition

| Reference                                  | Purpose                                           | Read When                                                  |
| ------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| [context-patterns.md](context-patterns.md) | Context API, compound components, error boundaries | Sharing state across components or building component APIs |
| [composition.md](composition.md)           | Children, slots, compound, headless, polymorphic  | Building reusable components with flexible APIs            |
| [forms-state.md](forms-state.md)           | Controlled vs uncontrolled, validation             | Building forms with state management                       |

### Server Features & Data Fetching

| Reference                                    | Purpose                                          | Read When                                                    |
| -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| [server-features.md](server-features.md)     | Server components, Suspense data, server actions | Building with Next.js App Router or RSC-enabled frameworks   |
| [waterfall-patterns.md](waterfall-patterns.md) | Request waterfall diagnosis, SWR, TanStack Query | Client-side data fetching, parallel requests, optimistic updates |

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
3. CHECK: [js-performance.md](js-performance.md) for passive listeners, SVG, and DOM patterns
4. Profile with React DevTools first

### For Forms & Data Fetching

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [use-effect-patterns.md](use-effect-patterns.md) for data fetching patterns
3. **MUST read**: [waterfall-patterns.md](waterfall-patterns.md) for SWR/TanStack Query and parallel fetching
4. CHECK: [forms-state.md](forms-state.md) for form-specific patterns

### For Server-Side / Next.js App Router

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [server-features.md](server-features.md) for RSC, Suspense, server actions
3. CHECK: [performance.md](performance.md) for concurrent features (useTransition, Suspense)

---

## File Descriptions

### [hooks-advanced.md](hooks-advanced.md)

**Advanced hook patterns and state management**

- useState vs useReducer decision matrix
- Custom hooks creation and composition
- Hook dependencies and closures
- useRef for mutable values
- useImperativeHandle for ref forwarding

### [use-effect-patterns.md](use-effect-patterns.md)

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

### [composition.md](composition.md)

**Composition Over Configuration patterns**

- Children pattern vs configuration props
- Named slots via ReactNode props
- Compound components (Context-based)
- Headless components (hooks for behavior)
- Polymorphic components (`as` prop)
- React Native slot patterns

### [forms-state.md](forms-state.md)

**Form state management patterns**

- Controlled vs uncontrolled components
- Form validation strategies
- Multi-step forms
- File uploads
- Integration with form libraries

### [server-features.md](server-features.md)

**React Server Components and server-side patterns**

- Server vs Client component decision tree
- Suspense for streaming data loading
- Parallel data fetching (avoid waterfalls)
- Server actions for mutations
- Loading/error state patterns

### [waterfall-patterns.md](waterfall-patterns.md)

**Client-side data fetching architecture**

- Request waterfall diagnosis and DevTools detection
- Parallel fetching with Promise.all and Promise.allSettled
- React 19 `use()` hook with Suspense
- SWR: deduplication, optimistic updates, global config
- TanStack Query: useQuery, useQueries, mutations, prefetching

### [js-performance.md](js-performance.md)

**JavaScript and DOM performance micro-optimizations**

- Passive event listeners for scroll/touch (`{ passive: true }`)
- SVG optimization with `currentColor` and size props
- JSX constant hoisting to avoid per-render allocations
- DOM read/write batching to prevent layout thrashing
- Memoized selectors with useMemo, Zustand useShallow, Redux createSelector

---

## Cross-Reference Map

- [hooks-advanced.md](hooks-advanced.md) → Extends SKILL.md's state management patterns; pairs with context-patterns.md for complex state sharing
- [use-effect-patterns.md](use-effect-patterns.md) → Extends SKILL.md's side effects patterns; foundational for data fetching and subscriptions
- [performance.md](performance.md) → Extends SKILL.md's performance patterns; pairs with server-features.md for Suspense and concurrent mode
- [context-patterns.md](context-patterns.md) → Extends SKILL.md's state sharing patterns; pairs with hooks-advanced.md for complex state
- [composition.md](composition.md) → Extends SKILL.md's component composition patterns; pairs with context-patterns.md for compound components
- [forms-state.md](forms-state.md) → Extends SKILL.md's form patterns; pairs with [form-validation](../../form-validation/SKILL.md) for schema-based validation
- [server-features.md](server-features.md) → Extends SKILL.md's server component patterns; pairs with performance.md for concurrent features
- [waterfall-patterns.md](waterfall-patterns.md) → Client-side parallel fetching; pairs with server-features.md for full-stack data architecture; pairs with use-effect-patterns.md for low-level fetch patterns
- [js-performance.md](js-performance.md) → DOM/JS micro-optimizations; pairs with performance.md for full optimization coverage; pairs with web-performance skill for Core Web Vitals context
- Related skills: [typescript](../../typescript/SKILL.md), [redux-toolkit](../../redux-toolkit/SKILL.md), [form-validation](../../form-validation/SKILL.md), [mui](../../mui/SKILL.md), [astro](../../astro/SKILL.md)
