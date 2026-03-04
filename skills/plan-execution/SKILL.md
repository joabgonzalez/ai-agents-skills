---
name: plan-execution
description: "Batch execution with checkpoints. Trigger: When executing plans with batched tasks."
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
### Batch 1: Foundation

#### Task 1: Create User entity (2 min)
**File**: `src/entities/User.ts`
**Implementation**:
[typescript code]

**Status**: Complete

---

**CHECKPOINT**: Batch 1 Complete

**Verification**:

- Ran: `npm test -- UserEntity.test.ts crypto.test.ts UserRepository.test.ts`
- Result: 8/8 tests passed
- Build: `npm run build` → Success
- Lint: `npm run lint` → 0 errors

**Decision**: Proceed to Batch 2

---

### Batch 2: API Layer

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
1. Tests passing? Yes
   - Ran: `npm test`
   - Result: 15/15 passed

2. Build succeeds? Yes
   - Ran: `npm run build`
   - Result: Compiled successfully

3. Lint clean? Yes
   - Ran: `npm run lint`
   - Result: 0 errors, 0 warnings

4. Type check? Yes
   - Ran: `tsc --noEmit`
   - Result: No type errors

**Architect Review Needed?** No (straightforward CRUD implementation)

**Blockers?** None

**Decision**: Proceed to Batch 3
```

**Checkpoint serves as:**

- Quality gate (don't proceed if tests fail)
- Progress marker (33% → 66% → 100%)
- Review opportunity (pause for feedback)
- Rollback point (if issues found, revert to last checkpoint)

### ✅ REQUIRED: Progress Tracking

Track overall progress across batches.

```markdown
### Overall Progress

**Completed Batches**: 2/4 (50%)
**Completed Tasks**: 6/12 (50%)

**Current Batch**: Batch 3 (tasks 7-9)
**Remaining**: Batch 4 (tasks 10-12)

**Status**: On track
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

**Architect Review Required**: YES

**Reason**:
- API versioning strategy decision needed
- Breaking change to /users endpoint (removing deprecated fields)

**Questions for Architect**:
1. Preferred approach: /v2/users or query param ?version=2?
2. Deprecation timeline: immediate or gradual?

**Blocking**: Cannot proceed to Batch 3 until architect approves approach

[After architect feedback]

**Architect Decision**: Use /v2/users, 3-month deprecation for /v1/users

**Decision**: Resume execution
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
- Task 4
- Task 5

**Blocked**:
- Task 6: External API credentials missing
- **Blocker**: Need API key from DevOps team
- **ETA**: 2 hours

**Decision**: Proceed to Batch 3 (tasks 7-9), return to Task 6 later
```

**Critical failure**: If checkpoint fails badly (many tests broken, build fails), stop and roll back.

```markdown
**CHECKPOINT**: Batch 3 FAILED

**Issue**: 12 tests failing after refactor
**Root cause**: Breaking change in User interface
**Impact**: High - core functionality broken

**Decision**: STOP and ROLLBACK
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

## Example

See [references/execution-walkthrough.md](references/execution-walkthrough.md) for a complete 3-batch execution walkthrough.

---

## Resources

- [writing-plans](../writing-plans/SKILL.md) - Creating executable plans
- [verification-protocol](../verification-protocol/SKILL.md) - Checkpoint verification
- [code-review](../code-review/SKILL.md) - Quality review after execution
- [systematic-debugging](../systematic-debugging/SKILL.md) - Handling checkpoint failures
- [references/README.md](references/README.md) - Reference file navigation
- [references/execution-walkthrough.md](references/execution-walkthrough.md) - Complete 3-batch example
