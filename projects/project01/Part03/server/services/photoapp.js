const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const aws = require('./aws');

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

module.exports = { getPing };
