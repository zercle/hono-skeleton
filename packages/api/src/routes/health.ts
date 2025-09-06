import { Hono } from 'hono';
import { jsendSuccess } from '@/utils/jsend';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

const healthRoute = new Hono();

const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  environment: z.string(),
  timestamp: z.string().datetime(),
});

const healthRouteOpenApi = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      description: 'Health check successful',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
  },
  summary: 'Health Check',
  description: 'Checks the health of the API.',
});

healthRoute.openapi(healthRouteOpenApi, c => {
  const env = process.env.NODE_ENV || 'development';
  const timestamp = new Date().toISOString();

  return jsendSuccess(c, {
    status: 'ok',
    environment: env,
    timestamp,
  });
});

export default healthRoute;
