import { db, databaseService } from '@/infrastructure/database/connection';
import { users } from '@/infrastructure/database/schemas';
import { CryptoHelper } from '@/shared/utils/crypto';
import { logger } from '@/infrastructure/logging/logger';

async function seedDatabase() {
  try {
    logger.info('Seeding database...');
    
    // Check database connection
    const isConnected = await databaseService.checkConnection(logger);
    if (!isConnected) {
      logger.error('Database connection failed, cannot seed database');
      process.exit(1);
    }

    // Create admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = await CryptoHelper.hashPassword('admin123');
    const adminId = CryptoHelper.generateId();

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        id: adminId,
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
        isActive: true,
        emailVerified: true,
      });

      logger.info('Admin user created', {
        email: adminEmail,
        password: 'admin123',
      });
    } else {
      logger.info('Admin user already exists');
    }

    // Create test user
    const testEmail = 'test@example.com';
    const testPassword = await CryptoHelper.hashPassword('test123');
    const testId = CryptoHelper.generateId();

    const existingTest = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (existingTest.length === 0) {
      await db.insert(users).values({
        id: testId,
        email: testEmail,
        password: testPassword,
        name: 'Test User',
        isActive: true,
        emailVerified: true,
      });

      logger.info('Test user created', {
        email: testEmail,
        password: 'test123',
      });
    } else {
      logger.info('Test user already exists');
    }

    logger.info('Database seeding completed');
    
    // Disconnect
    await databaseService.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', error as Error);
    process.exit(1);
  }
}

// Import eq from drizzle-orm (needed for the where clause)
import { eq } from 'drizzle-orm';

// Run seeding
seedDatabase();