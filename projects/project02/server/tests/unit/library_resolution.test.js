// Permanent CI guard for the @mbai460/photoapp-server workspace symlink (replaces
// the deleted /__bootcheck smoke route from sub-phase 1.0). Asserts the same
// top-level exports shape as the library's own exports-shape.test.js, but from
// the *consumer's* vantage point — symmetric assertion, different position.
// A future package.json cleanup that drops the dep, or a workspace topology
// change, breaks this test before any next contributor hits "Cannot find module".
//
// Source: Approach 01-foundation.md § Phase 0.5 Optional Test Step.
const lib = require('@mbai460/photoapp-server');

test('library top-level exports resolve from project02/server', () => {
  expect(Object.keys(lib).sort()).toEqual([
    'config',
    'middleware',
    'repositories',
    'schemas',
    'services',
  ]);
});

test('services.photoapp.getPing is callable', () => {
  expect(typeof lib.services.photoapp.getPing).toBe('function');
});
