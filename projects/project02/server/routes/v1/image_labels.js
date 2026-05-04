// GET /image_labels/:assetid — Rekognition labels for an asset
//
// PDF spec response: { message: 'success', data: [<label>, ...] }
// PDF spec error envelope: { message: 'no such assetid', data: [] } @ 400
//                          { message: 'assetid must be an integer', data: [] } @ 400
//
// Consumes lib's services.photoapp.getImageLabels(assetid). Lib does the
// validation (existsById) + label-fetch ordered by confidence DESC; the
// route translates the sentinel error message to the spec's 400 envelope
// shape.

const { services } = require('@mbai460/photoapp-server');

module.exports = async function getImageLabels(req, res, next) {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return res.status(400).json({
        message: 'assetid must be an integer',
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
