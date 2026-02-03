# Advanced Generics

> Constraints, conditional types, mapped types, and advanced generic patterns

## When to Read This

- Creating reusable generic functions/components
- Working with conditional types
- Building mapped types
- Using infer keyword

---

## Generic Constraints

### ✅ Extends Constraint

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

## References

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
