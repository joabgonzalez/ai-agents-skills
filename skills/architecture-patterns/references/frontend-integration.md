# Frontend Integration Guide

> When and how to apply architecture patterns in frontend projects (React, Redux Toolkit, Astro).

## ⚠️ READ THIS FIRST

**Most frontend projects DO NOT need architecture patterns.** Apply only when:

1. **AGENTS.md explicitly specifies** architecture requirements
2. **Codebase already uses patterns** (domain/, application/, infrastructure/ folders exist)
3. **User explicitly requests** architectural patterns
4. **AI detects heavy business logic** separated from UI (not just CRUD)

**If none of these apply** → Skip this guide. Use technology-specific patterns ([react](../../react/SKILL.md), [redux-toolkit](../../redux-toolkit/SKILL.md), [astro](../../astro/SKILL.md))

---

## Context Verification Checklist

**Apply architecture patterns when ONE of these signals is present**:

### 1. AGENTS.md Specifies Architecture

```bash
# Read your project's agent file
cat agents/your-project/AGENTS.md

# Look for architecture keywords:
grep -i "architecture\|solid\|clean\|ddd\|hexagonal\|layer" agents/your-project/AGENTS.md
```

**If found** → Apply patterns  
**If NOT found** → Check other signals

### 2. Codebase Already Uses Patterns

```bash
# Check if architecture folders exist
ls src/domain src/application src/infrastructure
```

**If folders exist** → Continue using patterns consistently  
**If folders don't exist** → Check other signals

### 3. User Explicitly Requests

- "aplica arquitectura aquí"
- "usa SOLID en este componente"
- "implementa Clean Architecture"
- "necesito separación de capas"

**If requested** → Apply patterns (AI decides which ones based on technology stack)  
**If NOT requested** → Check other signals

### 4. AI Detects Need from Context

**AI should evaluate**:

- Heavy business logic visible in components (not just UI)
- Multiple services/repositories mixed in presentation layer
- Complex validation or transformation logic in components
- Patterns would significantly improve testability/maintainability

**If detected** → Suggest patterns to user first, then apply if agreed  
**If NOT detected** → Use simple patterns

---

**Rule**: Don't apply architecture patterns without at least ONE clear signal from context.

---

## Applicable Patterns for Frontend

| Pattern                | Use Case                               | Example                                |
| ---------------------- | -------------------------------------- | -------------------------------------- |
| **SRP** (SOLID)        | Component/hook design                  | One component = one responsibility     |
| **DIP** (SOLID)        | Service abstraction                    | Components use hooks, not direct fetch |
| **ISP** (SOLID)        | Props design                           | Minimal, focused props                 |
| **Clean Architecture** | Large apps with clear layer separation | domain/, application/, infrastructure/ |
| **Result Pattern**     | Error handling in async operations     | Return `Result<T>` instead of throw    |
| **Mediator Pattern**   | Redux middleware, event coordination   | Centralized action handling            |

**NOT applicable to frontend**:

- OCP: React composition handles this naturally
- LSP: JavaScript duck typing makes this less relevant
- Hexagonal: Overkill unless you're swapping entire UI frameworks

---

## Pattern 1: Single Responsibility Principle (SRP)

### Apply To

- Components
- Custom hooks
- Redux slices
- API service files

### React Component Example

```typescript
// ❌ WRONG: Component doing too much
const UserDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetching
    Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/orders').then(r => r.json())
    ]).then(([userData, ordersData]) => {
      // Validation
      if (!userData.email) throw new Error('Invalid user');

      // Transformation
      const formattedOrders = ordersData.map(o => ({
        ...o,
        total: o.items.reduce((sum, i) => sum + i.price, 0)
      }));

      setUser(userData);
      setOrders(formattedOrders);
      setIsLoading(false);
    });
  }, []);

  // Rendering
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>
        {orders.map(o => (
          <li key={o.id}>{o.total}</li>
        ))}
      </ul>
    </div>
  );
};
```

