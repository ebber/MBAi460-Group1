// POST /image/:userid — upload an image (base64 in body) for a user
//
// PDF spec body: { local_filename: string, data: base64 }
// PDF spec success: { message: 'success', assetid: <int> }
// PDF spec error envelope: { message: <reason>, assetid: -1 } @ 400
//
// Consumes lib's services.photoapp.uploadImage(userid, multerFile). The
// lib expects a multerFile-shaped object with `.path` + `.originalname`;
// this route adapts base64 → temp file → multerFile shape. The lib's
// uploadImage handles the temp-file cleanup in its own finally block
// (via cleanupTempFile), so the route doesn't need to.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { services } = require('@mbai460/photoapp-server');

module.exports = async function postImage(req, res, next) {
  try {
    const userid = parseInt(req.params.userid, 10);
    if (Number.isNaN(userid)) {
      return res.status(400).json({
        message: 'userid must be an integer',
        assetid: -1,
      });
    }

    const { local_filename, data } = req.body || {};
    if (data === undefined || local_filename === undefined) {
      return res.status(400).json({
        message: 'missing required body fields: local_filename, data',
        assetid: -1,
      });
    }

    // Decode base64 to a temp file (lib expects multerFile-shaped input)
    let tmpPath;
    try {
      const buffer = Buffer.from(data, 'base64');
      tmpPath = path.join(
        os.tmpdir(),
        `p02-upload-${Date.now()}-${userid}-${path.basename(local_filename)}`,
      );
      fs.writeFileSync(tmpPath, buffer);
    } catch (decodeErr) {
      return res.status(400).json({ message: 'invalid base64 data', assetid: -1 });
    }

    const multerFile = { path: tmpPath, originalname: local_filename };

    try {
      const { assetid } = await services.photoapp.uploadImage(userid, multerFile);
      return res.status(200).json({ message: 'success', assetid });
    } catch (err) {
      if (err && err.message === 'no such userid') {
        return res.status(400).json({ message: 'no such userid', assetid: -1 });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};
