//
// PhotoApp Express application — exports the configured `app` instance.
// Listening is the responsibility of `server.js` (the entrypoint); splitting
// export from listen() lets Jest + supertest import the app without binding
// a real port.
//
// The legacy `server/api_*.js` files from the Project 2 baseline remain on
// disk as a behavioral reference per the Part 03 TODO queue; they are not
// wired into this app. The /api contract is served by the placeholder
// router below and replaced with real endpoints by workstream 03.
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

// 3a. /api 404 fallback — JSON envelope for unmatched /api/* paths.
//     Mounted after the real /api router so it only catches what fell
//     through; ensures every /api/* response has the same shape as the
//     rest of the API (no Express default HTML 404). The SPA fallback
//     below already excludes /api/* so it never reaches this handler
//     for non-/api paths.
app.use('/api', (req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

// 4. Static frontend assets.
app.use(express.static(FRONTEND_DIST));

// 5. SPA fallback — serve index.html for any unmatched GET so react-router
//    can handle client-side routes (/login, /upload, /asset/:id, /profile,
//    /help, /404, etc.). /api/* paths that fall through to here are
//    intentionally NOT caught — they should return 404 / error envelope
//    via the error middleware below, not get masked by the SPA HTML.
//
//    Express 5 changed path-to-regexp; '*' is no longer valid. Using
//    `app.use` middleware instead, which bypasses path parsing entirely.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.use(require('./middleware/error'));

module.exports = app;
