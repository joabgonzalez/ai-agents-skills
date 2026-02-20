---
name: code-refactoring
description: "Systematic code refactoring with risk mitigation. Trigger: When refactoring legacy code, migrating technologies, or resolving technical debt."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Code Refactoring Skill

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

## Critical Patterns

### ✅ REQUIRED: Safety Snapshot Before Starting

Create safety net BEFORE touching any code.

```bash
# ✅ CORRECT: Safety snapshot workflow
# Step 1: Commit current state (clean working tree)
git add . && git commit -m "chore: snapshot before refactoring UserService"

# Step 2: Create dedicated refactor branch
git checkout -b refactor/user-service-cleanup

# Step 3: Tag current state for easy rollback
git tag refactor-start-$(date +%Y%m%d)

# Step 4: Run full test suite and capture baseline
npm test -- --coverage > baseline-test-results.txt
npm run build > baseline-build-output.txt

# Step 5: Document current metrics
echo "Complexity: $(npx complexity-report src/)" > baseline-metrics.txt
echo "Bundle size: $(du -h dist/)" >> baseline-metrics.txt

# NOW safe to start refactoring
```

**Why this matters:**

- Instant rollback with `git checkout refactor-start-YYYYMMDD`
- Baseline comparison proves improvement
- Clean separation from feature work
- Psychological safety to experiment

### ✅ REQUIRED: Test Coverage Before Refactoring

Never refactor production code without test coverage.

```typescript
// ❌ WRONG: Refactoring without tests
function processPayment(amount: number, userId: string) {
  // Complex legacy logic with no tests
  const fee = amount * 0.029 + 0.30;
  return amount + fee;
}
// ← Refactoring this without tests is DANGEROUS

// ✅ CORRECT: Add characterization tests first
import { describe, test, expect } from 'bun:test';

describe('processPayment', () => {
  test('calculates correct fee for $100', () => {
    expect(processPayment(100, 'user-123')).toBe(103.20);
  });

  test('handles edge case: $0 amount', () => {
    expect(processPayment(0, 'user-123')).toBe(0.30);
  });
});

// NOW safe to refactor with test safety net
```

**Requirements:**

- Minimum 80% unit test coverage
- 60% integration test coverage for critical paths
- Characterization tests documenting current behavior
- All tests passing before starting refactor

### ✅ REQUIRED: Incremental Changes with Atomic Commits

Make small, verifiable changes. Commit at every stable state.

```typescript
// ❌ WRONG: Massive refactor in one commit
// Commit: "Refactor payment system" (500 files changed)
// ← Unreviewable, hard to rollback, high risk

// ✅ CORRECT: Incremental commits with clear purpose
// Commit 1: "Extract calculateFee() from processPayment"
function calculateFee(amount: number): number {
  return amount * 0.029 + 0.30;
}

function processPayment(amount: number, userId: string) {
  const fee = calculateFee(amount);
  return amount + fee;
}
// Tests pass ✓

// Commit 2: "Replace magic numbers with named constants"
const STRIPE_RATE = 0.029;
const STRIPE_FIXED_FEE = 0.30;

function calculateFee(amount: number): number {
  return amount * STRIPE_RATE + STRIPE_FIXED_FEE;
}
// Tests pass ✓

// Commit 3: "Add fee calculation validation"
// ... and so on
```

**Target sizes:**

- Functions: <50 lines
- Methods: <20 lines
- Classes: <200 lines
- Single commit: <300 lines changed (reviewable diff)

### ✅ REQUIRED: Feature Flags for Safe Migration

Use feature flags to enable runtime switching between old/new implementations.

```typescript
// ❌ WRONG: Big-bang replacement
import { NewPaymentService } from './new-payment';
export const paymentService = new NewPaymentService();
// ← All users immediately use new code (HIGH RISK)

// ✅ CORRECT: Feature flag with gradual rollout
import { config } from './config';
import { LegacyPaymentService } from './legacy-payment';
import { NewPaymentService } from './new-payment';

export const paymentService = config.featureFlags.useNewPayment
  ? new NewPaymentService()
  : new LegacyPaymentService();

// Rollout strategy:
// Week 1: 5% of users
// Week 2: 25% of users
// Week 3: 50% of users
// Week 4: 100% of users (remove flag)
```

