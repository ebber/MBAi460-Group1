// lib/photoapp-server/src/schemas/rows.js
//
// Row-to-object converters and kind-derivation helper for PhotoApp.
// Originally part of server/schemas.js in Part 03; split out during Phase 0.2
// extraction. The split itself was the architectural decision: envelope
// helpers (envelopes.js) and row converters (this file) are different
// concerns that scale independently — Project 02 uses envelopes/* heavily
// (variadic shapes) but row converters are stable across both surfaces.
//
// The row-to-object converters are pass-through today: mysql2/promise already
// returns rows as objects keyed by column name. They exist as a stable seam
// so route handlers don't bind directly to the driver's row shape, and so
// any future schema rename (e.g., `localname` -> `local_filename`) lands in
// one place.

const path = require('path');

// Image extensions that classify an asset as kind='photo' (Q8 from Part 03).
// Everything else (including extensionless files) defaults to 'document'.
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif']);

function userRowToObject(row) {
  return {
    userid: row.userid,
    username: row.username,
    givenname: row.givenname,
    familyname: row.familyname,
  };
}

function imageRowToObject(row) {
  return {
    assetid: row.assetid,
    userid: row.userid,
    localname: row.localname,
    bucketkey: row.bucketkey,
    kind: row.kind,
  };
}

function labelRowToObject(row) {
  return {
    label: row.label,
    confidence: row.confidence,
  };
}

function searchRowToObject(row) {
  return {
    assetid: row.assetid,
    label: row.label,
    confidence: row.confidence,
  };
}

function deriveKind(filename) {
  const ext = path.extname(filename).toLowerCase();
  return PHOTO_EXTENSIONS.has(ext) ? 'photo' : 'document';
}

module.exports = {
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
  // Constants exposed for tests / consumers that need to know what counts:
  PHOTO_EXTENSIONS,
};
