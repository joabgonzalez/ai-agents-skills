---
name: writing-plans
description: "Executable plans with granular tasks and file precision. Trigger: When creating implementation plans with 2-5 minute tasks."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Writing Plans

Create executable, granular plans with precise file paths and 2-5 minute tasks.

## When to Use

- Creating implementation plans for features or fixes
- Breaking down complex tasks into executable steps
- Specifying exact file locations and line ranges
- Planning TDD (test-first) workflows

Don't use for:

- High-level planning or ideation (use brainstorming skill)
- Debugging plans (use systematic-debugging skill)

---

## Critical Patterns

### ✅ REQUIRED: Granular Tasks (2-5 minutes each)

Each task must be completable in 2-5 minutes. Break larger work into steps.

```markdown
# ❌ WRONG: Task too large

- Implement user authentication

# ✅ CORRECT: Granular tasks

1. Create User entity with email/password fields (2 min)
2. Add bcrypt password hashing utility (3 min)
3. Write UserRepository.findByEmail method (2 min)
4. Implement login endpoint POST /auth/login (4 min)
5. Add JWT token generation (3 min)
```

**Why 2-5 minutes?**

- Small enough to complete without interruption
- Large enough to deliver tangible value
- Easy to estimate and track progress
- Natural checkpoint boundaries

### ✅ REQUIRED: File Path Precision

Specify exact files and line ranges for changes.

```markdown
# ❌ WRONG: Vague location

- Update the user service

# ✅ CORRECT: Precise file path

- **File**: `src/services/UserService.ts:45-67`
- **Action**: Replace login method with async implementation
- **Lines affected**: 23 lines (delete 15, add 8)
```

**Benefits:**

- No ambiguity about where to work
- Easier to review changes
- Clear scope per task
- Prevents conflicts in team environments

### ✅ REQUIRED: TDD Workflow (Test First)

Write tests before implementation when possible.

```markdown
## Task 1: Write test for user registration

**File**: `tests/auth.test.ts`
**Test case**: POST /auth/register with valid data returns 201 + user object
**Expected behavior**:

- Returns status 201
- Response contains user object with id, email (no password)
- Database has new user record
- Password is hashed (not plain text)

## Task 2: Implement registration endpoint

**File**: `src/routes/auth.ts:12-30`
**Implementation**: Create POST /auth/register handler
**Verify**: Run test from Task 1 (should pass)
```

**TDD Benefits:**

- Clarifies requirements before coding
- Ensures testability
- Provides immediate feedback
- Documents expected behavior

### ✅ REQUIRED: Complete Code Examples

Provide full, runnable code examples (not pseudocode).

```typescript
// ✅ CORRECT: Complete, runnable example
export async function registerUser(data: RegisterDTO): Promise<User> {
  // Validate input
  const validation = RegisterSchema.safeParse(data);
  if (!validation.success) {
    throw new ValidationError(validation.error.format());
  }

  // Check existing user
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await userRepo.create({
    email: data.email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  return user;
}

// ❌ WRONG: Pseudocode
// function to register user
// check if exists
// hash password
// save to db
// return user
```

### ✅ REQUIRED: Batch Execution (3 tasks per batch)

Group tasks into batches of 3 for checkpoints.

```markdown
## Batch 1 (Checkpoint after task 3)

### Task 1: Create User entity (2 min)

**File**: `src/entities/User.ts`
[implementation]

### Task 2: Add password hashing utility (3 min)

**File**: `src/utils/crypto.ts`
[implementation]

### Task 3: Write UserRepository.findByEmail (2 min)

**File**: `src/repositories/UserRepository.ts:45-60`
[implementation]

**CHECKPOINT**: Batch 1 Complete

- **Verification**: npm test -- UserEntity.test.ts
- **Expected**: 8/8 tests passed ✅
- **Next**: Proceed to Batch 2

## Batch 2 (Checkpoint after task 6)

### Task 4: Implement login endpoint (4 min)

[implementation]

### Task 5: Add JWT token generation (3 min)

[implementation]

### Task 6: Write integration test for login (2 min)

[implementation]

**CHECKPOINT**: Batch 2 Complete

- **Verification**: npm test -- auth.test.ts
- **Expected**: 12/12 tests passed ✅
- **Next**: Proceed to Batch 3 (deployment)
```

**Batch Execution Benefits:**

- Regular verification points
- Easier to track progress (33%, 66%, 100%)
- Natural pause points for review
- Limits work-in-progress

---

## Decision Tree

```
Creating a plan?
  → Break into 2-5 min tasks
  → Specify file paths with line ranges
  → Provide complete code examples
  → Group into batches of 3

Complex feature (10+ tasks)?
  → Use brainstorming first to evaluate alternatives
  → Then use writing-plans for execution details

Need to debug existing code?
  → Use systematic-debugging (not this skill)

Need UI/UX planning?
  → Use interface-design (not this skill)

Plan has >20 tasks?
  → Consider splitting into multiple features
  → Or create phases: MVP → Enhancement → Polish
```

---

## Edge Cases

**Very small changes (<2 min)**: Group multiple small changes into single task. Example: "Update 3 import statements (2 min)".

**Very large features (50+ tasks)**: Break into phases with clear milestones. Each phase is separate plan.

**Refactoring (hard to estimate)**: Add time buffer. Mark as "3-5 min (refactoring)" to signal uncertainty.

**External dependencies (API, database)**: Separate setup tasks. Example: "Setup local Postgres (5 min, one-time)".

**Learning time**: For new technologies, add separate learning tasks. Example: "Read Zod docs - basic usage (10 min)".

---

## Checklist

- [ ] Each task is 2-5 minutes (not 10+ or <1 min)
- [ ] File paths specified with line ranges (file.ts:10-25)
- [ ] Code examples are complete and runnable (not pseudocode)
- [ ] TDD workflow used (test first when applicable)
- [ ] Tasks grouped into batches of 3 with checkpoints
- [ ] Verification steps defined for each batch
- [ ] Handoff clear (what agent/developer does next)
- [ ] Dependencies between tasks identified
- [ ] Blockers or risks documented

---

## Example

See [references/plan-example.md](references/plan-example.md) for a complete multi-batch plan example with a User Registration API feature (9 tasks across 3 batches, full TypeScript code, TDD workflow, and checkpoint verification).

---

## Resources

- [brainstorming](../brainstorming/SKILL.md) - High-level planning and alternatives
- [systematic-debugging](../systematic-debugging/SKILL.md) - Debugging workflow
- [code-conventions](../code-conventions/SKILL.md) - Code organization standards
- [verification-protocol](../verification-protocol/SKILL.md) - Evidence-based verification
- [plan-execution](../plan-execution/SKILL.md) - Executing plans with checkpoints
- [references/README.md](references/README.md) - Reference file navigation
- [references/plan-example.md](references/plan-example.md) - Complete plan example
