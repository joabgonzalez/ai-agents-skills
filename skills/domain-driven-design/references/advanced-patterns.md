# Advanced DDD Patterns

## Core Patterns

Three strategic integration and workflow coordination patterns: Anti-Corruption Layer (ACL), Sagas / Process Managers, and Context Mapping.

---

## Anti-Corruption Layer (ACL)

### Concept

An Anti-Corruption Layer is a translation boundary that **prevents an external model from polluting your domain model**. When integrating with a legacy system, a third-party API, or a different bounded context, the ACL translates their concepts into your domain's language — shielding your domain from foreign abstractions.

Without an ACL, your domain objects slowly acquire fields and structures that only make sense in the external system, degrading the model.

### When to Use

- Integrating with legacy systems that have a different model
- Consuming a third-party API (payment processor, shipping carrier, CRM)
- Two bounded contexts with incompatible models must exchange data
- The external system's model is unstable or likely to change

### TypeScript Implementation

```typescript
// ─── External system types (not your domain) ──────────────────────────────
interface LegacyOrderPayload {
  ord_id: string;
  cust_ref: number;       // legacy uses numbers for IDs
  line_items: Array<{ prod_code: string; qty: number; unit_cost_cents: number }>;
  ord_status: 'N' | 'C' | 'S' | 'X'; // N=new, C=confirmed, S=shipped, X=cancelled
}

// ─── Your domain types ─────────────────────────────────────────────────────
// (Order, OrderItem, Money — your clean domain model)

// ─── Anti-Corruption Layer (translator) ───────────────────────────────────
// infrastructure/acl/LegacyOrderTranslator.ts
export class LegacyOrderTranslator {
  toDomain(payload: LegacyOrderPayload): Order {
    const statusMap: Record<string, OrderStatus> = {
      N: 'draft', C: 'confirmed', S: 'shipped', X: 'cancelled',
    };

    const order = Order.reconstitute(
      payload.ord_id,
      String(payload.cust_ref),     // translate: number → string ID
      statusMap[payload.ord_status] ?? 'draft',
    );

    for (const line of payload.line_items) {
      order.loadItem(new OrderItem(
        line.prod_code,
        new Money(line.unit_cost_cents / 100, 'USD'), // translate: cents → Money VO
        line.qty,
      ));
    }
    return order;
  }

  toExternal(order: Order): LegacyOrderPayload {
    const reverseStatusMap: Record<OrderStatus, string> = {
      draft: 'N', confirmed: 'C', shipped: 'S', cancelled: 'X',
    };
    return {
      ord_id: order.id,
      cust_ref: Number(order.customerId),
      line_items: order.items.map(item => ({
        prod_code: item.productId,
        qty: item.quantity,
        unit_cost_cents: item.price.amount * 100,
      })),
      ord_status: reverseStatusMap[order.status],
    };
  }
}
```

### ACL Patterns

**Adapter** — wrap the external API with your domain interface:

```typescript
// domain/ports/IPaymentGateway.ts (your port)
export interface IPaymentGateway {
  charge(amount: Money, token: string): Promise<PaymentResult>;
}

// infrastructure/adapters/StripePaymentAdapter.ts (ACL adapter)
export class StripePaymentAdapter implements IPaymentGateway {
  async charge(amount: Money, token: string): Promise<PaymentResult> {
    const stripeResult = await this.stripe.charges.create({
      amount: Math.round(amount.amount * 100), // cents conversion
      currency: amount.currency.toLowerCase(),
      source: token,
    });
    return this.translateResult(stripeResult); // translate to your domain type
  }
}
```

---

## Sagas / Process Managers

### Concept

A Saga (also called Process Manager) coordinates **long-running business processes that span multiple aggregates** and may require eventual consistency. When a single database transaction cannot span the entire workflow, Sagas manage the sequence of steps and compensating transactions for rollback.

**Choreography** — aggregates communicate via domain events, no central coordinator.
**Orchestration** — a dedicated Saga class controls the workflow, calling each step explicitly.

### When to Use

- A business process spans multiple aggregates or bounded contexts (order fulfillment: Order → Inventory → Shipping → Notification)
- Steps must complete eventually but not within a single transaction
- Failures at any step require compensating actions (cancel reservation, refund payment)
- The workflow has clear states and transitions

