---
name: subagent-orchestration
description: "Fresh subagents per task with two-stage reviews. Trigger: When coordinating parallel agents for complex workflows."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
  skills:
    - writing-plans
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

### Stage 1: Spec Compliance Review (Architect)
- ✅ Accepts email/password via POST /auth/register
- ❌ Missing: Rate limiting (spec section 3.2)
- ❌ Missing: Email uniqueness check returns 409
**Decision**: ❌ FAIL → Return to subagent with feedback

[After subagent fixes]

### Stage 1 (Retry): Spec Compliance
- ✅ All spec requirements met
**Decision**: ✅ PASS → Proceed to Stage 2

### Stage 2: Code Quality Review
- ✅ TypeScript strict mode enabled
- ⚠️ Password hashing uses deprecated bcrypt.hashSync
- ✅ Tests cover happy path + edge cases
**Decision**: ✅ PASS with minor improvements noted
```

**Two-stage benefits:**

- Prevents quality review on incorrect behavior
- Clear separation: correctness vs maintainability
- Architect reviews spec, senior dev reviews quality
- Faster iteration (fix spec issues first)

> Full walkthrough: [orchestration-patterns.md](./references/orchestration-patterns.md)

### ✅ REQUIRED: Task Handoff Protocol

Clear handoff between agents with explicit context.

**Handoff structure:**

- **From / To**: Identify source and destination agent
- **Files to read** (shared context): Interfaces, schemas, helpers
- **Constraints**: Error formats, test patterns, rate limits to follow
- **NOT provided**: Implementation details or assumptions from prior task

**Handoff includes:**

- **Shared interfaces**: What APIs to use
- **Constraints**: What rules to follow
- **NOT included**: How prior task was implemented (allows fresh approach)

> Full template with instructions: [orchestration-patterns.md](./references/orchestration-patterns.md)

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

## Example

```markdown
# Subagent Orchestration: User Authentication Feature

## Overview
- **Total Tasks**: 4
- **Parallel Groups**: 1 (tasks 1-2)
- **Sequential Tasks**: 2 (tasks 3-4 depend on 1-2)
- **Estimated Time**: 45 min

## Batch 1: Parallel Execution (Tasks 1-2)

**Subagent-A**: User Registration endpoint (fresh agent)
**Subagent-B**: Email Service integration (fresh agent, parallel with A)

[Both complete after ~22 min parallel vs ~40 min sequential]

- Subagent-A: ✅ Passed two-stage review
- Subagent-B: ⚠️ Stage 1 failed (missing retry logic) → fixed → ✅ PASS

## Batch 2: Sequential (Tasks 3-4)

**Subagent-C**: Password Reset endpoint (depends on Tasks 1+2) → ✅ PASS
**Subagent-D**: Integration Tests (depends on Tasks 1-3) → ✅ PASS

## Final Summary
- **Agents Used**: 4 fresh agents
- **Total Time**: 47 min (22 parallel + 15 + 10)
- **vs Sequential**: 65 min — saved 18 min (28% faster)
- **Quality**: All 4 tasks passed two-stage review
```

> Full execution details with all review stages: [orchestration-patterns.md](./references/orchestration-patterns.md)

---

## Resources

- [orchestration-patterns.md](./references/orchestration-patterns.md) — Full handoff templates, two-stage review walkthrough, complete execution example
- [writing-plans](../writing-plans/SKILL.md) - Breaking down complex work into agent tasks
- [code-review](../code-review/SKILL.md) - Two-stage review process (spec → quality)
- [verification-protocol](../verification-protocol/SKILL.md) - Verification gates for agent outputs
- [plan-execution](../plan-execution/SKILL.md) - Batch execution patterns for single agent
