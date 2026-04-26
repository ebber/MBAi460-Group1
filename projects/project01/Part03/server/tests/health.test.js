// Phase 3: GET /health returns 200 + {status: "running"}.
// /health is the server liveness probe — deliberately outside /api/*.
// The PhotoApp /api/ping endpoint (workstream 03) is a separate concept
// that exercises live S3 + RDS via the service module.

const request = require('supertest');
const app = require('../app');

test('GET /health returns 200 with {status: "running"}', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'running' });
});