### Choreography Example (event-driven, no central coordinator)

```typescript
// Each service reacts to the previous step's event

// 1. Order confirmed → Inventory reacts
class InventoryService {
  async handleOrderConfirmed(event: OrderConfirmed): Promise<void> {
    await this.inventory.reserve(event.orderId);
    await this.eventBus.publish(new InventoryReserved(event.orderId));
  }
}

// 2. Inventory reserved → Shipping reacts
class ShippingService {
  async handleInventoryReserved(event: InventoryReserved): Promise<void> {
    await this.shipping.schedule(event.orderId);
    await this.eventBus.publish(new ShipmentScheduled(event.orderId));
  }
}

// 3. Shipment scheduled → Notification reacts
class NotificationService {
  async handleShipmentScheduled(event: ShipmentScheduled): Promise<void> {
    await this.notifications.sendShipmentConfirmation(event.orderId);
  }
}
```

### Orchestration Example (central coordinator)

```typescript
// domain/sagas/OrderFulfillmentSaga.ts
export type SagaStatus = 'started' | 'inventory_reserved' | 'shipped' | 'completed' | 'failed';

export class OrderFulfillmentSaga {
  private _status: SagaStatus = 'started';
  private _compensations: Array<() => Promise<void>> = [];

  constructor(readonly sagaId: string, readonly orderId: string) {}

  get status(): SagaStatus { return this._status; }

  async execute(
    inventoryService: IInventoryService,
    shippingService: IShippingService,
    notificationService: INotificationService,
  ): Promise<void> {
    try {
      // Step 1: Reserve inventory
      await inventoryService.reserve(this.orderId);
      this._compensations.push(() => inventoryService.release(this.orderId));
      this._status = 'inventory_reserved';

      // Step 2: Schedule shipment
      await shippingService.schedule(this.orderId);
      this._compensations.push(() => shippingService.cancel(this.orderId));
      this._status = 'shipped';

      // Step 3: Send notification (no compensation needed)
      await notificationService.sendConfirmation(this.orderId);
      this._status = 'completed';

    } catch (error) {
      this._status = 'failed';
      await this.compensate();
      throw error;
    }
  }

  private async compensate(): Promise<void> {
    // Execute compensating transactions in reverse order
    for (const compensation of [...this._compensations].reverse()) {
      await compensation().catch(console.error); // best-effort compensation
    }
  }
}
```

### Idempotency in Sagas

Each saga step must be idempotent — safe to retry after a failure:

```typescript
// Use saga ID to detect and skip already-completed steps
async reserve(orderId: string, sagaId: string): Promise<void> {
  const existing = await this.db.reservation.findFirst({ where: { orderId, sagaId } });
  if (existing) return; // already done — skip (idempotent)
  await this.db.reservation.create({ data: { orderId, sagaId } });
}
```

---

## Context Mapping Patterns

### Concept

Context Mapping describes the **relationships and integration strategies between Bounded Contexts**. When two contexts must exchange data, the map defines who adapts to whom and how.

### Patterns

**Partnership** — two teams coordinate closely; models evolve together. Changes in one context require coordinated changes in the other. Use when teams have equal power and tight delivery coupling.

**Customer-Supplier** — upstream team (supplier) provides an API; downstream team (customer) consumes it. Upstream has control; downstream adapts. Common between platform and product teams.

**Conformist** — downstream adopts the upstream model without translation. No ACL. Use only when the upstream model is well-designed and the cost of translation outweighs the coupling.

**Anti-Corruption Layer** — downstream translates the upstream model into its own domain language. Shields against upstream model instability. See Anti-Corruption Layer section above.

**Published Language** — a formally documented shared language (OpenAPI spec, Avro schema, event schema registry) that multiple contexts consume. Decouples consumers from each other.

**Separate Ways** — contexts have no integration. Each solves its own problem independently. Use when integration cost exceeds benefit.

### Choosing a Pattern

```
Upstream model is well-designed and stable?
  YES + integration is low-risk → Conformist
  NO or unstable → Anti-Corruption Layer

Teams have equal power and tight coupling?
  YES → Partnership
  NO, upstream controls → Customer-Supplier

Multiple teams consuming the same interface?
  → Published Language (formal contract)

No shared data or behavior needed?
  → Separate Ways
```
