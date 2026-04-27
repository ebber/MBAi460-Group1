// Coverage review (post-Phase 9 polish): the placeholder /api should
// scope to /api only, and unmatched paths should fall through to a 404
// rather than being absorbed by static or the SPA fallback. These tests
// guard against accidental scope creep when workstream 03 adds real
// /api/* endpoints, and against any future static/fallback regression.

const request = require('supertest');
const app = require('../app');

test('GET /api/foo returns 404 (placeholder is scoped to /api only)', async () => {
  const res = await request(app).get('/api/foo');
  expect(res.status).toBe(404);
});

test('GET /random-non-existent returns 404 (no static, no SPA route)', async () => {
  const res = await request(app).get('/random-non-existent');
  expect(res.status).toBe(404);
});
