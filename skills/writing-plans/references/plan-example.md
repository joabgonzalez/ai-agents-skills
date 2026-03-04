# Plan Example

Complete multi-batch plan for a User Registration API feature (9 tasks, Express + TypeScript + Postgres + Jest).

---

## Core Patterns

The example below demonstrates: granular 2-5 min tasks, precise file paths, TDD workflow, batch grouping, and checkpoint verification.

---

### Full Example: User Registration API

````markdown
# Feature: User Registration API

### Context

- **Goal**: Allow users to register with email/password
- **Stack**: Express + TypeScript + Postgres + Jest
- **Time estimate**: 27 minutes (9 tasks × 3 min avg)

### Batch 1: Foundation (9 min)

#### Task 1: Create User entity (2 min)

**File**: `src/entities/User.ts`

```typescript
export interface User {
  id: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
}
```

#### Task 2: Add password hashing utility (3 min)

**File**: `src/utils/crypto.ts`

```typescript
import bcrypt from "bcrypt";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

#### Task 3: Create UserRepository interface (4 min)

**File**: `src/repositories/UserRepository.ts`

```typescript
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, "id" | "createdAt">): Promise<User>;
}
```

**CHECKPOINT**: Batch 1

- Tests: User entity, crypto utils
- Verification: npm test -- entities/ utils/
- Expected: 5/5 passed

### Batch 2: API Layer (9 min)

#### Task 4: Define registration DTO (2 min)

**File**: `src/dtos/RegisterDTO.ts`

```typescript
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
```

#### Task 5: Implement registration endpoint (5 min)

**File**: `src/routes/auth.ts`

```typescript
router.post("/register", async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existing = await userRepo.findByEmail(data.email);
    if (existing) return res.status(409).json({ error: "Email exists" });

    const hashedPassword = await hashPassword(data.password);
    const user = await userRepo.create({
      email: data.email,
      password: hashedPassword,
    });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
});
```

#### Task 6: Write integration test (2 min)

**File**: `tests/auth.test.ts`

```typescript
test("POST /auth/register creates user", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({ email: "test@example.com", password: "password123" });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id");
  expect(res.body.email).toBe("test@example.com");
  expect(res.body).not.toHaveProperty("password");
});
```

**CHECKPOINT**: Batch 2

- Tests: Registration endpoint
- Verification: npm test -- auth.test.ts
- Expected: 8/8 passed

### Batch 3: Error Handling (9 min)

#### Task 7: Add duplicate email test (2 min)

#### Task 8: Add validation error test (2 min)

#### Task 9: Add error handler middleware (5 min)

**CHECKPOINT**: Batch 3 (Final)

- All tests passing
- Build succeeds
- Lint clean
````

---

## Related Topics

- See [README.md](README.md) for navigation guide
- [writing-plans SKILL.md](../SKILL.md) — Granular task and batch execution patterns
- [plan-execution](../../plan-execution/SKILL.md) — How to execute this plan after writing it
