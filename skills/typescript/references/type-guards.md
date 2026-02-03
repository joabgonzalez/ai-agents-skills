# Type Guards

> Type narrowing, user-defined guards, and runtime validation

## When to Read This

- Runtime type checking
- Narrowing union types
- Validating unknown data
- Type-safe error handling

---

## Built-in Type Guards

### ✅ typeof

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  }
  return value.toFixed(2); // number
}
```

### ✅ instanceof

```typescript
class User {
  name: string;
}

function greet(entity: User | string) {
  if (entity instanceof User) {
    return `Hello, ${entity.name}`;
  }
  return `Hello, ${entity}`;
}
```

---

## User-Defined Type Guards

```typescript
interface User {
  type: "user";
  name: string;
}

interface Admin {
  type: "admin";
  name: string;
  permissions: string[];
}

// ✅ Type predicate
function isAdmin(entity: User | Admin): entity is Admin {
  return entity.type === "admin";
}

function process(entity: User | Admin) {
  if (isAdmin(entity)) {
    console.log(entity.permissions); // Admin
  } else {
    console.log(entity.name); // User
  }
}
```

---

## Discriminated Unions

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function handle<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // T
  } else {
    console.log(result.error); // string
  }
}
```

---

## Assertion Functions

```typescript
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function processUser(user: unknown) {
  assert(typeof user === "object" && user !== null);
  assert("name" in user && typeof user.name === "string");

  // TypeScript knows user is { name: string }
  console.log(user.name.toUpperCase());
}
```

---

## References

- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
