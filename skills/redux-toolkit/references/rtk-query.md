# RTK Query Guide

> Data fetching and caching with RTK Query, powerful server state management

## When to Read This

- Implementing data fetching with RTK Query
- Creating API slices with queries and mutations
- Managing cache invalidation with tags
- Optimistic updates for better UX
- Authentication and custom base queries

---

## createApi Setup

### ✅ Basic API Definition

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Post {
  id: number;
  title: string;
  content: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Post", "User"],
  endpoints: (builder) => ({
    // Endpoints defined here
  }),
});

// Export hooks
export const { useGetPostsQuery, useAddPostMutation } = api;
```

### ✅ Store Integration

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

---

## Queries (Read Operations)

### ✅ Basic Query

```typescript
getPosts: builder.query<Post[], void>({
  query: () => "/posts",
  providesTags: ["Post"],
});
```

### ✅ Query with Parameters

```typescript
getPostById: builder.query<Post, number>({
  query: (id) => `/posts/${id}`,
  providesTags: (result, error, id) => [{ type: "Post", id }],
});
```

### ✅ Transform Response

```typescript
getPosts: builder.query<Post[], void>({
  query: () => "/posts",
  transformResponse: (response: { data: Post[] }) => response.data,
  providesTags: ["Post"],
});
```

### ✅ Using Queries in Components

```typescript
function PostsList() {
  const { data, isLoading, error, refetch } = useGetPostsQuery();

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;

  return (
    <div>
      {data?.map(post => <PostItem key={post.id} post={post} />)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### ✅ Conditional Fetching

```typescript
// Skip query if id is undefined
const { data } = useGetPostByIdQuery(id, {
  skip: !id,
});
```

### ✅ Polling

```typescript
const { data } = useGetPostsQuery(undefined, {
  pollingInterval: 5000, // Poll every 5 seconds
});
```

---

## Mutations (Write Operations)

### ✅ Basic Mutation

```typescript
addPost: builder.mutation<Post, Partial<Post>>({
  query: (body) => ({
    url: "/posts",
    method: "POST",
    body,
  }),
  invalidatesTags: ["Post"],
});
```

### ✅ Update Mutation

```typescript
updatePost: builder.mutation<Post, { id: number; data: Partial<Post> }>({
  query: ({ id, data }) => ({
    url: `/posts/${id}`,
    method: "PATCH",
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
});
```

### ✅ Delete Mutation

```typescript
deletePost: builder.mutation<void, number>({
  query: (id) => ({
    url: `/posts/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: (result, error, id) => [{ type: "Post", id }],
});
```

### ✅ Using Mutations

```typescript
function AddPostForm() {
  const [addPost, { isLoading, error }] = useAddPostMutation();

  const handleSubmit = async (data: Partial<Post>) => {
    try {
      await addPost(data).unwrap();
      // Success
    } catch (err) {
      // Error handling
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Tag-Based Cache Invalidation

### ✅ Tag Types

```typescript
export const api = createApi({
  tagTypes: ["Post", "User", "Comment"],
  // ...
});
```

### ✅ Provide Tags (Queries)

```typescript
// Provide list-level tag
getPosts: builder.query<Post[], void>({
  query: () => "/posts",
  providesTags: ["Post"],
});

// Provide item-level tags + list tag
getPosts: builder.query<Post[], void>({
  query: () => "/posts",
  providesTags: (result) =>
    result
      ? [
          ...result.map(({ id }) => ({ type: "Post" as const, id })),
          { type: "Post", id: "LIST" },
        ]
      : [{ type: "Post", id: "LIST" }],
});
```

### ✅ Invalidate Tags (Mutations)

```typescript
// Invalidate all posts
addPost: builder.mutation({
  // ...
  invalidatesTags: ["Post"],
});

// Invalidate specific post
updatePost: builder.mutation({
  // ...
  invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
});

// Invalidate list only
addPost: builder.mutation({
  // ...
  invalidatesTags: [{ type: "Post", id: "LIST" }],
});
```

---

## Optimistic Updates

### ✅ Manual Cache Update

```typescript
updatePost: builder.mutation<Post, { id: number; data: Partial<Post> }>({
  query: ({ id, data }) => ({
    url: `/posts/${id}`,
    method: "PATCH",
    body: data,
  }),
  async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
    // Optimistic update
    const patchResult = dispatch(
      api.util.updateQueryData("getPosts", undefined, (draft) => {
        const post = draft.find((p) => p.id === id);
        if (post) {
          Object.assign(post, data);
        }
      }),
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo(); // Rollback on error
    }
  },
});
```

---

## Authentication

### ✅ Prepare Headers

```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
```

### ✅ Retry on Token Refresh

```typescript
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

    if (refreshResult.data) {
      // Store new token
      api.dispatch(setToken(refreshResult.data));
      // Retry original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};
```

---

## Advanced Patterns

### ✅ Prefetching

```typescript
// Prefetch on hover
<Link
  onMouseEnter={() => dispatch(api.util.prefetch('getPostById', postId))}
  to={`/posts/${postId}`}
>
  View Post
</Link>
```

### ✅ Manual Cache Subscription

```typescript
useEffect(() => {
  const promise = dispatch(
    api.endpoints.getPosts.initiate(undefined, {
      subscribe: true,
      forceRefetch: true,
    }),
  );

  return () => {
    promise.unsubscribe();
  };
}, [dispatch]);
```

### ✅ SSR / SSG

```typescript
// Next.js getServerSideProps
export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    store.dispatch(api.endpoints.getPosts.initiate());

    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));

    return {
      props: {},
    };
  },
);
```

---

## Error Handling

### ✅ Custom Error Handling

```typescript
const { data, error } = useGetPostsQuery();

if (error) {
  if ('status' in error) {
    // FetchBaseQueryError
    const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
    return <div>Error: {errMsg}</div>;
  } else {
    // SerializedError
    return <div>Error: {error.message}</div>;
  }
}
```

---

## References

- [RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query API](https://redux-toolkit.js.org/rtk-query/api/createApi)
