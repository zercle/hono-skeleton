// Logging middleware for incoming requests and responses.
import { Context, Next } from 'hono';
import { Logger } from '../utils/logger.util';

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const end = Date.now();
  const duration = end - start;

  Logger.info('Request', {
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: `${duration}ms`,
  });
}