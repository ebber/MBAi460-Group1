//
// server/services/aws.js
//
// AWS clients factory + MySQL connection helper for PhotoApp.
//
// Smoothing of legacy server/helper.js per Part 03 §Phase 2 (Tasks 2.1, 2.2):
//   - Centralizes S3, Rekognition, and mysql2/promise client construction
//     so routes/services depend on stable factories rather than the legacy
//     helper.js (which uses snake_case names and an implicit-double-Promise
//     contract on get_dbConn).
//   - Reads photoapp-config.ini via a module-private readPhotoAppConfig()
//     helper. Per-call file reads match the legacy semantics; memoization
//     is deferred (see 03 §Phase 2 implementation notes).
//   - Pins an explicit `return await mysql2.createConnection(...)` so any
//     future caller who forgets to await getDbConn() gets a Promise and
//     fails fast at .execute(...) rather than silently working.
//
// Exports (camelCase): getDbConn, getBucket, getBucketName, getRekognition.
//

const fs = require('fs');
const ini = require('ini');
const mysql2 = require('mysql2/promise');
const { S3Client } = require('@aws-sdk/client-s3');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { fromIni } = require('@aws-sdk/credential-providers');

const config = require('../config');

/**
 * readPhotoAppConfig (module-private)
 *
 * Reads config.photoapp_config_filename and parses as ini. All four
 * exported factories call this; it is intentionally not exported.
 *
 * @returns {object} parsed ini with at least [s3] and [rds] sections
 */
function readPhotoAppConfig() {
  const raw = fs.readFileSync(config.photoapp_config_filename, 'utf-8');
  return ini.parse(raw);
}

/**
 * getDbConn
 *
 * Async; opens and returns a mysql2/promise Connection. Caller is
 * responsible for `await dbConn.end()` in a `finally` block.
 *
 * Uses an explicit `return await` so the function resolves to a
 * Connection (not a Promise<Connection>), keeping the contract
 * obvious to readers and to any caller who forgets to await.
 *
 * @returns {Promise<import('mysql2/promise').Connection>}
 */
async function getDbConn() {
  const photoappConfig = readPhotoAppConfig();
  return await mysql2.createConnection({
    host: photoappConfig.rds.endpoint,
    port: photoappConfig.rds.port_number,
    user: photoappConfig.rds.user_name,
    password: photoappConfig.rds.user_pwd,
    database: photoappConfig.rds.db_name,
    multipleStatements: false,
  });
}

/**
 * getBucket
 *
 * Returns an S3Client configured from [s3].region_name and the
 * photoapp_s3_profile credentials.
 *
 * @returns {S3Client}
 */
function getBucket() {
  const photoappConfig = readPhotoAppConfig();
  return new S3Client({
    region: photoappConfig.s3.region_name,
    maxAttempts: 3,
    defaultsMode: 'standard',
    credentials: fromIni({
      profile: config.photoapp_s3_profile,
      filepath: config.photoapp_config_filename,
    }),
  });
}

/**
 * getBucketName
 *
 * @returns {string} value of [s3].bucket_name
 */
function getBucketName() {
  const photoappConfig = readPhotoAppConfig();
  return photoappConfig.s3.bucket_name;
}

/**
 * getRekognition
 *
 * Returns a RekognitionClient configured with the same region/profile
 * as getBucket.
 *
 * @returns {RekognitionClient}
 */
function getRekognition() {
  const photoappConfig = readPhotoAppConfig();
  return new RekognitionClient({
    region: photoappConfig.s3.region_name,
    maxAttempts: 3,
    defaultsMode: 'standard',
    credentials: fromIni({
      profile: config.photoapp_s3_profile,
      filepath: config.photoapp_config_filename,
    }),
  });
}

module.exports = { getDbConn, getBucket, getBucketName, getRekognition };
