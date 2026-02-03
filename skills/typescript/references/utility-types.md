# TypeScript Utility Types

> Complete guide to 30+ built-in utility types for type transformations

## When to Read This

- Transforming existing types (making optional, readonly, etc.)
- Extracting or omitting type properties
- Working with function/constructor signatures
- Avoiding manual type definitions

---

## Partial<Type>

Makes all properties optional.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

function updateUser(id: number, updates: Partial<User>) {
  // Can pass any subset of properties
}

updateUser(1, { name: "John" }); // ✅
updateUser(1, { email: "john@example.com" }); // ✅
```

---

## Required<Type>

Makes all properties required.

```typescript
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}

// ✅ All properties required
type RequiredConfig = Required<Config>;
// { host: string; port: number; timeout: number; }

function validateConfig(config: Required<Config>) {
  // All fields must be present
}
```

---

## Readonly<Type>

Makes all properties readonly.

```typescript
interface Mutable {
  x: number;
  y: number;
}

type Immutable = Readonly<Mutable>;
// { readonly x: number; readonly y: number; }

const point: Immutable = { x: 1, y: 2 };
point.x = 3; // ❌ Error: Cannot assign to 'x' because it is readonly
```

---

## Record<Keys, Type>

Constructs object type with keys and value type.

```typescript
// ✅ Map string keys to numbers
type Scores = Record<string, number>;
const scores: Scores = { math: 95, english: 87 };

// ✅ Map specific keys to User
type UserRoles = Record<"admin" | "user" | "guest", User>;
const roles: UserRoles = {
  admin: { id: 1, name: "Admin", email: "admin@example.com" },
  user: { id: 2, name: "User", email: "user@example.com" },
  guest: { id: 3, name: "Guest", email: "guest@example.com" },
};
```

---

## Pick<Type, Keys>

Creates type by picking specific properties.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// ✅ Pick only public fields
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string; }

function displayUser(user: PublicUser) {
  // Only has id, name, email (no password)
}
```

---

## Omit<Type, Keys>

Creates type by omitting specific properties.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// ✅ Omit sensitive fields
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; }

type UserForm = Omit<User, "id" | "createdAt">;
// For creating new users (no id yet)
```

---

## Exclude<UnionType, ExcludedMembers>

Excludes types from union.

```typescript
type AllowedTypes = string | number | boolean | null;

// ✅ Exclude null
type NonNullableTypes = Exclude<AllowedTypes, null>;
// string | number | boolean

type Status = "pending" | "approved" | "rejected" | "cancelled";

// ✅ Exclude terminal states
type ActiveStatus = Exclude<Status, "approved" | "rejected">;
// 'pending' | 'cancelled'
```

---

## Extract<Type, Union>

Extracts types assignable to union.

```typescript
type AllTypes = string | number | boolean | (() => void);

// ✅ Extract only functions
type FunctionTypes = Extract<AllTypes, Function>;
// () => void

type Status = "idle" | "loading" | "success" | "error";

// ✅ Extract error states
type ErrorStates = Extract<Status, "error">;
// 'error'
```

---

## NonNullable<Type>

Excludes null and undefined.

```typescript
type MaybeString = string | null | undefined;

// ✅ Remove null and undefined
type DefiniteString = NonNullable<MaybeString>;
// string

function process(value: NonNullable<MaybeString>) {
  console.log(value.toUpperCase()); // Safe: never null/undefined
}
```

---

## ReturnType<Type>

Extracts return type of function.

```typescript
function getUser() {
  return { id: 1, name: "John" };
}

// ✅ Extract return type
type User = ReturnType<typeof getUser>;
// { id: number; name: string; }

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : never;

async function fetchData() {
  return { data: [1, 2, 3] };
}

type Data = AsyncReturnType<typeof fetchData>;
// { data: number[]; }
```

---

## Parameters<Type>

Extracts parameter types of function.

```typescript
function createUser(name: string, age: number, email?: string) {
  // ...
}

// ✅ Extract parameter types as tuple
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, email?: string | undefined]

