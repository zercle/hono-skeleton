import { z } from 'zod';

export const CreatePostInputSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).nullable().optional(),
  published: z.boolean().optional().default(false),
});

export const UpdatePostInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  published: z.boolean().optional(),
});

export const PostResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PostListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for HTTP query parameters (strings from URL)
export const PostQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  published: z.string().optional().transform((val) => val === 'true'),
  authorId: z.string().uuid().optional(),
});

// Schema for internal use case queries (typed values)
export const InternalPostQuerySchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  published: z.boolean().optional(),
  authorId: z.string().uuid().optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
export type PostResponse = z.infer<typeof PostResponseSchema>;
export type PostListItem = z.infer<typeof PostListItemSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
export type InternalPostQuery = z.infer<typeof InternalPostQuerySchema>;