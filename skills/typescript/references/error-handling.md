# Error Handling

> Type-safe error patterns, Result types, and exception handling

## When to Read This

- Handling errors without exceptions
- Type-safe error handling
- Result/Either patterns
- Error unions
- Try/catch with `unknown` in TypeScript 4.4+
- Custom error classes and `instanceof` narrowing
- Async error handling and typed error propagation
- Mapping errors between application layers

---

## Result Type Pattern

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.data); // number
} else {
  console.error(result.error); // string
}
```

---

## Try/Catch with `unknown`

TypeScript 4.4+ types catch clause variables as `unknown` by default (with `useUnknownInCatchVariables` or `strict`). You must narrow before accessing properties.

```typescript
// WRONG: assuming `e` is an Error
try {
  JSON.parse(input);
} catch (e) {
  console.log(e.message); // Error: 'e' is of type 'unknown'
}

// CORRECT: narrow with instanceof
try {
  JSON.parse(input);
} catch (e: unknown) {
  if (e instanceof Error) {
    console.log(e.message); // string
  } else {
    console.log("Non-error thrown:", String(e));
  }
}

// CORRECT: utility for safe narrowing
function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  return new Error(`Unknown error: ${JSON.stringify(value)}`);
}

try {
  riskyOperation();
} catch (e: unknown) {
  const error = toError(e);
  console.error(error.message);
}
```

---

## Custom Error Classes

Extend `Error` with typed properties so callers can use `instanceof` narrowing. Always set `name` and fix the prototype chain.

```typescript
// WRONG: plain objects lose stack traces and instanceof checks
function fetchUser(id: string) {
  throw { code: 404, reason: "Not found" }; // no stack, no instanceof
}

// CORRECT: custom error class with typed properties
class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "HttpError";
    Object.setPrototypeOf(this, HttpError.prototype); // fix prototype chain
  }
}

class ValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string>
  ) {
    super("Validation failed");
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Narrowing with instanceof
try {
  await submitForm(data);
} catch (e: unknown) {
  if (e instanceof ValidationError) {
    // e.fields is Record<string, string>
    showFieldErrors(e.fields);
  } else if (e instanceof HttpError) {
    // e.statusCode is number
    showToast(`Server error: ${e.statusCode}`);
  } else {
    throw e; // re-throw unexpected errors
  }
}
```

---

## Error Unions

```typescript
type FetchError =
  | { type: "NetworkError"; message: string }
  | { type: "ValidationError"; fields: string[] }
  | { type: "AuthError"; code: number };

async function fetchUser(id: number): Promise<User | FetchError> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return { type: "NetworkError", message: response.statusText };
    }
    return await response.json();
  } catch (error) {
    return { type: "NetworkError", message: String(error) };
  }
}

const result = await fetchUser(1);
if ("type" in result) {
  // Handle error
  switch (result.type) {
    case "NetworkError":
      console.error(result.message);
      break;
    case "ValidationError":
      console.error(result.fields);
      break;
    case "AuthError":
      console.error(result.code);
      break;
  }
} else {
  // Success: result is User
  console.log(result.name);
}
```

---

## Async Error Handling

`Promise<T>` does not encode the error type. Combine async/await with the Result pattern to get typed errors through async boundaries.

```typescript
// WRONG: Promise rejection type is invisible to callers
async function loadConfig(): Promise<Config> {
  const res = await fetch("/config");
  if (!res.ok) throw new Error("Failed to load"); // caller has no idea what's thrown
  return res.json();
}

// CORRECT: async Result pattern — error type is explicit
type ConfigError =
  | { type: "NetworkError"; status: number }
  | { type: "ParseError"; raw: string };

async function loadConfig(): Promise<Result<Config, ConfigError>> {
  let res: Response;
  try {
    res = await fetch("/config");
  } catch {
    return { success: false, error: { type: "NetworkError", status: 0 } };
  }

  if (!res.ok) {
    return { success: false, error: { type: "NetworkError", status: res.status } };
  }

  const text = await res.text();
  try {
    return { success: true, data: JSON.parse(text) as Config };
  } catch {
    return { success: false, error: { type: "ParseError", raw: text } };
  }
}

// Usage — every error case is visible
const result = await loadConfig();
if (!result.success) {
  // result.error is ConfigError (fully typed)
  handleConfigError(result.error);
  return;
}
useConfig(result.data); // Config
```

---

## Error Mapping

Transform errors between layers so each layer uses its own error vocabulary. This keeps implementation details from leaking upward.

```typescript
// Layer 1: API errors (from HTTP client)
type ApiError =
  | { type: "Timeout" }
  | { type: "HttpError"; status: number; body: string };

// Layer 2: domain errors (business logic)
type OrderError =
  | { type: "NotFound"; orderId: string }
  | { type: "PermissionDenied" }
  | { type: "Unavailable" };

// Layer 3: UI errors (what the user sees)
type UiMessage = { title: string; detail: string; retry: boolean };

