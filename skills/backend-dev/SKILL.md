---
name: backend-dev
description: "Backend development workflow with API design and data modeling. Trigger: When building, refactoring, or scaling backend apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - nodejs
    - architecture-patterns
    - humanizer
---

# Backend Development Skill

## Overview

This skill provides universal patterns for back-end development workflow, focusing on API design, data modeling, error handling, and deployment. It is technology-agnostic and emphasizes maintainability, scalability, and robustness.

## When to Use

- Designing, building, or refactoring APIs
- Modeling data and business logic
- Preparing for deployment or CI/CD
- Reviewing or improving code quality and structure

## Critical Patterns

### ✅ REQUIRED: API Design with Versioning

Define clear, versioned contracts to prevent breaking changes.

```typescript
// ❌ WRONG: No versioning, breaking change affects all clients
app.get('/api/users', (req, res) => {
  // Changed response format - breaks existing clients!
  res.json({ data: users, total: users.length });
});

// ✅ CORRECT: Versioned API allows gradual migration
app.get('/api/v1/users', (req, res) => {
  res.json(users); // Original format
});

app.get('/api/v2/users', (req, res) => {
  // New format with pagination metadata
  res.json({ data: users, total: users.length, page: 1 });
});
```

### ✅ REQUIRED: Data Modeling with Validation

Validate at boundaries and separate domain logic from persistence.

```typescript
// ✅ CORRECT: Validate input at API boundary
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
});

app.post('/api/v1/users', async (req, res) => {
  // Validate input
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  // Domain logic (separate from persistence)
  const user = await createUser(result.data);
  res.status(201).json(user);
});
```

### ✅ REQUIRED: Centralized Error Handling

Consistent error responses and logging across all endpoints.

```typescript
// ✅ CORRECT: Centralized error handler middleware
class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Error handler middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    // Operational error - send to client
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Programming error - log and send generic message
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

app.use(errorHandler);
```

### ✅ REQUIRED: Environment-Based Configuration

Never hardcode config values. Use environment variables.

```typescript
// ✅ CORRECT: Environment-based configuration
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = EnvSchema.parse(process.env);

// Usage
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

## Decision Tree

- New endpoint? → Define contract/schema and document
- Data model change? → Migrate safely and validate
- Deployment? → Automate with CI/CD
- Bug found? → Add/expand test coverage

## Edge Cases

- **Data migration failures**: Always implement rollback strategy. Use transactions for multi-step migrations. Test migrations on staging data first.

- **API versioning and backward compatibility**: Maintain old versions until all clients migrate. Document deprecation timeline (e.g., "v1 deprecated 2026-06-01, removed 2026-09-01").

- **Security edge cases**: Validate all inputs to prevent injection attacks. Implement rate limiting per endpoint. Use parameterized queries for SQL. Sanitize user input before logging.

- **Race conditions**: Use database transactions for operations that must be atomic. Implement optimistic locking for concurrent updates. Consider distributed locks for multi-instance deployments.

- **Large response payloads**: Implement pagination for list endpoints. Use streaming for large files. Consider compression (gzip) for response bodies.

## Checklist

- [ ] API endpoints versioned (/api/v1, /api/v2)
- [ ] Input validation at all boundaries (zod, yup, joi)
- [ ] Centralized error handling middleware
- [ ] Environment variables for all configuration
- [ ] Database migrations tested with rollback
- [ ] Authentication and authorization on protected routes
- [ ] Rate limiting implemented on public endpoints
- [ ] Logging with context (request ID, user ID, timestamp)
- [ ] API documentation up-to-date (OpenAPI, Swagger)
- [ ] Unit tests for business logic (>=80% coverage)
- [ ] Integration tests for critical flows
- [ ] CI/CD pipeline configured (build, test, deploy)
- [ ] Health check endpoint (/health, /ping)
- [ ] Monitoring and alerting configured (errors, performance)

## Practical Examples

### Example: Complete API Endpoint with Best Practices

```typescript
// users.controller.ts
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate input
    const data = CreateUserSchema.parse(req.body);

    // 2. Business logic
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, 'Email already exists');
    }

    // 3. Persist to database
    const user = await userRepository.create(data);

    // 4. Return response
    res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

// Route definition with authentication and rate limiting
router.post(
  '/api/v1/users',
  authenticate, // Middleware: verify JWT token
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 min
  createUser
);
```

## Resources

- [conventions](../conventions/SKILL.md) - Code organization and naming
- [architecture-patterns](../architecture-patterns/SKILL.md) - Design patterns (Repository, Service Layer, Clean Architecture)
- [nodejs](../nodejs/SKILL.md) - Node.js runtime patterns
- [typescript](../typescript/SKILL.md) - Type-safe backend development
- [form-validation](../form-validation/SKILL.md) - Input validation with zod/yup
- [express](../express/SKILL.md) - Express.js framework patterns
- [nest](../nest/SKILL.md) - NestJS framework patterns
- [hono](../hono/SKILL.md) - Hono framework patterns
- https://restfulapi.net/ - REST API design best practices
- https://swagger.io/docs/ - OpenAPI/Swagger documentation
