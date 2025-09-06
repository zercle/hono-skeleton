import { createMiddleware } from 'hono/factory';
import { CryptoHelper } from '@/shared/utils/crypto';
import { ResponseHelper } from '@/shared/utils/response';
import { UnauthorizedError } from '@/shared/types/errors';

export interface AuthContext {
  userId: string;
  email: string;
}

export const authMiddleware = createMiddleware<{
  Variables: {
    auth: AuthContext;
  };
}>(async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = CryptoHelper.extractTokenFromHeader(authHeader);

    if (!token) {
      return ResponseHelper.unauthorized(c, 'Authorization token required');
    }

    const payload = CryptoHelper.verifyToken(token);
    
    // Set auth context for use in handlers
    c.set('auth', {
      userId: payload.userId,
      email: payload.email,
    });

    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return ResponseHelper.unauthorized(c, message);
  }
});

export const optionalAuthMiddleware = createMiddleware<{
  Variables: {
    auth?: AuthContext;
  };
}>(async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = CryptoHelper.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = CryptoHelper.verifyToken(token);
      c.set('auth', {
        userId: payload.userId,
        email: payload.email,
      });
    }
  } catch (error) {
    // Silently ignore invalid tokens in optional auth
  }

  await next();
});