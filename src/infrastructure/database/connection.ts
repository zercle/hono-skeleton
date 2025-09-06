import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { configService } from '@/infrastructure/config/env';
import type { Logger } from '@/shared/types/common';

// Create the connection
const connectionString = configService.get('DATABASE_URL');

const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(queryClient);

export class DatabaseService {
  private static instance: DatabaseService;
  private connectionHealthy = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async checkConnection(logger?: Logger): Promise<boolean> {
    try {
      await queryClient`SELECT 1`;
      this.connectionHealthy = true;
      logger?.info('Database connection established successfully');
      return true;
    } catch (error) {
      this.connectionHealthy = false;
      logger?.error('Database connection failed', error as Error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await queryClient.end();
      this.connectionHealthy = false;
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }

  isHealthy(): boolean {
    return this.connectionHealthy;
  }

  getClient() {
    return queryClient;
  }

  getDb() {
    return db;
  }
}

export const databaseService = DatabaseService.getInstance();