---
name: plan-execution
description: "Batch execution with checkpoints. Trigger: When executing plans with multiple tasks."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
  skills:
    - writing-plans
    - verification-protocol
---

# Plan Execution

Execute plans in batches of 3 tasks with verification checkpoints. Ensures progress tracking and quality gates.

## When to Use

- Executing implementation plans
- Running multi-task workflows
- Tracking progress through checkpoints
- Coordinating with architect/lead reviews

Don't use for:
- Creating plans (use writing-plans skill)
- Debugging (use systematic-debugging skill)

---

## Critical Patterns

### ✅ REQUIRED: Batch Execution (3 Tasks per Batch)

Execute 3 tasks, then checkpoint before next batch.

```markdown
## Batch 1: Foundation

### Task 1: Create User entity (2 min)
**File**: `src/entities/User.ts`
**Implementation**:
```typescript
export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}
```
**Status**: ✅ Complete

---

### Task 2: Add password hashing utility (3 min)
**File**: `src/utils/crypto.ts`
**Implementation**:
```typescript
import bcrypt from 'bcrypt';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
```
**Status**: ✅ Complete

---

### Task 3: Implement findByEmail method (2 min)
**File**: `src/repositories/UserRepository.ts:45-60`
**Implementation**:
```typescript
async findByEmail(email: string): Promise<User | null> {
  return this.db.query('SELECT * FROM users WHERE email = $1', [email]);
}
```
**Status**: ✅ Complete

---

**CHECKPOINT**: Batch 1 Complete

**Verification**:
- Ran: `npm test -- UserEntity.test.ts crypto.test.ts UserRepository.test.ts`
- Result: 8/8 tests passed ✅
- Build: `npm run build` → Success ✅
- Lint: `npm run lint` → 0 errors ✅

**Decision**: ✅ Proceed to Batch 2

---

## Batch 2: API Layer
[next 3 tasks...]
```

**Why batch size 3?**
- Natural checkpoint rhythm (every 6-10 minutes)
- Small enough to catch issues early
- Large enough to make meaningful progress
- Easy to track percentage: 33%, 66%, 100%

### ✅ REQUIRED: Checkpoint After Each Batch

Verify quality before proceeding.

```markdown
**CHECKPOINT**: Batch 2 Complete

**Verification**:
1. Tests passing? ✅ Yes
   - Ran: `npm test`
   - Result: 15/15 passed

2. Build succeeds? ✅ Yes
   - Ran: `npm run build`
   - Result: Compiled successfully

3. Lint clean? ✅ Yes
   - Ran: `npm run lint`
   - Result: 0 errors, 0 warnings

4. Type check? ✅ Yes
   - Ran: `tsc --noEmit`
   - Result: No type errors

**Architect Review Needed?** No (straightforward CRUD implementation)

**Blockers?** None

**Decision**: ✅ Proceed to Batch 3
```

