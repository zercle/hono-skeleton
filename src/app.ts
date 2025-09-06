import { Hono } from 'hono';
import { registerRoutes } from './routes';

const app = new Hono();

// Register all routes
registerRoutes(app);

// Global error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text('Internal Server Error', 500);
});

export default app;
