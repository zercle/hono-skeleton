import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { testClient } from 'hono/testing';
import app from '@/app';
import { databaseService } from '@/infrastructure/database/connection';
import { users } from '@/infrastructure/database/schemas';
import { eq } from 'drizzle-orm';

describe('Auth Integration Tests', () => {
  const client = testClient(app);
  let testUserId: string;

  beforeEach(async () => {
    // Ensure database connection
    await databaseService.checkConnection();
  });

  afterEach(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        const db = databaseService.getDb();
        await db.delete(users).where(eq(users.id, testUserId));
      } catch (error) {
        console.warn('Failed to clean up test user:', error);
      }
    }
  });

  test('POST /api/v1/auth/register - should register new user', async () => {
    const userData = {
      name: 'Integration Test User',
      email: 'integration.test@example.com',
      password: 'TestPassword123!',
    };

    const response = await client['api/v1/auth/register'].$post({
      json: userData,
    });

    expect(response.status).toBe(201);
    
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data.user.email).toBe(userData.email);
    expect(body.data.user.name).toBe(userData.name);
    expect(body.data.user.id).toBeDefined();

    // Store test user ID for cleanup
    testUserId = body.data.user.id;
  });

  test('POST /api/v1/auth/register - should fail with duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'admin@example.com', // This should already exist from seed
      password: 'TestPassword123!',
    };

    const response = await client['api/v1/auth/register'].$post({
      json: userData,
    });

    expect(response.status).toBe(409);
    
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('User with this email already exists');
  });

  test('POST /api/v1/auth/login - should authenticate user', async () => {
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123',
    };

    const response = await client['api/v1/auth/login'].$post({
      json: loginData,
    });

    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data.user.user.email).toBe(loginData.email);
    expect(body.data.user.accessToken).toBeDefined();
    expect(body.data.user.refreshToken).toBeDefined();
  });

  test('POST /api/v1/auth/login - should fail with invalid credentials', async () => {
    const loginData = {
      email: 'admin@example.com',
      password: 'wrongpassword',
    };

    const response = await client['api/v1/auth/login'].$post({
      json: loginData,
    });

    expect(response.status).toBe(401);
    
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Invalid credentials');
  });

  test('GET /api/v1/auth/profile - should get user profile', async () => {
    // First login to get token
    const loginResponse = await client['api/v1/auth/login'].$post({
      json: {
        email: 'admin@example.com',
        password: 'admin123',
      },
    });

    const loginBody = await loginResponse.json();
    const token = loginBody.data.user.accessToken;

    // Then get profile
    const response = await client['api/v1/auth/profile'].$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data.user.email).toBe('admin@example.com');
  });

  test('GET /api/v1/auth/profile - should fail without token', async () => {
    const response = await client['api/v1/auth/profile'].$get();

    expect(response.status).toBe(401);
    
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.message).toBe('Authorization token required');
  });

  test('GET /health - should return health status', async () => {
    const response = await client.health.$get();

    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data.service).toBe('hono-skeleton');
    expect(body.data.status).toBe('healthy');
  });
});