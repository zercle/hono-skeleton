import { Hono } from 'hono';
import { container } from '../infrastructure/container/di.container';
import { AuthHandler } from '../handler/auth.handler';
import { authMiddleware } from '../infrastructure/middleware/auth.middleware';

const authRoutes = new Hono();

// Resolve handler from DI container
const authHandler = container.resolve(AuthHandler);

// Public routes
authRoutes.post('/register', authHandler.register);
authRoutes.post('/login', authHandler.login);

// Protected routes
authRoutes.use('/profile', authMiddleware);
authRoutes.get('/profile', authHandler.profile);

export { authRoutes };
