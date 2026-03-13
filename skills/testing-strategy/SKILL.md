---
name: testing-strategy
description: "Test planning, pyramid decisions, and coverage strategy. Trigger: When deciding what to test, choosing test types, or auditing testing gaps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
  skills:
    - unit-testing
    - e2e-testing
---

# Testing Strategy

Decide what to test, which test type to use, and how much coverage is enough. Strategy layer above tool-specific skills.

## When to Use

- Deciding unit vs integration vs E2E for a feature
- Planning test coverage before writing tests
- Auditing existing tests for gaps
- Producing a test plan for a PR or feature

Don't use for:

- Writing actual unit tests (use `unit-testing` or `jest`)
- Writing React component tests (use `react-testing-library`)
- Writing E2E tests (use `playwright` or `e2e-testing`)
- Verifying evidence after tests run (use `verification-protocol`)

---

## Critical Patterns

### ✅ REQUIRED: Testing Pyramid — Ratio and When to Use Each

```
        /\
       /  \       E2E — few, slow, high confidence
      / E2E\      Critical user journeys only
     /------\
    /        \    Integration — some, medium speed
   / Integr. \   Components working together (API + DB)
  /------------\
 /              \  Unit — many, fast, focused
/   Unit Tests   \ Pure logic, no I/O, no DB, no network
/‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

```
Unit tests (many, fast, focused)
  → Pure functions, business logic, error handling, edge cases
  → No I/O, no DB, no network — test logic in isolation

Integration tests (some, medium speed)
  → API endpoint + DB together, service interactions, cache behavior
  → Test that components work together correctly, not just individually

E2E tests (few, slow, high confidence)
  → Critical user journeys only: checkout, login, core workflows
  → Browser-level confidence that the full stack works end-to-end
```

Rule: if a unit test can prove the same thing, don't write an integration test. If an integration test can prove it, don't write an E2E test. Each level up is slower and more brittle.

```markdown
# ✅ CORRECT: Right test for the right level

calculateDiscount(price, rate) → unit test (pure function)
POST /orders creates order in DB → integration test (needs DB)
User completes checkout → E2E test (needs full browser flow)

# ❌ WRONG: Testing everything at the wrong level

