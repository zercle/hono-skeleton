// Metrics middleware for request duration and Prometheus endpoint.
import { Context, Next } from 'hono';
import { Metrics } from '../utils/metrics.util';

export async function metricsMiddleware(c: Context, next: Next) {
  const start = process.hrtime.bigint();
  await next();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000_000; // Convert to seconds

  const method = c.req.method;
  const route = c.req.path; // Use path for route for simplicity, can be enhanced with route patterns
  const status = c.res.status.toString();

  Metrics.httpRequestsTotal.inc({ method, route, status });
  Metrics.httpRequestDurationSeconds.observe({ method, route, status }, duration);
}