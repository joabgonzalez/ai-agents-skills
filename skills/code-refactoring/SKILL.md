---
name: code-refactoring
description: "Systematic code refactoring with risk mitigation. Trigger: When refactoring legacy code, migrating technologies, or resolving technical debt."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Code Refactoring

Refactoring legacy code, migrating technologies, and resolving technical debt with minimal risk and maximum impact.

## When to Use

- Modernizing legacy code (JS→TS, callbacks→async/await)
- Migrating technologies (Redux ORM removal, framework changes)
- Resolving technical debt that blocks new features
- Improving code maintainability and reducing complexity
- Preparing code for performance optimization

**Don't use for:**

- Adding new features (separate refactoring from feature work)
- Code that works well and won't change
- Production-critical code without adequate test coverage
- Situations with severe time constraints or change freezes

---

## Critical Patterns

### ✅ REQUIRED: Safety Snapshot Before Starting

Create safety net BEFORE touching any code.

```bash
git add . && git commit -m "chore: snapshot before refactoring UserService"
git checkout -b refactor/user-service-cleanup
git tag refactor-start-$(date +%Y%m%d)
npm test -- --coverage > baseline-test-results.txt
npm run build > baseline-build-output.txt
```

### ✅ REQUIRED: Test Coverage Before Refactoring

Never refactor production code without test coverage.

```typescript
// Add characterization tests first
describe('processPayment', () => {
  test('calculates correct fee for $100', () => {
    expect(processPayment(100, 'user-123')).toBe(103.20);
  });
  test('handles edge case: $0 amount', () => {
    expect(processPayment(0, 'user-123')).toBe(0.30);
  });
});
// Minimum: 80% unit coverage, 60% integration coverage
```

### ✅ REQUIRED: Incremental Changes with Atomic Commits

Make small, verifiable changes. Commit at every stable state.

```typescript
// Commit 1: "Extract calculateFee() from processPayment"
function calculateFee(amount: number): number { return amount * 0.029 + 0.30; }
// Tests pass ✓

// Commit 2: "Replace magic numbers with named constants"
const STRIPE_RATE = 0.029;
const STRIPE_FIXED_FEE = 0.30;
// Tests pass ✓ — target: <300 lines per commit
```

### ✅ REQUIRED: Feature Flags for Safe Migration

Use feature flags to enable runtime switching between old/new implementations.

```typescript
// ✅ CORRECT: Feature flag with gradual rollout
export const paymentService = config.featureFlags.useNewPayment
  ? new NewPaymentService()
  : new LegacyPaymentService();
// Week 1: 5% → Week 2: 25% → Week 3: 50% → Week 4: 100% (remove flag)
```

### ✅ REQUIRED: Preserve Behavior During Refactoring

Refactoring changes HOW code works, not WHAT it does.

```typescript
// ✅ CORRECT: Preserve original null-on-error behavior
function getUser(id: string): User | null {
  const result = findUserById(id); // Extracted to helper
  return result ?? null;           // Same null-on-error behavior
}
// Rule: if behavior must change, do it in a separate commit AFTER refactoring
```

### ✅ REQUIRED: Automated Refactoring Tools (Efficiency)

Use automation for mechanical transformations. Save manual effort for logic improvements.

```bash
# Run jscodeshift codemod across entire codebase
npx jscodeshift -t codemod-replace-moment-with-datefns.js src/
# See references/advanced-techniques.md for full codemod script example
```

### ✅ REQUIRED: Dependency Snapshot for Rollback Safety

Lock dependencies before refactoring to prevent environment variables.

```bash
npm ci              # Node.js: exact versions from package-lock.json
pip freeze > requirements-lock.txt && pip install -r requirements-lock.txt
bundle install --frozen
# Rule: refactor first, update dependencies separately
```

### ✅ REQUIRED: Gradual Type Introduction (TypeScript Migration)

For JS→TS migration, use `// @ts-check` for incremental type safety without file conversion.

```typescript
// tsconfig.json — enable strict mode incrementally
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
// Phases: @ts-check → JSDoc types → .js→.ts rename → TypeScript types → strict: true
```

### ✅ REQUIRED: ROI-Based Prioritization

Calculate effort vs impact before starting.

**Quick Wins (Prioritize First):**

- 1-2 weeks effort, 250-375% first-month ROI
- Example: Extract repeated validation logic into shared utility

**Medium-Term:**

- 1-3 months effort, 100-200% 3-month ROI
- Example: Technology migration (JS→TS)

**Long-Term:**

- 3-12 months effort, 50-100% 6-month ROI
- Example: Framework migration (monolith→microservices)

### ❌ NEVER: Big-Bang Replacement

```typescript
// ❌ WRONG: All users immediately use new code (HIGH RISK)
export const paymentService = new NewPaymentService();

// ❌ WRONG: Massive refactor in one commit (500 files changed)
// Unreviewable, hard to rollback, high risk
```

---

## Decision Tree

