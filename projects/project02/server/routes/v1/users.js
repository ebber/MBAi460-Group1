// GET /users — list all users ordered by userid ASC
//
// PDF spec response: { message: 'success', data: [<user>, ...] }
//
// Consumes lib's services.photoapp.listUsers(); shape determined by
// the lib's userRowToObject (userid, username, givenname, familyname).

const { services } = require('@mbai460/photoapp-server');

module.exports = async function getUsers(req, res, next) {
  try {
    const data = await services.photoapp.listUsers();
    res.status(200).json({ message: 'success', data });
  } catch (err) {
    next(err);
  }
};
