import { Hono } from 'hono';
import { jsendError } from '@/utils/jsend';

export const errorHandler = async (
  c: Hono.Context,
  next: Hono.Next
): Promise<Response | undefined> => {
  try {
    await next();
  } catch (err) {
    console.error('Unhandled error:', err);

    // Map Zod errors to appropriate status codes
    if (err.name === 'ZodError') {
      return c.json(
        jsendError('validation_failed', 'Validation failed', {
          errors: err.errors,
        }),
        400
      );
    }

    // Map common error types to appropriate status codes
    if (err.status) {
      return c.json(
        jsendError(err.message || 'Internal server error', err.message),
        err.status
      );
    }

    // Generic error handling
    const status = process.env.NODE_ENV === 'production' ? 500 : 500;
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';

    return c.json(jsendError(message, err.stack), status);
  }
};
