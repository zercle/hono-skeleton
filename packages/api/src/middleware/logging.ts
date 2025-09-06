import { Hono } from 'hono';
import { container } from 'tsyringe';
import { ILogger } from '../infrastructure/logging/logger.interface';
import { LoggerToken } from '../../shared/src/container/tokens';

export const loggerMiddleware = async (
  c: Hono.Context,
  next: Hono.Next
): Promise<Response | undefined> => {
  const logger = container.resolve<ILogger>(LoggerToken);
  const start = Date.now();

  // Add request ID if available
  const requestId =
    c.req.header('x-request-id') || Math.random().toString(36).substring(2, 9);
  c.set('requestId', requestId);

  // Log incoming request
  logger.info('Incoming request', {
    method: c.req.method,
    url: c.req.url,
    headers: Object.fromEntries(c.req.header()),
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
};
