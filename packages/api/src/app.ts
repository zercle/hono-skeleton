import 'reflect-metadata'; // Must be first import for tsyringe
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { container as defaultContainer, DependencyContainer } from 'tsyringe';
import {
  ConfigToken,
  LoggerToken,
  UserRepositoryToken,
  RegisterUserUseCaseToken,
  LoginUserUseCaseToken,
} from '@zercle/shared/container/tokens';
import { ConfigService } from './infrastructure/config/config.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user-repository-impl';
import { RegisterUserUseCase } from './domains/auth/usecases/register-user';
import { LoginUserUseCase } from './domains/auth/usecases/login-user';
import { registerAuthRoutes } from './domains/auth/routes';
import { registerPostsRoutes } from './domains/posts/routes';
import { registerHealthRoutes } from './routes/health'; // Import registerHealthRoutes
import { loggerMiddleware } from './middleware/logging';
import { errorHandler } from './middleware/error';

export function createApp(diContainer: DependencyContainer = defaultContainer) {

  // Create the Hono app
  const app = new OpenAPIHono();

  // Middleware
  app.use(cors());
  app.use(loggerMiddleware(diContainer)); // Apply logging middleware early, pass diContainer
  app.use(errorHandler); // Apply error handling middleware to catch unhandled errors

  // Register routes under /api prefix
  const apiRoutes = new OpenAPIHono();
  registerAuthRoutes(apiRoutes, diContainer);
  registerPostsRoutes(apiRoutes, diContainer);
  registerHealthRoutes(apiRoutes, diContainer); // Register health routes
  
  // Mount the API routes under /api prefix
  app.route('/api', apiRoutes);

  // OpenAPI Docs
  // Serve OpenAPI spec (after all routes are registered to include them)
  app.get('/openapi.json', (c) => {
    // Get OpenAPI spec from main app which includes the nested routes
    return c.json(app.getOpenAPISpec());
  });

  // Serve Swagger UI
  app.get('/docs', swaggerUI({
    url: '/openapi.json', // Point to the served OpenAPI spec
  }));

  // Generate the OpenAPI spec for the doc endpoint (used by swaggerUI)
  app.doc('/docs/openapi.json', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Hono Clean Architecture API',
    },
  });

  return app;
}

export default createApp(); // Export the default app instance
export type AppType = ReturnType<typeof createApp>; // Export type for app
