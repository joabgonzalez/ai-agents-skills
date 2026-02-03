# Redux Toolkit References

> Detailed guides for slices, async operations, selectors, normalization, and TypeScript integration

## Overview

This directory contains detailed guides for Redux Toolkit state management patterns. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives into slice creation, async thunks, memoized selectors, state normalization, and TypeScript best practices.

---

## Quick Navigation

### 🏗️ Core Patterns

| Reference File                                         | Topics Covered                                                 | When to Read                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------- |
| [slices-patterns.md](slices-patterns.md)               | createSlice, reducers, extraReducers, immer usage              | Creating slices with actions and reducers                      |
| [async-patterns.md](async-patterns.md)                 | createAsyncThunk, loading states, error handling, cancellation | Implementing async operations (API calls, side effects)        |
| [selectors.md](selectors.md)                           | createSelector, reselect, memoization, selector composition    | Optimizing derived state and preventing unnecessary re-renders |
| [normalization.md](normalization.md)                   | createEntityAdapter, normalized state, CRUD operations         | Managing relational data (users, posts, comments)              |
| [typescript-integration.md](typescript-integration.md) | Typed hooks, RootState, AppDispatch, slice types               | Setting up type-safe Redux with TypeScript                     |
| [rtk-query.md](rtk-query.md)                           | Data fetching, caching, API slices, mutations, invalidation    | Implementing server state with RTK Query                       |

---

## Reading Strategy

### For New Projects (Setup)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [typescript-integration.md](typescript-integration.md) for store setup and typed hooks
3. **MUST read**: [slices-patterns.md](slices-patterns.md) for first slice creation
4. CHECK: [async-patterns.md](async-patterns.md) if calling APIs

### For Existing Projects (Adding Features)

1. **Adding simple state?** → Read [slices-patterns.md](slices-patterns.md)
2. **Adding API calls?** → Read [async-patterns.md](async-patterns.md)
3. **Performance issues with selectors?** → Read [selectors.md](selectors.md)
4. **Managing relational data?** → Read [normalization.md](normalization.md)

### For Optimization

1. **Re-renders from selectors?** → Read [selectors.md](selectors.md) for memoization
2. **Complex nested state?** → Read [normalization.md](normalization.md) for flattening
3. **Race conditions in async?** → Read [async-patterns.md](async-patterns.md) for cancellation

---

## File Descriptions

### [slices-patterns.md](slices-patterns.md)

**createSlice patterns and reducer best practices**

- createSlice API with immer
- Reducer patterns (increment, toggle, add, remove)
- extraReducers for handling external actions
- prepare callbacks for action payloads
- Case reducers organization

### [async-patterns.md](async-patterns.md)

**Async operations with createAsyncThunk**

- createAsyncThunk for API calls
- pending/fulfilled/rejected handling
- Error handling patterns
- Request cancellation
- Optimistic updates
- Loading state management

### [selectors.md](selectors.md)

**Memoized selectors with reselect**

- createSelector for derived state
- Selector composition
- Input selectors vs output selectors
- Re-computation prevention
- TypeScript typing for selectors

### [normalization.md](normalization.md)

**Normalized state with createEntityAdapter**

- createEntityAdapter setup
- CRUD operations (add, update, remove)
- Sorting and filtering entities
- Selecting single vs multiple entities
- Relationships between entities

### [typescript-integration.md](typescript-integration.md)

**Type-safe Redux with TypeScript**

- Store setup with proper typing
- RootState and AppDispatch types
- Typed useSelector and useDispatch hooks
- Slice state typing
- Action payload typing
- Thunk typing

### [rtk-query.md](rtk-query.md)

**Data fetching and caching with RTK Query**

- createApi for API endpoints
- Queries (read operations) and mutations (write operations)
- Tag-based cache invalidation
- Optimistic updates
- Authentication with prepareHeaders
- Error handling and retries

---

## Common Patterns Summary

- **Simple state**: createSlice with reducers
- **API calls**: createAsyncThunk with extraReducers
- **Server state/caching**: RTK Query with createApi
- **Derived state**: createSelector for memoization
- **Relational data**: createEntityAdapter for normalization
- **Type safety**: Pre-typed hooks from store configuration
