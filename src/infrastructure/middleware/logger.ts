import { createMiddleware } from 'hono/factory';
import { logger } from '@/infrastructure/logging/logger';
import { CryptoHelper } from '@/shared/utils/crypto';

export const requestIdMiddleware = createMiddleware(async (c, next) => {
  const requestId = CryptoHelper.generateId();
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);
  await next();
});

export const requestLoggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now();
  const requestId = c.get('requestId');
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('user-agent');
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  logger.info('Incoming request', {
    requestId,
    method,
    url,
    userAgent,
    ip,
  });

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info('Request completed', {
    requestId,
    method,
    url,
    status,
    duration,
  });
});

export const errorLoggerMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    const requestId = c.get('requestId');
    const method = c.req.method;
    const url = c.req.url;

    logger.error('Request error', error as Error, {
      requestId,
      method,
      url,
    });

    throw error;
  }
});