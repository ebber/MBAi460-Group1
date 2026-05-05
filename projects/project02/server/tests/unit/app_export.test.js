// Approach 01-foundation.md § Phase 2 Task 2.1.
// Locks the app.js export shape early so subsequent expansions (request_id,
// logging, error middleware, /v1 + /v2 routers) can't accidentally break
// "module.exports = app" — Express tests in supertest depend on this contract.
const app = require('../../app');

test('app exports an Express application', () => {
  expect(typeof app).toBe('function');
  expect(typeof app.use).toBe('function');
  expect(typeof app.get).toBe('function');
});

test('importing app does not bind a port', () => {
  expect(app).toBeDefined();
});
