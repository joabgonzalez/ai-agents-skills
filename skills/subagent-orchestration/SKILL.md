---
name: subagent-orchestration
description: "Fresh subagents per task with two-stage reviews. Trigger: When coordinating multiple agents for complex workflows."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - writing-plans
    - code-review
    - verification-protocol
---

# Subagent Orchestration

Coordinate multiple fresh subagents for complex tasks with two-stage review cycles. Ensures isolation and quality at each step.

## When to Use

- Complex multi-task workflows requiring specialization
- Tasks benefiting from fresh context per step
- Parallel execution of independent tasks
- Two-stage review workflows (spec → quality)

Don't use for:
- Simple sequential tasks (use plan-execution)
- Single-agent workflows
- Tasks requiring shared context across steps

---

## Critical Patterns

### ✅ REQUIRED: Fresh Subagent Per Task

Launch new subagent for each major task (not reuse).

```markdown
# ✅ CORRECT: Fresh agent per task

## Task 1: Implement user registration
**Agent**: subagent-1 (fresh)
**Input**: User registration spec, User entity schema
**Output**: Registration endpoint + tests
**Status**: ✅ Complete
**Review**: Two-stage (spec ✅, quality ✅)

---

## Task 2: Implement password reset
**Agent**: subagent-2 (fresh, no context from subagent-1)
**Input**: Password reset spec, User entity schema, Email service interface
**Output**: Password reset endpoint + tests
**Status**: ✅ Complete
**Review**: Two-stage (spec ✅, quality ✅)

---

# ❌ WRONG: Reusing agent
Agent-1 does Task 1 → Agent-1 does Task 2
Problem: Carries assumptions from Task 1, stale context, decision fatigue
```

**Why fresh agents?**
- **Isolation**: Each agent starts with clean slate
- **Specialization**: Agent focuses on single task
- **Parallel**: Independent agents can work simultaneously
- **Quality**: No accumulated technical debt or assumptions

### ✅ REQUIRED: Two-Stage Review Per Task

Review each task output in two stages: spec compliance FIRST, then code quality.

```markdown
## Task 1: User Registration Endpoint

**Subagent-1 Output**:
- File: src/routes/auth.ts
- Tests: tests/auth-register.test.ts
- Commits: 3 commits

---

### Stage 1: Spec Compliance Review (Architect)

**Spec Requirements**:
- ✅ Accepts email/password via POST /auth/register
- ✅ Returns 201 with user object (no password)
- ✅ Email validation enforced
- ❌ Missing: Rate limiting (spec section 3.2)
- ❌ Missing: Email uniqueness check returns 409

**Decision**: ❌ FAIL spec review

**Feedback to Subagent-1**:
1. Add rate limiting middleware (5 requests/min per IP)
2. Check email uniqueness, return 409 if exists
3. Add tests for both scenarios

**Status**: Return to subagent-1 for fixes

---

[After subagent-1 fixes]

### Stage 1 (Retry): Spec Compliance

**Re-review**:
- ✅ All spec requirements met
- ✅ Rate limiting present
- ✅ Email uniqueness check with 409 response

**Decision**: ✅ PASS spec review → Proceed to Stage 2

---

### Stage 2: Code Quality Review

**Quality Assessment**:
- ✅ TypeScript strict mode enabled
- ✅ Proper error handling
- ⚠️ Password hashing uses deprecated bcrypt.hashSync (use async bcrypt.hash)
- ⚠️ Magic number (rate limit: 5) should be constant
- ✅ Tests cover happy path + edge cases

**Decision**: ✅ PASS with minor improvements noted

**Optional improvements** (non-blocking):
1. Use async bcrypt.hash
2. Extract rate limit to config

**Status**: ✅ Task 1 complete, proceed to Task 2
```

**Two-stage benefits:**
- Prevents quality review on incorrect behavior
- Clear separation: correctness vs maintainability
- Architect reviews spec, senior dev reviews quality
- Faster iteration (fix spec issues first)

### ✅ REQUIRED: Task Handoff Protocol

Clear handoff between agents with explicit context.

