// server/middleware/error.js
//
// Centralized Express error-handling middleware (Phase 7 / Task 7.1).
// See MetaFiles/Approach/03-api-routes.md §Phase 7 and
// MetaFiles/Approach/00-coordination-and-contracts.md §Error Contract.
//
// Mapping (exact-match on err.message; not regex — so future errors like
// "no such userid in shard 3" don't accidentally collapse to 400):
//
//   err.message === 'no such userid'        -> 400, error: 'no such userid'
//   err.message === 'no such assetid'       -> 404, error: 'no such assetid'
//   err.code starts with 'LIMIT_' (multer)  -> 400, error: <multer message>
//   anything else                           -> 500, error: 'internal server error'
//                                              (raw err logged via console.error;
//                                               original message is NOT echoed
//                                               back in the response body)
//
// Express's signal that a middleware is an error handler is its 4-arg
// signature (err, req, res, next). The `next` parameter must remain in the
// signature even if unused, otherwise Express treats this as a normal
// (req, res, next) middleware and never invokes it on error paths.

const { errorResponse } = require('../schemas');

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err && err.message === 'no such userid') {
    return res.status(400).json(errorResponse(err.message));
  }
  if (err && err.message === 'no such assetid') {
    return res.status(404).json(errorResponse(err.message));
  }
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) {
    return res.status(400).json(errorResponse(err.message));
  }
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json(errorResponse('internal server error'));
}

module.exports = errorMiddleware;
