# Redux Toolkit Async Patterns

> createAsyncThunk, loading states, error handling, and request cancellation

## When to Read This

- Implementing API calls from Redux
- Managing loading/error states
- Handling request cancellation
- Implementing optimistic updates
- Dealing with race conditions

---

## Basic Async Thunk

### ✅ Simple API Call

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ CORRECT: Type arguments <ReturnType, ArgumentType>
export const fetchUser = createAsyncThunk<User, string>(
  "users/fetchUser",
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  },
);
```

### ✅ Using in Slice

```typescript
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
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user";
      });
  },
});
```

---

## Error Handling

### ✅ Custom Error Messages

```typescript
export const fetchUser = createAsyncThunk<User, string>(
  "users/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        // ✅ Return custom error payload
        return rejectWithValue({
          status: response.status,
          message: await response.text(),
        });
      }

      return response.json();
    } catch (error) {
      // ✅ Handle network errors
      return rejectWithValue({
        status: 0,
        message: error instanceof Error ? error.message : "Network error",
      });
    }
  },
);
```

### ✅ Typed Error Handling

```typescript
interface ErrorPayload {
  status: number;
  message: string;
}

export const fetchUser = createAsyncThunk<
  User,
  string,
  { rejectValue: ErrorPayload }
>(
  'users/fetchUser',
  async (userId, { rejectWithValue }) => {
    // ... error handling with rejectWithValue
  }
);

// In slice:
.addCase(fetchUser.rejected, (state, action) => {
  if (action.payload) {
    // ✅ Typed error payload
    state.error = `${action.payload.status}: ${action.payload.message}`;
  } else {
    state.error = action.error.message || 'Unknown error';
  }
})
```

---

## ThunkAPI Parameters

### ✅ Accessing State and Dispatch

```typescript
export const addTodoAndFetch = createAsyncThunk<Todo, string>(
  "todos/addTodoAndFetch",
  async (text, { getState, dispatch }) => {
    // ✅ Access current state
    const state = getState() as RootState;
    const userId = state.user.id;

    // Create todo
    const todo = { id: nanoid(), text, userId };

    // ✅ Dispatch other actions
    dispatch(todosSlice.actions.addTodo(todo));

    // Sync with API
    const response = await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(todo),
    });

    return response.json();
  },
);
```

### ✅ Request Cancellation

```typescript
export const fetchUser = createAsyncThunk<User, string>(
  "users/fetchUser",
  async (userId, { signal }) => {
    // ✅ Pass AbortSignal to fetch
    const response = await fetch(`/api/users/${userId}`, {
      signal,
    });

    return response.json();
  },
);

// Usage in component:
const promise = dispatch(fetchUser("123"));

// Cancel if needed
promise.abort();
```

---

## Multiple Arguments

### ✅ Object Argument

```typescript
interface UpdateUserArgs {
  userId: string;
  name: string;
  email: string;
}

export const updateUser = createAsyncThunk<User, UpdateUserArgs>(
  "users/updateUser",
  async ({ userId, name, email }) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    return response.json();
  },
);

// Usage:
dispatch(
  updateUser({ userId: "123", name: "John", email: "john@example.com" }),
);
```

---

## Conditional Execution

### ✅ Prevent Duplicate Requests

```typescript
export const fetchUser = createAsyncThunk<User, string>(
  "users/fetchUser",
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  {
    condition: (userId, { getState }) => {
      const state = getState() as RootState;
      const { loading, data } = state.user;

      // ✅ Skip if already loading or data exists
      if (loading || data?.id === userId) {
        return false;
      }
    },
  },
);
```

---

## Optimistic Updates

### ✅ Update Before API Response

```typescript
const todosSlice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    todoAdded: (state, action: PayloadAction<Todo>) => {
      state.push(action.payload);
    },
    todoRemoved: (state, action: PayloadAction<string>) => {
      return state.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteTodo.rejected, (state, action) => {
      // ✅ Rollback on error
      if (action.meta.arg) {
        // Re-add the deleted todo
        const deletedTodo =
          action.meta.requestStatus === "pending"
            ? findDeletedTodo(action.meta.arg)
            : null;
        if (deletedTodo) {
          state.push(deletedTodo);
        }
      }
    });
  },
});

export const deleteTodo = createAsyncThunk<void, string>(
  "todos/deleteTodo",
  async (todoId, { dispatch }) => {
    // ✅ Optimistic: remove before API call
    dispatch(todosSlice.actions.todoRemoved(todoId));

    const response = await fetch(`/api/todos/${todoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete");
    }
  },
);
```

---

## Polling and Intervals

### ✅ Periodic Data Refresh

```typescript
export const startPolling = createAsyncThunk<void, number>(
  "data/startPolling",
  async (intervalMs, { dispatch, signal }) => {
    // ✅ Poll until aborted
    while (!signal.aborted) {
      await dispatch(fetchData());
      await delay(intervalMs);
    }
  },
);

// Helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Usage:
const pollingPromise = dispatch(startPolling(5000)); // Every 5s

// Stop polling:
pollingPromise.abort();
```

---

## Parallel Requests

### ✅ Multiple Async Thunks

```typescript
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchAll",
  async (_, { dispatch }) => {
    // ✅ Parallel execution
    const [users, posts, comments] = await Promise.all([
      dispatch(fetchUsers()).unwrap(),
      dispatch(fetchPosts()).unwrap(),
      dispatch(fetchComments()).unwrap(),
    ]);

    return { users, posts, comments };
  },
);
```

---

## Loading State Patterns

### ✅ Global Loading State

```typescript
interface AppState {
  loading: Record<string, boolean>;
}

const appSlice = createSlice({
  name: "app",
  initialState: {
    loading: {},
  } as AppState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state, action) => {
          state.loading[action.type.replace("/pending", "")] = true;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") ||
          action.type.endsWith("/rejected"),
        (state, action) => {
          const baseType = action.type.replace(/(\/fulfilled|\/rejected)$/, "");
          state.loading[baseType] = false;
        },
      );
  },
});
```

---

## Best Practices

1. **Type async thunks** - Use generics: `createAsyncThunk<ReturnType, ArgType, ThunkConfig>`
2. **Handle all states** - pending, fulfilled, rejected in extraReducers
3. **Use rejectWithValue** - Return custom error payloads for better error handling
4. **Cancel requests** - Pass `signal` to fetch for proper cancellation
5. **Prevent duplicates** - Use `condition` option to skip unnecessary requests
6. **Optimistic updates** - Update UI immediately, rollback on error
7. **Use unwrap()** - In components to handle promise results directly

---

## Edge Cases

**Race conditions:** Latest request wins. Use `condition` or request IDs to handle.

**Request IDs:** Available in `action.meta.requestId` for tracking specific requests.

**Aborting:** Check `signal.aborted` in async function to stop early.

**Timeout:** Implement custom timeout with `Promise.race()` and AbortController.

**Retry logic:** Wrap thunk in retry helper or use `condition` to check retry count.

---

## References

- [Redux Toolkit createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Async Logic and Data Fetching](https://redux.js.org/tutorials/essentials/part-5-async-logic)
