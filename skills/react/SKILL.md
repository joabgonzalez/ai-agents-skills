---
name: react
description: React component patterns, hooks, and best practices for modern React development. Functional components, proper hook usage, memoization, and performance optimization. Trigger: When creating React components, implementing hooks, managing state, or optimizing React performance.
skills:
  - conventions
  - a11y
  - typescript
  - javascript
dependencies:
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# React Skill

## Overview

Modern React patterns using hooks, functional components, and best practices for building maintainable UIs.

## Objective

Guide developers in building React applications with proper component architecture, state management, and performance optimization.

---

## When to Use

Use this skill when:

- Creating React functional components or refactoring class components
- Implementing hooks (useState, useEffect, useMemo, useCallback)
- Managing component state and side effects
- Optimizing React performance and preventing unnecessary re-renders
- Building component composition patterns
- Integrating with React ecosystem libraries

Don't use this skill for:

- Non-React JavaScript patterns (use javascript skill)
- React Native mobile development (use react-native skill)
- Redux state management (use redux-toolkit skill)
- Server-side framework specifics (use astro or relevant framework skill)

---

## Critical Patterns

### ✅ REQUIRED: Use Functional Components with Hooks

```typescript
// ✅ CORRECT: Functional component with hooks
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};

// ❌ WRONG: Class component (legacy pattern)
class Counter extends React.Component {
  state = { count: 0 };
  render() { /* ... */ }
}
```

### ✅ REQUIRED: Proper useEffect Dependencies

```typescript
// ✅ CORRECT: All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ WRONG: Missing dependencies (causes stale closures)
useEffect(() => {
  fetchData(userId);
}, []); // userId missing
```

### ✅ REQUIRED: Stable Keys for Lists

```typescript
// ✅ CORRECT: Use unique IDs
{items.map(item => <li key={item.id}>{item.name}</li>)}

// ❌ WRONG: Using array index (causes bugs on reorder/delete)
{items.map((item, index) => <li key={index}>{item.name}</li>)}
```

### ❌ NEVER: Conditional Hook Calls

```typescript
// ❌ WRONG: Hooks must not be conditional
if (condition) {
  const [value, setValue] = useState(0); // Breaks React rules
}

// ✅ CORRECT: Hooks at top level, conditional logic inside
const [value, setValue] = useState(0);
const shouldUse = condition ? value : defaultValue;
```

---

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to a11y for:

- Semantic HTML in JSX
- Keyboard navigation
- ARIA attributes

### React Specific

- Use functional components with hooks
- Implement proper component composition
- Memoize expensive computations with useMemo
- Use useCallback for event handlers in optimized components
- Handle side effects with useEffect
- Provide keys for lists

## Decision Tree

**State needed?** → Use local (`useState`) if component-specific, lift to parent if shared, use context for deeply nested sharing, Redux for global app state.

**Side effect needed?** → Use `useEffect` with proper dependency array. Empty array `[]` for mount-only, specific deps for reactive effects.

**Expensive computation?** → Use `useMemo` if calculation is costly and depends on specific inputs. Profile first with React DevTools.

**Callback prop to optimized child?** → Use `useCallback` to prevent unnecessary re-renders when passing functions to `memo()` components.

**Conditional rendering?** → Use `&&` for simple conditions, ternary `? :` for if-else, early return for complex logic.

**List rendering?** → Always provide stable `key` prop. Use unique IDs, not array indices for dynamic lists.

**Form handling?** → Use controlled components with `value` + `onChange`, or consider Formik/React Hook Form for complex forms.

**Performance issue?** → Profile with React DevTools Profiler, wrap expensive components in `React.memo()`, split large components.

---

## Example

```typescript
import { useState, useEffect, useMemo } from 'react';

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

---

## Edge Cases

**Stale closures in useEffect:** When state/props aren't in dependency array, closures capture old values. Always include all dependencies or use functional setState: `setState(prev => prev + 1)`.

**useEffect cleanup:** Return cleanup function for subscriptions, timers, event listeners to prevent memory leaks:

```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // Cleanup
}, []);
```

**Ref vs State:** Use `useRef` for values that don't trigger re-renders (DOM elements, mutable values). Use `useState` for values that should trigger UI updates.

**Batching updates:** React batches multiple setState calls in event handlers. In async code (setTimeout, promises), use `flushSync` for immediate updates (rare cases).

**Children prop patterns:** When passing children, use `React.ReactNode` type. For render props, use function children: `{(data) => <Component data={data} />}`.

---

## References

- https://react.dev/
- https://react.dev/reference/react
