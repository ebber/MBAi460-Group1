// Sub-phase 1.0 shell. Real app construction (mount order, error middleware DI,
// observability, /healthz + /readyz, /v1 + /v2 routers, library service wiring)
// lands in Approach Phases 2–5. The /__bootcheck smoke route was deleted at
// sub-phase 1.0 close once the symlink was end-to-end verified; the permanent
// CI guard for the @mbai460/photoapp-server import shape lives in
// tests/unit/library_resolution.test.js.
const express = require('express');

const app = express();

module.exports = app;
