// Dependency Injection Tokens
export const TOKENS = {
  // Infrastructure
  Logger: Symbol.for('Logger'),
  DatabaseService: Symbol.for('DatabaseService'),
  ConfigService: Symbol.for('ConfigService'),

  // Auth Domain
  UserRepository: Symbol.for('UserRepository'),
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  AuthenticateUserUseCase: Symbol.for('AuthenticateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  GetUsersUseCase: Symbol.for('GetUsersUseCase'),
  ChangePasswordUseCase: Symbol.for('ChangePasswordUseCase'),
  RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
  AuthHandler: Symbol.for('AuthHandler'),

  // Add more domain tokens here as needed
  // Posts Domain (example)
  // PostRepository: Symbol.for('PostRepository'),
  // CreatePostUseCase: Symbol.for('CreatePostUseCase'),
  // GetPostUseCase: Symbol.for('GetPostUseCase'),
  // UpdatePostUseCase: Symbol.for('UpdatePostUseCase'),
  // DeletePostUseCase: Symbol.for('DeletePostUseCase'),
  // GetPostsUseCase: Symbol.for('GetPostsUseCase'),
} as const;