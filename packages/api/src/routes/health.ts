import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { jsendSuccess, jsendError } from '@/utils/jsend';
import { z } from 'zod';
import { DependencyContainer } from 'tsyringe';
import { HealthCheckServiceToken } from '@zercle/shared/container/tokens';
import { IHealthCheckService } from '@/infrastructure/health/health-check.service';

export function registerHealthRoutes(app: OpenAPIHono, diContainer: DependencyContainer) {
  const HealthCheckDetailSchema = z.object({
    status: z.enum(['up', 'down']),
    responseTime: z.number().optional(),
    error: z.string().optional(),
    details: z.any().optional(),
  });

  const FullHealthResponseSchema = z.object({
    status: z.literal('success'),
    data: z.object({
      status: z.enum(['healthy', 'unhealthy', 'degraded']),
      checks: z.record(z.string(), HealthCheckDetailSchema),
      timestamp: z.string().datetime(),
      uptime: z.number(),
      version: z.string().optional(),
    }),
    message: z.string().optional(),
  });

  const BasicHealthResponseSchema = z.object({
    status: z.literal('success'),
    data: z.object({
      status: z.literal('ok'),
      environment: z.string(),
      timestamp: z.string().datetime(),
    }),
    message: z.string().optional(),
  });

  const ErrorHealthResponseSchema = z.object({
    status: z.literal('error'),
    message: z.string(),
    code: z.string(),
  });

  // Basic health check endpoint - lightweight
  const basicHealthRoute = createRoute({
    method: 'get',
    path: '/health',
    responses: {
      200: {
        description: 'Basic health check successful',
        content: {
          'application/json': {
            schema: BasicHealthResponseSchema,
          },
        },
      },
    },
    summary: 'Basic Health Check',
    description: 'Lightweight health check endpoint.',
  });

  // Detailed health check endpoint - comprehensive
  const detailedHealthRoute = createRoute({
    method: 'get',
    path: '/health/detailed',
    responses: {
      200: {
        description: 'Detailed health check - all systems healthy',
        content: {
          'application/json': {
            schema: FullHealthResponseSchema,
          },
        },
      },
      503: {
        description: 'Detailed health check - system unhealthy',
        content: {
          'application/json': {
            schema: FullHealthResponseSchema,
          },
        },
      },
      500: {
        description: 'Health check failed',
        content: {
          'application/json': {
            schema: ErrorHealthResponseSchema,
          },
        },
      },
    },
    summary: 'Detailed Health Check',
    description: 'Comprehensive health check including database, cache, memory, and disk status.',
  });

  // Readiness check - for Kubernetes readiness probes
  const readinessRoute = createRoute({
    method: 'get',
    path: '/health/ready',
    responses: {
      200: {
        description: 'Application ready to accept traffic',
        content: {
          'application/json': {
            schema: BasicHealthResponseSchema,
          },
        },
      },
      503: {
        description: 'Application not ready',
        content: {
          'application/json': {
            schema: ErrorHealthResponseSchema,
          },
        },
      },
    },
    summary: 'Readiness Check',
    description: 'Kubernetes readiness probe endpoint.',
  });

  // Liveness check - for Kubernetes liveness probes
  const livenessRoute = createRoute({
    method: 'get',
    path: '/health/live',
    responses: {
      200: {
        description: 'Application is alive',
        content: {
          'application/json': {
            schema: BasicHealthResponseSchema,
          },
        },
      },
    },
    summary: 'Liveness Check',
    description: 'Kubernetes liveness probe endpoint.',
  });

  app.openapi(basicHealthRoute, (c) => {
    const env = process.env['NODE_ENV'] || 'development';  
    const timestamp = new Date().toISOString();

    return c.json(jsendSuccess({
      status: 'ok',
      environment: env,
      timestamp,
    }));
  });

  app.openapi(detailedHealthRoute, async (c) => {
    try {
      const healthCheckService = diContainer.resolve<IHealthCheckService>(HealthCheckServiceToken);
      const healthResult = await healthCheckService.performHealthCheck();

      const statusCode = healthResult.status === 'healthy' ? 200 : 503;

      return c.json(jsendSuccess(healthResult), statusCode);
    } catch {
      return c.json(jsendError(
        'Health check failed',
        'HEALTH_CHECK_ERROR',
        500
      ), 500);
    }
  });

  app.openapi(readinessRoute, async (c) => {
    try {
      const healthCheckService = diContainer.resolve<IHealthCheckService>(HealthCheckServiceToken);
      
      // Check only critical services for readiness
      const databaseCheck = await healthCheckService.checkDatabase();
      
      if (databaseCheck.status === 'down') {
        return c.json(jsendError(
          'Application not ready - database unavailable',
          'SERVICE_UNAVAILABLE',
          503
        ), 503);
      }

      return c.json(jsendSuccess({
        status: 'ok',
        environment: process.env['NODE_ENV'] || 'development',
        timestamp: new Date().toISOString(),
      }));
    } catch {
      return c.json(jsendError(
        'Readiness check failed',
        'READINESS_CHECK_ERROR',
        503
      ), 503);
    }
  });

  app.openapi(livenessRoute, (c) => {
    // Liveness check should be very lightweight - just confirm the process is running
    return c.json(jsendSuccess({
      status: 'ok',
      environment: process.env['NODE_ENV'] || 'development',
      timestamp: new Date().toISOString(),
    }));
  });
}
