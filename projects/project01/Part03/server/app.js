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

const app = express();

// Support larger image uploads/downloads (preserved from baseline).
app.use(express.json({ strict: false, limit: '50mb' }));

// Liveness probe — deliberately outside /api/* (the PhotoApp API namespace).
// /api/ping (workstream 03) is the PhotoApp app-level ping that exercises
// S3 + RDS; /health is a server-level liveness signal that does not touch
// any external dependency.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'running' });
});

module.exports = app;
