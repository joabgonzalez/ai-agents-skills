# Server-Side Rendering (SSR) Patterns

> Dynamic server rendering, Astro.locals, server endpoints, and authentication

## When to Read This

- Building dynamic pages with user-specific data
- Implementing authentication and sessions
- Using Astro.locals for server context
- Creating server endpoints (POST/PUT/DELETE)
- Adapter installed (node, vercel, netlify, etc.)

---

## Project Detection

### ✅ Verify SSR Project

```javascript
// astro.config.mjs
import node from "@astrojs/node";

export default defineConfig({
  output: "server", // SSR for all pages
  adapter: node({ mode: "standalone" }), // MUST have adapter
});
```

**Without an adapter**, SSR features will cause build errors.

---

## Astro.locals (Server Context)

### ✅ Setting Context in Middleware

```typescript
// src/middleware.ts
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Parse cookies, verify JWT, etc.
  const token = context.cookies.get("auth_token");

  if (token) {
    const user = await verifyToken(token.value);
    context.locals.user = user;
  }

  return next();
};
```

### ✅ Accessing in Pages

```astro
---
// src/pages/dashboard.astro
export const prerender = false; // Enable SSR

const user = Astro.locals.user;

if (!user) {
  return Astro.redirect('/login');
}

const data = await fetchUserData(user.id);
---

<div>
  <h1>Welcome, {user.name}</h1>
  <p>Your data: {JSON.stringify(data)}</p>
</div>
```

---

## Server Endpoints

### ✅ GET Request

```typescript
// src/pages/api/user.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

### ✅ POST Request (Form Handling)

```typescript
// src/pages/api/login.ts
export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await authenticateUser(email, password);

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Set session cookie
  const token = generateToken(user);
  cookies.set("auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

### ✅ Dynamic Server Endpoints

```typescript
// src/pages/api/posts/[id].ts
export const GET: APIRoute = async ({ params }) => {
  const post = await db.post.findUnique({ where: { id: params.id } });

  if (!post) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(post), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const data = await request.json();
  const post = await db.post.update({
    where: { id: params.id },
    data,
  });

  return new Response(JSON.stringify(post), { status: 200 });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await db.post.delete({ where: { id: params.id } });

  return new Response(null, { status: 204 });
};
```

---

## Authentication Patterns

### ✅ Login Page

```astro
---
// src/pages/login.astro
const user = Astro.locals.user;

if (user) {
  return Astro.redirect('/dashboard');
}
---

<form method="POST" action="/api/login">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <button type="submit">Login</button>
</form>
```

### ✅ Protected Page

```astro
---
// src/pages/admin.astro
export const prerender = false;

const user = Astro.locals.user;

if (!user || user.role !== 'admin') {
  return Astro.redirect('/login');
}

const users = await db.user.findMany();
---

<div>
  <h1>Admin Dashboard</h1>
  <ul>
    {users.map(u => <li>{u.email}</li>)}
  </ul>
</div>
```

### ✅ Logout Endpoint

```typescript
// src/pages/api/logout.ts
export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete("auth_token");

  return new Response(null, {
    status: 303,
    headers: { Location: "/" },
  });
};
```

---

## Database Queries

### ✅ Per-Request Data Fetching

```astro
---
// Runs on EVERY request (SSR)
export const prerender = false;

const posts = await db.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
---

<ul>
  {posts.map(post => (
    <li>
      <a href={`/blog/${post.slug}`}>{post.title}</a>
      <span>{new Date().toISOString()}</span> <!-- Current time on each request -->
    </li>
  ))}
</ul>
```

---

## Caching Strategies

### ✅ Response Caching

```typescript
// src/pages/api/posts.ts
export const GET: APIRoute = async () => {
  const posts = await db.post.findMany();

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60", // Cache for 60 seconds
    },
  });
};
```

### ✅ Stale-While-Revalidate

```typescript
export const GET: APIRoute = async () => {
  const data = await fetchExpensiveData();

  return new Response(JSON.stringify(data), {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
```

---

## Environment Variables

### ✅ Server-Only Variables

```astro
---
// SSR: All env vars available (no PUBLIC_ prefix needed)
const dbUrl = import.meta.env.DATABASE_URL;
const apiSecret = import.meta.env.API_SECRET;
---

<script>
  // ❌ ERROR: Server-only vars NOT available client-side
  // const url = import.meta.env.DATABASE_URL;

  // ✅ CORRECT: Only PUBLIC_ vars available client-side
  const publicUrl = import.meta.env.PUBLIC_API_URL;
</script>
```

---

## Error Handling

### ✅ Custom Error Pages

```astro
---
// src/pages/404.astro
const url = Astro.url;
---

<div>
  <h1>404 - Page Not Found</h1>
  <p>The page <code>{url.pathname}</code> does not exist.</p>
</div>
```

### ✅ Try-Catch in Endpoints

```typescript
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const result = await processData(data);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error processing data:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
```

---

## Edge Cases

### ⚠️ Request Object Only in SSR

```astro
---
export const prerender = false;

// ✅ Available in SSR
const method = Astro.request.method;
const headers = Astro.request.headers;
const body = await Astro.request.json();

// ❌ NOT available in SSG (build error)
---
```

### ⚠️ Cookies Only in SSR

```astro
---
export const prerender = false;

// ✅ Available in SSR
const token = Astro.cookies.get('auth_token');
Astro.cookies.set('theme', 'dark', { maxAge: 86400 });

// ❌ NOT available in SSG
---
```

---

## References

- [Astro SSR Documentation](https://docs.astro.build/en/guides/server-side-rendering/)
- [Adapters](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)
- [Middleware](https://docs.astro.build/en/guides/middleware/)
- [Server Endpoints](https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes)
