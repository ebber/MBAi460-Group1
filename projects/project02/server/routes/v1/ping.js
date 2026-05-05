// GET /ping — service-module ping (S3 object count + DB user count)
//
// PDF spec response: { message: 'success', M: <user_count>, N: <s3_object_count> }
//
// Consumes lib's services.photoapp.getPing() — single source of S3 + DB
// orchestration; this route is a thin envelope adapter.

const { services } = require('@mbai460/photoapp-server');

module.exports = async function getPing(req, res, next) {
  try {
    const { s3_object_count, user_count } = await services.photoapp.getPing();
    res.status(200).json({
      message: 'success',
      M: user_count,
      N: s3_object_count,
    });
  } catch (err) {
    next(err);
  }
};
