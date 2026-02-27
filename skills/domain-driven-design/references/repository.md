# Repository

## Concept

A Repository provides a **collection-oriented abstraction** over aggregate persistence. From the domain's perspective, it looks like an in-memory collection of aggregates — you add, find, and remove aggregates without knowing anything about databases, SQL, or ORMs.

The domain defines the Repository **interface**; infrastructure provides the **implementation**. This keeps the domain layer free of persistence concerns and makes it independently testable.

---

## Key Characteristics

- **One repository per aggregate root** — never for child entities or value objects
- **Collection metaphor** — `find`, `save`, `delete` — reads and writes the entire aggregate
- **Interface in domain layer** — no imports of DB drivers, ORMs, or frameworks
- **Implementation in infrastructure layer** — the concrete class knows about Postgres, MongoDB, etc.
- **Loads complete aggregates** — never partial loads; the whole aggregate is loaded or nothing

---

## When to Use

Define a Repository when:

- An aggregate needs to be persisted and retrieved
- You want to keep the domain model independent of infrastructure choices
- Tests should run without a real database (use an in-memory implementation)

Don't use Repository for:

- Read-only projections or reporting queries — use a Query object or a dedicated read model
- Child entities or value objects — only aggregate roots get repositories
- Cross-aggregate joins — each aggregate has its own repository; join at the application layer

---

## Core Patterns

### Domain interface (no DB knowledge)

```typescript
// domain/repositories/IOrderRepository.ts
import { Order } from '../aggregates/Order';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  findDraftsByCustomer(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;   // insert or update entire aggregate
  delete(id: string): Promise<void>;
}
```

### Infrastructure implementation (Postgres + Prisma)

```typescript
// infrastructure/repositories/PostgresOrderRepository.ts
import { PrismaClient } from '@prisma/client';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/aggregates/Order';
import { OrderItem } from '../../domain/aggregates/OrderItem';
import { Money } from '../../domain/value-objects/Money';

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: { items: true },    // load entire aggregate
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({
      where: { customerId },
      include: { items: true },
    });
    return rows.map(row => this.toDomain(row));
  }

  async findDraftsByCustomer(customerId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({
      where: { customerId, status: 'draft' },
      include: { items: true },
    });
    return rows.map(row => this.toDomain(row));
  }

  async save(order: Order): Promise<void> {
    // Save entire aggregate atomically
    await this.db.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: { id: order.id, customerId: order.customerId, status: order.status },
        update: { status: order.status },
      });

      // Replace items (delete-then-insert pattern for aggregate children)
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderItem.createMany({
        data: order.items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAmount: item.price.amount,
          priceCurrency: item.price.currency,
        })),
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.order.delete({ where: { id } });
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────
  private toDomain(row: OrderRow & { items: OrderItemRow[] }): Order {
    const order = Order.reconstitute(row.id, row.customerId, row.status);
    for (const item of row.items) {
      order.loadItem(new OrderItem(
        item.productId,
        new Money(item.priceAmount, item.priceCurrency),
        item.quantity,
      ));
    }
    return order;
  }
}
```

### In-memory implementation (for tests)

```typescript
// infrastructure/repositories/InMemoryOrderRepository.ts
export class InMemoryOrderRepository implements IOrderRepository {
  private store = new Map<string, Order>();

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return [...this.store.values()].filter(o => o.customerId === customerId);
  }

  async findDraftsByCustomer(customerId: string): Promise<Order[]> {
    return [...this.store.values()]
      .filter(o => o.customerId === customerId && o.status === 'draft');
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
```

---

## Common Mistakes

**❌ Repository for child entities:**

```typescript
// WRONG: OrderItem is a child entity, not an aggregate root
interface IOrderItemRepository { findById(id: string): Promise<OrderItem | null>; }

// CORRECT: OrderItem is only accessible through Order
const order = await orderRepo.findById(orderId);
const item = order.items.find(i => i.productId === productId);
```

**❌ Business logic in the repository:**

```typescript
// WRONG: business rule in infrastructure
class PostgresOrderRepository {
  async confirmOrder(id: string): Promise<void> {
    await this.db.order.update({ where: { id }, data: { status: 'confirmed' } });
    // Business rule belongs in Order.confirm(), not here
  }
}

// CORRECT: repository only persists; business logic stays in the aggregate
const order = await orderRepo.findById(id);
order.confirm();                    // domain rule enforced
await orderRepo.save(order);        // infrastructure saves
```

**❌ Partial aggregate loading:**

```typescript
// WRONG: loading aggregate root without its children
const row = await db.order.findUnique({ where: { id } });
// items not loaded — aggregate invariants cannot be enforced

// CORRECT: always load the complete aggregate
const row = await db.order.findUnique({
  where: { id },
  include: { items: true },
});
```
