import { Hono } from 'hono';
import { authRoutes } from './domains/auth/routes/auth.routes';
import { greetingRoutes } from './domains/greeting/routes/greeting.routes';
import { postRoutes } from './domains/post/routes/post.routes';
import { loggerMiddleware } from './shared/middleware/logger.middleware';
import { metricsMiddleware } from './shared/middleware/metrics.middleware';
import { Metrics } from './shared/utils/metrics.util';

const app = new Hono();

// Add metrics middleware
app.use(metricsMiddleware);

// Add logger middleware
app.use(loggerMiddleware);

// Register all routes
app.route('/auth', authRoutes);
app.route('/greeting', greetingRoutes);
app.route('/posts', postRoutes);

// Metrics endpoint
app.get('/metrics', async (c) => {
  c.header('Content-Type', Metrics.register.contentType);
  return c.text(await Metrics.register.metrics());
});

// Global error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text('Internal Server Error', 500);
});

export default app;
