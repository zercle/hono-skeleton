// Middleware for authenticating requests using JWT.
import { Context, Next } from 'hono';
import { container } from '../container/di.container';
import { IAuthUseCase } from '../../domains/auth/usecases/interfaces/auth.usecase.interface'; // Corrected import path

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          message: 'Authorization header missing or invalid',
        },
        401,
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const authUseCase = container.resolve<IAuthUseCase>('IAuthUseCase');
    const tokenPayload = await authUseCase.verifyToken(token);

    if (!tokenPayload) {
      return c.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        401,
      );
    }

    // Attach user ID to context for use in handlers
    c.set('userId', tokenPayload.userId);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      401,
    );
  }
};
