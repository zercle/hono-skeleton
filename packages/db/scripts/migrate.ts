#!/usr/bin/env bun

import { Client } from 'pg';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../src/client'; // Import the Drizzle client
import path from 'path';
import 'dotenv/config'; // Load environment variables from .env file

async function runMigrations() {
  const databaseUrl = process.env['DB_URL'];

  if (!databaseUrl) {
    console.error('DB_URL environment variable is required.');
    process.exit(1);
  }

  // Use path.resolve to ensure the migrations folder is found irrespective of CWD
  const migrationsFolder = path.resolve(__dirname, '..', 'migrations');

  console.log('Starting DB migration...');
  try {
    await migrate(db, { migrationsFolder });
    console.log('DB migration completed successfully.');
  } catch (error) {
    console.error('DB migration failed:', error);
    process.exit(1);
  } finally {
    // Ensure the connection is closed after migration
    // If 'db' client does not have an explicit 'end' method,
    // this might need to be adjusted based on its implementation.
    // Assuming 'db' is an instance of Drizzle that manages its own connection pool.
    // If db is instantiated with `postgres-js` directly, it might expose an `end` method.
    // For now, if db doesn't expose an end method, we rely on the process exiting.
    // If the underlying driver needs to be explicitly closed, uncomment and adjust:
    // await (db as any).end(); // Example if db has an end method
  }
}

runMigrations().catch(error => {
  console.error('Unexpected error during migration:', error);
  process.exit(1);
});
