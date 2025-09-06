// Integration tests for Post API endpoints
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import app from '../src/app';
import prisma from '../src/shared/database/connection';

describe('Post API', () => {
  let authToken: string;
  let createdPostId: string;

  beforeAll(async () => {
    // Clear the database before tests
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Register a user to get an auth token
    const registerRes = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });
    const registerJson = await registerRes.json();
    expect(registerRes.status).toBe(201);

    // Login to get a token
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    const loginJson = await loginRes.json();
    expect(loginRes.status).toBe(200);
    authToken = loginJson.data.token;
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a new post', async () => {
    const req = new Request('http://localhost/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Test Post Title',
        content: 'This is the content of the test post.',
      }),
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.title).toBe('Test Post Title');
    createdPostId = json.data.id;
  });

  it('should get a post by ID', async () => {
    const req = new Request(`http://localhost/posts/${createdPostId}`, {
      method: 'GET',
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(createdPostId);
    expect(json.data.title).toBe('Test Post Title');
  });

  it('should get all posts', async () => {
    const req = new Request('http://localhost/posts', {
      method: 'GET',
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('should update a post by ID', async () => {
    const req = new Request(`http://localhost/posts/${createdPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Updated Test Post Title',
        content: 'Updated content.',
      }),
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(createdPostId);
    expect(json.data.title).toBe('Updated Test Post Title');
  });

  it('should delete a post by ID', async () => {
    const req = new Request(`http://localhost/posts/${createdPostId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toBe('Post deleted successfully');

    // Verify post is deleted
    const getRes = await app.request(`http://localhost/posts/${createdPostId}`, {
      method: 'GET',
    });
    expect(getRes.status).toBe(404);
  });
});