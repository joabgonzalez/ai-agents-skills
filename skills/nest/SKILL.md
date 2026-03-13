---
name: nest
description: "NestJS modular architecture with dependency injection. Trigger: When building scalable server apps with NestJS."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: framework
  skills:
    - nodejs
  dependencies:
    "@nestjs/core": ">=10.0.0 <11.0.0"
---

# NestJS

Scalable server apps with NestJS modules, dependency injection, and decorators.

## When to Use

- Modular server apps
- Dependency injection
- Scalable APIs

Don't use for:

- Single-file scripts/CLIs (use Node.js)
- Lightweight edge functions (use Hono/Express)
- Frontend-only projects

---

## Critical Patterns

### ✅ REQUIRED: Module / Controller / Service Structure

Each feature in own module with controllers and providers.

```typescript
// CORRECT: one module encapsulates the feature
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
// WRONG: registering all services in AppModule
```

### ✅ REQUIRED: Dependency Injection

Inject via constructor; never instantiate manually.

```typescript
// CORRECT: let the DI container manage instances
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }
}
// WRONG: const service = new UsersService()
```

### ✅ REQUIRED: Guards, Pipes, and Interceptors

Built-in lifecycle hooks for cross-cutting concerns.

```typescript
// CORRECT: guard for auth, pipe for validation, interceptor for transform
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller("users")
export class UsersController {}
```

### ✅ REQUIRED: DTOs with class-validator

DTOs with decorators for auto-validation.

```typescript
export class CreateUserDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() bio?: string;
}
@Post()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

### ✅ REQUIRED: Exception Filters

Map domain errors to HTTP responses centrally.

```typescript
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    ctx.getResponse().status(exception.status).json({
      error: exception.message,
    });
  }
}
```

---

## Decision Tree

```
REST API?
  → @Controller with HTTP method decorators

GraphQL API?
  → @Resolver with @nestjs/graphql

Shared business logic?
  → Extract into an @Injectable() service

Request validation?
  → Apply ValidationPipe globally or per-route

Auth check?
  → Implement a Guard with canActivate

Response shaping?
  → Use an Interceptor or Serializer

Background work?
  → @nestjs/bull or @nestjs/schedule

Config secrets?
  → ConfigModule.forRoot() with .env
```

---

## Example

```typescript
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get()
  findAll() { return this.users.findAll(); }
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const user = await this.users.findOne(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
```

---

## Edge Cases

- **Circular deps**: Use `forwardRef(() => SomeModule)` for mutual dependencies.
- **Request-scoped providers**: Default singleton; `Scope.REQUEST` hurts performance.
- **Module order**: Import `ConfigModule` before dependent modules.
- **Global pipes**: `app.useGlobalPipes()` skips DI; use `APP_PIPE` provider for injected deps.
- **Test mocks**: Override providers in `Test.createTestingModule()`, not imports.

---

## Checklist

- [ ] Each feature has its own module with controllers and providers
- [ ] Services are injected via constructors, never manually instantiated
- [ ] `ValidationPipe` with `whitelist: true` is applied globally or per-route
- [ ] DTOs use class-validator decorators for all input
- [ ] Guards protect authenticated routes
- [ ] Exception filters map domain errors to HTTP status codes
- [ ] `ConfigModule` loads environment variables before dependent modules
- [ ] Unit tests mock providers via the testing module

---

## Resources

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [NestJS Fundamentals - Modules](https://docs.nestjs.com/modules)
- [class-validator GitHub](https://github.com/typestack/class-validator)
