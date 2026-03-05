# Mediator Pattern References

This directory contains concrete TypeScript implementations of the Mediator pattern across backend and frontend contexts, including classic mediator, event bus, Redux middleware, React Context, and a full CQRS implementation.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [implementations.md](implementations.md) | Classic mediator structure, order processing mediator, event bus, Redux middleware mediator, React Context mediator, CQRS command/query routing | When implementing multi-component coordination, event-driven architecture, or CQRS |

---

## Reading Strategy

### For decoupling components or services

1. Read main [SKILL.md](../SKILL.md) for trigger criteria and Critical Patterns
2. MUST read: [implementations.md](implementations.md) "Pattern Structure" section for the without/with mediator contrast, then the relevant backend or frontend example

### For building an event-driven system

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. MUST read: [implementations.md](implementations.md) "Event Bus (Mediator)" section for the publish/subscribe pattern with typed events

### For implementing CQRS

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [implementations.md](implementations.md) "CQRS with Mediator" section for command and query handler registration and routing

---

## File Descriptions

### [implementations.md](implementations.md)

**Full set of Mediator pattern implementations from classic structure to CQRS with TypeScript examples**

- Classic mediator: IMediator interface, Button/TextField components, FormMediator coordinating without direct coupling
- Backend order processing: OrderProcessingMediator coordinating inventory, shipping, and email across order lifecycle events
- Event bus: typed publish/subscribe mediator where OrderService, InventoryService, and EmailService communicate without references to each other
- Frontend Redux middleware: analyticsMiddleware acting as mediator between dispatched actions and analytics/logging services
- Frontend React Context: AppMediator coordinating analytics, logger, and error tracker via context provider and useMediator hook
- CQRS mediator: Mediator class with registerCommand/registerQuery, CreateOrderCommand/Handler, GetOrderQuery/Handler with type-safe routing

---

## Cross-Reference Map

- [implementations.md](implementations.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Example section
- Related skills: [Clean Architecture](../../clean-architecture/SKILL.md) (mediator belongs in Application layer)
