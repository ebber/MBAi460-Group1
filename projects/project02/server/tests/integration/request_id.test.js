// Approach 01-foundation.md § Phase 3 Task 3.3 — pino-http + request_id end-to-end.
// Asserts: a supplied X-Request-Id arrives at the response unchanged AND a generated
// id round-trips back. The actual log-line introspection is light-weight here (we
// trust pino-http's wiring); the value of this test is the request-id propagation
// contract, which everything downstream (CloudWatch, alarms) depends on.
const request = require('supertest');
const app = require('../../app');

test('GET /healthz echoes a supplied X-Request-Id', async () => {
  const res = await request(app).get('/healthz').set('X-Request-Id', 'abc-test-123');
  expect(res.status).toBe(200);
  expect(res.headers['x-request-id']).toBe('abc-test-123');
});

test('GET /healthz generates an X-Request-Id when none is supplied', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.headers['x-request-id']).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
});
