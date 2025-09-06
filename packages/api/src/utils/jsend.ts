interface JSendSuccess<T = unknown> {
  status: 'success';
  data: T;
  message?: string;
}

interface JSendError {
  status: 'error';
  message: string;
  code?: string;
  data?: unknown;
  stack?: string;
}

type JSendEnvelope<T = unknown> = JSendSuccess<T> | JSendError;

export function jsendSuccess<T>(data: T, message?: string): JSendSuccess<T> {
  return {
    status: 'success',
    data,
    message,
  };
}

export function jsendError(
  message: string,
  code?: string,
  data?: unknown,
  stack?: string
): JSendError {
  const error: JSendError = {
    status: 'error',
    message,
    code,
    data,
  };

  // Only include stack in non-production environments
  if (stack && process.env.NODE_ENV !== 'production') {
    error.stack = stack;
  }

  return error;
}

// Hono context wrapper functions
import { Context } from 'hono';

export function success<T>(c: Context, data: T, message?: string): Response {
  return c.json(jsendSuccess(data, message));
}

export function error(
  c: Context,
  message: string,
  code?: string,
  statusCode: number = 500
): Response {
  return c.json(jsendError(message, code), statusCode);
}
