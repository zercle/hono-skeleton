// Defines authentication and authorization routes.
import { Hono } from 'hono';
import { container } from '../../../shared/container/di.container';
import { AuthHandler } from '../handlers/auth.handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

const authRoutes = new Hono();

// Resolve handler from DI container
const authHandler = container.resolve(AuthHandler);

// Public authentication routes
authRoutes.post('/register', authHandler.register);
authRoutes.post('/login', authHandler.login);
authRoutes.post('/refresh-token', authHandler.refreshToken);

// Protected routes (example: user profile)
authRoutes.use('/profile', authMiddleware);
authRoutes.get('/profile', authHandler.profile);

export { authRoutes };
