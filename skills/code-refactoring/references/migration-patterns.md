# Migration Patterns

Complete step-by-step migration walkthroughs for common refactoring scenarios.

## Core Patterns

### ROI Analysis Example: Redux ORM to Prisma

Before beginning a multi-week migration, document the business case.

```markdown
### Refactoring Initiative: Migrate from Redux ORM to Prisma

**Effort Estimate:** 120 hours (3 weeks)

**Impact Analysis:**
- Reduces bundle size by 45KB (faster page loads)
- Eliminates 12 known bugs in Redux ORM selectors
- Simplifies onboarding (Prisma is standard, Redux ORM is obscure)
- Reduces query complexity (no manual normalization)

**ROI Calculation:**
- Developer time saved: 8 hours/week (no Redux ORM debugging)
- First-month ROI: 32 hours saved / 120 hours = 27% (LOW)
- 6-month ROI: 192 hours saved / 120 hours = 160% (MEDIUM)

**Decision:** PROCEED with phased migration (module-by-module)
**Priority:** Medium (schedule for next quarter)
```

### JavaScript to TypeScript Migration

A phased approach that adds type safety incrementally without a big-bang conversion.

```typescript
// Phase 1: Add type definitions to public APIs
// Before
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// After Phase 1
export function calculateTotal(items: Array<{ price: number }>): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Phase 2: Replace any with explicit types
// Before
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// After Phase 2
interface DataItem {
  value: number;
  label: string;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}

// Phase 3: Enable strict mode incrementally
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Migration phases:**

1. Add `// @ts-check` to JS files (zero conversion, instant type checking)
2. Add JSDoc types to public APIs
3. Rename `.js` → `.ts` one file at a time
4. Replace JSDoc with TypeScript types
5. Enable `strict: true` incrementally

### Redux ORM Removal

Replace Redux ORM with Prisma using a facade and feature flag approach.

```typescript
// Phase 1: Create facade over Redux ORM
class UserRepository {
  constructor(private orm: ReduxORM) {}

  findById(id: string): User | null {
    return this.orm.User.withId(id)?.ref ?? null;
  }
}

// Phase 2: Implement replacement (Prisma)
class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

// Phase 3: Feature flag switching
const userRepo = config.featureFlags.usePrisma
  ? new PrismaUserRepository(prisma)
  : new UserRepository(orm);

// Phase 4: Migrate module-by-module
// Module A: userRepo uses Prisma ✓
// Module B: userRepo uses Redux ORM (pending migration)
// Module C: userRepo uses Prisma ✓

// Phase 5: Remove Redux ORM once 100% migrated
```

### Callbacks to Async/Await

Flatten nested callback chains into readable async/await code.

```typescript
// Before: Nested callbacks (pyramid of doom)
function fetchUserData(userId, callback) {
  db.getUser(userId, (err, user) => {
    if (err) return callback(err);
    db.getOrders(user.id, (err, orders) => {
      if (err) return callback(err);
      db.getPayments(user.id, (err, payments) => {
        if (err) return callback(err);
        callback(null, { user, orders, payments });
      });
    });
  });
}

// After: Sequential async/await (flat structure)
async function fetchUserData(userId: string) {
  const user = await db.getUser(userId);
  const orders = await db.getOrders(user.id);
  const payments = await db.getPayments(user.id);
  return { user, orders, payments };
}
```

### Redux Classic to Redux Toolkit and RTK Query

Migrate legacy Redux boilerplate to modern RTK slices and RTK Query, one module at a time.

```typescript
// Phase 1: Install Redux Toolkit alongside classic Redux
// npm install @reduxjs/toolkit react-redux

// Phase 2: Create RTK slice (parallel to existing reducers)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  currentUser: User | null;
  loading: boolean;
}

const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, loading: false } as UserState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;  // Immer enables mutations
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// Phase 3: Replace classic reducer with RTK slice (one at a time)
// Mixed rootReducer during migration
import userSlice from './slices/userSlice';

const rootReducer = combineReducers({
  user: userSlice,          // New RTK slice
  orders: ordersReducer,    // Still old (migrate next)
});

// Phase 4: Add RTK Query for data fetching
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = userApi;

// Phase 5: Configure store with RTK Query middleware
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    user: userSlice,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});

// Phase 6: Migrate components to RTK Query hooks
// Before (classic Redux with manual fetching)
function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    dispatch(fetchUser(userId));  // Thunk action
  }, [userId]);

  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}

// After (RTK Query with auto-caching)
function UserProfile({ userId }) {
  const { data: user, isLoading } = useGetUserQuery(userId);  // Auto-fetch, auto-cache

  if (isLoading) return <Loading />;
  return <div>{user.name}</div>;
}

// Phase 7: Remove old thunks and action creators once all components migrated
// Delete: actions/userActions.js, reducers/userReducer.js, middleware/thunks.js
```

**Benefits of RTK migration:**

- Immer integration (mutate state directly in reducers)
- Built-in thunk middleware (no extra setup)
- RTK Query eliminates manual data fetching (auto-caching, auto-refetching)
- Reduced boilerplate (no action types, action creators)
- TypeScript support out of the box
