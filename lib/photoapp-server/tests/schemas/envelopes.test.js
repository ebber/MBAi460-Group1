// lib/photoapp-server/tests/schemas/envelopes.test.js
//
// Unit tests for envelope helpers (successResponse, errorResponse).
// Originally part of server/schemas.test.js in Part 03; split out during
// Phase 0.2 alongside the schemas.js → envelopes.js + rows.js split. The
// row-converter + deriveKind tests live in tests/schemas/rows.test.js.
//
// CL9 note: successResponse made variadic in Phase 1 (01-foundation.md);
// callers pass {data} / {M,N} / {assetid} etc. — the message:'success' prefix
// is added by the helper. Wire contract for all existing callers is unchanged.

const { successResponse, errorResponse } = require('../../src/schemas/envelopes');

// Part 03 call pattern: successResponse({ data }) → {message:'success', data}
test('successResponse({data}) produces Part 03-compatible envelope', () => {
  const data = [{ assetid: 1, userid: 80001 }];
  expect(successResponse({ data })).toEqual({ message: 'success', data });
});

// Project 02 call patterns
test('successResponse({M, N}) produces ping envelope', () => {
  expect(successResponse({ M: 5, N: 10 })).toEqual({ message: 'success', M: 5, N: 10 });
});

test('successResponse({assetid}) produces upload envelope', () => {
  expect(successResponse({ assetid: 42 })).toEqual({ message: 'success', assetid: 42 });
});

test('successResponse({userid, local_filename, data}) produces download envelope', () => {
  const env = successResponse({ userid: 80001, local_filename: 'img.jpg', data: 'base64' });
  expect(env).toEqual({ message: 'success', userid: 80001, local_filename: 'img.jpg', data: 'base64' });
});

test('successResponse() with no args returns {message:"success"}', () => {
  expect(successResponse()).toEqual({ message: 'success' });
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

test('errorResponse spreads extras into the envelope', () => {
  expect(errorResponse('no such assetid', { assetid: -1 })).toEqual({
    message: 'error',
    error: 'no such assetid',
    assetid: -1,
  });
});
