# Code Refactoring References

Supporting reference material for the code-refactoring skill.

## Quick Navigation

| File | Description | When to Use |
|------|-------------|-------------|
| [migration-patterns.md](./migration-patterns.md) | Step-by-step migration walkthroughs | When executing JS→TS, Redux ORM, callbacks, or RTK migrations |
| [legacy-testing.md](./legacy-testing.md) | Adding tests to untested legacy code | When legacy code has no test coverage before refactoring |
| [advanced-techniques.md](./advanced-techniques.md) | Git worktrees, codemods, and metrics tracking | When refactoring spans many files or multiple branches |
| [deployment-safety.md](./deployment-safety.md) | Canary deployments, rollback, pair programming | When deploying refactored code to production |
| [compliance-checklist.md](./compliance-checklist.md) | 4-phase checklist with 4 compliance gates | Before merging or deploying any refactoring work |

---

## Reading Strategy

1. **Start here** if you are new: read `migration-patterns.md` to understand concrete before/after transformations.
2. **Before any refactor**: review `compliance-checklist.md` Gate 1 requirements.
3. **During refactoring legacy code**: consult `legacy-testing.md` for characterization test strategies.
4. **For large or multi-file refactors**: read `advanced-techniques.md` for worktrees and codemod automation.
5. **Before deployment**: read `deployment-safety.md` for canary rollout and rollback procedures.

---

## File Descriptions

**migration-patterns.md** — Contains four complete migration walkthroughs (JavaScript to TypeScript, Redux ORM removal, callbacks to async/await, and Redux Classic to Redux Toolkit with RTK Query), plus an ROI analysis example for a real migration initiative. Use this file when you need concrete, phased implementation steps for a technology migration.

**legacy-testing.md** — Covers the strategy for adding characterization tests to legacy code that has no test coverage, including golden master testing, approval testing, the test pyramid inversion approach, and tools for mutation testing and coverage analysis. Read this before refactoring any code that lacks an adequate safety net.

**advanced-techniques.md** — Describes three power-user workflows: running parallel refactoring branches with Git worktrees (zero context switching), writing jscodeshift codemod scripts for bulk mechanical transformations across 50+ files, and building a shell script metrics dashboard to track complexity, bundle size, and coverage over time.

**deployment-safety.md** — Defines the approval gate structure by risk level (LOW/MEDIUM/HIGH/CRITICAL), the Kubernetes canary deployment pattern for gradual traffic shifting, automated rollback logic based on error rate and latency thresholds, and the pair programming protocol for high-risk changes.

**compliance-checklist.md** — The complete four-phase compliance checklist (Baseline Capture, Refactoring with Validation Gates, Post-Refactoring Audit, Production Deployment) along with all four mandatory compliance gates, failure response procedures, and a condensed quick-reference version of each gate.

---

## Cross-Reference Map

```
migration-patterns.md
  └── references deployment-safety.md (canary rollout for each phase)
  └── references compliance-checklist.md (Gate 1 approval before starting)

legacy-testing.md
  └── references compliance-checklist.md (Phase 1 baseline capture)
  └── references migration-patterns.md (JS→TS example uses typed test patterns)

advanced-techniques.md
  └── references migration-patterns.md (codemods accelerate bulk migrations)
  └── references deployment-safety.md (worktrees help parallel canary branches)

deployment-safety.md
  └── references compliance-checklist.md (Gates 3 and 4 map to deployment phases)
  └── references advanced-techniques.md (metrics dashboard feeds rollback decisions)

compliance-checklist.md
  └── references all other files (gates reference artifacts from each file)
```
