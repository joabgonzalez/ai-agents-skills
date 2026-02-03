# Result Pattern

> Type-safe error handling without exceptions. Return explicit success/failure instead of throwing.

## Overview

The Result pattern wraps operation outcomes in a type that explicitly represents success or failure. Alternative to throwing exceptions for expected errors (validation, not found, business rule violations).

**Benefits**:

- Type-safe error handling
- Explicit error paths (no hidden throws)
- Composable (chain operations)
- Forces consumers to handle errors

**Use when**:

- API calls that can fail
- Validation that can have multiple errors
- Business operations with expected failures
- You want to avoid try/catch everywhere

**Don't use for**:

- Unexpected errors (use throw for programmer errors: null pointer, out of bounds)
- Trivial operations that never fail

---

## Basic Implementation

### Simple Result<T>

```typescript
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string,
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static fail<T>(error: string): Result<T> {
    return new Result(false, undefined, error);
  }

  // Helper methods
  map<U>(fn: (value: T) => U): Result<U> {
    if (!this.isSuccess) {
      return Result.fail(this.error!);
    }
    return Result.ok(fn(this.value!));
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (!this.isSuccess) {
      return Result.fail(this.error!);
    }
    return fn(this.value!);
  }
}

// Usage
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Result.fail("Cannot divide by zero");
  }
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isSuccess) {
  console.log(result.value); // 5
} else {
  console.error(result.error);
}
```

---

## Backend Examples

### API Endpoint with Result

```typescript
// Service layer
class UserService {
  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.repo.findById(id);

    if (!user) {
      return Result.fail(`User not found: ${id}`);
    }

    return Result.ok(user);
  }

  async createUser(data: CreateUserDTO): Promise<Result<User>> {
    // Validation
    if (!data.email.includes("@")) {
      return Result.fail("Invalid email address");
    }

    // Check duplicates
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      return Result.fail("Email already registered");
    }

    // Create
    const user = await this.repo.create(data);
    return Result.ok(user);
  }
}

// Controller (Express)
app.get("/users/:id", async (req, res) => {
  const result = await userService.getUserById(req.params.id);

  if (result.isSuccess) {
    res.json(result.value);
  } else {
    res.status(404).json({ error: result.error });
  }
});

app.post("/users", async (req, res) => {
  const result = await userService.createUser(req.body);

  if (result.isSuccess) {
    res.status(201).json(result.value);
  } else {
    res.status(400).json({ error: result.error });
  }
});
```

### Chaining Operations

```typescript
// Without Result (error handling scattered)
async function processOrder(orderId: string) {
  try {
    const order = await getOrder(orderId);
    if (!order) throw new Error("Order not found");

    if (!order.isPaid) throw new Error("Order not paid");

    const items = await getOrderItems(order.id);
    if (items.length === 0) throw new Error("No items");

    await shipOrder(order, items);
    await sendConfirmation(order.email);

    return order;
  } catch (error) {
    // Lost context about which step failed
    throw error;
  }
}

// With Result (explicit error handling)
async function processOrder(orderId: string): Promise<Result<Order>> {
  return (await getOrder(orderId))
    .flatMap((order) =>
      order.isPaid ? Result.ok(order) : Result.fail("Order not paid"),
    )
    .flatMap(async (order) => {
      const itemsResult = await getOrderItems(order.id);
      if (!itemsResult.isSuccess) return itemsResult;

      if (itemsResult.value.length === 0) {
        return Result.fail("No items in order");
      }

      return Result.ok({ order, items: itemsResult.value });
    })
    .flatMap(async ({ order, items }) => {
      const shipResult = await shipOrder(order, items);
      if (!shipResult.isSuccess) return shipResult;

      const emailResult = await sendConfirmation(order.email);
      if (!emailResult.isSuccess) return emailResult;

      return Result.ok(order);
    });
}

// Consumer knows exactly what can fail
const result = await processOrder("123");
if (result.isSuccess) {
  console.log("Order processed:", result.value.id);
} else {
  console.error("Failed to process order:", result.error);
  // Clear error message tells us which step failed
}
```

---

## Frontend Examples

### React with Result Pattern