calculateDiscount(price, rate) → E2E test (overkill, slow, brittle)
Full checkout flow → 50 unit tests (can't catch integration issues)
```

### ✅ REQUIRED: Coverage Priorities — What to Test vs Skip

**Always test:**

- Business-critical paths (revenue, auth, data writes)
- Error handling (what happens when things fail?)
- Security boundaries (auth checks, input validation)
- Data integrity (transformations, calculations, persistence)
- Edge cases: null/undefined, empty arrays, boundary values, concurrent access

**Skip:**

- Trivial getters/setters with no logic
- Framework and library internals (they have their own tests)
- Generated code (ORM models, protobuf output, migration files)
- One-off scripts not used in production
- UI snapshots for frequently-changing components (high maintenance, low signal)

**Coverage % is a vanity metric.** 80% coverage of error paths and business logic is better than 95% coverage that includes trivial getters. Aim for:

- Critical paths: 90%+
- Supporting/utility code: 70%+
- Framework glue code: skip

### ✅ REQUIRED: Component-Specific Strategies

**API endpoints:**

- Unit: business logic, validation rules, error conditions (no HTTP layer)
- Integration: full request → handler → DB → response (with real DB or test container)
- E2E: only for auth flows and critical multi-endpoint sequences

**Frontend components:**

- Unit: state logic, derived values, event handlers in isolation
- Component (RTL/RNTL): render + user interaction + assertion (no real API)
- E2E: only for critical user journeys that span multiple pages

**Data transformations and pipelines:**

- Unit: input → output for each transformation step
- Include representative valid inputs, malformed inputs, and boundary values
- Test idempotency if the transformation is applied multiple times

**Auth and security:**

- Integration tests for both valid credentials and invalid/expired/tampered cases
- Never mock the auth layer in security tests — test the real implementation

### ✅ REQUIRED: Test Plan Deliverable

Before writing tests for a feature, produce a test plan:

```markdown
## Test Plan: User Registration

| Component         | Test Type   | What to Verify                              | Coverage Target |
|-------------------|-------------|---------------------------------------------|-----------------|
| validateEmail()   | Unit        | Valid/invalid formats, empty, SQL chars     | 100%            |
| hashPassword()    | Unit        | Output length, irreversibility, salt unique | 100%            |
| POST /users       | Integration | 201 on success, 409 on duplicate, 400 on invalid | 90%        |
| /register page    | Component   | Form renders, validation messages, submit   | 80%             |
| Full signup flow  | E2E         | Happy path only                             | 1 test          |

## Gaps in Existing Coverage
- hashPassword() has no test for empty string input
- 409 duplicate email case not covered
```

Identify gaps in existing tests before writing new ones — filling gaps yields more value than adding tests to already-covered code.

---

## Decision Tree

```
Choosing test type for a piece of code?
  → Pure function, no I/O?
    → Unit test
  → Needs DB, API, or multiple services working together?
    → Integration test
  → Needs a real browser and full user flow?
    → E2E test (only for critical journeys)

What to test first?
  → Business-critical paths (revenue, auth, data writes)
  → Error handling and failure cases
  → Edge cases (null, empty, overflow, concurrent)
  → Happy path last (usually covered by higher-level tests already)

Setting coverage targets?
  → Critical paths (auth, payments, data writes): 90%+
  → Supporting utilities: 70%+
  → Framework glue, generated code: skip

Writing a test plan for a feature?
  → List components → assign test type → identify gaps → write table
  → Check existing tests for gaps before adding new ones

Writing actual tests?
  → Unit/Jest → use unit-testing or jest skill
  → React components → use react-testing-library skill
  → E2E → use playwright or e2e-testing skill
  → After running → use verification-protocol skill
```

---

## Example

Test plan for a payment processing feature.

```markdown
## Test Plan: Payment Processing

| Component            | Test Type   | What to Verify                                     | Target |
|----------------------|-------------|---------------------------------------------------|--------|
| calculateTotal()     | Unit        | Subtotal + tax + shipping, discount application   | 100%   |
| validateCard()       | Unit        | Luhn check, expiry validation, empty inputs       | 100%   |
| PaymentService       | Unit        | Error mapping, retry logic, idempotency key gen   | 90%    |
| POST /payments       | Integration | Success + provider response, card decline (402),  | 90%    |
|                      |             | duplicate idempotency key (200 cached)            |        |
| PaymentForm          | Component   | Field rendering, inline errors, submit disabled   | 80%    |
|                      |             | while processing, success state                   |        |
| Checkout flow        | E2E         | Happy path: cart → shipping → payment → confirm   | 1 test |

## Gaps Found in Existing Code
- calculateTotal() has no test for negative discount values
- POST /payments missing test for network timeout (should return 503)
- No test verifying idempotency key is sent on retry
```

---

## Edge Cases

**All unit tests passing but integration fails:** The seam between components is untested. Add integration tests at the boundary (typically the API + DB layer). Don't add more unit tests.

**E2E tests are flaky:** Flakiness usually indicates timing issues or test data collisions, not bad test strategy. Use stable selectors, proper waits, and isolated test data. Don't lower confidence by skipping E2E — fix the root cause.

**100% coverage but bugs in production:** Coverage measures lines executed, not correctness. A test that calls a function but asserts nothing contributes to coverage without providing value. Review test assertions, not just coverage numbers.

**No spec — what to test?** Start with observable behavior: what does the code do that users or callers depend on? Test that. Avoid testing implementation details that may change.

---

## Resources

- [unit-testing](../unit-testing/SKILL.md) — AAA pattern, isolation, mock boundaries
- [jest](../jest/SKILL.md) — Jest-specific patterns and matchers
- [react-testing-library](../react-testing-library/SKILL.md) — User-centric React component tests
- [playwright](../playwright/SKILL.md) — Cross-browser E2E patterns
- [e2e-testing](../e2e-testing/SKILL.md) — E2E orchestration and user flows
- [verification-protocol](../verification-protocol/SKILL.md) — Evidence-based claim verification after tests run
