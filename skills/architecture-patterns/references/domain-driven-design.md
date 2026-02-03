# Domain-Driven Design (DDD)

> Strategic and tactical patterns for modeling complex business domains with ubiquitous language, bounded contexts, entities, value objects, and aggregates.

## Overview

DDD is both a philosophy and set of patterns for building software that closely models complex business domains. Focuses on collaboration between domain experts and developers using shared language.

**Two aspects**:

1. **Strategic DDD**: High-level organization (bounded contexts, context mapping, ubiquitous language)
2. **Tactical DDD**: Implementation patterns (entities, value objects, aggregates, repositories, domain services)

---

## Strategic DDD

### Ubiquitous Language

Shared vocabulary between domain experts and developers. Use the same terms in code, documentation, and conversations.

```typescript
// ❌ WRONG: Generic technical terms
class Record {
  process() {
    /* ... */
  }
}

// ✅ CORRECT: Domain language
class Order {
  confirm() {
    /* ... */
  } // "confirm" is what business calls it
  cancel() {
    /* ... */
  }
}
```

### Bounded Context

Explicit boundary within which a model is defined. Same concept can mean different things in different contexts.

**Example: E-commerce**

```
┌─────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
│  Sales Context      │  │  Inventory Context   │  │  Shipping Context  │
│                     │  │                      │  │                    │
│  Product:           │  │  Product:            │  │  Package:          │
│  - name             │  │  - sku               │  │  - trackingNumber  │
│  - price            │  │  - quantity          │  │  - weight          │
│  - description      │  │  - location          │  │  - dimensions      │
└─────────────────────┘  └──────────────────────┘  └────────────────────┘
```

**"Product"** means different things in each context. Don't force a single "Product" model across all contexts.

```typescript
// sales/domain/Product.ts (Sales context)
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: Money,
    public readonly description: string,
  ) {}

  applyDiscount(percentage: number): Money {
    return this.price.multiply(1 - percentage / 100);
  }
}

// inventory/domain/Product.ts (Inventory context)
export class Product {
  constructor(
    public readonly sku: string,
    public readonly quantity: number,
    public readonly location: string,
  ) {}

  reserve(amount: number): void {
    if (this.quantity < amount) {
      throw new Error("Insufficient stock");
    }
    this.quantity -= amount;
  }
}
```

---

## Tactical DDD

### Entity

Object with unique identity that persists over time. Identity matters more than attributes.

**Characteristics**:

- Has unique ID
- Mutable (attributes can change)
- Compared by ID, not attributes

```typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string, // Identity
    public name: string,
    public email: string,
  ) {}

  changeName(newName: string): void {
    if (!newName.trim()) {
      throw new Error("Name cannot be empty");
    }
    this.name = newName;
  }

  equals(other: User): boolean {
    return this.id === other.id; // Compare by ID
  }
}

const user1 = new User("1", "John", "john@example.com");
const user2 = new User("1", "Jane", "jane@example.com");

console.log(user1.equals(user2)); // true - same identity, even if different attributes
```

### Value Object

Object with no identity. Defined entirely by its attributes. Immutable.

**Characteristics**:

- No unique ID
- Immutable (create new instance to "change")
- Compared by attributes, not identity
- Can be shared safely

```typescript
// domain/value-objects/Money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

// Usage
const price1 = new Money(100, "USD");
const price2 = new Money(50, "USD");
const total = price1.add(price2); // New instance
console.log(total.amount); // 150
```

```typescript
// domain/value-objects/Email.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error("Invalid email");
    }
    this.value = email.toLowerCase();
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Usage
const email = new Email("USER@EXAMPLE.COM"); // Normalizes to lowercase
console.log(email.toString()); // 'user@example.com'
```

### Aggregate

Cluster of entities and value objects with a single root entity. Maintains consistency boundaries.

**Rules**:

- One entity is the **Aggregate Root** (entry point)
- External objects can only reference the root
- Root enforces invariants
- Aggregates are transactional boundaries

