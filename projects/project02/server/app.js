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
const config = require('./config.js');

const requestId = require('./middleware/request_id');
const logging = require('./middleware/logging');
const { statusCodeMap, errorShapeFor } = require('./middleware/error_config');
const logger = require('./observability/pino');

// Configure AWS to read credentials from our photoapp config file.
process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config_filename;

const app = express();

app.use(requestId);
app.use(logging);
app.use(express.json({ strict: false, limit: '50mb' }));

// Health endpoints — outside any version namespace.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'live' }));
app.get('/readyz', require('./routes/_internal/readyz'));

// PhotoApp API routes (Gradescope-graded, no prefix).
app.get('/ping', require('./api_get_ping.js').get_ping);
app.get('/users', require('./api_get_users.js').get_users);
app.get('/images', require('./api_get_images.js').get_images);
app.post('/image', require('./api_post_image.js').post_image);
// /images/search MUST be before /image/:assetid to avoid routing conflict.
app.get('/images/search', require('./api_get_images_search.js').get_images_search);
app.get('/image/:assetid', require('./api_get_image.js').get_image);
app.get('/image/:assetid/labels', require('./api_get_image_labels.js').get_image_labels);
app.delete('/images', require('./api_delete_images.js').delete_images);

// 404 fallback — must precede the error middleware terminator.
app.use((req, res) => {
  res.status(404).json({
    message: 'error',
    error: `route not found: ${req.method} ${req.path}`,
  });
});

// Error middleware — library factory with Project 02's mount-prefix-aware DI config.
app.use(middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger }));

module.exports = app;
