# DRY Principle (Don't Repeat Yourself)

Duplication of logic, configuration, or knowledge should be eliminated through abstraction or data normalization. DRY is about knowledge duplication, not code duplication—similar code representing different concepts should NOT be merged.

---

## Core Patterns

### ✅ REQUIRED: Extract Repeated Logic (Rule of Three)

Apply DRY when logic appears in 3+ places. Below that, duplication may be acceptable.

**Frontend example (React):**

```typescript
// ❌ WRONG: Repeated validation logic in multiple forms
const RegistrationForm = () => {
  const validateEmail = (email: string) => {
    if (!email.includes('@')) return 'Invalid email';
    if (email.length < 5) return 'Email too short';
    return null;
  };
  // ... form logic
};

const LoginForm = () => {
  const validateEmail = (email: string) => {  // ← DUPLICATED
    if (!email.includes('@')) return 'Invalid email';
    if (email.length < 5) return 'Email too short';
    return null;
  };
  // ... form logic
};

// ✅ CORRECT: Extracted to shared utility
// utils/validation.ts
export const validateEmail = (email: string): string | null => {
  if (!email.includes('@')) return 'Invalid email';
  if (email.length < 5) return 'Email too short';
  return null;
};

// Both forms import shared validation
import { validateEmail } from '../utils/validation';
```

**Backend example (Node.js):**

```typescript
// ❌ WRONG: Repeated error handling across routes
app.post('/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.json(order);
  } catch (error) {  // ← DUPLICATED
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ CORRECT: Middleware for error handling
const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
};

app.post('/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.json(user);
}));

app.post('/orders', asyncHandler(async (req, res) => {
  const order = await createOrder(req.body);
  res.json(order);
}));

app.use(errorHandler);
```

### ✅ REQUIRED: Use Configuration Over Hardcoded Values

```typescript
// ❌ WRONG: Hardcoded values scattered across codebase
// user.service.ts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

// auth.middleware.ts
const MAX_LOGIN_ATTEMPTS = 5;  // ← DUPLICATED
const LOCKOUT_DURATION = 30 * 60 * 1000; // ← DUPLICATED

// ✅ CORRECT: Centralized configuration
// config/auth.ts
export const AUTH_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Both files import from single source
import { AUTH_CONFIG } from '../config/auth';
```

### ✅ REQUIRED: Normalize Data Structures

```typescript
// ❌ WRONG: Repeated user data in multiple places
const orderWithUser = {
  orderId: '123',
  userName: 'John',   // ← duplicated
  userEmail: 'j@e.com', // ← duplicated
  items: [...],
};

const invoiceWithUser = {
  invoiceId: '456',
  userName: 'John',    // ← same user info repeated
  userEmail: 'j@e.com', // ← same user info repeated
  total: 100,
};

// ✅ CORRECT: Normalized data with references
const users = { 'u1': { id: 'u1', name: 'John', email: 'j@e.com' } };
const orders = { '123': { id: '123', userId: 'u1', items: [...] } };
const invoices = { '456': { id: '456', userId: 'u1', total: 100 } };
```

### ✅ REQUIRED: Shared TypeScript Types

```typescript
// ❌ WRONG: Same type defined in multiple files
// api/users.ts
interface User { id: string; name: string; email: string; }

// components/UserCard.tsx
interface User { id: string; name: string; email: string; } // ← DUPLICATED

// ✅ CORRECT: Single type definition, imported everywhere
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// api/users.ts
import type { User } from '../types/user';

// components/UserCard.tsx
import type { User } from '../types/user';
```

### ✅ REQUIRED: Custom Hooks for Repeated Logic (React)

```typescript
// ❌ WRONG: Same fetch logic in multiple components
function UserList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false));
  }, []);
  // ...
}

function OrderList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);  // ← DUPLICATED pattern
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false));
  }, []);
  // ...
}

// ✅ CORRECT: Custom hook extracts pattern
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Clean usage
function UserList() {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');
}

function OrderList() {
  const { data: orders, loading, error } = useFetch<Order[]>('/api/orders');
}
```

---

## When to Apply DRY

- Logic appears in **3+ places** (Rule of Three)
- Configuration values duplicated across files
- Data structures repeated with slight variations
- TypeScript types/interfaces defined in multiple files
- Same API call patterns in multiple components
- Error handling logic repeated across routes/handlers

---

## When NOT to Apply DRY (Critical)

### ❌ Coincidental Duplication

Two pieces of code that look similar but represent **different concepts** with **different reasons to change**.

```typescript
// These look similar but ARE NOT duplicates:

// User validation — changes when user rules change
function validateUser(user: User): boolean {
  return user.name.length > 0 && user.email.includes('@');
}

// Product validation — changes when product rules change
function validateProduct(product: Product): boolean {
  return product.name.length > 0 && product.price > 0;
}

// ❌ WRONG: Merging them because they "look similar"
function validate(entity: any, rules: any): boolean { /* ... */ }
// This creates coupling between unrelated domains
```

### ❌ Over-Abstraction

```typescript
// ❌ WRONG: Premature abstraction for 2 similar lines
function formatName(first: string, last: string, format: 'full' | 'short' | 'formal'): string {
  switch (format) {
    case 'full': return `${first} ${last}`;
    case 'short': return first;
    case 'formal': return `Mr./Ms. ${last}`;
  }
}

// ✅ CORRECT: Simple inline code is fine when clear
const fullName = `${first} ${last}`;
const formalName = `Mr./Ms. ${last}`;
```

### ❌ Single-Use Code (YAGNI)

Don't extract utilities used once. Wait until the pattern repeats 3+ times.

```typescript
// ❌ WRONG: Utility for one-time use
// utils/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Only used in one place
import { capitalize } from '../utils/capitalize';
const title = capitalize(name);

// ✅ CORRECT: Inline until needed in 3+ places
const title = name.charAt(0).toUpperCase() + name.slice(1);
```

---

## DRY in Different Contexts

### API Routes

Extract shared middleware, validation, error handling.

### Database Queries

Use repository pattern to centralize data access.

### Configuration

Use environment-specific config files with shared base.

### Tests

Extract test fixtures and helpers, but keep tests readable (some duplication in tests is acceptable for clarity).

### CSS/Styles

Use design tokens, theme variables, and shared utility classes.

---

## Decision Tree

```
Is this logic repeated?
→ No: Don't extract. YAGNI.
→ Yes: How many times?
  → 2 times: Consider extracting (depends on complexity)
  → 3+ times: Extract to shared utility/hook/module

Is the duplication coincidental?
→ Different reasons to change? → Keep separate (not true duplication)
→ Same reason to change? → Extract (true duplication)

Would extraction create too much complexity?
→ Yes: Keep the duplication (simplicity > DRY)
→ No: Extract to reduce maintenance burden
```

---

## Related Patterns

- See [solid-principles.md](solid-principles.md) for SRP (related: each piece of knowledge in one place)
- See [frontend-integration.md](frontend-integration.md) for React-specific DRY patterns (custom hooks, shared types)
- See [backend-integration.md](backend-integration.md) for Node.js DRY patterns (middleware, error handling)
- See main [architecture-patterns/SKILL.md](../SKILL.md) for overview

---

## References

- [The Pragmatic Programmer - DRY](https://pragprog.com/titles/tpp20/)
- [Rule of Three (Wikipedia)](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming))
