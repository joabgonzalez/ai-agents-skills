# Redux Toolkit Selectors

> createSelector, reselect, memoization, and selector composition

## When to Read This

- Deriving data from Redux state
- Preventing unnecessary re-renders
- Composing complex selectors
- Optimizing selector performance
- Implementing search/filter logic

---

## Basic Selectors

### ✅ Simple State Selection

```typescript
// ✅ Simple selector (inline)
const count = useAppSelector((state) => state.counter.value);

// ✅ Named selector (reusable)
export const selectCount = (state: RootState) => state.counter.value;
export const selectStatus = (state: RootState) => state.counter.status;

// Usage:
const count = useAppSelector(selectCount);
```

---

## Memoized Selectors

### ✅ createSelector Basics

```typescript
import { createSelector } from "@reduxjs/toolkit";

// Input selectors
const selectTodos = (state: RootState) => state.todos;
const selectFilter = (state: RootState) => state.filter;

// ✅ Memoized selector (only recomputes when inputs change)
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    console.log("Filtering todos..."); // Only logs when todos or filter change

    switch (filter) {
      case "completed":
        return todos.filter((t) => t.completed);
      case "active":
        return todos.filter((t) => !t.completed);
      default:
        return todos;
    }
  },
);
```

### ✅ Why Memoization Matters

```typescript
// ❌ WRONG: Without memoization (re-computes every render)
const filteredTodos = useAppSelector((state) =>
  state.todos.filter((t) => t.completed === state.filter),
);
// New array every time, causes re-render even if data didn't change!

// ✅ CORRECT: With memoization
const filteredTodos = useAppSelector(selectFilteredTodos);
// Only new array when todos or filter actually change
```

---

## Selector Composition

### ✅ Building Complex Selectors

```typescript
// Base selectors
const selectUsers = (state: RootState) => state.users;
const selectPosts = (state: RootState) => state.posts;
const selectCurrentUserId = (state: RootState) => state.auth.userId;

// ✅ Composed selector
export const selectCurrentUser = createSelector(
  [selectUsers, selectCurrentUserId],
  (users, userId) => users[userId],
);

// ✅ Further composition
export const selectCurrentUserPosts = createSelector(
  [selectPosts, selectCurrentUserId],
  (posts, userId) => Object.values(posts).filter((p) => p.authorId === userId),
);

// ✅ Combining multiple selectors
export const selectUserWithPosts = createSelector(
  [selectCurrentUser, selectCurrentUserPosts],
  (user, posts) => ({
    ...user,
    posts,
    postCount: posts.length,
  }),
);
```

---

## Parameterized Selectors

### ✅ Selectors with Arguments

```typescript
// ❌ WRONG: This breaks memoization
const selectUserById = (state: RootState, userId: string) =>
  state.users[userId];

// ✅ CORRECT: Factory function
export const makeSelectUserById = () =>
  createSelector(
    [
      (state: RootState) => state.users,
      (_state: RootState, userId: string) => userId,
    ],
    (users, userId) => users[userId],
  );

// Usage in component:
const selectUserById = useMemo(() => makeSelectUserById(), []);
const user = useAppSelector((state) => selectUserById(state, userId));
```

### ✅ Alternative: Inline Parameterized

```typescript
export const selectUserById = createSelector(
  [(state: RootState) => state.users, (_: RootState, userId: string) => userId],
  (users, userId) => users[userId],
);

// Usage:
const user = useAppSelector((state) => selectUserById(state, "123"));
```

---

## Multiple Selector Instances

### ✅ Per-Component Memoization

```typescript
// TodoListItem.tsx
const TodoListItem = ({ todoId }: { todoId: string }) => {
  // ✅ Each component instance has own memoized selector
  const selectTodo = useMemo(
    () =>
      createSelector(
        [(state: RootState) => state.todos],
        (todos) => todos.find(t => t.id === todoId)
      ),
    [todoId]
  );

  const todo = useAppSelector(selectTodo);

  return <div>{todo?.text}</div>;
};
```

---

## Advanced Patterns

### ✅ Aggregating Data

```typescript
export const selectTodoStats = createSelector([selectTodos], (todos) => ({
  total: todos.length,
  completed: todos.filter((t) => t.completed).length,
  active: todos.filter((t) => !t.completed).length,
}));
```

