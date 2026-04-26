// Phase 7: GET /api returns the placeholder envelope.
// This guards the load-bearing mount order: /api MUST come before
// express.static so the static catchall cannot absorb /api requests.

const request = require('supertest');
const app = require('../app');

test('GET /api returns the placeholder envelope', async () => {
  const res = await request(app).get('/api');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    message: 'success',
    data: {
      service: 'photoapp-api',
      status: 'placeholder',
    },
  });
});