```typescript
// domain/aggregates/Order.ts (Aggregate Root)
export class Order {
  private _items: OrderItem[] = [];

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    private _status: OrderStatus,
  ) {}

  get items(): readonly OrderItem[] {
    return this._items; // Read-only access
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0, "USD"),
    );
  }

  // Only way to add items (enforce business rules)
  addItem(productId: string, quantity: number, price: Money): void {
    if (this._status !== "draft") {
      throw new Error("Cannot modify confirmed order");
    }

    // Check if item already exists
    const existing = this._items.find((i) => i.productId === productId);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this._items.push(new OrderItem(productId, quantity, price));
    }
  }

  // Invariant: Cannot confirm empty order
  confirm(): void {
    if (this._items.length === 0) {
      throw new Error("Cannot confirm empty order");
    }
    if (this._status !== "draft") {
      throw new Error("Order already confirmed");
    }
    this._status = "confirmed";
  }
}

// domain/aggregates/OrderItem.ts (Part of Order aggregate)
export class OrderItem {
  constructor(
    public readonly productId: string,
    private _quantity: number,
    public readonly price: Money,
  ) {
    if (_quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
  }

  get quantity(): number {
    return this._quantity;
  }

  get subtotal(): Money {
    return this.price.multiply(this._quantity);
  }

  increaseQuantity(amount: number): void {
    this._quantity += amount;
  }
}

// Usage
const order = new Order("1", "customer-123", "draft");
order.addItem("product-1", 2, new Money(50, "USD"));
order.addItem("product-2", 1, new Money(100, "USD"));
console.log(order.total.amount); // 200

order.confirm();
// order.addItem(...); // Throws: Cannot modify confirmed order
```

### Repository

Abstraction for persisting and retrieving aggregates. One repository per aggregate root.

```typescript
// domain/repositories/IOrderRepository.ts
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>; // Save entire aggregate
  delete(id: string): Promise<void>;
}

// infrastructure/repositories/PostgresOrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    // Load entire aggregate (root + items)
    const row = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!row) return null;

    const order = new Order(row.id, row.customerId, row.status);
    row.items.forEach((item) => {
      order.addItem(
        item.productId,
        item.quantity,
        new Money(item.price, item.currency),
      );
    });

    return order;
  }

  async save(order: Order): Promise<void> {
    // Save entire aggregate atomically
    await db.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          customerId: order.customerId,
          status: order.status,
        },
        update: { status: order.status },
      });

      // Delete old items
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });

      // Insert new items
      await tx.orderItem.createMany({
        data: order.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.amount,
          currency: item.price.currency,
        })),
      });
    });
  }
}
```

### Domain Service

Operation that doesn't belong to a specific entity or value object. Stateless.

```typescript
// domain/services/PricingService.ts
export class PricingService {
  calculateDiscount(customer: Customer, order: Order): Money {
    // Business rule: VIP customers get 10% off
    if (customer.isVIP) {
      return order.total.multiply(0.1);
    }

    // Business rule: Orders over $500 get 5% off
    if (order.total.amount > 500) {
      return order.total.multiply(0.05);
    }

    return new Money(0, order.total.currency);
  }
}

// Usage in use case
const pricingService = new PricingService();
const discount = pricingService.calculateDiscount(customer, order);
const finalPrice = order.total.subtract(discount);
```

### Domain Event

Something that happened in the domain that domain experts care about.