**Pattern: Strangler Fig**

```typescript
// Facade over legacy + new implementation
class PaymentFacade {
  constructor(
    private legacy: LegacyPaymentService,
    private modern: NewPaymentService,
    private featureFlags: FeatureFlags
  ) {}

  async processPayment(amount: number, userId: string) {
    if (this.featureFlags.isEnabled('new-payment', userId)) {
      return this.modern.processPayment(amount, userId);
    }
    return this.legacy.processPayment(amount, userId);
  }
}
```

### ✅ REQUIRED: Preserve Behavior During Refactoring

Refactoring changes HOW code works, not WHAT it does.

```typescript
// ❌ WRONG: Changing behavior during refactor
// Before: Returns null on error
function getUser(id: string): User | null {
  try {
    return database.findUser(id);
  } catch {
    return null; // ← Original behavior
  }
}

// After: Now throws exception (BREAKING CHANGE)
function getUser(id: string): User {
  return database.findUser(id); // ← Changed behavior!
}

// ✅ CORRECT: Preserve original behavior
// Before
function getUser(id: string): User | null {
  try {
    return database.findUser(id);
  } catch {
    return null;
  }
}

// After (refactored but same behavior)
function getUser(id: string): User | null {
  const result = findUserById(id); // Extracted to helper
  return result ?? null; // Same null-on-error behavior
}

function findUserById(id: string): User | undefined {
  try {
    return database.findUser(id);
  } catch {
    return undefined;
  }
}
```

**Rule:** If behavior must change, do it in a separate commit AFTER refactoring.

### ✅ REQUIRED: Automated Refactoring Tools (Efficiency)

Use automation for mechanical transformations. Save manual effort for logic improvements.

```bash
# ✅ CORRECT: Automated rename (safe, instant)
# TypeScript/JavaScript: Use IDE or ts-morph
npx ts-morph rename --symbol "oldFunctionName" --new-name "newFunctionName"

# Python: Use rope
python -m rope.refactor.rename old_function new_function src/

# ❌ WRONG: Manual find-replace (error-prone)
# You'll miss: comments, string literals, dynamic references
```

**Safe automated refactorings:**

1. **Rename Symbol** (variable, function, class)
   - IDE: F2 (VS Code), Shift+F6 (IntelliJ)
   - Updates all references, imports, and exports

2. **Extract Function/Method**
   - Select code block → Right-click → Extract Function
   - Automatically detects parameters and return type

3. **Inline Variable**
   - Replace single-use variable with its value
   - Reduces unnecessary indirection

4. **Move File/Module**
   - IDE handles import path updates across codebase
   - Manual moves WILL break imports

5. **Change Signature**
   - Add/remove/reorder parameters
   - IDE updates all call sites

```typescript
// Example: Extract method (automated)
// Before
function processOrder(order: Order) {
  // Select lines 2-5 → Extract Method
  const tax = order.subtotal * 0.08;
  const shipping = order.weight > 5 ? 15 : 5;
  const total = order.subtotal + tax + shipping;

  return { ...order, total };
}

// After (IDE generates this)
function processOrder(order: Order) {
  const total = calculateTotal(order);
  return { ...order, total };
}

function calculateTotal(order: Order): number {
  const tax = order.subtotal * 0.08;
  const shipping = order.weight > 5 ? 15 : 5;
  return order.subtotal + tax + shipping;
}
```

**Efficiency gains:**

- Rename: 30 seconds (automated) vs 20 minutes (manual)
- Extract function: 10 seconds vs 5 minutes
- Move file: 5 seconds vs 15 minutes (updating imports)
- Change signature: 15 seconds vs 30 minutes

### ✅ REQUIRED: Dependency Snapshot for Rollback Safety

Lock dependencies before refactoring to prevent "works on my machine" issues.

```bash
# ✅ CORRECT: Lock dependencies before refactoring
# Node.js
npm ci  # Install exact versions from package-lock.json

# Python
pip freeze > requirements-lock.txt
pip install -r requirements-lock.txt

# Ruby
bundle install --frozen

# ❌ WRONG: Using latest dependencies during refactor
npm install  # ← Can pull new versions, adding variables
```

**Why this matters:**

