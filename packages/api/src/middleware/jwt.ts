import { Context, Next } from 'hono';
import { verify, JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { DependencyContainer } from 'tsyringe';
import { ConfigToken } from '@zercle/shared/container/tokens';
import { IConfigService } from '../infrastructure/config/config.interface';
import { error } from '../utils/jsend';

// Define the expected structure of our JWT payload
export interface AuthUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend the Hono Context to include a 'user' property for the decoded JWT payload
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * JWT verification middleware for Hono.
 * Verifies the JWT from the Authorization header and attaches the decoded payload to the context.
 */
export const jwtMiddleware = (diContainer: DependencyContainer) => {
  return async (c: Context, next: Next) => {
    const configService = diContainer.resolve<IConfigService>(ConfigToken);
    const jwtSecret = configService.get<string>('jwt.secret');

    if (!jwtSecret) {
      return error(c, 'JWT secret not configured', 'SERVER_ERROR', 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(c, 'Authorization token required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return error(c, 'Authorization token required', 'UNAUTHORIZED', 401);
    }

    try {
      const decoded = verify(token, jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
      
      // Validate required fields in the JWT payload
      if (typeof decoded === 'string' || !decoded.id || !decoded.email) {
        return error(c, 'Invalid token payload', 'UNAUTHORIZED', 401);
      }

      // Create AuthUser object with validated fields
      const authUser: AuthUser = {
        id: decoded.id,
        email: decoded.email,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      c.set('user', authUser);
      await next();
    } catch (err: unknown) {
      // Handle specific JWT errors with better error messages
      if (err instanceof TokenExpiredError) {
        return error(c, 'Token has expired', 'TOKEN_EXPIRED', 401);
      }
      if (err instanceof JsonWebTokenError) {
        return error(c, 'Invalid token', 'INVALID_TOKEN', 401);
      }
      // Generic error for other issues
      return error(c, 'Authentication failed', 'UNAUTHORIZED', 401);
    }
  };
};

/**
 * Optional JWT middleware that doesn't require authentication but will decode
 * the token if present. Useful for routes that work for both authenticated
 * and unauthenticated users.
 */
export const optionalJwtMiddleware = (diContainer: DependencyContainer) => {
  return async (c: Context, next: Next) => {
    const configService = diContainer.resolve<IConfigService>(ConfigToken);
    const jwtSecret = configService.get<string>('jwt.secret');
    const authHeader = c.req.header('Authorization');

    // If no auth header, continue without setting user
    if (!authHeader || !authHeader.startsWith('Bearer ') || !jwtSecret) {
      await next();
      return;
    }

    const token = authHeader.substring(7);
    if (!token) {
      await next();
      return;
    }

    try {
      const decoded = verify(token, jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
      
      // Validate and set user if token is valid
      if (typeof decoded !== 'string' && decoded.id && decoded.email) {
        const authUser: AuthUser = {
          id: decoded.id,
          email: decoded.email,
          iat: decoded.iat,
          exp: decoded.exp,
        };
        c.set('user', authUser);
      }
    } catch {
      // Silently ignore invalid tokens for optional middleware
    }

    await next();
  };
};