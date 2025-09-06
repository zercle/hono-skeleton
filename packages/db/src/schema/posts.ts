import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { users } from './users';

export const posts = pgTable('posts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: varchar('author_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Zod schemas for validation
export const insertPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  authorId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
