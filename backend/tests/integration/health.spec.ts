import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { Application } from 'express';
import { redis } from '../../src/config/redis.js';
import mongoose from 'mongoose';

describe('Health and Info API Endpoints', () => {
  let app: Application;

  beforeAll(async () => {
    app = createApp();
  });

  afterAll(async () => {
    await redis.quit();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/info returns project metadata', async () => {
    const res = await request(app).get('/api/v1/info');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project).toBe('EduSphere');
    expect(res.body.data.targetCourses).toContain('CAP646');
  });

  it('GET /non-existent-route returns 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ENDPOINT_NOT_FOUND');
  });
});
