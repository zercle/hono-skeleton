import { Context, Next } from 'hono';
import { DependencyContainer } from 'tsyringe';
import { ILogger } from '../infrastructure/logging/logger.interface';
import { LoggerToken } from '@zercle/shared/container/tokens';

export const loggerMiddleware = (diContainer: DependencyContainer) => {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    const logger = diContainer.resolve<ILogger>(LoggerToken);
  const start = Date.now();

  // Add request ID if available
  const requestId =
    c.req.header('x-request-id') || Math.random().toString(36).substring(2, 9);
  c.set('requestId', requestId);

  // Log incoming request
  logger.info('Incoming request', {
    method: c.req.method,
    url: c.req.url,
    // Cast c.req.header() to Iterable<readonly [string, string]>
    headers: Object.fromEntries(Object.entries(c.req.header())), // Use Object.entries for Record<string, string>
    requestId,
  });

  await next();

  const duration = Date.now() - start;

  // Log outgoing response
  logger.info('Outgoing response', {
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration,
    requestId,
  });
  return c.res; // Explicitly return the response
  };
};
