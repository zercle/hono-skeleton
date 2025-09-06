import { injectable, inject } from 'tsyringe';
import type { UseCase } from '@/shared/types/common';
import type { UserRepository } from '../repositories/UserRepository';
import type { CreateUserData, UserProfile } from '../entities/User';
import { TOKENS } from '@/shared/container/tokens';
import { ConflictError, ValidationError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';

export interface CreateUserRequest extends CreateUserData {}

export interface CreateUserResponse {
  user: UserProfile;
}

@injectable()
export class CreateUserUseCase implements UseCase<CreateUserRequest, CreateUserResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: UserRepository,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    this.logger.info('Creating new user', { email: request.email });

    // Validate request
    this.validateRequest(request);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.createUser({
      email: request.email,
      password: request.password,
      name: request.name,
      isActive: request.isActive ?? true,
      emailVerified: request.emailVerified ?? false,
    });

    // Return user profile (without password)
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    this.logger.info('User created successfully', { userId: user.id });
    
    return { user: userProfile };
  }

  private validateRequest(request: CreateUserRequest): void {
    if (!request.email?.trim()) {
      throw new ValidationError('Email is required');
    }

    if (!request.password?.trim()) {
      throw new ValidationError('Password is required');
    }

    if (request.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!request.name?.trim()) {
      throw new ValidationError('Name is required');
    }

    // Email format validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new ValidationError('Invalid email format');
    }
  }
}