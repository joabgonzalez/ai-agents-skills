# Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

## Core Patterns

- Depend on interfaces, not concrete implementations—enables dependency injection and testability
- Inject dependencies via constructor rather than instantiating them inside the class
- Swap implementations (SendGrid to AWS SES) without touching the high-level service
- React: components depend on hook abstractions (IUserApi), not directly on fetch or a specific API client
- Composition root is the single place where concrete implementations are wired to interfaces

---

## 5. Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

Depend on interfaces, not concrete implementations. Enables dependency injection and testability.

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

interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

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

## Reference

- [SOLID Principles Overview](solid-principles.md)
- [Back to SKILL.md](../SKILL.md)
