import { describe, test, expect } from 'bun:test';
import { CryptoHelper } from './crypto';

describe('CryptoHelper', () => {
  describe('Password hashing and comparison', () => {
    test('should hash password and verify correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await CryptoHelper.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      
      const isValid = await CryptoHelper.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await CryptoHelper.hashPassword(password);
      
      const isValid = await CryptoHelper.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await CryptoHelper.hashPassword(password);
      const hash2 = await CryptoHelper.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      
      // But both should validate correctly
      expect(await CryptoHelper.comparePassword(password, hash1)).toBe(true);
      expect(await CryptoHelper.comparePassword(password, hash2)).toBe(true);
    });
  });

  describe('ID generation', () => {
    test('should generate valid UUIDv7', () => {
      const id = CryptoHelper.generateId();
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
      
      // UUIDv7 format check (basic)
      const uuidv7Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidv7Regex.test(id)).toBe(true);
    });

    test('should generate unique IDs', () => {
      const id1 = CryptoHelper.generateId();
      const id2 = CryptoHelper.generateId();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('JWT token operations', () => {
    test('should generate and verify access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
      };

      const token = CryptoHelper.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      
      const decoded = CryptoHelper.verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should generate token pair', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
      };

      const tokenPair = CryptoHelper.generateTokenPair(payload);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
      
      // Both tokens should be valid
      const accessDecoded = CryptoHelper.verifyToken(tokenPair.accessToken);
      const refreshDecoded = CryptoHelper.verifyToken(tokenPair.refreshToken);
      
      expect(accessDecoded.userId).toBe(payload.userId);
      expect(refreshDecoded.userId).toBe(payload.userId);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        CryptoHelper.verifyToken('invalid-token');
      }).toThrow('Token verification failed');
    });

    test('should extract token from header', () => {
      const token = 'test-token-123';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = CryptoHelper.extractTokenFromHeader(authHeader);
      
      expect(extractedToken).toBe(token);
    });

    test('should return null for invalid header', () => {
      expect(CryptoHelper.extractTokenFromHeader('')).toBeNull();
      expect(CryptoHelper.extractTokenFromHeader(undefined)).toBeNull();
      expect(CryptoHelper.extractTokenFromHeader('Invalid header')).toBeNull();
    });
  });

  describe('Random string generation', () => {
    test('should generate random string of specified length', () => {
      const length = 16;
      const randomString = CryptoHelper.generateRandomString(length);
      
      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
      expect(typeof randomString).toBe('string');
    });

    test('should generate different strings', () => {
      const string1 = CryptoHelper.generateRandomString(32);
      const string2 = CryptoHelper.generateRandomString(32);
      
      expect(string1).not.toBe(string2);
    });

    test('should generate OTP code', () => {
      const otp = CryptoHelper.generateOTP();
      
      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    test('should generate OTP of specified length', () => {
      const length = 4;
      const otp = CryptoHelper.generateOTP(length);
      
      expect(otp.length).toBe(length);
      expect(/^\d+$/.test(otp)).toBe(true);
    });
  });
});