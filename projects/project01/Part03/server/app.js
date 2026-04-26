//
// PhotoApp Express application — exports the configured `app` instance.
// Listening on a port is the responsibility of `server.js` (the entrypoint).
// Splitting export from listen() lets Jest + supertest import the app
// without binding a real port.
//
// The legacy `app.get('/', ...)` uptime handler and the legacy
// `api_get_*` requires were removed in Phase 2 of the Server Foundation
// workstream (see MetaFiles/Approach/02-server-foundation.md and
// MetaFiles/refactor-log.md 2026-04-26). The legacy `server/api_*.js`
// source files remain on disk as a behavioral reference per the
// Part 03 TODO queue; they are simply not wired into the app any more.
//
// Future mount order (load-bearing — see 02 §7):
//   1. JSON middleware (already mounted below)
//   2. /health liveness probe       → arrives in Phase 3
//   3. /api router                  → arrives in Phase 7
//   4. express.static(frontend/dist)→ arrives in Phase 5
//   5. SPA index fallback for /     → arrives in Phase 5
//

const express = require('express');
const path = require('path');
const photoappRoutes = require('./routes/photoapp_routes');

const app = express();

// Resolve the frontend build artifact directory once, so route handlers
// can fall back to index.html for the SPA. UI workstream produces a real
// Vite build into this directory; Phase 4 places a placeholder index.html.
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');

// ---- Mount order is LOAD-BEARING (see 02-server-foundation.md §7) ----
// 1. JSON body parser (preserved from baseline; supports large uploads).
// 2. /health server liveness probe (outside /api/*).
// 3. /api router (BEFORE static so the static catchall cannot absorb /api).
// 4. express.static for frontend/dist.
// 5. SPA index fallback for /.
// ----------------------------------------------------------------------

// 1. JSON middleware
app.use(express.json({ strict: false, limit: '50mb' }));

// 2. Liveness probe — deliberately outside /api/*. /api/ping (workstream 03)
//    is the PhotoApp app-level ping that exercises S3 + RDS; /health is a
//    server-level signal that does not touch any external dependency.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'running' });
});

// 3. /api router (placeholder in Phase 7; real endpoints in workstream 03).
//    MUST be mounted BEFORE express.static.
app.use('/api', photoappRoutes);

// 4. Static frontend assets.
app.use(express.static(FRONTEND_DIST));

// 5. SPA index fallback for /.
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

module.exports = app;
