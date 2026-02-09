---
name: playwright
description: "Cross-browser E2E testing with Playwright. Trigger: When writing or running end-to-end tests with Playwright."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    playwright: ">=1.40.0 <2.0.0"
---
# Playwright Skill
Cross-browser end-to-end testing framework with auto-waiting, test fixtures, and built-in assertions.
## When to Use
- End-to-end browser testing and cross-browser automation
- CI/CD integration and visual regression testing
- Don't use for: unit tests (use vitest/jest), API-only tests (use supertest), static analysis
## Critical Patterns
### Locators Over Raw Selectors
Prefer semantic locators that mirror how users find elements -- they resist refactors.
```typescript
// CORRECT: role-based locators, resilient to markup changes
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
// WRONG: brittle CSS selectors that break on class renames
await page.click('.btn-primary');
```
### Auto-Waiting Instead of Manual Waits
Playwright locators auto-wait for elements to be actionable -- never add sleeps.
```typescript
// CORRECT: auto-waits then asserts
await page.getByRole('link', { name: 'Dashboard' }).click();
await expect(page.getByText('Welcome back')).toBeVisible();
// WRONG: arbitrary sleep that slows tests and still flakes
await page.waitForTimeout(3000);
```
### Test Fixtures for Setup
Use Playwright's fixture system to share setup logic and isolate test state.
```typescript
const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@co.com');
    await page.getByLabel('Password').fill('pass123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await use(page);
  },
});
```
### Web-First Assertions
Use `expect(locator)` assertions that auto-retry until the condition is met.
```typescript
// CORRECT: auto-retrying assertion
await expect(page.getByRole('alert')).toHaveText('Saved');
// WRONG: snapshot check with no retry -- races against async UI
const text = await page.locator('.alert').textContent();
expect(text).toBe('Saved');
```

### Network Mocking for Stable Tests
Mock external API calls to prevent flaky tests and control responses.
```typescript
// CORRECT: Mock network requests for stable tests
test('displays user data from API', async ({ page }) => {
  await page.route('**/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
    });
  });

  await page.goto('/profile');
  await expect(page.getByText('John Doe')).toBeVisible();
});

// WRONG: Depends on external API (flaky, slow, requires network)
test('displays user data', async ({ page }) => {
  await page.goto('/profile'); // Makes real API call
  await expect(page.getByText(/\w+/)).toBeVisible(); // Can't verify specific data
});
```

### Parallel Execution with Test Isolation
Run tests in parallel safely by ensuring each test is independent.
```typescript
// CORRECT: Isolated test with unique data
test('creates new user', async ({ page }) => {
  const uniqueEmail = `user-${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('pass123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Welcome')).toBeVisible();
});

// WRONG: Uses shared data - tests interfere with each other
test('creates user', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Email').fill('test@example.com'); // Fails if already exists
  // ...
});
```

## Decision Tree
- UI flow or API only? -> UI: `page` fixture; API: `request` fixture
- Need authentication? -> Create a fixture with stored `storageState`
- Visual testing? -> `page.screenshot()` with `toMatchSnapshot()`
- Cross-browser? -> Configure `projects` in `playwright.config.ts`
- Flaky network? -> Mock with `page.route()` to intercept requests
- CI integration? -> `npx playwright test --reporter=html` with artifact upload
## Example
```typescript
import { test, expect } from '@playwright/test';
test.describe('Login flow', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('securePass1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading')).toHaveText('Welcome back');
  });
  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('bad');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid credentials');
  });
});
```
## Edge Cases

- **Flaky network tests**: Mock external APIs with `page.route()` in CI to avoid timing issues. Consider `page.route('**/*', route => route.continue())` to record real traffic first, then convert to mocks.

- **Browser compatibility**: Run across Chromium, Firefox, WebKit via `projects` in config. Some CSS/JS features differ - test on all browsers for production apps.

- **Headless vs headed**: CI runs headless (`--headless`); use `--headed` locally for debugging. Some visual bugs only appear in headed mode (scrolling, animations).

- **Iframe content**: Scope locators with `page.frameLocator('#frame-id').getByRole()`. Iframes have separate document contexts - cannot use page locators directly.

- **File uploads**: Use `setInputFiles()` on file inputs - no native dialog interaction needed. For drag-and-drop uploads, use `page.setInputFiles()` with `eventInit` parameter.

- **Authentication persistence**: Use `storageState` to save login state and reuse across tests. Avoids repeated login flows: `await context.storageState({ path: 'auth.json' })`, then `test.use({ storageState: 'auth.json' })`.

- **Dynamic content loading**: Use `waitForLoadState('networkidle')` for SPAs with lazy loading. For infinite scroll, trigger scroll events then wait for new elements: `await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))`.

- **Shadow DOM**: Use `locator.locator()` to pierce shadow DOM: `await page.locator('my-component').locator('#shadow-button').click()`. Playwright automatically handles shadow roots.

- **Popup windows and new tabs**: Use `page.waitForEvent('popup')` to handle new windows: `const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('a[target="_blank"]')])`.

- **Slow CI execution**: Run tests in parallel with `--workers=4`. Use `fullyParallel: true` in config. Shard tests across machines: `--shard=1/4`, `--shard=2/4`, etc.
## Checklist
- [ ] All locators use `getByRole`, `getByLabel`, `getByTestId`, or `getByText`
- [ ] No `waitForTimeout` or manual sleeps in test code
- [ ] Tests are independent and can run in any order
- [ ] Assertions use `expect(locator)` web-first form
- [ ] CI uploads trace files on failure (`--trace on-first-retry`)
- [ ] Auth state reused via `storageState` to avoid repeated logins
## Resources
- [Playwright Docs -- Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [Playwright CI Configuration](https://playwright.dev/docs/ci)
