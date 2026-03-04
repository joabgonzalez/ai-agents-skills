---
name: code-review
description: "Two-stage code review: spec compliance then code quality. Trigger: When reviewing code for correctness and quality."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
  skills:
    - critical-partner
---

# Code Review

Two-stage code review: verify spec compliance FIRST, then assess code quality. Never reversed.

## When to Use

- Reviewing pull requests or code submissions
- Validating implementation against requirements
- Providing structured feedback on code
- Ensuring spec compliance before quality assessment

Don't use for:

- General critical feedback on prompts/decisions (use critical-partner)
- Debugging errors (use systematic-debugging)

---

## Critical Patterns

### ✅ REQUIRED: Two-Stage Review (NEVER Reversed)

**Stage 1: Spec Compliance** (MUST come first)

- Does code meet requirements?
- Are all acceptance criteria satisfied?
- Does behavior match specification?

**Stage 2: Code Quality** (ONLY after Stage 1 passes)

- Is code maintainable?
- Are best practices followed?
- Performance considerations?

```markdown
# ✅ CORRECT: Two-stage order

## Stage 1: Spec Compliance ✅
- ✅ POST /users creates user with email/password
- ✅ Returns 201 status with user object
- ✅ Email validation enforced
- ✅ Password hashed before storage
**Result**: Spec compliance PASSED

## Stage 2: Code Quality
- ⚠️ Password hashing uses deprecated bcrypt.hashSync (use async bcrypt.hash)
- ⚠️ No input sanitization for XSS prevention
- ✅ Error handling present
- ✅ TypeScript strict mode enabled

# ❌ WRONG: Quality feedback before spec check
"The code uses var instead of let" ← irrelevant if spec not met
```

**Why this order?**

- Spec = correctness (does it work?)
- Quality = maintainability (is it good?)
- No point reviewing quality if behavior is wrong
- Prevents wasting time on code that will be rewritten

### ✅ REQUIRED: File-by-File Analysis

Review each file separately with clear structure.

```markdown
## File: src/services/UserService.ts

### Spec Compliance
- ✅ Implements registerUser as specified
- ✅ Returns Promise<User>
- ❌ Missing validateEmail method (required in spec)
- ❌ Password strength check missing (spec requires 8+ chars)

**Result**: FAIL - Fix spec issues before quality review

---

## File: src/repositories/UserRepository.ts

### Spec Compliance
- ✅ All CRUD methods present
- ✅ Returns correct types

### Code Quality (reviewed AFTER spec passed)
- Line 23: Use const instead of let (value never reassigned)
- Line 45-50: Extract validation logic to separate function
- Line 67: Add error handling for unique constraint violation
```

**Benefits:**

- Clear scope per file
- Easy to navigate review
- Prevents context switching
- Enables parallel fixes

### ✅ REQUIRED: Evidence-Based Feedback

Provide line numbers and specific examples.

```markdown
# ❌ WRONG: Vague feedback
"Error handling could be better"

# ✅ CORRECT: Specific with evidence
**Line 34-38**: Error swallowed without logging or user feedback
```typescript
try {
  await updateUser(id, data);
} catch (error) {
  // Silent failure - user doesn't know what happened
}
```

**Fix**: Log error and provide user-friendly message

```typescript
try {
  await updateUser(id, data);
  return { success: true };
} catch (error) {
  console.error('Failed to update user:', error);
  return {
    success: false,
    error: 'Unable to update user. Please try again.',
  };
}
```

```

