# Dependency Injection Container

This directory contains the dependency injection setup using TSyringe for the shared package.

## Usage

To register dependencies in your application, use the `registerDependencies` function:

```typescript
import { registerDependencies } from '@/shared/container/register';
import { PgUserRepository } from '@/infrastructure/repositories/pg-user-repository';
import { AuthUseCase } from '@/domains/auth/use-cases/auth-use-case';

// Register concrete implementations
registerDependencies(undefined, {
  userRepository: new PgUserRepository(),
  authUseCase: new AuthUseCase(),
});
```

## Tokens

The following tokens are exported for dependency injection:

- `AuthUseCaseToken` - For authentication use cases
- `UserRepositoryToken` - For user repository implementations
- `LoggerToken` - For logger implementations
- `ConfigToken` - For configuration implementations

## Resolution

Use the `resolve<T>()` helper function to resolve dependencies:

```typescript
import { resolve } from '@/shared/container';
import { AuthUseCaseToken } from '@/shared/container/tokens';

const authUseCase = resolve(AuthUseCaseToken);
```
