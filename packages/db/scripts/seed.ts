#!/usr/bin/env bun

import { db } from '../src/client';
import { users } from '../src/schema/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import 'dotenv/config'; // Load environment variables from .env file

async function runSeed() {
  console.log('Starting DB seed...');

  const databaseUrl = process.env['DB_URL'];
  if (!databaseUrl) {
    console.error('DB_URL environment variable is required.');
    process.exit(1);
  }

  try {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (!existingAdmin) {
      console.log(`Seeding default admin user: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash('password', 10); // Hash a default password
      // Drizzle requires 'id' for insertion; generate a UUID
      await db.insert(users).values({
        id: crypto.randomUUID(), // Generate a UUID for the primary key
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
      });
      console.log('Default admin user seeded successfully.');
    } else {
      console.log(`Admin user ${adminEmail} already exists, skipping seed.`);
    }
  } catch (error) {
    console.error('DB seed failed:', error);
    process.exit(1);
  } finally {
    // Assuming 'db' instance manages its own connection pool and doesn't require explicit end()
    // If the underlying driver needs to be explicitly closed, uncomment and adjust:
    // await (db as any).end(); // Example if db has an end method
  }
  console.log('DB seed completed.');
}

runSeed().catch(error => {
  console.error('Unexpected error during seed:', error);
  process.exit(1);
});