import { z } from 'zod';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});