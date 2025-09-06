import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { Container } from '@/shared/container/container';
import { configService } from '@/infrastructure/config/env';
import { corsMiddleware } from '@/infrastructure/middleware/cors';
import { requestIdMiddleware, requestLoggerMiddleware, errorLoggerMiddleware } from '@/infrastructure/middleware/logger';
import { errorHandlerMiddleware, notFoundMiddleware } from '@/infrastructure/middleware/error';
import { authRoutes } from '@/domains/auth/routes/auth';
import { logger } from '@/infrastructure/logging/logger';

// Initialize dependency injection container
Container.initialize();

// Create the main app
const app = new OpenAPIHono();

// Global middleware
app.use('*', corsMiddleware);
app.use('*', requestIdMiddleware);
app.use('*', requestLoggerMiddleware);
app.use('*', errorLoggerMiddleware);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'success',
    data: {
      service: 'hono-skeleton',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: configService.get('NODE_ENV'),
      version: '1.0.0',
    },
  });
});

// API routes
app.route('/api/v1', authRoutes);

// OpenAPI documentation
if (configService.get('SWAGGER_ENABLED')) {
  app.doc('/api/v1/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: configService.get('API_TITLE'),
      version: configService.get('API_VERSION'),
      description: configService.get('API_DESCRIPTION'),
    },
    servers: [
      {
        url: configService.isDevelopment() ? 'http://localhost:3000' : 'https://api.example.com',
        description: configService.isDevelopment() ? 'Development server' : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        Bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  });

  app.get('/api/v1/docs', swaggerUI({ url: '/api/v1/openapi.json' }));
}

// Error handling middleware (must be last)
app.use('*', errorHandlerMiddleware);
app.use('*', notFoundMiddleware);

// Log successful app initialization
logger.info('Hono application initialized', {
  swagger: configService.get('SWAGGER_ENABLED'),
  environment: configService.get('NODE_ENV'),
});

export default app;