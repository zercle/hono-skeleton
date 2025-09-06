import { createMiddleware } from 'hono/factory';
import { ZodError } from 'zod';
import { AppError } from '@/shared/types/errors';
import { ResponseHelper } from '@/shared/utils/response';
import { logger } from '@/infrastructure/logging/logger';
import { configService } from '@/infrastructure/config/env';

export const errorHandlerMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    const requestId = c.get('requestId');
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      logger.warn('Validation error', {
        requestId,
        errors: validationErrors,
      });

      return ResponseHelper.fail(c, {
        message: 'Validation failed',
        errors: validationErrors,
      }, 400);
    }

    // Handle known application errors
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        logger.error('Application error', error, { requestId });
      } else {
        logger.warn('Application error', {
          requestId,
          message: error.message,
          statusCode: error.statusCode,
          code: error.code,
        });
      }

      return ResponseHelper.error(
        c,
        error.message,
        error.statusCode,
        undefined,
        error.code ? { code: error.code } : undefined
      );
    }

    // Handle unknown errors
    const err = error as Error;
    logger.error('Unhandled error', err, { requestId });

    // Don't expose internal error details in production
    const message = configService.isProduction()
      ? 'Internal server error'
      : err.message || 'Unknown error occurred';

    const data = configService.isDevelopment() && err.stack
      ? { stack: err.stack }
      : undefined;

    return ResponseHelper.error(c, message, 500, undefined, data);
  }
});

export const notFoundMiddleware = createMiddleware(async (c) => {
  return ResponseHelper.notFound(c, `Route ${c.req.method} ${c.req.path} not found`);
});