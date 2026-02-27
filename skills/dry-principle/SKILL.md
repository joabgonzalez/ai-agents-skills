---
name: dry-principle
description: "Eliminate knowledge duplication via abstraction. Trigger: When same logic appears 3+ times or changing one place requires updating others."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# DRY Principle

Eliminate knowledge duplication through abstraction. DRY is about knowledge duplication, not code duplication—similar-looking code representing different concepts should NOT be merged.

## When to Use

- Same logic appears in 3+ places (Rule of Three)
- Changing a rule requires updating multiple files
- Shared configuration or constants duplicated across modules

Don't use for:

- Code that looks similar but represents different business concepts
- Premature abstraction (apply after seeing duplication, not speculatively)
- Trivial one-off operations

---

## Critical Patterns

### ✅ REQUIRED: Rule of Three — Extract After 3rd Occurrence

Apply DRY when logic appears in 3+ places. Below that, duplication may be acceptable.

```typescript
// ❌ WRONG: validateEmail duplicated in RegistrationForm, LoginForm, ProfileForm
const validateEmail = (email: string) => {
  if (!email.includes('@')) return 'Invalid email';
  if (email.length < 5) return 'Email too short';
  return null;
};

// ✅ CORRECT: Extracted to shared utility
// utils/validation.ts
export const validateEmail = (email: string): string | null => {
  if (!email.includes('@')) return 'Invalid email';
  if (email.length < 5) return 'Email too short';
  return null;
};
```

### ✅ REQUIRED: Centralize Configuration

Single source of truth for constants, endpoints, and config values.

```typescript
// ❌ WRONG: Same URL in 5 different files
const BASE_URL = 'https://api.example.com/v1';  // user.service.ts
const API_URL = 'https://api.example.com/v1';   // order.service.ts

// ✅ CORRECT: One source
// config/api.ts
export const API_BASE_URL = 'https://api.example.com/v1';
export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  orders: `${API_BASE_URL}/orders`,
};
```

### ✅ REQUIRED: Shared Types

Define types once, import everywhere.

```typescript
// ❌ WRONG: User type defined in 3 files with slight variations
// users.service.ts
type User = { id: string; email: string; name: string };
// auth.service.ts
type User = { id: string; email: string; role: string }; // different!

// ✅ CORRECT: Single definition
// types/user.ts
export interface User { id: string; email: string; name: string; role: string; }
```

### ✅ REQUIRED: React Custom Hooks as DRY Abstraction

Extract repeated fetch/state patterns into custom hooks — same Rule of Three applies.

```typescript
// ❌ WRONG: identical fetch + state pattern in 3+ components
function UserList() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false)); }, []);
}
function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => { fetch('/api/products').then(r => r.json()).then(setProducts).finally(() => setLoading(false)); }, []);
}

// ✅ CORRECT: extract once, parameterize the URL
function useFetch<T>(url: string) {
  const [data, setData]       = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(url).then(r => r.json()).then(setData).finally(() => setLoading(false)); }, [url]);
  return { data, loading };
}

function UserList()    { const { data: users,    loading } = useFetch<User>('/api/users');    ... }
function ProductList() { const { data: products, loading } = useFetch<Product>('/api/products'); ... }
```

**Rule**: Apply only after seeing the same hook pattern in 3+ components — not speculatively.

### ❌ NEVER: Merge Code That Looks Similar but Isn't

DRY is about knowledge duplication, not code similarity.

```typescript
// ❌ WRONG: Merged because they look similar (but represent different concepts)
function applyDiscount(price: number, percent: number) { return price * (1 - percent / 100); }
// Used for: loyalty discount AND promotional discount AND employee discount
// Problem: Different business rules → now tangled

// ✅ CORRECT: Different concepts stay separate even if they look similar
function applyLoyaltyDiscount(price: number, loyaltyPercent: number): number { ... }
function applyPromoDiscount(price: number, promoPercent: number): number { ... }
```

---

## Decision Tree

```
Logic appears in 3+ places?
  → YES: Extract to shared function/utility/constant
  → NO (2 places): Consider if it's worth extracting; often OK to duplicate

Code looks similar but represents different business concepts?
  → Extract = premature abstraction → Keep separate

Configuration duplicated across files?
  → Move to centralized config module

Types defined multiple times with variations?
  → Define once in types/ directory, import everywhere

Abstraction would require many parameters or conditions?
  → Abstraction is fighting the code → may not be a real duplication
```

---

## Example

```typescript
// ✅ CORRECT: Full DRY example
// config/api.ts — single source for URLs
export const ENDPOINTS = { users: '/api/users', orders: '/api/orders' };

// types/pagination.ts — shared pagination type
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; }

// utils/http.ts — shared fetch wrapper
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// services/user.service.ts — uses shared utilities
import { ENDPOINTS } from '../config/api';
import { fetchJson } from '../utils/http';
import type { PaginatedResponse } from '../types/pagination';
import type { User } from '../types/user';

export const getUsers = () => fetchJson<PaginatedResponse<User>>(ENDPOINTS.users);
```

---

## Edge Cases

**Forced parameter proliferation:** If your shared function needs 5+ parameters to handle all callers, DRY may be wrong. The callers may represent genuinely different concerns.

**Test helpers:** Same test setup code in multiple tests — extract to `beforeEach` or test fixtures. This is legitimate DRY in tests.

**Accidental coupling:** Merging two functions because they look similar can accidentally couple unrelated business rules. If they change independently, keep them separate.

---

## Resources

- [patterns-examples.md](references/patterns-examples.md) — Advanced patterns, DRY in CSS, template duplication, cross-layer
