# Advanced Generics

> Constraints, conditional types, mapped types, and advanced generic patterns

## When to Read This

- Creating reusable generic functions/components
- Working with conditional types
- Building mapped types
- Using infer keyword
- Implementing factory patterns or recursive types
- Working with variadic tuple types
- Building generic React components and hooks

---

## Generic Constraints

### Extends Constraint

```typescript
// ❌ WRONG: Unconstrained generic
function getProperty<T>(obj: T, key: string) {
  return obj[key]; // Error: key not known to exist
}

// ✅ CORRECT: Constrained to objects with keys
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  return obj[key]; // Type-safe
}
```

### Multiple Generic Constraints

```typescript
// ✅ CORRECT: Intersection constraint — T must satisfy both interfaces
interface HasId {
  id: string;
}
interface HasTimestamp {
  createdAt: Date;
}

function logEntity<T extends HasId & HasTimestamp>(entity: T): void {
  console.log(entity.id, entity.createdAt);
}

// ❌ WRONG: Trying to use multiple extends clauses
// function logEntity<T extends HasId extends HasTimestamp>(entity: T) {}

// ✅ CORRECT: Conditional constraint via overloads
function process<T extends string>(val: T): string;
function process<T extends number>(val: T): number;
function process(val: string | number) {
  return val;
}
```

---

## Generic Factory Patterns

```typescript
// ✅ CORRECT: Typed factory function with constructor constraint
function create<T>(Ctor: new () => T): T {
  return new Ctor();
}

class Dog {
  bark() { return "woof"; }
}
const dog = create(Dog); // type: Dog

// ✅ CORRECT: Factory with constructor arguments
function createWith<T, A extends unknown[]>(
  Ctor: new (...args: A) => T,
  ...args: A
): T {
  return new Ctor(...args);
}

class User {
  constructor(public name: string, public age: number) {}
}
const user = createWith(User, "Alice", 30); // type: User

// ❌ WRONG: Losing type information with Function
function createBad(Ctor: Function): unknown {
  return new (Ctor as any)();
}

// ✅ CORRECT: Registry factory with mapped types
interface Registry {
  user: User;
  dog: Dog;
}

function createFromRegistry<K extends keyof Registry>(
  key: K,
): Registry[K] {
  const map: { [P in keyof Registry]: new () => Registry[P] } = {
    user: User as any,
    dog: Dog,
  };
  return new map[key]();
}

const u = createFromRegistry("user"); // type: User
```

---

## Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type Nums = ArrayElement<number[]>; // number
type Str = ArrayElement<string>; // never
```

---

## Distributive Conditional Types

```typescript
// Conditional types DISTRIBUTE over unions by default.
// Each union member is evaluated independently.

type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[]   (NOT (string | number)[])

// ✅ CORRECT: Prevent distribution by wrapping in tuple
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;

type Result2 = ToArrayNonDist<string | number>;
// (string | number)[]   — no distribution

// Practical example: exclude null/undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type Clean = NonNullable<string | null | undefined>;
// string — distributes, null and undefined become never

// ❌ WRONG: Expecting non-distributed behavior from bare conditional
type IsNever<T> = T extends never ? true : false;
type Oops = IsNever<never>; // never (not true! — distributes over empty union)

// ✅ CORRECT: Wrap to detect never
type IsNeverFixed<T> = [T] extends [never] ? true : false;
type Fixed = IsNeverFixed<never>; // true
```

---

## Infer Keyword

```typescript
// Extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract Promise type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Num = UnwrapPromise<Promise<number>>; // number
type Str = UnwrapPromise<string>; // string
```

---

## Recursive Types

```typescript
// ✅ CORRECT: Typed JSON value
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const config: JsonValue = {
  name: "app",
  port: 3000,
  features: ["auth", "logging"],
  db: { host: "localhost", ssl: true },
};

// ✅ CORRECT: DeepPartial — makes every nested property optional
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface Config {
  server: { host: string; port: number };
  db: { url: string; pool: { min: number; max: number } };
}

// All nested fields are optional
const partial: DeepPartial<Config> = {
  db: { pool: { max: 20 } },
};

// ✅ CORRECT: DeepReadonly — makes every nested property readonly
type DeepReadonly<T> = T extends primitive
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : { readonly [P in keyof T]: DeepReadonly<T[P]> };

type primitive = string | number | boolean | null | undefined;

// ❌ WRONG: Shallow Readonly misses nested mutation
interface State {
  user: { name: string; scores: number[] };
}

type ShallowRO = Readonly<State>;
// state.user is readonly but state.user.name is still mutable!

// ✅ CORRECT: DeepReadonly catches nested mutation
type DeepRO = DeepReadonly<State>;
// state.user.name and state.user.scores are all readonly

// ✅ CORRECT: Deep key paths (recursive template literals)
type DeepKeys<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: K | `${K}.${DeepKeys<T[K]>}`;
    }[keyof T & string]
  : never;

type ConfigKeys = DeepKeys<Config>;
// "server" | "server.host" | "server.port" | "db" | "db.url" | "db.pool" | ...
```

---

## Mapped Types

```typescript
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }
```

---

## Template Literal Types

```typescript
type HttpMethod = "GET" | "POST";
type Route = "/users" | "/posts";

type Endpoint = `${HttpMethod} ${Route}`;
// 'GET /users' | 'GET /posts' | 'POST /users' | 'POST /posts'
```

---

## Variadic Tuple Types

```typescript
// ✅ CORRECT: Typed concat
function concat<T extends unknown[], U extends unknown[]>(
  a: [...T],
  b: [...U],
): [...T, ...U] {
  return [...a, ...b];
}

