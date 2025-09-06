import { serve } from '@hono/node-server';
import app from './app';
import { configService } from '@/infrastructure/config/env';
import { databaseService } from '@/infrastructure/database/connection';
import { logger } from '@/infrastructure/logging/logger';

const port = configService.get('PORT');
const host = configService.get('HOST');

async function startServer() {
  try {
    // Check database connection
    logger.info('Checking database connection...');
    const isDbConnected = await databaseService.checkConnection(logger);
    
    if (!isDbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start the server
    logger.info('Starting server...', { port, host });
    
    serve({
      fetch: app.fetch,
      port,
      hostname: host,
    });

    logger.info(`🚀 Server running at http://${host}:${port}`);
    logger.info(`📚 API Documentation: http://${host}:${port}/api/v1/docs`);
    logger.info(`🏥 Health Check: http://${host}:${port}/health`);
    
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  
  try {
    await databaseService.disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  
  try {
    await databaseService.disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
  }
  
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise', reason as Error, { promise });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Start the server
startServer();