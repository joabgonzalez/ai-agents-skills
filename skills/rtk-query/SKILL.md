---
name: rtk-query
description: RTK Query for data fetching and caching in Redux applications. API endpoints, queries, mutations, cache invalidation. Trigger: When implementing data fetching with RTK Query, creating API slices, or managing server state cache.
skills:
  - redux-toolkit
  - typescript
dependencies:
  "@reduxjs/toolkit": ">=2.0.0 <3.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# RTK Query Skill

## Overview

Data fetching and caching with RTK Query, Redux Toolkit's powerful data fetching solution.

## Objective

Enable developers to implement efficient API communication with automatic caching, loading states, and error handling.

---

## When to Use

Use this skill when:

- Fetching data from REST APIs in Redux applications
- Implementing automatic caching and invalidation
- Managing server state separately from client state
- Using optimistic updates for better UX
- Polling or streaming data

Don't use this skill for:

- GraphQL APIs (consider RTK Query with custom baseQuery)
- Simple fetch without caching (use plain fetch or axios)
- Non-Redux applications

---

## Critical Patterns

### ✅ REQUIRED: Use createApi with baseQuery

```typescript
// ✅ CORRECT: RTK Query API definition
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    /* ... */
  }),
});

// ❌ WRONG: Manual fetch with Redux Toolkit
const fetchData = createAsyncThunk("data/fetch", async () => {
  return fetch("/api/data").then((res) => res.json());
});
```

### ✅ REQUIRED: Use Tag-Based Invalidation

```typescript
// ✅ CORRECT: Tags for cache invalidation
export const api = createApi({
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    addPost: builder.mutation({
      query: (body) => ({ url: "/posts", method: "POST", body }),
      invalidatesTags: ["Post"], // Refetches getPosts
    }),
  }),
});
```

### ✅ REQUIRED: Use Generated Hooks

```typescript
// ✅ CORRECT: Use generated hooks
const { data, isLoading, error } = useGetPostsQuery();
const [addPost, { isLoading: isAdding }] = useAddPostMutation();

// ❌ WRONG: Manual dispatch
const dispatch = useDispatch();
dispatch(api.endpoints.getPosts.initiate());
```

---

## Conventions

Refer to redux-toolkit for:

- Store configuration
- State patterns

### RTK Query Specific

- Use createApi for API definitions
- Implement typed endpoints
- Leverage automatic cache invalidation
- Use generated hooks in components
- Handle optimistic updates

---

## Decision Tree

**Read operation?** → Use `builder.query()`, provides data caching.

**Write operation?** → Use `builder.mutation()`, invalidates cache tags.

**Conditional fetching?** → Pass `skip` option to hook: `useGetDataQuery(id, { skip: !id })`.

**Polling needed?** → Use `pollingInterval` option in hook.

**Optimistic update?** → Use `onQueryStarted` in mutation to update cache immediately.

**Transform response?** → Use `transformResponse` in endpoint definition.

**Authentication?** → Add `prepareHeaders` to baseQuery for auth tokens.

**Multiple base URLs?** → Create multiple API slices with different baseQuery configs.

---

## Example

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Post {
  id: number;
  title: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = api;
```

---

## Edge Cases

**Manual cache updates:** Use `api.util.updateQueryData` for fine-grained cache control.

**Prefetching:** Use `dispatch(api.util.prefetch('endpoint', arg))` to load data before needed.

**SSR:** Use `getServerSideProps` with `dispatch(api.endpoints.endpoint.initiate()).unwrap()`.

**Streaming updates:** Use `onCacheEntryAdded` for WebSocket or EventSource integration.

**Error retry:** Configure `retry` option in endpoint or baseQuery for automatic retries.

---

## References

- https://redux-toolkit.js.org/rtk-query/overview
