import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, databaseService } from '@/infrastructure/database/connection';
import { logger } from '@/infrastructure/logging/logger';

async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    
    // Check database connection
    const isConnected = await databaseService.checkConnection(logger);
    if (!isConnected) {
      logger.error('Database connection failed, cannot run migrations');
      process.exit(1);
    }

    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    logger.info('Database migrations completed successfully');
    
    // Disconnect
    await databaseService.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', error as Error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();