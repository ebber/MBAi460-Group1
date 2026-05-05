// Approach 01-foundation.md § Phase 2 — /healthz outside the version namespace.
// /readyz is deferred to Phase 4 (needs pool + S3 probes from Phases 7+).
const request = require('supertest');
const app = require('../../app');

test('GET /healthz returns 200 and {status:"live"}', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'live' });
});

test('unmatched routes return 404 with the error envelope shape', async () => {
  const res = await request(app).get('/this-does-not-exist');
  expect(res.status).toBe(404);
  expect(res.body.message).toBe('error');
  expect(res.body.error).toMatch(/route not found/);
});
