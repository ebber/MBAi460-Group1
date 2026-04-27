// Q.2.0 — Route ↔ error-middleware integration test.
//
// Phase 6 unit tests are decoupled from error middleware (happy paths +
// inline-route-validation 400s only). Phase 7 unit tests use isolation
// pattern (tiny self-contained Express app). This file is the canonical
// end-to-end verification of the route → error-middleware flow against
// the REAL `app.js` from Server Foundation 02 + mounts from Phases 6+7.
//
// Per plan §Phase 6+7 three-tier test factoring (post-reviewing-agent
// redesign 2026-04-27).

jest.mock('../services/photoapp');

const request = require('supertest');
const photoapp = require('../services/photoapp');
const app = require('../app');

// Silence the 500-path console.error so test output stays clean.
let consoleErrSpy;
beforeAll(() => {
  consoleErrSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleErrSpy.mockRestore();
});

describe('integration: route → error middleware', () => {
  test('POST /api/images: service throws "no such userid" → 400 envelope', async () => {
    photoapp.uploadImage.mockRejectedValue(new Error('no such userid'));

    const res = await request(app)
      .post('/api/images')
      .field('userid', '99999')
      .attach('file', Buffer.from('fakebytes'), 'x.jpg');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'no such userid' });
  });

  test('GET /api/images/:assetid/labels: service throws "no such assetid" → 404 envelope', async () => {
    photoapp.getImageLabels.mockRejectedValue(new Error('no such assetid'));

    const res = await request(app).get('/api/images/9999/labels');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'error', error: 'no such assetid' });
  });

  test('GET /api/users: generic service error → 500 envelope (sanitized)', async () => {
    photoapp.listUsers.mockRejectedValue(new Error('SQL connection refused'));

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'error', error: 'internal server error' });
    // Sanitization check: raw error text MUST NOT appear in the response body.
    expect(JSON.stringify(res.body)).not.toMatch(/SQL connection/);
  });
});
