// Interface definitions for JSend responses
interface JSendSuccess<T = unknown> {
  status: 'success';
  data: T;
  message?: string | undefined;
}

interface JSendError {
  status: 'error';
  message: string;
  code?: string | undefined;
  data?: unknown;
  stack?: string;
}

// Helper function for successful JSend responses
export function jsendSuccess<T>(data: T, message?: string | undefined): JSendSuccess<T> {
  return {
    status: 'success',
    data,
    message,
  };
}

// Helper function for error JSend responses
export function jsendError(
  message: string,
  code?: string | undefined,
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
  if (stack && process.env['NODE_ENV'] !== 'production') {
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
  statusCode: number = 500,
  errorData?: unknown,
  errorStack?: string
): Response {
  // Hono's c.json expects the status code as the second argument, not part of the options object
  return c.json(jsendError(message, code, errorData, errorStack), statusCode);
}
