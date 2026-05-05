//
// API function: GET /image/:assetid  — Gradescope filename-compatibility wrapper.
//
// Canonical implementation: routes/v1/image_get.js (wired in app.js).
// See api_delete_images.js header for the full wrapper-layer rationale and
// Plan.md § Phase 2.10 for the systematic-fix tracking.
//
// This is the second-failure file (Gradescope rejected the
// p02-server-submission-20260505T044703Z resubmit with
// "Expecting 'api_get_image.js' file as part of web service"), confirming
// option (A) from Phase 2.10 — generalize wrappers to all 8 routes.
//
// PDF spec response: { message: 'success', userid, local_filename, data:base64 }
// PDF spec error envelope: { message: 'no such assetid', userid: -1 } @ 400
//                          { message: 'assetid must be an integer', userid: -1 } @ 400
//

const { services } = require('@mbai460/photoapp-server');

// p-retry is ESM-only; dynamic-import wrapper matches the assignment template's pattern.
// Retry logic per PDF page 12 — pRetry `retries: 2` = 3 total attempts on the
// MySQL-bearing services.photoapp.downloadImage() call (assets.findById +
// S3 GetObject under one orchestrator).
const pRetry = (...args) => import('p-retry').then(({ default: pRetry }) => pRetry(...args));

exports.get_image = async (request, response) => {
  try {
    const assetid = parseInt(request.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return response.status(400).json({
        message: 'assetid must be an integer',
        userid: -1,
      });
    }

    let result;
    try {
      result = await pRetry(
        () => services.photoapp.downloadImage(assetid),
        { retries: 2 },
      );
    } catch (err) {
      if (err && err.message === 'no such assetid') {
        return response.status(400).json({
          message: 'no such assetid',
          userid: -1,
        });
      }
      throw err;
    }

    const { userid, localname, s3Result } = result;

    // Stream s3Result.Body to buffer; AWS SDK v3 returns a Readable.
    const chunks = [];
    if (s3Result.Body && typeof s3Result.Body[Symbol.asyncIterator] === 'function') {
      for await (const chunk of s3Result.Body) {
        chunks.push(chunk);
      }
    } else if (s3Result.Body && typeof s3Result.Body.transformToByteArray === 'function') {
      const bytes = await s3Result.Body.transformToByteArray();
      chunks.push(Buffer.from(bytes));
    } else {
      throw new Error('unexpected s3 response body shape');
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');

    response.status(200).json({
      message: 'success',
      userid,
      local_filename: localname,
      data: base64,
    });
  } catch (err) {
    response.status(500).json({ message: err.message, userid: -1 });
  }
};
