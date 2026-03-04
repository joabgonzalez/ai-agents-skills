# Deployment Safety

Approval gates, canary deployments, automated rollback, and pair programming for high-risk refactoring deployments.

## Core Patterns

### Approval Gates for High-Risk Refactors

Define approval requirements based on risk level before scheduling any deployment.

```markdown
### Risk Level Assessment

**LOW RISK** (single approval):
- Single file, <100 lines changed
- No external API changes
- Test coverage 90%+
- Examples: Extract method, rename variable

**MEDIUM RISK** (2 approvals + automated checks):
- Multiple files, <500 lines changed
- Internal API changes only
- Test coverage 80%+
- Examples: Module restructure, dependency update

**HIGH RISK** (3 approvals + manual QA):
- Codebase-wide changes, 500+ lines
- External API breaking changes
- Test coverage 70-80%
- Examples: Framework migration, architecture change

**CRITICAL RISK** (Architecture review + staged rollout):
- Production-critical paths
- Database schema changes
- Authentication/authorization refactor
- Payment processing changes
```

### Canary Deployment for Refactored Code

Deploy refactored code to a small percentage of users first to validate behavior before full rollout.

```yaml
# Kubernetes canary deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-refactored
spec:
  replicas: 1  # 10% of traffic (original has 9 replicas)
  template:
    metadata:
      labels:
        version: refactored
    spec:
      containers:
        - name: app
          image: app:refactored

---
# Original deployment (90% of traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-original
spec:
  replicas: 9
  template:
    metadata:
      labels:
        version: original
```

**Rollout strategy:**

1. 10% traffic for 24 hours (monitor error rates)
2. 25% traffic for 24 hours
3. 50% traffic for 24 hours
4. 100% traffic (remove original)

**Rollback triggers:**

- Error rate increase >5%
- Latency increase >20%
- User complaints >3

### Automated Rollback on Failure

Configure automated rollback based on metrics thresholds.

```javascript
// monitoring/auto-rollback.js
const metrics = await getMetrics('app-refactored', '1h');

const rollbackConditions = [
  metrics.errorRate > 0.05, // 5% error rate
  metrics.p95Latency > 1000, // 1 second p95
  metrics.requestCount < 100, // No traffic (routing issue)
];

if (rollbackConditions.some((condition) => condition)) {
  console.error('Rollback triggered due to metrics degradation');
  await kubectl.rollback('app-refactored');
  await alertTeam('Automatic rollback executed');
}
```

**Safety metrics to monitor:**

- Error rate (HTTP 5xx)
- Response time (p50, p95, p99)
- Request count (detect routing issues)
- Memory usage (detect leaks)
- CPU usage (detect infinite loops)

### Refactoring Pair Programming Protocol

For high-risk refactors, use structured pair programming to reduce errors and transfer knowledge.

**Roles:**

- **Driver**: Writes code, makes incremental changes
- **Navigator**: Reviews patterns, suggests alternatives, watches for risks

**Protocol:**

1. **Planning (15 min)**: Navigator outlines refactoring plan
2. **Execution (45 min)**: Driver implements, Navigator reviews
3. **Test Validation (10 min)**: Both verify tests pass
4. **Switch Roles (every hour)**: Fresh perspective

**Benefits:**

- Real-time code review (catch issues immediately)
- Knowledge transfer (both learn refactoring patterns)
- Reduced risk (two brains > one)
- Faster completion (fewer rework cycles)

**When to use:**

- Mission-critical code (payment, auth, data integrity)
- Unfamiliar codebase (legacy system with no docs)
- Complex architectural changes (monolith to microservices)
- Learning opportunity (junior + senior pairing)
