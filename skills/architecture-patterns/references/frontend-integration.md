# Frontend Integration Guide

When and how to apply architecture patterns in frontend projects (React, Redux Toolkit, Astro). Most frontend projects DO NOT need architecture patterns—apply only when AGENTS.md specifies, codebase already uses patterns, user explicitly requests, or heavy business logic exists separate from UI.

---

## Core Patterns

- Applicable Patterns
- Pattern 1: Single Responsibility (SRP)
- Pattern 2: Dependency Inversion (DIP)
- Pattern 3: Clean Architecture (Layer Separation)

---

## Applicable Patterns

| Pattern                | Frontend Use Case                      | Example                                |
| ---------------------- | -------------------------------------- | -------------------------------------- |
| **SRP** (SOLID)        | Component/hook design                  | One component = one responsibility     |
| **DIP** (SOLID)        | Service abstraction                    | Components use hooks, not direct fetch |
| **ISP** (SOLID)        | Props design                           | Minimal, focused props                 |
| **Clean Architecture** | Large apps with clear layer separation | domain/, application/, infrastructure/ |
| **Result Pattern**     | Error handling in async operations     | Return `Result<T>` instead of throw    |
| **Mediator Pattern**   | Redux middleware, event coordination   | Centralized action handling            |

**NOT applicable**: OCP (React composition handles it), LSP (duck typing), Hexagonal (overkill for swapping UI frameworks)

---

## Pattern 1: Single Responsibility (SRP)

### Components and Hooks

```typescript
// ❌ WRONG: Component fetches, validates, transforms, and renders
const UserDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/orders').then(r => r.json())
    ]).then(([userData, ordersData]) => {
      const formattedOrders = ordersData.map(o => ({
        ...o, total: o.items.reduce((sum, i) => sum + i.price, 0)
      }));
      setUser(userData);
      setOrders(formattedOrders);
    });
  }, []);

  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>{orders.map(o => <li key={o.id}>{o.total}</li>)}</ul>
    </div>
  );
};
```

```typescript
// ✅ CORRECT: Separated responsibilities

// 1. Data fetching (RTK Query)
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({ query: () => 'user' }),
    getOrders: builder.query<Order[], void>({ query: () => 'orders' }),
  }),
});

// 2. Data transformation (selector)
export const selectOrdersWithTotal = createSelector(
  [(state: RootState) => state.orders],
  (orders) => orders.map(o => ({
    ...o, total: o.items.reduce((sum, i) => sum + i.price, 0)
  }))
);

// 3. Presentational components
export const UserHeader = ({ name }: { name: string }) => <h1>{name}</h1>;
export const OrderList = ({ orders }: { orders: Order[] }) => (
  <ul>{orders.map(o => <li key={o.id}>{o.total}</li>)}</ul>
);

// 4. Container (composition only)
export const UserDashboard = () => {
  const { data: user, isLoading: userLoading } = api.useGetUserQuery();
  const { data: orders = [], isLoading: ordersLoading } = api.useGetOrdersQuery();
  const ordersWithTotal = useSelector(selectOrdersWithTotal);

  if (userLoading || ordersLoading) return <Spinner />;
  if (!user) return <Alert>User not found</Alert>;

  return (
    <div>
      <UserHeader name={user.name} />
      <OrderList orders={ordersWithTotal} />
    </div>
  );
};
```

### Hook Separation

```typescript
// ❌ WRONG: Hook does fetching + transformation + persistence
const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(data => {
      const formatted = { ...data, displayName: `${data.firstName} ${data.lastName}` };
      localStorage.setItem("user", JSON.stringify(formatted));
      setUser(formatted);
    });
  }, []);
  return { user };
};

// ✅ CORRECT: Each hook has one responsibility
const useUserQuery = () => api.useGetUserQuery();
const useUserDisplayName = (user: User | undefined) =>
  useMemo(() => user ? `${user.firstName} ${user.lastName}` : '', [user]);
const useUserPersistence = (user: User | undefined) => {
  useEffect(() => { if (user) localStorage.setItem('user', JSON.stringify(user)); }, [user]);
};
```

---

## Pattern 2: Dependency Inversion (DIP)

Abstract external dependencies so components depend on interfaces, not implementations.

```typescript
// 1. Define interface
export interface IAnalytics {
  track(event: string, properties?: Record<string, any>): void;
}

// 2. Implementations
export class SegmentAnalytics implements IAnalytics {
  track(event: string, properties?: Record<string, any>) { analytics.track(event, properties); }
}

// 3. Context provides abstraction
const AnalyticsContext = createContext<IAnalytics | null>(null);
export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('Missing AnalyticsProvider');
  return ctx;
};

// 4. Component depends on abstraction (swap Segment → GA without touching components)
const CheckoutButton = () => {
  const analytics = useAnalytics();
  return <button onClick={() => analytics.track('checkout_clicked')}>Checkout</button>;
};

// 5. Composition root — swap implementation
const analytics = new SegmentAnalytics(); // or new GoogleAnalytics()
<AnalyticsContext.Provider value={analytics}><App /></AnalyticsContext.Provider>

// 6. Testing — mock implementation
const mockAnalytics: IAnalytics = { track: jest.fn() };
render(<AnalyticsContext.Provider value={mockAnalytics}><CheckoutButton /></AnalyticsContext.Provider>);
```

---

## Pattern 3: Clean Architecture (Layer Separation)

Use when: AGENTS.md specifies, codebase has layers, or user requests it.

```
src/
├── domain/               # Pure business logic (entities, value objects, validation)
├── application/          # Use cases + ports (interfaces)
├── infrastructure/       # Adapters (RTK Query, repositories, gateways)
└── presentation/         # React components and pages
```