- Refactoring + dependency update = 2 variables (debugging nightmare)
- Separate concerns: Refactor first, update dependencies later
- Reproducible builds across team and CI/CD

### ✅ REQUIRED: Gradual Type Introduction (TypeScript Migration)

For JS→TS migration, use `// @ts-check` for incremental type safety WITHOUT file conversion.

```javascript
// ✅ CORRECT: Phase 0 - Type checking without conversion
// Before: user.js (JavaScript)
// @ts-check  ← Add this comment for instant type checking

/**
 * @param {string} userId
 * @param {number} amount
 * @returns {Promise<{success: boolean, transactionId: string}>}
 */
async function processPayment(userId, amount) {
  // TypeScript now checks this file for type errors
  return { success: true, transactionId: 'txn_123' };
}

// TypeScript catches errors:
processPayment('user-1', '100');  // ❌ Error: '100' is not a number
processPayment('user-1', 100);    // ✅ Valid
```

**Migration phases:**

1. **Phase 0**: Add `// @ts-check` to JS files (zero conversion)
2. **Phase 1**: Add JSDoc types to public APIs
3. **Phase 2**: Rename `.js` → `.ts` (one file at a time)
4. **Phase 3**: Replace JSDoc with TypeScript types
5. **Phase 4**: Enable `strict: true` incrementally

**Efficiency:** Each file gets type safety BEFORE conversion (catch bugs early).

**Rule:** If behavior must change, do it in a separate commit AFTER refactoring.

### ✅ REQUIRED: ROI-Based Prioritization

Calculate effort vs impact before starting.

```markdown
## Refactoring Initiative: Migrate from Redux ORM to Prisma

**Effort Estimate:** 120 hours (3 weeks)

**Impact Analysis:**
- Reduces bundle size by 45KB (faster page loads)
- Eliminates 12 known bugs in Redux ORM selectors
- Simplifies onboarding (Prisma is standard, Redux ORM is obscure)
- Reduces query complexity (no manual normalization)

**ROI Calculation:**
- Developer time saved: 8 hours/week (no Redux ORM debugging)
- First-month ROI: 32 hours saved / 120 hours = 27% (LOW)
- 6-month ROI: 192 hours saved / 120 hours = 160% (MEDIUM)

**Decision:** PROCEED with phased migration (module-by-module)
**Priority:** Medium (schedule for next quarter)
```

**Quick Wins (Prioritize First):**

- 1-2 weeks effort
- 250-375% first-month ROI
- Example: Extract repeated validation logic into shared utility

**Medium-Term:**

- 1-3 months effort
- 100-200% 3-month ROI
- Example: Technology migration (JS→TS)

**Long-Term:**

- 3-12 months effort
- 50-100% 6-month ROI
- Example: Framework migration (monolith→microservices)

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

## Examples

### JavaScript → TypeScript

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
// Before
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// After Phase 2
interface DataItem {
  value: number;
  label: string;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}

// Phase 3: Enable strict mode incrementally
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Redux ORM Removal

```typescript
// Phase 1: Create facade over Redux ORM
class UserRepository {
  constructor(private orm: ReduxORM) {}

  findById(id: string): User | null {
    return this.orm.User.withId(id)?.ref ?? null;
  }
}

// Phase 2: Implement replacement (Prisma)
class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

// Phase 3: Feature flag switching
const userRepo = config.featureFlags.usePrisma
  ? new PrismaUserRepository(prisma)
  : new UserRepository(orm);

// Phase 4: Migrate module-by-module
// Module A: userRepo uses Prisma ✓
// Module B: userRepo uses Redux ORM (pending migration)
// Module C: userRepo uses Prisma ✓

// Phase 5: Remove Redux ORM once 100% migrated
```

### Callbacks → Async/Await

```typescript
// Before: Nested callbacks (pyramid of doom)
function fetchUserData(userId, callback) {
  db.getUser(userId, (err, user) => {
    if (err) return callback(err);
    db.getOrders(user.id, (err, orders) => {
      if (err) return callback(err);
      db.getPayments(user.id, (err, payments) => {
        if (err) return callback(err);
        callback(null, { user, orders, payments });
      });
    });
  });
}

// After: Sequential async/await (flat structure)
async function fetchUserData(userId: string) {
  const user = await db.getUser(userId);
  const orders = await db.getOrders(user.id);
  const payments = await db.getPayments(user.id);
  return { user, orders, payments };
}
```

