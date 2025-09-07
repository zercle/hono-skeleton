import postgres from 'postgres';
import * as schema from './schema';
export declare const queryClient: postgres.Sql<{}>;
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>;
export * from './schema';
export { sql } from 'drizzle-orm';
//# sourceMappingURL=index.d.ts.map