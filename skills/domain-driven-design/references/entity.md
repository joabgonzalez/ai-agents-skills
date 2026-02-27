# Entity

## Concept

An Entity is a domain object defined by its **identity**, not its attributes. Two entities are the same if they share the same ID, regardless of whether their other attributes differ. Entities have a lifecycle — they are created, modified, and eventually deleted or archived.

Use Entity when the concept has continuous identity across time: a User is still the same user after changing their email. An Order is still the same order after adding items.

---

## Key Characteristics

- **Unique, stable identity** — an ID assigned at creation that never changes
- **Mutable state** — attributes evolve over the entity's lifecycle
- **Identity-based equality** — `equals()` compares IDs, never attributes
- **Encapsulated behavior** — business rules live inside the entity (rich model)
- **Lifecycle** — created, updated, deleted/archived — tracked via events or audit fields

---

## When to Use

Use Entity when:

- The concept persists over time and must be tracked (User, Order, Product, Account)
- Two instances with identical attributes should still be distinct (`User("Alice") ≠ User("Alice")` if different IDs)
- The object has meaningful state changes with business rules (confirm, cancel, archive)

Don't use Entity when:

- The concept is defined entirely by its values with no lifecycle (use Value Object: Money, Email, Address)
- The object is only a data container with no business behavior (use a DTO)

---

## Core Patterns

```typescript
// domain/entities/User.ts
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export class User {
  constructor(
    readonly id: UserId,          // identity — assigned at creation, never mutated
    private _email: Email,
    private _name: string,
    private _status: 'active' | 'suspended' = 'active',
  ) {}

  get email(): Email  { return this._email; }
  get name(): string  { return this._name; }
  get status()        { return this._status; }

  changeEmail(newEmail: Email): void {
    if (this._status === 'suspended') {
      throw new Error('Suspended users cannot change email');
    }
    this._email = newEmail;
  }

  suspend(): void {
    if (this._status === 'suspended') throw new Error('User is already suspended');
    this._status = 'suspended';
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);  // identity-based — never compare attributes
  }
}

// Usage
const user1 = new User(new UserId('1'), new Email('alice@example.com'), 'Alice');
const user2 = new User(new UserId('1'), new Email('bob@example.com'), 'Bob');

console.log(user1.equals(user2)); // true — same ID, same entity despite different attributes
```

---

## Entity vs Value Object Decision

| Question | Entity | Value Object |
|----------|--------|--------------|
| Does it have a lifecycle? | ✅ Yes | ❌ No |
| Does identity matter independently of attributes? | ✅ Yes | ❌ No |
| Can it be replaced by another instance with the same values? | ❌ No | ✅ Yes |
| Does it need to be tracked in a repository? | ✅ Yes | ❌ No |
| Examples | User, Order, Product, Account | Money, Email, Address, PhoneNumber |

---

## Common Mistakes

**❌ Attribute-based equality on entities:**

```typescript
// WRONG: comparing attributes defeats identity semantics
equals(other: User): boolean {
  return this._email.equals(other._email); // two users can share an email (e.g. family)
}

// CORRECT: always compare by ID
equals(other: User): boolean {
  return this.id.equals(other.id);
}
```

**❌ Mutable identity:**

```typescript
// WRONG: ID should never change
class User {
  id: string; // public and mutable
}
user.id = 'new-id'; // breaks identity contract

// CORRECT: readonly identity
class User {
  constructor(readonly id: UserId) {}
}
```

**❌ Business logic outside the entity (Anemic Domain Model):**

```typescript
// WRONG: business rule lives in a service
class UserService {
  suspend(user: User) {
    user.status = 'suspended'; // directly mutating state
  }
}

// CORRECT: business rule lives in the entity
class User {
  suspend(): void {
    if (this._status === 'suspended') throw new Error('Already suspended');
    this._status = 'suspended';
  }
}
```
