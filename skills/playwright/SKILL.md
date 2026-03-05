---
name: playwright
description: "Cross-browser E2E testing with Playwright. Trigger: When writing or running end-to-end tests with Playwright."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: tooling
  skills:
    - e2e-testing
  dependencies:
    playwright: ">=1.40.0 <2.0.0"
---
# Playwright

Cross-browser E2E testing with auto-waiting, fixtures, and assertions.

## When to Use

- E2E browser testing, cross-browser automation
- CI/CD integration, visual regression
- Don't use for: unit tests (vitest/jest), API-only (supertest), static analysis

---

## Critical Patterns

### Locators Over Raw Selectors

Semantic locators mirror user actions; resist refactors.

```typescript
// CORRECT: role-based locators, resilient to markup changes
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
// WRONG: brittle CSS selectors that break on class renames
await page.click('.btn-primary');
```

### Auto-Waiting Instead of Manual Waits

Locators auto-wait for actionable elements; never add sleeps.

```typescript
// CORRECT: auto-waits then asserts
await page.getByRole('link', { name: 'Dashboard' }).click();
await expect(page.getByText('Welcome back')).toBeVisible();
// WRONG: arbitrary sleep that slows tests and still flakes
await page.waitForTimeout(3000);
```

### Test Fixtures for Setup

Fixtures share setup logic and isolate test state.

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

Use `expect(locator)` assertions that auto-retry until the condition is met. Cover both presence (positive) and absence (negative) — incomplete tests miss half the contract.

```typescript
// ✅ POSITIVE: element must exist and have expected state
await expect(page.getByRole('alert')).toHaveText('Saved');
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page).toHaveURL('/dashboard');

// ✅ NEGATIVE: element must be absent or in disabled state
await expect(page.getByText('Error')).not.toBeVisible();
await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
await expect(page.getByRole('dialog')).toBeHidden(); // modal dismissed

// ❌ WRONG: snapshot check with no retry -- races against async UI
const text = await page.locator('.alert').textContent();
expect(text).toBe('Saved');
```

### Network Mocking for Stable Tests

Mock API calls to prevent flakes and control responses.

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

Parallel tests safe when independent.

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

---

## Decision Tree

- UI flow or API only? -> UI: `page` fixture; API: `request` fixture
- Need authentication? -> Create a fixture with stored `storageState`
- Visual testing? -> `page.screenshot()` with `toMatchSnapshot()`
- Cross-browser? -> Configure `projects` in `playwright.config.ts`
- Flaky network? -> Mock with `page.route()` to intercept requests
- CI integration? -> `npx playwright test --reporter=html` with artifact upload

---

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

---

## Edge Cases

- **Flaky network**: Mock APIs with `page.route()` in CI. Record with `page.route('**/*', route => route.continue())`, convert to mocks.

- **Browser compat**: Test Chromium/Firefox/WebKit via `projects`. CSS/JS differ; test all for prod.

- **Headless vs headed**: CI headless; `--headed` local. Visual bugs (scroll, animations) show in headed.

- **Iframes**: `page.frameLocator('#id').getByRole()`. Separate contexts; can't use page locators.

- **File uploads**: `setInputFiles()` on inputs. Drag-drop: `page.setInputFiles()` with `eventInit`.

- **Auth persistence**: `storageState` saves login. `await context.storageState({ path: 'auth.json' })`, then `test.use({ storageState: 'auth.json' })`.

- **Dynamic content**: `waitForLoadState('networkidle')` for SPAs. Infinite scroll: `page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))`.

- **Shadow DOM**: `locator.locator()` pierces shadow: `page.locator('my-component').locator('#shadow-button').click()`.

- **Popups/tabs**: `page.waitForEvent('popup')`: `const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('a[target="_blank"]')])`.

- **Slow CI**: Parallel `--workers=4`, `fullyParallel: true`. Shard: `--shard=1/4`, `--shard=2/4`.

---

## Checklist

- [ ] All locators use `getByRole`, `getByLabel`, `getByTestId`, or `getByText`
- [ ] No `waitForTimeout` or manual sleeps in test code
- [ ] Tests are independent and can run in any order
- [ ] Assertions use `expect(locator)` web-first form
- [ ] CI uploads trace files on failure (`--trace on-first-retry`)
- [ ] Auth state reused via `storageState` to avoid repeated logins

---

## Resources

- [Playwright Docs -- Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [Playwright CI Configuration](https://playwright.dev/docs/ci)
