---
name: jest
description: "Unit, integration, and snapshot testing with Jest. Trigger: When writing or running tests with Jest."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
  dependencies:
    jest: ">=29.0.0 <30.0.0"
---

# Jest Skill

Jest is the standard test runner for JS/TS projects with built-in mocking, assertions, and coverage.

## When to Use

- Unit, integration, or snapshot testing
- Testing JS/TS codebases
- Mocking dependencies and external modules

Don't use for:
- E2E browser testing (use Playwright or Cypress)
- React component queries (use react-testing-library skill)

## Critical Patterns

### describe/it Structure

Group related tests with `describe`; name individual cases with `it`.

```typescript
// CORRECT: grouped, descriptive names
describe('UserService', () => {
  it('should return created user with an id', async () => {
    const user = await service.createUser({ name: 'Ada' });
    expect(user.id).toBeDefined();
  });
});
// WRONG: flat, vague names
test('test1', () => { /* ... */ });
```

### Setup and Teardown

```typescript
// CORRECT: fresh instance per test
let service: UserService;
beforeEach(() => { service = new UserService(mockRepo); });
afterEach(() => { jest.restoreAllMocks(); });
// WRONG: shared mutable state across tests
const service = new UserService(mockRepo);
```

### jest.mock and jest.spyOn

```typescript
// jest.mock: replace entire module
jest.mock('../repositories/userRepo');
const mockRepo = jest.mocked(userRepo);
mockRepo.save.mockResolvedValue({ id: '1', name: 'Ada' });

// jest.spyOn: spy on one method, keep the rest real
const spy = jest.spyOn(logger, 'warn').mockImplementation();
expect(spy).toHaveBeenCalledWith('Empty input');
```

### Async Patterns

```typescript
// CORRECT: awaited rejects matcher
it('should reject on failure', async () => {
  mockFetch.mockRejectedValue(new Error('timeout'));
  await expect(service.fetchData()).rejects.toThrow('timeout');
});
// WRONG: missing await causes silent pass
it('silent', () => { expect(service.fetchData()).rejects.toThrow(); });
```

## Decision Tree

- New test file? -> `<module>.test.ts` next to source
- Replace a whole module? -> `jest.mock('./path')`
- Spy on one method? -> `jest.spyOn(object, 'method')`
- Async code? -> `async/await` in the `it` callback
- Error paths? -> `await expect(...).rejects.toThrow()`
- Shared setup? -> `beforeEach` + `afterEach` cleanup

## Example

```typescript
import { OrderService } from './orderService';
import { paymentGateway } from '../gateways/paymentGateway';
import { orderRepo } from '../repositories/orderRepo';
jest.mock('../gateways/paymentGateway');
jest.mock('../repositories/orderRepo');
const mockPay = jest.mocked(paymentGateway);
const mockRepo = jest.mocked(orderRepo);

describe('OrderService.placeOrder', () => {
  beforeEach(() => { jest.resetAllMocks(); });
  it('should charge and save', async () => {
    mockPay.charge.mockResolvedValue({ status: 'ok' });
    mockRepo.save.mockResolvedValue({ id: '42', total: 100 });
    const order = await new OrderService().placeOrder({ items: ['A'], total: 100 });
    expect(mockPay.charge).toHaveBeenCalledWith(100);
    expect(order.id).toBe('42');
  });
});
```

## Edge Cases

- **ES module mocking** -- Use `jest.unstable_mockModule` for ESM; `jest.mock` is CommonJS only
- **Flaky async** -- Always `await` assertions; use `jest.useFakeTimers()` for time-dependent logic
- **Snapshot drift** -- Review diffs carefully; update with `--updateSnapshot` intentionally
- **Timer leaks** -- Call `jest.useRealTimers()` in `afterEach` to prevent bleed between tests
- **Global state** -- Use `jest.resetModules()` if a module caches state at import time

## Checklist

- [ ] Each `describe` groups a single unit (class, function, or module)
- [ ] Each `it` tests one behavior with a descriptive name
- [ ] `beforeEach` resets state; `afterEach` restores mocks
- [ ] All async tests use `async/await`
- [ ] No test depends on execution order of other tests
- [ ] Coverage thresholds configured in `jest.config.ts`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Mock Function API](https://jestjs.io/docs/mock-function-api)
