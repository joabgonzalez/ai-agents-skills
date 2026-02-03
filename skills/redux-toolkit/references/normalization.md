# Redux Toolkit Normalization

> createEntityAdapter, normalized state, and CRUD operations

## When to Read This

- Managing collections of items (users, posts, products)
- Handling relational data (posts with authors, comments)
- Optimizing lookup performance by ID
- Implementing CRUD operations
- Avoiding nested/duplicated data

---

## Why Normalize?

### ❌ Nested State (Problems)

```typescript
interface AppState {
  posts: {
    id: string;
    title: string;
    author: {
      id: string;
      name: string;
      posts: Post[]; // Circular!
    };
    comments: Comment[];
  }[];
}

// Problems:
// - Duplicated author data across posts
// - Hard to update author (need to find all posts)
// - Circular references
// - Slow lookups (must iterate array)
```

### ✅ Normalized State (Solution)

```typescript
interface AppState {
  users: {
    ids: string[];
    entities: Record<string, User>;
  };
  posts: {
    ids: string[];
    entities: Record<string, Post>;
  };
  comments: {
    ids: string[];
    entities: Record<string, Comment>;
  };
}

// Benefits:
// - Single source of truth for each entity
// - Fast O(1) lookup by ID
// - Easy updates (one place)
// - No duplication
```

---

## createEntityAdapter

### ✅ Basic Setup

```typescript
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// ✅ Create adapter
const todosAdapter = createEntityAdapter<Todo>({
  // Optional: custom ID selector
  selectId: (todo) => todo.id,

  // Optional: sorting
  sortComparer: (a, b) => a.text.localeCompare(b.text),
});

// ✅ Use adapter's initial state
const todosSlice = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState({
    // Additional state
    loading: false,
    error: null,
  }),
  reducers: {
    // ✅ Use adapter's CRUD methods
    todoAdded: todosAdapter.addOne,
    todosReceived: todosAdapter.setAll,
    todoUpdated: todosAdapter.updateOne,
    todoRemoved: todosAdapter.removeOne,
  },
});
```

---

## CRUD Operations

### ✅ Adding Entities

```typescript
reducers: {
  // Add single
  addTodo: todosAdapter.addOne,

  // Add multiple
  addTodos: todosAdapter.addMany,

  // Set all (replaces existing)
  setTodos: todosAdapter.setAll,

  // Upsert (add or update)
  upsertTodo: todosAdapter.upsertOne,
  upsertTodos: todosAdapter.upsertMany,
}

// Usage:
dispatch(addTodo({ id: '1', text: 'Buy milk', completed: false }));
dispatch(addTodos([todo1, todo2, todo3]));
dispatch(setTodos(apiResponse)); // Replace all
dispatch(upsertTodo(updatedTodo)); // Add if new, update if exists
```

### ✅ Updating Entities

```typescript
reducers: {
  // Update single
  updateTodo: todosAdapter.updateOne,

  // Update multiple
  updateTodos: todosAdapter.updateMany,
}

// Usage:
dispatch(updateTodo({
  id: '1',
  changes: { completed: true },
}));

dispatch(updateTodos([
  { id: '1', changes: { completed: true } },
  { id: '2', changes: { text: 'Updated text' } },
]));
```

### ✅ Removing Entities

```typescript
reducers: {
  // Remove single
  removeTodo: todosAdapter.removeOne,

  // Remove multiple
  removeTodos: todosAdapter.removeMany,

  // Remove all
  removeAllTodos: todosAdapter.removeAll,
}

// Usage:
dispatch(removeTodo('1'));
dispatch(removeTodos(['1', '2', '3']));
dispatch(removeAllTodos());
```

---

## Selectors

### ✅ Generated Selectors

```typescript
// ✅ Generate selectors for the slice
const todosSelectors = todosAdapter.getSelectors<RootState>(
  (state) => state.todos,
);

// Available selectors:
export const {
  selectAll, // Returns all entities as array
  selectById, // Returns entity by ID
  selectIds, // Returns all IDs as array
  selectEntities, // Returns entities object
  selectTotal, // Returns count of entities
} = todosSelectors;

// Usage:
const allTodos = useAppSelector(selectAll);
const todo = useAppSelector((state) => selectById(state, "1"));
const todoIds = useAppSelector(selectIds);
const todosCount = useAppSelector(selectTotal);
```

### ✅ Custom Selectors with Normalization

```typescript
// Memoized selector for filtered todos
export const selectCompletedTodos = createSelector(
  [todosSelectors.selectAll],
  (todos) => todos.filter((t) => t.completed),
);

// Select by multiple IDs
export const selectTodosByIds = createSelector(
  [todosSelectors.selectEntities, (_: RootState, ids: string[]) => ids],
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean),
);
```

---

## Sorting

### ✅ Sort Comparer

```typescript
const todosAdapter = createEntityAdapter<Todo>({
  sortComparer: (a, b) => {
    // ✅ Sort by completed, then by text
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Incomplete first
    }
    return a.text.localeCompare(b.text);
  },
});

// Updates automatically maintain sorted order
```

