import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { Application } from 'express';
import { redis } from '../../src/config/redis.js';
import mongoose from 'mongoose';
import { connectDatabase } from '../../src/config/db.js';

describe('Authentication & Token Rotation Lifecycle API', () => {
  let app: Application;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await redis.quit();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('POST /api/v1/auth/login fails on incorrect password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@apex.edu',
      password: 'WrongPassword!',
      tenantSlug: 'apex-uni',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login succeeds with valid tenant admin credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@apex.edu',
      password: 'Password123!',
      tenantSlug: 'apex-uni',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@apex.edu');
    expect(res.body.data.user.role).toBe('TENANT_ADMIN');
    expect(res.body.data.tenant.slug).toBe('apex-uni');

    // Check Refresh Token Cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('edusphere_refresh_token=');
  });

  it('POST /api/v1/auth/refresh rotates token and detects token reuse attack', async () => {
    // 1. Initial Login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@apex.edu',
      password: 'Password123!',
      tenantSlug: 'apex-uni',
    });

    const cookieHeader = loginRes.headers['set-cookie'][0];
    const match = cookieHeader.match(/edusphere_refresh_token=([^;]+)/);
    const initialRefreshToken = match ? match[1] : '';

    // 2. Perform legitimate token rotation
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`edusphere_refresh_token=${initialRefreshToken}`]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // 3. Attempt to REUSE the revoked initial token (simulating attacker theft)
    const attackRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`edusphere_refresh_token=${initialRefreshToken}`]);

    expect(attackRes.status).toBe(403);
    expect(attackRes.body.code).toBe('TOKEN_FAMILY_REVOKED');
  });
});
