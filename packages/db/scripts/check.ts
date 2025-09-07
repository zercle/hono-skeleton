#!/usr/bin/env bun

import postgres from 'postgres';
import 'dotenv/config'; // Load environment variables from .env file

async function checkDbConnection() {
  const databaseUrl = process.env['DB_URL'];

  if (!databaseUrl) {
    console.error('DB_URL environment variable is required.');
    process.exit(1);
  }

  let client: postgres.Sql | undefined;
  try {
    // Use a short-lived connection for the check
    client = postgres(databaseUrl, {
      max: 1, // Only need one connection for this check
      connect_timeout: 5, // 5 seconds timeout
    });

    await client`SELECT 1`;
    console.log('DB_OK');
    process.exit(0);
  } catch (error) {
    console.error('DB connection check failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkDbConnection();