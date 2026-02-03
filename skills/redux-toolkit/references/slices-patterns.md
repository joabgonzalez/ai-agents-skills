# Redux Toolkit Slices Patterns

> createSlice, reducers, extraReducers, and immer best practices

## When to Read This

- Creating new Redux slices
- Defining actions and reducers
- Handling external actions with extraReducers
- Using prepare callbacks for action payloads
- Organizing reducer logic

---

## Basic Slice Creation

### ✅ Simple Slice with Reducers

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CounterState {
  value: number;
  status: "idle" | "loading";
}

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    status: "idle",
  } as CounterState,
  reducers: {
    increment: (state) => {
      // ✅ Immer allows "mutations"
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions;
export default counterSlice.reducer;
```

---

## Immer Patterns

### ✅ Direct "Mutation" (Immer)

```typescript
reducers: {
  addTodo: (state, action: PayloadAction<Todo>) => {
    // ✅ CORRECT: Push directly (immer makes it immutable)
    state.todos.push(action.payload);
  },

  toggleTodo: (state, action: PayloadAction<string>) => {
    // ✅ CORRECT: Find and mutate
    const todo = state.todos.find(t => t.id === action.payload);
    if (todo) {
      todo.completed = !todo.completed;
    }
  },
}
```

### ❌ Mixed Patterns (Don't Mix)

```typescript
reducers: {
  addTodo: (state, action: PayloadAction<Todo>) => {
    // ❌ WRONG: Don't mix mutation with return
    state.todos.push(action.payload);
    return state; // Don't return when mutating!
  },

  updateTodo: (state, action) => {
    // ✅ CORRECT: Return new state
    return {
      ...state,
      todos: state.todos.map(t =>
        t.id === action.payload.id ? action.payload : t
      ),
    };
  },
}
```

**Rule:** Either mutate the draft state OR return new state, never both.

---

## Prepare Callbacks

### ✅ Custom Action Payloads

```typescript
const todosSlice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.push(action.payload);
      },
      prepare: (text: string) => {
        // ✅ Generate ID and timestamp in prepare
        return {
          payload: {
            id: nanoid(),
            text,
            completed: false,
            createdAt: Date.now(),
          },
        };
      },
    },
  },
});

// Usage: dispatch(addTodo('Buy milk'))
```

### ✅ Multiple Arguments

```typescript
reducers: {
  updateUser: {
    reducer: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      const user = state.users[action.payload.id];
      if (user) {
        user.name = action.payload.name;
        user.email = action.payload.email;
      }
    },
    prepare: (id: string, name: string, email: string) => {
      return {
        payload: { id, name, email },
      };
    },
  },
}

// Usage: dispatch(updateUser('123', 'John', 'john@example.com'))
```

---

## extraReducers

### ✅ Handling External Actions

```typescript
import { createSlice } from "@reduxjs/toolkit";
import { fetchUser } from "./userThunks"; // Async thunk

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.data = null;
    },
  },
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
        state.error = action.error.message || "Failed to fetch";
      });
  },
});
```

### ✅ Handling Multiple Thunks

```typescript
extraReducers: (builder) => {
  builder
    // Pattern: All pending cases
    .addMatcher(
      (action) => action.type.endsWith("/pending"),
      (state) => {
        state.loading = true;
      },
    )
    // Pattern: All fulfilled cases
    .addMatcher(
      (action) => action.type.endsWith("/fulfilled"),
      (state) => {
        state.loading = false;
      },
    )
    // Pattern: All rejected cases
    .addMatcher(
      (action) => action.type.endsWith("/rejected"),
      (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      },
    );
};
```

---

## Nested State Updates

### ✅ Deep Updates with Immer

```typescript
interface AppState {
  users: Record<string, User>;
  posts: Record<string, Post>;
}

const appSlice = createSlice({
  name: "app",
  initialState: {
    users: {},
    posts: {},
  } as AppState,
  reducers: {
    addComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>,
    ) => {
      const { postId, comment } = action.payload;

      // ✅ CORRECT: Direct nested mutation
      if (!state.posts[postId].comments) {
        state.posts[postId].comments = [];
      }
      state.posts[postId].comments.push(comment);
    },

    updateUserProfile: (
      state,
      action: PayloadAction<{ userId: string; profile: Profile }>,
    ) => {
      // ✅ CORRECT: Deep property update
      state.users[action.payload.userId].profile = action.payload.profile;
    },
  },
});
```

---

## Conditional Logic in Reducers

### ✅ Safe State Updates

```typescript
reducers: {
  removeItem: (state, action: PayloadAction<string>) => {
    // ✅ CORRECT: Check existence before mutating
    const index = state.items.findIndex(item => item.id === action.payload);
    if (index !== -1) {
      state.items.splice(index, 1);
    }
  },

  incrementIfPositive: (state, action: PayloadAction<number>) => {
    // ✅ CORRECT: Conditional mutation
    if (action.payload > 0) {
      state.count += action.payload;
    }
  },
}
```

---

## Resetting State

### ✅ Reset to Initial State

```typescript
const initialState: AppState = {
  data: null,
  loading: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    reset: () => initialState, // ✅ Return initial state

    // Or:
    resetData: (state) => {
      // ✅ Reassign properties
      state.data = null;
      state.loading = false;
    },
  },
});
```

---

## Slice Organization

### ✅ File Structure

```
features/
  counter/
    counterSlice.ts    // Slice definition
    counterThunks.ts   // Async thunks
    counterSelectors.ts // Memoized selectors
    Counter.tsx        // Component
```

### ✅ Export Pattern

```typescript
// counterSlice.ts
const counterSlice = createSlice({
  /* ... */
});

// Export actions
export const { increment, decrement } = counterSlice.actions;

// Export reducer
export default counterSlice.reducer;

// Export selectors
export const selectCount = (state: RootState) => state.counter.value;
```

---

## Best Practices

1. **Use immer mutations** - Direct mutations in reducers (immer handles immutability)
2. **Don't mix return + mutation** - Either mutate draft state OR return new state
3. **Use prepare callbacks** - Generate IDs, timestamps in prepare, not reducers
4. **Keep reducers pure** - No side effects (API calls, random values) in reducers
5. **Use extraReducers** - Handle async thunk states (pending/fulfilled/rejected)
6. **Type action payloads** - Use `PayloadAction<T>` for type safety
7. **Organize by feature** - Slice + thunks + selectors in same directory

---

## Edge Cases

**Empty arrays/objects:** Immer handles empty initializations. Safe to push to empty arrays.

**Undefined checks:** Always check existence before updating nested properties.

**Reducer order:** Reducers execute in definition order. Later reducers see earlier mutations.

**Action naming:** Use present tense verbs (increment, not incremented). RTK generates types automatically.

**State reset:** Return initialState or reassign all properties. Don't use `state = initialState` (won't work).

---

## References

- [Redux Toolkit createSlice](https://redux-toolkit.js.org/api/createSlice)
- [Immer Patterns](https://immerjs.github.io/immer/patterns/)
