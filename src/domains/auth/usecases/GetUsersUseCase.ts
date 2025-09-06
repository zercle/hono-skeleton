import { injectable, inject } from 'tsyringe';
import type { UseCase, PaginatedResponse } from '@/shared/types/common';
import type { UserRepository } from '../repositories/UserRepository';
import type { UserProfile } from '../entities/User';
import { TOKENS } from '@/shared/container/tokens';
import { ValidationError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';

export interface GetUsersRequest {
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  users: PaginatedResponse<UserProfile>;
}

@injectable()
export class GetUsersUseCase implements UseCase<GetUsersRequest, GetUsersResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: UserRepository,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async execute(request: GetUsersRequest): Promise<GetUsersResponse> {
    const page = request.page || 1;
    const limit = Math.min(request.limit || 10, 100); // Max 100 per page
    const offset = (page - 1) * limit;

    this.logger.debug('Getting users list', { page, limit, offset });

    // Validate request
    this.validateRequest({ page, limit });

    // Get users and total count
    const [users, total] = await Promise.all([
      this.userRepository.findAllWithoutPasswords(limit, offset),
      this.userRepository.countTotal(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const paginatedResponse: PaginatedResponse<UserProfile> = {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    this.logger.debug('Users list retrieved', { 
      count: users.length, 
      total, 
      page, 
      totalPages 
    });

    return { users: paginatedResponse };
  }

  private validateRequest(request: { page: number; limit: number }): void {
    if (request.page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }

    if (request.limit < 1 || request.limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }
  }
}