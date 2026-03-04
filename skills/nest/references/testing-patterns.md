## Core Patterns

NestJS testing relies on `Test.createTestingModule()` to build a lightweight DI container for the units under test. Unit tests replace real providers with mocks; E2E tests spin up the full application. Guards and interceptors are tested in isolation without the full request cycle.

### Unit Testing with DI — `Test.createTestingModule()` and Mock Providers

Build a minimal testing module that includes only the class under test and mocked versions of its dependencies. Never import the full feature module in unit tests.

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

// Mock implementation typed to the interface
const mockUsersRepository = {
  findById:  jest.fn(),
  findAll:   jest.fn(),
  findByEmail: jest.fn(),
  save:      jest.fn(),
  delete:    jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: typeof mockUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // Replace the real repository with the mock
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service    = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    // Reset all mocks between tests to prevent state leakage
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = { id: '1', name: 'Alice', email: 'alice@example.com' };
      repository.findById.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('throws ConflictException when email is already taken', async () => {
      repository.findByEmail.mockResolvedValue({ id: '2', email: 'bob@example.com' });

      await expect(service.create({ name: 'Bob', email: 'bob@example.com' }))
        .rejects.toThrow('Email already registered');
    });

    it('saves and returns the new user', async () => {
      repository.findByEmail.mockResolvedValue(null);
      const saved = { id: '3', name: 'Charlie', email: 'charlie@example.com' };
      repository.save.mockResolvedValue(saved);

      const result = await service.create({ name: 'Charlie', email: 'charlie@example.com' });

      expect(repository.save).toHaveBeenCalledWith({ name: 'Charlie', email: 'charlie@example.com' });
      expect(result).toEqual(saved);
    });
  });
});
```

### Mocking Services with `jest.fn()` and `useValue`

When testing a controller, mock the service. When testing a service, mock the repository. Provide mocks as plain objects using `useValue` — no need for `jest.mock()` module-level mocking.

```typescript
// src/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Typed partial mock — only define methods the controller calls
const mockUsersService: Partial<UsersService> = {
  findAll:  jest.fn(),
  findById: jest.fn(),
  create:   jest.fn(),
  remove:   jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service    = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('delegates to UsersService.findAll()', async () => {
      const users = [{ id: '1', name: 'Alice' }];
      (service.findAll as jest.Mock).mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('create', () => {
    it('passes the DTO to UsersService.create()', async () => {
      const dto    = { name: 'Bob', email: 'bob@example.com' };
      const created = { id: '2', ...dto };
      (service.create as jest.Mock).mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
```

For injection tokens (not class references), use the token string or symbol as the `provide` key:

```typescript
// Mocking a provider registered with a string token
{
  provide: 'MAILER_OPTIONS',
  useValue: { host: 'localhost', port: 1025 },
}

// Mocking a provider registered with a symbol token
const CACHE_CLIENT = Symbol('CACHE_CLIENT');
{
  provide: CACHE_CLIENT,
  useValue: { get: jest.fn(), set: jest.fn() },
}
```

### E2E Testing with Supertest and `@nestjs/testing`

E2E tests start the full NestJS application (minus external services) and test HTTP behavior end-to-end through real middleware, pipes, and guards.

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/shared/database/database.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override the real DB with a test DB or in-memory stub
      .overrideProvider(DatabaseService)
      .useValue({
        query: jest.fn(),
        disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global pipes and filters as production
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    db = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('creates a user and returns 201', async () => {
      const created = { id: '1', name: 'Alice', email: 'alice@example.com' };
      (db.query as jest.Mock).mockResolvedValueOnce(created);

      const response = await supertest(app.getHttpServer())
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201);

      expect(response.body).toMatchObject({ id: '1', name: 'Alice' });
    });

    it('returns 400 for invalid email', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/users')
        .send({ name: 'Bob', email: 'not-an-email' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /users/:id', () => {
    it('returns 404 when user does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce(null);

      await supertest(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });
});
```

E2E test configuration in `jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

Run E2E tests separately from unit tests:

```json
{
  "scripts": {
    "test":     "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### Testing Guards and Interceptors in Isolation

Guards and interceptors receive an `ExecutionContext`. Test them without spinning up the full application by constructing a mock context.

```typescript
// src/auth/guards/auth.guard.spec.ts
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest'; // optional helper

const mockJwtService = {
  verifyAsync: jest.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard(mockJwtService as any);
    jest.clearAllMocks();
  });

  function buildContext(authHeader?: string): ExecutionContext {
    // Construct a minimal ExecutionContext mock
    const mockRequest  = { headers: { authorization: authHeader } };
    const mockResponse = {};
    const mockNext     = {};

    return {
      switchToHttp: () => ({
        getRequest:  () => mockRequest,
        getResponse: () => mockResponse,
        getNext:     () => mockNext,
      }),
      getClass:   () => Object,
      getHandler: () => () => {},
    } as unknown as ExecutionContext;
  }

  it('throws UnauthorizedException when no Authorization header', async () => {
    const context = buildContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const context = buildContext('Bearer bad-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches user to request and returns true for valid token', async () => {
    const payload = { sub: 'user-1', email: 'alice@example.com' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    const context = buildContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    // Verify user was attached to request
    const request = context.switchToHttp().getRequest() as any;
    expect(request.user).toEqual(payload);
  });
});
```

Testing an interceptor that transforms the response:

```typescript
// src/common/interceptors/transform.interceptor.spec.ts
import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('wraps the response in a data envelope', (done) => {
    const context     = {} as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of({ id: 1, name: 'Alice' }),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toEqual({ data: { id: 1, name: 'Alice' } });
      done();
    });
  });
});
```
