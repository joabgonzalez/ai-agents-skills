---
name: graphql
description: "GraphQL schema design, resolver patterns, and client queries. Trigger: When building GraphQL APIs, writing schemas, resolvers, or client queries."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# GraphQL

Patterns for schema design, resolver implementation, N+1 prevention, and client-side queries. Applies to Apollo Server, Pothos, graphql-yoga, and Apollo Client.

## When to Use

- Designing a GraphQL schema
- Implementing resolvers on the server
- Writing queries, mutations, or fragments on the client
- Diagnosing N+1 query problems or over-fetching

Don't use for:

- REST API design (use express or hono)
- tRPC (type-safe RPC, different paradigm)
- Database query optimization (use relevant ORM skill)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: DataLoader for N+1 Prevention

Every resolver that fetches by a foreign key must use DataLoader. Without it, each parent record triggers a separate DB query.

```ts
// ❌ WRONG — 1 query per user (N+1)
const resolvers = {
  Post: {
    author: (post) => db.user.findUnique({ where: { id: post.authorId } }),
  },
};

// ✅ CORRECT — batches all authorIds into one query per request
import DataLoader from 'dataloader';
const userLoader = new DataLoader(async (ids: readonly string[]) => {
  const users = await db.user.findMany({ where: { id: { in: [...ids] } } });
  return ids.map((id) => users.find((u) => u.id === id) ?? null);
});

const resolvers = {
  Post: { author: (post) => userLoader.load(post.authorId) },
};
```

### ✅ REQUIRED [CRITICAL]: Schema-First or Code-First — Pick One

Mixing SDL strings with programmatic schema construction produces unmaintainable schemas.

```ts
// ✅ CORRECT — schema-first (SDL with graphql-tag or .graphql files)
const typeDefs = gql`
  type User { id: ID! name: String! posts: [Post!]! }
  type Post { id: ID! title: String! author: User! }
  type Query { user(id: ID!): User post(id: ID!): Post }
`;

// ✅ CORRECT — code-first (Pothos or NestJS GraphQL decorators — consistent throughout)
// ❌ WRONG — SDL strings for some types, programmatic for others in same project
```

### ✅ REQUIRED: Nullable vs Non-Null Discipline

`!` (non-null) means the API contract guarantees a value. A null where `!` was declared crashes the client.

```graphql
# ❌ WRONG — over-asserting non-null; any DB miss crashes the query tree
type Post {
  author: User!   # what if user was deleted?
}

# ✅ CORRECT — nullable for optional or potentially-missing relations
type Post {
  author: User    # null handled gracefully on client
}

# Non-null only for fields that are structurally guaranteed
type User {
  id: ID!         # always exists
  email: String!  # required at registration
}
```

### ✅ REQUIRED: Pagination — Cursor-Based over Offset

Offset pagination breaks on concurrent inserts/deletes. Cursor-based is stable.

```graphql
# ❌ WRONG — offset pagination (page/limit)
posts(page: Int, limit: Int): [Post!]!

# ✅ CORRECT — Relay-style cursor pagination
posts(first: Int, after: String): PostConnection!

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}
type PostEdge { node: Post! cursor: String! }
type PageInfo { hasNextPage: Boolean! endCursor: String }
```

### ✅ REQUIRED: Fragments for Client-Side Reuse

Duplicate field selections across queries create maintenance drift.

```graphql
# ❌ WRONG — field selection duplicated in every query
query UserProfile { user(id: $id) { id name avatar email createdAt } }
query UserCard     { user(id: $id) { id name avatar } }

# ✅ CORRECT — shared fragment
fragment UserFields on User { id name avatar }
query UserProfile { user(id: $id) { ...UserFields email createdAt } }
query UserCard     { user(id: $id) { ...UserFields } }
```

### ❌ NEVER: Expose Internal IDs Directly

Auto-increment DB IDs leak record counts and enable enumeration attacks.

```graphql
# ❌ WRONG — exposes sequential integer IDs
type User { id: Int! }

# ✅ CORRECT — opaque global IDs (UUID or encoded cursor)
type User { id: ID! }  # resolves to UUID or base64("User:123")
```

### ✅ REQUIRED: Depth and Complexity Limits

Recursive queries can overload the server. Apply query depth and complexity limits.

```ts
// ✅ CORRECT — protect against deeply nested or complex queries
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  validationRules: [
    depthLimit(7),
    createComplexityLimitRule(1000),
  ],
});
```

---

## Decision Tree

```
Resolver fetches by a foreign key (authorId, userId, etc.)?
  → DataLoader required — never direct DB call per parent record

Choosing schema approach?
  → Small team, explicit SDL preferred → schema-first (.graphql files)
  → TypeScript-heavy, type safety priority → code-first (Pothos)
  → Never mix both in the same project

Field nullable or non-null?
  → Structurally guaranteed (PK, required at creation) → non-null (!)
  → Relation that could be deleted or optional → nullable

Listing resources?
  → Need stable pagination under concurrent writes → cursor-based (Relay spec)
  → Simple admin UI, low-traffic → offset acceptable

Client query uses same fields in multiple places?
  → Extract to fragment

API publicly accessible?
  → Add depth limit (7) and complexity limit

API private or schema is sensitive?
  → Disable introspection in production
  → Public APIs (documented, third-party clients): keep introspection enabled

Mutation returns updated data?
  → Return the mutated object — never just a boolean
  → Include affected relations the client likely needs to refetch
  → Domain errors (validation, conflict)? → union return type preferred over throw
     Example: CreateUserResult = User | ValidationError | ConflictError
```

---

## Example

Server with DataLoader and schema-first approach, client with fragments.

```ts
// Server — schema-first + DataLoader
const typeDefs = gql`
  type User { id: ID! name: String! posts: [Post!]! }
  type Post { id: ID! title: String! author: User }
  type Query { posts(first: Int, after: String): PostConnection! }
`;

const createLoaders = () => ({
  user: new DataLoader(async (ids: readonly string[]) => {
    const users = await db.user.findMany({ where: { id: { in: [...ids] } } });
    return ids.map((id) => users.find((u) => u.id === id) ?? null);
  }),
});

const resolvers = {
  Post: {
    author: (post, _, { loaders }) => loaders.user.load(post.authorId),
  },
};

// Per-request loader context — loaders must NOT be shared across requests
const server = new ApolloServer({
  typeDefs, resolvers,
  context: () => ({ loaders: createLoaders() }),
});
```

```graphql
# Client — fragments prevent field duplication
fragment PostSummary on Post {
  id
  title
  author { id name }
}

query FeedPosts($after: String) {
  posts(first: 20, after: $after) {
    edges { node { ...PostSummary } cursor }
    pageInfo { hasNextPage endCursor }
  }
}
```

---

## Edge Cases

**DataLoader per request:** DataLoader caches by key within a request. It MUST be instantiated per request — a shared DataLoader across requests leaks data between users.

**Subscription authorization:** Subscriptions open a persistent WebSocket. Validate auth token on connection (`onConnect`), not on each message — and close the connection on token expiry.

**File uploads:** Multipart form uploads via `graphql-upload` conflict with some middleware. Consider pre-signed URL pattern instead: mutation returns a signed S3 URL, client uploads directly.

**Federation (multiple subgraphs):** Use Apollo Federation if you need to split the schema across services. Each subgraph owns its types; the gateway stitches them. Don't implement manual schema stitching — it's unmaintainable at scale.
