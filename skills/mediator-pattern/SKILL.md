---
name: mediator-pattern
description: "Decouples components via centralized mediator. Trigger: When direct coupling makes components hard to test, reuse, or when orchestrating workflows."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Mediator Pattern

Centralizes communication between components through a mediator instead of direct references. Components send messages/events to the mediator, which coordinates responses—reducing coupling and making components independently reusable.

## When to Use

- Multiple components need to communicate (UI components, services, handlers)
- Direct component coupling makes testing or reuse difficult
- Orchestrating multi-step workflows (CQRS command/event bus)
- Complex form validation where many fields affect each other

Don't use for:

- Simple parent-child communication (props/callbacks are fine)
- Two components that genuinely belong together
- Systems where central coordination becomes a bottleneck

---

## Critical Patterns

### ✅ REQUIRED: Components Communicate via Mediator

Components know the mediator, not each other.

```typescript
interface IMediator { notify(sender: Component, event: string): void; }

class Button {
  constructor(private mediator: IMediator) {}
  click(): void { this.mediator.notify(this, 'click'); }
}

class TextField {
  constructor(private mediator: IMediator) {}
  change(value: string): void { this.mediator.notify(this, 'change'); }
}

class FormMediator implements IMediator {
  private button: Button;
  private textField: TextField;

  notify(sender: Component, event: string): void {
    if (sender === this.textField && event === 'change') {
      this.validateForm();
    }
    if (sender === this.button && event === 'click') {
      this.submitForm();
    }
  }
}
```

### ✅ REQUIRED: CQRS Mediator (Command/Query Bus)

Commands and queries dispatched through mediator to handlers.

```typescript
// Mediator dispatches to handlers
class Mediator {
  private handlers = new Map<string, Handler>();
  register(command: string, handler: Handler) { this.handlers.set(command, handler); }
  async send<T>(command: Command): Promise<T> {
    const handler = this.handlers.get(command.constructor.name);
    return handler.handle(command);
  }
}

// Usage
const mediator = new Mediator();
mediator.register('CreateOrder', new CreateOrderHandler(repo, email));

const result = await mediator.send(new CreateOrder(customerId, items));
```

### ❌ NEVER: God Mediator

```typescript
// ❌ WRONG: Mediator knows about ALL business logic → becomes a giant class
class AppMediator {
  handleUserRegistration() { ... }
  handleOrderPlacement() { ... }
  handlePaymentProcessing() { ... }
  handleInventoryUpdate() { ... }
  // 50 more methods — this is a God Object disguised as a mediator
}

// ✅ CORRECT: Separate mediators per bounded context
class OrderMediator { ... }
class UserMediator  { ... }
```

---

## Decision Tree

```
Components directly referencing each other?
  → Introduce mediator to decouple

Multiple handlers for same event?
  → Event bus mediator (publish/subscribe)

Command needs single handler?
  → Command bus mediator (CQRS)

Mediator growing too large?
  → Split into domain-specific mediators

Simple parent → child communication?
  → Props/callbacks are sufficient; no mediator needed
```

---

## Example

```typescript
// Event Bus (simple mediator for pub/sub)
class EventBus {
  private listeners = new Map<string, Function[]>();

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }
}

// Usage
const bus = new EventBus();
bus.on('user:registered', ({ email }) => sendWelcomeEmail(email));
bus.on('user:registered', ({ id }) => analytics.track('signup', { userId: id }));

// Trigger
bus.emit('user:registered', { id: user.id, email: user.email });
```

---

## Edge Cases

**Over-centralization:** If mediator handles too many concerns, it becomes a bottleneck. Split into domain-specific mediators.

**Debugging complexity:** With indirect communication, tracing which component triggered which behavior can be harder. Add logging in mediator.

**React analogy:** React Context is a simple mediator. Redux store + dispatch is a command bus. Use appropriate level of complexity.

---

## Resources

- [implementations.md](references/implementations.md) — Full examples, event bus, CQRS implementation, NestJS CQRS
