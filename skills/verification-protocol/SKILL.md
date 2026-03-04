---
name: verification-protocol
description: "Evidence-based verification with gate function. Trigger: When verifying task completion or validating claims."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Verification Protocol

Iron law: "Evidence before claims." Gate function ensures verification happens before marking tasks complete.

## When to Use

- Verifying task completion
- Validating implementation against requirements
- Confirming tests pass before claiming success
- Ensuring evidence exists before assertions

Don't use for:

- Code review (use code-review skill)
- Debugging (use systematic-debugging skill)

---

## Critical Patterns

### ✅ REQUIRED: Iron Law (Evidence Before Claims)

NEVER claim completion without verification evidence.

```markdown
# ❌ WRONG: Claim without evidence
✅ Task 1: User registration implemented

# ✅ CORRECT: Evidence before claim
## Task 1: User registration

**Verification**:
- Ran: `npm test -- auth.test.ts`
- Result: 5/5 tests passed
- Output: "Tests: 5 passed, 5 total"
- Tested scenarios:
  - Valid email/password → 201 + user object
  - Duplicate email → 409 error
  - Invalid email → 400 error
  - Weak password → 400 error
  - Missing fields → 400 error

**Evidence**: All tests green ✅

**Claim**: ✅ User registration implemented and verified
```

**Why evidence first?**

- Prevents false positives (claiming done when it's not)
- Creates audit trail
- Builds confidence in completion
- Enables independent verification

### ✅ REQUIRED: Gate Function (5 Steps)

Every verification follows this sequence. NEVER skip steps.

**1. IDENTIFY** what to verify
**2. RUN** the verification (test, build, manual check)
**3. READ** the output
**4. VERIFY** result matches expectation
**5. CLAIM** completion (only if step 4 passed)

```markdown
## Verification: Build succeeds

1. **IDENTIFY**: TypeScript compilation must succeed with 0 errors
2. **RUN**: `npm run build`
3. **READ**:
   ```

   > tsc --project tsconfig.json

   Successfully compiled TypeScript files
   Time: 2.3s

   ```
4. **VERIFY**: ✅ Build succeeded
   - 0 errors
   - 0 warnings
   - dist/ folder created with .js files
5. **CLAIM**: ✅ Build verification passed

---

## Verification: Tests pass

1. **IDENTIFY**: All unit tests for UserService must pass
2. **RUN**: `npm test -- UserService.test.ts`
3. **READ**:
   ```

   PASS  tests/UserService.test.ts
     UserService
       ✓ registerUser creates user (45ms)
       ✓ registerUser throws on duplicate email (23ms)
       ✓ validateEmail accepts valid emails (5ms)
       ✓ validateEmail rejects invalid emails (4ms)
       ✓ hashPassword returns different hash each time (67ms)

   Tests: 5 passed, 5 total
   Time: 1.2s

   ```
4. **VERIFY**: ✅ All tests green
   - 5/5 passed
   - No warnings or errors
   - All assertions satisfied
5. **CLAIM**: ✅ UserService tests passing
```

### ✅ REQUIRED: Verification Checklist

Each task has explicit verification steps.

```markdown
## Task: Implement login endpoint

**Implementation**: [code here]

**Verification Checklist**:

- [ ] 1. IDENTIFY: POST /auth/login must accept email/password and return JWT
- [ ] 2. RUN: `curl -X POST http://localhost:3000/auth/login -d '{"email":"test@example.com","password":"pass123"}'`
- [ ] 3. READ: Response body and status code
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "123", "email": "test@example.com" }
  }
  ```

- [ ] 4. VERIFY:
  - ✅ Status 200
  - ✅ Token is valid JWT
  - ✅ Token payload contains user ID
  - ✅ Password not in response
- [ ] 5. CLAIM: ✅ Login endpoint verified

```

### ❌ NEVER: Skip Verification Steps

Skipping steps leads to undetected failures.

```markdown
# ❌ WRONG: Skipping VERIFY step
1. IDENTIFY: Tests must pass
2. RUN: npm test
3. READ: [didn't actually read output]
5. CLAIM: Tests passing ✅ ← DANGEROUS (step 4 skipped!)

# ✅ CORRECT: All 5 steps executed
1. IDENTIFY: Tests must pass
2. RUN: npm test
3. READ: Output shows "12 passed, 2 failed"
   - Failed: UserService.login() throws on invalid password
   - Failed: UserService.login() returns null on non-existent email
4. VERIFY: ❌ 2 tests failing
5. CLAIM: ❌ CANNOT claim completion - fix failing tests first

**Action**: Investigate failures, fix issues, re-run verification
```

