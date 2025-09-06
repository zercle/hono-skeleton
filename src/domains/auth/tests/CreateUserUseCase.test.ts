import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { CreateUserUseCase } from '../usecases/CreateUserUseCase';
import type { UserRepository } from '../repositories/UserRepository';
import type { User } from '../entities/User';
import { ConflictError, ValidationError } from '@/shared/types/errors';
import { LoggerService } from '@/infrastructure/logging/logger';

// Mock implementations
const mockUserRepository: UserRepository = {
  findById: mock(() => Promise.resolve(null)),
  findByEmail: mock(() => Promise.resolve(null)),
  findByIdWithoutPassword: mock(() => Promise.resolve(null)),
  findAll: mock(() => Promise.resolve([])),
  findAllWithoutPasswords: mock(() => Promise.resolve([])),
  create: mock(() => Promise.resolve({} as User)),
  createUser: mock(() => Promise.resolve({} as User)),
  update: mock(() => Promise.resolve(null)),
  updateUser: mock(() => Promise.resolve(null)),
  updateLastLogin: mock(() => Promise.resolve()),
  delete: mock(() => Promise.resolve(false)),
  changePassword: mock(() => Promise.resolve(false)),
  softDelete: mock(() => Promise.resolve(false)),
  countTotal: mock(() => Promise.resolve(0)),
};

const mockLogger = {
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
  debug: mock(() => {}),
} as LoggerService;

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockUserRepository).forEach(mockFn => {
      if (typeof mockFn === 'function' && 'mockClear' in mockFn) {
        (mockFn as any).mockClear();
      }
    });
    Object.values(mockLogger).forEach(mockFn => {
      if (typeof mockFn === 'function' && 'mockClear' in mockFn) {
        (mockFn as any).mockClear();
      }
    });

    createUserUseCase = new CreateUserUseCase(
      mockUserRepository as any,
      mockLogger
    );
  });

  test('should create user successfully', async () => {
    // Arrange
    const request = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
    };

    const mockCreatedUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findByEmail as any).mockResolvedValue(null);
    (mockUserRepository.createUser as any).mockResolvedValue(mockCreatedUser);

    // Act
    const result = await createUserUseCase.execute(request);

    // Assert
    expect(result.user).toEqual({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: mockCreatedUser.createdAt,
      updatedAt: mockCreatedUser.updatedAt,
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
      isActive: true,
      emailVerified: false,
    });
  });

  test('should throw ConflictError if user already exists', async () => {
    // Arrange
    const request = {
      email: 'existing@example.com',
      password: 'Test123!',
      name: 'Test User',
    };

    const existingUser: User = {
      id: 'existing-id',
      email: 'existing@example.com',
      password: 'hashed-password',
      name: 'Existing User',
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findByEmail as any).mockResolvedValue(existingUser);

    // Act & Assert
    expect(async () => {
      await createUserUseCase.execute(request);
    }).toThrow(ConflictError);
  });

  test('should throw ValidationError for invalid email', async () => {
    // Arrange
    const request = {
      email: 'invalid-email',
      password: 'Test123!',
      name: 'Test User',
    };

    // Act & Assert
    expect(async () => {
      await createUserUseCase.execute(request);
    }).toThrow(ValidationError);
  });

  test('should throw ValidationError for short password', async () => {
    // Arrange
    const request = {
      email: 'test@example.com',
      password: '123', // Too short
      name: 'Test User',
    };

    // Act & Assert
    expect(async () => {
      await createUserUseCase.execute(request);
    }).toThrow(ValidationError);
  });

  test('should throw ValidationError for missing name', async () => {
    // Arrange
    const request = {
      email: 'test@example.com',
      password: 'Test123!',
      name: '', // Empty name
    };

    // Act & Assert
    expect(async () => {
      await createUserUseCase.execute(request);
    }).toThrow(ValidationError);
  });
});