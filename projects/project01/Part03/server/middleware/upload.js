// Phase 4: multipart upload middleware.
//
// Per DesignDecisions Q9 (Part 03), this layer accepts ALL file types —
// photos and documents both flow through `POST /api/images` and the upload
// service branches on `kind` (Q8). Photos go through Rekognition; documents
// are stored as-is. Document OCR via Textract is Future-State, so we do not
// MIME-filter here. The 50 MB limit is the only gate at this layer.
//
// `cleanupTempFile` is the success/failure-path helper used by the upload
// service to remove the multer-staged temp file from `os.tmpdir()/photoapp-uploads`
// after the file has been streamed to S3 (or the request has failed).

const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const TEMP_DIR = path.join(os.tmpdir(), 'photoapp-uploads');

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

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

module.exports = { upload, TEMP_DIR, cleanupTempFile };
