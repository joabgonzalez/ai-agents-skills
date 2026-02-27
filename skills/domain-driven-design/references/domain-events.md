# Domain Events

## Concept

A Domain Event represents something **significant that happened in the domain** — a fact, expressed in the past tense, that domain experts care about. Events decouple the aggregate that caused the change from the side effects that must follow.

Instead of `Order` directly calling `EmailService.sendConfirmation()`, it raises `OrderConfirmed`. Subscribers (email service, inventory service, analytics) react independently, without the aggregate knowing about them.

---

## Key Characteristics

- **Immutable facts** — an event records what happened; it is never modified
- **Past tense naming** — `OrderConfirmed`, `UserRegistered`, `PaymentFailed` (not `ConfirmOrder`)
- **Raised by aggregates** — the aggregate method raises the event as part of its state change
- **Collected and published** — the use case or application service publishes events after persisting the aggregate
- **Enable eventual consistency** — side effects in other bounded contexts happen asynchronously

---

## When to Use

Use Domain Events when:

- A state change in one aggregate should trigger reactions in other parts of the system
- Side effects (email, notifications, inventory update) must be decoupled from the triggering aggregate
- You need an audit log of significant business occurrences
- Multiple bounded contexts need to react to the same business fact

Don't use Domain Events when:

- A simple in-process method call is sufficient (no need to decouple)
- The reaction must happen synchronously in the same transaction (use a domain service instead)

---

## Core Patterns

### Event class

```typescript
// domain/events/OrderConfirmed.ts
export class OrderConfirmed {
  readonly occurredAt: Date = new Date();

  constructor(
    readonly orderId: string,
    readonly customerId: string,
    readonly total: Money,
    readonly itemCount: number,
  ) {}
}
```

### Raising events inside the aggregate

```typescript
// domain/aggregates/Order.ts
export class Order {
  private _events: unknown[] = [];

  confirm(): void {
    if (this._items.length === 0) throw new Error('Cannot confirm empty order');
    if (this._status !== 'draft') throw new Error('Already confirmed');

    this._status = 'confirmed';

    // Raise event — aggregate records the fact, doesn't call side effects
    this._events.push(
      new OrderConfirmed(this.id, this.customerId, this.total, this._items.length),
    );
  }

  // Application layer calls this to collect and publish events after saving
  pullEvents(): unknown[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }
}
```

### Publishing in the application layer

```typescript
// application/use-cases/ConfirmOrder.ts
export class ConfirmOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private eventBus: IEventBus,
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.confirm();                         // 1. state change + raise event

    await this.orderRepo.save(order);        // 2. persist aggregate (transaction)

    const events = order.pullEvents();       // 3. collect events after save
    for (const event of events) {
      await this.eventBus.publish(event);    // 4. publish — triggers subscribers
    }
  }
}
```

### Event subscribers (handlers)

```typescript
// application/handlers/SendOrderConfirmationEmail.ts
export class SendOrderConfirmationEmail {
  async handle(event: OrderConfirmed): Promise<void> {
    await this.emailService.send({
      to: event.customerId,
      subject: `Order ${event.orderId} confirmed`,
      body: `Your order total: ${event.total.amount} ${event.total.currency}`,
    });
  }
}

// application/handlers/ReserveInventory.ts
export class ReserveInventory {
  async handle(event: OrderConfirmed): Promise<void> {
    await this.inventoryService.reserve(event.orderId);
  }
}
```

---

## Event Bus Interface (domain-agnostic)

```typescript
// domain/ports/IEventBus.ts
export interface IEventBus {
  publish(event: unknown): Promise<void>;
  subscribe<T>(eventType: new (...args: unknown[]) => T, handler: (event: T) => Promise<void>): void;
}
```

---

## Common Mistakes

**❌ Events published inside the aggregate (bypassing persistence boundary):**

```typescript
// WRONG: aggregate calls the event bus directly — side effects before save
class Order {
  confirm(): void {
    this._status = 'confirmed';
    eventBus.publish(new OrderConfirmed(...)); // not yet persisted!
  }
}

// CORRECT: aggregate collects, application layer publishes after save
```

**❌ Present tense event names:**

```typescript
// WRONG: sounds like a command, not a fact
class ConfirmOrder { ... }
class ProcessPayment { ... }

// CORRECT: past tense — something already happened
class OrderConfirmed { ... }
class PaymentProcessed { ... }
```

**❌ Mutating events:**

```typescript
// WRONG: events must be immutable records of what happened
class OrderConfirmed {
  status: string; // mutable field — events should never be modified
}

// CORRECT: all fields readonly
class OrderConfirmed {
  constructor(readonly orderId: string, readonly total: Money) {}
}
```

**❌ Publishing before save (lost events on failure):**

```typescript
// WRONG: publish first, then save — if save fails, event is already out
await eventBus.publish(event);
await orderRepo.save(order); // if this throws, event was published for nothing

// CORRECT: save first, publish after
await orderRepo.save(order);
await eventBus.publish(event);
```
