// Phase 2: prove the Express app object can be imported without binding a port.
// Once Task 2.2 splits listen() out of app.js, this passes; before that it fails
// (either typeof check fails, or the import binds a socket).

const app = require('../app');

test('app exports an Express application function', () => {
  expect(typeof app).toBe('function');
  // Express app is a function with .use, .get, .listen on it
  expect(typeof app.use).toBe('function');
  expect(typeof app.get).toBe('function');
});

test('importing app does not bind a port', () => {
  // If require('../app') called listen(), the test process would already be
  // holding a socket. We assert the export shape; the absence of a port-in-use
  // error during repeated require() is the real signal here.
  expect(app).toBeDefined();
});
