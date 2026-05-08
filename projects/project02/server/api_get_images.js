//
// API function: GET /images  — Gradescope filename-compatibility wrapper.
//
// Canonical implementation: routes/v1/images.js (wired in app.js).
// See api_delete_images.js header for the full wrapper-layer rationale and
// Plan.md § Phase 2.10 for the systematic-fix tracking.
//
// PDF spec response: { message: 'success', data: [<image>, ...] }
// Optional `?userid=<int>` query param filters by user.
//
// Retry logic per PDF page 12 — pRetry `retries: 2` = 3 total attempts.
//

const { services } = require('./src/photoapp-core');

// p-retry is ESM-only; dynamic-import wrapper matches the assignment template's pattern.
const pRetry = (...args) => import('p-retry').then(({ default: pRetry }) => pRetry(...args));

exports.get_images = async (request, response) => {
  try {
    let userid;
    if (request.query && request.query.userid !== undefined && request.query.userid !== '') {
      userid = parseInt(request.query.userid, 10);
      if (Number.isNaN(userid)) {
        return response.status(400).json({
          message: 'userid must be an integer if provided',
          data: [],
        });
      }
    }
    const data = await pRetry(() => services.photoapp.listImages(userid), { retries: 2 });
    response.status(200).json({ message: 'success', data });
  } catch (err) {
    response.status(500).json({ message: err.message, data: [] });
  }
};
