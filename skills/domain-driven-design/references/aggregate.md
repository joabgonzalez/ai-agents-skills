# Aggregate

## Concept

An Aggregate is a cluster of related domain objects (Entities and Value Objects) treated as a single unit for the purpose of data changes. One Entity within the cluster is designated the **Aggregate Root** — the only entry point for all external interactions.

Aggregates define **consistency boundaries**: all invariants within the aggregate are guaranteed after every operation. Persistence is always transactional at the aggregate level — the entire aggregate is saved or none of it is.

---

## Key Characteristics

- **Aggregate Root** — one Entity controls access to all other objects in the cluster
- **Consistency boundary** — all invariants hold within one aggregate after every operation
- **Single transaction** — save the entire aggregate atomically; never partial saves
- **External references by ID only** — other aggregates hold only the ID of this root, never a direct object reference
- **Small by design** — prefer smaller aggregates to reduce contention and improve concurrency

---

## When to Use

Design an Aggregate when:

- Multiple objects must maintain invariants together (Order must always have a consistent total across its items)
- A group of objects changes together atomically (adding/removing OrderItems must stay consistent with Order status)
- You need a clear boundary for who owns what data

Keep aggregates small:

- If an aggregate has 10+ child objects, it's likely too large — consider splitting
- Each aggregate root should map to one `save()` call in a repository
- Contention on a large aggregate blocks all operations on it (concurrency problem)

---

## Core Patterns

```typescript
// domain/aggregates/Order.ts — Aggregate Root
import { Money } from '../value-objects/Money';
import { OrderItem } from './OrderItem';
import { OrderConfirmed } from '../events/OrderConfirmed';

export type OrderStatus = 'draft' | 'confirmed' | 'shipped' | 'cancelled';

export class Order {                           // Aggregate Root
  private _items: OrderItem[] = [];
  private _status: OrderStatus = 'draft';
  private _events: unknown[] = [];

  constructor(
    readonly id: string,
    readonly customerId: string,
  ) {}

  // ─── Read-only access to children ────────────────────────────────────────
  get items(): readonly OrderItem[] { return this._items; }
  get status(): OrderStatus         { return this._status; }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0, 'USD'),
    );
  }

  // ─── Controlled mutation through root ────────────────────────────────────
  addItem(productId: string, price: Money, quantity: number): void {
    if (this._status !== 'draft') {
      throw new Error('Cannot modify a confirmed order');
    }
    const existing = this._items.find(i => i.productId === productId);
    if (existing) {
      existing.increaseQuantity(quantity);  // delegate to child entity
    } else {
      this._items.push(new OrderItem(productId, price, quantity));
    }
  }

  removeItem(productId: string): void {
    if (this._status !== 'draft') throw new Error('Cannot modify a confirmed order');
    this._items = this._items.filter(i => i.productId !== productId);
  }

  // ─── Invariant enforcement ────────────────────────────────────────────────
  confirm(): void {
    if (this._items.length === 0) throw new Error('Cannot confirm an empty order');
    if (this._status !== 'draft') throw new Error('Order is already confirmed');
    this._status = 'confirmed';
    this._events.push(new OrderConfirmed(this.id, this.customerId, this.total, new Date()));
  }

  cancel(): void {
    if (this._status === 'shipped') throw new Error('Cannot cancel a shipped order');
    this._status = 'cancelled';
  }

  // ─── Domain events ────────────────────────────────────────────────────────
  pullEvents(): unknown[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }
}

// domain/aggregates/OrderItem.ts — child entity, only accessible via Order
export class OrderItem {
  constructor(
    readonly productId: string,
    readonly price: Money,
    private _quantity: number,
  ) {
    if (_quantity <= 0) throw new Error('Quantity must be positive');
  }

  get quantity(): number { return this._quantity; }
  get subtotal(): Money  { return this.price.multiply(this._quantity); }

  increaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    this._quantity += amount;
  }
}
```

---

## Aggregate Design Rules

**External references by ID, not object:**

```typescript
// WRONG: holding a reference to another aggregate
class Order {
  customer: Customer; // tight coupling — two aggregates in one transaction
}

// CORRECT: hold only the ID
class Order {
  customerId: string; // reference by ID; load Customer separately if needed
}
```

**Never reach into a child directly:**

```typescript
// WRONG: bypassing the aggregate root
order.items.push(new OrderItem(...)); // circumvents business rules

// CORRECT: always go through the root
order.addItem(productId, price, quantity); // root enforces all rules
```

**One aggregate = one transaction:**

```typescript
// WRONG: saving two aggregates in one transaction
await db.$transaction(async (tx) => {
  await orderRepo.save(order, tx);
  await inventoryRepo.save(inventory, tx); // different aggregate!
});

// CORRECT: eventual consistency via domain events
// Order publishes OrderConfirmed → Inventory subscribes and reserves stock
```

---

## Common Mistakes

**Too-large aggregates** — everything in one root causes lock contention. If `save(order)` locks 500 items, every concurrent order operation blocks. Design around business transaction boundaries, not data convenience.

**Too-small aggregates** — splitting invariants across two aggregates makes them impossible to enforce transactionally. If Order and OrderItems must always be consistent, they belong in the same aggregate.

**Exposing mutable collections:**

```typescript
// WRONG: returns mutable array
get items(): OrderItem[] { return this._items; }

// CORRECT: returns readonly view
get items(): readonly OrderItem[] { return this._items; }
```
