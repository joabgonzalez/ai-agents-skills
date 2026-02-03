# Hexagonal Architecture (Ports and Adapters)

> Decouple core business logic from external dependencies through ports (interfaces) and adapters (implementations).

## Overview

Hexagonal Architecture (also called Ports and Adapters) isolates the application core from external concerns. The core defines interfaces (ports), and external systems provide implementations (adapters).

**Core idea**: Application core at the center, surrounded by ports (interfaces). Adapters connect external systems to ports.

```
         ┌──────────────────────────────────┐
         │        Adapters (Outside)        │
         │  ┌────────────────────────────┐  │
         │  │    Ports (Interfaces)      │  │
         │  │  ┌──────────────────────┐  │  │
         │  │  │  Application Core    │  │  │
         │  │  │  (Business Logic)    │  │  │
         │  │  └──────────────────────┘  │  │
         │  │                            │  │
         │  └────────────────────────────┘  │
         └──────────────────────────────────┘
```

**Benefits**:

- Easy to swap implementations (DB, payment gateway, etc.)
- Testable (mock adapters)
- Technology-agnostic core

---

## Core Concepts

### Port (Interface)

Interface defined by the application core that describes what it needs from the outside world.

**Two types**:

1. **Primary (Driving) Ports**: API the application exposes (e.g., use cases)
2. **Secondary (Driven) Ports**: Dependencies the application needs (e.g., repository, email service)

### Adapter (Implementation)

Concrete implementation of a port. Translates between external system and application core.

**Two types**:

1. **Primary (Driving) Adapters**: Trigger application (e.g., HTTP controller, CLI, GraphQL resolver)
2. **Secondary (Driven) Adapters**: Provide services to application (e.g., Postgres repository, SendGrid email)

---

## Pattern Structure

### 1. Application Core (Business Logic)

```typescript
// core/domain/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// core/use-cases/RegisterUser.ts
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository, // Secondary port
    private emailService: IEmailService, // Secondary port
  ) {}

  async execute(email: string, name: string): Promise<Result<User>> {
    // Business logic
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return Result.fail("Email already registered");
    }

    const user = new User(generateId(), email, name);
    await this.userRepository.save(user);
    await this.emailService.sendWelcome(email, name);

    return Result.ok(user);
  }
}
```

### 2. Secondary Ports (Interfaces)

```typescript
// core/ports/IUserRepository.ts (Secondary port)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// core/ports/IEmailService.ts (Secondary port)
export interface IEmailService {
  sendWelcome(email: string, name: string): Promise<void>;
}
```

### 3. Secondary Adapters (Implementations)

```typescript
// adapters/repositories/PostgresUserRepository.ts
export class PostgresUserRepository implements IUserRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? new User(row.id, row.email, row.name) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? new User(row.id, row.email, row.name) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email, name: user.name },
      update: { email: user.email, name: user.name },
    });
  }
}

// adapters/services/SendGridEmailService.ts
export class SendGridEmailService implements IEmailService {
  constructor(private client: SendGridClient) {}

  async sendWelcome(email: string, name: string): Promise<void> {
    await this.client.send({
      to: email,
      from: "noreply@example.com",
      subject: "Welcome!",
      text: `Hi ${name}, welcome to our app!`,
    });
  }
}

// adapters/services/ConsoleEmailService.ts (Mock for testing)
export class ConsoleEmailService implements IEmailService {
  async sendWelcome(email: string, name: string): Promise<void> {
    console.log(`[EMAIL] Welcome ${name} at ${email}`);
  }
}
```

### 4. Primary Adapters (Entry Points)

```typescript
// adapters/http/UserController.ts (HTTP adapter)
export class UserController {
  constructor(private registerUser: RegisterUserUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    const { email, name } = req.body;

    const result = await this.registerUser.execute(email, name);

    if (result.isSuccess) {
      res.status(201).json(result.value);
    } else {
      res.status(400).json({ error: result.error });
    }
  }
}

// adapters/cli/UserCLI.ts (CLI adapter)
export class UserCLI {
  constructor(private registerUser: RegisterUserUseCase) {}

  async register(email: string, name: string): Promise<void> {
    const result = await this.registerUser.execute(email, name);

    if (result.isSuccess) {
      console.log(`User registered: ${result.value.id}`);
    } else {
      console.error(`Error: ${result.error}`);
    }
  }
}
```

### 5. Composition (Wiring)

```typescript
// main.ts (Composition root)
const db = new PrismaClient();
const sendgrid = new SendGridClient(process.env.SENDGRID_KEY);

// Create adapters
const userRepository = new PostgresUserRepository(db);
const emailService = new SendGridEmailService(sendgrid);

// Create use case with dependencies
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  emailService,
);

// Create primary adapter
const userController = new UserController(registerUserUseCase);

// HTTP routes
app.post("/users/register", (req, res) => userController.register(req, res));
```

---

## Testing with Adapters

### Unit Testing (Mock Adapters)

