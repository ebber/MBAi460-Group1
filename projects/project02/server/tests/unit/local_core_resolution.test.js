// Permanent guard for the Project 02 local PhotoApp core. Asserts the top-level
// exports shape from the Project 02 server's vantage point so path/package
// cleanup cannot silently break route imports.
//
// Source: Approach 01-foundation.md § Phase 0.5 Optional Test Step.
const core = require('../../src/photoapp-core');

test('local core top-level exports resolve from project02/server', () => {
  expect(Object.keys(core).sort()).toEqual([
    'config',
    'middleware',
    'repositories',
    'schemas',
    'services',
  ]);
});

test('services.photoapp.getPing is callable', () => {
  expect(typeof core.services.photoapp.getPing).toBe('function');
});
