//
// Express router for the PhotoApp /api/* contract.
// Mounted at /api in server/app.js.
//
// Phase 7 (Server Foundation): a single placeholder GET /api endpoint
// that confirms the namespace is reserved for the API Routes workstream.
// Workstream 03 replaces the placeholder with real /api/ping, /api/users,
// /api/images, /api/search, etc., wired to the PhotoApp service module.
//

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'success',
    data: {
      service: 'photoapp-api',
      status: 'placeholder',
    },
  });
});

module.exports = router;
