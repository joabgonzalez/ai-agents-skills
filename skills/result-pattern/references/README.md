# Result Pattern References

This directory contains advanced Result pattern implementations including the basic Result<T> class, operation chaining with flatMap, React and Redux Toolkit integration, functional programming variants (Either<L,R> and Option<T>), and integration guidance with Clean Architecture and SOLID.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [advanced-patterns.md](advanced-patterns.md) | Basic Result<T> implementation, API endpoint integration, chaining with flatMap, React custom hook with Result, Redux Toolkit slice, Either<L,R>, Option<T>, Result + Clean Architecture, Result + SOLID, exceptions comparison | When implementing Result in a new context, chaining async operations, or choosing between Result and Either |

---

## Reading Strategy

### For adding Result to a backend API

1. Read main [SKILL.md](../SKILL.md) for Critical Patterns and trigger criteria
2. MUST read: [advanced-patterns.md](advanced-patterns.md) "Backend Examples" section for service layer and Express controller integration

### For chaining multiple fallible operations

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. MUST read: [advanced-patterns.md](advanced-patterns.md) "Chaining Operations" section for the flatMap-based pipeline pattern

### For choosing between Result, Either, or Option

1. Read main [SKILL.md](../SKILL.md)
2. CHECK: [advanced-patterns.md](advanced-patterns.md) "Either<L,R>" and "Option<T>" sections, and the Comparison with Exceptions table

---

## File Descriptions

### [advanced-patterns.md](advanced-patterns.md)

**Complete Result pattern reference from basic implementation through advanced functional variants and architecture integration**

- Basic Result<T>: ok/fail constructors, map for value transformation, flatMap for chaining fallible operations
- Backend API: UserService returning Result from service layer, Express controllers branching on isSuccess
- Operation chaining: processOrder pipeline using flatMap to thread results through validation, shipping, and email steps
- React custom hook: useCreateUser hook managing Result state with validation, fetch, and network error handling
- Redux Toolkit: userSlice with createResult state, createUser thunk using rejectWithValue
- Either<L,R>: typed error variant for field-level validation errors returning ValidationError[] on the left
- Option<T>: Some/None variant replacing nullable returns with type-safe presence checks
- Integration: Result + Clean Architecture use case returning Result<Order>; Result + SOLID SRP separating validation and duplication checks into distinct services
- Comparison table: exceptions vs Result across visibility, handling, performance, composability, and type safety

---

## Cross-Reference Map

- [advanced-patterns.md](advanced-patterns.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Example section
- Related skills: [Clean Architecture](../../clean-architecture/SKILL.md), [SOLID Principles](../../solid/SKILL.md)
