//
// API function: DELETE /images
//
// Deletes all images and their labels from the database and S3.
//
// Per PDF: the database is cleared FIRST; S3 deletion is only attempted
// if the DB clear succeeded. If S3 fails after DB success, the response
// is still "success" — the orphan S3 objects are harmless because their
// keys are unique and never re-used.
//
// Returns: { message }
//

const { get_dbConn, get_bucket, get_bucket_name } = require('./helper.js');
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));


exports.delete_images = async (request, response) => {

  try {
    console.log("**Call to DELETE /images...");

    //
    // Step 1: collect bucketkeys we'll need to remove from S3 *after*
    // the DB is cleared. Read-only step; wrapped in p-retry.
    //
    async function collect_bucketkeys() {
      let dbConn;
      try {
        dbConn = await get_dbConn();
        let [rows] = await dbConn.execute(`SELECT bucketkey FROM assets`);
        return rows.map(r => r.bucketkey);
      }
      finally {
        try { await dbConn.end(); } catch(e) { /*ignore*/ }
      }
    }

    const bucketkeys = await pRetry(() => collect_bucketkeys(), {retries: 2});

    //
    // Step 2: clear DB tables. Uses query() (not execute()) because
    // mysql2's execute() prepared-statement path does not support
    // multi-statement; the connection in helper.js is opened with
    // multipleStatements: true. AUTO_INCREMENT=1001 matches the
    // create-photoapp.sql seed so the next upload's assetid is 1001.
    //
    async function clear_db() {
      let dbConn;
      try {
        dbConn = await get_dbConn();
        await dbConn.query(`
          SET foreign_key_checks = 0;
          TRUNCATE TABLE labels;
          TRUNCATE TABLE assets;
          SET foreign_key_checks = 1;
          ALTER TABLE assets AUTO_INCREMENT = 1001;
        `);
      }
      finally {
        try { await dbConn.end(); } catch(e) { /*ignore*/ }
      }
    }

    await pRetry(() => clear_db(), {retries: 2});

    //
    // Step 3: delete S3 objects. PDF: a failure here is acceptable —
    // DB is the source of truth; uniquely-keyed orphan objects in S3
    // are harmless.
    //
    if (bucketkeys.length > 0) {
      try {
        console.log(`deleting ${bucketkeys.length} objects from S3...`);
        const bucket = get_bucket();
        const bucketName = get_bucket_name();
        await bucket.send(new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: bucketkeys.map(k => ({ Key: k })),
            Quiet: true,
          },
        }));
      }
      catch (s3err) {
        console.log("S3 cleanup failed (DB already cleared; objects orphaned):");
        console.log(s3err.message);
      }
    }

    console.log("success");
    response.json({ "message": "success" });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message });
  }
};
