import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export interface DatabaseConnectionConfig {
  url: string;
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  statementTimeout?: number;
}

export class DatabaseConnectionManager {
  private pgClient: postgres.Sql | null = null;
  private drizzleDb: PostgresJsDatabase<typeof schema> | null = null;
  private connectionConfig: DatabaseConnectionConfig;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(config: DatabaseConnectionConfig) {
    this.connectionConfig = {
      maxConnections: 20,
      idleTimeout: 30,
      connectionTimeout: 10,
      statementTimeout: 30,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.pgClient && this.drizzleDb) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishConnection();
    await this.connectionPromise;
    this.connectionPromise = null;
  }

  private async establishConnection(): Promise<void> {
    try {
      this.pgClient = postgres(this.connectionConfig.url, {
        max: this.connectionConfig.maxConnections!,
        idle_timeout: this.connectionConfig.idleTimeout!,
        connect_timeout: this.connectionConfig.connectionTimeout!,
        statement_timeout: this.connectionConfig.statementTimeout! * 1000,
        onnotice: () => {}, // Suppress connection notices in production
      });

      this.drizzleDb = drizzle(this.pgClient, { schema });
      
      // Test the connection
      await this.healthCheck();
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      await this.cleanup();
      throw new Error(`Failed to establish database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    if (this.pgClient) {
      try {
        await this.pgClient.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
      this.pgClient = null;
    }
    this.drizzleDb = null;
    this.isConnected = false;
  }

  getClient(): PostgresJsDatabase<typeof schema> {
    if (!this.isConnected || !this.drizzleDb) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.drizzleDb;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number; error?: string }> {
    const startTime = Date.now();

    try {
      if (!this.pgClient) {
        return { status: 'unhealthy', latency: 0, error: 'No database connection' };
      }

      // Simple ping query to test connection
      await this.pgClient`SELECT 1 as ping`;
      const latency = Date.now() - startTime;

      return { status: 'healthy', latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { 
        status: 'unhealthy', 
        latency, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getConnectionStats(): Promise<{
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
  }> {
    if (!this.pgClient) {
      return { totalConnections: 0, idleConnections: 0, activeConnections: 0 };
    }

    try {
      const stats = await this.pgClient`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE state = 'idle') as idle,
          COUNT(*) FILTER (WHERE state = 'active') as active
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      const row = stats[0];
      return {
        totalConnections: parseInt(row?.total || '0'),
        idleConnections: parseInt(row?.idle || '0'),
        activeConnections: parseInt(row?.active || '0'),
      };
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return { totalConnections: 0, idleConnections: 0, activeConnections: 0 };
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.pgClient !== null && this.drizzleDb !== null;
  }

  async gracefulShutdown(timeoutMs: number = 30000): Promise<void> {
    console.log('Initiating graceful database shutdown...');
    
    const shutdownPromise = this.cleanup();
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Database shutdown timeout')), timeoutMs);
    });

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      console.log('Database shutdown completed successfully');
    } catch (error) {
      console.error('Database shutdown failed:', error);
      throw error;
    }
  }
}

let globalConnectionManager: DatabaseConnectionManager | null = null;

export function createConnectionManager(config: DatabaseConnectionConfig): DatabaseConnectionManager {
  if (globalConnectionManager) {
    throw new Error('Connection manager already exists. Use getConnectionManager() instead.');
  }
  globalConnectionManager = new DatabaseConnectionManager(config);
  return globalConnectionManager;
}

export function getConnectionManager(): DatabaseConnectionManager | null {
  return globalConnectionManager;
}

export async function closeConnectionManager(): Promise<void> {
  if (globalConnectionManager) {
    await globalConnectionManager.disconnect();
    globalConnectionManager = null;
  }
}