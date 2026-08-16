import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';
import { Order } from '../src/models/Order.js';
import { ProductEvent } from '../src/models/ProductEvent.js';
import { Review } from '../src/models/Review.js';
import { seedDemoData } from '../src/scripts/seedDemoData.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('LUMÉ Full Backend API & Phase 3 Admin Analytics Test Suite', () => {
  it('GET /api/health returns 200 OK and health message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('LUMÉ API is running');
  });

  describe('1. Demo Seeding Engine & Idempotency', () => {
    it('executes seedDemoData and creates persistent database records', async () => {
      const counts = await seedDemoData();
      expect(counts.demoOrders).toBeGreaterThan(50);
      expect(counts.demoEvents).toBeGreaterThan(100);
      expect(counts.demoCustomers).toBeGreaterThan(10);
    });

    it('verifies seed idempotency by running seedDemoData twice without inflating counts', async () => {
      const run1 = await seedDemoData();
      const orderCountRun1 = await Order.countDocuments({ demoSeedId: 'lume-demo-2026' });

      const run2 = await seedDemoData();
      const orderCountRun2 = await Order.countDocuments({ demoSeedId: 'lume-demo-2026' });

      expect(orderCountRun1).toEqual(orderCountRun2);
      expect(run1.demoOrders).toEqual(run2.demoOrders);
    });
  });

  describe('2. Authentication System', () => {
    it('registers a customer successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe('alice@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('prevents duplicate email registration', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Two',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('authenticates valid login and sets httpOnly refresh cookie', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects invalid password', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
    });

    it('rotates refresh token on POST /api/auth/refresh', async () => {
      const regRes = await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const cookie = regRes.headers['set-cookie'];

      const refRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie);

      expect(refRes.status).toBe(200);
      expect(refRes.body.accessToken).toBeDefined();
      expect(refRes.headers['set-cookie']).toBeDefined();
    });

    it('clears refresh token cookie on POST /api/auth/logout', async () => {
      const regRes = await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', regRes.headers['set-cookie']);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
    });
  });

  describe('3. Discovery APIs & Product Search', () => {
    let adminToken;
    let categoryDoc;
    let productDoc;

    beforeEach(async () => {
      await seedDemoData();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@lumeskincare.com',
        password: 'AdminPassword123!',
      });
      adminToken = loginRes.body.accessToken;

      const prods = await Product.find({ isActive: true });
      productDoc = prods[0];
    });

    it('provides debounced autocomplete search suggestions', async () => {
      const res = await request(app).get('/api/products/search/autocomplete?q=hyal');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThan(0);
    });

    it('returns dynamic trending products list', async () => {
      const res = await request(app).get('/api/products/trending');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('returns dynamic best sellers list', async () => {
      const res = await request(app).get('/api/products/best-sellers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('returns new arrivals list', async () => {
      const res = await request(app).get('/api/products/new-arrivals');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('returns product recommendations excluding current product', async () => {
      const res = await request(app).get(`/api/products/${productDoc.id}/recommendations`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const containsSelf = res.body.products.some((p) => p.id === productDoc.id);
      expect(containsSelf).toBe(false);
    });
  });

  describe('4. Phase 3 Admin Analytics & Reseed Authorization', () => {
    let adminToken;
    let customerToken;
    let productDoc;

    beforeEach(async () => {
      await seedDemoData();

      const custRes = await request(app).post('/api/auth/register').send({
        name: 'Analytics Customer',
        email: 'analytics@test.com',
        password: 'Password123!',
      });
      customerToken = custRes.body.accessToken;

      const adminRes = await request(app).post('/api/auth/register').send({
        name: 'Admin Manager',
        email: 'adminanalytics@test.com',
        password: 'Password123!',
      });
      await User.findByIdAndUpdate(adminRes.body.user.id, { role: 'admin' });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'adminanalytics@test.com',
        password: 'Password123!',
      });
      adminToken = loginRes.body.accessToken;

      const prods = await Product.find({ isActive: true });
      productDoc = prods[0];
    });

    it('denies access to admin analytics for customers (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/sales')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('denies access to demo reseed for customers (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/admin/demo/reseed')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('re-seeds demo data on POST /api/admin/demo/reseed for admin', async () => {
      const res = await request(app)
        .post('/api/admin/demo/reseed')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.counts.demoOrders).toBeGreaterThan(0);
    });

    it('returns sales analytics time-series data for admin with 7d, 30d, 90d, 12m range filters', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/sales?range=30d')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns detailed product performance analytics for /api/admin/analytics/products/:id', async () => {
      const res = await request(app)
        .get(`/api/admin/analytics/products/${productDoc._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analytics.views).toBeGreaterThan(0);
      expect(res.body.analytics.demandLevel).toBeDefined();
    });

    it('returns inventory analytics and summary breakdown', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.totalValuation).toBeGreaterThan(0);
    });

    it('returns category analytics metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.categories)).toBe(true);
    });

    it('returns customer analytics metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics.totalCustomers).toBeGreaterThan(0);
    });

    it('returns recent store activity log', async () => {
      const res = await request(app)
        .get('/api/admin/activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.activities)).toBe(true);
    });
  });
});
