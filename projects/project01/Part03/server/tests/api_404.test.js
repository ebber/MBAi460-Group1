//
// /api/* unmatched-path 404 tests
//
// Verifies that paths under /api/* that don't match any real route
// return a JSON envelope (NOT Express's default HTML 404 page) and
// NOT the SPA's index.html. Surfaced 2026-04-27 during Phase 8.1
// CLI-5 smoke; tracked as a TODO and resolved in this commit.
//

const request = require('supertest');
const app = require('../app');

describe('/api/* unmatched paths return JSON envelope (not HTML)', () => {
  it('GET /api/foo → 404 + application/json + envelope shape', async () => {
    const res = await request(app).get('/api/foo');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message).toMatch(/No route/);
    expect(res.body.message).toMatch(/\/api\/foo/);
  });

  it('POST /api/bar → 404 + application/json + envelope shape', async () => {
    const res = await request(app).post('/api/bar').send({ x: 1 });
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.message).toMatch(/No route/);
  });

  it('DELETE /api/qux → 404 + application/json (covers all methods)', async () => {
    const res = await request(app).delete('/api/qux');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('does NOT mask /random-path with API 404 (SPA fallback wins for non-/api paths)', async () => {
    const res = await request(app).get('/random-path');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });
});