```typescript
// __tests__/RegisterUser.test.ts
describe("RegisterUserUseCase", () => {
  it("should register new user", async () => {
    // Mock adapters
    const mockRepo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(null), // No existing user
      save: jest.fn(),
    };

    const mockEmail: IEmailService = {
      sendWelcome: jest.fn(),
    };

    // Test use case with mocks
    const useCase = new RegisterUserUseCase(mockRepo, mockEmail);
    const result = await useCase.execute("test@example.com", "John");

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" }),
    );
    expect(mockEmail.sendWelcome).toHaveBeenCalledWith(
      "test@example.com",
      "John",
    );
  });

  it("should fail if email exists", async () => {
    const existingUser = new User("1", "test@example.com", "Existing");

    const mockRepo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(existingUser), // Email exists
      save: jest.fn(),
    };

    const mockEmail: IEmailService = {
      sendWelcome: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(mockRepo, mockEmail);
    const result = await useCase.execute("test@example.com", "John");

    expect(result.isSuccess).toBe(false);
    expect(result.error).toBe("Email already registered");
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

### Integration Testing (Real Adapters)

```typescript
// __tests__/integration/UserRegistration.test.ts
describe("User Registration (Integration)", () => {
  let db: PrismaClient;
  let userRepository: PostgresUserRepository;
  let emailService: ConsoleEmailService;
  let useCase: RegisterUserUseCase;

  beforeAll(() => {
    db = new PrismaClient();
    userRepository = new PostgresUserRepository(db);
    emailService = new ConsoleEmailService(); // Mock email for tests
    useCase = new RegisterUserUseCase(userRepository, emailService);
  });

  it("should register user in database", async () => {
    const result = await useCase.execute("integration@test.com", "Integration");

    expect(result.isSuccess).toBe(true);

    // Verify in database
    const savedUser = await db.user.findUnique({
      where: { email: "integration@test.com" },
    });
    expect(savedUser).toBeTruthy();
    expect(savedUser?.name).toBe("Integration");
  });
});
```

---

## Swapping Adapters

### Example: Switch from Postgres to MongoDB

```typescript
// adapters/repositories/MongoUserRepository.ts
export class MongoUserRepository implements IUserRepository {
  constructor(private mongo: MongoClient) {}

  async findById(id: string): Promise<User | null> {
    const doc = await this.mongo.db().collection("users").findOne({ _id: id });
    return doc ? new User(doc._id, doc.email, doc.name) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.mongo.db().collection("users").findOne({ email });
    return doc ? new User(doc._id, doc.email, doc.name) : null;
  }

  async save(user: User): Promise<void> {
    await this.mongo
      .db()
      .collection("users")
      .updateOne(
        { _id: user.id },
        { $set: { email: user.email, name: user.name } },
        { upsert: true },
      );
  }
}

// main.ts - Change ONE line
const userRepository = new MongoUserRepository(mongo); // Was: PostgresUserRepository
// Everything else stays the same!
```

### Example: Switch from SendGrid to AWS SES

```typescript
// adapters/services/AWSEmailService.ts
export class AWSEmailService implements IEmailService {
  constructor(private ses: SESClient) {}

  async sendWelcome(email: string, name: string): Promise<void> {
    await this.ses.send(
      new SendEmailCommand({
        Source: "noreply@example.com",
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: "Welcome!" },
          Body: { Text: { Data: `Hi ${name}, welcome!` } },
        },
      }),
    );
  }
}

// main.ts - Change ONE line
const emailService = new AWSEmailService(ses); // Was: SendGridEmailService
```

---

## Frontend Example (React)

```typescript
// core/ports/IAnalytics.ts (Secondary port)
export interface IAnalytics {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
}

// adapters/analytics/SegmentAnalytics.ts
export class SegmentAnalytics implements IAnalytics {
  track(event: string, properties?: Record<string, any>): void {
    analytics.track(event, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    analytics.identify(userId, traits);
  }
}

// adapters/analytics/GoogleAnalytics.ts
export class GoogleAnalytics implements IAnalytics {
  track(event: string, properties?: Record<string, any>): void {
    gtag('event', event, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    gtag('set', { user_id: userId, ...traits });
  }
}

// React Context (Primary adapter)
const AnalyticsContext = createContext<IAnalytics | null>(null);

export const AnalyticsProvider = ({ children, analytics }: Props) => (
  <AnalyticsContext.Provider value={analytics}>
    {children}
  </AnalyticsContext.Provider>
);

export const useAnalytics = () => {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) throw new Error('Missing AnalyticsProvider');
  return analytics;
};

// Component uses port (doesn't know which adapter)
const PurchaseButton = () => {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.track('purchase_button_clicked', { price: 99 });
    // ...
  };

  return <button onClick={handleClick}>Purchase</button>;
};

// App.tsx - Swap adapter easily
const analytics = new SegmentAnalytics(); // or GoogleAnalytics

<AnalyticsProvider analytics={analytics}>
  <PurchaseButton />
</AnalyticsProvider>
```

---

## Folder Structure

```
src/
├── core/
│   ├── domain/
│   │   └── User.ts
│   ├── use-cases/
│   │   └── RegisterUser.ts
│   └── ports/
│       ├── IUserRepository.ts
│       └── IEmailService.ts
├── adapters/
│   ├── repositories/
│   │   ├── PostgresUserRepository.ts
│   │   └── MongoUserRepository.ts
│   ├── services/
│   │   ├── SendGridEmailService.ts
│   │   └── AWSEmailService.ts
│   └── http/
│       └── UserController.ts
└── main.ts (composition root)
```

---

## Benefits

1. **Testability**: Mock adapters for unit tests
2. **Flexibility**: Swap implementations without touching core
3. **Technology independence**: Core doesn't know about DB/framework
4. **Parallel development**: Teams can work on adapters independently
5. **Legacy integration**: Create adapter for legacy system

---

## When to Use

- Need to swap implementations (Postgres → MongoDB, SendGrid → SES)
- Want highly testable code
- Building for multiple platforms (web + mobile + CLI)
- Integrating with legacy systems
- Long-term maintainability priority

---

## When NOT to Use

- Simple CRUD apps
- Prototypes/MVPs
- Single implementation guaranteed
- Team unfamiliar with pattern

---

## References

- [Main SKILL](../SKILL.md)
- [Clean Architecture](clean-architecture.md)
- [SOLID Principles](solid-principles.md) - DIP enables ports/adapters
- [Backend Integration](backend-integration.md)
- [Frontend Integration](frontend-integration.md)

**External**:

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
