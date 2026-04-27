//
// Express router for the PhotoApp /api/* contract.
// Mounted at /api in server/app.js.
//
// Phase 6 (Workstream 03 — API Routes): replaces the Server Foundation 02
// placeholder handler with the 8 real /api/* endpoints, each delegating to
// `services/photoapp`. Routes register WITHOUT the `/api` prefix; the
// `app.use('/api', ...)` mount in `app.js` makes them `/api/*` from the
// client's view.
//
// Each handler wraps the body in try/catch and forwards service-thrown
// exceptions to `next(err)`. Mapping those exceptions to status codes
// (e.g. 'no such userid' -> 400, 'no such assetid' -> 404) is the job of
// the error middleware (Phase 7). Validation that lives IN the route
// (non-int ids, missing file, missing label) returns inline 400 envelopes
// using `errorResponse`.
//

const express = require('express');
const router = express.Router();
const photoapp = require('../services/photoapp');
const { upload } = require('../middleware/upload');
const { successResponse, errorResponse } = require('../schemas');

// GET /api/ping
router.get('/ping', async (req, res, next) => {
  try {
    const data = await photoapp.getPing();
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// GET /api/users
router.get('/users', async (req, res, next) => {
  try {
    const data = await photoapp.listUsers();
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// GET /api/images (with optional ?userid=)
router.get('/images', async (req, res, next) => {
  try {
    let userid;
    if (req.query.userid !== undefined) {
      userid = parseInt(req.query.userid, 10);
      if (Number.isNaN(userid)) {
        return res.status(400).json(errorResponse('invalid userid'));
      }
    }
    const data = await photoapp.listImages(userid);
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// POST /api/images (multipart upload)
router.post('/images', upload.single('file'), async (req, res, next) => {
  try {
    const userid = parseInt(req.body.userid, 10);
    if (Number.isNaN(userid)) {
      return res.status(400).json(errorResponse('invalid userid'));
    }
    if (!req.file) {
      return res.status(400).json(errorResponse('missing file'));
    }
    const data = await photoapp.uploadImage(userid, req.file);
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// GET /api/images/:assetid/file (streamed S3 body)
router.get('/images/:assetid/file', async (req, res, next) => {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return res.status(400).json(errorResponse('invalid assetid'));
    }
    const { contentType, s3Result } = await photoapp.downloadImage(assetid);
    res.setHeader('Content-Type', contentType);
    s3Result.Body.pipe(res);
  } catch (err) { next(err); }
});

// GET /api/images/:assetid/labels
router.get('/images/:assetid/labels', async (req, res, next) => {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) {
      return res.status(400).json(errorResponse('invalid assetid'));
    }
    const data = await photoapp.getImageLabels(assetid);
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// GET /api/search?label=...
router.get('/search', async (req, res, next) => {
  try {
    const raw = req.query.label;
    if (typeof raw !== 'string' || !raw.trim()) {
      return res.status(400).json(errorResponse('missing required query param: label'));
    }
    const data = await photoapp.searchImages(raw.trim());
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// DELETE /api/images
router.delete('/images', async (req, res, next) => {
  try {
    const data = await photoapp.deleteAll();
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

module.exports = router;