```markdown
## Handoff: Task 1 → Task 2

**From**: subagent-1 (registration complete)
**To**: subagent-2 (password reset implementation)

---

### Context Provided to Subagent-2:

**Files to read** (shared context):
- `src/entities/User.ts` - User entity schema
- `src/services/EmailService.ts` - Email service interface
- `tests/helpers.ts` - Test utilities

**Interfaces to use**:
```typescript
interface IEmailService {
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
```

**Constraints**:
- Follow same error response format as Task 1 (RFC 7807)
- Use same test patterns (AAA, descriptive names)
- Rate limiting: 3 requests/10min for reset endpoint

---

### NOT Provided (fresh context):

- Implementation details from registration endpoint
- Assumptions made in Task 1
- Technical decisions (e.g., bcrypt config)

**Rationale**: Subagent-2 should make independent decisions for password reset, not copy Task 1

---

### Subagent-2 Instructions:

1. Read User entity schema to understand structure
2. Read EmailService interface for email integration
3. Implement POST /auth/reset-password endpoint
4. Generate secure reset token (crypto.randomBytes)
5. Store token with expiration (30 min)
6. Send reset email via EmailService
7. Write tests (happy path + edge cases)
8. Follow RFC 7807 error format
```

**Handoff includes:**
- **Shared interfaces**: What APIs to use
- **Constraints**: What rules to follow
- **NOT included**: How Task 1 was implemented (allows fresh approach)

### ✅ REQUIRED: Parallel Execution When Possible

Launch independent tasks in parallel for efficiency.

```markdown
## Batch 1: Parallel Execution

### Parallel Group 1 (independent tasks)

**Subagent-A** (parallel):
- Task 1: User registration endpoint
- Dependencies: User entity, bcrypt
- Estimated: 15 min

**Subagent-B** (parallel):
- Task 2: Product catalog API (completely independent)
- Dependencies: Product entity, database
- Estimated: 20 min

**Status**: Both running in parallel ⏳

---

[Wait for both to complete]

**Subagent-A**: ✅ Complete (16 min actual)
**Subagent-B**: ✅ Complete (18 min actual)

---

### Two-Stage Review (each agent)

**Subagent-A Review**:
- Stage 1 (Spec): ✅ PASS
- Stage 2 (Quality): ✅ PASS

**Subagent-B Review**:
- Stage 1 (Spec): ❌ FAIL (missing pagination)
- [Fix and re-review]
- Stage 1 (Retry): ✅ PASS
- Stage 2 (Quality): ✅ PASS

---

## Batch 2: Sequential (dependent tasks)

### Sequential Group 1

**Subagent-C** (sequential):
- Task 3: Password reset endpoint
- Dependencies: Task 1 complete (email service from registration)
- Estimated: 15 min

**Status**: Waiting for Subagent-A completion ⏳

[After Subagent-A completes]

**Subagent-C**: ✅ Started
```

**Benefits of parallel execution:**
- Faster total time (15 min + 20 min = 20 min parallel vs 35 min sequential)
- Better resource utilization
- Independent quality (one failure doesn't block the other)

---

## Decision Tree

```
Complex workflow with 5+ tasks?
  → Break into independent tasks
  → Launch fresh subagent per task
  → Two-stage review per output

Tasks independent?
  → Execute in parallel (multiple subagents)
  → Benefits: Speed, isolation

Tasks dependent?
  → Execute sequentially with handoff protocol
  → Provide only necessary context

Review failed?
  → Spec failed (Stage 1)?
    → Return to subagent with spec feedback
    → Re-review Stage 1 after fix
  → Quality failed (Stage 2)?
    → Minor issues: Note and proceed
    → Major issues: Return to subagent

Subagent blocked?
  → Document blocker
  → Launch next independent task
  → Return when unblocked
```

---

## Edge Cases

**Subagent produces incorrect output**: If Stage 1 review fails badly (completely wrong approach), consider launching fresh agent with better instructions instead of asking same agent to fix.

**Cross-task integration needed**: If Task 3 needs to integrate Task 1 + Task 2 outputs, create Integration Task with both outputs as context.
```markdown
## Task 3: Integration (Registration + Password Reset)

**Agent**: subagent-3 (fresh)
**Input**:
- Task 1 output (registration endpoint)
- Task 2 output (password reset endpoint)
- Integration spec

**Goal**: Ensure both endpoints share same error format, rate limiting strategy, email service
```

**Very large tasks (>30 min)**: Break into sub-tasks with dedicated sub-agents. Example: "Task 2: Product catalog" → Task 2.1 (list), Task 2.2 (create), Task 2.3 (update).

**Shared state issues**: If parallel agents modify same files, merge conflicts arise. Solution: Assign file ownership per agent or run sequentially.

**Cost optimization**: Fresh agents use tokens. For very small tasks (<5 min), consider grouping into single agent task.

---

## Checklist

- [ ] Fresh subagent per major task (not reused across tasks)
- [ ] Two-stage review (spec → quality) for each output
- [ ] Stage 1 passes before Stage 2 begins
- [ ] Handoff protocol documents context provided to next agent
- [ ] Parallel execution used for independent tasks
- [ ] Failed reviews return to agent with clear, actionable feedback
- [ ] Overall workflow progress tracked (tasks completed / total)
- [ ] Final integration verified after all subagent tasks complete

---

## Example: Complete Orchestration

```markdown
# Subagent Orchestration: User Authentication Feature

## Overview
- **Total Tasks**: 4
- **Parallel Groups**: 1 (tasks 1-2)
- **Sequential Tasks**: 2 (tasks 3-4 depend on 1-2)
- **Estimated Time**: 45 min

---

## Batch 1: Parallel Execution (Tasks 1-2)

### Task 1: User Registration
**Subagent-A**: Fresh agent
**Input**:
- User registration spec
- User entity schema
- bcrypt for password hashing

**Output**: Registration endpoint + tests
**Status**: ⏳ Running in parallel

---

### Task 2: Email Service Integration
**Subagent-B**: Fresh agent (parallel with A)
**Input**:
- Email service spec
- SendGrid API credentials
- Email templates

**Output**: EmailService implementation + tests
**Status**: ⏳ Running in parallel

---

[Both complete]

**Subagent-A**: ✅ Complete (18 min)
**Subagent-B**: ✅ Complete (22 min)
**Actual parallel time**: 22 min (vs 40 min sequential)

---

### Subagent-A Review (Task 1)

**Stage 1: Spec Compliance**
- ✅ All requirements met
- ✅ Tests passing
**Decision**: ✅ PASS

**Stage 2: Code Quality**
- ✅ Clean code
- ⚠️ Minor: Extract magic numbers
**Decision**: ✅ PASS with improvements noted

---

### Subagent-B Review (Task 2)

**Stage 1: Spec Compliance**
- ❌ Missing retry logic for failed emails
- ❌ No test for SendGrid API failure

**Feedback to Subagent-B**:
1. Add exponential backoff retry (3 attempts)
2. Test email send failure scenario

**Status**: ⚠️ Return to Subagent-B for fixes

---

[After Subagent-B fixes]

**Stage 1 (Retry)**: ✅ PASS
**Stage 2**: ✅ PASS

---

## Batch 2: Sequential (Tasks 3-4)

### Task 3: Password Reset Endpoint
**Subagent-C**: Fresh agent (depends on Tasks 1 + 2)

**Handoff from Batch 1**:
- Context: User entity (from A), EmailService (from B)
- Files: User.ts, EmailService.ts
- Constraints: Same error format as registration

**Input**:
- Password reset spec
- EmailService from Task 2
- User entity from Task 1

**Output**: Password reset endpoint + tests
**Status**: ⏳ Running

**Result**: ✅ Complete (15 min)

---

### Subagent-C Review

**Stage 1**: ✅ PASS
**Stage 2**: ✅ PASS

---

### Task 4: Integration Tests
**Subagent-D**: Fresh agent (depends on all previous)

**Input**:
- All endpoints from Tasks 1-3
- Integration test spec

**Output**: E2E tests for complete auth flow
**Status**: ⏳ Running

**Result**: ✅ Complete (10 min)

---

### Subagent-D Review

**Stage 1**: ✅ PASS
**Stage 2**: ✅ PASS

---

## Final Summary

**Status**: ✅ ALL TASKS COMPLETE

**Agents Used**: 4 fresh agents (A, B, C, D)

**Total Time**:
- Estimated: 45 min
- Actual: 47 min (22 parallel + 15 + 10)
- vs Sequential: 65 min (18+22+15+10)
- **Time saved**: 18 min (28% faster)

**Quality**:
- All 4 tasks passed two-stage review
- 1 task required fix (Task 2 - retry logic)
- All tests passing
- Integration verified

**Deliverables**:
- User registration ✅
- Email service ✅
- Password reset ✅
- Integration tests ✅
```

---

## Resources

- [writing-plans](../writing-plans/SKILL.md) - Breaking down complex work into agent tasks
- [code-review](../code-review/SKILL.md) - Two-stage review process (spec → quality)
- [verification-protocol](../verification-protocol/SKILL.md) - Verification gates for agent outputs
- [plan-execution](../plan-execution/SKILL.md) - Batch execution patterns for single agent