### Redux Classic → Redux Toolkit + RTK Query

```typescript
// Phase 1: Install Redux Toolkit alongside classic Redux
// npm install @reduxjs/toolkit react-redux

// Phase 2: Create RTK slice (parallel to existing reducers)
// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  currentUser: User | null;
  loading: boolean;
}

const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, loading: false } as UserState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;  // ← Immer enables mutations
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// Phase 3: Replace classic reducer with RTK slice (one at a time)
// Before (classic Redux)
const rootReducer = combineReducers({
  user: userReducer,        // ← Old reducer
  orders: ordersReducer,    // ← Old reducer
});

// After (mixed: RTK + classic during migration)
import userSlice from './slices/userSlice';

const rootReducer = combineReducers({
  user: userSlice,          // ← New RTK slice
  orders: ordersReducer,    // ← Still old (migrate next)
});

// Phase 4: Add RTK Query for data fetching
// store/api/userApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = userApi;

// Phase 5: Configure store with RTK Query middleware
import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './api/userApi';
import userSlice from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userSlice,
    [userApi.reducerPath]: userApi.reducer,  // ← RTK Query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),  // ← RTK Query middleware
});

// Phase 6: Migrate components to RTK Query hooks
// Before (classic Redux with manual fetching)
function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    dispatch(fetchUser(userId));  // ← Thunk action
  }, [userId]);

  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}

// After (RTK Query with auto-caching)
function UserProfile({ userId }) {
  const { data: user, isLoading } = useGetUserQuery(userId);  // ← Auto-fetch, auto-cache

  if (isLoading) return <Loading />;
  return <div>{user.name}</div>;
}

// Phase 7: Remove old thunks and action creators once all components migrated
// Delete: actions/userActions.js, reducers/userReducer.js, middleware/thunks.js
```

**Benefits:**

- Immer integration (mutate state directly in reducers)
- Built-in thunk middleware (no extra setup)
- RTK Query eliminates manual data fetching (auto-caching, auto-refetching)
- Reduced boilerplate (no action types, action creators)
- TypeScript support out of the box

### Adding Tests to Legacy Code (Technical Debt)

```typescript
// Problem: Legacy code with zero tests
// Before
function calculateDiscount(price: number, userType: string) {
  if (userType === 'premium') {
    return price * 0.8;  // 20% discount
  } else if (userType === 'standard') {
    return price * 0.95;  // 5% discount
  }
  return price;
}

// Phase 1: Add characterization tests (document current behavior)
import { describe, test, expect } from 'bun:test';

describe('calculateDiscount', () => {
  test('premium users get 20% discount', () => {
    expect(calculateDiscount(100, 'premium')).toBe(80);
  });

  test('standard users get 5% discount', () => {
    expect(calculateDiscount(100, 'standard')).toBe(95);
  });

  test('unknown user types get no discount', () => {
    expect(calculateDiscount(100, 'guest')).toBe(100);
  });

  // Characterization tests: capture edge cases even if behavior is wrong
  test('negative prices return negative discount (BUG)', () => {
    expect(calculateDiscount(-100, 'premium')).toBe(-80);  // ← Documents bug
  });

  test('empty string userType returns full price', () => {
    expect(calculateDiscount(100, '')).toBe(100);
  });
});

// Phase 2: Refactor with test safety net
// Now safe to improve because tests capture current behavior
function calculateDiscount(price: number, userType: string): number {
  // Add input validation (new behavior, separate commit)
  if (price < 0) throw new Error('Price cannot be negative');

  const discounts: Record<string, number> = {
    premium: 0.2,
    standard: 0.05,
  };

  const discount = discounts[userType] ?? 0;
  return price * (1 - discount);
}

// Phase 3: Add proper unit tests for new behavior
test('throws error for negative prices', () => {
  expect(() => calculateDiscount(-100, 'premium')).toThrow('Price cannot be negative');
});

// Phase 4: Gradually increase coverage
// Target: 80% coverage minimum
// Use coverage tools to identify untested branches
// npm test -- --coverage

// Prioritize testing:
// 1. Business-critical paths (payment, auth, data integrity)
// 2. Bug-prone areas (complex conditionals, edge cases)
// 3. Frequently changed code (high churn)
```

