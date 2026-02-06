---
name: e2e-testing
description: "End-to-end testing patterns and best practices. Trigger: When writing or reviewing E2E tests for any layer."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - playwright
    - stagehand
    - typescript
    - frontend-dev
    - backend-dev
    - humanizer
---
# End-to-End Testing Skill
Orchestrates E2E testing strategy and architecture -- delegates to the playwright and stagehand skills for implementation.
## When to Use
- Designing test suites for frontend or backend user flows
- Automating browser or API flows across services
- Integrating E2E tests with CI/CD pipelines
- Don't use for: unit tests, component tests in isolation, load/performance testing
## Critical Patterns
### Test User Flows, Not Implementation
Each test should walk through a real user scenario rather than verifying internal state.
```typescript
// CORRECT: tests the outcome the user sees
test('customer completes purchase', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
});
// WRONG: testing internal state
expect(store.getState().cart.items).toHaveLength(1);
```
### Stable Selectors
Use selectors that survive refactors -- data-testid for complex components, ARIA roles for standard elements.
```typescript
// CORRECT: resilient selectors
await page.getByTestId('product-card').first().click();
await page.getByRole('navigation').getByRole('link', { name: 'Cart' }).click();
// WRONG: structural selectors that break on layout changes
await page.locator('div > div:nth-child(3) > a.link-blue').click();
```
### Handle Async UI
Never sleep -- rely on auto-wait or explicit conditions tied to visible DOM changes.
```typescript
// CORRECT: wait for a real DOM condition
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByRole('alert')).toHaveText('Saved');
// WRONG: arbitrary delay
await page.waitForTimeout(2000);
```
### Test Data Management
Each test creates its own data and cleans up -- no shared mutable state.
```typescript
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/seed', {
    data: { user: 'e2e-user-' + Date.now(), role: 'customer' },
  });
});
test.afterEach(async ({ request }) => {
  await request.post('/api/test/cleanup');
});
```
### CI Pipeline Integration
Run E2E as a dedicated CI stage after unit tests; upload artifacts on failure.
```yaml
e2e-tests:
  needs: [unit-tests, build]
  steps:
    - run: npx playwright install --with-deps
    - run: npx playwright test --retries=1 --reporter=html
    - uses: actions/upload-artifact@v4
      if: failure()
      with: { name: playwright-report, path: playwright-report/ }
```
## Decision Tree
- Browser UI flow? -> Delegate to the **playwright** skill
- AI-driven automation? -> Delegate to the **stagehand** skill
- Need test data? -> Seed via API in `beforeEach`, clean up in `afterEach`
- Flaky in CI? -> Add `--retries=1`, mock external services, upload traces
- Testing auth flows? -> Store `storageState` and reuse across tests
- API-only flow? -> Use Playwright `request` fixture or HTTP client
- Slow suite? -> Shard across CI workers with `--shard=N/M`
## Example
```typescript
import { test, expect } from '@playwright/test';
test.describe('Checkout flow', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/test/seed', {
      data: { products: ['widget-a'], user: 'checkout-user' },
    });
  });
  test('guest completes checkout', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('product-card').first().click();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'Cart (1)' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByLabel('Email').fill('guest@example.com');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByText('Order confirmed')).toBeVisible();
  });
});
```
## Edge Cases
- **Flaky network**: Mock external APIs with `page.route()` in CI.
- **Data races**: Isolate test data per worker; never share DB rows between parallel tests.
- **CI differences**: Pin browser versions; use `playwright install --with-deps`.
- **Long suites**: Shard across CI workers (`--shard=1/4`).
- **Auth expiry**: Generate short-lived tokens per run; don't cache sessions across runs.
## Checklist
- [ ] Each test covers a complete user flow from entry to outcome
- [ ] All selectors use `getByRole`, `getByTestId`, or `getByLabel`
- [ ] No `waitForTimeout` or manual sleeps
- [ ] Test data is created and torn down per test
- [ ] CI uploads trace/report artifacts on failure
- [ ] External services are mocked in CI
- [ ] Suite runs under 10 minutes (shard if needed)
## Resources
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Trophy -- Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Stagehand Docs](https://docs.stagehand.dev/)
