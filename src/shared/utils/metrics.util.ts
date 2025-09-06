// Utility for Prometheus metrics.
import { Counter, Histogram, register } from 'prom-client';

// Register a default metrics collector
register.setDefaultLabels({
  app: 'hono-skeleton-backend',
});

// Define common metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets for response time
});

export const Metrics = {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  register, // Expose the register for /metrics endpoint
};