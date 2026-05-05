// Approach 01-foundation.md § Phase 3 Task 3.3.
// pino-http wired with request_id (Task 3.2). genReqId returns the id the
// request_id middleware already set on req, so the per-request log line
// shares the X-Request-Id sent back to the caller — full request trace.
//
// Mount order in app.js: request_id BEFORE logging so req.id is populated by
// the time pino-http reads it.
const pinoHttp = require('pino-http');
const logger = require('../observability/pino');

const logging = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});

module.exports = logging;
