---
name: systematic-debugging
description: "Root cause analysis and systematic error investigation. Trigger: When debugging errors, unexpected behavior, or test failures."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Systematic Debugging

Debugging: reproduce, isolate, diagnose, fix, verify. Replaces ad-hoc "try random things" with systematic root cause analysis.

## When to Use

- Investigating bugs or unexpected behavior
- Test failures with unclear causes
- Runtime errors (crashes, exceptions, wrong output)
- Performance issues (slow, memory leaks)
- User reports "it doesn't work"

Don't use for:

- Writing new code (use technology-specific skills)
- Code review (use critical-partner)
- Planning (use brainstorming)

---

## Critical Patterns

### ✅ REQUIRED: Reproduce First

Never guess at causes. Reproduce the bug reliably before investigating.

```markdown
## Bug Reproduction

**Reported behavior:** [What user sees]
**Expected behavior:** [What should happen]
**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3 — bug occurs]

**Reproducible?** Yes/No/Intermittent
**Environment:** [OS, browser, Node version, etc.]
```

If bug is intermittent: look for race conditions, timing issues, or state-dependent behavior.

### ✅ REQUIRED: Read the Error Message Completely

```typescript
// ❌ WRONG: "I got an error" (ignoring the message)
// TypeError: Cannot read properties of undefined (reading 'map')
// → This tells you EXACTLY what's wrong: something is undefined

// ✅ CORRECT: Parse the error message
// 1. Error type: TypeError (type-related, not logic)
// 2. What: Cannot read properties of undefined
// 3. Specifically: reading 'map'
// 4. Therefore: the variable before .map() is undefined
// 5. Question: WHY is it undefined? (check data flow)
```

### ✅ REQUIRED: Isolate the Problem

Narrow down where the bug lives using binary search.

```markdown
## Isolation Strategy

1. **Which layer?** UI / API / Database / External service
2. **Which file?** Add console.log at entry/exit points
3. **Which function?** Step through with debugger
4. **Which line?** Narrow to exact statement
5. **Which value?** Log inputs and outputs

**Binary search**: If 10 possible causes, test the middle one first.
If it passes → bug is in the second half. If it fails → first half.
Repeat until isolated.
```

### ✅ REQUIRED: Check Assumptions ("Excuse vs Reality")

Common debugging traps — what developers assume vs what's actually true.

| Developer Says | Reality Check |
|---------------|---------------|
| "The data is correct" | Log the actual data. Is it what you expect? |
| "This function is being called" | Add a log. Is it really being called? With correct args? |
| "The API returns the right data" | Check the actual response. Status code? Body? Headers? |
| "Nothing changed" | Check git diff. Something always changed |
| "It works on my machine" | Check environment differences (versions, config, data) |
| "The type is correct" | Log `typeof` and actual value. TypeScript types are compile-time only |
| "The state is updated" | State updates are async in React. Log in useEffect, not after setState |

### ✅ REQUIRED: Fix and Verify

After finding root cause, fix it and verify the fix works.

```markdown
## Fix Verification

**Root cause:** [One sentence explaining why the bug occurred]
**Fix:** [What was changed and why]
**Verification:**
- [ ] Original reproduction steps no longer trigger the bug
- [ ] Related functionality still works (regression check)
- [ ] Test added to prevent recurrence
- [ ] Edge cases considered
```

### ❌ NEVER: Apply Random Fixes

```typescript
// ❌ WRONG: "Let me try adding a null check everywhere"
if (data) { if (data.items) { if (data.items.length) { /* ... */ } } }

// ✅ CORRECT: Understand WHY data is undefined
// Question: Where should data come from?
// Answer: API call in useEffect
// Investigation: Is the API call failing? Is state not updating?
// Root cause: API call has wrong endpoint
// Fix: Correct the endpoint (don't add defensive null checks)
```

---

## Decision Tree

```
Error message present?
  → Read it completely. Parse type, what, and where.
  → See references/common-mistakes.md for common error patterns

No error, wrong behavior?
  → Compare expected vs actual output
  → Log intermediate values to find where divergence starts

Intermittent bug?
  → Race condition? (async operations, event ordering)
  → State-dependent? (different starting conditions)
  → Environment-dependent? (OS, browser, data)

Performance issue?
  → Profile first (don't guess)
  → Measure before and after any change

After finding root cause?
  → Fix the root cause, not the symptom
  → Add test to prevent recurrence
  → Document for team knowledge
```

---

## Example

Debugging "user can't log in" using the systematic approach.

```markdown
## Bug Reproduction
**Reported behavior:** User enters correct credentials → "Invalid password" error
**Expected behavior:** User is logged in and redirected to dashboard
**Steps to reproduce:**
1. Navigate to /login
2. Enter registered email + correct password → error shown
**Reproducible?** Yes, consistently
**Environment:** Production only; works in dev

## Isolation Strategy
Layer-by-layer:
1. UI layer OK — form submits the right values (verified via Network tab)
2. API layer: POST /auth/login returns 401 → narrows to backend

Add log in AuthService:
  console.log("stored hash:", user.passwordHash);
  console.log("compare result:", await bcrypt.compare(password, user.passwordHash));
  → compare result: false  ← bug confirmed here

## Check Assumptions
"The password hash is correct" → LOG IT
  Actual stored hash: "$2b$12$OLD_ROUNDS..." (bcrypt rounds mismatch)
  Dev DB: rounds=10; Prod DB: rounds=12 — hashes generated with different round counts

## Root Cause
Password hashes in production were generated during a bcrypt config change.
Existing users have hashes with old round count; new bcrypt.compare uses new count.

## Fix Verification
- [ ] Re-hash passwords on next successful login (progressive migration)
- [ ] Verify login works for affected accounts in staging
- [ ] Add test: login with hash from each supported round count
- [ ] Edge case: users who haven't logged in since migration get password reset email
```

---

## Edge Cases

**Third-party library bug**: Verify with minimal reproduction. Check GitHub issues. Consider workaround vs upgrade vs fork.

**Heisenbug (disappears when observed)**: Logging or debugger changes timing. Use non-intrusive logging or production telemetry.

**Works in dev, fails in prod**: Check env vars, API endpoints, CORS, minification, tree-shaking.

**Flaky tests**: Usually timing-dependent. Add proper waits, mock time, or use deterministic test data.

---

## Checklist

- [ ] Bug reproduced reliably with clear steps
- [ ] Error message read completely and parsed
- [ ] Problem isolated to specific layer/file/function
- [ ] Assumptions verified (not guessed)
- [ ] Root cause identified (not just symptom)
- [ ] Fix addresses root cause
- [ ] Regression test added
- [ ] Fix verified with original reproduction steps

---

## Resources

- [debugging-strategies.md](references/debugging-strategies.md) — Detailed debugging techniques per technology
- [common-mistakes.md](references/common-mistakes.md) — Common error patterns and their causes
- [critical-partner](../critical-partner/SKILL.md) — For reviewing fix quality
