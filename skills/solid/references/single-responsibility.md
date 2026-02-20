# Single Responsibility Principle (SRP)

A class should have one, and only one, reason to change. Each module or class should be responsible for exactly one part of the functionality.

## Core Patterns

- If you need "and" to describe a class, split it into separate classes
- Separate validation, persistence, hashing, email, and orchestration into distinct classes
- React: split data fetching, data transformation, and presentation into separate units
- One reason to change does not mean one method—a repository with findById, save, and delete has one responsibility (data access)
- Over-splitting into 20 tiny single-method classes violates the spirit of SRP

---

## 1. Single Responsibility Principle (SRP)

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
    const validation = this.validator.validate(userData);
    if (!validation.valid) {
      return Result.fail(validation.errors.join(", "));
    }

    const hashedPassword = await this.passwordService.hash(userData.password);

    const user = new User({ ...userData, password: hashedPassword });
    await this.repository.create(user);

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
    setLoading(true);
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (!data.email || !data.name) {
          setError('Invalid user data');
          return;
        }

        const user = {
          ...data,
          displayName: `${data.firstName} ${data.lastName}`
        };

        setUser(user);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

## Reference

- [SOLID Principles Overview](solid-principles.md)
- [Back to SKILL.md](../SKILL.md)
