// Common types used across packages

export interface JSendResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface Config {
  server: {
    port: number;
    host: string;
  };
  database: {
    host?: string;
    port?: number;
    name?: string;
    user?: string;
    password?: string;
    url?: string;
  };
  cache?: {
    host?: string;
    port?: number;
    password?: string;
    url?: string;
  };
  auth: {
    jwt: {
      secret: string;
      expiresIn: string;
    };
  };
  cors: {
    origins: string[];
  };
}

// Domain interfaces
export interface UseCase<TRequest = any, TResponse = any> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface Repository<TEntity, TKey = string> {
  findById(id: TKey): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  create(
    entity: Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TEntity>;
  update(id: TKey, entity: Partial<TEntity>): Promise<TEntity | null>;
  delete(id: TKey): Promise<boolean>;
}
