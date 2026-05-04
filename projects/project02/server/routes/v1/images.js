// GET /images?userid=<optional> — list assets, optionally filtered by userid
//
// PDF spec: with userid → only that user's assets; without → all assets.
// Response: { message: 'success', data: [<image>, ...] }
//
// Consumes lib's services.photoapp.listImages(userid); the userid arg is
// optional — pass undefined when query param absent.

const { services } = require('@mbai460/photoapp-server');

module.exports = async function getImages(req, res, next) {
  try {
    let userid;
    if (req.query.userid !== undefined && req.query.userid !== '') {
      userid = parseInt(req.query.userid, 10);
      if (Number.isNaN(userid)) {
        return res.status(400).json({
          message: 'userid must be an integer if provided',
          data: [],
        });
      }
    }
    const data = await services.photoapp.listImages(userid);
    res.status(200).json({ message: 'success', data });
  } catch (err) {
    next(err);
  }
};
