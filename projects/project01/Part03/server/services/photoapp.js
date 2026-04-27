const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const aws = require('./aws');
const { userRowToObject, imageRowToObject, labelRowToObject } = require('../schemas');

async function getPing() {
  const bucket = aws.getBucket();
  const bucketName = aws.getBucketName();
  const dbConn = await aws.getDbConn();
  try {
    const [s3Result, [rows]] = await Promise.all([
      bucket.send(new ListObjectsV2Command({ Bucket: bucketName })),
      dbConn.execute('SELECT count(userid) AS num_users FROM users'),
    ]);
    return {
      s3_object_count: s3Result.KeyCount ?? 0,
      user_count: rows[0].num_users,
    };
  } finally {
    await dbConn.end();
  }
}

async function listUsers() {
  const dbConn = await aws.getDbConn();
  try {
    const [rows] = await dbConn.execute(
      'SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC'
    );
    return rows.map(userRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function listImages(userid) {
  const dbConn = await aws.getDbConn();
  try {
    const sql = userid !== undefined
      ? 'SELECT assetid, userid, localname, bucketkey, kind FROM assets WHERE userid = ? ORDER BY assetid ASC'
      : 'SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC';
    const params = userid !== undefined ? [userid] : [];
    const [rows] = await dbConn.execute(sql, params);
    return rows.map(imageRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function getImageLabels(assetid) {
  const dbConn = await aws.getDbConn();
  try {
    const [validation] = await dbConn.execute(
      'SELECT assetid FROM assets WHERE assetid = ?',
      [assetid]
    );
    if (validation.length === 0) {
      throw new Error('no such assetid');
    }
    const [rows] = await dbConn.execute(
      'SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC',
      [assetid]
    );
    return rows.map(labelRowToObject);
  } finally {
    await dbConn.end();
  }
}

module.exports = { getPing, listUsers, listImages, getImageLabels };
