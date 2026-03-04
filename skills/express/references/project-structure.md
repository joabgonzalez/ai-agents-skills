## Core Patterns

Express has no enforced structure. The patterns below apply screaming architecture principles to an Express codebase: features own their routes, controllers, and services; the framework lives at the edge; and the application shuts down gracefully.

### Feature-Based Folder Structure

Each business feature owns all of its code. The folder name reflects the business concept, not a technical role.

```
src/
├── features/
│   ├── users/
│   │   ├── users.routes.ts       # Express Router — framework at the edge
│   │   ├── users.controller.ts   # HTTP handlers — thin, delegates to service
│   │   ├── users.service.ts      # Business logic — no Express imports
│   │   ├── users.repository.ts   # Data access — no Express imports
│   │   ├── users.dto.ts          # Zod schemas for request/response shapes
│   │   ├── users.errors.ts       # Domain errors specific to this feature
│   │   └── users.test.ts         # Unit tests co-located with the feature
│   ├── orders/
│   │   ├── orders.routes.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.repository.ts
│   │   ├── orders.dto.ts
│   │   └── orders.test.ts
│   └── payments/
│       ├── payments.routes.ts
│       ├── payments.service.ts
│       ├── payments.dto.ts
│       └── payments.test.ts
├── shared/
│   ├── database/
│   │   └── client.ts             # DB client singleton (Prisma, pg, etc.)
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   ├── errors/
│   │   └── app.error.ts          # AppError base class with statusCode
│   └── logger/
│       └── index.ts
├── app.ts                        # Express app setup — middleware + router mounting
├── server.ts                     # HTTP server creation + graceful shutdown
└── config.ts                     # Env var loading and validation
```

Each layer has a strict rule about what it may import:

```
routes.ts      → imports: controller, middleware (Express allowed here)
controller.ts  → imports: service, dto (NO Express Request/Response in service)
service.ts     → imports: repository, domain errors (NO Express imports)
repository.ts  → imports: DB client (NO Express imports, NO service)
```

### Router Mounting Strategy

The `app.ts` file mounts feature routers under versioned API paths. It does not contain route logic — only orchestration.

```typescript
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import { userRouter } from './features/users/users.routes';
import { orderRouter } from './features/orders/orders.routes';
import { paymentRouter } from './features/payments/payments.routes';
import { errorHandler } from './shared/middleware/error.middleware';
import { db } from './shared/database/client';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

  // Health check — no auth, no versioning
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Versioned API routes — pass dependencies explicitly
  app.use('/api/v1/users',    userRouter({ db }));
  app.use('/api/v1/orders',   orderRouter({ db }));
  app.use('/api/v1/payments', paymentRouter({ db }));

  // Error handler last
  app.use(errorHandler);

  return app;
}
```

Feature router — accepts injected dependencies, creates no global state:

```typescript
// src/features/users/users.routes.ts
import { Router } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { CreateUserDto, UserIdParamDto } from './users.dto';

interface Deps { db: DatabaseClient }

export function userRouter({ db }: Deps): Router {
  const repository  = new UsersRepository(db);
  const service     = new UsersService(repository);
  const controller  = new UsersController(service);
  const router      = Router();

  router.get(
    '/',
    authenticate,
    controller.list
  );
  router.get(
    '/:id',
    authenticate,
    validate(UserIdParamDto, 'params'),
    controller.getById
  );
  router.post(
    '/',
    authenticate,
    validate(CreateUserDto, 'body'),
    controller.create
  );
  router.delete(
    '/:id',
    authenticate,
    validate(UserIdParamDto, 'params'),
    controller.remove
  );

  return router;
}
```

### Graceful Shutdown Pattern

The `server.ts` file owns the HTTP server lifecycle. On SIGTERM, it stops accepting new connections, drains in-flight requests, and closes the DB connection before exiting.

```typescript
// src/server.ts
import { createApp } from './app';
import { db } from './shared/database/client';
import { logger } from './shared/logger';

async function main() {
  const app  = createApp();
  const port = Number(process.env.PORT ?? 3000);

  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });

  // Track open connections to drain during shutdown
  const connections = new Set<import('net').Socket>();
  server.on('connection', (socket) => {
    connections.add(socket);
    socket.once('close', () => connections.delete(socket));
  });

  async function shutdown(signal: string) {
    logger.info(`${signal} received — starting graceful shutdown`);

    // 1. Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      // 3. Close DB after all HTTP requests are done
      await db.disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });

    // 2. Destroy lingering keep-alive connections
    for (const socket of connections) {
      socket.destroy();
    }

    // 4. Force exit if drain takes too long
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Unhandled promise rejections crash the process — treat as fatal
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason);
    process.exit(1);
  });
}

main();
```

### Dependency Injection Without Frameworks

Express has no DI container. Constructor injection achieves testability and replaceability without any library.

```typescript
// src/features/users/users.repository.ts
// Depends on an abstract interface, not a concrete DB client
export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UsersRepository implements IUsersRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: string): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
  async findAll(): Promise<User[]> {
    return this.db.query('SELECT * FROM users');
  }
  async create(data: CreateUserData): Promise<User> {
    return this.db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [data.name, data.email]
    );
  }
  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
```

```typescript
// src/features/users/users.service.ts
// Depends on the interface, not the concrete repository
export class UsersService {
  constructor(private readonly users: IUsersRepository) {}

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    const existing = await this.users.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');
    return this.users.create(data);
  }
}
```

```typescript
// src/features/users/users.controller.ts
// Depends on the service, delegates HTTP concerns here
export class UsersController {
  constructor(private readonly users: UsersService) {}

  list: RequestHandler = async (_req, res, next) => {
    try {
      const users = await this.users.getAll();
      res.json(users);
    } catch (err) { next(err); }
  };

  create: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.users.create(req.body);
      res.status(201).json(user);
    } catch (err) { next(err); }
  };
}
```

Testing is straightforward because every class receives its dependencies from outside:

```typescript
// users.service.test.ts
const mockRepo: IUsersRepository = {
  findById: jest.fn(),
  findAll:  jest.fn(),
  create:   jest.fn(),
  delete:   jest.fn(),
};

const service = new UsersService(mockRepo);

test('getById throws NotFoundError when user missing', async () => {
  (mockRepo.findById as jest.Mock).mockResolvedValue(null);
  await expect(service.getById('non-existent')).rejects.toThrow(NotFoundError);
});
```
