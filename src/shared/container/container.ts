import 'reflect-metadata';
import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Infrastructure
import { LoggerService, logger } from '@/infrastructure/logging/logger';
import { DatabaseService, databaseService } from '@/infrastructure/database/connection';
import { configService } from '@/infrastructure/config/env';

export class Container {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {
      return;
    }

    // Register infrastructure services
    container.registerInstance(TOKENS.Logger, logger);
    container.registerInstance(TOKENS.DatabaseService, databaseService);
    container.registerInstance(TOKENS.ConfigService, configService);

    // Register domain services
    this.registerAuthDomain();
    
    // Register other domains here
    // this.registerPostsDomain();
    
    this.initialized = true;
    logger.info('Dependency injection container initialized');
  }

  private static registerAuthDomain(): void {
    // Note: Auth domain services will be registered when they are first resolved
    // This is because we're using lazy loading with dynamic imports in the route handlers
    logger.debug('Auth domain services will be registered on-demand');
  }

  // Example for future domains
  // private static registerPostsDomain(): void {
  //   // Posts domain registrations
  //   logger.debug('Posts domain services registered');
  // }

  static getInstance() {
    if (!this.initialized) {
      this.initialize();
    }
    return container;
  }

  static resolve<T>(token: symbol): T {
    return this.getInstance().resolve(token);
  }

  static registerSingleton<T>(token: symbol, implementation: new (...args: any[]) => T): void {
    container.registerSingleton(token, implementation);
  }

  static registerInstance<T>(token: symbol, instance: T): void {
    container.registerInstance(token, instance);
  }

  static reset(): void {
    container.clearInstances();
    this.initialized = false;
  }
}

// Export the container instance for direct use when needed
export const diContainer = Container.getInstance();