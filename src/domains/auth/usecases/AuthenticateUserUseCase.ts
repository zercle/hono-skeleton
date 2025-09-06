import { injectable, inject } from 'tsyringe';
import type { UseCase } from '@/shared/types/common';
import type { UserRepository } from '../repositories/UserRepository';
import type { AuthenticatedUser, TokenPair } from '../entities/User';
import { TOKENS } from '@/shared/container/tokens';
import { UnauthorizedError, ValidationError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';
import { CryptoHelper } from '@/shared/utils/crypto';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  user: AuthenticatedUser;
}

@injectable()
export class AuthenticateUserUseCase implements UseCase<AuthenticateUserRequest, AuthenticateUserResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: UserRepository,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    this.logger.info('Authenticating user', { email: request.email });

    // Validate request
    this.validateRequest(request);

    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await CryptoHelper.comparePassword(request.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn('Invalid password attempt', { userId: user.id, email: request.email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokenPair = CryptoHelper.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Create authenticated user response
    const authenticatedUser: AuthenticatedUser = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };

    this.logger.info('User authenticated successfully', { userId: user.id });

    return { user: authenticatedUser };
  }

  private validateRequest(request: AuthenticateUserRequest): void {
    if (!request.email?.trim()) {
      throw new ValidationError('Email is required');
    }

    if (!request.password?.trim()) {
      throw new ValidationError('Password is required');
    }
  }
}