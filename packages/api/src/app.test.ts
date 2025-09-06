import { describe, it, expect, beforeAll } from 'bun:test';
import app from './app';

describe('App - integration', () => {
  beforeAll(async () => {
    // Setup database or any other initialization
  });

  it('should serve OpenAPI documentation', async () => {
    const response = await app.request('/docs/openapi.json');
    expect(response.status).toBe(200);

    const openApiSpec = await response.json();
    expect(openApiSpec.openapi).toBe('3.0.0');
    expect(openApiSpec.info.title).toBe('Hono Clean Architecture API');
  });

  it('should have CORS middleware', async () => {
    const response = await app.request('/docs/openapi.json', {
      method: 'OPTIONS',
    });

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
  });
});
