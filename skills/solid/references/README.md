# SOLID References

This directory contains a comprehensive reference for all five SOLID principles with paired wrong/correct TypeScript examples for backend (Node.js/Express) and frontend (React/Redux Toolkit) contexts, plus practical checklists for applying each principle.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [solid-principles.md](solid-principles.md) | Overview table, benefits, when not to apply, practice checklists, related patterns | When you need the high-level summary or navigation to a specific principle |
| [single-responsibility.md](single-responsibility.md) | SRP: UserManager split into UserValidator, UserRepository, PasswordService, EmailService; React component split into API service, selector, and presentation | When a class or component has multiple reasons to change |
| [open-closed.md](open-closed.md) | OCP: NotificationService extended via INotificationChannel without modification; React FormField extended via composition | When adding new features requires modifying existing working code |
| [liskov-substitution.md](liskov-substitution.md) | LSP: Bird/Penguin anti-pattern fixed with IFlyable/ISwimmable; InMemoryRepository honoring delete contract | When a subtype throws or behaves unexpectedly for callers of the base type |
| [interface-segregation.md](interface-segregation.md) | ISP: IWorker fat interface split into IWorkable/IEatable/ISleepable/ISalaried; IRepository split into IReadRepository/IWriteRepository; React container pattern | When a client depends on methods it does not use |
| [dependency-inversion.md](dependency-inversion.md) | DIP: UserService injecting IEmailService instead of concrete SendGridEmailProvider; React UserList depending on IUserApi hook abstraction; mock testing pattern | When code is hard to test or tightly coupled to a specific implementation |

---

## Reading Strategy

### For applying a specific SOLID principle

1. Read main [SKILL.md](../SKILL.md) for trigger criteria and Critical Patterns
2. MUST read: the individual principle file for that specific principle including both backend and frontend examples

### For reviewing a class or component design

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [solid-principles.md](solid-principles.md) "SOLID in Practice" checklists for backend and frontend

### For making a class testable via dependency injection

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [dependency-inversion.md](dependency-inversion.md) for the interface injection and mock testing pattern

---

## File Descriptions

### [solid-principles.md](solid-principles.md)

**Overview of all five SOLID principles with navigation table, benefits, when not to apply, checklists, and related pattern guidance**

- Navigation table linking to each of the five individual principle files
- Benefits: maintainability, testability, flexibility, reusability, reduced coupling
- When not to apply: simple CRUD, prototypes/MVPs, small scripts, team resistance
- Practice checklists: backend checklist (SRP through DIP) and frontend checklist (render one thing through hook abstractions)

### [single-responsibility.md](single-responsibility.md)

**SRP with wrong/correct TypeScript examples for backend and frontend**

- Backend: UserManager with multiple responsibilities split into UserValidator, UserRepository, PasswordService, EmailService, and UserService (orchestration only)
- Frontend: React UserProfile component split into RTK Query API service, createSelector for display name, and pure presentation component

### [open-closed.md](open-closed.md)

**OCP with wrong/correct TypeScript examples for backend and frontend**

- Backend: NotificationService with if/else type switch replaced by INotificationChannel interface with EmailChannel, SMSChannel, PushChannel, and SlackChannel
- Frontend: monolithic FormField switch replaced by composition of TextField, EmailField, DateField, PhoneField components

### [liskov-substitution.md](liskov-substitution.md)

**LSP with wrong/correct TypeScript examples including the Bird/Penguin anti-pattern and repository pattern**

- Classic Bird/Penguin LSP violation fixed with IFlyable and ISwimmable interface segregation
- InMemoryRepository honoring the delete contract by throwing on missing ID to match PostgresRepository behavior

### [interface-segregation.md](interface-segregation.md)

**ISP with wrong/correct TypeScript examples for backend and frontend**

- IWorker fat interface split into IWorkable, IEatable, ISleepable, and ISalaried
- IRepository split into IReadRepository and IWriteRepository so ReportService depends only on read methods
- React component accepting minimal props via container pattern instead of full AppState

### [dependency-inversion.md](dependency-inversion.md)

**DIP with wrong/correct TypeScript examples for backend and frontend including mock testing**

- UserService depending on IEmailService abstraction rather than concrete SendGridEmailProvider; swapping to AWSEmailService without modifying UserService
- Composition root pattern for wiring concrete implementations to interfaces
- React UserList depending on IUserApi hook abstraction; mock implementation for unit tests

---

## Cross-Reference Map

- [solid-principles.md](solid-principles.md) → navigation hub for all five principle files
- [single-responsibility.md](single-responsibility.md) → supplements [SKILL.md](../SKILL.md) SRP Critical Pattern
- [open-closed.md](open-closed.md) → supplements [SKILL.md](../SKILL.md) OCP Critical Pattern
- [liskov-substitution.md](liskov-substitution.md) → supplements [SKILL.md](../SKILL.md) LSP Critical Pattern
- [interface-segregation.md](interface-segregation.md) → supplements [SKILL.md](../SKILL.md) ISP Critical Pattern
- [dependency-inversion.md](dependency-inversion.md) → supplements [SKILL.md](../SKILL.md) DIP Critical Pattern
- Related skills: [Clean Architecture](../../clean-architecture/SKILL.md), [Hexagonal Architecture](../../hexagonal-architecture/SKILL.md) (DIP enables port/adapter), [Result Pattern](../../result-pattern/SKILL.md)
