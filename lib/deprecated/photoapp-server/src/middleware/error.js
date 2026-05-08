// lib/photoapp-server/src/middleware/error.js
//
// Centralized Express error-handling middleware factory.
// Configurable via DI (CL3): consumers pass { statusCodeMap, errorShapeFor, logger };
// defaults reproduce Project 01 Part 03's pre-extraction behaviour exactly so
// Part 03 callers can pass createErrorMiddleware({}) and observe zero change.
//
// Default mapping (exact-match on err.message; not regex — so future errors
// like "no such userid in shard 3" don't accidentally collapse to 400):
//
//   err.message === 'no such userid'        -> 400, error: 'no such userid'
//   err.message === 'no such assetid'       -> 404, error: 'no such assetid'
//   err.code starts with 'LIMIT_' (multer)  -> 400, error: <multer message>
//   anything else                           -> 500, error: 'internal server error'
//                                              (raw err logged via logger.error;
//                                               original message NOT echoed back)
//
// Project 02 (Phase 1+) will pass a mount-prefix-aware statusCodeMap so /v2
// routes get REST-correct 404s while /v1 keeps the spec status codes. The
// library's `createErrorMiddleware` is the single source; consumers diverge
// only via DI config.
//
// Express's signal that a middleware is an error handler is its 4-arg
// signature (err, req, res, next). The `next` parameter remains in the
// returned function's signature even if unused, otherwise Express treats it
// as a normal (req, res, next) middleware and never invokes it on error paths.

const { errorResponse } = require('../schemas/envelopes');

function defaultStatusCodeMap(err) {
  if (err && err.message === 'no such userid') return 400;
  if (err && err.message === 'no such assetid') return 404;
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) return 400;
  return 500;
}

function defaultErrorShapeFor(err) {
  if (err && err.message === 'no such userid') return errorResponse(err.message);
  if (err && err.message === 'no such assetid') return errorResponse(err.message);
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) return errorResponse(err.message);
  return errorResponse('internal server error');
}

function createErrorMiddleware({
  statusCodeMap = defaultStatusCodeMap,
  errorShapeFor = defaultErrorShapeFor,
  logger = console,
} = {}) {
  return function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
    const status = statusCodeMap(err, req);
    if (status === 500) {
      logger.error('UNHANDLED ERROR:', err);
    }
    return res.status(status).json(errorShapeFor(err, req));
  };
}

module.exports = {
  createErrorMiddleware,
  // Defaults exposed for consumers (or tests) that want to compose them:
  defaultStatusCodeMap,
  defaultErrorShapeFor,
};
