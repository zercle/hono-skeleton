export interface IConfigService {
  get<T>(key: string): T;
}

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  url: string;
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

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  bcrypt: BcryptConfig;
  logging: LoggingConfig;
}
