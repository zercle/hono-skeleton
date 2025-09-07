import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DB_URL ||
  'postgres://postgres:postgres@localhost:5432/hono_skeleton';

// Disable prepare for database connectivity issues
export const queryClient = postgres(connectionString, { prepare: false });
export const db = drizzle(queryClient, { schema });

export * from './schema';
export { sql } from 'drizzle-orm';