**Strategy for Legacy Codebases:**

1. **Golden Master Testing** - Capture current outputs (even if buggy) with characterization tests
2. **Approval Testing** - Record API responses, screenshots, or outputs as "approved" baselines
3. **Test Pyramid Inversion** - Start with integration/E2E tests (easier for legacy), add unit tests later
4. **Seams Strategy** - Introduce test seams (dependency injection, interfaces) without changing logic
5. **Parallel Test Development** - Write tests in parallel with refactoring (not before)

**Tools for Legacy Code Testing:**

```bash
# Golden master testing
npm install --save-dev jest-image-snapshot  # Visual regression
npm install --save-dev @pact-foundation/pact  # API contract testing

# Code coverage
npm test -- --coverage --coverageThreshold='{"global":{"branches":80}}'

# Mutation testing (verify test quality)
npx stryker run  # Kills mutants to check if tests catch bugs
```

## Conventions

### Parallel Refactoring with Git Worktrees

Work on multiple refactoring branches simultaneously without switching.

```bash
# ✅ CORRECT: Parallel refactoring with worktrees
# Main codebase in ~/project
cd ~/project

# Create worktree for refactor A (user-service)
git worktree add ../project-refactor-user-service refactor/user-service

# Create worktree for refactor B (payment-module)
git worktree add ../project-refactor-payment refactor/payment-module

# Now you have 3 independent working directories:
# ~/project (main branch)
# ~/project-refactor-user-service (refactor/user-service branch)
# ~/project-refactor-payment (refactor/payment-module branch)

# Work on both refactors in parallel (different terminal windows/IDE instances)
# No git checkout needed, no stashing, no context switching
```

**Benefits:**

- Run tests for both refactors simultaneously
- Compare implementations side-by-side
- No risk of uncommitted work conflicts
- 2-3x faster for multi-module refactors

### Codemod Scripts for Bulk Refactoring

For repetitive transformations across 50+ files, write codemod scripts.

```javascript
// codemod-replace-moment-with-datefns.js
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find: import moment from 'moment'
  // Replace: import { format } from 'date-fns'
  root
    .find(j.ImportDeclaration, {
      source: { value: 'moment' },
    })
    .replaceWith(() =>
      j.importDeclaration(
        [j.importSpecifier(j.identifier('format'))],
        j.literal('date-fns')
      )
    );

  // Find: moment(date).format('YYYY-MM-DD')
  // Replace: format(date, 'yyyy-MM-dd')
  root
    .find(j.CallExpression, {
      callee: { name: 'moment' },
    })
    .replaceWith((path) => {
      const arg = path.value.arguments[0];
      return j.callExpression(j.identifier('format'), [
        arg,
        j.literal('yyyy-MM-dd'),
      ]);
    });

  return root.toSource();
};

// Run across entire codebase
// npx jscodeshift -t codemod-replace-moment-with-datefns.js src/
```

**When to use codemods:**

- 50+ files need identical transformation
- Pattern is mechanical (no logic decisions)
- High risk of manual error (typos, missed files)

**Examples:**

- Replace deprecated API with new API
- Update import paths after restructure
- Convert class components to hooks
- Rename props across component tree

### Refactoring Metrics Dashboard

Track refactoring progress with automated metrics.

```bash
# Create refactoring dashboard script
# scripts/refactor-metrics.sh

echo "=== Refactoring Progress Dashboard ==="
echo ""

echo "📊 Code Complexity:"
npx complexity-report src/ --format minimal

echo ""
echo "📦 Bundle Size:"
npm run build --silent
du -h dist/bundle.js

echo ""
echo "✅ Test Coverage:"
npm test -- --coverage --silent | grep "All files"

echo ""
echo "🐛 ESLint Errors:"
npx eslint src/ --format compact | grep "error" | wc -l

echo ""
echo "⚠️  TypeScript Errors:"
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

echo ""
echo "📝 TODO Count:"
grep -r "// TODO" src/ | wc -l

# Run daily: npm run refactor:metrics
```

**Track improvements over time:**

