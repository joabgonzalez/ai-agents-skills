# Writing Plans References

Navigation guide for writing-plans reference files.

## Quick Navigation

| Reference | Lines | Topic |
|-----------|-------|-------|
| [plan-example.md](plan-example.md) | ~115 | Complete 9-task User Registration API plan across 3 batches |

---

## Reading Strategy

**Writing a plan for the first time:** Read SKILL.md → plan-example.md for a full worked example.

**Need a task structure template:** Read SKILL.md Critical Patterns (Granular Tasks + File Path Precision).

**Verifying plan quality:** Use SKILL.md Checklist against your plan.

---

## File Descriptions

### plan-example.md (~115 lines)

Complete plan for User Registration API: 9 tasks grouped into 3 batches, with full TypeScript code examples (User entity, crypto utils, RegisterDTO, auth route, integration test), precise file paths, and checkpoint verification steps. Demonstrates TDD workflow (test in Task 6 validates Task 5 implementation).

---

## Cross-Reference Map

**Task granularity:** SKILL.md (Granular Tasks pattern) ↔ plan-example.md (Tasks 1-9 with 2-5 min estimates)

**File precision:** SKILL.md (File Path Precision pattern) ↔ plan-example.md (all tasks have `src/...` paths)

**Batch checkpoints:** SKILL.md (Batch Execution pattern) ↔ plan-example.md (CHECKPOINT after each batch)

**TDD workflow:** SKILL.md (TDD Workflow pattern) ↔ plan-example.md (Task 6 integration test)
