# Mediator Pattern

Reduces component coupling by centralizing communication through a mediator instead of direct references. Components send messages to mediator, which coordinates responses—reducing coupling, centralizing coordination logic, and making components independently reusable.

## Core Patterns

Provides concrete TypeScript implementations of the Mediator pattern across backend (order processing, event bus) and frontend (Redux middleware, React Context) contexts, including a full CQRS implementation where the mediator routes commands and queries to registered handlers.

- Classic mediator: components notify via interface, mediator coordinates responses without direct coupling
- Event bus as mediator: publish/subscribe model where services communicate through typed events
- CQRS mediator: command and query registration with type-safe routing to dedicated handlers

---

## Pattern Structure

### Without Mediator (Tightly Coupled)

```typescript
// ❌ WRONG: Direct coupling
class Button {
  constructor(private dialog: Dialog) {}

  onClick() {
    this.dialog.submitForm(); // Directly references Dialog
  }
}

class TextField {
  constructor(private dialog: Dialog) {}

  onChange() {
    this.dialog.validateForm(); // Directly references Dialog
  }
}

class Dialog {
  submitForm() {
    /* ... */
  }
  validateForm() {
    /* ... */
  }
}
```

Problem: Button and TextField know about Dialog. Hard to reuse.

### With Mediator (Decoupled)

```typescript
// ✅ CORRECT: Mediator pattern

interface IMediator {
  notify(sender: Component, event: string): void;
}

abstract class Component {
  constructor(protected mediator: IMediator) {}
}

class Button extends Component {
  click(): void {
    this.mediator.notify(this, "button_clicked");
  }
}

class TextField extends Component {
  change(value: string): void {
    this.mediator.notify(this, "text_changed");
  }
}

class FormMediator implements IMediator {
  constructor(
    private button: Button,
    private textField: TextField,
  ) {}

  notify(sender: Component, event: string): void {
    if (event === "button_clicked") {
      this.submitForm();
    } else if (event === "text_changed") {
      this.validateForm();
    }
  }

  private submitForm(): void {
    console.log("Submitting form...");
  }

  private validateForm(): void {
    console.log("Validating form...");
  }
}

// Usage
const button = new Button(mediator);
const textField = new TextField(mediator);
const mediator = new FormMediator(button, textField);

button.click(); // Mediator handles coordination
```

---

## Backend Examples

### Example 1: Order Processing

```typescript
// Order processing involving multiple services
interface IOrderMediator {
  notifyOrderPlaced(orderId: string): Promise<void>;
  notifyPaymentReceived(orderId: string): Promise<void>;
  notifyShipmentReady(orderId: string): Promise<void>;
}

class OrderProcessingMediator implements IOrderMediator {
  constructor(
    private orderRepo: IOrderRepository,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private emailService: EmailService,
  ) {}

  async notifyOrderPlaced(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return;

    await this.inventoryService.reserveItems(order.items);
    await this.emailService.sendOrderConfirmation(order.customerId, orderId);
  }

  async notifyPaymentReceived(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return;

    order.markAsPaid();
    await this.orderRepo.save(order);

    await this.shippingService.createShipment(orderId);
    await this.emailService.sendPaymentConfirmation(order.customerId, orderId);
  }

  async notifyShipmentReady(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return;

    order.markAsShipped();
    await this.orderRepo.save(order);
    await this.emailService.sendShippingNotification(order.customerId, orderId);
  }
}

// Services notify mediator instead of calling each other
class OrderService {
  constructor(private mediator: IOrderMediator) {}

  async placeOrder(order: Order): Promise<void> {
    await this.orderRepo.save(order);
    await this.mediator.notifyOrderPlaced(order.id);
  }
}

class PaymentService {
  constructor(private mediator: IOrderMediator) {}

  async processPayment(orderId: string, token: string): Promise<void> {
    // Process payment...
    await this.mediator.notifyPaymentReceived(orderId);
  }
}
```

### Example 2: Event Bus (Mediator)

```typescript
// Event bus is a mediator for event-driven systems
type EventHandler = (event: any) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(eventType: string, event: any): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    await Promise.all(handlers.map((h) => h(event)));
  }
}

// Services communicate through event bus
class OrderService {
  constructor(private eventBus: EventBus) {}

  async placeOrder(order: Order): Promise<void> {
    await this.orderRepo.save(order);

    await this.eventBus.publish("order.placed", {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
    });
  }
}

class InventoryService {
  constructor(eventBus: EventBus) {
    eventBus.subscribe("order.placed", this.handleOrderPlaced.bind(this));
  }

  private async handleOrderPlaced(event: any): Promise<void> {
    await this.reserveItems(event.orderId);
  }
}

class EmailService {
  constructor(eventBus: EventBus) {
    eventBus.subscribe("order.placed", this.handleOrderPlaced.bind(this));
  }

  private async handleOrderPlaced(event: any): Promise<void> {
    await this.sendOrderConfirmation(event.customerId, event.orderId);
  }
}

// Setup
const eventBus = new EventBus();
const orderService = new OrderService(eventBus);
const inventoryService = new InventoryService(eventBus);
const emailService = new EmailService(eventBus);

// OrderService doesn't know about InventoryService or EmailService
await orderService.placeOrder(order); // Event bus coordinates
```