function wrapper(...args: Parameters<typeof createUser>) {
  return createUser(...args); // Type-safe forwarding
}
```

---

## ConstructorParameters<Type>

Extracts constructor parameter types.

```typescript
class User {
  constructor(
    public name: string,
    public age: number,
  ) {}
}

// ✅ Extract constructor params
type UserParams = ConstructorParameters<typeof User>;
// [name: string, age: number]

function createUser(...args: ConstructorParameters<typeof User>) {
  return new User(...args);
}
```

---

## InstanceType<Type>

Extracts instance type of constructor.

```typescript
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// ✅ Extract instance type
type UserInstance = InstanceType<typeof User>;
// User

function processUser(user: InstanceType<typeof User>) {
  console.log(user.name);
}
```

---

## ThisParameterType<Type>

Extracts `this` parameter type.

```typescript
function toHex(this: Number) {
  return this.toString(16);
}

// ✅ Extract this type
type ThisType = ThisParameterType<typeof toHex>;
// Number
```

---

## OmitThisParameter<Type>

Removes `this` parameter from function type.

```typescript
function greet(this: User, message: string) {
  console.log(`${this.name}: ${message}`);
}

// ✅ Remove this parameter
type GreetFunction = OmitThisParameter<typeof greet>;
// (message: string) => void
```

---

## Awaited<Type>

Recursively unwraps Promise types.

```typescript
type NestedPromise = Promise<Promise<Promise<string>>>;

// ✅ Unwrap to string
type Unwrapped = Awaited<NestedPromise>;
// string

async function fetchData(): Promise<{ id: number; name: string }> {
  return { id: 1, name: "John" };
}

type Data = Awaited<ReturnType<typeof fetchData>>;
// { id: number; name: string; }
```

---

## Uppercase<StringType>

Converts string literal to uppercase.

```typescript
type Greeting = "hello";

// ✅ Convert to uppercase
type LoudGreeting = Uppercase<Greeting>;
// 'HELLO'

type HttpMethod = "get" | "post" | "put" | "delete";
type UpperMethod = Uppercase<HttpMethod>;
// 'GET' | 'POST' | 'PUT' | 'DELETE'
```

---

## Lowercase<StringType>

Converts string literal to lowercase.

```typescript
type LoudGreeting = "HELLO";

// ✅ Convert to lowercase
type Greeting = Lowercase<LoudGreeting>;
// 'hello'
```

---

## Capitalize<StringType>

Capitalizes first letter.

```typescript
type Name = "john";

// ✅ Capitalize
type CapitalizedName = Capitalize<Name>;
// 'John'
```

---

## Uncapitalize<StringType>

Uncapitalizes first letter.

```typescript
type Name = "John";

// ✅ Uncapitalize
type LowercaseName = Uncapitalize<Name>;
// 'john'
```

---

## Advanced Combinations

### ✅ Partial + Pick

```typescript
// Make specific properties optional
type PartialUpdate<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
}

// id is required, name and email are optional
type UserUpdate = PartialUpdate<User, "name" | "email">;
// { id: number; name?: string; email?: string; }
```

### ✅ Required + Pick

```typescript
// Make specific properties required
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// Require host and port
type ValidConfig = RequireFields<Config, "host" | "port">;
// { host: string; port: number; debug?: boolean; }
```

### ✅ Readonly + Partial

```typescript
// Immutable partial object
type ImmutablePartial<T> = Readonly<Partial<T>>;

type PartialReadonlyUser = ImmutablePartial<User>;
// { readonly id?: number; readonly name?: string; readonly email?: string; }
```

---

## Custom Utility Types

### ✅ DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
    pool: { min: number; max: number };
  };
}

// ✅ All nested properties optional
type PartialConfig = DeepPartial<NestedConfig>;
```

### ✅ DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### ✅ Mutable (Opposite of Readonly)

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

type MutableUser = Mutable<ReadonlyUser>;
// { id: number; name: string; }
```

### ✅ NonEmptyArray

```typescript
type NonEmptyArray<T> = [T, ...T[]];

function process(items: NonEmptyArray<number>) {
  console.log(items[0]); // Safe: always has at least one element
}

process([1, 2, 3]); // ✅
process([]); // ❌ Error
```

---

## References

- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
