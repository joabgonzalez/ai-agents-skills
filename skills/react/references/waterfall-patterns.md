# Data Fetching Architecture

> Request waterfall diagnosis, parallel fetching strategies, and SWR/TanStack Query patterns

## Core Patterns

- Waterfall Diagnosis
- Parallel Fetching
- `use()` Hook (React 19)
- SWR Patterns
- TanStack Query Patterns

---

## Waterfall Diagnosis

### Identifying Request Waterfalls

A waterfall occurs when requests are sequential when they could be parallel: each fetch waits for the previous one to complete.

```
❌ WATERFALL:
Request A ──────►
                 Request B ──────►
                                  Request C ──────►
Total: A + B + C duration

✅ PARALLEL:
Request A ──────►
Request B ──────►   All complete in max(A, B, C) duration
Request C ──────►
```

**Detect in DevTools:** Chrome → Network tab → filter by Fetch/XHR → look for sequential requests that don't overlap.

### Common Waterfall Patterns

```typescript
// ❌ WRONG: Sequential awaits = waterfall
async function UserDashboard({ userId }: { userId: string }) {
  const user    = await fetchUser(userId);     // Wait for user
  const posts   = await fetchPosts(userId);    // Then wait for posts
  const follows = await fetchFollows(userId);  // Then wait for follows
  // Total: 3× request time
}

// ✅ CORRECT: Parallel with Promise.all
async function UserDashboard({ userId }: { userId: string }) {
  const [user, posts, follows] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFollows(userId),
  ]);
  // Total: max(user, posts, follows) request time
}
```

### Component-Level Waterfall (Fetch-on-Render)

```typescript
// ❌ WRONG: Child cannot fetch until parent renders
function Parent() {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser().then(setUser); }, []);
  if (!user) return <Spinner />;
  return <Child userId={user.id} />; // Child starts fetching only after parent finishes
}

// ✅ CORRECT: Fetch user and child data at the same time (hoisted)
function Parent() {
  const userPromise = fetchUser();        // Start immediately
  const postsPromise = fetchPosts();      // Also start immediately
  return (
    <Suspense fallback={<Spinner />}>
      <Child userPromise={userPromise} postsPromise={postsPromise} />
    </Suspense>
  );
}
```

---

## Parallel Fetching

### Promise.allSettled for Independent Requests

```typescript
// ✅ Use allSettled when you want all results even if some fail
async function Dashboard() {
  const results = await Promise.allSettled([
    fetchUser(),
    fetchNotifications(),
    fetchAnnouncements(),
  ]);

  const user = results[0].status === 'fulfilled' ? results[0].value : null;
  const notifications = results[1].status === 'fulfilled' ? results[1].value : [];
  const announcements = results[2].status === 'fulfilled' ? results[2].value : [];
}
```

### Parallel Suspense Boundaries

```typescript
// ✅ Each Suspense boundary fetches independently — no waterfall
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />          {/* Fetches user data */}
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed />         {/* Fetches feed data in parallel */}
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel />           {/* Fetches stats data in parallel */}
      </Suspense>
    </div>
  );
}

// ❌ WRONG: Single boundary serializes all fetches
function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile />    {/* Waits */}
      <ActivityFeed />   {/* Waits for UserProfile */}
      <StatsPanel />     {/* Waits for ActivityFeed */}
    </Suspense>
  );
}
```

---

## `use()` Hook (React 19)

The `use()` hook suspends a client component while a Promise resolves — enables parallel data fetching in client components without useEffect.

```typescript
'use client';
import { use } from 'react';

// ✅ Start fetching outside the component — not inside
const userPromise = fetchUser();

function UserCard() {
  const user = use(userPromise); // Suspends until resolved; no useEffect needed
  return <div>{user.name}</div>;
}

// ✅ Pass promises as props (React 19 pattern)
function Parent() {
  const userPromise = fetchUser();     // Starts here
  const postsPromise = fetchPosts();   // Starts here — parallel with user
  return (
    <Suspense fallback={<Spinner />}>
      <UserCard userPromise={userPromise} postsPromise={postsPromise} />
    </Suspense>
  );
}

function UserCard({
  userPromise,
  postsPromise,
}: {
  userPromise: Promise<User>;
  postsPromise: Promise<Post[]>;
}) {
  const user = use(userPromise);    // Both resolve in parallel
  const posts = use(postsPromise);  // (not sequential)
  return <div>{user.name}: {posts.length} posts</div>;
}
```

**Key rule:** Create the Promise _outside_ the component or in a parent. Creating it _inside_ the component recreates the Promise on every render, losing the parallel advantage.

---

