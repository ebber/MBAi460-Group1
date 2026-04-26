// Phase 5: GET / serves the SPA index HTML.
// Phase 6 will add a sibling test for /assets/* once the CSS placeholder lands.

const request = require('supertest');
const app = require('../app');

test('GET / serves the SPA index HTML', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/html/);
  expect(res.text).toContain('PhotoApp Part 03');
});

test('GET /assets/app.css is served by static middleware', async () => {
  const res = await request(app).get('/assets/app.css');
  expect(res.status).toBe(200);
  expect(res.text).toContain('font-family');
});
