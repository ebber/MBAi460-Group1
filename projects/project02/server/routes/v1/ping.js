// GET /ping — service-module ping (S3 object count + DB user count)
//
// PDF spec response: { message: 'success', M: <s3_object_count>, N: <user_count> }
// (Verified against cloned reference at images/mbai460-server/projects/project02/client/photoapp.py:83-84:
//   M = # of items in the photoapp bucket
//   N = # of users in the photoapp.users table)
//
// Consumes lib's services.photoapp.getPing() — single source of S3 + DB
// orchestration; this route is a thin envelope adapter.

const { services } = require('../../src/photoapp-core');

module.exports = async function getPing(req, res, next) {
  try {
    const { s3_object_count, user_count } = await services.photoapp.getPing();
    res.status(200).json({
      message: 'success',
      M: s3_object_count,
      N: user_count,
    });
  } catch (err) {
    next(err);
  }
};
