# Legacy Testing

Strategies and patterns for adding test coverage to legacy code before and during refactoring.

## Core Patterns

### Adding Tests to Legacy Code

When legacy code has no tests, characterization tests document current behavior (including bugs) to create a safety net before refactoring begins.

```typescript
// Problem: Legacy code with zero tests
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
    expect(calculateDiscount(-100, 'premium')).toBe(-80);  // Documents bug
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
// npm test -- --coverage
```

### Strategy for Legacy Codebases

1. **Golden Master Testing** — Capture current outputs (even if buggy) with characterization tests
2. **Approval Testing** — Record API responses, screenshots, or outputs as "approved" baselines
3. **Test Pyramid Inversion** — Start with integration/E2E tests (easier for legacy), add unit tests later
4. **Seams Strategy** — Introduce test seams (dependency injection, interfaces) without changing logic
5. **Parallel Test Development** — Write tests in parallel with refactoring (not before)

### Prioritizing What to Test

When test coverage is limited, prioritize in this order:

1. Business-critical paths (payment, auth, data integrity)
2. Bug-prone areas (complex conditionals, edge cases)
3. Frequently changed code (high churn areas)

### Tools for Legacy Code Testing

```bash
# Golden master testing
npm install --save-dev jest-image-snapshot  # Visual regression
npm install --save-dev @pact-foundation/pact  # API contract testing

# Code coverage with threshold enforcement
npm test -- --coverage --coverageThreshold='{"global":{"branches":80}}'

# Mutation testing (verify test quality)
npx stryker run  # Kills mutants to check if tests catch bugs
```

**When mutation testing score is low:** Your tests pass but don't actually verify behavior. Add assertions that check output values, not just that code runs without throwing.
