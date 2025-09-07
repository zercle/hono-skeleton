import { DependencyContainer } from 'tsyringe';
import { TOKENS } from './tokens';
import { PinoLoggerService } from '../../api/src/infrastructure/logging/pino-logger.service';

// Define types for the registration options
export interface RegisterOptions {
  registerUserUseCase?: unknown;
  loginUserUseCase?: unknown;
  userRepository?: unknown;
  logger?: unknown;
  config?: unknown;
}

/**
 * Register dependencies with the TSyringe container
 * @param container Optional TSyringe container instance (defaults to global container)
 * @param options Options for registering concrete implementations
 * @returns The container instance after registration
 */
export function registerDependencies(
  container?: DependencyContainer,
  options?: RegisterOptions
): DependencyContainer {
  // If no container provided, use the global container
  const targetContainer = container || undefined;

  // Register each dependency with appropriate lifetime
  if (options?.registerUserUseCase) {
    targetContainer?.register(TOKENS.RegisterUserUseCase, {
      useValue: options.registerUserUseCase,
    });
  } else {
    targetContainer?.register(TOKENS.RegisterUserUseCase, {
      useFactory: () => {
        throw new Error(
          'RegisterUserUseCase implementation is required but not provided'
        );
      },
    });
  }

  if (options?.loginUserUseCase) {
    targetContainer?.register(TOKENS.LoginUserUseCase, {
      useValue: options.loginUserUseCase,
    });
  } else {
    targetContainer?.register(TOKENS.LoginUserUseCase, {
      useFactory: () => {
        throw new Error(
          'LoginUserUseCase implementation is required but not provided'
        );
      },
    });
  }

  if (options?.userRepository) {
    targetContainer?.register(TOKENS.UserRepository, {
      useValue: options.userRepository,
    });
  } else {
    targetContainer?.register(TOKENS.UserRepository, {
      useFactory: () => {
        throw new Error(
          'UserRepository implementation is required but not provided'
        );
      },
    });
  }

  if (options?.logger) {
    targetContainer?.register(TOKENS.Logger, { useValue: options.logger, lifecycle: 'Singleton' });
  } else {
    // Register PinoLoggerService as the default logger implementation
    targetContainer?.register(TOKENS.Logger, {
      useClass: PinoLoggerService,
      lifecycle: 'Singleton',
    });
  }

  if (options?.config) {
    targetContainer?.register(TOKENS.Config, { useValue: options.config });
  } else {
    // Register a placeholder that throws if not provided
    targetContainer?.register(TOKENS.Config, {
      useFactory: () => {
        throw new Error('Config implementation is required but not provided');
      },
    });
  }

  return targetContainer;
}