```typescript
// Custom hook with Result
const useCreateUser = () => {
  const [result, setResult] = useState<Result<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (data: CreateUserDTO) => {
    setIsLoading(true);

    // Client-side validation
    if (!data.email.includes('@')) {
      setResult(Result.fail('Invalid email format'));
      setIsLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setResult(Result.fail('Password must be at least 8 characters'));
      setIsLoading(false);
      return;
    }

    // API call
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        setResult(Result.fail(error.message || 'Failed to create user'));
        return;
      }

      const user = await response.json();
      setResult(Result.ok(user));
    } catch (error) {
      setResult(Result.fail('Network error. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, result, isLoading };
};

// Component
const CreateUserForm = () => {
  const { createUser, result, isLoading } = useCreateUser();
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <input
        type="text"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>

      {result && !result.isSuccess && (
        <Alert severity="error">{result.error}</Alert>
      )}

      {result?.isSuccess && (
        <Alert severity="success">
          User created successfully: {result.value.name}
        </Alert>
      )}
    </form>
  );
};
```

### Redux Toolkit with Result

```typescript
// Slice with Result
const userSlice = createSlice({
  name: 'user',
  initialState: {
    createResult: null as Result<User> | null
  },
  reducers: {
    createUserSuccess: (state, action: PayloadAction<User>) => {
      state.createResult = Result.ok(action.payload);
    },
    createUserFailure: (state, action: PayloadAction<string>) => {
      state.createResult = Result.fail(action.payload);
    }
  }
});

// Thunk
export const createUser = createAsyncThunk(
  'user/create',
  async (data: CreateUserDTO, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Component
const CreateUserForm = () => {
  const dispatch = useDispatch();
  const result = useSelector((state: RootState) => state.user.createResult);

  const handleSubmit = (data: CreateUserDTO) => {
    dispatch(createUser(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}

      {result && !result.isSuccess && (
        <Alert severity="error">{result.error}</Alert>
      )}

      {result?.isSuccess && (
        <Alert severity="success">User created!</Alert>
      )}
    </form>
  );
};
```

---

## Advanced: Either<L, R> Pattern

For operations that can return two different success types or need more context in errors:

```typescript
type Either<L, R> = Left<L> | Right<R>;

class Left<L> {
  readonly tag = "left";
  constructor(public readonly value: L) {}

  isLeft(): this is Left<L> {
    return true;
  }
  isRight(): this is Right<never> {
    return false;
  }
}

class Right<R> {
  readonly tag = "right";
  constructor(public readonly value: R) {}

  isLeft(): this is Left<never> {
    return false;
  }
  isRight(): this is Right<R> {
    return true;
  }
}

// Usage
type ValidationError = { field: string; message: string };

function validateUser(data: CreateUserDTO): Either<ValidationError[], User> {
  const errors: ValidationError[] = [];

  if (!data.email.includes("@")) {
    errors.push({ field: "email", message: "Invalid email" });
  }

  if (data.password.length < 8) {
    errors.push({ field: "password", message: "Too short" });
  }

  if (errors.length > 0) {
    return new Left(errors);
  }

  return new Right(new User(data));
}

// Consumer
const result = validateUser(formData);

if (result.isLeft()) {
  // Type: ValidationError[]
  result.value.forEach((error) => {
    showFieldError(error.field, error.message);
  });
} else {
  // Type: User
  await saveUser(result.value);
}
```

---

## Option<T> Pattern

For operations that may or may not return a value (alternative to null/undefined):

```typescript
type Option<T> = Some<T> | None;

class Some<T> {
  readonly tag = "some";
  constructor(public readonly value: T) {}

  isSome(): this is Some<T> {
    return true;
  }
  isNone(): this is None {
    return false;
  }
}

class None {
  readonly tag = "none";

  isSome(): this is Some<never> {
    return false;
  }
  isNone(): this is None {
    return true;
  }
}

// Usage
function findUserById(id: string): Option<User> {
  const user = database.get(id);
  return user ? new Some(user) : new None();
}

const userOption = findUserById("123");

if (userOption.isSome()) {
  console.log(userOption.value.name); // Type-safe access
} else {
  console.log("User not found");
}

// With default value
const user = userOption.isSome() ? userOption.value : new GuestUser();
```

---

## Integration with Other Patterns

### Result + Clean Architecture

