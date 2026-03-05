# Debugging Strategies

> Technology-specific debugging techniques for React, Node.js, TypeScript, and APIs.

## Core Patterns

- React Debugging
- Node.js Debugging
- TypeScript Debugging
- API Debugging

---

## React Debugging

### State Not Updating

```typescript
// Problem: State seems "stuck" or "stale"
// Root causes (check in order):

// 1. Logging immediately after setState (state updates are async)
setState(newValue);
console.log(state); // ❌ Still shows old value!
// Fix: Log in useEffect
useEffect(() => { console.log('State updated:', state); }, [state]);

// 2. Object/array mutation (React doesn't detect mutations)
const updateUser = () => {
  user.name = 'New Name'; // ❌ Mutation — no re-render
  setUser(user);           // Same reference!
};
// Fix: Create new reference
setUser({ ...user, name: 'New Name' }); // ✅ New object

// 3. Stale closure (capturing old value in callback)
const handleClick = useCallback(() => {
  console.log(count); // ❌ Captures count at creation time
}, []); // Empty deps = never updates
// Fix: Include dependency
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // ✅ Updates when count changes
```

### Component Not Re-Rendering

```typescript
// Check these in order:
// 1. Is state actually changing? (log before/after setState)
// 2. Is the component memoized? (React.memo blocking re-render)
// 3. Is the parent providing stable props? (useCallback/useMemo)
// 4. Is Context value changing? (check provider's value reference)

// React DevTools: Components tab → Highlight updates on render
```

### useEffect Running Too Often

```typescript
// Check dependency array:
// 1. Object/array in deps? (new reference every render)
const options = { limit: 10 }; // ❌ New object every render
useEffect(() => { fetch(url, options); }, [options]); // Runs every render

// Fix: Memoize or move inside effect
const options = useMemo(() => ({ limit: 10 }), []);
// Or: move object creation inside useEffect
```

---

## Node.js Debugging

### Unhandled Promise Rejection

```typescript
// Problem: "UnhandledPromiseRejectionWarning"
// Root cause: async function throws but no .catch() or try/catch

// ❌ No error handling
app.get('/users', async (req, res) => {
  const users = await db.users.findMany(); // If this throws, crash!
  res.json(users);
});

// ✅ Error handling
app.get('/users', async (req, res, next) => {
  try {
    const users = await db.users.findMany();
    res.json(users);
  } catch (error) {
    next(error); // Forward to error handler
  }
});

// Global safety net (don't rely on this)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
```

### Memory Leaks

```typescript
// Common causes:
// 1. Event listeners not removed
// 2. Timers not cleared
// 3. Growing arrays/maps (no cleanup)
// 4. Closures capturing large objects

// Diagnosis: Use --inspect flag + Chrome DevTools
// node --inspect src/server.ts
// Open chrome://inspect → Take heap snapshots → Compare

// Common fix: Clear subscriptions/timers on shutdown
const server = app.listen(3000);
process.on('SIGTERM', () => {
  server.close();
  clearInterval(cleanupTimer);
  db.disconnect();
});
```

---

## TypeScript Debugging

### Type Error at Runtime Despite Type Safety

```typescript
// Problem: "TypeError: x is not a function" in typed code
// Root causes:

// 1. `as` assertion overriding compiler (lying to TypeScript)
const data = response.body as UserData; // ❌ If body is actually null...
// Fix: Use type guards
if (isUserData(response.body)) { /* safe */ }

// 2. External data not validated (API responses, user input)
const user: User = await fetch('/api/user').then(r => r.json()); // ❌ No validation!
// Fix: Validate with Zod/Yup at system boundary
const user = UserSchema.parse(await fetch('/api/user').then(r => r.json()));

// 3. any leaking into codebase
function process(data: any) { return data.nonexistent(); } // No compile error!
// Fix: Use unknown + type narrowing
```

---

## API Debugging

### Request/Response Debugging Checklist

```markdown
1. **Is the request being sent?** (Network tab, server logs)
2. **Correct URL?** (Check for typos, wrong env, missing segments)
3. **Correct method?** (GET vs POST vs PUT)
4. **Correct headers?** (Content-Type, Authorization, CORS)
5. **Correct body?** (JSON.stringify? FormData? Raw?)
6. **Status code?** (200 OK, 400 Bad Request, 401 Unauthorized, 500 Server Error)
7. **Response body?** (Is it what you expect? JSON parse errors?)
8. **CORS issues?** (Check Access-Control-Allow-Origin header)
```

### Common HTTP Status Debugging

| Status | Likely Cause | Check |
|--------|-------------|-------|
| 400 | Invalid request body | Log `req.body`, check Content-Type header |
| 401 | Missing/expired token | Check Authorization header, token expiry |
| 403 | Wrong permissions | Correct role/scope for the endpoint? |
| 404 | Wrong URL | Compare URL with API docs/routes |
| 422 | Validation failure | Check response body for field errors |
| 500 | Server crash | Check server logs for stack trace |
| 502/503 | Server down/overloaded | Check server status, health endpoint |

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for systematic debugging process
- See [common-mistakes.md](common-mistakes.md) for error pattern recognition
