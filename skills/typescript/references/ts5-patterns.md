# TypeScript 5.x Patterns

> NoInfer, branded types, exhaustive switch, `using` keyword, and const type parameters

## Core Patterns

- `NoInfer<T>` Utility Type
- Branded / Nominal Types
- Exhaustive Switch with `never`
- `using` / `await using` (TS 5.2)
- Const Type Parameters (TS 5.0)

---

## `NoInfer<T>` Utility Type

`NoInfer<T>` (TypeScript 5.4) prevents TypeScript from using a specific position to infer a type parameter, forcing inference from other arguments.

### Problem: Unintended Inference from Default Value

```typescript
// ❌ WRONG: TypeScript infers T from defaultValue, ignoring values array
function createStore<T>(values: T[], defaultValue: T): T {
  return values.includes(defaultValue) ? defaultValue : values[0];
}

// T is inferred as string | number because defaultValue is 0
createStore(['a', 'b', 'c'], 0); // No error — but should be an error!
```

### Solution: `NoInfer<T>` on the Default Parameter

```typescript
// ✅ CORRECT: T inferred from values only; defaultValue must match
function createStore<T>(values: T[], defaultValue: NoInfer<T>): T {
  return values.includes(defaultValue) ? defaultValue : values[0];
}

createStore(['a', 'b', 'c'], 0);   // ✅ Error: 0 not assignable to string
createStore(['a', 'b', 'c'], 'a'); // ✅ OK
```

### Common Use Cases

```typescript
// Component default prop must match options type
function Select<T extends string>(
  options: T[],
  defaultSelected: NoInfer<T>
): void { /* ... */ }

// Animation keyframe end must match start type
function animate<T>(from: T, to: NoInfer<T>, duration: number): void { /* ... */ }
```

---

## Branded / Nominal Types

TypeScript uses structural typing — two objects with the same shape are interchangeable. Branded types add a unique "brand" to prevent mixing semantically different values.

### Without Branding: Silent Bugs

```typescript
type UserId = string;
type PostId = string;

function getPost(userId: UserId, postId: PostId): Post { /* ... */ }

const userId: UserId = 'user-123';
const postId: PostId = 'post-456';

getPost(postId, userId); // ✅ TypeScript allows this — arguments are swapped silently!
```

### With Branded Types: Compile-Time Safety

```typescript
// ✅ Brand pattern using unique symbol
declare const _brand: unique symbol;
type Brand<T, TBrand> = T & { readonly [_brand]: TBrand };

type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// Constructor functions validate and brand the value
function createUserId(id: string): UserId {
  if (!id.startsWith('user-')) throw new Error('Invalid UserId');
  return id as UserId;
}

function createPostId(id: string): PostId {
  if (!id.startsWith('post-')) throw new Error('Invalid PostId');
  return id as PostId;
}

function getPost(userId: UserId, postId: PostId): void { /* ... */ }

const userId = createUserId('user-123');
const postId = createPostId('post-456');

getPost(postId, userId); // ✅ Error: PostId not assignable to UserId
getPost(userId, postId); // ✅ OK
```

### Branded Numeric Types

```typescript
type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const price = 9.99 as USD;
const tax   = 0.99 as USD;
const rate  = 1.08 as EUR; // Different currency

addUSD(price, tax);  // ✅ OK
addUSD(price, rate); // ✅ Error: EUR not assignable to USD
```

---

## Exhaustive Switch with `never`

Use `never` to make the compiler verify that a switch statement handles all cases. Adding a new case to a union type without handling it becomes a compile error.

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

// ✅ Exhaustive switch — compiler error if a new Shape is added
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // If all cases are handled, shape is never here
      // If a new kind is added, this becomes an error
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${JSON.stringify(_exhaustive)}`);
  }
}

// ❌ Adding 'rectangle' without updating the switch → compile error on _exhaustive line
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }; // ← new
```

### assertNever Helper

```typescript
// ✅ Reusable helper for exhaustive checks across the codebase
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled value: ${JSON.stringify(value)}`);
}