```typescript
// Domain — pure business logic
export class Order {
  constructor(public readonly id: string, public readonly items: OrderItem[], private _status: OrderStatus) {}
  get total(): number { return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0); }
  canBeCancelled(): boolean { return ['pending', 'confirmed'].includes(this._status); }
}

// Application — use case orchestration
export class PlaceOrderUseCase {
  constructor(private orderRepo: IOrderRepository, private payment: IPaymentGateway) {}

  async execute(items: OrderItem[], paymentToken: string): Promise<Result<Order>> {
    if (items.length === 0) return Result.fail('Order must have at least one item');
    const order = new Order(generateId(), items, 'pending');
    const paymentResult = await this.payment.charge(order.total, paymentToken);
    if (!paymentResult.success) return Result.fail('Payment failed');
    await this.orderRepo.save(order);
    return Result.ok(order);
  }
}

// Infrastructure — RTK Query adapter
export const orderApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    placeOrder: builder.mutation<Order, PlaceOrderRequest>({
      query: (data) => ({ url: 'orders', method: 'POST', body: data }),
    }),
  }),
});

// Presentation — React page
export const CheckoutPage = () => {
  const [placeOrder, { isLoading }] = orderApi.usePlaceOrderMutation();
  const items = useSelector(selectCartItems);

  const handleCheckout = async (paymentToken: string) => {
    const result = await placeOrder({ items, paymentToken });
    if ('data' in result) navigate('/order-confirmation');
    else showError('Checkout failed');
  };

  return (
    <form onSubmit={handleSubmit(handleCheckout)}>
      <CartSummary items={items} />
      <PaymentForm />
      <button type="submit" disabled={isLoading}>Place Order</button>
    </form>
  );
};
```

---

## Pattern 4: Result Pattern (Error Handling)

```typescript
export class Result<T> {
  private constructor(public readonly isSuccess: boolean, public readonly value?: T, public readonly error?: string) {}
  static ok<T>(value: T): Result<T> { return new Result(true, value); }
  static fail<T>(error: string): Result<T> { return new Result(false, undefined, error); }
}

// In custom hook
const useCreateUser = () => {
  const [result, setResult] = useState<Result<User> | null>(null);

  const createUser = async (data: CreateUserDTO) => {
    if (!data.email.includes('@')) { setResult(Result.fail('Invalid email')); return; }
    try {
      const user = await api.post('/users', data);
      setResult(Result.ok(user));
    } catch { setResult(Result.fail('Failed to create user')); }
  };

  return { createUser, result };
};

// In component
const CreateUserForm = () => {
  const { createUser, result } = useCreateUser();
  return (
    <form onSubmit={handleSubmit}>
      {result && !result.isSuccess && <Alert severity="error">{result.error}</Alert>}
      {result?.isSuccess && <Alert severity="success">User created: {result.value?.name}</Alert>}
    </form>
  );
};
```

---

## Astro-Specific Patterns

```typescript
// services/userService.ts (infrastructure)
export const userService = {
  async getUsers(): Promise<Result<User[]>> {
    try {
      const response = await fetch('https://api.example.com/users');
      return Result.ok(await response.json());
    } catch { return Result.fail('Failed to fetch users'); }
  }
};
```

```astro
---
// pages/users.astro (presentation)
import { userService } from '../services/userService';
const result = await userService.getUsers();
---
{result.isSuccess ? (
  <ul>{result.value.map(user => <li>{user.name}</li>)}</ul>
) : (
  <p>Error: {result.error}</p>
)}
```

---

## Pragmatism Guide

### Adopt Incrementally

1. **First**: SRP — one component = one responsibility
2. **Second**: Custom hooks for reusable logic
3. **Third**: Separate data fetching (RTK Query) from presentation
4. **Fourth**: Result pattern for error handling (if needed)
5. **Only then**: Full Clean Architecture layers (if project demands it)

### Red Flags (Over-Engineering)

- Layers for <10 components
- Interfaces with single implementation
- 5+ levels of indirection for simple CRUD
- Team spending more time on architecture than features

### Migration Strategy

Don't rewrite. Apply incrementally to existing projects:

1. **New features** → Apply patterns to new code
2. **Hot spots** → Refactor frequently-changed modules
3. **Pain points** → Address buggy/complex areas
4. **Stable code** → Leave working code alone

---

## Decision Summary

### Always Apply (Best Practices)

| Pattern          | Why                                                |
| ---------------- | -------------------------------------------------- |
| SRP (components) | One component = one responsibility                 |
| ISP (props)      | Minimal, focused props (TypeScript best practice)  |

### Apply When Context Requires

| Pattern            | Signal                                                   |
| ------------------ | -------------------------------------------------------- |
| SRP (hooks/slices) | AGENTS.md specifies, codebase uses, or user requests     |
| DIP (services)     | Need to swap/mock external dependencies                  |
| Clean Architecture | AGENTS.md specifies or codebase has layers               |
| Result Pattern     | Complex async error handling needed                      |
| Mediator           | Event-driven coordination between components             |

**Decision flow**: Check AGENTS.md → Check codebase → Check user request → AI analysis → Default to simple patterns

---

## Related References

- [SOLID Principles](solid-principles.md), [Clean Architecture](clean-architecture.md), [Result Pattern](result-pattern.md)
- [DRY Principle](dry-principle.md) — Custom hooks, shared types, utilities
- [Backend Integration](backend-integration.md), [Sidecar Pattern](sidecar-pattern.md)
- [Main SKILL](../SKILL.md)

---

Architecture patterns are tools, not rules. Start simple, add complexity only when needed.
