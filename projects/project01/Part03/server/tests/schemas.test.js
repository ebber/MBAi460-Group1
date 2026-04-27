// Unit tests for server/schemas.js — response envelope helpers,
// row-to-object converters, and deriveKind() (per Part 03 Phase 1).

const {
  successResponse,
  errorResponse,
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
} = require('../schemas');

// ----- Task 1.1: Envelope helpers -----

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

// ----- Task 1.2: Row-to-object converters -----

test('userRowToObject normalizes a mysql2 user row', () => {
  expect(
    userRowToObject({
      userid: 80001,
      username: 'p_sarkar',
      givenname: 'Pooja',
      familyname: 'Sarkar',
    })
  ).toEqual({
    userid: 80001,
    username: 'p_sarkar',
    givenname: 'Pooja',
    familyname: 'Sarkar',
  });
});

test('imageRowToObject normalizes a mysql2 asset row including kind (Q8)', () => {
  expect(
    imageRowToObject({
      assetid: 1001,
      userid: 80001,
      localname: '01degu.jpg',
      bucketkey: 'p_sarkar/uuid-01degu.jpg',
      kind: 'photo',
    })
  ).toEqual({
    assetid: 1001,
    userid: 80001,
    localname: '01degu.jpg',
    bucketkey: 'p_sarkar/uuid-01degu.jpg',
    kind: 'photo',
  });
});

test('labelRowToObject normalizes a (label, confidence) row', () => {
  expect(labelRowToObject({ label: 'Animal', confidence: 99 })).toEqual({
    label: 'Animal',
    confidence: 99,
  });
});

test('searchRowToObject normalizes a (assetid, label, confidence) row', () => {
  expect(
    searchRowToObject({ assetid: 1001, label: 'Animal', confidence: 99 })
  ).toEqual({ assetid: 1001, label: 'Animal', confidence: 99 });
});

// ----- Task 1.3: deriveKind(filename) -----

test('deriveKind returns photo for image extensions', () => {
  expect(deriveKind('a.jpg')).toBe('photo');
  expect(deriveKind('b.JPEG')).toBe('photo');
  expect(deriveKind('c.png')).toBe('photo');
  expect(deriveKind('d.heic')).toBe('photo');
});

test('deriveKind returns document for non-image extensions', () => {
  expect(deriveKind('e.pdf')).toBe('document');
  expect(deriveKind('f.docx')).toBe('document');
  expect(deriveKind('g.txt')).toBe('document');
  expect(deriveKind('h.zip')).toBe('document');
});

test('deriveKind defaults to document for unknown / extensionless files', () => {
  // Multer accepts ALL file types in Part 03 (Q9). Anything that isn't a
  // recognized image extension is classified as document; safer default
  // because the asset still gets stored in S3 + DB with kind='document',
  // and the Future-State Textract workstream can pick up these rows for
  // OCR processing later.
  expect(deriveKind('weird.xyz')).toBe('document');
  expect(deriveKind('no-extension')).toBe('document');
});
