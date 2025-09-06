// Unit tests for the authentication use-case.
import 'reflect-metadata';
import { AuthUseCase } from '../usecases/auth.usecase';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { User } from '../models/user.model';
import * as bcrypt from 'bcryptjs';
import { AppConfig } from '../../../shared/config/app.config';

// Mock AppConfig for tests
AppConfig.jwtSecret = 'test-secret';
AppConfig.jwtExpiresIn = '1h';
AppConfig.jwtRefreshSecret = 'test-refresh-secret';
AppConfig.jwtRefreshExpiresIn = '7d';

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    authUseCase = new AuthUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const hashedPassword = await bcrypt.hash(registerRequest.password, 10);
      const createdUser: User = {
        id: 'user123',
        email: registerRequest.email,
        password: hashedPassword,
        name: registerRequest.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await authUseCase.register(registerRequest);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerRequest.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerRequest.email,
          name: registerRequest.name,
        }),
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerRequest.email);
    });

    it('should throw an error if user already exists', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user123',
        email: registerRequest.email,
        password: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authUseCase.register(registerRequest)).rejects.toThrow('User already exists with this email');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in a user and return tokens with correct credentials', async () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginRequest.password, 10);
      const existingUser: User = {
        id: 'user123',
        email: loginRequest.email,
        password: hashedPassword,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await authUseCase.login(loginRequest);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginRequest.email);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginRequest.email);
    });

    it('should throw an error for invalid email', async () => {
      const loginRequest = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authUseCase.login(loginRequest)).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error for invalid password', async () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const existingUser: User = {
        id: 'user123',
        email: loginRequest.email,
        password: hashedPassword,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authUseCase.login(loginRequest)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for a valid refresh token', async () => {
      const userId = 'user123';
      const refreshToken = authUseCase['generateRefreshToken'](userId); // Access private method for testing

      const existingUser: User = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      const result = await authUseCase.refreshToken(refreshToken);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(userId);
    });

    it('should throw an error for an invalid refresh token', async () => {
      const invalidToken = 'invalid.token.here';
      await expect(authUseCase.refreshToken(invalidToken)).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw an error if user not found for refresh token', async () => {
      const userId = 'nonexistentUser';
      const refreshToken = authUseCase['generateRefreshToken'](userId);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authUseCase.refreshToken(refreshToken)).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return userId', async () => {
      const userId = 'user123';
      const token = authUseCase['generateToken'](userId); // Access private method for testing

      const result = await authUseCase.verifyToken(token);

      expect(result).toEqual({ userId });
    });

    it('should return null for an invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const result = await authUseCase.verifyToken(invalidToken);
      expect(result).toBeNull();
    });

    it('should return null for an expired token', async () => {
      // Temporarily set a very short expiry for testing
      AppConfig.jwtExpiresIn = '1ms';
      const userId = 'user123';
      const token = authUseCase['generateToken'](userId);

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await authUseCase.verifyToken(token);
      expect(result).toBeNull();

      // Reset expiry
      AppConfig.jwtExpiresIn = '1h';
    });
  });
});