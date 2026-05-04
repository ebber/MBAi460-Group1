// Approach 01-foundation.md § Phase 2 (Express skeleton) + Phase 3 (observability).
//
// Mount order (D11/D12 from 00-overview-and-conventions.md): when /v2 and /v1
// land, /v2 mounts FIRST so /v2/images/:assetid doesn't shadow /v1's
// /image/:assetid; /v1 mounts at ROOT (Gradescope hits unprefixed paths).
//
//   PRESENT:
//     - request_id middleware (sets req.id; echoes X-Request-Id)   [Phase 3.2]
//     - pino-http logging (uses req.id for genReqId)               [Phase 3.3]
//     - express.json() body parser
//     - GET /healthz (liveness; outside version namespace)         [Phase 2]
//     - 404 fallback with library error envelope shape             [Phase 2]
//     - inline error middleware terminator (uses pino logger)      [Phase 2 / 3]
//
//   DEFERRED:
//     - GET /readyz (RDS + S3 probes)                              → Phase 4 § 4.2
//     - /v2 router (engineering surface)                           → workstream 04
//     - /v1 router at root (spec routes)                           → workstream 02
//     - error middleware via library factory + AppError hierarchy  → Phase 5
const express = require('express');

const requestId = require('./middleware/request_id');
const logging = require('./middleware/logging');
const logger = require('./observability/pino');

const app = express();

app.use(requestId);
app.use(logging);
app.use(express.json({ strict: false, limit: '50mb' }));

// Health endpoints — outside any version namespace.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'live' }));

// /v2 (when ENABLE_V2_ROUTES=1) and /v1 at root mount HERE — deferred to the
// route-implementation workstreams. Until then, every non-/healthz request
// falls through to the 404 below.

// 404 fallback — must precede the error middleware terminator.
app.use((req, res) => {
  res.status(404).json({
    message: 'error',
    error: `route not found: ${req.method} ${req.path}`,
  });
});

// Error middleware terminator — inline stub. Approach Phase 5 § Task 5.2 replaces
// this with `middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`
// from @mbai460/photoapp-server, parameterised by Project 02's mount-prefix-aware
// status-code map.
app.use((err, req, res, _next) => {
  logger.error({ err: err.message, reqId: req.id, path: req.path }, 'unhandled error');
  res.status(err.statusCode || 500).json({
    message: 'error',
    error: err.message || 'internal error',
  });
});

module.exports = app;
