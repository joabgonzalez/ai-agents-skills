# Type Guards

> Type narrowing, user-defined guards, and runtime validation

## When to Read This

- Runtime type checking
- Narrowing union types
- Validating unknown data
- Type-safe error handling
- Filtering arrays by type
- Parsing API responses safely

---

## Built-in Type Guards

### typeof

```typescript
// CORRECT: typeof narrows primitives
function process(value: string | number) {
  if (typeof value === "string") return value.toUpperCase(); // string
  return value.toFixed(2); // number
}
```

### instanceof

```typescript
// CORRECT: instanceof narrows class instances
class User { name: string; }
function greet(entity: User | string) {
  if (entity instanceof User) return `Hello, ${entity.name}`;
  return `Hello, ${entity}`;
}
```

### `in` Operator

```typescript
interface Dog { bark(): void; breed: string; }
interface Cat { meow(): void; indoor: boolean; }

// CORRECT: "in" checks property existence and narrows
function handlePet(pet: Dog | Cat) {
  if ("bark" in pet) { pet.bark(); console.log(pet.breed); } // Dog
  else { pet.meow(); console.log(pet.indoor); }              // Cat
}

// CORRECT: "in" on unknown objects after null check
function hasName(obj: unknown): obj is { name: string } {
  return typeof obj === "object" && obj !== null
    && "name" in obj && typeof (obj as any).name === "string";
}
```

```typescript
// WRONG: "in" with a union that includes primitives
function broken(value: string | Dog) {
  if ("bark" in value) { /* value might be a string at runtime */ }
}

// CORRECT: guard primitives first, then use "in"
function fixed(value: string | Dog) {
  if (typeof value === "string") return value.toUpperCase();
  if ("bark" in value) value.bark(); // Dog
}
```

---

## User-Defined Type Guards

```typescript
interface User { type: "user"; name: string; }
interface Admin { type: "admin"; name: string; permissions: string[]; }

// CORRECT: type predicate
function isAdmin(entity: User | Admin): entity is Admin {
  return entity.type === "admin";
}
function process(entity: User | Admin) {
  if (isAdmin(entity)) console.log(entity.permissions); // Admin
  else console.log(entity.name);                        // User
}
```

---

## Discriminated Unions

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };
function handle<T>(result: Result<T>) {
  if (result.success) console.log(result.data);  // T
  else console.log(result.error);                 // string
}
```

---

## Assertion Functions

```typescript
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg || "Assertion failed");
}
function processUser(user: unknown) {
  assert(typeof user === "object" && user !== null);
  assert("name" in user && typeof user.name === "string");
  console.log(user.name.toUpperCase()); // { name: string }
}
```

---

## Array Type Guards

```typescript
// CORRECT: Array.isArray narrows to any[]
function handleInput(value: string | string[]) {
  if (Array.isArray(value)) return value.join(", "); // string[]
  return value; // string
}
```

```typescript
// WRONG: .filter(Boolean) does not narrow types
const mixed: (string | null | undefined)[] = ["a", null, "b", undefined];
const bad = mixed.filter(Boolean); // still (string | null | undefined)[]

// CORRECT: type predicate in the filter callback
const good = mixed.filter((v): v is string => v != null); // string[]
```

```typescript
// CORRECT: filter a discriminated union to one variant
type Event = { kind: "click"; x: number } | { kind: "keypress"; key: string };
const events: Event[] = [{ kind: "click", x: 10 }, { kind: "keypress", key: "Enter" }];
const clicks = events.filter(
  (e): e is Extract<Event, { kind: "click" }> => e.kind === "click"
); // { kind: "click"; x: number }[]
```

---

## Nullish Guards

### Explicit Null / Undefined Checks

```typescript
// CORRECT: != null eliminates both null and undefined
function greet(name: string | null | undefined) {
  if (name != null) return name.toUpperCase(); // string
  return "Anonymous";
}
```

### Optional Chaining and Nullish Coalescing

```typescript
interface Config { db?: { host?: string; port?: number } }

