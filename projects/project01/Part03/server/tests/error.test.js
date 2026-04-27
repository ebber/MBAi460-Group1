// server/tests/error.test.js
//
// Phase 7 / Task 7.1 — unit tests for the centralized error middleware.
//
// ISOLATION PATTERN (per MetaFiles/plans/03-api-routes-plan.md Subagent B
// brief — overrides the supertest-against-real-app pattern shown in
// 03 §Phase 7). We do NOT load the real `server/app.js`; instead we stand
// up a tiny Express app with contrived throwing routes, mount the error
// middleware, and assert behavior. This keeps the unit isolated from
// Phase 6 routes and from the static / SPA fallback layers.
//
// Integration coverage (real app + real routes + real error middleware)
// lives in Task Q.2 Step Q.2.0 on the main thread post-merge.

const express = require('express');
const request = require('supertest');
const errorMw = require('../middleware/error');

// Build a self-contained Express app whose only routes throw whatever
// the test wants, then run them through the error middleware.
function buildIsolatedApp(routeHandlers) {
  const app = express();
  for (const [routePath, handler] of Object.entries(routeHandlers)) {
    app.get(routePath, handler);
  }
  app.use(errorMw);
  return app;
}

test('maps "no such userid" -> 400 with envelope', async () => {
  const app = buildIsolatedApp({
    '/throw-userid': (req, res, next) => {
      next(new Error('no such userid'));
    },
  });

  const res = await request(app).get('/throw-userid');
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ message: 'error', error: 'no such userid' });
});

test('maps "no such assetid" -> 404 with envelope', async () => {
  const app = buildIsolatedApp({
    '/throw-assetid': (req, res, next) => {
      next(new Error('no such assetid'));
    },
  });

  const res = await request(app).get('/throw-assetid');
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ message: 'error', error: 'no such assetid' });
});

test('maps multer LIMIT_FILE_SIZE -> 400 echoing multer message', async () => {
  const app = buildIsolatedApp({
    '/throw-limit': (req, res, next) => {
      const err = new Error('File too large');
      err.code = 'LIMIT_FILE_SIZE';
      next(err);
    },
  });

  const res = await request(app).get('/throw-limit');
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ message: 'error', error: 'File too large' });
});

test('generic error -> 500 sanitized; original message not leaked', async () => {
  // Silence console.error so the unhandled-error log doesn't pollute Jest output.
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const app = buildIsolatedApp({
    '/throw-generic': (req, res, next) => {
      next(new Error('SQL connection refused'));
    },
  });

  const res = await request(app).get('/throw-generic');
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ message: 'error', error: 'internal server error' });
  // Sanitization: the raw cause must NOT appear in the response body.
  expect(JSON.stringify(res.body)).not.toContain('SQL connection refused');
  // But the server log SHOULD have captured it for ops debugging.
  expect(errSpy).toHaveBeenCalled();

  errSpy.mockRestore();
});
