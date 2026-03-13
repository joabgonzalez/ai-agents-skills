---
name: redux-toolkit
description: "Predictable state management with Redux Toolkit. Trigger: When implementing Redux, creating slices, or managing global state."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: library
  skills:
    - react
  dependencies:
    "@reduxjs/toolkit": ">=2.0.0 <3.0.0"
    react-redux: ">=8.0.0 <10.0.0"
---

# Redux Toolkit

Redux state with simplified API. createSlice, configureStore, RTK Query for predictable state and async logic.

## When to Use

- Global app state in React (slices, store, middleware)
- Async logic (RTK Query, createAsyncThunk)
- Normalizing entities with EntityAdapter
- Replacing legacy Redux

Don't use for:

- Local state (use useState/useReducer)
- Server state caching (use React Query/SWR)
- Non-React Redux

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

### Redux Toolkit Specific

- createSlice for reducers/actions
- Typed hooks (useAppDispatch, useAppSelector)
- createAsyncThunk for async
- Immer for immutable updates
- Follow Redux style guide

---

## Decision Tree

```
Setting up Redux?
  → MUST read typescript-integration.md for store setup, typed hooks (useAppDispatch, useAppSelector), RootState/AppDispatch types

Creating slice?
  → MUST read slices-patterns.md for createSlice, reducers, extraReducers, immer patterns, prepare callbacks

Need global state?
  → Create slice with createSlice, define initial state and reducers. Use typed hooks useAppSelector/useAppDispatch

Async operation (API call)?
  → Use RTK Query for data fetching (preferred). MUST read rtk-query.md for createApi, queries, mutations, cache invalidation. For manual async: CHECK async-patterns.md for createAsyncThunk patterns

Derived/computed state?
  → CHECK selectors.md for createSelector (memoization), selector composition, preventing re-renders

Managing collections (users, posts, products)?
  → MUST read normalization.md for createEntityAdapter, normalized state, CRUD operations, relationships

State normalization needed?
  → Use createEntityAdapter for managing collections with IDs (automatic CRUD reducers, selectors)

Performance issue with re-renders?
  → Use granular selectors (select only needed data), React.memo() on components, shallowEqual in useAppSelector. CHECK selectors.md for memoization patterns

Cross-slice logic?
  → Use extraReducers in slice or dispatch actions from async thunks. Avoid direct slice imports (circular deps)

DevTools not working?
  → Verify configureStore enables DevTools by default. Use Redux DevTools Extension for time-travel debugging
```

---

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

**Circular deps:** Avoid importing slices; use middleware/thunks for cross-slice.

**Serialization:** No functions/promises in state; use middleware.

**Large updates:** Combine actions or batch from react-redux.

**Middleware order:** Custom after thunk, before serializableCheck.

**EntityAdapter:** `sortComparer` for ordering; updates re-sort auto.

**Hot reload:** `module.hot` preserves state during dev reloads.

---

### Advanced Architecture Integration

**⚠️ Context Check**: Apply only when:

1. AGENTS.md specifies architecture
2. Codebase has domain/application/infrastructure folders
3. User requests patterns

**If none** → Use Redux Toolkit practices, skip architecture.

### Applicable Patterns

- **SRP**: One slice per domain (user, order - not appSlice)
- **Clean Architecture**: RTK Query as Infrastructure
- **Result Pattern**: Wrap mutations/thunks with Result<T>

### Complete Guide

See [frontend-integration.md](../architecture-patterns/references/frontend-integration.md) for:

- Redux Toolkit + Clean Architecture
- SRP for slices
- RTK Query as Infrastructure
- Result Pattern with mutations

See [architecture-patterns SKILL.md](../architecture-patterns/SKILL.md) for selection.

---

## Resources

- https://redux-toolkit.js.org/
- https://redux.js.org/style-guide/
