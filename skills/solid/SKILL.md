---
name: solid
description: "SOLID principles for maintainable OOP design. Trigger: When designing classes, services, or repositories in object-oriented code."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# SOLID Principles

Five principles by Robert C. Martin for maintainable, testable OOP design. Apply to backend services, repositories, controllers, and complex frontend components.

## When to Use

- Designing class or service structures
- Identifying why code is hard to test or change
- Reviewing class responsibilities and dependencies
- Building plugin/extension systems

Don't use for:

- Simple scripts or utilities (<200 LOC)
- Prototypes or MVPs where speed > correctness
- Procedural code with no classes

---

## Critical Patterns

### ✅ REQUIRED: Single Responsibility (SRP)

One reason to change per class. If you need "and" to describe it, split it.

```
❌ UserManager: validates + hashes + saves + sends email + logs
✅ UserValidator, PasswordService, UserRepository, EmailService, UserService (orchestrates)
```

### ✅ REQUIRED: Open/Closed (OCP)

Extend via new classes, not by modifying existing ones. Use interfaces.

```typescript
// ❌ Add new notification type → modify NotificationService
// ✅ Add SlackChannel implements INotificationChannel → no modification
```

### ✅ REQUIRED: Liskov Substitution (LSP)

Subtypes must honor base contracts. Replacing A with B must not break callers.

```
❌ Penguin extends Bird { fly() { throw } } — breaks callers expecting Bird to fly
✅ Sparrow implements IFlyable; Penguin implements ISwimmable
```

### ✅ REQUIRED: Interface Segregation (ISP)

Small, focused interfaces. Clients depend only on what they use.

```
❌ IRepository<T> with findAll + create + update + delete → ReportService only needs findAll
✅ IReadRepository<T> + IWriteRepository<T> → ReportService depends on IReadRepository
```

### ✅ REQUIRED: Dependency Inversion (DIP)

High-level modules depend on abstractions, not concretions. Enable injection.

```typescript
// ❌ private emailProvider = new SendGridEmailProvider()
// ✅ constructor(private emailService: IEmailService) {}
//    → inject SendGrid, AWS SES, or mock in tests
```

---

## Decision Tree

```
Hard to test (requires complex mocks)?
  → DIP: Depend on interface, inject concrete via constructor

Adding new feature requires modifying existing class?
  → OCP: Extract interface, implement via new class

Class has multiple reasons to change?
  → SRP: Split responsibilities into separate classes

Interface has methods the implementor doesn't need?
  → ISP: Split into smaller focused interfaces

Subclass throws or behaves unexpectedly for base contract?
  → LSP: Redesign hierarchy with proper abstractions
```

---

## Example

All 5 SOLID principles applied to a notification service.

```typescript
// SRP — each class has one reason to change
class EmailNotifier   { send(to: string, body: string): void { /* SMTP */ } }
class SlackNotifier   { send(channel: string, body: string): void { /* Slack API */ } }
class NotificationFormatter { format(event: DomainEvent): string { /* templates */ } }

// OCP — add new channels without modifying existing code
interface INotificationChannel { notify(recipient: string, message: string): void; }
class EmailChannel  implements INotificationChannel { /* wraps EmailNotifier */ }
class SlackChannel  implements INotificationChannel { /* wraps SlackNotifier */ }
// Adding PushChannel → new class only, no existing code touched

// LSP — any INotificationChannel substitutes safely for another
function sendAlert(channel: INotificationChannel, recipient: string, msg: string) {
  channel.notify(recipient, msg);  // works with Email, Slack, or Push — no surprises
}

// ISP — split by consumer need (reporters only read, admins write)
interface IReadNotificationLog  { findByRecipient(id: string): Notification[]; }
interface IWriteNotificationLog { save(n: Notification): void; }
class ReportService  { constructor(private log: IReadNotificationLog) {} }   // no unused methods
class NotificationService { constructor(private log: IWriteNotificationLog) {} }

// DIP — high-level service depends on abstraction, not concrete class
class AlertService {
  constructor(private channels: INotificationChannel[]) {}  // inject any channel(s)
  broadcastAlert(event: DomainEvent): void {
    const msg = new NotificationFormatter().format(event);
    for (const ch of this.channels) ch.notify(event.recipientId, msg);
  }
}
// Test: inject mock channels — no SMTP or Slack calls in unit tests
```

---

## Edge Cases

**Over-engineering SRP:** Splitting too far creates 20 tiny classes with one method each. SRP means "one reason to change", not "one method". A repository with findById + save + delete has ONE responsibility (data access).

**OCP in practice:** Full OCP from the start is premature. First violation: duplicate the code. Second violation: extract and parameterize. Only then apply OCP.

**LSP and mocks:** Test mocks technically violate LSP (they don't fully honor contracts). Acceptable because tests are not production consumers.

**SOLID in functional code:** DIP → inject functions instead of interfaces. SRP → each function has one purpose. OCP → extend via composition.

---

## Resources

- [solid-principles.md](references/solid-principles.md) — Overview: benefits, when not to apply, practice checklists, navigation to all principle files
- [single-responsibility.md](references/single-responsibility.md) — SRP: UserManager split, React component separation
- [open-closed.md](references/open-closed.md) — OCP: NotificationService via INotificationChannel, React composition
- [liskov-substitution.md](references/liskov-substitution.md) — LSP: Bird/Penguin anti-pattern, InMemoryRepository contract
- [interface-segregation.md](references/interface-segregation.md) — ISP: IReadRepository/IWriteRepository split, React container pattern
- [dependency-inversion.md](references/dependency-inversion.md) — DIP: IEmailService injection, IUserApi hook abstraction, mock testing
