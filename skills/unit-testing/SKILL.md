---
name: unit-testing
description: "Unit testing patterns for frontend and backend. Trigger: When writing or reviewing unit tests for any layer."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - jest
    - react-testing-library
    - react-native-testing-library
    - typescript
    - frontend-dev
    - backend-dev
    - humanizer
---

# Unit Testing Skill

Strategic patterns for isolated, maintainable unit tests. This skill orchestrates **jest** and **react-testing-library** -- delegate to them for runner APIs and component queries.

## When to Use

- Writing unit tests for frontend or backend code
- Reviewing test coverage, isolation, and structure
- Refactoring an existing test suite

Don't use for:
- Jest syntax and mock APIs -- delegate to **jest** skill
- React component queries -- delegate to **react-testing-library** skill
- Integration or E2E test strategy (different scope)

## Critical Patterns

### AAA Pattern (Arrange-Act-Assert)

Every test follows three phases separated by blank lines.

```typescript
// CORRECT: clear AAA separation
it('should apply discount', () => {
  const order = createOrder({ subtotal: 200 });       // Arrange
  const result = new PercentDiscount(10).apply(order); // Act
  expect(result.total).toBe(180);                      // Assert
});
// WRONG: everything crammed, hard to read
it('discount', () => {
  expect(new PercentDiscount(10).apply(createOrder({ subtotal: 200 })).total).toBe(180);
});
```

### Test Isolation

```typescript
// CORRECT: fresh state per test
let repo: jest.Mocked<UserRepo>;
let service: UserService;
beforeEach(() => {
  repo = { findById: jest.fn(), save: jest.fn() } as any;
  service = new UserService(repo);
});
// WRONG: mutated across tests, order-dependent
const users: User[] = [];
it('adds', () => { users.push(newUser); });
it('checks', () => { expect(users).toHaveLength(1); });
```

### One Assertion per Concept + Naming

Multiple `expect` calls are fine if they assert facets of the same outcome. Name tests as specs: `should <expected> when <condition>`.

```typescript
// CORRECT: one concept, descriptive name
it('should create user with defaults', () => {
  const user = service.create({ name: 'Ada' });
  expect(user.name).toBe('Ada');
  expect(user.role).toBe('member');
});
// WRONG: vague name, unrelated behaviors
it('create and delete', () => { /* two concerns */ });
```

### Mock Boundaries (Mock I/O, Not Logic)

```typescript
// CORRECT: mock the repo (I/O), test real service logic
repo.findById.mockResolvedValue({ id: '1', balance: 50 });
const result = await service.withdraw('1', 30);
expect(result.balance).toBe(20);
// WRONG: mocking the unit you are testing
jest.spyOn(service, 'withdraw').mockResolvedValue({ balance: 20 });
```

## Decision Tree

- React component? -> Delegate to **react-testing-library** skill
- Pure function? -> No mocks needed; call and assert
- Service with dependencies? -> Mock I/O via **jest** skill
- Need setup per test? -> `beforeEach` + `afterEach`
- Multiple behaviors? -> One `it` per behavior under `describe`
- Error handling? -> Dedicated `it('should throw when ...')` case
- Unsure what to mock? -> Mock anything touching network, disk, or clock

## Example

```typescript
import { AccountService } from './accountService';
import type { AccountRepo } from '../repositories/accountRepo';

describe('AccountService.withdraw', () => {
  let repo: jest.Mocked<AccountRepo>;
  let service: AccountService;
  beforeEach(() => {
    repo = { findById: jest.fn(), save: jest.fn() } as any;
    service = new AccountService(repo);
  });
  it('should deduct and save', async () => {
    repo.findById.mockResolvedValue({ id: '1', balance: 100 });
    repo.save.mockResolvedValue({ id: '1', balance: 70 });
    const account = await service.withdraw('1', 30);
    expect(account.balance).toBe(70);
  });
  it('should throw when balance insufficient', async () => {
    repo.findById.mockResolvedValue({ id: '1', balance: 10 });
    await expect(service.withdraw('1', 50)).rejects.toThrow('Insufficient funds');
  });
});
```

## Edge Cases

- **Flaky async** -- Always `await` async operations; use fake timers for time-dependent logic
- **Coverage gaps** -- Write explicit tests for `else`, `catch`, and default branches
- **Test coupling** -- If renaming a private method breaks tests, test public API only
- **Shared utilities** -- Extract factories (`createUser()`) into `test/helpers/`
- **Non-deterministic data** -- Seed random values or freeze `Date.now()`

## Checklist

- [ ] Every test follows AAA with clear phase separation
- [ ] No test depends on order or outcome of another test
- [ ] Mocks limited to I/O boundaries (repos, HTTP, filesystem)
- [ ] Each `it` has a descriptive `should ... when ...` name
- [ ] `beforeEach` creates fresh instances; `afterEach` restores mocks
- [ ] Error and edge-case paths have dedicated test cases
- [ ] Test file lives next to source: `<module>.test.ts`

## Resources

- [Jest Skill](../jest/SKILL.md) -- runner APIs and mocking syntax
- [React Testing Library Skill](../react-testing-library/SKILL.md) -- component testing
- [Unit Testing Best Practices - Martin Fowler](https://martinfowler.com/bliki/UnitTest.html)
