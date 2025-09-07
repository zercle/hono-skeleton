import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  password: string; // Changed from passwordHash
  name: string | null; // Changed to explicitly allow null
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
