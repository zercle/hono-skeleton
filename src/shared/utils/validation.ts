import { z } from 'zod';
import { ValidationError } from '@/shared/types/errors';

export const commonSchemas = {
  id: z.string().uuid('Invalid UUID format'),
  
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .trim(),
  
  pagination: z.object({
    page: z
      .string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'Page must be greater than 0')
      .default('1'),
    limit: z
      .string()
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .default('10'),
  }),
  
  timestamp: z.string().datetime('Invalid timestamp format'),
  
  optionalString: z.string().optional(),
  
  nonEmptyString: z.string().min(1, 'Field is required').trim(),
  
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  
  url: z.string().url('Invalid URL format').optional(),
};

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError ? firstError.message : 'Validation failed'
      );
    }
    throw error;
  }
}

export function createPaginationParams(query: Record<string, string | undefined>) {
  return validateSchema(commonSchemas.pagination, query);
}

export const createUserSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  password: commonSchemas.password,
});

export const updateUserSchema = z.object({
  name: commonSchemas.name.optional(),
  email: commonSchemas.email.optional(),
});

export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type PaginationParams = z.infer<typeof commonSchemas.pagination>;