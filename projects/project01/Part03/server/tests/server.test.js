// Boot-graph smoke test for the npm-start entry point.
//
// app.test.js covers app.js (the Jest/supertest import surface). This test
// covers server.js (the `npm start` boot entry point). They are different
// require graphs: server.js pulls in `app` AND the lib config, so a missing
// dependency here is invisible to the test suite that only imports app.js.
//
// We discovered the gap when Phase 0.2 deleted Part 03's local config.js
// but left `server.js` requiring `./config`. The route tests stayed green
// (they import app.js, not server.js) while `npm start` would have crashed
// at boot. This test closes that gap by exercising the require graph from
// the same entry point npm start uses, with app.listen stubbed out so we
// don't bind a port.
//
// Mocking strategy: jest.isolateModules() gives us a clean module registry
// per test. Inside the isolated registry we require app, swap its .listen
// for a jest.fn, then require server. Both server and our test see the
// same isolated `app` module.

describe('server.js boot graph', () => {
  test('require graph resolves end-to-end and reaches app.listen() with the lib-configured port', () => {
    let listenSpy;
    let portArg;

    jest.isolateModules(() => {
      const app = require('../app');
      listenSpy = jest.fn(function () { return this; });
      app.listen = listenSpy;
      // require server.js — its `require('./app')` resolves to the same
      // module we just mutated because we're inside isolateModules and the
      // registry is shared within this callback.
      require('../server');
      portArg = listenSpy.mock.calls[0]?.[0];
    });

    expect(listenSpy).toHaveBeenCalledTimes(1);
    // Lib config exposes web_service_port; lock that the port comes from
    // there (so a future "we have our own port now" hardcoding regression
    // gets caught).
    const { config } = require('@mbai460/photoapp-server');
    expect(portArg).toBe(config.web_service_port);
  });
});
