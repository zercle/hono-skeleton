export * from './users';

// Export all schema tables for Drizzle
import { users } from './users';

export const schema = {
  users,
};

// Type helpers
export type DbSchema = typeof schema;