import 'reflect-metadata';
import { describe, it, expect } from 'bun:test';
import app from '../../src/app';

describe('Hono App', () => {
  it('should handle greeting GET request', async () => {
    const req = new Request('http://localhost/greeting', {
      method: 'GET',
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.message).toBe('Hello Hono from Repository!');
  });

  it('should handle greeting POST request', async () => {
    const req = new Request('http://localhost/greeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message from test',
      }),
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.message).toBe('Test message from test');
  });

  it('should return error for invalid POST data', async () => {
    const req = new Request('http://localhost/greeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await app.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});