switch (shape.kind) {
  case 'circle': return Math.PI * shape.radius ** 2;
  case 'square': return shape.side ** 2;
  default:       return assertNever(shape); // Compile error if case is missing
}
```

---

## `using` / `await using` (TS 5.2)

The `using` keyword implements the [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) proposal. Resources declared with `using` are automatically disposed when the scope exits — even on error.

### Synchronous Resource Disposal

```typescript
// ✅ Object with [Symbol.dispose] is auto-disposed at end of scope
function getConnection() {
  const conn = openDatabaseConnection();

  return {
    query: conn.query.bind(conn),
    [Symbol.dispose]() { conn.close(); },
  };
}

function processData() {
  using conn = getConnection(); // conn.close() called when scope exits
  const data = conn.query('SELECT * FROM users');
  return data;
  // conn[Symbol.dispose]() called here automatically (even on throw)
}
```

### Asynchronous Resource Disposal

```typescript
// ✅ await using for async cleanup (file handles, streams)
async function writeReport() {
  await using file = await openFile('report.txt', 'w');
  // [Symbol.asyncDispose] called with await when scope exits

  await file.write('Report content...');
  // file is closed automatically, even if write throws
}
```

### Built-in Resource Types

TypeScript 5.2+ adds `[Symbol.dispose]` to several built-in APIs:

```typescript
// FileHandle (Node.js 20+)
await using fileHandle = await fs.promises.open('data.txt', 'r');

// DisposableStack for managing multiple resources
using stack = new DisposableStack();
const conn1 = stack.use(openConnection('db1'));
const conn2 = stack.use(openConnection('db2'));
// Both disposed on scope exit
```

---

## Const Type Parameters (TS 5.0)

The `const` modifier on type parameters infers the most specific literal type instead of widening to a general type.

### Without `const`: Type Is Widened

```typescript
function identity<T>(value: T): T { return value; }

const result = identity({ x: 10, y: 'hello' });
//    result: { x: number, y: string }  ← widened, not literal
```

### With `const`: Literal Types Preserved

```typescript
function identity<const T>(value: T): T { return value; }

const result = identity({ x: 10, y: 'hello' });
//    result: { x: 10, y: 'hello' }  ← literal types preserved

// Useful for creating type-safe builders and tuples
function createRoute<const T extends string>(path: T) {
  return { path, matcher: (url: string) => url.startsWith(path) };
}

const route = createRoute('/api/users');
//    route.path: '/api/users'  ← literal, not string
```

### Practical: Type-Safe Event Maps

```typescript
function createEventMap<const T extends Record<string, unknown>>(events: T): T {
  return events;
}

const events = createEventMap({
  click: (e: MouseEvent) => void 0,
  focus: (e: FocusEvent) => void 0,
});
// events.click is typed as (e: MouseEvent) => void — not widened to Function
```

---

## Common Pitfalls

**`NoInfer` requires TS 5.4:** Earlier versions can simulate it with `T & {}` but with less precision. Check `tsconfig.json` target and TypeScript version.

**Branded types require cast at creation:** The `as UserId` cast at the `createUserId` function is the only place where the type is unsound. Keep constructors narrow and validated.

**`using` is a Stage 3 proposal:** Requires `"lib": ["ES2022", "ESNext.Disposable"]` or `"target": "ESNext"` in `tsconfig.json`. Node.js 20+ supports `Symbol.dispose` natively.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "ESNext.Disposable"]
  }
}
```

**Const type parameters don't replace `as const`:** `as const` works on values at call sites; `const` type parameters work on the generic function definition. Both can be combined.

---

## Related Topics

- [generics-advanced.md](generics-advanced.md) — Generic constraints, conditional types, mapped types
- [type-guards.md](type-guards.md) — Type narrowing and discriminated unions
- [error-handling.md](error-handling.md) — Result types and `never` for error unions
- [config-patterns.md](config-patterns.md) — tsconfig settings for strict mode and lib targets
