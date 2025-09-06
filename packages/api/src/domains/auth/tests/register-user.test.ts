import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { RegisterUserUseCase } from '../usecases/register-user';
import { IUserRepository } from '../repositories/user-repository';
import { IConfigService } from '../../../infrastructure/config/config.interface';
import { User } from '../entities/user';

// Mock dependencies
const mockUserRepository: IUserRepository = {
  create: mock(() => Promise.resolve({} as User)),
  findByEmail: mock(() => Promise.resolve(null)),
  findById: mock(() => Promise.resolve(null)),
};

const mockConfigService: IConfigService = {
  get: mock((key: string) => {
    if (key === 'bcrypt.rounds') return 10;
    return 'mock-value';
  }),
};

describe('RegisterUserUseCase - unit', () => {
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    registerUserUseCase = new RegisterUserUseCase(
      mockUserRepository,
      mockConfigService
    );
    // Reset mocks
    mock.restore();
  });

  it('should register a new user successfully', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(null));
    mockUserRepository.create = mock(() => Promise.resolve(mockUser));

    const result = await registerUserUseCase.execute(input);

    expect(result).toEqual({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'test@example.com'
    );
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('should throw error if user already exists', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const existingUser: User = {
      id: 'existing-id',
      email: 'test@example.com',
      passwordHash: 'existing-hash',
      name: 'Existing User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(existingUser));

    expect(registerUserUseCase.execute(input)).rejects.toThrow(
      'User already exists'
    );
  });
});
