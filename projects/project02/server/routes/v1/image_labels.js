// GET /image_labels/:assetid — Rekognition labels for an asset
//
// PDF spec response: { message: 'success', data: [<label>, ...] }
// PDF spec error envelope: { message: 'no such assetid', data: [] } @ 400
//
// Consumes lib's services.photoapp.getImageLabels(assetid). Lib does the
// validation (existsById) + label-fetch ordered by label ASC; the route
// translates the sentinel error message to the spec's 400 envelope shape.
//
// Iter-15 contract correction: invalid-assetid input (e.g., string) returns
// the same 'no such assetid' message as a missing-assetid lookup. Project 02
// autograder Test 3 / test_30 confirms this is the spec — even malformed
// input shape gets the same message as no-row-found, NOT a separate
// "assetid must be an integer" error. The reference impl just lets the int
// coercion produce NaN, and the DB lookup naturally returns no rows.

const { services } = require('@mbai460/photoapp-server');

module.exports = async function getImageLabels(req, res, next) {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return res.status(400).json({
        message: 'no such assetid',
        data: [],
      });
    }

    let data;
    try {
      data = await services.photoapp.getImageLabels(assetid);
    } catch (err) {
      if (err && err.message === 'no such assetid') {
        return res.status(400).json({
          message: 'no such assetid',
          data: [],
        });
      }
      throw err;
    }

    res.status(200).json({ message: 'success', data });
  } catch (err) {
    next(err);
  }
};
