// server/schemas.js
//
// Response envelope helpers, row-to-object converters, and the kind-derivation
// helper for Part 03 of Project 01 (PhotoApp). See MetaFiles/Approach/03-api-routes.md
// Phase 1 (Tasks 1.1, 1.2, 1.3) and DesignDecisions.md Q8.
//
// Shape conventions:
//   - successResponse(data) -> { message: 'success', data }
//   - errorResponse(err)    -> { message: 'error', error: <string> }
//
// The row-to-object converters are pass-through today: mysql2/promise already
// returns rows as objects keyed by column name. They exist as a stable seam so
// route handlers don't bind directly to the driver's row shape.

const path = require('path');

// Image extensions that classify an asset as kind='photo' (Q8).
// Everything else (including extensionless files) defaults to 'document'.
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif']);

function successResponse(data) {
  return { message: 'success', data };
}

function errorResponse(err) {
  const text = err && err.message ? err.message : String(err);
  return { message: 'error', error: text };
}

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
  successResponse,
  errorResponse,
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
};
