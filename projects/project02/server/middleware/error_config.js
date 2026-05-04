// Approach 01-foundation.md § Phase 5 Task 5.2
// DI config for the library's createErrorMiddleware factory.
// Not the middleware itself — that lives in @mbai460/photoapp-server.
//
// statusCodeMap(err, req):  mount-prefix-aware HTTP status selection.
//   /v1 → spec status codes only (D7: 200/400/500; NotFoundError → 400 not 404)
//   /v2 → REST-correct codes (NotFoundError → 404; ConflictError → 409)
//
// errorShapeFor(err, req):  builds the response body.
//   Route controllers set req.errorShape before delegating to the service so
//   error responses carry the route-family's spec-required placeholder fields
//   (e.g., { message: 'no such userid', assetid: -1 } for POST /image routes).
//   Workstream 02 populates req.errorShape per route; Foundation falls back to
//   the generic library error envelope.

const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} = require('./errors');
const { schemas } = require('@mbai460/photoapp-server');
const { errorResponse } = schemas.envelopes;

function isV2(req) {
  return Boolean(req && req.baseUrl && req.baseUrl.startsWith('/v2'));
}

function statusCodeMap(err, req) {
  if (err instanceof BadRequestError) return 400;
  if (err instanceof NotFoundError) return isV2(req) ? 404 : 400;
  if (err instanceof ConflictError) return isV2(req) ? 409 : 400;
  if (err instanceof ServiceUnavailableError) return 503;
  // Multer upload-size errors
  if (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) return 400;
  // Library string-match errors (backward compat with Part 03 service layer)
  if (err && err.message === 'no such userid') return 400;
  if (err && err.message === 'no such assetid') return isV2(req) ? 404 : 400;
  return 500;
}

function errorShapeFor(err, req) {
  if (req && req.errorShape) return req.errorShape;
  return errorResponse(err && err.message ? err.message : 'internal server error');
}

module.exports = { statusCodeMap, errorShapeFor };
