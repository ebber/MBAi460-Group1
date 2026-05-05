//
// API function: GET /image_labels/:assetid (PDF) or /image/:assetid/labels (template).
//   — Gradescope filename-compatibility wrapper.
//
// Canonical implementation: routes/v1/image_labels.js (wired in app.js per
// PDF mount path).
// See api_delete_images.js header for the full wrapper-layer rationale and
// Plan.md § Phase 2.10 for the systematic-fix tracking.
//
// PDF spec response: { message: 'success', data: [<label>, ...] }
// PDF spec error envelope: { message: 'no such assetid', data: [] } @ 400
// (Iter-15: invalid input shape also returns 'no such assetid' per autograder.)
//

const { services } = require('@mbai460/photoapp-server');

// p-retry is ESM-only; dynamic-import wrapper matches the assignment template's pattern.
// Retry logic per PDF page 12 — pRetry `retries: 2` = 3 total attempts on the
// MySQL-bearing services.photoapp.getImageLabels() call.
const pRetry = (...args) => import('p-retry').then(({ default: pRetry }) => pRetry(...args));

exports.get_image_labels = async (request, response) => {
  try {
    const assetid = parseInt(request.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return response.status(400).json({
        message: 'no such assetid',
        data: [],
      });
    }

    let data;
    try {
      data = await pRetry(
        () => services.photoapp.getImageLabels(assetid),
        { retries: 2 },
      );
    } catch (err) {
      if (err && err.message === 'no such assetid') {
        return response.status(400).json({
          message: 'no such assetid',
          data: [],
        });
      }
      throw err;
    }

    response.status(200).json({ message: 'success', data });
  } catch (err) {
    response.status(500).json({ message: err.message, data: [] });
  }
};
