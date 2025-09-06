import { injectable } from 'tsyringe';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import {
  IConfigService,
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  BcryptConfig,
  ServerConfig,
  LoggingConfig,
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

    // Load default YAML config
    const defaultConfigPath = resolve(
      process.cwd(),
      'packages/api/config/default.yaml'
    );
    const defaultConfig = yaml.load(
      readFileSync(defaultConfigPath, 'utf8')
    ) as AppConfig;

    // Merge with environment variables (process.env takes precedence)
    const mergedConfig: AppConfig = {
      ...defaultConfig,
      server: {
        ...defaultConfig.server,
        port: parseInt(
          process.env.PORT || defaultConfig.server.port.toString(),
          10
        ),
        host: process.env.HOST || defaultConfig.server.host,
      },
      database: {
        ...defaultConfig.database,
        url: process.env.DATABASE_URL || defaultConfig.database.url,
      },
      jwt: {
        ...defaultConfig.jwt,
        secret: process.env.JWT_SECRET || defaultConfig.jwt.secret,
        expiresIn: process.env.JWT_EXPIRES_IN || defaultConfig.jwt.expiresIn,
      },
      bcrypt: {
        ...defaultConfig.bcrypt,
        rounds: parseInt(
          process.env.BCRYPT_ROUNDS || defaultConfig.bcrypt.rounds.toString(),
          10
        ),
      },
      logging: {
        ...defaultConfig.logging,
        level: process.env.LOG_LEVEL || defaultConfig.logging.level,
      },
    };

    return mergedConfig;
  }

  get<T>(key: string): T {
    const value = key.split('.').reduce((o: any, i) => o[i], this.config);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" not found.`);
    }
    return value as T;
  }
}
