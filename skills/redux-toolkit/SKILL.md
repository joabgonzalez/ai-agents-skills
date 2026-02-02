---
name: redux-toolkit
description: Redux Toolkit for predictable state management in React applications. Slices, async thunks, RTK Query integration, store configuration. Trigger: When implementing Redux state management, creating slices, or managing global application state.
skills:
  - conventions
  - react
  - typescript
dependencies:
  "@reduxjs/toolkit": ">=2.0.0 <3.0.0"
  react-redux: ">=8.0.0 <10.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Redux Toolkit Skill

## Overview

Modern Redux state management using Redux Toolkit's simplified API and best practices.

## Objective

Enable developers to implement predictable state management with Redux Toolkit's createSlice, configureStore, and other utilities.

---

## When to Use

Use this skill when:

- Managing global application state in React
- Creating Redux slices with actions and reducers
- Setting up Redux store with middleware
- Implementing async operations with thunks
- Normalizing state with EntityAdapter

Don't use this skill for:

- Component-local state (use React useState)
- API data fetching (prefer rtk-query skill)
- Non-React Redux (general Redux patterns)

---

## Critical Patterns

### ✅ REQUIRED: Use createSlice for Reducers

```typescript
// ✅ CORRECT: createSlice with immer
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer handles immutability
    },
  },
});

// ❌ WRONG: Manual action types and reducers
const INCREMENT = "counter/increment";
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
  }
}
```

### ✅ REQUIRED: Use Typed Hooks

```typescript
// ✅ CORRECT: Typed hooks
import { useAppDispatch, useAppSelector } from "./store/hooks";

const count = useAppSelector((state) => state.counter.value);
const dispatch = useAppDispatch();

// ❌ WRONG: Untyped hooks (no type safety)
import { useDispatch, useSelector } from "react-redux";
const count = useSelector((state: any) => state.counter.value);
```

### ✅ REQUIRED: Use configureStore

```typescript
// ✅ CORRECT: configureStore with automatic middleware
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// ❌ WRONG: Manual store setup
const store = createStore(
  combineReducers({
    /* ... */
  }),
);
```

---

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to react for:

- Component integration
- Hooks usage

### Redux Toolkit Specific

- Use createSlice for reducers and actions
- Implement typed hooks (useAppDispatch, useAppSelector)
- Use createAsyncThunk for async operations
- Leverage immer for immutable updates
- Follow Redux style guide

## Decision Tree

**Need global state?** → Create slice with `createSlice`, define initial state and reducers. Use typed hooks `useAppSelector`/`useAppDispatch`.

**Async operation (API call)?** → Use RTK Query for data fetching (preferred) or `createAsyncThunk` for custom async logic.

**State normalization needed?** → Use `createEntityAdapter` for managing collections with IDs (automatic CRUD reducers, selectors).

**Derived data from state?** → Create selector with `createSelector` (memoized), use in components with `useAppSelector`.

**Middleware needed?** → Add to `configureStore` middleware array. RTK includes thunk by default.

**Performance issue with re-renders?** → Use granular selectors (select only needed data), `React.memo()` on components, `shallowEqual` in useAppSelector.

**Cross-slice logic?** → Use extraReducers in slice or dispatch actions from async thunks. Avoid direct slice imports (circular deps).

**DevTools not working?** → Verify `configureStore` enables DevTools by default. Use Redux DevTools Extension for time-travel debugging.

## Example

```typescript
import { createSlice, PayloadAction, configureStore } from "@reduxjs/toolkit";

interface CounterState {
  value: number;
}

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 } as CounterState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});
```

---

## Edge Cases

**Circular dependencies:** Avoid importing slices into each other. Use middleware or thunks for cross-slice logic.

**State serialization:** Redux requires serializable state. Store non-serializable data (functions, promises) elsewhere or use middleware.

**Large state updates:** For bulk updates, combine multiple actions or use batch from react-redux.

**Middleware order:** Custom middleware should come after thunk but before serializableCheck. Configure in middleware array.

**EntityAdapter sorting:** Provide `sortComparer` in adapter for consistent ordering. Updates re-sort automatically.

**Hot reloading:** Use `module.hot` to preserve store state during development hot reloads.

---

## References

- https://redux-toolkit.js.org/
- https://redux.js.org/style-guide/