// CORRECT: ?. short-circuits to undefined; ?? provides a default
function getHost(config: Config): string {
  return config.db?.host ?? "localhost";
}
```

```typescript
// WRONG: || treats 0 and "" as falsy
function broken(size: number | null): number {
  return size || 16; // 0 becomes 16 -- unintended
}
// CORRECT: ?? only triggers on null | undefined
function fixed(size: number | null): number {
  return size ?? 16; // 0 stays 0
}
```

---

## Generic Type Guard Factory

```typescript
// CORRECT: reusable guard factory for discriminated unions
function isType<T extends { kind: string }, K extends T["kind"]>(
  kind: K
): (value: T) => value is Extract<T, { kind: K }> {
  return (value): value is Extract<T, { kind: K }> => value.kind === kind;
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

const isCircle = isType<Shape, "circle">("circle");
const isRect   = isType<Shape, "rect">("rect");

function area(shape: Shape): number {
  if (isCircle(shape)) return Math.PI * shape.radius ** 2;
  if (isRect(shape))   return shape.width * shape.height;
  return 0.5 * shape.base * shape.height; // triangle
}
```

```typescript
// CORRECT: generic property-existence guard for unknown data
function hasProp<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}
function example(data: unknown) {
  if (hasProp(data, "id") && typeof data.id === "number") {
    console.log(data.id.toFixed(2)); // number
  }
}
```

---

## Validating `unknown` at API Boundaries

### Fetch Responses

```typescript
interface ApiUser { id: number; name: string; email: string; }

// CORRECT: validate every field from unknown
function isApiUser(data: unknown): data is ApiUser {
  return typeof data === "object" && data !== null
    && "id"    in data && typeof (data as any).id    === "number"
    && "name"  in data && typeof (data as any).name  === "string"
    && "email" in data && typeof (data as any).email === "string";
}

async function fetchUser(url: string): Promise<ApiUser> {
  const json: unknown = await (await fetch(url)).json();
  if (!isApiUser(json)) throw new Error("Invalid API response");
  return json; // ApiUser
}
```

### JSON.parse

```typescript
// WRONG: trusting JSON.parse with a cast -- no runtime safety
function broken(raw: string) {
  const config = JSON.parse(raw) as { port: number };
  console.log(config.port.toFixed(2)); // may crash
}

// CORRECT: treat result as unknown, validate, then use
function parseConfig(raw: string): { port: number; debug: boolean } {
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== "object" || parsed === null
    || !("port"  in parsed) || typeof (parsed as any).port  !== "number"
    || !("debug" in parsed) || typeof (parsed as any).debug !== "boolean"
  ) throw new Error("Invalid config JSON");
  return parsed as { port: number; debug: boolean };
}
```

---

## Combining Multiple Guards

```typescript
interface Dog { kind: "dog"; breed: string; }
interface Cat { kind: "cat"; indoor: boolean; }
type Pet = Dog | Cat;

// CORRECT: chain nullish + discriminant + property guards
function describe(pet: Pet | null | undefined): string {
  if (pet == null) return "No pet";
  if (pet.kind === "dog" && pet.breed === "Labrador") return "Good boy, Lab!";
  if (pet.kind === "cat" && pet.indoor) return "Indoor cat";
  return "Some pet";
}
```

```typescript
// CORRECT: compose small guards for readable pipelines
function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}
function isString(value: unknown): value is string {
  return typeof value === "string";
}

const raw: (string | null | number)[] = ["a", null, 42, "b"];
const strings = raw.filter(isNonNull).filter(isString); // string[]
```

---

## Common Pitfalls

### Type Predicates Lying

```typescript
// WRONG: predicate says "is string" but check is wrong
function isString(value: unknown): value is string {
  return typeof value === "number"; // lying to the compiler
}
const val: unknown = 42;
if (isString(val)) {
  val.toUpperCase(); // runtime crash -- val is actually a number
}
```

Type predicates are unchecked promises to the compiler. If the runtime
logic does not match the declared return type, narrowing will be wrong.
Always ensure the body validates exactly what the predicate claims.

### `typeof null === 'object'` Trap

```typescript
// WRONG: forgetting typeof null is "object"
function isObject(value: unknown): value is object {
  return typeof value === "object"; // null passes
}
isObject(null); // true

// CORRECT: always exclude null
function isObjectSafe(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
isObjectSafe(null); // false
```

### Assertion Functions vs Type Predicates

Use **type predicates** (`x is T`) when callers need a boolean for
branching -- the function returns `true`/`false` and the caller decides.

Use **assertion functions** (`asserts x is T`) when invalid data should
be an immediate error -- the function throws on failure and narrows on
success with no `if` needed by the caller.

```typescript
// Type predicate -- caller handles both paths
function isUser(d: unknown): d is { name: string } {
  return typeof d === "object" && d !== null && "name" in d;
}
if (isUser(data)) { /* use data.name */ }
else { /* handle non-user */ }

// Assertion function -- fail fast, no branching
function assertUser(d: unknown): asserts d is { name: string } {
  if (typeof d !== "object" || d === null || !("name" in d))
    throw new TypeError("Expected a User");
}
assertUser(data);
console.log(data.name); // narrowed, or already threw
```

Rule of thumb: prefer **predicates** in library code where the caller
should handle both paths; prefer **assertions** in application code
where bad data means "stop everything."

---

## References

- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Assertion Functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)
- [The `in` Operator Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing)
- [Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
