#!/usr/bin/env bun

import { Client } from 'postgres';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client(databaseUrl);

  try {
    await client.connect();

    // Check if test user already exists
    const existingUser = await client.query<{
      id: string;
      email: string;
    }>('SELECT id, email FROM users WHERE email = $1', ['test@example.com']);

    if (existingUser.rows.length > 0) {
      console.log('Test user already exists');
      console.log(`Email: test@example.com`);
      console.log(`User ID: ${existingUser.rows[0].id}`);
      return;
    }

    // Hash the test password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert test user
    const newUser = await client.query<{
      id: string;
    }>(
      'INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING id',
      [uuidv4(), 'test@example.com', passwordHash, 'Test User']
    );

    console.log('Test user created successfully');
    console.log(`Email: test@example.com`);
    console.log(`Password: password123`);
    console.log(`User ID: ${newUser.rows[0].id}`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