### ❌ NEVER: Assume Without Evidence

```markdown
# ❌ WRONG: Assuming success
✅ Tests passing (assumed - didn't run)
✅ Build succeeds (assumed - didn't verify)
✅ Lint clean (assumed - didn't check)

# ✅ CORRECT: Evidence for each claim
- Tests: ran npm test → 25/25 passed ✅
- Build: ran npm run build → dist/ created ✅
- Lint: ran npm run lint → 0 errors ✅
```

---

## Decision Tree

```
Task completed?
  → Run gate function (IDENTIFY → RUN → READ → VERIFY → CLAIM)
  → Verification passed? → Mark complete
  → Verification failed? → DO NOT mark complete, fix issues

Making a claim?
  → Evidence exists? → Provide evidence + claim
  → No evidence? → Run verification first

Multiple verification points?
  → Create checklist with all 5 steps per item
  → Verify each item independently

Verification blocked (environment issue)?
  → Document blocker
  → Alternative verification method?
  → Wait for blocker resolution
```

---

## Edge Cases

**Flaky tests**: If fails intermittently, run 3 times. If passes 3/3, consider stable. If fails 1+/3, investigate root cause.

**Slow verification** (>5 min): Note duration. Example: "Ran E2E suite (8 min) → 12/12 passed ✅".

**Manual verification**: When automation unavailable, document manual steps explicitly.

```markdown
1. IDENTIFY: Registration form accepts valid input
2. RUN: Manually open http://localhost:3000/register
3. READ: Form fields visible (email, password, confirm password)
4. VERIFY (manual):
   - Entered: test@example.com, password123
   - Clicked "Register"
   - Result: Redirected to /dashboard with success message
5. CLAIM: ✅ Registration form verified manually
```

**Partial verification**: When full verification blocked, verify what's possible.

```markdown
## Task: Deploy to staging

1. IDENTIFY: App must run on staging server
2. RUN: `ssh staging "pm2 start app"`
3. READ: "Process started"
4. VERIFY: ⚠️ PARTIAL
   - ✅ App started successfully
   - ❌ BLOCKED: Cannot verify public URL (DNS propagation pending)
5. CLAIM: ⚠️ PARTIAL - App deployed, public verification pending DNS
```

---

## Checklist

- [ ] Every claim has evidence
- [ ] Gate function 5 steps followed (IDENTIFY → RUN → READ → VERIFY → CLAIM)
- [ ] Verification output captured (not assumed)
- [ ] Failed verifications prevent completion claims
- [ ] Checklist provided for multi-step verification
- [ ] Blockers documented if verification cannot complete
- [ ] Evidence is reproducible (commands + outputs provided)

---

## Example

```markdown
# Feature Verification: User Authentication

## Task 1: Registration endpoint

### Verification

1. **IDENTIFY**: POST /auth/register must create user and return 201
2. **RUN**: `npm test -- auth-register.test.ts`
3. **READ**:
   ```

   PASS tests/auth-register.test.ts
     POST /auth/register
       ✓ creates user with valid data (45ms)
       ✓ returns 201 status (12ms)
       ✓ returns user without password (8ms)
       ✓ rejects duplicate email with 409 (23ms)
       ✓ validates email format (7ms)
       ✓ enforces min password length (9ms)

   Tests: 6 passed, 6 total

   ```
4. **VERIFY**: ✅ All tests passed
5. **CLAIM**: ✅ Registration endpoint verified

---

## Integration Verification

1. **IDENTIFY**: Full auth flow must work (register → login)
2. **RUN**: `npm test -- auth-integration.test.ts`
3. **READ**:
   ```

   PASS tests/auth-integration.test.ts
     Authentication flow
       ✓ can register and immediately login (156ms)
       ✓ login fails before registration (45ms)

   Tests: 2 passed, 2 total

   ```
4. **VERIFY**: ✅ Integration tests passed
5. **CLAIM**: ✅ Full auth flow verified

```

---

## Resources

- [code-review](../code-review/SKILL.md) - Reviewing code quality
- [systematic-debugging](../systematic-debugging/SKILL.md) - Debugging when verification fails
- [writing-plans](../writing-plans/SKILL.md) - Planning verification steps
- [plan-execution](../plan-execution/SKILL.md) - Executing with checkpoints