```typescript
// ✅ CORRECT: Separated responsibilities

// 1. Data fetching (RTK Query)
// services/api.ts
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => 'user'
    }),
    getOrders: builder.query<Order[], void>({
      query: () => 'orders'
    })
  })
});

// 2. Selectors (data transformation)
// selectors/orderSelectors.ts
export const selectOrdersWithTotal = createSelector(
  [(state: RootState) => state.orders],
  (orders) => orders.map(o => ({
    ...o,
    total: o.items.reduce((sum, i) => sum + i.price, 0)
  }))
);

// 3. Presentational components
// components/UserHeader.tsx
export const UserHeader = ({ name }: { name: string }) => (
  <h1>{name}</h1>
);

// components/OrderList.tsx
export const OrderList = ({ orders }: { orders: Order[] }) => (
  <ul>
    {orders.map(o => (
      <li key={o.id}>{o.total}</li>
    ))}
  </ul>
);

// 4. Container component (composition only)
// pages/UserDashboard.tsx
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

### Custom Hook Example

```typescript
// ❌ WRONG: Hook doing too much
const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        // Validation
        if (!data.email) throw new Error("Invalid");

        // Transformation
        const formatted = {
          ...data,
          displayName: `${data.firstName} ${data.lastName}`,
        };

        // Persistence
        localStorage.setItem("user", JSON.stringify(formatted));

        setUser(formatted);
        setIsLoading(false);
      });
  }, []);

  return { user, isLoading };
};
```

```typescript
// ✅ CORRECT: Separated hooks

// 1. Data fetching only
const useUserQuery = () => {
  return api.useGetUserQuery();
};

// 2. Transformation only
const useUserDisplayName = (user: User | undefined) => {
  return useMemo(() =>
    user ? `${user.firstName} ${user.lastName}` : '',
    [user]
  );
};

// 3. Persistence only
const useUserPersistence = (user: User | undefined) => {
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);
};

// Composition
const UserProfile = () => {
  const { data: user, isLoading } = useUserQuery();
  const displayName = useUserDisplayName(user);
  useUserPersistence(user);

  if (isLoading) return <Spinner />;
  return <div>{displayName}</div>;
};
```

---

## Pattern 2: Dependency Inversion Principle (DIP)

### Apply To

- API services
- External dependencies (analytics, logging)
- Third-party integrations

### React Example

```typescript
// ❌ WRONG: Component directly uses analytics library
import { analytics } from 'segment';

const CheckoutButton = () => {
  const handleClick = () => {
    analytics.track('checkout_clicked'); // Direct dependency
    // ...
  };

  return <button onClick={handleClick}>Checkout</button>;
};
```

```typescript
// ✅ CORRECT: Component depends on abstraction

// 1. Define interface (abstraction)
// services/analytics/IAnalytics.ts
export interface IAnalytics {
  track(event: string, properties?: Record<string, any>): void;
}

// 2. Implementations
// services/analytics/SegmentAnalytics.ts
export class SegmentAnalytics implements IAnalytics {
  track(event: string, properties?: Record<string, any>): void {
    analytics.track(event, properties);
  }
}

// services/analytics/GoogleAnalytics.ts
export class GoogleAnalytics implements IAnalytics {
  track(event: string, properties?: Record<string, any>): void {
    gtag('event', event, properties);
  }
}

// 3. Context provides abstraction
// contexts/AnalyticsContext.tsx
const AnalyticsContext = createContext<IAnalytics | null>(null);

export const AnalyticsProvider = ({ children, analytics }: Props) => (
  <AnalyticsContext.Provider value={analytics}>
    {children}
  </AnalyticsContext.Provider>
);

export const useAnalytics = () => {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) throw new Error('Missing AnalyticsProvider');
  return analytics;
};

// 4. Component depends on abstraction
const CheckoutButton = () => {
  const analytics = useAnalytics(); // Abstraction

  const handleClick = () => {
    analytics.track('checkout_clicked'); // Can swap implementation
    // ...
  };

  return <button onClick={handleClick}>Checkout</button>;
};

// 5. Composition root
// App.tsx
const analytics = new SegmentAnalytics(); // or GoogleAnalytics

<AnalyticsProvider analytics={analytics}>
  <CheckoutButton />
</AnalyticsProvider>

// 6. Testing
const mockAnalytics: IAnalytics = {
  track: jest.fn()
};

