import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { container } from 'tsyringe';
import { ConfigToken } from '../../shared/src/container/tokens';
import { IConfigService } from '../../api/src/infrastructure/config/config.interface';
import { DatabaseConnectionManager, getConnectionManager } from './connection-manager';

// Legacy client variables for backward compatibility
let drizzleDb: PostgresJsDatabase<typeof schema>;
let pgClient: postgres.Sql;

// Function to get or create the Drizzle DB client instance
// This allows external scripts or tests to pass their own client instance,
// or for the application to use the DI-managed client.
export function getDbClient(client?: postgres.Sql) {
  // Use connection manager if available (production)
  const connectionManager = getConnectionManager();
  if (connectionManager && connectionManager.isHealthy()) {
    return connectionManager.getClient();
  }

  // Fallback to legacy behavior for backward compatibility
  if (drizzleDb) {
    return drizzleDb;
  }

  // If no client is provided, resolve DB_URL via DI for application use
  // For scripts, they should ideally create and pass their own client
  if (!client) {
    const configService = container.resolve<IConfigService>(ConfigToken);
    const databaseUrl = configService.get<string>('database.url');
    pgClient = postgres(databaseUrl);
  } else {
    pgClient = client;
  }

  drizzleDb = drizzle(pgClient, { schema });
  return drizzleDb;
}

// Export the 'end' function for explicit connection closing, primarily for scripts
// This ensures that scripts can gracefully terminate their database connections.
export async function endDbClient() {
  // Close connection manager if available
  const connectionManager = getConnectionManager();
  if (connectionManager) {
    await connectionManager.disconnect();
    return;
  }

  // Fallback to legacy cleanup
  if (pgClient) {
    await pgClient.end();
    // Reset drizzleDb and pgClient after ending the connection
    (drizzleDb as any) = undefined;
    (pgClient as any) = undefined;
  }
}

// Export the default db instance for direct use in the application
// This will lazily initialize the client using the DI container.
// In test environments, we avoid eager initialization to allow DI overrides.
export const db = process.env.NODE_ENV === 'test' ? ({} as PostgresJsDatabase<typeof schema>) : getDbClient();