**Checkpoint serves as:**
- Quality gate (don't proceed if tests fail)
- Progress marker (33% → 66% → 100%)
- Review opportunity (pause for feedback)
- Rollback point (if issues found, revert to last checkpoint)

### ✅ REQUIRED: Progress Tracking

Track overall progress across batches.

```markdown
## Overall Progress

**Completed Batches**: 2/4 (50%)
**Completed Tasks**: 6/12 (50%)

**Current Batch**: Batch 3 (tasks 7-9)
**Remaining**: Batch 4 (tasks 10-12)

**Status**: ✅ On track
**Blockers**: None
**Risks**: None identified

**Timeline**:
- Batch 1: Completed 2:15 PM (7 min)
- Batch 2: Completed 2:28 PM (9 min)
- Batch 3: In progress (started 2:30 PM)
- Batch 4: Not started

**Estimated completion**: 3:00 PM (30 min total)
```

**Benefits**:
- Visibility into completion percentage
- Early detection of delays
- Data for future estimations
- Clear handoff points

### ✅ REQUIRED: Architect Review at Key Points

Escalate for review when needed.

```markdown
**CHECKPOINT**: Batch 2 Complete

**Architect Review Required**: ✅ YES

**Reason**:
- API versioning strategy decision needed
- Breaking change to /users endpoint (removing deprecated fields)
- Database migration affects existing data

**Context for Architect**:
- Current: GET /users returns 15 fields (4 deprecated)
- Proposed: Remove deprecated fields, introduce /v2/users
- Impact: 3 frontend apps using /users endpoint

**Questions for Architect**:
1. Preferred approach: /v2/users or query param ?version=2?
2. Deprecation timeline: immediate or gradual?
3. Migration strategy for existing clients?

**Blocking**: ⚠️ Cannot proceed to Batch 3 until architect approves approach

**Status**: Waiting for architect feedback...

---

[After architect feedback]

**Architect Decision**: Use /v2/users, 3-month deprecation for /v1/users

**Action**: Proceed with /v2/users implementation in Batch 3

**Decision**: ✅ Resume execution
```

**When to escalate:**
- Complex architectural decisions
- Security-critical changes
- API contract modifications (breaking changes)
- Database schema changes
- Performance-critical code
- New external dependencies
- Deviation from original plan

---

## Decision Tree

```
Executing a plan?
  → Group into batches of 3 tasks
  → Execute batch sequentially
  → Checkpoint (verify all 3 tasks)
  → Architect review needed?
    → YES: Escalate, document questions, wait for decision
    → NO: Proceed to next batch
  → Repeat until all batches complete

Task blocked?
  → Document blocker clearly
  → Skip to next unblocked task (if possible)
  → Return to blocked task after resolution

Quality issue at checkpoint?
  → STOP execution
  → Identify root cause
  → Fix issues in current batch
  → Re-verify checkpoint
  → Only then proceed

Task taking longer than planned?
  → Note actual time
  → Adjust estimates for remaining tasks
  → Flag if timeline at risk
```

---

## Edge Cases

**Task dependencies within batch**: If Task 2 depends on Task 1, that's fine. If Task 5 depends on Task 2 (cross-batch), ensure checkpoint captures that dependency.

**Partial batch completion**: If only 2 of 3 tasks done (blocker on Task 3), checkpoint what's done, escalate blocker.
```markdown
**CHECKPOINT**: Batch 2 PARTIAL (2/3 complete)

**Completed**:
- ✅ Task 4
- ✅ Task 5

**Blocked**:
- ⚠️ Task 6: External API credentials missing
- **Blocker**: Need API key from DevOps team
- **ETA**: 2 hours

**Decision**: Proceed to Batch 3 (tasks 7-9), return to Task 6 later
```

**Critical failure**: If checkpoint fails badly (many tests broken, build fails), stop and roll back.
```markdown
**CHECKPOINT**: Batch 3 FAILED ❌

**Issue**: 12 tests failing after refactor
**Root cause**: Breaking change in User interface
**Impact**: High - core functionality broken

**Decision**: ❌ STOP and ROLLBACK
- Revert commits from Batch 3
- Return to Batch 2 (last known good state)
- Re-plan Batch 3 with different approach
```

**Fast batches** (<5 min total): Combine next batch if work is trivial. Example: "Batch 2+3 combined (6 small tasks, 8 min total)".

---

## Checklist

- [ ] Tasks grouped into batches of 3
- [ ] Batch execution order documented
- [ ] Checkpoint after each batch with verification
- [ ] Progress tracking updated after each batch
- [ ] Architect review identified at key decision points
- [ ] Blockers documented with escalation path
- [ ] Actual time tracked vs estimates
- [ ] Rollback plan if checkpoint fails

---

## Example: Complete Execution

```markdown
# Plan Execution: User Authentication Feature

**Total Tasks**: 9
**Batches**: 3
**Estimated Time**: 27 minutes (9 tasks × 3 min avg)

---

## Batch 1: Foundation (Tasks 1-3) - 7 min

### Task 1: Create User entity (2 min) ✅
[implementation]
**Actual time**: 2 min

### Task 2: Add password hashing (3 min) ✅
[implementation]
**Actual time**: 4 min (debugging bcrypt install)

### Task 3: Create UserRepository interface (2 min) ✅
[implementation]
**Actual time**: 2 min

**CHECKPOINT 1**: ✅ PASS
- Tests: 5/5 passed
- Build: Success
- Lint: Clean
**Actual batch time**: 8 min (1 min over estimate)
**Progress**: 3/9 tasks (33%)
**Decision**: ✅ Proceed to Batch 2

---

## Batch 2: API Layer (Tasks 4-6) - 9 min

### Task 4: Define RegisterDTO (2 min) ✅
[implementation]
**Actual time**: 2 min

### Task 5: Implement register endpoint (5 min) ✅
[implementation]
**Actual time**: 6 min (added extra validation)

### Task 6: Write integration test (2 min) ✅
[implementation]
**Actual time**: 3 min

**CHECKPOINT 2**: ✅ PASS
- Tests: 11/11 passed (6 new)
- Build: Success
- Lint: Clean
**Actual batch time**: 11 min (2 min over)
**Progress**: 6/9 tasks (66%)

**Architect Review**: ⚠️ REQUIRED
- Question: Error response format (RFC 7807 vs custom?)
- **Architect Decision**: Use RFC 7807 Problem Details
- **Impact**: Task 8 (error handling) needs adjustment

**Decision**: ✅ Proceed to Batch 3 with adjusted Task 8

---

## Batch 3: Error Handling (Tasks 7-9) - 11 min

### Task 7: Add duplicate email test (2 min) ✅
[implementation]
**Actual time**: 2 min

### Task 8: Add validation error test (2 min) ✅
[implementation]
**Actual time**: 3 min (adjusted for RFC 7807)

### Task 9: Add error handler middleware (5 min) ✅
[implementation - RFC 7807 format]
**Actual time**: 6 min

**CHECKPOINT 3 (FINAL)**: ✅ PASS
- Tests: 14/14 passed (3 new)
- Build: Success
- Lint: Clean
- Type check: No errors
**Actual batch time**: 11 min
**Progress**: 9/9 tasks (100%)

---

## Final Summary

**Status**: ✅ COMPLETE

**Time**:
- Estimated: 27 min
- Actual: 30 min (+3 min, 11% over)
- Reason: Bcrypt setup (1 min) + architect review (2 min)

**Quality**:
- All 14 tests passing
- Build successful
- Lint clean
- Type-safe

**Deliverables**:
- User entity ✅
- Password hashing ✅
- UserRepository ✅
- Register endpoint ✅
- Error handling (RFC 7807) ✅
- Full test coverage ✅

**Next Steps**:
- Deploy to staging
- Update API documentation
- Notify frontend team of new endpoint
```

---

## Resources

- [writing-plans](../writing-plans/SKILL.md) - Creating executable plans
- [verification-protocol](../verification-protocol/SKILL.md) - Checkpoint verification
- [code-review](../code-review/SKILL.md) - Quality review after execution
- [systematic-debugging](../systematic-debugging/SKILL.md) - Handling checkpoint failures
