import { injectable } from 'tsyringe';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import {
  IConfigService,
  AppConfig,
  type DatabaseConfig,
  type JwtConfig,
  type BcryptConfig,
  type ServerConfig,
  type LoggingConfig,
  type CorsConfig,
  type CacheConfig,
} from './config.interface';

@injectable()
export class ConfigService implements IConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    // Load .env variables
    dotenv.config();

    // 1. Load default YAML config
    const defaultConfigPath = resolve(
      process.cwd(),
      'packages/api/config/default.yaml'
    );
    let config: AppConfig = yaml.load(
      readFileSync(defaultConfigPath, 'utf8')
    ) as AppConfig;

    // 2. Load environment-specific YAML config if NODE_ENV is set
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv) {
      const envConfigPath = resolve(
        process.cwd(),
        `packages/api/config/${nodeEnv}.yaml`
      );
      try {
        const envConfig = yaml.load(
          readFileSync(envConfigPath, 'utf8')
        ) as Partial<AppConfig>;
        // Deep merge environment-specific config over default
        config = this.deepMerge(config, envConfig);
      } catch (error) {
        console.warn(`[ConfigService] Warning: Could not load environment config file for NODE_ENV=${nodeEnv} at ${envConfigPath}. Proceeding with base config.`, error);
      }
    }

    // 3. Merge in values from process.env (override all YAML values)
    const mergedEnvConfig: AppConfig = {
      ...config, // Start with the merged YAML config
      server: {
        ...config.server,
        port: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : config.server.port,
        host: process.env['HOST'] || config.server.host,
      },
      database: this.buildDatabaseConfig(config.database),
      jwt: {
        ...config.jwt,
        secret: process.env['JWT_SECRET'] || config.jwt.secret,
        expiresIn: process.env['JWT_EXPIRES_IN'] || config.jwt.expiresIn,
      },
      bcrypt: {
        ...config.bcrypt,
        rounds: process.env['BCRYPT_ROUNDS'] ? parseInt(process.env['BCRYPT_ROUNDS'], 10) : config.bcrypt.rounds,
      },
      logging: {
        ...config.logging,
        level: process.env['LOG_LEVEL'] || config.logging.level,
      },
      cache: this.buildCacheConfig(config.cache),
      // Add CORS origins from env if provided, splitting by comma
      cors: {
        ...config.cors,
        origins: process.env['CORS_ORIGINS'] ? process.env['CORS_ORIGINS'].split(',').map(s => s.trim()) : (config.cors?.origins || []), // Ensure it's always string[]
      },
    };

    return mergedEnvConfig;
  }

  private buildDatabaseConfig(baseConfig: DatabaseConfig): DatabaseConfig {
    // Prefer DB_* environment variables, fallback to DB_URL, then base config
    const dbHost = process.env['DB_HOST'];
    const dbPort = process.env['DB_PORT'];
    const dbName = process.env['DB_NAME'];
    const dbUser = process.env['DB_USER'];
    const dbPassword = process.env['DB_PASSWORD'];

    // If all required DB_* variables are present, assemble connection string
    if (dbHost && dbPort && dbName && dbUser) {
      const password = dbPassword ? `:${dbPassword}` : '';
      const assembledUrl = `postgres://${dbUser}${password}@${dbHost}:${dbPort}/${dbName}`;
      
      return {
        ...baseConfig,
        host: dbHost,
        port: parseInt(dbPort, 10),
        name: dbName,
        user: dbUser,
        password: dbPassword,
        url: assembledUrl,
      };
    }

    // Fallback to DB_URL if provided
    const dbUrl = process.env['DB_URL'] || baseConfig.url;
    if (!dbUrl) {
      throw new Error('Database configuration incomplete: either provide DB_* variables (DB_HOST, DB_PORT, DB_NAME, DB_USER) or DB_URL');
    }

    return {
      ...baseConfig,
      url: dbUrl,
    };
  }

  private buildCacheConfig(baseConfig?: CacheConfig): CacheConfig | undefined {
    // Cache is optional, return undefined if no configuration provided
    const valkeyHost = process.env['VALKEY_HOST'];
    const valkeyPort = process.env['VALKEY_PORT'];
    const valkeyPassword = process.env['VALKEY_PASSWORD'];
    const valkeyUrl = process.env['VALKEY_URL'];

    // If VALKEY_* variables are present, assemble configuration
    if (valkeyHost && valkeyPort) {
      const password = valkeyPassword ? `:${valkeyPassword}` : '';
      const assembledUrl = `redis://${password ? password + '@' : ''}${valkeyHost}:${valkeyPort}/0`;
      
      return {
        ...baseConfig,
        host: valkeyHost,
        port: parseInt(valkeyPort, 10),
        password: valkeyPassword,
        url: assembledUrl,
      };
    }

    // Fallback to VALKEY_URL if provided
    if (valkeyUrl) {
      return {
        ...baseConfig,
        url: valkeyUrl,
      };
    }

    // If base config exists, use it
    if (baseConfig) {
      return baseConfig;
    }

    // Cache is optional, return undefined if no configuration
    return undefined;
  }

  // Helper for deep merging objects
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target } as T;

    if (target && typeof target === 'object' && source && typeof source === 'object') {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
            output[key] = this.deepMerge(target[key], source[key] as Partial<T[Extract<keyof T, string>]>);
          } else {
            output[key] = source[key] as T[Extract<keyof T, string>];
          }
        }
      }
    }

    return output;
  }

  get<T>(key: string): T {
    const value = key.split('.').reduce((o: any, i) => o[i], this.config);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" not found.`);
    }
    return value as T;
  }
}
