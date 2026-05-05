//
// API function: GET /users  — Gradescope filename-compatibility wrapper.
//
// Canonical implementation: routes/v1/users.js (wired in app.js).
// See api_delete_images.js header for the full wrapper-layer rationale and
// Plan.md § Phase 2.10 for the systematic-fix tracking.
//
// PDF spec response: { message: 'success', data: [<user>, ...] }
//
// Retry logic per PDF page 12 — pRetry `retries: 2` = 3 total attempts.
//

const { services } = require('@mbai460/photoapp-server');

// p-retry is ESM-only; dynamic-import wrapper matches the assignment template's pattern.
const pRetry = (...args) => import('p-retry').then(({ default: pRetry }) => pRetry(...args));

exports.get_users = async (request, response) => {
  try {
    const data = await pRetry(
      () => services.photoapp.listUsers(),
      { retries: 2 },
    );
    response.status(200).json({ message: 'success', data });
  } catch (err) {
    response.status(500).json({ message: err.message, data: [] });
  }
};
