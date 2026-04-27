// Static middleware + SPA fallback tests against the real Vite build
// (frontend/dist/). Asset filenames are content-hashed by Vite, so
// the CSS test discovers the real filename from the filesystem rather
// than hardcoding it.

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../app');

const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

test('GET / serves the SPA index HTML', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/html/);
  expect(res.text).toContain('MBAi 460');
});

test('GET /assets/<hashed.css> is served by static middleware', async () => {
  const assetsDir = path.join(FRONTEND_DIST, 'assets');
  const cssFile = fs.readdirSync(assetsDir).find((f) => f.endsWith('.css'));
  expect(cssFile).toBeDefined();
  const res = await request(app).get(`/assets/${cssFile}`);
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/css/);
});
