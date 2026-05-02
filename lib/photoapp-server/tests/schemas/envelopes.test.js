// lib/photoapp-server/tests/schemas/envelopes.test.js
//
// Unit tests for envelope helpers (successResponse, errorResponse).
// Originally part of server/schemas.test.js in Part 03; split out during
// Phase 0.2 alongside the schemas.js → envelopes.js + rows.js split. The
// row-converter + deriveKind tests live in tests/schemas/rows.test.js.

const { successResponse, errorResponse } = require('../../src/schemas/envelopes');

test('successResponse wraps data', () => {
  expect(successResponse({ count: 3 })).toEqual({
    message: 'success',
    data: { count: 3 },
  });
});

test('errorResponse wraps error message as string', () => {
  expect(errorResponse('no such userid')).toEqual({
    message: 'error',
    error: 'no such userid',
  });
});

test('errorResponse coerces Error instances to message string', () => {
  expect(errorResponse(new Error('boom'))).toEqual({
    message: 'error',
    error: 'boom',
  });
});
