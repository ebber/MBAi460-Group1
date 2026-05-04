// Approach 01-foundation.md § Phase 2 — partial Express App Skeleton.
//
// This is an iterative build of the production-shape app.js. Each piece below
// notes which Approach phase wires the full version:
//
//   PRESENT (this commit, Phase 2 partial):
//     - express.json() body parser
//     - GET /healthz (liveness; outside version namespace)
//     - 404 fallback with library success/error envelope shape
//     - inline error middleware terminator (logs to console.warn)
//
//   DEFERRED (named imports forward-referenced):
//     - request_id middleware                 → Approach Phase 3 § Task 3.2
//     - logging (pino-http)                   → Approach Phase 3 § Task 3.3
//     - pino logger module                    → Approach Phase 3 § Task 3.1
//     - GET /readyz (RDS + S3 probes)         → Approach Phase 4 § Task 4.2
//     - /v2 router (engineering surface)      → Approach Phase 4 of workstream 04
//     - /v1 router at root (spec routes)      → workstream 02 (02-web-service.md)
//     - error middleware via library factory  → Approach Phase 5 § Task 5.2
//     - error_config { statusCodeMap, errorShapeFor } → Approach Phase 5 § Task 5.1
//
// Mount order (D11/D12 from 00-overview-and-conventions.md): when /v2 and /v1
// land, /v2 mounts FIRST so /v2/images/:assetid doesn't shadow /v1's
// /image/:assetid; /v1 mounts at ROOT (Gradescope hits unprefixed paths).
const express = require('express');

const app = express();

// Body parser. Spec allows up to 50MB base64 payloads on /image upload.
app.use(express.json({ strict: false, limit: '50mb' }));

// Health endpoints — outside any version namespace.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'live' }));

// /v2 (when ENABLE_V2_ROUTES=1) and /v1 at root mount HERE — deferred to the
// route-implementation workstream. Until then, every non-/healthz request falls
// through to the 404 below, which is fine for sub-phase scaffolding.

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
  console.error({ err: err && err.message, path: req.path }, 'unhandled error');
  res.status(err.statusCode || 500).json({
    message: 'error',
    error: err.message || 'internal error',
  });
});

module.exports = app;
