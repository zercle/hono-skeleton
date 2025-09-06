import { z } from 'zod';
import { commonSchemas } from '@/shared/utils/validation';

// Request schemas
export const RegisterRequestSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  password: commonSchemas.password,
});

export const LoginRequestSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
});

// Response schemas
export const UserProfileSchema = z.object({
  id: commonSchemas.id,
  email: commonSchemas.email,
  name: commonSchemas.name,
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuthenticatedUserSchema = z.object({
  user: UserProfileSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const UserListResponseSchema = z.object({
  data: z.array(UserProfileSchema),
  pagination: PaginationSchema,
});

// Success response wrapper
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.literal('success'),
    data: dataSchema,
  });

// Error response schema
export const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  code: z.number().optional(),
  data: z.any().optional(),
});

// Fail response schema
export const FailResponseSchema = z.object({
  status: z.literal('fail'),
  data: z.record(z.any()),
});

// Type exports
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type TokenPair = z.infer<typeof TokenPairSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;