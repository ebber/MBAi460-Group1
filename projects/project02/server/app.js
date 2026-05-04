// Approach 01-foundation.md § Phase 2 (Express skeleton) + Phase 3 (observability)
//                           + Phase 5 (error middleware via library factory)
//                           + Phase 4 (readyz probe).
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
//     - GET /readyz  (RDS + S3 readiness probe)                    [Phase 4]
//     - 404 fallback                                               [Phase 2]
//     - error middleware via library factory + Project 02 DI       [Phase 5]
//
//   DEFERRED:
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

// Health endpoints — outside any version namespace (F2 convention).
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'live' }));
app.get('/readyz', require('./routes/_internal/readyz'));

// /v1 spec routes mounted at ROOT (D12 — Gradescope hits unprefixed paths).
// /v2 (engineering surface; ENABLE_V2_ROUTES=1 gate) is workstream 04 territory;
// when enabled it mounts BEFORE /v1 (D11 — prevents /v2/images/:assetid being
// shadowed by /v1's /image/:assetid).
//
// Mount order within /v1 matters: more-specific paths before more-general ones.
// /image_labels/:assetid + /images_with_label/:label are explicit before
// /image/:assetid (which would otherwise capture /image_labels via /image/...).
app.get('/ping', require('./routes/v1/ping'));
app.get('/users', require('./routes/v1/users'));
app.get('/image_labels/:assetid', require('./routes/v1/image_labels'));
app.get('/images_with_label/:label', require('./routes/v1/images_with_label'));
app.get('/image/:assetid', require('./routes/v1/image_get'));
app.post('/image/:userid', require('./routes/v1/image_post'));
app.delete('/images', require('./routes/v1/delete_images'));
app.get('/images', require('./routes/v1/images'));

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