```typescript
// Application layer (use case)
class PlaceOrderUseCase {
  async execute(items: OrderItem[], token: string): Promise<Result<Order>> {
    // Validation
    if (items.length === 0) {
      return Result.fail("Order must have items");
    }

    // Business logic
    const order = new Order(generateId(), items, "pending");

    // External dependency (payment)
    const paymentResult = await this.payment.charge(order.total, token);
    if (!paymentResult.isSuccess) {
      return Result.fail(`Payment failed: ${paymentResult.error}`);
    }

    // Persistence
    const saveResult = await this.orderRepo.save(order);
    if (!saveResult.isSuccess) {
      return Result.fail(`Save failed: ${saveResult.error}`);
    }

    return Result.ok(order);
  }
}

// API layer propagates Result
app.post("/orders", async (req, res) => {
  const result = await placeOrderUseCase.execute(
    req.body.items,
    req.body.token,
  );

  if (result.isSuccess) {
    res.status(201).json(result.value);
  } else {
    res.status(400).json({ error: result.error });
  }
});
```

### Result + SOLID (SRP)

```typescript
// Each service returns Result (explicit error handling)
class ValidationService {
  validate(user: CreateUserDTO): Result<CreateUserDTO> {
    if (!user.email.includes("@")) {
      return Result.fail("Invalid email");
    }
    return Result.ok(user);
  }
}

class DuplicationCheckService {
  async check(email: string): Promise<Result<void>> {
    const existing = await this.repo.findByEmail(email);
    if (existing) {
      return Result.fail("Email already exists");
    }
    return Result.ok(undefined);
  }
}

class UserService {
  async createUser(data: CreateUserDTO): Promise<Result<User>> {
    // Chain results
    const validationResult = this.validator.validate(data);
    if (!validationResult.isSuccess) {
      return Result.fail(validationResult.error);
    }

    const dupCheckResult = await this.dupCheck.check(data.email);
    if (!dupCheckResult.isSuccess) {
      return Result.fail(dupCheckResult.error);
    }

    const user = await this.repo.create(data);
    return Result.ok(user);
  }
}
```

---

## Comparison with Exceptions

| Aspect           | Exceptions                   | Result Pattern                     |
| ---------------- | ---------------------------- | ---------------------------------- |
| Error visibility | Hidden (can throw anywhere)  | Explicit (return type shows it)    |
| Handling         | try/catch (easy to forget)   | Type system forces handling        |
| Performance      | Slower (stack unwinding)     | Faster (normal return)             |
| Composability    | Difficult (nested try/catch) | Easy (map, flatMap)                |
| Type safety      | No (catch is `unknown`)      | Yes (typed error)                  |
| Best for         | Unexpected errors (bugs)     | Expected errors (validation, etc.) |

**Recommendation**: Use both

- **Exceptions**: Programmer errors (null pointer, index out of bounds)
- **Result**: Business errors (validation, not found, unauthorized)

---

## When NOT to Use Result

- **Trivial operations**: `getName()` doesn't need Result
- **Internal helpers**: Private functions can throw
- **Truly unexpected errors**: Out of memory, stack overflow
- **Team unfamiliar**: Learning curve may slow development

---

## Libraries

If you don't want to implement yourself:

- **TypeScript**: [neverthrow](https://github.com/supermacro/neverthrow)
- **fp-ts**: [Either](https://gcanti.github.io/fp-ts/modules/Either.ts.html), [Option](https://gcanti.github.io/fp-ts/modules/Option.ts.html)
- **Rust-inspired**: [ts-results](https://github.com/vultix/ts-results)

---

## Summary

**Use Result pattern when**:

- Operation can fail for expected reasons
- You want type-safe error handling
- Consumers should explicitly handle errors
- Chaining multiple operations that can fail

**Implementation checklist**:

- [ ] Create `Result<T>` class with `ok` and `fail` static methods
- [ ] Add `map` and `flatMap` for composition
- [ ] Return `Result<T>` from functions that can fail
- [ ] Check `isSuccess` before accessing `value`
- [ ] Handle `error` when `!isSuccess`

---

## References

- [Main SKILL](../SKILL.md)
- [SOLID Principles](solid-principles.md) - SRP with Result
- [Frontend Integration](frontend-integration.md) - React examples
- [Backend Integration](backend-integration.md) - API examples

**External**:

- [Rust Result](https://doc.rust-lang.org/std/result/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
