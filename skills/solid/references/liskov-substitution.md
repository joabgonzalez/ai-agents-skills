# Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types without breaking the program. If class B extends class A, replacing A with B must not cause unexpected behavior.

## Core Patterns

- Derived classes must honor the full contract of the base class or interface
- Never throw from a method that the base contract says should succeed
- Prefer interface composition over inheritance hierarchies when behaviors differ across types
- InMemoryRepository used in tests must throw on missing ID if the real repository does
- Test mocks technically violate LSP but are acceptable since tests are not production consumers

---

## 3. Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types without breaking the program.

If class B extends class A, you should be able to replace A with B without unexpected behavior. Derived classes must honor the contract of the base class.

### Backend Example

```typescript
// ❌ WRONG: Violates LSP (Bird → cannot fly)
class Bird {
  fly(): void {
    console.log("Flying");
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error("Penguins cannot fly"); // Breaks contract!
  }
}

function makeBirdFly(bird: Bird) {
  bird.fly(); // Expects all birds to fly
}

makeBirdFly(new Penguin()); // Throws error! LSP violated
```

```typescript
// ✅ CORRECT: Proper abstraction
interface ISwimmable {
  swim(): void;
}

interface IFlyable {
  fly(): void;
}

class Sparrow implements IFlyable {
  fly(): void {
    console.log("Flying");
  }
}

class Penguin implements ISwimmable {
  swim(): void {
    console.log("Swimming");
  }
}

function makeFly(flyable: IFlyable) {
  flyable.fly(); // Only accepts flyable things
}

function makeSwim(swimmable: ISwimmable) {
  swimmable.swim(); // Only accepts swimmable things
}

makeFly(new Sparrow()); // ✅ Works
makeSwim(new Penguin()); // ✅ Works
// makeFly(new Penguin()); // ❌ Compile error (good!)
```

### Real-World Example: Repository Pattern

```typescript
// ❌ WRONG: InMemoryRepository violates contract
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

class PostgresRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return await db.users.findUnique({ where: { id } });
  }

  async save(user: User): Promise<void> {
    await db.users.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    });
  }

  async delete(id: string): Promise<void> {
    await db.users.delete({ where: { id } });
  }
}

class InMemoryRepository implements IUserRepository {
  private users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
    // BUG: If base contract expects confirmation, this violates LSP
    // because it doesn't throw on missing id
  }
}

// ✅ CORRECT: Both implementations honor contract
class InMemoryRepository implements IUserRepository {
  private users = new Map<string, User>();

  async delete(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error("User not found"); // Honor contract behavior
    }
    this.users.delete(id);
  }
}
```

---

## Reference

- [SOLID Principles Overview](solid-principles.md)
- [Back to SKILL.md](../SKILL.md)