**Evidence includes:**
- Line numbers (file.ts:34-38)
- Code snippets (what's wrong)
- Suggested fix (how to improve)
- Rationale (why it matters)

### ❌ NEVER: Review Quality Before Spec

If spec is not met, STOP. Do not proceed to quality review.

```markdown
# ❌ WRONG: Reviewing quality when spec fails

## Spec Compliance
- ❌ Email validation missing (required)
- ❌ Password not hashed (critical security issue)
- ❌ Missing error handling for duplicate emails

## Code Quality ← SHOULD NOT EXIST
- Use const instead of let
- Add JSDoc comments
- Extract magic numbers to constants

# ✅ CORRECT: Stop after spec failure

## Spec Compliance
- ❌ Email validation missing (required in spec section 2.1)
- ❌ Password not hashed (critical security issue - spec section 3.2)
- ❌ Missing error handling for duplicate emails (spec section 2.3)

**Result**: STOP

**Action Required**: Fix all 3 spec compliance issues. Code quality review will follow after spec passes.

**Priority**:
1. CRITICAL: Hash passwords before storage (security)
2. HIGH: Add email validation (data integrity)
3. HIGH: Handle duplicate email errors (user experience)
```

---

## Decision Tree

```
Reviewing code?
  → Stage 1: Check spec compliance
    → Spec PASSED? → Proceed to Stage 2 (quality)
    → Spec FAILED? → STOP, provide spec feedback only

Reviewing a PR?
  → File-by-file analysis
  → Two-stage per file

Multiple files changed?
  → Review critical files first (core logic, security)
  → Then supporting files (tests, docs)

Need general critical feedback on approach?
  → Use critical-partner (not code-review)

Debugging an error in existing code?
  → Use systematic-debugging (not code-review)

Reviewing architectural decisions?
  → Use critical-partner or brainstorming
```

---

## Edge Cases

**Spec is ambiguous**: Flag ambiguity before review. Ask: "Spec says X, but could mean Y or Z. Which is correct?"

**Partial implementation**: Review completed parts only. Note: "Reviewed implemented features. Features X, Y not yet implemented."

**Breaking changes**: Check if intentional and documented. Flag unintentional breaks.

**Performance regressions**: If spec includes performance requirements, verify with benchmarks.

**Security issues**: Always flag security issues regardless of stage. Security > process.

---

## Checklist

- [ ] Stage 1 (spec compliance) completed BEFORE Stage 2
- [ ] If spec fails, quality review SKIPPED
- [ ] Each file reviewed separately
- [ ] Line numbers provided for all issues
- [ ] Evidence-based feedback (code snippets + fixes)
- [ ] Recommendations prioritized (critical → high → medium → low)
- [ ] Security issues flagged immediately
- [ ] Breaking changes identified
- [ ] Test coverage assessed (if applicable)

---

## Example

```markdown
# Code Review: User Registration Feature

## Summary
4 files reviewed — spec compliance PASS ✅, code quality PASS with 3 minor suggestions ⚠️

---

## File: src/services/UserService.ts

### Stage 1: Spec Compliance ✅

- ✅ registerUser accepts email/password (spec 2.1)
- ✅ Returns User object without password (spec 2.2)
- ✅ Email validation enforced (spec 2.3)
- ✅ Password hashed with bcrypt (spec 3.1)
- ✅ Duplicate email returns 409 error (spec 2.4)

**Result**: Spec compliance PASSED

### Stage 2: Code Quality

**Line 23-25**: Use async bcrypt.hash instead of deprecated hashSync
```typescript
// Current (deprecated)
const hashed = bcrypt.hashSync(password, 10);

// Recommended
const hashed = await bcrypt.hash(password, 10);
```

**Line 45**: Extract magic number to constant

```typescript
// Current
if (password.length < 8) throw new Error('Password too short');

// Recommended
const MIN_PASSWORD_LENGTH = 8;
if (password.length < MIN_PASSWORD_LENGTH) throw new ValidationError('Password too short');
```

**Line 67-70**: Add JSDoc for public method

```typescript
/**
 * Registers a new user with email and password
 * @param email - User email address (validated)
 * @param password - Plain text password (will be hashed)
 * @returns User object without password
 * @throws ConflictError if email already exists
 * @throws ValidationError if input invalid
 */
export async function registerUser(email: string, password: string): Promise<User>
```

---

## Overall Assessment

**Spec Compliance**: ✅ PASS (all requirements met)

**Code Quality**: ⚠️ PASS with minor improvements (3 non-blocking suggestions; production-ready as-is)

**Security**: ✅ No issues (passwords hashed, inputs validated, no sensitive data leaked)

**Recommendation**: ✅ APPROVE with suggestions

```

---

## Resources

- [critical-partner](../critical-partner/SKILL.md) - General critical feedback
- [code-conventions](../code-conventions/SKILL.md) - Code standards and organization
- [typescript](../typescript/SKILL.md) - Type safety review
- [systematic-debugging](../systematic-debugging/SKILL.md) - Debugging methodology
- [verification-protocol](../verification-protocol/SKILL.md) - Evidence-based verification
