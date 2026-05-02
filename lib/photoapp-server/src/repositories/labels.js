// lib/photoapp-server/src/repositories/labels.js
//
// Labels repository — extracts SQL from services/photoapp.js per Phase 0.3
// CL9 bounded reconciliation. SQL byte-identical to Part 03's pre-extraction
// inline SQL.

/**
 * findByAssetId — labels for a specific assetid, ordered by confidence DESC.
 *
 * Used by services.photoapp.getImageLabels().
 *
 * @param {object} conn
 * @param {number} assetid
 * @returns {Promise<Array<{label, confidence}>>}
 */
async function findByAssetId(conn, assetid) {
  const [rows] = await conn.execute(
    'SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC',
    [assetid]
  );
  return rows;
}

/**
 * findByLabelLike — case-insensitive label search; returns rows ordered by
 * assetid ASC, label ASC. Note: MySQL's default utf8mb4_0900_ai_ci collation
 * makes LIKE case-insensitive — matches Part 03's pre-extraction behavior.
 * The search is substring-based (`%${label}%`), preserving Part 03 semantics.
 *
 * Used by services.photoapp.searchImages().
 *
 * @param {object} conn
 * @param {string} label — substring to match (caller has already validated non-empty)
 * @returns {Promise<Array<{assetid, label, confidence}>>}
 */
async function findByLabelLike(conn, label) {
  const [rows] = await conn.execute(
    'SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC',
    [`%${label}%`]
  );
  return rows;
}

/**
 * insertOne — inserts a single (assetid, label, confidence) row using
 * INSERT IGNORE so duplicate labels for the same asset don't raise.
 * Confidence is rounded via SQL ROUND() per Part 03's pre-extraction
 * behavior.
 *
 * Used by services.photoapp.uploadImage() in a per-label loop after
 * Rekognition returns its label set.
 *
 * @param {object} conn
 * @param {number} assetid
 * @param {string} name — label name (e.g., 'Animal', 'Dog')
 * @param {number} confidence — Rekognition confidence (0..100, fractional)
 * @returns {Promise<void>}
 */
async function insertOne(conn, assetid, name, confidence) {
  await conn.execute(
    'INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))',
    [assetid, name, confidence]
  );
}

/**
 * deleteAll — deletes all label rows.
 *
 * Used by services.photoapp.deleteAll(). Must be called BEFORE deleting
 * assets (FK constraint — labels.assetid → assets.assetid).
 *
 * @param {object} conn
 * @returns {Promise<void>}
 */
async function deleteAll(conn) {
  await conn.execute('DELETE FROM labels');
}

module.exports = {
  findByAssetId,
  findByLabelLike,
  insertOne,
  deleteAll,
};
