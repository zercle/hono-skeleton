import { Context } from 'hono';

export class ResponseUtil {
  public static successResponse<T>(c: Context, data: T | null, message: string = 'Success', status: number = 200) {
    return c.json({ success: true, message, data }, status);
  }

  public static errorResponse(c: Context, message: string, status: number = 500, error?: any) {
    console.error(`Error: ${message}`, error);
    return c.json({ success: false, message, error: error?.message || error }, status);
  }
}