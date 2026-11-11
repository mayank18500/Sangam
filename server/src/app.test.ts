import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('Sangam Express Backend API Test Suite', () => {
  it('GET /api/v1/health should return status healthy and database connected', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/v1/suppliers should return seeded suppliers list', async () => {
    const res = await request(app).get('/api/v1/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/analytics/overview should return real metrics', async () => {
    const res = await request(app).get('/api/v1/analytics/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.totalSuppliers).toBeGreaterThan(0);
    expect(res.body.data.metrics.totalInventoryListings).toBeGreaterThan(0);
  });

  it('GET /api/v1/inventory should return inventory listings', async () => {
    const res = await request(app).get('/api/v1/inventory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/login should authenticate seeded user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@sangam.travel',
      password: 'Admin@123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@sangam.travel');
  });
});
