---
name: nest
description: "NestJS modular architecture with dependency injection. Trigger: When building scalable server apps with NestJS."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - nodejs
    - typescript
    - architecture-patterns
  dependencies:
    "@nestjs/core": ">=10.0.0 <11.0.0"
---

# NestJS Skill

Build scalable server-side applications using NestJS modules, dependency injection, and decorators.

## When to Use
- Building modular server-side apps
- Using dependency injection
- Structuring scalable APIs

Don't use for:
- Simple single-file scripts or CLIs (use plain Node.js)
- Lightweight edge functions (use Hono or Express)
- Frontend-only projects with no server logic

## Critical Patterns

### Module / Controller / Service Structure
Every feature lives in its own module that declares controllers and providers.
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

### Dependency Injection
Inject services through constructor parameters; never instantiate manually.
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

### Guards, Pipes, and Interceptors
Use the built-in lifecycle hooks for cross-cutting concerns.
```typescript
// CORRECT: guard for auth, pipe for validation, interceptor for transform
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller("users")
export class UsersController {}
```

### DTOs with class-validator
Define Data Transfer Objects with decorators for automatic validation.
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

### Exception Filters
Map domain errors to HTTP responses in a single place.
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

## Decision Tree
- REST API? -> Use `@Controller` with HTTP method decorators
- GraphQL API? -> Use `@Resolver` with `@nestjs/graphql`
- Shared business logic? -> Extract into an `@Injectable()` service
- Request validation? -> Apply `ValidationPipe` globally or per-route
- Auth check? -> Implement a Guard with `canActivate`
- Response shaping? -> Use an Interceptor or Serializer
- Background work? -> Use `@nestjs/bull` or `@nestjs/schedule`
- Config secrets? -> Use `ConfigModule.forRoot()` with `.env`

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

## Edge Cases
- **Circular dependencies**: Use `forwardRef(() => SomeModule)` when two modules depend on each other.
- **Request-scoped providers**: Default is singleton; use `Scope.REQUEST` only when truly needed as it hurts performance.
- **Module import order**: `ConfigModule` must be imported before modules that depend on config values.
- **Global pipes vs local**: `app.useGlobalPipes()` skips DI; prefer `APP_PIPE` provider for pipes needing injected deps.
- **Testing with mocks**: Override providers in `Test.createTestingModule()` rather than mocking imports.

## Checklist
- [ ] Each feature has its own module with controllers and providers
- [ ] Services are injected via constructors, never manually instantiated
- [ ] `ValidationPipe` with `whitelist: true` is applied globally or per-route
- [ ] DTOs use class-validator decorators for all input
- [ ] Guards protect authenticated routes
- [ ] Exception filters map domain errors to HTTP status codes
- [ ] `ConfigModule` loads environment variables before dependent modules
- [ ] Unit tests mock providers via the testing module

## Resources
- [NestJS Official Documentation](https://docs.nestjs.com/)
- [NestJS Fundamentals - Modules](https://docs.nestjs.com/modules)
- [class-validator GitHub](https://github.com/typestack/class-validator)
