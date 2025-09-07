import 'reflect-metadata'; // Must be first import for tsyringe
import { describe, it, expect, beforeAll } from 'bun:test';
import { OpenAPIObject } from '@hono/zod-openapi';
import { container, DependencyContainer } from 'tsyringe'; // Import the tsyringe container and DependencyContainer
import { setupTestContainer } from './test/test-container'; // Import the test container setup
import { createApp, AppType } from './app'; // Import createApp and AppType from app
let app: AppType; // Declare app here and assign in beforeAll

describe('App - integration', () => {
  beforeAll(async () => {
    const testContainer = container.createChildContainer(); // Create a child container for tests
    setupTestContainer(testContainer); // Setup DI overrides for tests
    app = createApp(testContainer); // Create app with the test container
  });

  it('should serve health check endpoint', async () => {
    const response = await app.request('/api/health');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data.status).toBe('ok');
    expect(body.data.environment).toBeDefined();
    expect(body.data.timestamp).toBeDefined();
  });

  it('should serve OpenAPI documentation', async () => {
    const response = await app.request('/docs/openapi.json');
    expect(response.status).toBe(200);

    const openApiSpec = await response.json() as OpenAPIObject;
    expect(openApiSpec.openapi).toBe('3.0.0');
    expect(openApiSpec.info.title).toBe('Hono Clean Architecture API');
    expect(openApiSpec.paths['/api/health']).toBeDefined();
    expect(openApiSpec.paths['/api/register']).toBeDefined();
  });

  it('should have CORS middleware', async () => {
    const response = await app.request('/docs/openapi.json', {
      method: 'OPTIONS',
    });

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
  });
});