- Complexity: Target <10 per function
- Bundle size: Aim for 10-20% reduction
- Test coverage: Increase from 60% → 80%
- Errors: Decrease ESLint/TS errors to zero
- TODOs: Reduce by 50% after refactor

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

## Workflow

### Approval Gates for High-Risk Refactors

Define approval requirements based on risk level.

```markdown
## Risk Level Assessment

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

Deploy refactored code to small percentage of users first.

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

Configure automated rollback based on metrics.

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

For high-risk refactors, use structured pair programming.

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
- Complex architectural changes (monolith→microservices)
- Learning opportunity (junior + senior pairing)

## Checklist

Use this checklist to **guarantee functionality preservation** after refactoring.

### Phase 1: Baseline Capture (BEFORE Refactoring)

**Capture current behavior for comparison:**

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

  ```markdown
  # Edge Cases
  1. Empty array → returns []
  2. Null user ID → throws ValidationError
  3. Negative amount → returns 0
  ```

- [ ] **Export database state**: Snapshot DB for rollback

  ```bash
  pg_dump mydb > baseline-db.sql
  ```

### Phase 2: Refactoring with Validation Gates

**Validate after EACH atomic change:**

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
  # Compare: current should be ≤ baseline latency
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

**Final validation before merge:**

- [ ] **Full test suite passes**: All tests green

  ```bash
  npm test -- --coverage --watchAll=false
  # Coverage must be ≥ baseline (no decrease)
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

**Pre-deployment checklist:**

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

**Post-deployment validation:**

- [ ] **Health check passes**: Verify app responds

  ```bash
  curl https://api.example.com/health
  # Response: {"status": "ok"}
  ```

- [ ] **Error rate baseline**: Monitor for 1 hour

  ```
  Error rate < 1% (must be ≤ baseline)
  ```

- [ ] **Latency baseline**: Monitor for 1 hour

  ```
  p95 latency < 500ms (must be ≤ baseline)
  ```

- [ ] **User complaints**: Check support channels

  ```
  Zero complaints related to refactored features
  ```

- [ ] **Business metrics**: Verify KPIs unchanged

  ```
  Conversion rate, revenue, active users ≥ baseline
  ```

### Compliance Protocol

**Mandatory checkpoints to guarantee safety.**

### Checkpoint 1: Approval to Start (GATE 1)

**Required artifacts:**

1. ✅ Refactoring proposal document (objectives, scope, estimated effort)
2. ✅ Test coverage report (must be ≥80%)
3. ✅ ROI calculation (effort vs impact)
4. ✅ Risk assessment (LOW/MEDIUM/HIGH/CRITICAL)
5. ✅ Rollback plan (git tags, feature flags, deployment strategy)
6. ✅ Team approval (sync meeting or async approval)

**Decision:** GO / NO-GO / DEFER

**Example:**

```markdown
# Refactoring Proposal: Migrate Redux ORM to Prisma

**Objective:** Reduce bundle size, eliminate bugs, simplify queries
**Scope:** User, Order, Payment modules (15 files)
**Estimated Effort:** 120 hours (3 weeks)
**Test Coverage:** 85% (PASS)
**ROI:** 160% in 6 months (MEDIUM priority)
**Risk Level:** MEDIUM (internal API changes only)
**Rollback Plan:** Feature flag + git tag refactor-start-20260209

**Approval:** ✅ APPROVED (2/3 team members)
**Decision:** GO - Start refactoring on 2026-02-10
```

### Checkpoint 2: Mid-Refactoring Review (GATE 2)

**Trigger:** 50% completion OR 1 week elapsed

**Required validation:**

1. ✅ All commits have passing tests
2. ✅ No increase in complexity metrics
3. ✅ Performance unchanged or improved
4. ✅ Code review feedback addressed
5. ✅ Timeline on track (±20% of estimate)

**Decision:** CONTINUE / ADJUST / ABORT

**Example:**

```markdown
# Mid-Refactoring Review: Redux ORM → Prisma (Day 7)

**Progress:** 60% complete (User + Order modules migrated)
**Test Status:** All passing ✅
**Complexity:** Reduced by 15% ✅
**Performance:** 5% faster ✅
**Timeline:** On track (60% at Day 7 of 15) ✅
**Blockers:** None

**Decision:** ✅ CONTINUE
```

### Checkpoint 3: Pre-Merge Validation (GATE 3)

