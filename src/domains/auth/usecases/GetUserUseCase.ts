import { injectable, inject } from 'tsyringe';
import type { UseCase } from '@/shared/types/common';
import type { UserRepository } from '../repositories/UserRepository';
import type { UserProfile } from '../entities/User';
import { TOKENS } from '@/shared/container/tokens';
import { NotFoundError, ValidationError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';

export interface GetUserRequest {
  userId: string;
}

export interface GetUserResponse {
  user: UserProfile;
}

@injectable()
export class GetUserUseCase implements UseCase<GetUserRequest, GetUserResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: UserRepository,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    this.logger.debug('Getting user profile', { userId: request.userId });

    // Validate request
    this.validateRequest(request);

    // Find user by ID
    const user = await this.userRepository.findByIdWithoutPassword(request.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new NotFoundError('User not found');
    }

    this.logger.debug('User profile retrieved', { userId: request.userId });

    return { user };
  }

  private validateRequest(request: GetUserRequest): void {
    if (!request.userId?.trim()) {
      throw new ValidationError('User ID is required');
    }
  }
}