```
Need to improve code?
  ↓
Is there 80%+ test coverage?
  NO → Add tests first OR Accept debt with monitoring
  YES → Continue
  ↓
Will code change frequently in next 6 months?
  NO → Accept debt (document for future)
  YES → Continue
  ↓
Can behavior be preserved?
  NO → REWRITE (new requirements)
  YES → Continue
  ↓
Is technology stack obsolete?
  YES → REWRITE with migration pattern
  NO → Continue
  ↓
Estimated effort?
  1-4 weeks → REFACTOR (quick wins)
  1-3 months → REFACTOR (medium-term)
  3-12 months → REWRITE or phased REFACTOR
  >12 months → Accept debt, break into phases
  ↓
Calculate ROI
  >200% first month → REFACTOR immediately
  100-200% in 3 months → REFACTOR next sprint
  50-100% in 6 months → Schedule for next quarter
  <50% in 6 months → Accept debt, revisit annually
```

---

## Example

### JavaScript to TypeScript

```typescript
// Phase 1: Add type definitions to public APIs
// Before
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
// After Phase 1
export function calculateTotal(items: Array<{ price: number }>): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Phase 2: Replace any with explicit types
interface DataItem { value: number; label: string; }
function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}

// Phase 3: Enable strict mode (tsconfig.json)
// { "compilerOptions": { "strict": true, "noImplicitAny": true } }
```

See [references/migration-patterns.md](./references/migration-patterns.md) for the full Redux ORM removal, callbacks→async/await, and Redux Classic→RTK walkthroughs.

---

## Edge Cases

- **Partial migration state**: Use feature flags to run old + new code in parallel. Monitor error rates for both implementations.

- **Breaking changes unavoidable**: Create deprecation warnings 2+ versions before removal. Document migration guide with before/after examples.

- **Rollback during production incident**: Feature flags enable instant rollback without code deploy. Monitor metrics: error rate, latency, throughput.

- **Test coverage gaps**: Don't refactor. Either add tests first (separate initiative) or accept tech debt with monitoring.

- **Circular dependencies during refactor**: Indicates poor separation of concerns. Introduce dependency injection or event-driven architecture.

- **Performance regression**: Benchmark before/after with realistic data. If regression >10%, investigate optimization or revert.

- **Merge conflicts during long-running refactor**: Rebase frequently (daily) to stay in sync with main branch. Use `git rerere` to remember conflict resolutions.

- **Flaky tests exposed during refactor**: Don't fix during refactor. Document flaky tests in separate issue. Refactor assumes stable test suite.

- **Refactoring reveals bugs in original code**: Stop refactoring. Fix bugs first (separate commit/PR), THEN resume refactor. Never mix bug fixes with refactoring.

- **Team members need original code during refactor**: Use feature branch + feature flag. Original code remains accessible until migration complete.

---

## Checklist

Summary of the 4 phases — see [references/compliance-checklist.md](./references/compliance-checklist.md) for the full checklist with all gates.

- [ ] **Gate 1 — Approval to Start**: Test coverage ≥80%, baseline captured, ROI calculated, rollback plan documented, team approved
- [ ] **Phase 1 — Baseline Capture**: Run full test suite, record API responses, capture performance metrics, export DB state
- [ ] **Phase 2 — Refactoring**: Atomic commits (<300 lines), tests pass after each commit, no performance regression, type/lint clean
- [ ] **Gate 2 — Mid-Refactoring Review**: At 50% completion, verify complexity unchanged, timeline on track, tests green
- [ ] **Phase 3 — Compliance Audit**: Full test suite, integration tests, E2E tests, API contract tests, load testing, staging smoke test
- [ ] **Gate 3 — Pre-Merge Validation**: 2+ code review approvals, static analysis passes, documentation updated, deployment plan reviewed
- [ ] **Phase 4 — Production Deployment**: Feature flags configured, rollback tested, on-call notified, monitoring dashboards live
- [ ] **Gate 4 — Post-Deployment**: Error rate ≤ baseline (24h), latency ≤ baseline (24h), zero user complaints, business metrics unchanged

---

## Resources

### Reference Files

- [migration-patterns.md](./references/migration-patterns.md) - JS→TS, Redux ORM removal, callbacks→async/await, Redux Classic→RTK walkthroughs
- [legacy-testing.md](./references/legacy-testing.md) - Characterization tests, golden master testing, coverage tools for legacy code
- [advanced-techniques.md](./references/advanced-techniques.md) - Git worktrees, jscodeshift codemods, refactoring metrics dashboard
- [deployment-safety.md](./references/deployment-safety.md) - Risk assessment, canary deployments, automated rollback, pair programming
- [compliance-checklist.md](./references/compliance-checklist.md) - Full 4-phase checklist with all 4 compliance gates and failure responses

### Related Skills

- [code-conventions](../code-conventions/SKILL.md) - Code organization and naming
- [architecture-patterns](../architecture-patterns/SKILL.md) - SOLID, DDD, Clean Architecture
- [typescript](../typescript/SKILL.md) - Type-safe refactoring
- [systematic-debugging](../systematic-debugging/SKILL.md) - Root cause analysis
- [unit-testing](../unit-testing/SKILL.md) - Test coverage strategies

### External Resources

- <https://refactoring.guru/> - Refactoring patterns catalog
- <https://martinfowler.com/refactoring/> - Refactoring best practices
- <https://www.industriallogic.com/xp/refactoring/> - Incremental refactoring techniques
