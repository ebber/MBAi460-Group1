// lib/photoapp-server/src/repositories/assets.js
//
// Assets repository — extracts SQL from services/photoapp.js per Phase 0.3
// CL9 bounded reconciliation. SQL byte-identical to Part 03's pre-extraction
// inline SQL.
//
// Note on findById vs existsById: Part 03's services/photoapp.js issues two
// distinct SELECTs against assets — one for full asset shape (downloadImage)
// and one lighter one for assetid-existence validation (getImageLabels).
// Both queries are preserved as-is to maintain byte-identical SQL.

/**
 * findAll — all assets ordered by assetid ASC.
 * Used by services.photoapp.listImages() (no userid filter).
 *
 * @param {object} conn
 * @returns {Promise<Array<{assetid, userid, localname, bucketkey, kind}>>}
 */
async function findAll(conn) {
  // Pass empty params array explicitly to preserve byte-identical call shape
  // with Part 03's pre-extraction service code (which passed `params = []`
  // for the no-filter branch of listImages). Tests assert `params === []`.
  const [rows] = await conn.execute(
    'SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC',
    []
  );
  return rows;
}

/**
 * findByUserId — assets for a specific user, ordered by assetid ASC.
 * Used by services.photoapp.listImages(userid).
 *
 * @param {object} conn
 * @param {number} userid
 * @returns {Promise<Array<{assetid, userid, localname, bucketkey, kind}>>}
 */
async function findByUserId(conn, userid) {
  const [rows] = await conn.execute(
    'SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = ? ORDER BY assetid ASC',
    [userid]
  );
  return rows;
}

/**
 * findById — single asset by assetid, or null. Returns the projection used
 * by downloadImage (no `kind` column; preserves Part 03's pre-extraction
 * SELECT shape exactly).
 *
 * Used by services.photoapp.downloadImage().
 *
 * @param {object} conn
 * @param {number} assetid
 * @returns {Promise<{assetid, userid, localname, bucketkey} | null>}
 */
async function findById(conn, assetid) {
  const [rows] = await conn.execute(
    'SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?',
    [assetid]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * existsById — lightweight assetid-existence check used by getImageLabels
 * validation. Returns just the assetid or null. Same SQL shape as Part 03's
 * pre-extraction validation step (only `assetid` column).
 *
 * Used by services.photoapp.getImageLabels().
 *
 * @param {object} conn
 * @param {number} assetid
 * @returns {Promise<{assetid} | null>}
 */
async function existsById(conn, assetid) {
  const [rows] = await conn.execute(
    'SELECT assetid FROM assets WHERE assetid = ?',
    [assetid]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * insert — inserts a new asset row; returns the OkPacket from mysql2 (caller
 * uses .insertId).
 *
 * Used by services.photoapp.uploadImage().
 *
 * @param {object} conn
 * @param {{userid, localname, bucketkey, kind}} row
 * @returns {Promise<{insertId, affectedRows}>}
 */
async function insert(conn, { userid, localname, bucketkey, kind }) {
  const [result] = await conn.execute(
    'INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)',
    [userid, localname, bucketkey, kind]
  );
  return result;
}

/**
 * selectAllBucketkeys — returns all bucketkey strings (for S3 cleanup).
 *
 * Used by services.photoapp.deleteAll().
 *
 * @param {object} conn
 * @returns {Promise<string[]>}
 */
async function selectAllBucketkeys(conn) {
  const [rows] = await conn.execute('SELECT bucketkey FROM assets');
  return rows.map(r => r.bucketkey);
}

/**
 * deleteAll — deletes all asset rows.
 *
 * Used by services.photoapp.deleteAll(). Caller must also invoke
 * resetAutoIncrement() to restore the seed-aligned starting value
 * (kept as a separate function so the ALTER TABLE statement is conceptually
 * distinct from the DELETE).
 *
 * @param {object} conn
 * @returns {Promise<void>}
 */
async function deleteAll(conn) {
  await conn.execute('DELETE FROM assets');
}

/**
 * resetAutoIncrement — resets the assets table auto-increment to 1001 (Part
 * 03 baseline; matches the seed value in create-photoapp.sql so the next
 * upload starts at 1001 again).
 *
 * Used by services.photoapp.deleteAll() after the DELETE FROM assets.
 *
 * @param {object} conn
 * @returns {Promise<void>}
 */
async function resetAutoIncrement(conn) {
  await conn.execute('ALTER TABLE assets AUTO_INCREMENT = 1001');
}

module.exports = {
  findAll,
  findByUserId,
  findById,
  existsById,
  insert,
  selectAllBucketkeys,
  deleteAll,
  resetAutoIncrement,
};
