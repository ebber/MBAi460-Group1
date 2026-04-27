// Routing boundary tests — unmatched /api/* paths return 404 (full
// envelope coverage in api_404.test.js); unmatched non-/api paths
// fall through to the SPA fallback added in Phase 7.

const request = require('supertest');
const app = require('../app');

test('GET /api/foo returns 404 (api routing boundary)', async () => {
  const res = await request(app).get('/api/foo');
  expect(res.status).toBe(404);
});

test('GET /random-non-existent serves SPA index (post-Phase-7 fallback)', async () => {
  const res = await request(app).get('/random-non-existent');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/html/);
});
