// lib/photoapp-server/tests/schemas/rows.test.js
//
// Unit tests for row-to-object converters + deriveKind helper.
// Originally part of server/schemas.test.js in Part 03; split out during
// Phase 0.2 alongside the schemas.js → envelopes.js + rows.js split. The
// envelope helper tests live in tests/schemas/envelopes.test.js.

const {
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
} = require('../../src/schemas/rows');

// ----- Row-to-object converters -----

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

// ----- deriveKind(filename) -----

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