```typescript
// domain/events/OrderConfirmed.ts
export class OrderConfirmed {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredAt: Date,
  ) {}
}

// domain/aggregates/Order.ts
export class Order {
  private _events: DomainEvent[] = [];

  confirm(): void {
    if (this._items.length === 0) {
      throw new Error("Cannot confirm empty order");
    }

    this._status = "confirmed";

    // Raise domain event
    this._events.push(
      new OrderConfirmed(this.id, this.customerId, this.total, new Date()),
    );
  }

  getEvents(): DomainEvent[] {
    return this._events;
  }

  clearEvents(): void {
    this._events = [];
  }
}

// application/use-cases/ConfirmOrder.ts
export class ConfirmOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private eventBus: IEventBus,
  ) {}

  async execute(orderId: string): Promise<Result<void>> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return Result.fail("Order not found");

    order.confirm();

    await this.orderRepo.save(order);

    // Publish domain events
    for (const event of order.getEvents()) {
      await this.eventBus.publish(event);
    }

    order.clearEvents();

    return Result.ok(undefined);
  }
}

// Event handler
export class SendOrderConfirmationEmail {
  async handle(event: OrderConfirmed): Promise<void> {
    await emailService.sendOrderConfirmation(
      event.customerId,
      event.orderId,
      event.total,
    );
  }
}
```

---

## Frontend Application

DDD can apply to frontend with complex business logic:

```typescript
// domain/entities/ShoppingCart.ts (Frontend aggregate)
export class ShoppingCart {
  private _items: CartItem[] = [];

  addProduct(productId: string, quantity: number, price: Money): void {
    const existing = this._items.find(i => i.productId === productId);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this._items.push(new CartItem(productId, quantity, price));
    }
  }

  removeProduct(productId: string): void {
    this._items = this._items.filter(i => i.productId !== productId);
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0, 'USD')
    );
  }

  get itemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  canCheckout(): boolean {
    return this._items.length > 0 && this.total.amount >= 10; // Business rule
  }
}

// React component uses domain model
const CartSummary = () => {
  const cart = useSelector(selectCart); // Redux stores domain model

  return (
    <div>
      <p>Items: {cart.itemCount}</p>
      <p>Total: ${cart.total.amount}</p>
      <button disabled={!cart.canCheckout()}>
        Checkout
      </button>
    </div>
  );
};
```

---

## When to Use DDD

**Use when**:

- Complex business domain
- Domain logic changes frequently
- Close collaboration with domain experts
- Long-term maintainability priority

**Don't use when**:

- Simple CRUD
- Data transformation pipelines
- No clear domain experts
- Small, short-lived projects

---

## Anti-Patterns

### ❌ Anemic Domain Model

Entities with only getters/setters, no behavior:

```typescript
// WRONG: Anemic (no business logic)
class Order {
  id: string;
  items: OrderItem[];
  status: string;

  getTotal() { return this.items.reduce(...); }
}

// Business logic in service instead
class OrderService {
  confirm(order: Order) {
    if (order.items.length === 0) throw new Error('...');
    order.status = 'confirmed'; // Directly modifying state
  }
}
```

```typescript
// CORRECT: Rich domain model
class Order {
  confirm(): void {
    if (this._items.length === 0) {
      throw new Error("Cannot confirm empty order");
    }
    this._status = "confirmed"; // Encapsulated
  }
}
```

### ❌ Exposing Internal Collections

```typescript
// WRONG: Mutable collection exposed
class Order {
  items: OrderItem[]; // Can be modified directly
}

order.items.push(item); // Bypasses business rules

// CORRECT: Controlled access
class Order {
  private _items: OrderItem[];

  get items(): readonly OrderItem[] {
    return this._items; // Read-only
  }

  addItem(item: OrderItem): void {
    // Enforce business rules
  }
}
```

---

## Summary

**Strategic DDD**:

- Ubiquitous Language: Shared vocabulary
- Bounded Context: Explicit model boundaries
- Context Mapping: Relationships between contexts

**Tactical DDD**:

- Entity: Identity matters
- Value Object: Attributes matter, immutable
- Aggregate: Consistency boundary
- Repository: Persist aggregates
- Domain Service: Operations spanning entities
- Domain Event: Something that happened

---

## References

- [Main SKILL](../SKILL.md)
- [SOLID Principles](solid-principles.md)
- [Clean Architecture](clean-architecture.md) - DDD fits in Domain layer
- [Backend Integration](backend-integration.md)
- [Frontend Integration](frontend-integration.md)

**External**:

- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/)
- [Implementing DDD (Vaughn Vernon)](https://vaughnvernon.com/)
