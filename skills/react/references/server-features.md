# Server Features (React 18+)

Server Components enable direct database/API access, Suspense enables streaming, and composition patterns optimize client-server boundaries.

---

## Core Patterns

- React Server Components (RSC)
- Suspense for Data Loading
- Loading and Error States
- Server Actions

---

## React Server Components (RSC)

### Server vs Client Components

```typescript
// ✅ SERVER COMPONENT (default in App Router) — runs on server only
// No "use client" directive needed
async function ProductPage({ id }: { id: string }) {
  const product = await db.products.findUnique({ where: { id } }); // Direct DB access
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={id} /> {/* Client component */}
    </div>
  );
}

// ✅ CLIENT COMPONENT — runs on client (and server for SSR)
'use client';
function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      await addToCart(productId);
    });
  };

  return (
    <button onClick={handleAdd} disabled={isPending}>
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Decision: Server vs Client

```
Does the component need:
  useState, useEffect, event handlers? → 'use client'
  Browser APIs (window, localStorage)?  → 'use client'
  Only renders data (no interactivity)? → Server component (default)
  Fetches data from DB/API?             → Server component (preferred)
  Both interactive + data-heavy?        → Split into server parent + client child
```

### ✅ REQUIRED: Composition Pattern

```typescript
// ✅ CORRECT: Server parent passes data to client child
// page.tsx (server)
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id);
  const reviews = await getReviews(id);

  return (
    <div>
      <ProductDetails product={product} />      {/* Server — just renders */}
      <ReviewList reviews={reviews} />           {/* Server — just renders */}
      <ReviewForm productId={id} />              {/* Client — has form state */}
    </div>
  );
}

// ❌ WRONG: Making entire page a client component for one interactive piece
'use client';
function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState(null);
  useEffect(() => { fetchProduct(id).then(setProduct); }, [id]);
  // Now everything is client-side, losing server benefits
}
```

---

## Suspense for Data Loading

### Streaming with Suspense

```typescript
async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Renders immediately */}
      <WelcomeHeader />

      {/* Streams in when data is ready */}
      <Suspense fallback={<MetricsSkeleton />}>
        <Metrics /> {/* async server component */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart /> {/* async server component */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders /> {/* async server component */}
      </Suspense>
    </div>
  );
}

// Each component fetches independently
async function Metrics() {
  const data = await fetchMetrics(); // Blocks only this Suspense boundary
  return <MetricsGrid data={data} />;
}

async function RevenueChart() {
  const data = await fetchRevenue(); // Blocks only this Suspense boundary
  return <Chart data={data} />;
}
```

### Parallel Data Fetching

```typescript
// ✅ CORRECT: Parallel fetching in server components
async function ProductPage({ id }: { id: string }) {
  // Start both fetches simultaneously
  const [product, reviews, recommendations] = await Promise.all([
    getProduct(id),
    getReviews(id),
    getRecommendations(id),
  ]);

  return (
    <div>
      <ProductDetails product={product} />
      <Reviews reviews={reviews} />
      <Recommendations items={recommendations} />
    </div>
  );
}

// ❌ WRONG: Sequential fetching (waterfall)
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id);           // Wait...
  const reviews = await getReviews(id);            // Then wait...
  const recommendations = await getRecommendations(id); // Then wait...
}
```

---

## Loading and Error States

### Loading UI Patterns

```typescript
// Skeleton loading (preferred for known layouts)
function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}

// Spinner (for unknown layouts)
function LoadingSpinner() {
  return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
```

### Error Handling in Server Components

```typescript
// error.tsx — Framework-level error boundary (Next.js App Router)
'use client';
function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  );
}

// For granular error handling, use error boundaries around Suspense
<ErrorBoundary fallback={<ChartError />}>
  <Suspense fallback={<ChartSkeleton />}>
    <RevenueChart />
  </Suspense>
</ErrorBoundary>
```

---

## Server Actions

```typescript
// ✅ Server action — runs on server, called from client
'use server';
async function createOrder(formData: FormData) {
  const items = JSON.parse(formData.get('items') as string);
  const order = await db.orders.create({ data: { items } });
  revalidatePath('/orders');
  return { id: order.id };
}

// Client component using server action
'use client';
function OrderForm() {
  const [state, formAction, isPending] = useActionState(createOrder, null);

  return (
    <form action={formAction}>
      <input name="items" type="hidden" value={JSON.stringify(cartItems)} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Placing Order...' : 'Place Order'}
      </button>
      {state?.id && <p>Order {state.id} created!</p>}
    </form>
  );
}
```

---

## Best Practices

1. **Default to server components** — only add `'use client'` when needed
2. **Push client boundaries down** — keep interactive parts as small as possible
3. **Use Suspense for progressive loading** — don't block the entire page
4. **Parallel fetch with Promise.all** — avoid request waterfalls
5. **Skeleton > spinner** — use skeletons for known layouts
6. **Error boundaries per section** — don't let one error crash the page

---

## Related Topics

- See [performance.md](performance.md) for client-side optimization
- See [hooks-advanced.md](hooks-advanced.md) for useTransition and useDeferredValue
- See [context-patterns.md](context-patterns.md) for error boundaries
- See main [SKILL.md](../SKILL.md) for decision tree

---

## References

- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Suspense](https://react.dev/reference/react/Suspense)
- [Server Actions](https://react.dev/reference/rsc/server-actions)
