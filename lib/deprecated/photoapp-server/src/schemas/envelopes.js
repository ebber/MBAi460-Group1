// lib/photoapp-server/src/schemas/envelopes.js
//
// Response envelope helpers for PhotoApp surfaces.
//
// Shape conventions:
//   - successResponse({...extras}) -> { message: 'success', ...extras }
//       Part 03 callers: successResponse({ data }) -> { message: 'success', data }
//       Project 02 callers: successResponse({ M, N }) -> { message: 'success', M, N }
//       Project 02 callers: successResponse({ assetid }) -> { message: 'success', assetid }
//   - errorResponse(err|string, extras?) -> { message: 'error', error: <string>, ...extras }
//       Part 03 callers pass the error message string or Error object.
//       Project 02 controllers set req.errorShape directly for spec-compliant error bodies.
//
// CL9 bounded change (Phase 1 landing): successResponse made variadic so
// Project 02's per-route shapes ({M,N}, {assetid}, {userid,local_filename,data})
// can be expressed via a single helper. Part 03 callsites updated from
// successResponse(data) → successResponse({data}) to preserve the wire contract.

function successResponse(extras = {}) {
  return { message: 'success', ...extras };
}

function errorResponse(err, extras = {}) {
  const text = err && err.message ? err.message : String(err);
  return { message: 'error', error: text, ...extras };
}

module.exports = {
  successResponse,
  errorResponse,
};
