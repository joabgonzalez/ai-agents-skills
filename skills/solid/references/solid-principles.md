# SOLID Principles

Foundation for maintainable, testable object-oriented code by Robert C. Martin. Applies to class-based programming in any language—backend services/repositories/controllers and frontend complex components/state slices/service layers.

## Core Patterns

- SRP: one reason to change per class; separate validation, persistence, hashing, email, and orchestration
- OCP: extend via new classes implementing interfaces; never modify existing working code to add features
- LSP: subtypes must honor the full contract of their base type without throwing or silently skipping
- ISP: small focused interfaces per consumer; split read/write repositories, minimal component props
- DIP: inject abstractions via constructor; compose at the composition root; mock interfaces in tests

---

## The 5 Principles

| Principle | File | One-liner |
|---|---|---|
| S — Single Responsibility | [single-responsibility.md](single-responsibility.md) | One reason to change |
| O — Open/Closed | [open-closed.md](open-closed.md) | Open for extension, closed for modification |
| L — Liskov Substitution | [liskov-substitution.md](liskov-substitution.md) | Subtypes must be substitutable for base types |
| I — Interface Segregation | [interface-segregation.md](interface-segregation.md) | No client depends on methods it does not use |
| D — Dependency Inversion | [dependency-inversion.md](dependency-inversion.md) | Depend on abstractions, not concretions |

---

## Benefits of SOLID

1. **Maintainability**: Easy to understand and modify
2. **Testability**: Each unit can be tested independently
3. **Flexibility**: Easy to extend and adapt to new requirements
4. **Reusability**: Components can be reused in different contexts
5. **Reduced coupling**: Changes in one module don't ripple through the system

---

## When NOT to Apply

- **Simple CRUD operations**: Overkill for basic read/write
- **Prototypes/MVPs**: Focus on speed, not perfect architecture
- **Small scripts**: <200 LOC utilities don't need this
- **Team resistance**: Without buy-in, patterns add friction

---

## SOLID in Practice

### Backend Checklist

- [ ] Each service class has ONE clear responsibility (SRP)
- [ ] New features add new classes, not modify existing (OCP)
- [ ] Subclasses can replace base classes without breaking (LSP)
- [ ] Interfaces are small and focused (ISP)
- [ ] Services depend on interfaces, not concrete classes (DIP)

### Frontend Checklist

- [ ] Components render ONE thing (SRP)
- [ ] Extend with composition, not modification (OCP)
- [ ] Props are minimal and focused (ISP)
- [ ] Components depend on hooks/abstractions, not direct API calls (DIP)

---

## Related Patterns

- **Clean Architecture**: SOLID principles guide class design within each layer
- **Hexagonal Architecture**: DIP enables port/adapter pattern
- **Dependency Injection**: DIP requires constructor injection
- **Result Pattern**: Can replace exceptions, honors SRP (error handling separate from business logic)

---

## References

- [Main SKILL](../SKILL.md)
- [Clean Architecture](clean-architecture.md)
- [Hexagonal Architecture](hexagonal-architecture.md)
- [Backend Integration](backend-integration.md)
- [Frontend Integration](frontend-integration.md)

---

**External Resources**:

- [SOLID Principles (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [SOLID in React](https://konstantinlebedev.com/solid-in-react/)
