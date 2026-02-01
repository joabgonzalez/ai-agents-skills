---
name: rtk-query
description: RTK Query for data fetching and caching in Redux applications.
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

## References

- https://redux-toolkit.js.org/rtk-query/overview
