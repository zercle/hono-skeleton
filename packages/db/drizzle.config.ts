import { defineConfig } from 'drizzle-kit';

function getDatabaseUrl(): string {
  // Prefer DB_* environment variables, fallback to DB_URL
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  // If all required DB_* variables are present, assemble connection string
  if (dbHost && dbPort && dbName && dbUser) {
    const password = dbPassword ? `:${dbPassword}` : '';
    return `postgres://${dbUser}${password}@${dbHost}:${dbPort}/${dbName}`;
  }

  // Fallback to DB_URL or default
  return (
    process.env.DB_URL ||
    'postgres://postgres:postgres@localhost:5432/hono_skeleton'
  );
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