render(
  <AnalyticsProvider analytics={mockAnalytics}>
    <CheckoutButton />
  </AnalyticsProvider>
);
```

---

## Pattern 3: Clean Architecture (Layer Separation)

### When to Use

- AGENTS.md specifies architecture patterns
- Codebase already uses layer separation
- Clear business logic exists separate from UI
- User explicitly requests architectural structure

### Folder Structure

```
src/
├── domain/               # Business logic (pure functions, entities)
│   ├── entities/
│   │   ├── User.ts
│   │   └── Order.ts
│   ├── value-objects/
│   │   └── Email.ts
│   └── validation/
│       └── validateOrder.ts
│
├── application/          # Use cases (orchestration)
│   ├── use-cases/
│   │   ├── PlaceOrder.ts
│   │   └── RegisterUser.ts
│   └── ports/            # Interfaces
│       ├── IOrderRepository.ts
│       └── IPaymentGateway.ts
│
├── infrastructure/       # External services (adapters)
│   ├── api/
│   │   ├── userApi.ts    # RTK Query
│   │   └── orderApi.ts
│   ├── repositories/
│   │   └── OrderRepository.ts
│   └── gateways/
│       └── StripeGateway.ts
│
└── presentation/         # UI (React components)
    ├── components/
    │   ├── UserProfile.tsx
    │   └── OrderList.tsx
    └── pages/
        └── Checkout.tsx
```

### Example: Clean Architecture in React

```typescript
// 1. Domain layer (pure business logic)
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    private _status: OrderStatus
  ) {}

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  canBeCancelled(): boolean {
    return this._status === 'pending' || this._status === 'confirmed';
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('Cannot cancel order in current status');
    }
    this._status = 'cancelled';
  }
}

// 2. Application layer (use cases)
// application/use-cases/PlaceOrder.ts
export class PlaceOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private payment: IPaymentGateway
  ) {}

  async execute(items: OrderItem[], paymentToken: string): Promise<Result<Order>> {
    // Business rules
    if (items.length === 0) {
      return Result.fail('Order must have at least one item');
    }

    const order = new Order(generateId(), items, 'pending');

    // Payment
    const paymentResult = await this.payment.charge(order.total, paymentToken);
    if (!paymentResult.success) {
      return Result.fail('Payment failed');
    }

    // Persistence
    await this.orderRepo.save(order);

    return Result.ok(order);
  }
}

// 3. Infrastructure layer (adapters)
// infrastructure/api/orderApi.ts
export const orderApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    placeOrder: builder.mutation<Order, PlaceOrderRequest>({
      query: (data) => ({
        url: 'orders',
        method: 'POST',
        body: data
      })
    })
  })
});

