# Documentation Standards

> Guidelines for JSDoc, inline comments, and README files.

## Core Patterns

- Core Principle: Comment the "Why", Not the "What"
- Patterns
- Setup
- Development

---

## Core Principle: Comment the "Why", Not the "What"

Code should be self-documenting through good naming. Comments explain *why* a decision was made, not *what* the code does.

```typescript
// ❌ WRONG: Comments describe what code does (obvious from code)
// Get the user by ID
const user = await userRepo.findById(id);
// Check if user exists
if (!user) return null;

// ✅ CORRECT: Comments explain why
// Use findById instead of findByEmail because users can change email
const user = await userRepo.findById(id);
// Return null (not throw) because missing user is expected in registration check
if (!user) return null;
```

---

## Patterns

### ✅ REQUIRED: JSDoc for Public APIs

```typescript
// ✅ CORRECT: JSDoc for exported functions, classes, interfaces
/**
 * Calculates the total price including tax for the given items.
 * @param items - Order items with quantity and unit price
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price including tax, rounded to 2 decimal places
 */
export function calculateTotal(items: OrderItem[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.round((subtotal * (1 + taxRate)) * 100) / 100;
}

// ❌ WRONG: No documentation on public API
export function calculateTotal(items: OrderItem[], taxRate: number): number {
  // caller has no idea what taxRate format is expected
}
```

### ✅ REQUIRED: Interface Documentation

```typescript
// ✅ CORRECT: Document interface purpose and non-obvious fields
/** Repository for user persistence operations. */
export interface IUserRepository {
  /** Find user by unique ID. Returns null if not found. */
  findById(id: string): Promise<User | null>;
  /** Persist user. Creates if new, updates if exists. */
  save(user: User): Promise<void>;
}
```

### When to Add Inline Comments

Add inline comments for:

- **Complex algorithms**: Explain the approach
- **Business rules**: Why this specific threshold/logic
- **Workarounds**: Link to issue/ticket
- **Non-obvious side effects**: What else happens

```typescript
// Business rule: Orders over $500 require manager approval (JIRA-1234)
if (order.total > 500) {
  await requestManagerApproval(order);
}

// Workaround for React 18 strict mode double-mount (https://github.com/facebook/react/issues/24502)
const initialized = useRef(false);
```

### ✅ REQUIRED: No Commented-Out Code

```typescript
// ❌ WRONG: Commented-out code pollutes the codebase
// function oldImplementation() {
//   const result = await legacyApi.fetch();
//   return transform(result);
// }

// ✅ CORRECT: Delete it. Git history preserves old code.
```

### README Guidelines

Every project/package should have a README with:

1. **What it does** (1-2 sentences)
2. **How to set up** (install, configure)
3. **How to run** (development, tests, build)
4. **Architecture notes** (if non-obvious structure)

```markdown
# Order Service

Backend service for order management with Clean Architecture.

## Setup
npm install
cp .env.example .env

## Development
npm run dev

## Architecture
See docs/architecture.md for layer details.
```

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for quick reference
- See [naming-conventions.md](naming-conventions.md) for self-documenting names
- See [english-writing](../../english-writing/SKILL.md) for content writing rules
