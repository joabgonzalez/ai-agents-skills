## Quick Navigation

| File | Purpose |
| ---- | ------- |
| [module-patterns.md](./module-patterns.md) | Feature module structure, dynamic modules, circular dependency resolution, global vs feature modules |
| [testing-patterns.md](./testing-patterns.md) | Unit testing with DI, mock providers, E2E with supertest, guards and interceptors in isolation |

---

## Reading Strategy

Start with the SKILL.md for the core NestJS patterns (module/controller/service structure, dependency injection, guards/pipes/interceptors, DTOs, exception filters). Then use the reference files based on what you are building or testing:

- Designing module structure or configuring shared modules: read `module-patterns.md` — it covers the complete feature module with entity/repository/service/controller layers, dynamic module registration with `forRoot()` and `forRootAsync()`, resolving circular dependencies with `forwardRef()`, and when to use `@Global()`.
- Writing tests: read `testing-patterns.md` — it covers unit testing services and controllers with `Test.createTestingModule()`, mocking providers with `useValue`, E2E tests with supertest against the real application, and testing guards and interceptors without the full request cycle.

---

## File Descriptions

**module-patterns.md** — Module architecture patterns: complete feature module with typed repository, service with domain error throwing, controller with decorators, and module export rules. Dynamic module patterns using `forRoot()` (static config) and `forRootAsync()` (async factory with ConfigService injection). Circular dependency resolution with `forwardRef()` on both module imports and constructor injection. `@Global()` usage guidelines with a decision table showing when global registration is justified vs harmful.

**testing-patterns.md** — Testing patterns: unit testing a service with a mock repository using `Test.createTestingModule()` and `useValue`, typed partial mocks for controllers, `jest.clearAllMocks()` between tests, injection token mocking with string/symbol tokens, E2E test setup with `app.init()` and production-equivalent global pipes, supertest request chaining with response assertions, E2E configuration in `jest-e2e.json`, guard testing with a manually constructed `ExecutionContext` mock, and interceptor testing with RxJS observables.

---

## Cross-Reference Map

| Concept | Where it appears |
| ------- | ---------------- |
| Feature module with entity/repo/service/controller | module-patterns.md: Feature Module Structure |
| Module export rules (export service, not repository) | module-patterns.md: Feature Module Structure |
| forRoot() static dynamic module | module-patterns.md: Dynamic Modules |
| forRootAsync() with ConfigService | module-patterns.md: Dynamic Modules |
| forwardRef() circular dependency | module-patterns.md: Circular Dependency Resolution, SKILL.md: Edge Cases |
| @Global() decision table | module-patterns.md: Global Modules vs Feature Modules |
| ConfigModule import order | module-patterns.md: Global Modules, SKILL.md: Edge Cases |
| Test.createTestingModule() | testing-patterns.md: Unit Testing, SKILL.md: Edge Cases |
| useValue mock provider | testing-patterns.md: Mocking Services |
| Injection token mocking | testing-patterns.md: Mocking Services |
| E2E with supertest | testing-patterns.md: E2E Testing |
| overrideProvider() in E2E | testing-patterns.md: E2E Testing |
| Guard testing with mock ExecutionContext | testing-patterns.md: Testing Guards and Interceptors |
| Interceptor testing with RxJS | testing-patterns.md: Testing Guards and Interceptors |
| ValidationPipe global setup | SKILL.md: Critical Patterns, testing-patterns.md: E2E Testing |
