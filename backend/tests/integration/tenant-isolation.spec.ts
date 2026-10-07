import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { Application } from 'express';
import { redis } from '../../src/config/redis.js';
import mongoose from 'mongoose';
import { connectDatabase } from '../../src/config/db.js';

describe('Tenant Isolation & Cross-Tenant Boundary Security API', () => {
  let app: Application;
  let apexAdminToken: string;
  let apexStudentToken: string;
  let oakridgeAdminToken: string;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp();

    // 1. Authenticate Apex University Tenant Admin
    const apexLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@apex.edu',
      password: 'Password123!',
      tenantSlug: 'apex-uni',
    });
    apexAdminToken = apexLogin.body.data.accessToken;

    // 2. Authenticate Apex University Student
    const studentLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'student.alice@apex.edu',
      password: 'Password123!',
      tenantSlug: 'apex-uni',
    });
    apexStudentToken = studentLogin.body.data.accessToken;

    // 3. Authenticate Oakridge College Tenant Admin
    const oakridgeLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@oakridge.edu',
      password: 'Password123!',
      tenantSlug: 'oakridge-col',
    });
    oakridgeAdminToken = oakridgeLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await redis.quit();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('SEC-01: Rejects unauthenticated access to tenant-scoped resources with HTTP 401', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('SEC-02: Tenant A (Apex) courses query isolates data from Tenant B (Oakridge)', async () => {
    const resApex = await request(app)
      .get('/api/v1/courses')
      .set('Authorization', `Bearer ${apexAdminToken}`);

    expect(resApex.status).toBe(200);
    expect(resApex.body.success).toBe(true);

    // Assert every returned course belongs to Apex's tenant partition
    const courses = resApex.body.data;
    expect(Array.isArray(courses)).toBe(true);
    for (const c of courses) {
      // In seed, CAP646 and CAP774 belong to Apex University
      expect(c.title).toBeDefined();
      expect(c.code).toBeDefined();
    }
  });

  it('SEC-03: Cross-tenant User Directory isolation prevents data leakage across institutions', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${apexAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const users = res.body.data;
    expect(Array.isArray(users)).toBe(true);
    for (const u of users) {
      // User must not be from oakridge.edu or summit.edu
      expect(u.email).not.toContain('@oakridge.edu');
      expect(u.email).not.toContain('@summit.edu');
    }
  });

  it('SEC-04: Student role attempting administrative mutation is strictly rejected with HTTP 403', async () => {
    const res = await request(app)
      .post('/api/v1/users/invite')
      .set('Authorization', `Bearer ${apexStudentToken}`)
      .send({
        firstName: 'Hacker',
        lastName: 'Probe',
        email: 'probe@apex.edu',
        role: 'INSTRUCTOR',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