### ✅ Sorting and Filtering

```typescript
export const selectSortedTodos = createSelector(
  [selectFilteredTodos],
  (todos) => {
    return [...todos].sort((a, b) => b.createdAt - a.createdAt);
  },
);
```

### ✅ Search/Filter Logic

```typescript
const selectSearchQuery = (state: RootState) => state.search.query;

export const selectSearchResults = createSelector(
  [selectTodos, selectSearchQuery],
  (todos, query) => {
    if (!query) return todos;

    const lowerQuery = query.toLowerCase();
    return todos.filter(
      (t) =>
        t.text.toLowerCase().includes(lowerQuery) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  },
);
```

---

## TypeScript Patterns

### ✅ Typed Selectors

```typescript
import { RootState } from "./store";

// ✅ Explicit return type
export const selectUser = (state: RootState): User | null => state.user.data;

// ✅ Type inference with createSelector
export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name ?? "Guest",
  // Return type inferred: string
);
```

### ✅ Generic Selectors

```typescript
function createEntitySelector<T>(entityKey: keyof RootState) {
  return createSelector(
    [(state: RootState) => state[entityKey]],
    (entities) => entities as T[],
  );
}

// Usage:
const selectUsers = createEntitySelector<User>("users");
```

---

## Performance Optimization

### ✅ Shallow Equality Check

```typescript
import { shallowEqual } from "react-redux";

// ✅ Prevent re-render if object properties are same
const { name, email } = useAppSelector(
  (state) => ({
    name: state.user.name,
    email: state.user.email,
  }),
  shallowEqual,
);
```

### ✅ Granular Selection

```typescript
// ❌ WRONG: Selects entire slice (re-renders on any change)
const counter = useAppSelector((state) => state.counter);

// ✅ CORRECT: Select only needed fields
const count = useAppSelector((state) => state.counter.value);
const status = useAppSelector((state) => state.counter.status);
```

---

## Debugging Selectors

### ✅ Add Logging

```typescript
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    console.log("selectFilteredTodos recomputing", { todos, filter });
    return todos.filter(/* ... */);
  },
);
```

### ✅ Track Recomputations

```typescript
let recomputations = 0;

export const selectExpensiveData = createSelector([selectData], (data) => {
  recomputations++;
  console.log("Recomputations:", recomputations);
  return expensiveTransform(data);
});
```

---

## Common Patterns

### ✅ Boolean Checks

```typescript
export const selectHasTodos = createSelector(
  [selectTodos],
  (todos) => todos.length > 0,
);

export const selectIsLoading = createSelector(
  [(state: RootState) => state.loading],
  (loading) => Object.values(loading).some(Boolean),
);
```

### ✅ Transforming Collections

```typescript
// Array to Object (by ID)
export const selectUsersById = createSelector([selectUsers], (users) =>
  users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  ),
);

// Group by property
export const selectPostsByCategory = createSelector([selectPosts], (posts) =>
  posts.reduce(
    (acc, post) => {
      const category = post.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(post);
      return acc;
    },
    {} as Record<string, Post[]>,
  ),
);
```

---

## Best Practices

1. **Use createSelector** - Always for derived/computed state
2. **Compose selectors** - Build complex selectors from simple ones
3. **Keep selectors pure** - No side effects, deterministic output
4. **Memoize expensive operations** - Filtering, sorting, transforming large arrays
5. **Select granularly** - Only select data you need to minimize re-renders
6. **Use factories for parameters** - Create selector instances per component when needed
7. **Type selectors** - Use TypeScript for type-safe selection

---

## Edge Cases

**Selector dependencies:** Changes to any input selector trigger recomputation. Keep input selectors minimal.

**Array/object identity:** createSelector returns same reference unless inputs change. Safe for React.memo.

**Multiple calls:** Calling same selector multiple times with different args creates separate cache entries.

**Resetting cache:** Selectors created with `createSelector` have `.clearCache()` method.

**Performance:** createSelector uses simple equality (`===`) for input comparison. For deep equality, use custom equality fn.

---

## References

- [Redux Toolkit createSelector](https://redux-toolkit.js.org/api/createSelector)
- [Reselect Library](https://github.com/reduxjs/reselect)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
