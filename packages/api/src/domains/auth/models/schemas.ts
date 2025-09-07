import { z } from 'zod';

export const RegisterUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().nullable().optional(), // Allow name to be string, null, or undefined
});

export const LoginUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable().optional(), // Allow name to be string, null, or undefined
  createdAt: z.date(),
  updatedAt: z.date(),
});
