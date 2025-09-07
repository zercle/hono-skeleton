import 'reflect-metadata';
import { createApp } from './app';
import { container } from 'tsyringe';
import {
  ConfigToken,
  UserRepositoryToken,
  RegisterUserUseCaseToken,
  LoginUserUseCaseToken,
  PostRepositoryToken,
  CreatePostUseCaseToken,
  GetPostUseCaseToken,
  ListPostsUseCaseToken,
  UpdatePostUseCaseToken,
  DeletePostUseCaseToken,
  HealthCheckServiceToken,
} from '@zercle/shared/container/tokens';
import { ConfigService } from './infrastructure/config/config.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user-repository-impl';
import { PgPostRepository } from './infrastructure/repositories/pg-post-repository';
import { RegisterUserUseCase } from './domains/auth/usecases/register-user';
import { LoginUserUseCase } from './domains/auth/usecases/login-user';
import { CreatePostUseCase } from './domains/posts/usecases/create-post';
import { GetPostUseCase } from './domains/posts/usecases/get-post';
import { ListPostsUseCase } from './domains/posts/usecases/list-posts';
import { UpdatePostUseCase } from './domains/posts/usecases/update-post';
import { DeletePostUseCase } from './domains/posts/usecases/delete-post';
import { HealthCheckService } from './infrastructure/health/health-check.service';
import { IConfigService } from './infrastructure/config/config.interface';
import { createConnectionManager } from '@zercle/db/connection-manager';

// Register core services
container.registerSingleton(ConfigToken, ConfigService);
container.registerSingleton(HealthCheckServiceToken, HealthCheckService);

// Register auth domain
container.registerSingleton(UserRepositoryToken, UserRepositoryImpl);
container.registerSingleton(RegisterUserUseCaseToken, RegisterUserUseCase);
container.registerSingleton(LoginUserUseCaseToken, LoginUserUseCase);

// Register posts domain
container.registerSingleton(PostRepositoryToken, PgPostRepository);
container.registerSingleton(CreatePostUseCaseToken, CreatePostUseCase);
container.registerSingleton(GetPostUseCaseToken, GetPostUseCase);
container.registerSingleton(ListPostsUseCaseToken, ListPostsUseCase);
container.registerSingleton(UpdatePostUseCaseToken, UpdatePostUseCase);
container.registerSingleton(DeletePostUseCaseToken, DeletePostUseCase);

async function startServer() {
  try {
    const configService = container.resolve<IConfigService>(ConfigToken);
    const port = configService.get<number>('server.port');
    
    // Initialize database connection manager
    const databaseUrl = configService.get<string>('database.url');
    const connectionManager = createConnectionManager({
      url: databaseUrl,
      maxConnections: 20,
      idleTimeout: 30,
      connectionTimeout: 10,
      statementTimeout: 30,
    });

    console.log('Initializing database connection...');
    await connectionManager.connect();
    console.log('Database connection established successfully');

    console.log(`Server starting on port ${port}`);

    const appInstance = createApp(); // Create the app instance using the registered services

    const server = Bun.serve({
      fetch: appInstance.fetch,
      port,
    });

    console.log(`Server running on port ${port}`);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, initiating graceful shutdown...');
      await gracefulShutdown(connectionManager);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, initiating graceful shutdown...');
      await gracefulShutdown(connectionManager);
    });

    return server;

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(connectionManager: any) {
  try {
    console.log('Starting graceful shutdown...');
    
    // Close database connections
    await connectionManager.gracefulShutdown(30000);
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
