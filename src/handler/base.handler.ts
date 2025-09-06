import { Context } from 'hono';

export abstract class BaseHandler {
  protected successResponse(c: Context, data: any, message: string = 'Success', status: number = 200) {
    return c.json({ success: true, message, data }, status);
  }

  protected errorResponse(c: Context, message: string = 'An error occurred', status: number = 500, error?: any) {
    return c.json({ success: false, message, error: error?.message || error || 'Unknown error' }, status);
  }
}