### ✅ Dynamic Sorting

```typescript
// Store unsorted, sort in selector
const todosAdapter = createEntityAdapter<Todo>({
  sortComparer: false, // No sorting in adapter
});

export const selectSortedTodos = createSelector(
  [selectAll, (state: RootState) => state.todos.sortBy],
  (todos, sortBy) => {
    return [...todos].sort((a, b) => {
      switch (sortBy) {
        case "text":
          return a.text.localeCompare(b.text);
        case "date":
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });
  },
);
```

---

## Relationships

### ✅ One-to-Many (Posts → Comments)

```typescript
// Posts with comment IDs
interface Post {
  id: string;
  title: string;
  commentIds: string[];
}

// Comments adapter
const commentsAdapter = createEntityAdapter<Comment>();
const postsAdapter = createEntityAdapter<Post>();

// Selector: Post with populated comments
export const selectPostWithComments = createSelector(
  [postsSelectors.selectById, commentsSelectors.selectEntities],
  (post, commentsById) => {
    if (!post) return null;

    return {
      ...post,
      comments: post.commentIds.map((id) => commentsById[id]).filter(Boolean),
    };
  },
);
```

### ✅ Many-to-One (Posts → Author)

```typescript
interface Post {
  id: string;
  title: string;
  authorId: string;
}

export const selectPostWithAuthor = createSelector(
  [postsSelectors.selectById, usersSelectors.selectEntities],
  (post, usersById) => {
    if (!post) return null;

    return {
      ...post,
      author: usersById[post.authorId],
    };
  },
);

// Select all posts by author
export const selectPostsByAuthor = createSelector(
  [postsSelectors.selectAll, (_: RootState, authorId: string) => authorId],
  (posts, authorId) => posts.filter((p) => p.authorId === authorId),
);
```

---

## With Async Thunks

### ✅ Fetching and Normalizing

```typescript
export const fetchTodos = createAsyncThunk("todos/fetchAll", async () => {
  const response = await fetch("/api/todos");
  return response.json();
});

const todosSlice = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState({
    loading: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ setAll replaces all entities
        todosAdapter.setAll(state, action.payload);
      });
  },
});
```

### ✅ Optimistic Updates

```typescript
export const deleteTodo = createAsyncThunk(
  "todos/delete",
  async (todoId: string, { dispatch, rejectWithValue }) => {
    // ✅ Optimistic: remove immediately
    dispatch(todosSlice.actions.removeTodo(todoId));

    try {
      await fetch(`/api/todos/${todoId}`, { method: "DELETE" });
    } catch (error) {
      // ✅ Rollback on error (re-fetch or restore from cache)
      dispatch(fetchTodos());
      return rejectWithValue("Failed to delete");
    }
  },
);
```

---

## Advanced Patterns

### ✅ Pagination

```typescript
interface PaginatedState {
  ids: string[];
  entities: Record<string, Todo>;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

const todosSlice = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState<PaginatedState>({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTodosPage.fulfilled, (state, action) => {
      const { todos, page, totalPages } = action.payload;

      // ✅ Add new page (don't replace)
      todosAdapter.addMany(state, todos);
      state.currentPage = page;
      state.totalPages = totalPages;
      state.hasMore = page < totalPages;
    });
  },
});
```

### ✅ Filtering with Metadata

```typescript
interface TodoState {
  ids: string[];
  entities: Record<string, Todo>;
  filteredIds: string[]; // Separate filtered view
}

reducers: {
  filterTodos: (state, action: PayloadAction<'all' | 'completed' | 'active'>) => {
    const filter = action.payload;
    const allTodos = Object.values(state.entities);

    state.filteredIds = allTodos
      .filter(todo => {
        if (filter === 'completed') return todo.completed;
        if (filter === 'active') return !todo.completed;
        return true;
      })
      .map(todo => todo.id);
  },
}
```

---

## Best Practices

1. **Use for collections** - EntityAdapter is ideal for arrays of entities with IDs
2. **Normalize relationships** - Store IDs, populate in selectors
3. **Use upsert** - For adding or updating (idempotent operations)
4. **Sort in adapter** - Use sortComparer for consistent ordering
5. **Generate selectors** - Use `getSelectors()` for standard operations
6. **Single source of truth** - Each entity type in one adapter
7. **Type IDs consistently** - Use string or number, be consistent

---

## Edge Cases

**Missing IDs:** Entities without `id` field need `selectId` function.

**Sorting updates:** When updating, sort order recalculates automatically if `sortComparer` is set.

**Removing non-existent:** removeOne/removeMany silently ignore missing IDs.

**Initial state:** `getInitialState()` accepts additional state properties (loading, error, etc.).

**Custom ID selector:** Use when entity uses different property name (`_id`, `uuid`, etc.).

---

## References

- [Redux Toolkit createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter)
- [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
