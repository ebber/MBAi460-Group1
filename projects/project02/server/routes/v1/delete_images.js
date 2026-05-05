// DELETE /images — destructive reset (DB clear + S3 cleanup + AUTO_INCREMENT=1001)
//
// PDF spec response: { message: 'success' }
//
// Consumes lib's services.photoapp.deleteAll(). Lib enforces the FK-safe
// ordering (DELETE labels → DELETE assets → ALTER AUTO_INCREMENT=1001 →
// S3 DeleteObjects) per Phase 0 reconciliation log. Route is a thin
// envelope adapter — no domain logic.

const { services } = require('@mbai460/photoapp-server');

module.exports = async function deleteImages(req, res, next) {
  try {
    await services.photoapp.deleteAll();
    res.status(200).json({ message: 'success' });
  } catch (err) {
    next(err);
  }
};
