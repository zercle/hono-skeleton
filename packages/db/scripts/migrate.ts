#!/usr/bin/env bun

import { Client } from 'postgres';
import fs from 'fs/promises';
import path from 'path';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client(databaseUrl);

  try {
    await client.connect();

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // Get list of already executed migrations
    const executedMigrationsResult = await client.query<{
      name: string;
    }>('SELECT name FROM _migrations ORDER BY executed_at ASC');
    const executedMigrations = new Set(
      executedMigrationsResult.rows.map(row => row.name)
    );

    // Read migration files from the migrations directory
    const migrationsDir = path.join(import.meta.dir, '../migrations');
    const migrationFiles = await fs.readdir(migrationsDir);

    // Filter and sort migration files
    const sqlMigrations = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Execute pending migrations
    for (const fileName of sqlMigrations) {
      if (executedMigrations.has(fileName)) {
        console.log(`Migration ${fileName} already executed, skipping`);
        continue;
      }

      console.log(`Executing migration ${fileName}...`);

      const migrationPath = path.join(migrationsDir, fileName);
      const migrationSql = await fs.readFile(migrationPath, 'utf-8');

      try {
        await client.query(migrationSql);

        // Record migration as executed
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [
          fileName,
        ]);

        console.log(`Migration ${fileName} executed successfully`);
      } catch (error) {
        console.error(`Failed to execute migration ${fileName}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
