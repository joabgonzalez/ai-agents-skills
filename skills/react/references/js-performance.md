# JavaScript & DOM Performance Patterns

> Passive event listeners, SVG optimization, JSX hoisting, DOM batching, and memoized selectors

## Core Patterns

- Passive Event Listeners for Scroll/Touch
- SVG Optimization
- JSX Constant Hoisting
- DOM Batching
- Memoized Selectors and Computations

---

## Passive Event Listeners for Scroll/Touch

Non-passive event listeners on scroll/touch block the main thread and prevent the browser from optimizing scrolling. Add `{ passive: true }` when `preventDefault()` is not called.

```typescript
// ❌ WRONG: Blocks scroll optimization — browser must wait to see if preventDefault is called
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// ✅ CORRECT: passive: true tells browser this handler never calls preventDefault
useEffect(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('touchstart', handleTouch, { passive: true });
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('touchstart', handleTouch);
  };
}, []);
```

Use `passive: false` only when you explicitly need `event.preventDefault()` (e.g., preventing pull-to-refresh on a custom scroll container). Lighthouse flags non-passive scroll listeners as a performance issue.

---

## SVG Optimization

Inline SVGs as React components avoid extra HTTP requests and enable CSS/prop-based styling, but unoptimized SVGs add unnecessary bytes.

```typescript
// ❌ WRONG: Raw SVG with editor bloat — metadata, redundant attributes, fixed colors
export function Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round"
         data-v-abc123 xml:space="preserve">
      {/* ... */}
    </svg>
  );
}

// ✅ CORRECT: Cleaned SVG accepting currentColor and size props
interface IconProps {
  size?: number;
  className?: string;
}

export function CheckIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 11 4 16" />
    </svg>
  );
}
```

Use `currentColor` for stroke/fill so the icon inherits CSS `color`. Run SVGs through SVGO or use SVGR CLI to strip editor metadata automatically.

---

## JSX Constant Hoisting

JSX elements and objects defined inside a component body are recreated on every render. Move static values outside the component.

```typescript
// ❌ WRONG: options array recreated on every render — breaks React.memo on child
function Select({ value, onChange }) {
  const options = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];
  return <Dropdown options={options} value={value} onChange={onChange} />;
}

// ✅ CORRECT: Hoisted outside component — same reference across renders
const SORT_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

function Select({ value, onChange }) {
  return <Dropdown options={SORT_OPTIONS} value={value} onChange={onChange} />;
}
```

```typescript
// ❌ WRONG: Static JSX element (fallback, empty state) recreated each render
function UserList({ users }) {
  const emptyState = <p className="empty">No users found</p>;
  return users.length ? <List items={users} /> : emptyState;
}

// ✅ CORRECT: Hoisted as module-level constant
const EMPTY_STATE = <p className="empty">No users found</p>;

function UserList({ users }) {
  return users.length ? <List items={users} /> : EMPTY_STATE;
}
```

Only hoist truly static values. Values that depend on props or state must stay inside the component.

---

## DOM Batching

Multiple sequential DOM reads and writes cause layout thrashing — the browser must recalculate layout between each interleaved read/write. Batch reads together, then writes together.

```typescript
// ❌ WRONG: Interleaved read/write forces layout recalculation 3 times
function resizeElements(elements: HTMLElement[]) {
  elements.forEach(el => {
    const height = el.getBoundingClientRect().height; // READ — triggers layout
    el.style.height = `${height * 2}px`;             // WRITE
    const width = el.getBoundingClientRect().width;  // READ — triggers layout again
    el.style.width = `${width * 2}px`;              // WRITE
  });
}

// ✅ CORRECT: Read all first, then write all — single layout recalculation
function resizeElements(elements: HTMLElement[]) {
  // Read phase
  const dimensions = elements.map(el => el.getBoundingClientRect());

  // Write phase
  elements.forEach((el, i) => {
    el.style.height = `${dimensions[i].height * 2}px`;
    el.style.width = `${dimensions[i].width * 2}px`;
  });
}
```

In React, most DOM manipulation is handled by the reconciler automatically. Apply manual batching only when working with imperative DOM access in refs or third-party libraries.

---

## Memoized Selectors and Computations

Derived data that depends on expensive transforms should be memoized with `useMemo`. For global state (Redux, Zustand), use selector memoization to prevent unnecessary re-renders.

```typescript
// ❌ WRONG: Expensive filter runs on every render, even when todos hasn't changed
function TodoList({ todos, filter }) {
  const filtered = todos
    .filter(t => t.status === filter)
    .sort((a, b) => b.priority - a.priority);

  return <List items={filtered} />;
}

// ✅ CORRECT: Memoize the derived value
function TodoList({ todos, filter }) {
  const filtered = useMemo(
    () => todos
      .filter(t => t.status === filter)
      .sort((a, b) => b.priority - a.priority),
    [todos, filter],
  );

  return <List items={filtered} />;
}
```

```typescript
// ✅ Zustand: memoized selector prevents re-render when other state changes
const completedCount = useStore(
  useShallow(state => state.todos.filter(t => t.completed).length)
);

// ✅ Redux Toolkit: createSelector for memoized derived state
import { createSelector } from '@reduxjs/toolkit';

const selectCompletedTodos = createSelector(
  (state: RootState) => state.todos.items,
  (items) => items.filter(t => t.completed),
);
```

Apply `useMemo` when the computation is measurably expensive (>1ms), involves sorting/filtering large arrays, or when the result is passed as a prop to a memoized child.

---

## Common Pitfalls

**Passive listeners on elements that need `preventDefault`:** Custom scroll containers that trap scroll must use `{ passive: false }`. Overuse of `passive: true` will cause swallowed `preventDefault()` calls to silently fail.

**Hoisting values that reference props/state:** Hoisted module-level constants cannot access component scope. Only hoist pure data and static JSX with no dependencies.

**`useMemo` with cheap computations:** Adding `useMemo` to a trivial computation (array of 5 items, simple string concat) adds overhead without benefit. Profile before memoizing.

---

## Related Topics

- [performance.md](performance.md) — useMemo, useCallback, React.memo, concurrent features
- [waterfall-patterns.md](waterfall-patterns.md) — SWR and TanStack Query deduplication
- [use-effect-patterns.md](use-effect-patterns.md) — Event listener cleanup patterns
- [web-performance](../../web-performance/SKILL.md) — Core Web Vitals and framework-agnostic optimization
