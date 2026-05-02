// lib/photoapp-server/src/schemas/envelopes.js
//
// Response envelope helpers for PhotoApp surfaces.
//
// Shape conventions (Part 03 contract):
//   - successResponse(data) -> { message: 'success', data }
//   - errorResponse(err)    -> { message: 'error', error: <string> }
//
// Project 02 (Phase 1+) will introduce a *variadic* successResponse that
// satisfies its per-route shapes (e.g., {message, M, N} for /ping;
// {message, assetid} for /image upload) from a single helper. That landing
// is in 01-foundation.md; for Phase 0.2 (Part 03 internals-only), the
// uniform {message, data} shape is preserved exactly.

function successResponse(data) {
  return { message: 'success', data };
}

function errorResponse(err) {
  const text = err && err.message ? err.message : String(err);
  return { message: 'error', error: text };
}

module.exports = {
  successResponse,
  errorResponse,
};
