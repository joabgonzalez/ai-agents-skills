# Error Handling

> Type-safe error patterns, Result types, and exception handling

## When to Read This

- Handling errors without exceptions
- Type-safe error handling
- Result/Either patterns
- Error unions

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

## never Type for Exhaustiveness

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

type Status = "pending" | "success" | "error";

function handleStatus(status: Status) {
  switch (status) {
    case "pending":
      return "Loading...";
    case "success":
      return "Done!";
    case "error":
      return "Failed!";
    default:
      return assertNever(status); // Ensures all cases handled
  }
}
```

---

## References

- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