**Required before merging to main:**

1. ✅ **Functional validation checklist complete** (Phase 1-3 above)
2. ✅ **Code review approved** (2+ reviewers)
3. ✅ **Static analysis passes** (no regressions)
4. ✅ **Documentation updated** (README, API docs, changelog)
5. ✅ **Deployment plan reviewed** (rollout strategy + rollback)

**Decision:** MERGE / REVISE / REJECT

**Example:**

```markdown
# Pre-Merge Validation: Redux ORM → Prisma

**Functional Validation:** ✅ PASS (all phases complete)
**Code Review:** ✅ APPROVED (3 reviewers)
**Static Analysis:** ✅ PASS (complexity -20%, no ESLint errors)
**Documentation:** ✅ UPDATED (README, CHANGELOG, migration guide)
**Deployment Plan:** ✅ REVIEWED (staged rollout 10%→50%→100%)

**Decision:** ✅ MERGE to main
**Next Step:** Deploy to staging for final smoke test
```

### Checkpoint 4: Post-Deployment Validation (GATE 4)

**Required 24 hours after production deployment:**

1. ✅ **Error rate ≤ baseline** (monitor for 24 hours)
2. ✅ **Latency ≤ baseline** (monitor for 24 hours)
3. ✅ **Zero user complaints** (check support channels)
4. ✅ **Business metrics unchanged** (conversion, revenue)
5. ✅ **Rollback tested** (verify instant rollback works)

**Decision:** KEEP / ROLLBACK / MONITOR

**Example:**

```markdown
# Post-Deployment Validation: Redux ORM → Prisma (24h review)

**Error Rate:** 0.3% (baseline: 0.5%) ✅ IMPROVED
**Latency p95:** 420ms (baseline: 480ms) ✅ IMPROVED
**User Complaints:** 0 ✅ PASS
**Conversion Rate:** 12.3% (baseline: 12.1%) ✅ UNCHANGED
**Rollback Test:** ✅ VERIFIED (instant rollback works)

**Decision:** ✅ KEEP - Refactoring successful
**Next Step:** Remove feature flag in 7 days
```

### Compliance Failure Response

**If any gate fails:**

1. **GATE 1 failure**: Don't start refactoring. Address gaps (tests, ROI, approval).
2. **GATE 2 failure**: Pause refactoring. Investigate timeline slippage or quality issues.
3. **GATE 3 failure**: Don't merge. Fix validation failures, request re-review.
4. **GATE 4 failure**: Initiate rollback immediately. Root cause analysis required.

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

**Simplified checklist for quick reference:**

### Pre-Refactoring (GATE 1)

- [ ] Test coverage ≥80%
- [ ] Baseline captured (tests, perf, outputs)
- [ ] Rollback plan documented
- [ ] Team approval obtained

### During Refactoring (GATE 2)

- [ ] Atomic commits (<300 lines)
- [ ] Tests pass after each commit
- [ ] Performance unchanged
- [ ] Mid-point review complete (50%)

### Pre-Merge (GATE 3)

- [ ] Full test suite passes
- [ ] Code review approved (2+)
- [ ] Functional validation complete
- [ ] Documentation updated

### Post-Deployment (GATE 4)

- [ ] Error rate ≤ baseline (24h)
- [ ] Latency ≤ baseline (24h)
- [ ] Zero user complaints
- [ ] Rollback tested

**Red Flags - Stop Immediately:**

- [ ] Tests failing consistently
- [ ] Performance degradation >10%
- [ ] Timeline slippage >50%
- [ ] Team losing confidence in approach

## Resources

- [code-conventions](../code-conventions/SKILL.md) - Code organization and naming
- [architecture-patterns](../architecture-patterns/SKILL.md) - SOLID, DDD, Clean Architecture
- [typescript](../typescript/SKILL.md) - Type-safe refactoring
- [systematic-debugging](../systematic-debugging/SKILL.md) - Root cause analysis
- [unit-testing](../unit-testing/SKILL.md) - Test coverage strategies
- https://refactoring.guru/ - Refactoring patterns catalog
- https://martinfowler.com/refactoring/ - Refactoring best practices
- https://www.industriallogic.com/xp/refactoring/ - Incremental refactoring techniques
