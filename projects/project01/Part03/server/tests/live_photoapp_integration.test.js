// Phase 8 — Live AWS + RDS integration tests, OPT-IN.
//
// Skipped by default. Set `PHOTOAPP_RUN_LIVE_TESTS=1` to enable.
//   PHOTOAPP_RUN_LIVE_TESTS=1 npm test -- live_photoapp_integration.test.js
//
// Read-only baseline against real RDS + S3. Mutating live tests
// (upload/download/delete) are deferred until read-side health is
// confirmed — kept narrow on purpose.
//
// Per plan §Phase 8 + 03-api-routes.md §Phase 8.

const RUN_LIVE = process.env.PHOTOAPP_RUN_LIVE_TESTS === '1';
const maybeDescribe = RUN_LIVE ? describe : describe.skip;

const request = require('supertest');
const app = require('../app');

maybeDescribe('live PhotoApp integration', () => {
  test('GET /api/ping returns success envelope with non-negative counts', async () => {
    const res = await request(app).get('/api/ping');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
    expect(typeof res.body.data.s3_object_count).toBe('number');
    expect(typeof res.body.data.user_count).toBe('number');
    expect(res.body.data.s3_object_count).toBeGreaterThanOrEqual(0);
    expect(res.body.data.user_count).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/users returns the seeded users', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    // The 3 seeded users from create-photoapp.sql should be present.
    const usernames = res.body.data.map(u => u.username);
    expect(usernames).toEqual(expect.arrayContaining(['p_sarkar', 'e_ricci', 'l_chen']));
  });

  // Mutating live tests (upload, labels, search, download, delete) are
  // intentionally deferred. The read-side baseline above is sufficient
  // to confirm: (a) AWS credentials load via fromIni, (b) S3 ListObjects
  // works against the real bucket, (c) mysql2 connects to live RDS,
  // (d) the route → service → AWS factory wiring is end-to-end.
});