const result = concat([1, "hello"] as const, [true, 42] as const);
// type: [1, "hello", true, 42]

// ✅ CORRECT: Typed head and tail
type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

type H = Head<[string, number, boolean]>; // string
type T = Tail<[string, number, boolean]>; // [number, boolean]

// ✅ CORRECT: Curry with variadic tuples
type Curry<Args extends unknown[], Ret> = Args extends [
  infer First,
  ...infer Rest,
]
  ? (arg: First) => Curry<Rest, Ret>
  : Ret;

declare function curry<A extends unknown[], R>(
  fn: (...args: A) => R,
): Curry<A, R>;

function add(a: number, b: number, c: number) {
  return a + b + c;
}

const curried = curry(add);
// type: (arg: number) => (arg: number) => (arg: number) => number
const six = curried(1)(2)(3); // 6

// ❌ WRONG: Losing tuple structure with spread
function bad<T extends unknown[]>(...args: T): unknown[] {
  return args; // Return type is unknown[], not T
}

// ✅ CORRECT: Preserving tuple structure
function good<T extends unknown[]>(...args: T): T {
  return args;
}

const preserved = good(1, "a", true); // type: [number, string, boolean]

// ✅ CORRECT: Rest elements in tuple types
type StrNumBools = [string, number, ...boolean[]];
type HasHead = [first: string, ...rest: number[]];
```

---

## Generic Component Patterns (React)

```typescript
// ✅ CORRECT: Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>(props: ListProps<T>) {
  const { items, renderItem, keyExtractor } = props;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — T is inferred as { id: string; name: string }
<List
  items={[{ id: "1", name: "Alice" }]}
  renderItem={(item) => <span>{item.name}</span>}
  keyExtractor={(item) => item.id}
/>;

// ✅ CORRECT: Generic hook — useList<T>
function useList<T>(initial: T[] = []) {
  const [items, setItems] = React.useState<T[]>(initial);

  const add = React.useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const remove = React.useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => prev.filter((item) => !predicate(item)));
  }, []);

  return { items, add, remove } as const;
}

// Usage — T is inferred as { id: number; label: string }
const { items, add, remove } = useList([{ id: 1, label: "Todo" }]);
add({ id: 2, label: "New" }); // OK
// add({ wrong: true });       // Error

// ✅ CORRECT: Generic component with forwardRef
interface InputProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
}

// Use a wrapper pattern since forwardRef does not preserve generics
function GenericInput<T extends string | number>(
  props: InputProps<T> & { ref?: React.Ref<HTMLInputElement> },
) {
  return <input value={props.value} onChange={(e) => props.onChange(e.target.value as T)} ref={props.ref} />;
}

// ❌ WRONG: Inline generic lost in JSX
// <List<User> items={users} /> — only works with tsx when the parser can distinguish from JSX
// function identity<T>(x: T) {} — ambiguous in .tsx files

// ✅ CORRECT: Add trailing comma in .tsx to disambiguate
// const identity = <T,>(x: T): T => x;
```

---

## Common Pitfalls

### Overusing Generics

```typescript
// ❌ WRONG: Generic adds no value — T is always string
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}

// ✅ CORRECT: Simple parameter type suffices
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ WRONG: Generic used once and not relating inputs to outputs
function log<T>(value: T): void {
  console.log(value);
}

// ✅ CORRECT: unknown is sufficient when T is not reused
function log(value: unknown): void {
  console.log(value);
}

// ✅ WHEN TO USE: Generic relates input to output
function identity<T>(value: T): T {
  return value;
}
```

### Generic Inference Failures

```typescript
// ❌ PROBLEM: TypeScript cannot infer T from both arguments independently
function merge<T>(defaults: T, overrides: T): T {
  return { ...defaults, ...overrides };
}

// This fails: { a: 1, b: 2 } and { b: 3, c: 4 } are different shapes
// merge({ a: 1, b: 2 }, { b: 3, c: 4 }); // Error

// ✅ FIX 1: Provide explicit type argument
merge<{ a?: number; b: number; c?: number }>(
  { a: 1, b: 2 },
  { b: 3, c: 4 },
);

// ✅ FIX 2: Use two type parameters
function merge2<T, U>(defaults: T, overrides: U): T & U {
  return { ...defaults, ...overrides };
}

// ❌ PROBLEM: Inference fails with callbacks in certain positions
declare function fetchData<T>(url: string, parser: (raw: unknown) => T): T;

// T inferred as unknown — parser doesn't help narrow
const data = fetchData("/api", (raw) => raw as string);

// ✅ FIX: Explicit type argument when inference is ambiguous
const data2 = fetchData<string>("/api", (raw) => raw as string);
```

### `extends` vs `=` in Generic Defaults

```typescript
// `extends` sets a CONSTRAINT — T must be assignable to this type
// `=` sets a DEFAULT — used when T is not provided

// ❌ WRONG: Confusing extends (constraint) with = (default)
interface Box<T extends string> {
  value: T;
}
// Box<number> — Error: number does not extend string
// Box — Error: T has no default

// ✅ CORRECT: Constraint with a default
interface Box<T extends string = string> {
  value: T;
}
const b1: Box = { value: "hello" };       // T defaults to string
const b2: Box<"hi"> = { value: "hi" };    // T is literal "hi"
// Box<number> — still Error: number does not extend string

// ✅ CORRECT: Default without constraint
interface Container<T = unknown> {
  value: T;
}
const c1: Container = { value: 42 };           // T defaults to unknown
const c2: Container<string> = { value: "ok" }; // T is string

// ❌ WRONG: Default that violates its own constraint
// interface Bad<T extends string = number> {} // Error: number not assignable to string
```

---

## References

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Variadic Tuple Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
