# Redux Toolkit TypeScript Integration

> Type-safe Redux setup, typed hooks, RootState, AppDispatch, and slice typing

## When to Read This

- Setting up Redux with TypeScript
- Creating type-safe hooks
- Typing slices and thunks
- Configuring store with proper types
- Avoiding `any` in Redux code

---

## Store Setup

### ✅ Configure Store with Types

```typescript
// store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counter/counterSlice";
import userReducer from "./features/user/userSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
});

// ✅ Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Typed Hooks

### ✅ Pre-typed useSelector and useDispatch

```typescript
// hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// ✅ Pre-typed hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### ✅ Usage in Components

```typescript
import { useAppDispatch, useAppSelector } from './store/hooks';
import { increment } from './features/counter/counterSlice';

function Counter() {
  // ✅ Fully typed state
  const count = useAppSelector(state => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <button onClick={() => dispatch(increment())}>
      Count: {count}
    </button>
  );
}
```

---

## Slice Typing

### ✅ Typed State and Actions

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define state interface
interface CounterState {
  value: number;
  status: "idle" | "loading" | "failed";
}

// ✅ Initial state with type
const initialState: CounterState = {
  value: 0,
  status: "idle",
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    // ✅ Action without payload
    increment: (state) => {
      state.value += 1;
    },

    // ✅ Action with typed payload
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },

    // ✅ Action with complex payload
    updateStatus: (
      state,
      action: PayloadAction<{ status: CounterState["status"]; error?: string }>,
    ) => {
      state.status = action.payload.status;
    },
  },
});

export const { increment, incrementByAmount, updateStatus } =
  counterSlice.actions;
export default counterSlice.reducer;
```

---

## Async Thunk Typing

### ✅ Basic Thunk Types

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type arguments: <ReturnType, ArgumentType>
export const fetchUser = createAsyncThunk<User, string>(
  "user/fetchById",
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
);
```

### ✅ Thunk with Error Handling

```typescript
interface ValidationError {
  message: string;
  field: string;
}

// ✅ Type arguments: <ReturnType, ArgumentType, ThunkConfig>
export const updateUser = createAsyncThunk<
  User,
  { id: string; name: string },
  { rejectValue: ValidationError }
>("user/update", async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${userData.id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error);
    }

    return response.json();
  } catch (error) {
    return rejectWithValue({
      message: "Network error",
      field: "general",
    });
  }
});
```

### ✅ Thunk with State Access

```typescript
export const addTodoAndSync = createAsyncThunk<
  Todo,
  string,
  { state: RootState }
>("todos/addAndSync", async (text, { getState }) => {
  // ✅ getState() is typed as RootState
  const userId = getState().auth.userId;

  const todo = { id: nanoid(), text, userId };
  const response = await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify(todo),
  });

  return response.json();
});
```

---

## Selector Typing

### ✅ Typed Selectors

```typescript
import { RootState } from "../../store";

// ✅ Explicit return type
export const selectCount = (state: RootState): number => state.counter.value;

// ✅ Type inference
export const selectStatus = (state: RootState) => state.counter.status;
// Inferred return type: 'idle' | 'loading' | 'failed'
```

### ✅ Typed createSelector

```typescript
import { createSelector } from "@reduxjs/toolkit";

const selectTodos = (state: RootState) => state.todos;
const selectFilter = (state: RootState) => state.filter;

// ✅ Types inferred from input selectors
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    // todos: Todo[]
    // filter: string
    return todos.filter(/* ... */);
  },
);
```

---

## EntityAdapter with TypeScript

### ✅ Typed Adapter and Selectors

```typescript
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// ✅ Create typed adapter
const todosAdapter = createEntityAdapter<Todo>();

// ✅ Extend EntityState for additional properties
interface TodosState extends EntityState<Todo, string> {
  loading: boolean;
  error: string | null;
}

const todosSlice = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState({
    loading: false,
    error: null,
  }) as TodosState,
  reducers: {
    todoAdded: todosAdapter.addOne,
  },
});

// ✅ Generate typed selectors
export const todosSelectors = todosAdapter.getSelectors<RootState>(
  (state) => state.todos,
);
```

---

## Prepare Callback Typing

### ✅ Typed Prepare

```typescript
const todosSlice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    addTodo: {
      // ✅ Type the reducer
      reducer: (state, action: PayloadAction<Todo>) => {
        state.push(action.payload);
      },
      // ✅ Type the prepare callback
      prepare: (text: string) => ({
        payload: {
          id: nanoid(),
          text,
          completed: false,
        } as Todo,
      }),
    },
  },
});
```

---

## extraReducers Typing

### ✅ Typed extraReducers

```typescript
import { fetchUser } from "./userThunks";

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null as User | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Action types inferred from thunk
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Typed as User
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed";
      });
  },
});
```

---

## Advanced Patterns

### ✅ Discriminated Union for Actions

```typescript
type TodoAction =
  | { type: "added"; payload: Todo }
  | { type: "toggled"; payload: string }
  | { type: "deleted"; payload: string };

const todosSlice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    // ✅ Actions maintain discriminated union
    todoAdded: (state, action: PayloadAction<Todo>) => {
      state.push(action.payload);
    },
    todoToggled: (state, action: PayloadAction<string>) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
});
```

### ✅ Generic Slice Factory

```typescript
function createGenericSlice<T extends { id: string }>(
  name: string,
  initialState: T[],
) {
  return createSlice({
    name,
    initialState,
    reducers: {
      add: (state, action: PayloadAction<T>) => {
        state.push(action.payload);
      },
      remove: (state, action: PayloadAction<string>) => {
        return state.filter((item) => item.id !== action.payload);
      },
    },
  });
}

// Usage:
const usersSlice = createGenericSlice<User>("users", []);
const postsSlice = createGenericSlice<Post>("posts", []);
```

---

## Provider Setup

### ✅ Typed Provider

```typescript
// main.tsx or App.tsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      {/* Your app */}
    </Provider>
  );
}
```

---

## Common Type Patterns

### ✅ Union Types for Status

```typescript
interface AppState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

### ✅ Optional Properties

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  profile?: {
    avatar: string;
    bio: string;
  };
}
```

### ✅ Readonly Arrays

```typescript
interface AppState {
  readonly items: ReadonlyArray<Item>;
}
```

---

## Best Practices

1. **Infer types from store** - Use `typeof store.getState` for RootState
2. **Create pre-typed hooks** - Define once, use everywhere
3. **Type action payloads** - Use `PayloadAction<T>` for all payloads
4. **Type thunk arguments** - Specify return, arg, and config types
5. **Type selectors explicitly** - Add return types to selector functions
6. **Use EntityState** - Extend for adapter-based state
7. **Avoid any** - TypeScript strict mode catches errors early

---

## Edge Cases

**Circular dependencies:** If RootState references slices that need RootState, extract types to separate file.

**Thunk typing order:** Type arguments: `<ReturnType, ArgType, ThunkConfig>`. ThunkConfig is optional.

**EntityState ID type:** Second generic argument specifies ID type: `EntityState<Todo, string>`.

**Prepare callback:** Must return `{ payload: T }` or `{ payload: T; meta?: any; error?: any }`.

**Generic constraints:** When creating generic slices, constrain with `extends` for required properties.

---

## References

- [Redux Toolkit TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [React Redux TypeScript](https://react-redux.js.org/using-react-redux/usage-with-typescript)
