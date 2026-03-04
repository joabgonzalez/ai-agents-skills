## Core Patterns

NestJS modules are the unit of encapsulation. Each feature is a module; modules declare what they provide and what they export for others to consume. The patterns below cover the full lifecycle: basic feature modules, dynamic configuration, circular dependency resolution, and the global module escape hatch.

### Feature Module Structure

A feature module groups the controller, service, and repository for one business capability. It exports only what other modules need — never more.

```typescript
// src/users/user.entity.ts
export class User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

```typescript
// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  save(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }
}
```

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: CreateUserDto): Promise<User> {
    return this.users.save(dto);
  }
}
```

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],   // export service, NOT repository — hide persistence details
})
export class UsersModule {}
```

Module export rule: export only what other modules legitimately need to call. `UsersRepository` is an implementation detail of `UsersModule` — never export it.

### Dynamic Modules with `forRoot()` and `forRootAsync()`

Use dynamic modules to configure a shared module once at the application root. `forRoot()` takes a static config object; `forRootAsync()` accepts async factory functions and supports DI.

```typescript
// src/shared/email/email.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { EmailService } from './email.service';

export interface EmailModuleOptions {
  host: string;
  port: number;
  from: string;
}

// Injection token for the options object
export const EMAIL_OPTIONS = 'EMAIL_OPTIONS';

@Module({})
export class EmailModule {
  // Static config — use when options are known at startup
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        { provide: EMAIL_OPTIONS, useValue: options },
        EmailService,
      ],
      exports: [EmailService],
      global: false,
    };
  }

  // Async config — use when options come from ConfigService or async source
  static forRootAsync(asyncOptions: {
    useFactory: (...args: any[]) => Promise<EmailModuleOptions> | EmailModuleOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      module: EmailModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        {
          provide: EMAIL_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject ?? [],
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
```

```typescript
// src/email/email.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_OPTIONS, EmailModuleOptions } from './email.module';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_OPTIONS) private readonly options: EmailModuleOptions
  ) {}

  async send(to: string, subject: string, body: string): Promise<void> {
    // Use this.options.host, this.options.port, this.options.from
  }
}
```

```typescript
// src/app.module.ts — two ways to register
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './shared/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Static registration (simple):
    // EmailModule.forRoot({ host: 'smtp.example.com', port: 587, from: 'no-reply@example.com' }),

    // Async registration (reads from ConfigService):
    EmailModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('SMTP_HOST')!,
        port: config.get<number>('SMTP_PORT')!,
        from: config.get<string>('SMTP_FROM')!,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Circular Dependency Resolution with `forwardRef()`

Circular dependencies signal that two modules are too tightly coupled. Before reaching for `forwardRef()`, try extracting the shared concept into a third module. When a circular dependency is unavoidable, use `forwardRef()` on both sides.

```typescript
// WRONG: AuthModule imports UsersModule, UsersModule imports AuthModule
// → NestJS throws: "A circular dependency has been detected"

// BETTER FIRST: extract the shared concept
// UsersModule and AuthModule both import CredentialsModule
// — eliminates the cycle entirely
```

When extraction is not feasible:

```typescript
// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [forwardRef(() => UsersModule)],  // lazy reference
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],  // lazy reference on both sides
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

```typescript
// src/auth/auth.service.ts — inject with forwardRef() in the service too
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}
}
```

### Global Modules vs Feature Modules

Use `@Global()` sparingly. A global module is registered once and its exports are available everywhere without explicit import. Overusing it defeats the purpose of modular architecture.

```typescript
// src/shared/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

// JUSTIFIED use of @Global():
// - LoggerService would need to be imported in every single feature module
// - It has no domain-specific configuration
// - It is pure infrastructure with no feature coupling
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
```

```typescript
// With @Global(), any module can inject LoggerService without importing LoggerModule:
@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {} // works without importing LoggerModule
}
```

When NOT to use `@Global()`:

```
Module                      Use @Global()?   Reason
--------------------------  ---------------  ------------------------------------------
LoggerModule                YES              Used by every module, pure infrastructure
ConfigModule                YES (built-in)   NestJS sets isGlobal: true itself
DatabaseModule              YES              DB connection is always shared
AuthModule                  NO              Import explicitly — guards clarify what is protected
UsersModule                 NO              Feature module — explicit imports show coupling
EmailModule                 NO              Not every module sends email — import where needed
```

Registration order in `AppModule`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // global config first
    LoggerModule,                               // global logger second
    DatabaseModule.forRootAsync({ ... }),       // global DB third
    UsersModule,                                // feature modules after infrastructure
    OrdersModule,
    PaymentsModule,
  ],
})
export class AppModule {}
```
