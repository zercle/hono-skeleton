import { Context } from 'hono';
import type { JSendResponse, PaginatedResponse } from '@/shared/types/common';

export class ResponseHelper {
  static success<T>(c: Context, data: T, statusCode: number = 200) {
    const response: JSendResponse<T> = {
      status: 'success',
      data,
    };
    
    return c.json(response, statusCode);
  }

  static fail(c: Context, data: Record<string, any>, statusCode: number = 400) {
    const response: JSendResponse = {
      status: 'fail',
      data,
    };
    
    return c.json(response, statusCode);
  }

  static error(
    c: Context,
    message: string,
    statusCode: number = 500,
    code?: number,
    data?: any
  ) {
    const response: JSendResponse = {
      status: 'error',
      message,
      ...(code && { code }),
      ...(data && { data }),
    };
    
    return c.json(response, statusCode);
  }

  static paginated<T>(
    c: Context,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    statusCode: number = 200
  ) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    const response: JSendResponse<PaginatedResponse<T>> = {
      status: 'success',
      data: {
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      },
    };
    
    return c.json(response, statusCode);
  }

  static created<T>(c: Context, data: T) {
    return this.success(c, data, 201);
  }

  static noContent(c: Context) {
    return c.body(null, 204);
  }

  static badRequest(c: Context, message: string = 'Bad Request', data?: any) {
    return this.fail(c, { message, ...data }, 400);
  }

  static unauthorized(c: Context, message: string = 'Unauthorized') {
    return this.error(c, message, 401);
  }

  static forbidden(c: Context, message: string = 'Forbidden') {
    return this.error(c, message, 403);
  }

  static notFound(c: Context, message: string = 'Not Found') {
    return this.error(c, message, 404);
  }

  static conflict(c: Context, message: string = 'Conflict') {
    return this.error(c, message, 409);
  }

  static internalServerError(c: Context, message: string = 'Internal Server Error') {
    return this.error(c, message, 500);
  }
}