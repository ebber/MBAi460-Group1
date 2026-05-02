// lib/photoapp-server/src/middleware/upload.js
//
// Multipart upload middleware factory.
// Configurable via DI (CL3): consumers pass { destDir, sizeLimit }; defaults
// reproduce Project 01 Part 03's pre-extraction behaviour (50 MB limit;
// os.tmpdir()/photoapp-uploads as the staging dir).
//
// Per Approach DesignDecisions (Q9 in Part 03), this layer accepts ALL file
// types — photos and documents both flow through the upload service which
// branches on `kind`. Photos go through Rekognition; documents are stored
// as-is. No MIME filtering at this layer.
//
// `cleanupTempFile(absPath)` is the success/failure-path helper used by the
// upload service to remove the multer-staged temp file from the dest dir
// after the file has been streamed to S3 (or the request has failed). Best-
// effort; never throws.
//
// Project 02 (Phase 1+) /v1 routes use JSON+base64 (no multer); Project 02
// mounts createUploadMiddleware only on /v2 engineering routes via this same
// factory.

const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const DEFAULT_TEMP_DIR = path.join(os.tmpdir(), 'photoapp-uploads');
const DEFAULT_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB per file (Part 03 baseline)

function createUploadMiddleware({
  destDir = DEFAULT_TEMP_DIR,
  sizeLimit = DEFAULT_SIZE_LIMIT,
} = {}) {
  return multer({
    dest: destDir,
    limits: { fileSize: sizeLimit },
  });
}

function cleanupTempFile(absPath) {
  try {
    if (absPath && fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }
  } catch (_err) {
    // Swallow — cleanup is best-effort; the temp dir is OS-managed and
    // a leaked file is non-fatal. Never throw from this helper.
  }
}

module.exports = {
  createUploadMiddleware,
  cleanupTempFile,
  // Default constants exposed for consumers (or tests) that want to inspect
  // or log the configured paths.
  DEFAULT_TEMP_DIR,
  DEFAULT_SIZE_LIMIT,
};