// 4. Presentation layer (React)
// presentation/pages/Checkout.tsx
export const CheckoutPage = () => {
  const [placeOrder, { isLoading }] = orderApi.usePlaceOrderMutation();
  const items = useSelector(selectCartItems);

  const handleCheckout = async (paymentToken: string) => {
    // Call use case through API
    const result = await placeOrder({ items, paymentToken });

    if ('data' in result) {
      navigate('/order-confirmation');
    } else {
      showError('Checkout failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCheckout)}>
      <CartSummary items={items} />
      <PaymentForm />
      <button type="submit" disabled={isLoading}>
        Place Order
      </button>
    </form>
  );
};
```

---

## Pattern 4: Result Pattern (Error Handling)

### When to Use

- Async operations (API calls, validation)
- Explicit error handling needed
- Avoid try/catch everywhere

### Implementation

```typescript
// Result type
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static fail<T>(error: string): Result<T> {
    return new Result(false, undefined, error);
  }
}

// Usage in custom hook
const useCreateUser = () => {
  const [result, setResult] = useState<Result<User> | null>(null);

  const createUser = async (data: CreateUserDTO) => {
    // Validation
    if (!data.email.includes('@')) {
      setResult(Result.fail('Invalid email'));
      return;
    }

    // API call
    try {
      const user = await api.post('/users', data);
      setResult(Result.ok(user));
    } catch (error) {
      setResult(Result.fail('Failed to create user'));
    }
  };

  return { createUser, result };
};

// Component
const CreateUserForm = () => {
  const { createUser, result } = useCreateUser();

  const handleSubmit = (data: CreateUserDTO) => {
    createUser(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}

      {result && !result.isSuccess && (
        <Alert severity="error">{result.error}</Alert>
      )}

      {result?.isSuccess && (
        <Alert severity="success">User created: {result.value?.name}</Alert>
      )}
    </form>
  );
};
```

---

## Astro-Specific Patterns

### Layer Separation in Astro

```
src/
├── domain/           # Business logic
│   └── entities/
├── services/         # API calls, external services
│   └── userService.ts
└── pages/            # Astro pages
    └── users.astro
```

```typescript
// services/userService.ts (infrastructure)
export const userService = {
  async getUsers(): Promise<Result<User[]>> {
    try {
      const response = await fetch('https://api.example.com/users');
      const users = await response.json();
      return Result.ok(users);
    } catch (error) {
      return Result.fail('Failed to fetch users');
    }
  }
};

// pages/users.astro (presentation)
---
import { userService } from '../services/userService';

const result = await userService.getUsers();
---

<html>
  <body>
    {result.isSuccess ? (
      <ul>
        {result.value.map(user => <li>{user.name}</li>)}
      </ul>
    ) : (
      <p>Error: {result.error}</p>
    )}
  </body>
</html>
```

---

## Pragmatism Guide

### START with Simple Patterns

1. **First**: Apply SRP to components (one responsibility)
2. **Second**: Use custom hooks for reusable logic
3. **Third**: Separate data fetching (RTK Query) from presentation
4. **Fourth**: If still complex, add Result pattern for error handling

### DON'T START with

- Full Clean Architecture layers
- Hexagonal ports/adapters
- DDD entities/aggregates

**Add incrementally** only if project grows and needs it.

### Red Flags (You're Over-Engineering)

- Creating layers for <10 components
- Interfaces with single implementation
- 5+ levels of indirection for simple CRUD
- Team spending more time on architecture than features

---

## Migration Strategy

### Existing Project Without Patterns

**Don't rewrite everything**. Apply incrementally:

1. **New features**: Apply patterns to new code
2. **Hot spots**: Refactor frequently-changed modules first
3. **Pain points**: Address areas with most bugs/complexity
4. **Leave stable code**: Don't touch working code just for patterns

### Example: Adding SRP to Existing Component

```typescript
// Before: Monolithic component
const UserDashboard = () => {
  // 500 lines of mixed concerns
};

// After: Incremental refactor
// Step 1: Extract data fetching
const useUserDashboardData = () => { /* ... */ };

// Step 2: Extract sub-components
const UserHeader = ({ user }) => { /* ... */ };
const UserStats = ({ stats }) => { /* ... */ };

// Step 3: Simplified dashboard
const UserDashboard = () => {
  const { user, stats } = useUserDashboardData();
  return (
    <>
      <UserHeader user={user} />
      <UserStats stats={stats} />
    </>
  );
};
```

---

## Summary: When to Apply Each Pattern

**Apply patterns based on context signals**:

### Always Apply (React/TypeScript Best Practices)

| Pattern          | Why Always                                         |
| ---------------- | -------------------------------------------------- |
| SRP (components) | One component = one responsibility (best practice) |
| ISP (props)      | Minimal, focused props (TypeScript best practice)  |

### Apply When Context Requires

| Pattern            | Apply When                                                           |
| ------------------ | -------------------------------------------------------------------- |
| SRP (hooks/slices) | AGENTS.md specifies OR codebase uses OR user requests                |
| DIP (services)     | AGENTS.md specifies OR codebase uses OR user requests abstraction    |
| Clean Architecture | AGENTS.md specifies OR codebase has layers OR user requests          |
| Result Pattern     | AGENTS.md specifies OR codebase uses OR user requests error handling |
| Mediator           | AGENTS.md specifies OR codebase uses OR user requests                |

**Decision Process**:

1. **Check AGENTS.md** → Mentions architecture? → Apply
2. **Check codebase** → Has `domain/`, `application/`, `infrastructure/`? → Continue using
3. **Check user request** → Asks for architecture? → Apply (evaluate applicability first)
4. **AI analysis** → Heavy business logic scattered? → Suggest patterns to user
5. **None of above** → Use simple React/Redux/Astro patterns

**Rule**: Context determines patterns, not arbitrary app size metrics.

---

## Related References

- [SOLID Principles](solid-principles.md) - Detailed SOLID guide
- [Clean Architecture](clean-architecture.md) - Layer-based architecture
- [Result Pattern](result-pattern.md) - Error handling
- [Backend Integration](backend-integration.md) - Backend comparison
- [Main SKILL](../SKILL.md) - Overview and Decision Tree

---

**Remember**: Architecture patterns are tools, not rules. Use pragmatism. Start simple, add complexity only when needed.
