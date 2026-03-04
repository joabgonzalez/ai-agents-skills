# Compliance Checklist

Four-phase refactoring checklist with mandatory compliance gates to guarantee functionality preservation.

## Core Patterns

### Phase 1: Baseline Capture (Before Refactoring)

Capture current behavior before touching any code.

- [ ] **Snapshot test outputs**: Run full test suite, save results

  ```bash
  npm test -- --coverage > baseline-tests.txt
  ```

- [ ] **Record API responses**: For each endpoint, capture sample responses

  ```bash
  curl http://localhost:3000/api/users/1 > baseline-user-1.json
  ```

- [ ] **Capture performance metrics**: Measure current performance

  ```bash
  npx autocannon http://localhost:3000/api/users > baseline-perf.txt
  ```

- [ ] **Screenshot UI states**: For frontend, capture visual snapshots

  ```bash
  npx playwright test --update-snapshots
  ```

- [ ] **Document edge cases**: List all known edge cases and expected behavior

  ```text
  Edge Cases
  1. Empty array returns []
  2. Null user ID throws ValidationError
  3. Negative amount returns 0
  ```

- [ ] **Export database state**: Snapshot DB for rollback

  ```bash
  pg_dump mydb > baseline-db.sql
  ```

### Phase 2: Refactoring with Validation Gates

Validate after EACH atomic change.

- [ ] **Run affected tests**: Test only changed modules

  ```bash
  npm test -- --testPathPattern=user-service
  ```

- [ ] **Compare outputs**: Ensure identical results to baseline

  ```bash
  diff baseline-user-1.json current-user-1.json
  # Output should be empty (no diff)
  ```

- [ ] **Check for regressions**: Run mutation testing

  ```bash
  npx stryker run  # Kills mutants to verify test strength
  ```

- [ ] **Visual regression testing**: Compare screenshots

  ```bash
  npx playwright test  # Fails if visual changes detected
  ```

- [ ] **Performance regression check**: Ensure no slowdown

  ```bash
  npx autocannon http://localhost:3000/api/users > current-perf.txt
  # Compare: current should be <= baseline latency
  ```

- [ ] **Type checking**: Zero new TypeScript errors

  ```bash
  npx tsc --noEmit  # Must exit with code 0
  ```

- [ ] **Linting**: Zero new linting errors

  ```bash
  npx eslint src/  # Must exit with code 0
  ```

### Phase 3: Post-Refactoring Compliance Audit

Final validation before merge.

- [ ] **Full test suite passes**: All tests green

  ```bash
  npm test -- --coverage --watchAll=false
  # Coverage must be >= baseline (no decrease)
  ```

- [ ] **Integration tests pass**: Test cross-module interactions

  ```bash
  npm run test:integration
  ```

- [ ] **E2E tests pass**: Validate user workflows

  ```bash
  npm run test:e2e
  ```

- [ ] **API contract tests**: Verify external contracts unchanged

  ```bash
  npx @pact-foundation/pact verify
  ```

- [ ] **Load testing**: Ensure performance under load

  ```bash
  npx artillery run load-test.yml
  # RPS should match or exceed baseline
  ```

- [ ] **Smoke test in staging**: Deploy to staging, run smoke tests

  ```bash
  npm run deploy:staging && npm run test:smoke
  ```

- [ ] **Manual QA checklist**: Test critical user paths manually
  - [ ] User can log in
  - [ ] User can submit form
  - [ ] Payment processing works
  - [ ] Data exports correctly

- [ ] **Accessibility audit**: No regressions in a11y

  ```bash
  npx @axe-core/cli http://localhost:3000
  ```

- [ ] **Security scan**: No new vulnerabilities

  ```bash
  npm audit --audit-level=moderate
  ```

- [ ] **Database migrations**: Test rollback procedure

  ```bash
  npm run migrate:down && npm run migrate:up
  ```

### Phase 4: Production Deployment Compliance

Pre-deployment checklist:

- [ ] **Code review approved**: Minimum 2 approvals from team
- [ ] **Changelog updated**: Document changes for users
- [ ] **Deployment plan documented**: Rollout strategy + rollback steps
- [ ] **Monitoring dashboards configured**: Track error rates, latency
- [ ] **Feature flags configured**: Enable gradual rollout (10% → 50% → 100%)
- [ ] **Rollback script tested**: Verify instant rollback works

  ```bash
  ./rollback.sh --dry-run
  ```

- [ ] **On-call team notified**: Inform team of deployment window
- [ ] **Runbook updated**: Document troubleshooting steps

Post-deployment validation:

- [ ] **Health check passes**: Verify app responds

  ```bash
  curl https://api.example.com/health
  # Response: {"status": "ok"}
  ```

- [ ] **Error rate baseline**: Monitor for 1 hour — must be ≤ baseline (target <1%)
- [ ] **Latency baseline**: Monitor for 1 hour — p95 must be ≤ baseline (target <500ms)
- [ ] **User complaints**: Zero complaints related to refactored features
- [ ] **Business metrics**: Conversion rate, revenue, active users ≥ baseline

### Checkpoint 1: Approval to Start (Gate 1)

Required artifacts before starting any refactoring:

