// lib/photoapp-server/src/repositories/users.js
//
// Users repository — extracts SQL from services/photoapp.js per Phase 0.3
// CL9 bounded reconciliation. Each function takes a connection (or pool)
// and returns rows / counts; does not catch errors. The service layer
// (services/photoapp.js) decides what to do with failures.
//
// SQL strings, parameter binding, and ordering are byte-identical to
// Part 03's pre-extraction inline SQL — verified by sql-characterization
// tests (locked SQL strings) + Part 03's existing test suite (regression
// baseline canary).

/**
 * countAll — returns total user count.
 * Used by services.photoapp.getPing().
 *
 * @param {object} conn — mysql2/promise connection (or pool).
 * @returns {Promise<number>}
 */
async function countAll(conn) {
  const [rows] = await conn.execute('SELECT count(userid) AS num_users FROM users');
  return rows[0].num_users;
}

/**
 * findAll — returns all users ordered by userid ASC.
 * Used by services.photoapp.listUsers().
 *
 * @param {object} conn
 * @returns {Promise<Array<{userid, username, givenname, familyname}>>}
 */
async function findAll(conn) {
  const [rows] = await conn.execute(
    'SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC'
  );
  return rows;
}

/**
 * findById — returns userid + username for a single user, or null if not found.
 * Used by services.photoapp.uploadImage() for "no such userid" validation.
 *
 * Returns the projection used by upload (only userid + username); other
 * callers that need the full user shape would use findAll or a future
 * findFullById. Preserves Part 03's exact pre-extraction SELECT.
 *
 * @param {object} conn
 * @param {number} userid
 * @returns {Promise<{userid, username} | null>}
 */
async function findById(conn, userid) {
  const [rows] = await conn.execute(
    'SELECT userid, username FROM users WHERE userid = ?',
    [userid]
  );
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { countAll, findAll, findById };