## SWR Patterns

SWR (stale-while-revalidate) provides caching, deduplication, and background refresh.

### Basic Fetching

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function UserProfile({ id }: { id: string }) {
  const { data: user, error, isLoading } = useSWR(`/api/users/${id}`, fetcher);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error.message} />;
  return <div>{user.name}</div>;
}
```

### Parallel Requests with SWR

```typescript
function Dashboard({ userId }: { userId: string }) {
  // ✅ Both hooks run in parallel — SWR deduplicates identical keys
  const { data: user }  = useSWR(`/api/users/${userId}`, fetcher);
  const { data: posts } = useSWR(`/api/users/${userId}/posts`, fetcher);
  const { data: stats } = useSWR(`/api/users/${userId}/stats`, fetcher);

  return (/* render */);
}
```

### Optimistic Updates

```typescript
import useSWR, { mutate } from 'swr';

function LikeButton({ postId }: { postId: string }) {
  const { data: post } = useSWR(`/api/posts/${postId}`, fetcher);

  async function handleLike() {
    // ✅ Optimistic update: update cache immediately, revalidate after
    await mutate(
      `/api/posts/${postId}`,
      { ...post, likes: post.likes + 1 },  // optimistic data
      false                                  // don't revalidate yet
    );

    try {
      await likePost(postId);
      mutate(`/api/posts/${postId}`); // revalidate after success
    } catch {
      mutate(`/api/posts/${postId}`); // revert on error (revalidate)
    }
  }

  return <button onClick={handleLike}>♥ {post?.likes}</button>;
}
```

### SWR Configuration

```typescript
import { SWRConfig } from 'swr';

// ✅ Global config at app root
function App({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(res => res.json()),
        revalidateOnFocus: false,     // don't refetch on window focus
        dedupingInterval: 5000,        // deduplicate same-key requests within 5s
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

---

## TanStack Query Patterns

TanStack Query (React Query) provides server state management with caching, background sync, and mutation handling.

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';

function UserProfile({ id }: { id: string }) {
  const { data: user, isPending, error } = useQuery({
    queryKey: ['user', id],        // cache key — unique per user id
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,     // consider data fresh for 5 minutes
  });

  if (isPending) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <div>{user.name}</div>;
}
```

### Parallel Queries

```typescript
import { useQueries } from '@tanstack/react-query';

function Dashboard({ userId }: { userId: string }) {
  // ✅ useQueries runs all in parallel
  const results = useQueries({
    queries: [
      { queryKey: ['user', userId], queryFn: () => fetchUser(userId) },
      { queryKey: ['posts', userId], queryFn: () => fetchPosts(userId) },
      { queryKey: ['stats', userId], queryFn: () => fetchStats(userId) },
    ],
  });

  const [userResult, postsResult, statsResult] = results;
  return (/* render */);
}
```

### Mutations with Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function LikeButton({ postId }: { postId: string }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => likePost(postId),

    // ✅ Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previous = queryClient.getQueryData(['post', postId]);
      queryClient.setQueryData(['post', postId], (old: Post) => ({
        ...old,
        likes: old.likes + 1,
      }));
      return { previous };
    },

    // Revert on error
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['post', postId], context?.previous);
    },

    // Always revalidate after
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  return <button onClick={() => likeMutation.mutate()}>Like</button>;
}
```

### Prefetching

```typescript
// ✅ Prefetch on hover for instant navigation feel
function PostLink({ postId }: { postId: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/posts/${postId}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['post', postId],
          queryFn: () => fetchPost(postId),
        });
      }}
    >
      Read more
    </Link>
  );
}
```

---

## Common Pitfalls

**Creating Promises inside components:** `const data = use(fetch('/api'))` inside a component recreates the Promise on every render. Always create Promises outside the component tree or in parent components.

**`useEffect` for data fetching (if using SWR/Query):** `useEffect` + `useState` for fetching creates race conditions, no deduplication, and no caching. Use SWR or TanStack Query instead for client-side fetching.

**Fetching in every component independently:** Two sibling components fetching `/api/users/1` simultaneously makes two requests. SWR and TanStack Query deduplicate requests with the same key automatically.

**Not setting `staleTime`:** Default `staleTime: 0` in TanStack Query means every component mount triggers a background refetch. Set `staleTime` based on how often data changes (e.g., 5 minutes for user profile).

---

## Related Topics

- [server-features.md](server-features.md) — RSC parallel fetching and Suspense streaming (server-side)
- [performance.md](performance.md) — useMemo, useCallback, component re-render optimization
- [use-effect-patterns.md](use-effect-patterns.md) — When useEffect is appropriate for data fetching
