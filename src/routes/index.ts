import { Hono } from 'hono';
import { greetingRoutes } from './greeting.routes';
import { authRoutes } from './auth.routes';
import { postRoutes } from './post.routes';

const registerRoutes = (app: Hono) => {
  app.route('/greeting', greetingRoutes);
  app.route('/auth', authRoutes);
  app.route('/posts', postRoutes);
  // Add other routes here
};

export { registerRoutes };
