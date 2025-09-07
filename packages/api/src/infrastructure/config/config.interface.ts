export interface IConfigService {
  get<T>(key: string): T;
}

export interface DatabaseConfig {
  host?: string;
  port?: number;
  name?: string;
  user?: string;
  password?: string;
  url?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface BcryptConfig {
  rounds: number;
}

export interface ServerConfig {
  port: number;
  host: string;
}

export interface LoggingConfig {
  level: string;
}

export interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  url?: string;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  cache?: CacheConfig;
  jwt: JwtConfig;
  bcrypt: BcryptConfig;
  logging: LoggingConfig;
  cors?: CorsConfig;
}

export interface CorsConfig {
  origins: string[];
}
