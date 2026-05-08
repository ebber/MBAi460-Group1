// Approach 01-foundation.md § Phase 4 Task 4.2
// GET /readyz — readiness probe: verifies RDS pool + S3 reachability.
// Returns 200 if both deps are up; 503 if either is down.
// Mounted outside /v1 so ALB + monitoring hit it directly (F2 convention).
const { services } = require('../../src/photoapp-core');
const { getPool } = require('../../services/pool');
const { HeadBucketCommand } = require('@aws-sdk/client-s3');

async function readyz(_req, res) {
  const checks = { rds: false, s3: false };

  try {
    const conn = await getPool().getConnection();
    await conn.ping();
    conn.release();
    checks.rds = true;
  } catch {
    // rds stays false
  }

  try {
    const bucket = services.aws.getBucket();
    const bucketName = services.aws.getBucketName();
    await bucket.send(new HeadBucketCommand({ Bucket: bucketName }));
    checks.s3 = true;
  } catch {
    // s3 stays false
  }

  const allHealthy = checks.rds && checks.s3;
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'unavailable',
    checks,
  });
}

module.exports = readyz;
