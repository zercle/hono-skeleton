import { injectable, inject } from 'tsyringe';
import type { UseCase } from '@/shared/types/common';
import type { UserRepository } from '../repositories/UserRepository';
import { TOKENS } from '@/shared/container/tokens';
import { UnauthorizedError, ValidationError, NotFoundError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';
import { CryptoHelper } from '@/shared/utils/crypto';

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

@injectable()
export class ChangePasswordUseCase implements UseCase<ChangePasswordRequest, ChangePasswordResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: UserRepository,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    this.logger.info('Changing user password', { userId: request.userId });

    // Validate request
    this.validateRequest(request);

    // Find user
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await CryptoHelper.comparePassword(
      request.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      this.logger.warn('Invalid current password attempt', { userId: request.userId });
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await CryptoHelper.hashPassword(request.newPassword);

    // Update password
    const success = await this.userRepository.changePassword(request.userId, hashedNewPassword);

    if (!success) {
      throw new Error('Failed to change password');
    }

    this.logger.info('Password changed successfully', { userId: request.userId });

    return { success: true };
  }

  private validateRequest(request: ChangePasswordRequest): void {
    if (!request.userId?.trim()) {
      throw new ValidationError('User ID is required');
    }

    if (!request.currentPassword?.trim()) {
      throw new ValidationError('Current password is required');
    }

    if (!request.newPassword?.trim()) {
      throw new ValidationError('New password is required');
    }

    if (request.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    if (request.currentPassword === request.newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(request.newPassword)) {
      throw new ValidationError(
        'New password must contain at least one lowercase letter, one uppercase letter, and one number'
      );
    }
  }
}