// API -> Domain
function toDomainError(orderId: string, err: ApiError): OrderError {
  switch (err.type) {
    case "Timeout":
      return { type: "Unavailable" };
    case "HttpError":
      if (err.status === 404) return { type: "NotFound", orderId };
      if (err.status === 403) return { type: "PermissionDenied" };
      return { type: "Unavailable" };
  }
}

// Domain -> UI
function toUiMessage(err: OrderError): UiMessage {
  switch (err.type) {
    case "NotFound":
      return { title: "Order not found", detail: `No order ${err.orderId}`, retry: false };
    case "PermissionDenied":
      return { title: "Access denied", detail: "You cannot view this order.", retry: false };
    case "Unavailable":
      return { title: "Service unavailable", detail: "Please try again later.", retry: true };
  }
}

// Composing layers
async function getOrder(id: string): Promise<Result<Order, UiMessage>> {
  const apiResult = await apiClient.fetchOrder(id);
  if (!apiResult.success) {
    const domainErr = toDomainError(id, apiResult.error);
    return { success: false, error: toUiMessage(domainErr) };
  }
  return apiResult;
}
```

---

## Exhaustive Error Handling

Use `assertNever` to guarantee at compile time that every error variant is handled. Adding a new variant to the union causes a type error at every unhandled switch.

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

type AppError =
  | { type: "NotFound"; resource: string }
  | { type: "Unauthorized" }
  | { type: "RateLimited"; retryAfter: number }
  | { type: "Internal"; message: string };

// WRONG: missing cases compile silently
function handleError(err: AppError): string {
  switch (err.type) {
    case "NotFound":
      return `${err.resource} not found`;
    case "Unauthorized":
      return "Please log in";
    // "RateLimited" and "Internal" silently fall through — no compile error
  }
  return "Something went wrong";
}

// CORRECT: assertNever catches missing cases at compile time
function handleError(err: AppError): string {
  switch (err.type) {
    case "NotFound":
      return `${err.resource} not found`;
    case "Unauthorized":
      return "Please log in";
    case "RateLimited":
      return `Too many requests. Retry in ${err.retryAfter}s`;
    case "Internal":
      return `Server error: ${err.message}`;
    default:
      return assertNever(err); // compile error if a case is missing
  }
}
```

---

## Common Pitfalls

### `catch (e: Error)` does not work

TypeScript does not allow type annotations other than `unknown` or `any` on catch clause variables. The annotation is silently ignored in older versions and an error in strict mode.

```typescript
// WRONG: the annotation has no effect — e is still unknown at runtime
try {
  riskyOperation();
} catch (e: Error) {  // TS error with useUnknownInCatchVariables
  console.log(e.message);
}

// CORRECT: catch as unknown, then narrow
try {
  riskyOperation();
} catch (e: unknown) {
  if (e instanceof Error) {
    console.log(e.message);
  }
}
```

### Losing stack traces when wrapping errors

When you catch and re-throw a new error, the original stack trace is lost unless you chain it with the `cause` property (ES2022+).

```typescript
// WRONG: original stack trace is gone
try {
  await db.query(sql);
} catch (e: unknown) {
  throw new Error("Database query failed"); // original error lost
}

// CORRECT: preserve the original error as `cause`
try {
  await db.query(sql);
} catch (e: unknown) {
  throw new Error("Database query failed", { cause: e }); // ES2022
}

// Accessing the chain
try {
  await getUser(id);
} catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);        // "Database query failed"
    console.error(e.cause);          // original db error with its stack
  }
}
```

### `Promise<T>` does not encode error types

`Promise<T>` has no type parameter for rejections. Any code can reject with any value. This is why the Result pattern is valuable for async code.

```typescript
// WRONG: callers have zero type information about failures
async function getUser(id: string): Promise<User> {
  if (!id) throw new ValidationError({ id: "required" });
  const res = await fetch(`/users/${id}`);
  if (!res.ok) throw new HttpError(res.status, "fetch failed");
  return res.json();
}
// The caller must guess what might be thrown.

// CORRECT: Result makes every failure path visible in the type
async function getUser(id: string): Promise<Result<User, UserError>> {
  if (!id) {
    return { success: false, error: { type: "Validation", fields: { id: "required" } } };
  }
  // ... typed error at every branch
}
// The caller sees UserError in the signature and can handle each case.
```

### Throwing in constructors

If a constructor throws, the caller gets a half-constructed object in some runtimes and loses type safety. Prefer a static factory method that returns a Result.

```typescript
// WRONG: constructor throws — caller must use try/catch with unknown
class Config {
  constructor(public readonly port: number) {
    if (port < 0 || port > 65535) {
      throw new Error(`Invalid port: ${port}`);
    }
  }
}

// CORRECT: factory method returns Result — no exceptions
class Config {
  private constructor(public readonly port: number) {}

  static create(port: number): Result<Config, string> {
    if (port < 0 || port > 65535) {
      return { success: false, error: `Invalid port: ${port}` };
    }
    return { success: true, data: new Config(port) };
  }
}

const result = Config.create(8080);
if (result.success) {
  startServer(result.data); // Config
} else {
  console.error(result.error); // string
}
```

---

## References

- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript 4.4 Release Notes - useUnknownInCatchVariables](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html)
- [Error Cause (ES2022)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
