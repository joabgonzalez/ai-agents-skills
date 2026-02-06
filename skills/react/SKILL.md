---
name: react
description: "Modern React with hooks and functional components. Trigger: When creating components, implementing hooks, managing state, or optimizing."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - a11y
    - typescript
    - javascript
    - architecture-patterns
    - humanizer
  dependencies:
    react: ">=17.0.0 <19.0.0"
---

# React Skill

Modern React patterns using hooks, functional components, and best practices for building maintainable UIs with proper state management and performance optimization.

## When to Use

Use when:

- Creating or refactoring React functional components
- Implementing hooks (useState, useEffect, useMemo, useCallback)
- Managing state, side effects, or performance optimization
- Building component composition patterns

Don't use for:

- Non-React JS (use javascript skill)
- React Native (use react-native skill)
- Redux (use redux-toolkit skill)
- Server-side frameworks (use astro or relevant framework skill)

## Critical Patterns

### Functional Components with Hooks

```typescript
// CORRECT: Functional component with hooks
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

// WRONG: Class component (legacy)
class Counter extends React.Component {
  state = { count: 0 };
  render() { /* ... */ }
}
```

### Proper useEffect Dependencies

```typescript
// CORRECT: All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId]);

// WRONG: Missing dependencies (stale closures)
useEffect(() => {
  fetchData(userId);
}, []); // userId missing
```

### Stable Keys for Lists

```typescript
// CORRECT: Unique IDs
{items.map(item => <li key={item.id}>{item.name}</li>)}

// WRONG: Array index (bugs on reorder/delete)
{items.map((item, index) => <li key={index}>{item.name}</li>)}
```

### Never Conditionally Call Hooks

```typescript
// WRONG: Breaks React rules
if (condition) {
  const [value, setValue] = useState(0);
}

// CORRECT: Hooks at top level, conditional logic inside
const [value, setValue] = useState(0);
const shouldUse = condition ? value : defaultValue;
```

### Conventions

Defer to `conventions` skill for code organization/naming and `a11y` skill for semantic HTML, keyboard navigation, and ARIA attributes.

## Decision Tree

- **Simple state (<3 values)?** -> `useState`. See [hooks-advanced.md](references/hooks-advanced.md) (useState Patterns section).
- **Complex state (4+ related values)?** -> `useReducer`. See [hooks-advanced.md](references/hooks-advanced.md) (useReducer Patterns section).
- **Side effect?** -> `useEffect` with proper deps. See [useEffect-patterns.md](references/useEffect-patterns.md).
- **Data fetching?** -> `useEffect` + AbortController. See [useEffect-patterns.md](references/useEffect-patterns.md) (Async Patterns section).
- **Performance issue?** -> Profile first with React DevTools. See [performance.md](references/performance.md).
- **Expensive computation?** -> `useMemo`. See [performance.md](references/performance.md) (useMemo section).
- **Callbacks to memoized children?** -> `useCallback`. See [performance.md](references/performance.md) (useCallback section).
- **Shared state across components?** -> Context API or lift state. See [context-patterns.md](references/context-patterns.md).
- **Compound component API?** -> See [context-patterns.md](references/context-patterns.md) (Compound Components section).
- **Form with validation?** -> Controlled components. See [forms-state.md](references/forms-state.md).
- **Multi-step form?** -> Wizard pattern. See [forms-state.md](references/forms-state.md) (Multi-Step Forms section).
- **File upload?** -> Controlled input + File API. See [forms-state.md](references/forms-state.md) (File Uploads section).
- **Large list (1000+)?** -> Virtualization. See [performance.md](references/performance.md) (List Rendering Optimization section).
- **Conditional rendering?** -> `&&` for simple, ternary for if-else, early return for complex logic.

## Example

```typescript
import { useState, useMemo } from 'react';

interface TodoProps {
  items: string[];
}

const TodoList: React.FC<TodoProps> = ({ items }) => {
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() =>
    items.filter(item => item.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>
        {filteredItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

## Edge Cases

**Stale closures in useEffect:** Include all dependencies or use functional setState: `setState(prev => prev + 1)`.

**useEffect cleanup:** Return cleanup for subscriptions, timers, listeners to prevent leaks:

```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

**Ref vs State:** `useRef` for values that don't trigger re-renders (DOM refs, mutable values). `useState` for values that update UI.

**Batching:** React batches setState in event handlers. In async code, use `flushSync` for immediate updates (rare).

**Children prop:** Use `React.ReactNode` type. For render props: `{(data) => <Component data={data} />}`.

**Architecture patterns:** Only apply Clean Architecture / SOLID when AGENTS.md specifies it, the codebase already uses domain/application/infrastructure folders, or the user requests it. See [architecture-patterns SKILL.md](../architecture-patterns/SKILL.md) and [frontend-integration.md](../architecture-patterns/references/frontend-integration.md).

## Checklist

- [ ] Functional components with hooks (no class components)
- [ ] All useEffect dependencies declared
- [ ] Stable keys on list items (unique IDs, not indices)
- [ ] No conditional hook calls
- [ ] Cleanup returned from useEffect for subscriptions/timers
- [ ] useMemo/useCallback only where profiling shows need
- [ ] Controlled inputs for forms with validation
- [ ] Context split by update frequency to avoid unnecessary re-renders

## Resources

- [references/](references/README.md) -- hooks-advanced, useEffect-patterns, performance, context-patterns, forms-state
- https://react.dev/
- https://react.dev/reference/react
