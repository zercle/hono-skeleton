import { describe, it, expect } from 'bun:test';
import {
  isValidEmail,
  isValidUUID,
  ValidationError,
  NotFoundError,
} from './index';

describe('Shared Utils - unit', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
    });
  });

  describe('Custom Error Classes', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid field', 'email');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid field');
      expect(error.field).toBe('email');
    });

    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource not found');
    });
  });
});
