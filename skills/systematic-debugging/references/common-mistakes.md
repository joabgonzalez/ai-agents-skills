# Common Mistakes

> Frequently encountered errors and their root causes.

## Core Patterns

- JavaScript/TypeScript
- React
- Node.js/Express
- TypeScript-Specific

---

## JavaScript/TypeScript

| Error | Common Root Cause | Fix |
|-------|------------------|-----|
| `Cannot read properties of undefined` | Variable is undefined, accessing `.property` | Check data flow — where should this value come from? |
| `x is not a function` | Wrong import, or value is not a function | Check import statement, log `typeof x` |
| `Maximum call stack size exceeded` | Infinite recursion | Check base case, log recursion depth |
| `Cannot find module` | Wrong path, missing install | Check path relativity, run `npm install` |
| `Unexpected token` | Syntax error or wrong file type | Check for missing brackets, commas, semicolons |
| `Assignment to constant variable` | Reassigning `const` | Use `let` if value changes, or create new variable |

---

## React

| Error | Common Root Cause | Fix |
|-------|------------------|-----|
| "Too many re-renders" | setState called during render (not in handler/effect) | Move setState into useEffect or event handler |
| "Invalid hook call" | Hook called conditionally, in loop, or outside component | Follow Rules of Hooks — top level only |
| "Each child should have unique key" | Missing or duplicate `key` prop in list | Use unique, stable ID (not array index) |
| "Cannot update unmounted component" | setState after component unmounts | Add cleanup in useEffect, use AbortController |
| "Objects are not valid as React child" | Rendering object instead of string/number | Access specific property: `{user.name}` not `{user}` |
| Stale closure in useCallback | Empty dependency array captures old values | Include dependencies in array |
| Infinite useEffect loop | Object/array in dependency array (new reference each render) | Memoize with useMemo or move inside effect |

---

## Node.js/Express

| Error | Common Root Cause | Fix |
|-------|------------------|-----|
| `ECONNREFUSED` | Target service not running | Check if DB/API is up, correct port |
| `EADDRINUSE` | Port already in use | Kill existing process or use different port |
| `CORS error` | Missing CORS headers | Add `cors()` middleware or set headers |
| "Headers already sent" | Calling `res.json()` twice | Return after first response |
| `UnhandledPromiseRejection` | Missing try/catch in async handler | Wrap async handlers, add error middleware |
| `ENOMEM` | Memory leak or large payload | Profile memory, add limits, stream large data |

---

## TypeScript-Specific

| Error | Common Root Cause | Fix |
|-------|------------------|-----|
| `Type 'X' is not assignable to type 'Y'` | Type mismatch | Check both types, use type assertion only if certain |
| `Property 'x' does not exist on type 'Y'` | Missing property in type definition | Add to interface or use optional chaining |
| `Argument of type 'string' is not assignable to parameter of type '...'` | String literal vs string type | Use `as const` or literal type |
| No error but wrong runtime behavior | `as` assertion overriding compiler | Replace `as` with type guards or validation |

---

## Debugging Mindset

### When You're Stuck

1. **Take a break** — Fresh eyes find bugs faster
2. **Explain the problem out loud** — Rubber duck debugging
3. **Read the error message again** — Slowly, word by word
4. **Check git diff** — What changed since it last worked?
5. **Simplify** — Remove complexity until bug disappears, then add back
6. **Search** — Error message + framework name in search engine
7. **Minimal reproduction** — Create smallest code that reproduces the bug

### Questions to Ask Yourself

- What do I expect to happen?
- What actually happens?
- What's different between those two?
- When did this last work? What changed since then?
- Am I sure about my assumptions? How can I verify?

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for systematic debugging process
- See [debugging-strategies.md](debugging-strategies.md) for technology-specific techniques