---

## Frontend Examples

### Example 1: Redux Middleware (Mediator)

```typescript
// Redux middleware acts as mediator between actions
const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === "user/login") {
    analytics.identify(action.payload.userId);
  } else if (action.type === "product/addToCart") {
    analytics.track("add_to_cart", action.payload);
  } else if (action.type === "order/complete") {
    analytics.track("purchase", { orderId: action.payload.orderId });
  }

  return next(action);
};

const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  console.log("Action:", action.type);
  return next(action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(analyticsMiddleware)
      .concat(loggingMiddleware),
});
```

### Example 2: React Context Mediator

```typescript
// Mediator coordinates communication between components
interface IAppMediator {
  notifyUserAction(action: string, data?: any): void;
}

class AppMediator implements IAppMediator {
  constructor(
    private analytics: IAnalytics,
    private logger: ILogger,
    private errorTracker: IErrorTracker
  ) {}

  notifyUserAction(action: string, data?: any): void {
    this.analytics.track(action, data);
    this.logger.log(`User action: ${action}`);

    if (action === 'checkout') {
      this.errorTracker.addBreadcrumb('User initiated checkout');
    }
  }
}

const MediatorContext = createContext<IAppMediator | null>(null);

export const MediatorProvider = ({ children }: Props) => {
  const mediator = new AppMediator(
    new SegmentAnalytics(),
    new ConsoleLogger(),
    new SentryErrorTracker()
  );

  return (
    <MediatorContext.Provider value={mediator}>
      {children}
    </MediatorContext.Provider>
  );
};

export const useMediator = () => {
  const mediator = useContext(MediatorContext);
  if (!mediator) throw new Error('Missing MediatorProvider');
  return mediator;
};

const CheckoutButton = () => {
  const mediator = useMediator();

  const handleClick = () => {
    mediator.notifyUserAction('checkout_clicked', { cartTotal: 100 });
    // Mediator coordinates analytics, logging, error tracking
  };

  return <button onClick={handleClick}>Checkout</button>;
};
```

---

## CQRS with Mediator

Command Query Responsibility Segregation uses mediator to route commands and queries:

```typescript
interface ICommand {}
interface IQuery<T> {}

interface ICommandHandler<T extends ICommand> {
  handle(command: T): Promise<void>;
}

interface IQueryHandler<T extends IQuery<R>, R> {
  handle(query: T): Promise<R>;
}

class Mediator {
  private commandHandlers = new Map<string, ICommandHandler<any>>();
  private queryHandlers = new Map<string, IQueryHandler<any, any>>();

  registerCommand<T extends ICommand>(
    commandType: string,
    handler: ICommandHandler<T>,
  ): void {
    this.commandHandlers.set(commandType, handler);
  }

  registerQuery<T extends IQuery<R>, R>(
    queryType: string,
    handler: IQueryHandler<T, R>,
  ): void {
    this.queryHandlers.set(queryType, handler);
  }

  async send<T extends ICommand>(command: T): Promise<void> {
    const handler = this.commandHandlers.get(command.constructor.name);
    if (!handler) throw new Error(`No handler for ${command.constructor.name}`);
    await handler.handle(command);
  }

  async query<T extends IQuery<R>, R>(query: T): Promise<R> {
    const handler = this.queryHandlers.get(query.constructor.name);
    if (!handler) throw new Error(`No handler for ${query.constructor.name}`);
    return await handler.handle(query);
  }
}

// Commands
class CreateOrderCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly items: OrderItem[],
  ) {}
}

class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  async handle(command: CreateOrderCommand): Promise<void> {
    const order = new Order(generateId(), command.customerId, command.items);
    await orderRepo.save(order);
  }
}

// Queries
class GetOrderQuery implements IQuery<Order> {
  constructor(public readonly orderId: string) {}
}

class GetOrderHandler implements IQueryHandler<GetOrderQuery, Order> {
  async handle(query: GetOrderQuery): Promise<Order> {
    return await orderRepo.findById(query.orderId);
  }
}

// Setup
const mediator = new Mediator();
mediator.registerCommand("CreateOrderCommand", new CreateOrderHandler());
mediator.registerQuery("GetOrderQuery", new GetOrderHandler());

// Usage (mediator routes to correct handler)
await mediator.send(new CreateOrderCommand("customer-1", items));
const order = await mediator.query(new GetOrderQuery("order-1"));
```

---

## When to Use

- Multiple components need to coordinate
- Complex component interactions
- Decoupling components is required
- Event-driven architecture
- CQRS pattern

---

## When NOT to Use

- Simple one-to-one communication
- Only 2-3 components
- Over-engineering for simple cases

---

## References

- [Main SKILL](../SKILL.md)
- [Clean Architecture](clean-architecture.md) - Mediator in Application layer
- [Frontend Integration](frontend-integration.md) - React examples
- [Backend Integration](backend-integration.md) - Event bus examples

**External**:

- [Mediator Pattern (Refactoring Guru)](https://refactoring.guru/design-patterns/mediator)
