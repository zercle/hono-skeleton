import { cors } from 'hono/cors';
import { configService } from '@/infrastructure/config/env';

export const corsMiddleware = cors({
  origin: configService.getCorsOrigins(),
  credentials: configService.get('CORS_CREDENTIALS'),
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposeHeaders: ['X-Total-Count', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
});