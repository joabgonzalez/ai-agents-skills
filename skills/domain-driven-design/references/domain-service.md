# Domain Service

## Concept

A Domain Service encapsulates **business logic that doesn't naturally belong to a single Entity or Value Object**. It operates on multiple domain objects — often across aggregates — and expresses a business operation that involves coordination between them.

Domain Services are **stateless**: they hold no instance variables beyond injected dependencies, and their result depends only on the domain objects passed in.

---

## Key Characteristics

- **Stateless** — no mutable state; behavior depends entirely on inputs
- **Cross-aggregate** — operates on two or more aggregates or domain objects
- **Named after domain operations** — `PricingService`, `TransferService`, `AuthorizationService`
- **Lives in the domain layer** — no infrastructure dependencies (no DB, no HTTP)
- **Not an application service** — domain services contain business rules; application services orchestrate use cases

---

## When to Use

Extract to a Domain Service when:

- The operation involves multiple aggregates that shouldn't know about each other
- The operation is a meaningful concept in the domain but has no clear "home" in a single entity
- Placing the logic in an entity would create an awkward dependency (`Order.calculateWith(customer: Customer)` means Order now depends on Customer)

Don't use Domain Service when:

- The logic naturally belongs to a single entity or value object — keep it there
- The logic is application orchestration (sequence of use case steps) — use an Application Service instead
- The operation requires infrastructure (DB queries, HTTP calls) — use a repository or an infrastructure service

---

## Core Patterns

### PricingService — cross-aggregate discount calculation

```typescript
// domain/services/PricingService.ts
import { Order } from '../aggregates/Order';
import { Customer } from '../aggregates/Customer';
import { Money } from '../value-objects/Money';

export class PricingService {
  // Business rules: VIP discount, volume discount — spans Order and Customer
  calculateDiscount(order: Order, customer: Customer): Money {
    const total = order.total;

    // Rule 1: VIP customers get 10% off
    if (customer.isVip) {
      return total.multiply(0.10);
    }

    // Rule 2: Orders over $500 get 5% off
    if (total.amount > 500) {
      return total.multiply(0.05);
    }

    // Rule 3: First-time customers get $10 off orders over $50
    if (customer.isFirstOrder && total.amount > 50) {
      return new Money(10, total.currency);
    }

    return new Money(0, total.currency);
  }

  applyDiscount(order: Order, customer: Customer): Money {
    const discount = this.calculateDiscount(order, customer);
    return order.total.subtract(discount);
  }
}
```

### TransferService — cross-aggregate funds transfer

```typescript
// domain/services/TransferService.ts
import { Account } from '../aggregates/Account';
import { Money } from '../value-objects/Money';

export class TransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    // Business rule: both accounts must be in the same currency
    if (!from.balance.currency === to.balance.currency) {
      throw new Error('Cross-currency transfers require explicit conversion');
    }

    from.debit(amount);   // Account enforces its own invariants (insufficient funds)
    to.credit(amount);    // Each aggregate guards its own state
  }
}
```

### AuthorizationService — policy-based access control

```typescript
// domain/services/AuthorizationService.ts
import { User } from '../entities/User';
import { Order } from '../aggregates/Order';

export class OrderAuthorizationService {
  canModify(user: User, order: Order): boolean {
    // Business rule: only the order's customer or an admin can modify it
    return user.id === order.customerId || user.hasRole('admin');
  }

  canCancel(user: User, order: Order): boolean {
    return this.canModify(user, order) && order.status !== 'shipped';
  }
}
```

### Using Domain Service in an Application Service

```typescript
// application/use-cases/CheckoutOrder.ts
export class CheckoutOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private customerRepo: ICustomerRepository,
    private pricingService: PricingService,        // domain service injected
    private eventBus: IEventBus,
  ) {}

  async execute(orderId: string, customerId: string): Promise<Money> {
    const [order, customer] = await Promise.all([
      this.orderRepo.findById(orderId),
      this.customerRepo.findById(customerId),
    ]);

    if (!order || !customer) throw new Error('Order or Customer not found');

    // Domain service applies cross-aggregate business rule
    const finalPrice = this.pricingService.applyDiscount(order, customer);

    order.confirm();
    await this.orderRepo.save(order);

    for (const event of order.pullEvents()) {
      await this.eventBus.publish(event);
    }

    return finalPrice;
  }
}
```

---

## Domain Service vs Application Service

| | Domain Service | Application Service |
|---|---|---|
| **Contains** | Business rules and domain logic | Orchestration steps |
| **Layer** | Domain | Application |
| **Dependencies** | Only domain objects | Repos, domain services, event bus |
| **Stateful** | No | No |
| **Example** | `PricingService.calculateDiscount(order, customer)` | `CheckoutOrderUseCase.execute(orderId, customerId)` |

---

## Common Mistakes

**❌ Infrastructure in a Domain Service:**

```typescript
// WRONG: domain service makes a DB call
class PricingService {
  async calculateDiscount(orderId: string): Promise<Money> {
    const order = await this.db.order.findUnique({ where: { id: orderId } }); // DB!
    ...
  }
}

// CORRECT: domain service receives already-loaded domain objects
class PricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    // pure domain logic — no infrastructure
  }
}
```

**❌ Stateful Domain Service:**

```typescript
// WRONG: storing state in a domain service
class PricingService {
  private lastCalculatedPrice: Money; // stateful!

  calculateDiscount(order: Order): Money {
    this.lastCalculatedPrice = ...; // shared state breaks concurrent usage
    return this.lastCalculatedPrice;
  }
}

// CORRECT: stateless — result depends only on inputs
class PricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    return ...; // pure function — no side effects, no stored state
  }
}
```

**❌ Logic that belongs in an Entity placed in a Domain Service:**

```typescript
// WRONG: Order.confirm() logic moved to a service
class OrderService {
  confirm(order: Order): void {
    if (order.items.length === 0) throw new Error('Empty order');
    order.status = 'confirmed'; // breaking encapsulation
  }
}

// CORRECT: invariants belong in the aggregate
class Order {
  confirm(): void {
    if (this._items.length === 0) throw new Error('Cannot confirm empty order');
    this._status = 'confirmed';
  }
}
```
