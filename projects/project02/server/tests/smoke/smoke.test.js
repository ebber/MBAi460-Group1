// Approach 01-foundation.md § Phase 11 Task 11.2
// Smoke layer — post-compose probes against a live server.
// Requires BASE_URL env (default http://localhost:8080) or make up.
// Routes not yet implemented are test.skip until workstream 02 lands.
const request = require('supertest');
const app = require('../../app');

// /healthz is the only live route during Foundation; all spec routes are skipped
// until workstream 02 unskips them as each route lands.
test('GET /healthz returns 200', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'live' });
});

test.skip('GET /v1/ping (workstream 02)', () => {});
test.skip('GET /v1/users (workstream 02)', () => {});
test.skip('GET /v1/images (workstream 02)', () => {});
