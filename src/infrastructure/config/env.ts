import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables
config();

const envSchema = z.object({
  // Server Configuration
  PORT: z.string().transform(val => parseInt(val, 10)).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),

  // Database Configuration
  DATABASE_URL: z.string().url('Invalid database URL'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Redis (Optional)
  REDIS_URL: z.string().optional(),

  // CORS Configuration
  CORS_ORIGINS: z.string().default('*'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('false'),

  // API Documentation
  SWAGGER_ENABLED: z.string().transform(val => val === 'true').default('true'),
  API_TITLE: z.string().default('Hono Skeleton API'),
  API_VERSION: z.string().default('1.0.0'),
  API_DESCRIPTION: z.string().default('Production-ready Hono.js backend with Clean Architecture'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_PRETTY: z.string().transform(val => val === 'true').default('false'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),

  // Security
  BCRYPT_ROUNDS: z.string().transform(val => parseInt(val, 10)).default('12'),
  PASSWORD_MIN_LENGTH: z.string().transform(val => parseInt(val, 10)).default('8'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).default('10485760'), // 10MB
  UPLOAD_PATH: z.string().default('uploads/'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class ConfigService {
  private config: EnvConfig;

  constructor() {
    try {
      this.config = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors
          .filter(err => err.code === 'invalid_type' || err.code === 'invalid_string')
          .map(err => err.path.join('.'))
          .join(', ');
        
        console.error(`❌ Invalid environment configuration: ${missingVars}`);
        console.error('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
      }
      throw error;
    }
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  getAll(): EnvConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  getCorsOrigins(): string[] {
    const origins = this.config.CORS_ORIGINS;
    if (origins === '*') {
      return ['*'];
    }
    return origins.split(',').map(origin => origin.trim());
  }
}

export const configService = new ConfigService();