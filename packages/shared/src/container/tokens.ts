/**
 * Dependency Injection tokens for the shared package
 * These are used to register and resolve dependencies throughout the application
 */

// Define unique tokens for dependency injection
export const RegisterUserUseCaseToken = Symbol.for('RegisterUserUseCase');
export const LoginUserUseCaseToken = Symbol.for('LoginUserUseCase');
export const AuthUseCaseToken = Symbol.for('AuthUseCase');
export const UserRepositoryToken = Symbol.for('UserRepository');

// Post domain tokens
export const PostRepositoryToken = Symbol.for('PostRepository');
export const CreatePostUseCaseToken = Symbol.for('CreatePostUseCase');
export const GetPostUseCaseToken = Symbol.for('GetPostUseCase');
export const ListPostsUseCaseToken = Symbol.for('ListPostsUseCase');
export const UpdatePostUseCaseToken = Symbol.for('UpdatePostUseCase');
export const DeletePostUseCaseToken = Symbol.for('DeletePostUseCase');

export const LoggerToken = Symbol.for('Logger');
export const ConfigToken = Symbol.for('Config');
export const HealthCheckServiceToken = Symbol.for('HealthCheckService');

// Export all tokens as a record for easy access
export const TOKENS = {
  RegisterUserUseCase: RegisterUserUseCaseToken,
  LoginUserUseCase: LoginUserUseCaseToken,
  AuthUseCase: AuthUseCaseToken,
  UserRepository: UserRepositoryToken,
  
  // Post domain tokens
  PostRepository: PostRepositoryToken,
  CreatePostUseCase: CreatePostUseCaseToken,
  GetPostUseCase: GetPostUseCaseToken,
  ListPostsUseCase: ListPostsUseCaseToken,
  UpdatePostUseCase: UpdatePostUseCaseToken,
  DeletePostUseCase: DeletePostUseCaseToken,
  
  Logger: LoggerToken,
  Config: ConfigToken,
  HealthCheckService: HealthCheckServiceToken,
} as const;
