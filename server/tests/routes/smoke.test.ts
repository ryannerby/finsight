import request from 'supertest';
import { app } from '../../src/app';

describe('API Route Smoke Tests', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('GET /api/deals', () => {
    it('should return 400 when user_id is missing', async () => {
      const response = await request(app)
        .get('/api/deals')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user_id');
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should return 200 when user_id is provided', async () => {
      const response = await request(app)
        .get('/api/deals?user_id=test-user')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      // Note: In test environment, this might return empty array or mock data
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/analyze', () => {
    it('should reject request with missing dealId and return 400', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          // Missing dealId
          files: ['test.csv'],
          options: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requestId');
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should reject request with missing files and return 400', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          dealId: 'test-deal-id',
          // Missing files
          options: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requestId');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('POST /api/export/pdf/enhanced', () => {
    it('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .post('/api/export/pdf/enhanced')
        .send({
          // Missing dealId, summaryReport, computedMetrics
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requestId');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('POST /api/export/excel/enhanced', () => {
    it('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .post('/api/export/excel/enhanced')
        .send({
          // Missing dealId, summaryReport, computedMetrics
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('GET /api/analysis-reports/:id', () => {
    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/analysis-reports/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('Request ID Middleware', () => {
    it('should generate request ID if not provided', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
      expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should use provided request ID', async () => {
      const customRequestId = 'custom-test-request-id-123';
      const response = await request(app)
        .get('/api/health')
        .set('x-request-id', customRequestId)
        .expect(200);

      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });
});
