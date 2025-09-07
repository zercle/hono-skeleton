import { Context, Next } from 'hono';
import { ZodError } from 'zod';
import { jsendError } from '@/utils/jsend';

export const errorHandler = async (
  c: Context,
  next: Next
): Promise<Response> => {
  try {
    await next();
    return c.res;
  } catch (error: unknown) {
    console.error('Unhandled error:', error); // eslint-disable-line no-console

    // Map Zod errors to appropriate status codes
    if (error instanceof ZodError) {
      return c.json(
        jsendError('validation_failed', 'Validation failed', {
          errors: error.errors,
        }),
        400
      );
    }

    // Map common error types to appropriate status codes
    const err = error as { status?: number; message?: string; stack?: string };
    if (err.status) {
      return c.json(
        jsendError(err.message || 'Internal server error', err.message),
        err.status
      );
    }

    // Generic error handling
    const status = process.env['NODE_ENV'] === 'production' ? 500 : 500;
    const message =
      process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';

    return c.json(jsendError(message, err.stack), status);
  }
};
