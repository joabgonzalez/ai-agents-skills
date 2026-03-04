# Execution Walkthrough

Complete 3-batch execution example: User Authentication Feature (9 tasks, 30 min actual).

---

## Core Patterns

The walkthrough below demonstrates: batch grouping, checkpoint verification, architect review escalation, and final summary.

---

### Full Example: User Authentication Feature

```markdown
# Plan Execution: User Authentication Feature

**Total Tasks**: 9
**Batches**: 3
**Estimated Time**: 27 minutes (9 tasks × 3 min avg)

---

### Batch 1: Foundation (Tasks 1-3) - 7 min

#### Task 1: Create User entity (2 min)

[implementation]
**Actual time**: 2 min

#### Task 2: Add password hashing (3 min)

[implementation]
**Actual time**: 4 min (debugging bcrypt install)

#### Task 3: Create UserRepository interface (2 min)

[implementation]
**Actual time**: 2 min

**CHECKPOINT 1**: PASS
- Tests: 5/5 passed
- Build: Success
- Lint: Clean
**Actual batch time**: 8 min (1 min over estimate)
**Progress**: 3/9 tasks (33%)
**Decision**: Proceed to Batch 2

---

### Batch 2: API Layer (Tasks 4-6) - 9 min

#### Task 4: Define RegisterDTO (2 min)

[implementation]
**Actual time**: 2 min

#### Task 5: Implement register endpoint (5 min)

[implementation]
**Actual time**: 6 min (added extra validation)

#### Task 6: Write integration test (2 min)

[implementation]
**Actual time**: 3 min

**CHECKPOINT 2**: PASS
- Tests: 11/11 passed (6 new)
- Build: Success
- Lint: Clean
**Actual batch time**: 11 min (2 min over)
**Progress**: 6/9 tasks (66%)

**Architect Review**: REQUIRED
- Question: Error response format (RFC 7807 vs custom?)
- **Architect Decision**: Use RFC 7807 Problem Details
- **Impact**: Task 8 (error handling) needs adjustment

**Decision**: Proceed to Batch 3 with adjusted Task 8

---

### Batch 3: Error Handling (Tasks 7-9) - 11 min

#### Task 7: Add duplicate email test (2 min)

[implementation]
**Actual time**: 2 min

#### Task 8: Add validation error test (2 min)

[implementation]
**Actual time**: 3 min (adjusted for RFC 7807)

#### Task 9: Add error handler middleware (5 min)

[implementation — RFC 7807 format]
**Actual time**: 6 min

**CHECKPOINT 3 (FINAL)**: PASS
- Tests: 14/14 passed (3 new)
- Build: Success
- Lint: Clean
- Type check: No errors
**Actual batch time**: 11 min
**Progress**: 9/9 tasks (100%)

---

### Final Summary

**Status**: COMPLETE

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
- User entity
- Password hashing
- UserRepository
- Register endpoint
- Error handling (RFC 7807)
- Full test coverage

**Next Steps**:
- Deploy to staging
- Update API documentation
- Notify frontend team of new endpoint
```

---

## Related Topics

- See [README.md](README.md) for navigation guide
- [plan-execution SKILL.md](../SKILL.md) — Batch execution patterns and decision tree
- [writing-plans](../../writing-plans/SKILL.md) — How to create the plan before executing