1. ✅ Refactoring proposal document (objectives, scope, estimated effort)
2. ✅ Test coverage report (must be ≥80%)
3. ✅ ROI calculation (effort vs impact)
4. ✅ Risk assessment (LOW/MEDIUM/HIGH/CRITICAL)
5. ✅ Rollback plan (git tags, feature flags, deployment strategy)
6. ✅ Team approval (sync meeting or async approval)

**Decision:** GO / NO-GO / DEFER

Example proposal:

```text
Refactoring Proposal: Migrate Redux ORM to Prisma

Objective: Reduce bundle size, eliminate bugs, simplify queries
Scope: User, Order, Payment modules (15 files)
Estimated Effort: 120 hours (3 weeks)
Test Coverage: 85% (PASS)
ROI: 160% in 6 months (MEDIUM priority)
Risk Level: MEDIUM (internal API changes only)
Rollback Plan: Feature flag + git tag refactor-start-20260209

Approval: APPROVED (2/3 team members)
Decision: GO - Start refactoring on 2026-02-10
```

### Checkpoint 2: Mid-Refactoring Review (Gate 2)

**Trigger:** 50% completion OR 1 week elapsed

Required validation:

1. ✅ All commits have passing tests
2. ✅ No increase in complexity metrics
3. ✅ Performance unchanged or improved
4. ✅ Code review feedback addressed
5. ✅ Timeline on track (±20% of estimate)

**Decision:** CONTINUE / ADJUST / ABORT

Example mid-review:

```text
Mid-Refactoring Review: Redux ORM to Prisma (Day 7)

Progress: 60% complete (User + Order modules migrated)
Test Status: All passing
Complexity: Reduced by 15%
Performance: 5% faster
Timeline: On track (60% at Day 7 of 15)
Blockers: None

Decision: CONTINUE
```

### Checkpoint 3: Pre-Merge Validation (Gate 3)

Required before merging to main:

1. ✅ **Functional validation checklist complete** (Phases 1-3 above)
2. ✅ **Code review approved** (2+ reviewers)
3. ✅ **Static analysis passes** (no regressions)
4. ✅ **Documentation updated** (README, API docs, changelog)
5. ✅ **Deployment plan reviewed** (rollout strategy + rollback)

**Decision:** MERGE / REVISE / REJECT

Example pre-merge summary:

```text
Pre-Merge Validation: Redux ORM to Prisma

Functional Validation: PASS (all phases complete)
Code Review: APPROVED (3 reviewers)
Static Analysis: PASS (complexity -20%, no ESLint errors)
Documentation: UPDATED (README, CHANGELOG, migration guide)
Deployment Plan: REVIEWED (staged rollout 10% to 50% to 100%)

Decision: MERGE to main
Next Step: Deploy to staging for final smoke test
```

### Checkpoint 4: Post-Deployment Validation (Gate 4)

Required 24 hours after production deployment:

1. ✅ **Error rate ≤ baseline** (monitor for 24 hours)
2. ✅ **Latency ≤ baseline** (monitor for 24 hours)
3. ✅ **Zero user complaints** (check support channels)
4. ✅ **Business metrics unchanged** (conversion, revenue)
5. ✅ **Rollback tested** (verify instant rollback works)

**Decision:** KEEP / ROLLBACK / MONITOR

Example post-deployment review:

```text
Post-Deployment Validation: Redux ORM to Prisma (24h review)

Error Rate: 0.3% (baseline: 0.5%) IMPROVED
Latency p95: 420ms (baseline: 480ms) IMPROVED
User Complaints: 0 PASS
Conversion Rate: 12.3% (baseline: 12.1%) UNCHANGED
Rollback Test: VERIFIED (instant rollback works)

Decision: KEEP - Refactoring successful
Next Step: Remove feature flag in 7 days
```

### Compliance Failure Response

If any gate fails:

1. **Gate 1 failure**: Don't start refactoring. Address gaps (tests, ROI, approval).
2. **Gate 2 failure**: Pause refactoring. Investigate timeline slippage or quality issues.
3. **Gate 3 failure**: Don't merge. Fix validation failures, request re-review.
4. **Gate 4 failure**: Initiate rollback immediately. Root cause analysis required.

**Rollback procedure:**

```bash
# Emergency rollback (instant)
kubectl rollout undo deployment/app

# Or feature flag disable
curl -X POST https://api.featureflags.io/disable/new-payment

# Verify rollback
curl https://api.example.com/health
# Response: {"status": "ok", "version": "original"}
```

### Quick Reference

**Pre-Refactoring (Gate 1):**

- [ ] Test coverage ≥80%
- [ ] Baseline captured (tests, perf, outputs)
- [ ] Rollback plan documented
- [ ] Team approval obtained

**During Refactoring (Gate 2):**

- [ ] Atomic commits (<300 lines)
- [ ] Tests pass after each commit
- [ ] Performance unchanged
- [ ] Mid-point review complete (50%)

**Pre-Merge (Gate 3):**

- [ ] Full test suite passes
- [ ] Code review approved (2+)
- [ ] Functional validation complete
- [ ] Documentation updated

**Post-Deployment (Gate 4):**

- [ ] Error rate ≤ baseline (24h)
- [ ] Latency ≤ baseline (24h)
- [ ] Zero user complaints
- [ ] Rollback tested

**Red Flags — Stop Immediately:**

- [ ] Tests failing consistently
- [ ] Performance degradation >10%
- [ ] Timeline slippage >50%
- [ ] Team losing confidence in approach
