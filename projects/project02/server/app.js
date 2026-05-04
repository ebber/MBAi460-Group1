// Approach 01-foundation.md § Phase 2 (Express skeleton) + Phase 3 (observability)
//                           + Phase 5 (error middleware via library factory).
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
//     - 404 fallback                                               [Phase 2]
//     - error middleware via library factory + Project 02 DI       [Phase 5]
//
//   DEFERRED:
//     - GET /readyz (RDS + S3 probes)                              → Phase 4/7 (needs pool)
//     - /v2 router (engineering surface)                           → workstream 04
//     - /v1 router at root (spec routes)                           → workstream 02
const express = require('express');
const { middleware } = require('@mbai460/photoapp-server');

const requestId = require('./middleware/request_id');
const logging = require('./middleware/logging');
const { statusCodeMap, errorShapeFor } = require('./middleware/error_config');
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

// Error middleware — library factory with Project 02's mount-prefix-aware DI config.
// statusCodeMap: /v1 → spec codes (D7); /v2 → REST-correct codes.
// errorShapeFor: uses req.errorShape when set by route controllers (workstream 02);
//                falls back to generic error envelope during Foundation.
app.use(middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger }));

module.exports = app;
