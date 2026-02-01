---
name: redux-toolkit
description: Redux Toolkit for predictable state management in React applications.
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

## References

- https://redux-toolkit.js.org/
- https://redux.js.org/style-guide/
