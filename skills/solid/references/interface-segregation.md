# Interface Segregation Principle (ISP)

No client should be forced to depend on methods it does not use. Create small, specific interfaces instead of large, general-purpose ones.

## Core Patterns

- Split fat interfaces into focused interfaces grouped by consumer need
- Read-only clients (ReportService) depend on IReadRepository, not the full IRepository
- React components receive only the props they render, not the entire app state
- Use a container component to select and pass only the required slice of state
- Combining multiple small interfaces (IReadRepository + IWriteRepository) is valid for full-access services

---

## 4. Interface Segregation Principle (ISP)

> No client should be forced to depend on methods it does not use.

Create small, specific interfaces instead of large, general-purpose ones. Clients should only know about methods they use.

### Backend Example

```typescript
// ❌ WRONG: Fat interface forces unnecessary dependencies
interface IWorker {
  work(): void;
  eat(): void;
  sleep(): void;
  getSalary(): number;
}

class Human implements IWorker {
  work() {
    /* ... */
  }
  eat() {
    /* ... */
  }
  sleep() {
    /* ... */
  }
  getSalary() {
    return 50000;
  }
}

class Robot implements IWorker {
  work() {
    /* ... */
  }
  eat() {
    /* Robots don't eat */
  }
  sleep() {
    /* Robots don't sleep */
  }
  getSalary() {
    /* Robots don't get paid */ return 0;
  }
}
```

```typescript
// ✅ CORRECT: Segregated interfaces
interface IWorkable {
  work(): void;
}

interface IEatable {
  eat(): void;
}

interface ISleepable {
  sleep(): void;
}

interface ISalaried {
  getSalary(): number;
}

class Human implements IWorkable, IEatable, ISleepable, ISalaried {
  work() {
    /* ... */
  }
  eat() {
    /* ... */
  }
  sleep() {
    /* ... */
  }
  getSalary() {
    return 50000;
  }
}

class Robot implements IWorkable {
  work() {
    /* ... */
  }
}

function makeWork(worker: IWorkable) {
  worker.work(); // Only depends on work(), not eat/sleep/salary
}
```

### Real-World Example: Repository Pattern

```typescript
// ❌ WRONG: Forcing read-only clients to depend on write methods
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class ReportService {
  constructor(private userRepo: IRepository<User>) {} // Depends on write methods it doesn't use

  async generateReport() {
    const users = await this.userRepo.findAll(); // Only needs read
    // ...
  }
}
```

```typescript
// ✅ CORRECT: Segregated read and write interfaces
interface IReadRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  find(query: Query): Promise<T[]>;
}

interface IWriteRepository<T> {
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface IRepository<T> extends IReadRepository<T>, IWriteRepository<T> {}

class ReportService {
  constructor(private userRepo: IReadRepository<User>) {} // Only depends on read methods

  async generateReport() {
    const users = await this.userRepo.findAll();
    // ...
  }
}

class UserService {
  constructor(private userRepo: IRepository<User>) {} // Needs both read and write

  async createUser(user: User) {
    await this.userRepo.create(user);
  }
}
```

### Frontend Example (React)

```typescript
// ❌ WRONG: Component depends on full Redux store
interface AppState {
  user: UserState;
  products: ProductState;
  cart: CartState;
  orders: OrderState;
  settings: SettingsState;
}

const UserProfile = ({ state }: { state: AppState }) => {
  // Component depends on entire state but only uses user
  return <div>{state.user.name}</div>;
};
```

```typescript
// ✅ CORRECT: Component depends only on what it needs
interface UserProfileProps {
  userName: string;
  userEmail: string;
}

const UserProfile = ({ userName, userEmail }: UserProfileProps) => {
  return (
    <div>
      <h1>{userName}</h1>
      <p>{userEmail}</p>
    </div>
  );
};

// Container selects only needed data
const UserProfileContainer = () => {
  const userName = useSelector((state: AppState) => state.user.name);
  const userEmail = useSelector((state: AppState) => state.user.email);

  return <UserProfile userName={userName} userEmail={userEmail} />;
};
```

---

## Reference

- [SOLID Principles Overview](solid-principles.md)
- [Back to SKILL.md](../SKILL.md)
