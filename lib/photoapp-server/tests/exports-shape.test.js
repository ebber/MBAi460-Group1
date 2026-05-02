// lib/photoapp-server/tests/exports-shape.test.js
//
// Snapshot of the library's public exports surface. Catches accidental
// rename / removal of public API at the cheapest possible moment — in the
// library PR's CI, before the consumers' boot-time errors hours later.
//
// Built per the Optional Test Step in Approach 00-shared-library-extraction.md
// § Phase 2.2 (Phase 0.2 of Project 02 Part 01 quest). Expressed as explicit
// toEqual() checks instead of toMatchSnapshot() for review-time legibility:
// what's exported is visible at a glance; deltas show up in plain diffs
// rather than .snap file noise.

const lib = require('@mbai460/photoapp-server');

test('top-level exports', () => {
  expect(Object.keys(lib).sort()).toEqual([
    'config',
    'middleware',
    'repositories',
    'schemas',
    'services',
  ]);
});

test('services.* exports', () => {
  expect(Object.keys(lib.services).sort()).toEqual(['aws', 'photoapp']);
});

test('services.aws exports', () => {
  expect(Object.keys(lib.services.aws).sort()).toEqual([
    'getBucket',
    'getBucketName',
    'getDbConn',
    'getRekognition',
  ]);
});

test('services.photoapp exports', () => {
  expect(Object.keys(lib.services.photoapp).sort()).toEqual([
    'deleteAll',
    'downloadImage',
    'getImageLabels',
    'getPing',
    'listImages',
    'listUsers',
    'searchImages',
    'uploadImage',
  ]);
});

test('middleware.* exports', () => {
  expect(Object.keys(lib.middleware).sort()).toEqual([
    'cleanupTempFile',
    'createErrorMiddleware',
    'createUploadMiddleware',
  ]);
});

test('middleware.createErrorMiddleware is a factory function', () => {
  expect(typeof lib.middleware.createErrorMiddleware).toBe('function');
  // Factory should return a function (the actual middleware) when called
  // with default args.
  expect(typeof lib.middleware.createErrorMiddleware()).toBe('function');
});

test('middleware.createUploadMiddleware is a factory function', () => {
  expect(typeof lib.middleware.createUploadMiddleware).toBe('function');
  // Factory should return a multer instance (object with single() method)
  // when called with default args.
  const upload = lib.middleware.createUploadMiddleware();
  expect(typeof upload.single).toBe('function');
});

test('schemas.* exports', () => {
  expect(Object.keys(lib.schemas).sort()).toEqual(['envelopes', 'rows']);
});

test('schemas.envelopes exports', () => {
  expect(Object.keys(lib.schemas.envelopes).sort()).toEqual([
    'errorResponse',
    'successResponse',
  ]);
});

test('schemas.rows exports', () => {
  expect(Object.keys(lib.schemas.rows).sort()).toEqual([
    'PHOTO_EXTENSIONS',
    'deriveKind',
    'imageRowToObject',
    'labelRowToObject',
    'searchRowToObject',
    'userRowToObject',
  ]);
});

test('config is loaded', () => {
  // config is the photoapp web-service config object (not photoapp-config.ini);
  // exact contents are populated in src/config.js — this just locks the shape.
  expect(typeof lib.config).toBe('object');
  expect(lib.config).not.toBeNull();
});

test('repositories.* exports (Phase 0.3 CL9 reconciliation)', () => {
  expect(Object.keys(lib.repositories).sort()).toEqual(['assets', 'labels', 'users']);
});

test('repositories.users exports', () => {
  expect(Object.keys(lib.repositories.users).sort()).toEqual(['countAll', 'findAll', 'findById']);
});

test('repositories.assets exports', () => {
  expect(Object.keys(lib.repositories.assets).sort()).toEqual([
    'deleteAll',
    'existsById',
    'findAll',
    'findById',
    'findByUserId',
    'insert',
    'resetAutoIncrement',
    'selectAllBucketkeys',
  ]);
});

test('repositories.labels exports', () => {
  expect(Object.keys(lib.repositories.labels).sort()).toEqual([
    'deleteAll',
    'findByAssetId',
    'findByLabelLike',
    'insertOne',
  ]);
});
