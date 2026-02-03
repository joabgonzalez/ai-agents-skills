# Astro Middleware

> Request/response interception for authentication, logging, redirects

## When to Read This

- Implementing authentication/authorization
- Adding request logging or analytics
- Handling redirects or rewrites
- Modifying headers or cookies
- Running code before page renders (SSR only)

---

## Basic Setup

### ✅ Create Middleware

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Code runs before page renders
  console.log("Request:", context.url.pathname);

  // Call next() to continue to page
  const response = await next();

  // Code runs after page renders (can modify response)
  response.headers.set("X-Custom-Header", "value");

  return response;
});
```

### ✅ Middleware Context

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Access request details
  const { request, url, cookies, locals, redirect, params } = context;

  console.log("URL:", url.pathname);
  console.log("Method:", request.method);
  console.log("Headers:", request.headers.get("user-agent"));

  // Store data for page/endpoint
  context.locals.user = { id: 123, name: "John" };

  return next();
});
```

---

## Authentication

### ✅ Protect Routes

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("auth-token")?.value;

  // Public routes
  if (
    context.url.pathname.startsWith("/login") ||
    context.url.pathname === "/"
  ) {
    return next();
  }

  // Protected routes
  if (!token) {
    return context.redirect("/login");
  }

  // Verify token
  try {
    const user = await verifyToken(token);
    context.locals.user = user;
    return next();
  } catch (error) {
    context.cookies.delete("auth-token");
    return context.redirect("/login");
  }
});
```

### ✅ Access User in Pages

```astro
---
// src/pages/dashboard.astro
const user = Astro.locals.user;

if (!user) {
  return Astro.redirect('/login');
}
---

<h1>Welcome, {user.name}!</h1>
```

---

## Logging & Analytics

### ✅ Request Logging

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  const start = Date.now();

  const response = await next();

  const duration = Date.now() - start;
  console.log(
    `${context.request.method} ${context.url.pathname} - ${duration}ms`,
  );

  return response;
});
```

### ✅ Error Tracking

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  try {
    return await next();
  } catch (error) {
    console.error("Request failed:", error);
    // Send to error tracking service
    await trackError(error, context);

    // Return error page
    return new Response("Internal Server Error", { status: 500 });
  }
});
```

---

## Redirects & Rewrites

### ✅ Conditional Redirects

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Redirect old URLs
  if (context.url.pathname === "/old-page") {
    return context.redirect("/new-page", 301);
  }

  // Redirect based on locale
  const locale = context.cookies.get("locale")?.value || "en";
  if (context.url.pathname === "/") {
    return context.redirect(`/${locale}`);
  }

  return next();
});
```

### ✅ Rewrites (Same URL, Different Content)

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // A/B testing: serve different page for same URL
  const variant = context.cookies.get("ab-test")?.value || "a";

  if (context.url.pathname === "/landing" && variant === "b") {
    // Rewrite internally (URL stays same)
    const request = new Request(
      new URL("/landing-b", context.url),
      context.request,
    );
    return fetch(request);
  }

  return next();
});
```

---

## Headers & Cookies

### ✅ Set Security Headers

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'",
  );

  return response;
});
```

### ✅ Manage Cookies

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  // Read cookie
  const theme = context.cookies.get("theme")?.value || "light";

  // Set cookie
  context.cookies.set("last-visit", new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  // Delete cookie
  if (context.url.pathname === "/logout") {
    context.cookies.delete("auth-token");
  }

  return next();
});
```

---

## Sequence Multiple Middleware

### ✅ Middleware Chains

```typescript
// src/middleware.ts
import { sequence } from "astro:middleware";
import { authMiddleware } from "./middleware/auth";
import { loggingMiddleware } from "./middleware/logging";
import { securityMiddleware } from "./middleware/security";

export const onRequest = sequence(
  loggingMiddleware,
  securityMiddleware,
  authMiddleware,
);
```

```typescript
// src/middleware/auth.ts
export const authMiddleware = defineMiddleware(async (context, next) => {
  // Authentication logic
  return next();
});

// src/middleware/logging.ts
export const loggingMiddleware = defineMiddleware(async (context, next) => {
  // Logging logic
  return next();
});
```

---

## Best Practices

1. **Keep middleware fast:** Slow middleware delays every request
2. **Use `context.locals`** to pass data to pages/endpoints
3. **Chain middleware** with `sequence()` for separation of concerns
4. **Handle errors gracefully:** Middleware errors can crash the server
5. **Cache expensive operations:** Don't repeat auth checks or DB queries
6. **Test middleware thoroughly:** Bugs affect all routes

---

## Edge Cases

**Static pages:** Middleware only runs for SSR pages. Static pages built at build time won't execute middleware.

**API routes:** Middleware runs for API endpoints (`/api/*`), useful for API authentication.

**Order matters:** Middleware runs in the order defined in `sequence()`.

**Response modification:** Modifications to `response.body` are complex. Prefer headers/status changes.

---

## References

- [Astro Middleware](https://docs.astro.build/en/guides/middleware/)
- [Middleware Patterns](https://docs.astro.build/en/recipes/middleware/)
