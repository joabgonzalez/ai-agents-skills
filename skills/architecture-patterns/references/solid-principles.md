# SOLID Principles

> Complete guide to the 5 SOLID principles with backend and frontend examples.

## Overview

SOLID principles are foundation for maintainable, testable object-oriented code. Originally by Robert C. Martin (Uncle Bob), these principles apply to class-based programming in any language.

**Applicability**:

- **Backend**: Apply to all services, repositories, controllers
- **Frontend**: Apply to complex components, state slices, service layers (when project requires architecture patterns)

---

## The 5 Principles

1. **S**ingle Responsibility Principle (SRP)
2. **O**pen/Closed Principle (OCP)
3. **L**iskov Substitution Principle (LSP)
4. **I**nterface Segregation Principle (ISP)
5. **D**ependency Inversion Principle (DIP)

---

## 1. Single Responsibility Principle (SRP)

### Definition

> A class should have one, and only one, reason to change.

Each module/class should be responsible for one part of the functionality. If you need to describe the class with "and", it's doing too much.

### Backend Example

```typescript
// ❌ WRONG: Multiple responsibilities
class UserManager {
  async createUser(userData: CreateUserDTO) {
    // Validation
    if (!userData.email.includes("@")) {
      throw new Error("Invalid email");
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Database operation
    const user = await db.users.create({
      data: { ...userData, password: hashedPassword },
    });

    // Logging
    logger.info(`User created: ${user.id}`);

    // Email sending
    await sendEmail(user.email, "Welcome!", "Thanks for signing up");

    // Analytics tracking
    analytics.track("user_created", { userId: user.id });

    return user;
  }
}
```

**Problems**: Hard to test, hard to reuse validation/email logic, changes in email system affect user creation.

```typescript
// ✅ CORRECT: Separated responsibilities

// 1. Validation (one responsibility)
class UserValidator {
  validate(userData: CreateUserDTO): ValidationResult {
    const errors: string[] = [];

    if (!userData.email.includes("@")) {
      errors.push("Invalid email");
    }

    if (userData.password.length < 8) {
      errors.push("Password too short");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// 2. Repository (one responsibility)
class UserRepository {
  async create(user: User): Promise<User> {
    return await db.users.create({ data: user });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await db.users.findUnique({ where: { email } });
  }
}

// 3. Password service (one responsibility)
class PasswordService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

// 4. Email service (one responsibility)
class EmailService {
  async sendWelcome(email: string): Promise<void> {
    await this.send(email, "Welcome!", "Thanks for signing up");
  }

  private async send(to: string, subject: string, body: string): Promise<void> {
    await emailProvider.send({ to, subject, body });
  }
}

// 5. User service (orchestration only)
class UserService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository,
    private passwordService: PasswordService,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  async createUser(userData: CreateUserDTO): Promise<Result<User>> {
    // Validation
    const validation = this.validator.validate(userData);
    if (!validation.valid) {
      return Result.fail(validation.errors.join(", "));
    }

    // Password hashing
    const hashedPassword = await this.passwordService.hash(userData.password);

    // Create user
    const user = new User({ ...userData, password: hashedPassword });
    await this.repository.create(user);

    // Side effects (can be moved to event handlers)
    this.logger.info(`User created: ${user.id}`);
    await this.emailService.sendWelcome(user.email);

    return Result.ok(user);
  }
}
```

**Benefits**: Each class can be tested independently, reused, and changed without affecting others.

### Frontend Example (React + Redux Toolkit)

```typescript
// ❌ WRONG: Component doing everything
const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Data fetching
    setLoading(true);
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // Validation
        if (!data.email || !data.name) {
          setError('Invalid user data');
          return;
        }

        // Transformation
        const user = {
          ...data,
          displayName: `${data.firstName} ${data.lastName}`
        };

        setUser(user);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Rendering logic
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

```typescript
// ✅ CORRECT: Separated responsibilities

// 1. API service (data fetching)
// services/userApi.ts
export const userApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => 'user'
    })
  })
});

// 2. Selector (data transformation)
// selectors/userSelectors.ts
export const selectUserDisplayName = createSelector(
  [(state: RootState) => state.user],
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);

