/**
 * Dependency Injection tokens for the shared package
 * These are used to register and resolve dependencies throughout the application
 */

// Define unique tokens for dependency injection
export const RegisterUserUseCaseToken = Symbol.for('RegisterUserUseCase');
export const LoginUserUseCaseToken = Symbol.for('LoginUserUseCase');
export const AuthUseCaseToken = Symbol.for('AuthUseCase');
export const UserRepositoryToken = Symbol.for('UserRepository');
export const LoggerToken = Symbol.for('Logger');
export const ConfigToken = Symbol.for('Config');

// Export all tokens as a record for easy access
export const TOKENS = {
  RegisterUserUseCase: RegisterUserUseCaseToken,
  LoginUserUseCase: LoginUserUseCaseToken,
  AuthUseCase: AuthUseCaseToken,
  UserRepository: UserRepositoryToken,
  Logger: LoggerToken,
  Config: ConfigToken,
} as const;
