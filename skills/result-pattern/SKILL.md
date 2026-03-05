---
name: result-pattern
description: "Type-safe error handling via Result<T>. Trigger: When handling expected business errors (validation, not found) without throwing exceptions."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Result Pattern

Wraps operation outcomes in `Result<T>` representing success or failure. Alternative to throwing exceptions for expected errors—provides explicit error paths and forces consumers to handle errors.

## When to Use

- Expected business errors (validation failed, user not found, unauthorized)
- Chaining multiple operations that can fail
- Type-safe error handling across layers
- API endpoints that need different HTTP status codes per error type

Don't use for:

- Truly unexpected errors (null pointer, out of memory) → throw exceptions
- Simple getters that can't fail
- Internal private helpers

---

## Critical Patterns

### ✅ REQUIRED: Basic Result<T>

```typescript
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string
  ) {}

  static ok<T>(value: T): Result<T>       { return new Result(true, value); }
  static fail<T>(error: string): Result<T> { return new Result(false, undefined, error); }

  // Chain operations: if this failed, propagates failure; if success, applies fn
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    return this.isSuccess ? fn(this.value!) : Result.fail<U>(this.error!);
  }
}

// Usage
function divide(a: number, b: number): Result<number> {
  if (b === 0) return Result.fail("Cannot divide by zero");
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isSuccess) console.log(result.value); // 5
else console.error(result.error);
```

### ✅ REQUIRED: Chain with flatMap

```typescript
function parseAge(s: string): Result<number> {
  const n = parseInt(s);
  return isNaN(n) ? Result.fail("Not a number") : Result.ok(n);
}
function validateAge(n: number): Result<number> {
  return n >= 0 && n < 150 ? Result.ok(n) : Result.fail("Age out of range");
}

// Chain: each step only runs if the previous succeeded
const result = parseAge("25").flatMap(validateAge);
if (result.isSuccess) console.log(result.value); // 25
```

### ✅ REQUIRED: Service Layer Returns Result

```typescript
class UserService {
  async createUser(data: CreateUserDTO): Promise<Result<User>> {
    if (!data.email.includes("@")) return Result.fail("Invalid email");

    const existing = await this.repo.findByEmail(data.email);
    if (existing) return Result.fail("Email already registered");

    const user = await this.repo.create(data);
    return Result.ok(user);
  }
}
```

### ✅ REQUIRED: Controller Maps Result to HTTP

```typescript
app.post("/users", async (req, res) => {
  const result = await userService.createUser(req.body);
  if (result.isSuccess) res.status(201).json(result.value);
  else res.status(400).json({ error: result.error });
});
```

### ✅ REQUIRED: Frontend — React Hook with Result

Use Result in hooks to surface typed errors without exceptions bubbling into components.

```typescript
// Service — returns Result instead of throwing
async function submitOrder(items: OrderItem[]): Promise<Result<Order>> {
  if (items.length === 0) return Result.fail("EMPTY_ORDER");
  const res = await fetch("/api/orders", { method: "POST", body: JSON.stringify({ items }) });
  if (!res.ok) return Result.fail(res.status === 409 ? "ORDER_CONFLICT" : "SERVER_ERROR");
  return Result.ok(await res.json());
}

// Hook — drives UI state with typed error codes, no try/catch leaking into component
function useCreateOrder() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function submit(items: OrderItem[]): Promise<void> {
    setState("loading");
    const result = await submitOrder(items);
    if (result.isSuccess) { setState("success"); }
    else                   { setState("error"); setErrorCode(result.error!); }
  }

  return { submit, state, errorCode };
}

// Component maps error codes to readable messages — no string parsing
const errorMessages: Record<string, string> = {
  EMPTY_ORDER:    "Add at least one item.",
  ORDER_CONFLICT: "This order was already placed.",
  SERVER_ERROR:   "Something went wrong. Try again.",
};
```

### ❌ NEVER: Swallow Errors Without Result

```typescript
// ❌ WRONG: Silent failure, caller doesn't know what happened
try { await createUser(data); } catch { /* nothing */ }

// ✅ CORRECT: Explicit result
const result = await createUser(data);
if (!result.isSuccess) handleError(result.error);
```

---

## Decision Tree

```
Expected business error (validation, not found, unauthorized)?
  → Return Result.fail("message")

Programmer error (null pointer, wrong arg type)?
  → Throw exception (not Result)

Multiple operations that can fail sequentially?
  → Chain with flatMap, or check isSuccess at each step

API endpoint needs to return different HTTP codes per error?
  → Service returns Result → controller maps Result to HTTP status

Need typed error variants (ValidationError, NotFoundError)?
  → Add a discriminated union error type to Result<T, E> — see references/advanced-patterns.md

Operation may or may not return a value (nullable)?
  → Return Result<T | undefined> or use a dedicated wrapper — see references/advanced-patterns.md
```

---

## Example

End-to-end: service returns `Result` → controller maps each failure to the correct HTTP status code.

```typescript
// Service layer — returns typed Result with business errors
class OrderService {
  async placeOrder(userId: string, dto: PlaceOrderDTO): Promise<Result<Order>> {
    const user = await this.userRepo.findById(userId);
    if (!user)               return Result.fail("USER_NOT_FOUND");
    if (!user.isActive)      return Result.fail("USER_INACTIVE");
    if (dto.items.length === 0) return Result.fail("EMPTY_ORDER");

    const order = Order.create(userId, dto.items);
    await this.orderRepo.save(order);
    return Result.ok(order);
  }
}

// Controller layer — maps each error code to an appropriate HTTP status
app.post("/api/v1/orders", async (req, res) => {
  const result = await orderService.placeOrder(req.user.id, req.body);

  if (result.isSuccess) {
    return res.status(201).json(result.value);
  }

  const statusMap: Record<string, number> = {
    USER_NOT_FOUND: 404,
    USER_INACTIVE:  403,
    EMPTY_ORDER:    400,
  };
  const status = statusMap[result.error!] ?? 500;
  return res.status(status).json({ error: result.error });
});
```

Patterns applied: service returns `Result.ok` / `Result.fail`, error codes are plain strings the controller maps to HTTP statuses, no try/catch needed — all paths are explicit.

---

## Edge Cases

**Team unfamiliarity:** Result pattern has a learning curve. If team is unfamiliar, introduce gradually (one service at a time).

**Async chains:** `flatMap` with async functions requires `await` at each step or wrapping with `Promise.all`.

**Third-party libraries that throw:** Wrap in try/catch and convert to Result at the boundary.

**Too granular:** Don't wrap every private helper in Result — only public API surfaces and operations that callers need to handle explicitly.

---

## Conventions

| | Exceptions | Result Pattern |
|--|--|--|
| Error visibility | Hidden (throws anywhere) | Explicit (return type) |
| Handling | try/catch (easy to forget) | Type system forces it |
| Best for | Bugs, unexpected errors | Business errors |

**Use both**: exceptions for programmer errors, Result for business errors.

---

## Resources

- [advanced-patterns.md](references/advanced-patterns.md) — Either<L,R>, Option<T>, Redux integration, chaining