// 3. Component (presentation only)
// components/UserProfile.tsx
export const UserProfile = () => {
  const { data: user, isLoading, error } = userApi.useGetUserQuery();
  const displayName = useSelector(selectUserDisplayName);

  if (isLoading) return <Spinner />;
  if (error) return <Alert>Error loading user</Alert>;
  if (!user) return null;

  return (
    <div>
      <h1>{displayName}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

---

## 2. Open/Closed Principle (OCP)

### Definition

> Software entities should be open for extension, but closed for modification.

Add new functionality by adding new code, not modifying existing code. Use abstractions (interfaces, abstract classes) to allow extension.

### Backend Example

```typescript
// ❌ WRONG: Must modify class to add new notification type
class NotificationService {
  async send(type: string, user: User, message: string) {
    if (type === "email") {
      await sendEmail(user.email, message);
    } else if (type === "sms") {
      await sendSMS(user.phone, message);
    } else if (type === "push") {
      await sendPush(user.deviceId, message);
    }
    // Adding Slack requires modifying this method
  }
}
```

```typescript
// ✅ CORRECT: Extend with new class, don't modify existing

// Abstraction
interface INotificationChannel {
  send(user: User, message: string): Promise<void>;
}

// Implementations
class EmailChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendEmail(user.email, message);
  }
}

class SMSChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendSMS(user.phone, message);
  }
}

class PushChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendPush(user.deviceId, message);
  }
}

// Add new channel WITHOUT modifying existing code
class SlackChannel implements INotificationChannel {
  async send(user: User, message: string): Promise<void> {
    await sendSlack(user.slackId, message);
  }
}

// Service uses abstraction
class NotificationService {
  constructor(private channels: INotificationChannel[]) {}

  async sendToAll(user: User, message: string): Promise<void> {
    await Promise.all(
      this.channels.map((channel) => channel.send(user, message)),
    );
  }
}

// Usage
const service = new NotificationService([
  new EmailChannel(),
  new SMSChannel(),
  new SlackChannel(), // Added without modifying NotificationService
]);
```

### Frontend Example (React)

```typescript
// ❌ WRONG: Must modify component to add new field type
const FormField = ({ type, ...props }: FormFieldProps) => {
  if (type === 'text') {
    return <input type="text" {...props} />;
  } else if (type === 'email') {
    return <input type="email" {...props} />;
  } else if (type === 'password') {
    return <input type="password" {...props} />;
  } else if (type === 'date') {
    return <DatePicker {...props} />;
  }
  // Adding 'phone' requires modifying this component
};
```

```typescript
// ✅ CORRECT: Composition allows extension without modification

// Base components (closed for modification)
const TextField = (props: TextFieldProps) => (
  <input type="text" {...props} />
);

const EmailField = (props: TextFieldProps) => (
  <input type="email" {...props} />
);

const DateField = (props: DateFieldProps) => (
  <DatePicker {...props} />
);

// Add new field type without modifying existing components
const PhoneField = (props: TextFieldProps) => (
  <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" {...props} />
);

// Form uses composition
const UserForm = () => (
  <form>
    <TextField name="name" />
    <EmailField name="email" />
    <PhoneField name="phone" />
    <DateField name="birthday" />
  </form>
);
```

---

## 3. Liskov Substitution Principle (LSP)

### Definition

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
  delete(id: string): Promise<void>; // Contract says "delete is async"
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

## 4. Interface Segregation Principle (ISP)

### Definition

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

## 5. Dependency Inversion Principle (DIP)

### Definition

> High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

Depend on interfaces, not concrete implementations. This enables dependency injection and testability.

### Backend Example

```typescript
// ❌ WRONG: High-level UserService depends on low-level EmailProvider
class SendGridEmailProvider {
  async send(to: string, subject: string, body: string) {
    await sendgrid.send({ to, subject, html: body });
  }
}

class UserService {
  private emailProvider = new SendGridEmailProvider(); // Direct dependency

  async registerUser(user: User) {
    await this.repo.save(user);
    await this.emailProvider.send(user.email, "Welcome", "..."); // Coupled to SendGrid
  }
}

// Problems:
// - Cannot test without hitting SendGrid API
// - Cannot swap to AWS SES without modifying UserService
```

```typescript
// ✅ CORRECT: Both depend on IEmailService abstraction

// Abstraction (interface)
interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// Low-level module depends on abstraction
class SendGridEmailService implements IEmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    await sendgrid.send({ to, subject, html: body });
  }
}

class AWSEmailService implements IEmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    await ses.sendEmail({
      /* ... */
    });
  }
}

// High-level module depends on abstraction
class UserService {
  constructor(
    private userRepo: IUserRepository,
    private emailService: IEmailService, // Depends on interface
  ) {}

  async registerUser(user: User): Promise<Result<User>> {
    await this.userRepo.save(user);
    await this.emailService.send(user.email, "Welcome", "...");
    return Result.ok(user);
  }
}

// Dependency injection (composition root)
const emailService = new SendGridEmailService(); // or AWSEmailService
const userRepo = new PostgresUserRepository();
const userService = new UserService(userRepo, emailService);

// Testing with mock
const mockEmail = {
  send: jest.fn().mockResolvedValue(undefined),
} as IEmailService;

const testService = new UserService(mockUserRepo, mockEmail);
await testService.registerUser(user);
expect(mockEmail.send).toHaveBeenCalledWith(user.email, "Welcome", "...");
```

### Frontend Example (React + Redux)

```typescript
// ❌ WRONG: Component directly uses fetch
const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users') // Direct dependency on fetch
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};

// Problems:
// - Cannot test without mocking global fetch
// - Cannot swap to GraphQL without modifying component
```

```typescript
// ✅ CORRECT: Component depends on abstraction (hook)

// Abstraction
interface IUserApi {
  useGetUsers: () => { data: User[]; isLoading: boolean; error: Error | null };
}

// Implementation 1: REST
const restUserApi: IUserApi = {
  useGetUsers: () => {
    const [data, setData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      fetch('/api/users')
        .then(res => res.json())
        .then(setData)
        .catch(setError)
        .finally(() => setIsLoading(false));
    }, []);

    return { data, isLoading, error };
  }
};

// Implementation 2: RTK Query
const rtkUserApi: IUserApi = {
  useGetUsers: () => {
    const { data = [], isLoading, error } = userApi.useGetUsersQuery();
    return { data, isLoading, error: error as Error | null };
  }
};

// Component depends on abstraction
const UserList = ({ api }: { api: IUserApi }) => {
  const { data: users, isLoading } = api.useGetUsers();

  if (isLoading) return <Spinner />;

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};

// Usage
<UserList api={rtkUserApi} />

// Testing
const mockApi: IUserApi = {
  useGetUsers: () => ({ data: mockUsers, isLoading: false, error: null })
};

render(<UserList api={mockApi} />);
```

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
