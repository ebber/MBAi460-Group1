//
// API function: DELETE /images
//
// Deletes all images from S3 and clears assets + labels from DB.
// Returns: { message }
//

const { get_dbConn, get_bucket, get_bucket_name } = require('./helper.js');
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');


exports.delete_images = async (request, response) => {

  try {
    console.log("**Call to DELETE /images...");

    let dbConn;
    let bucketkeys = [];
    try {
      dbConn = await get_dbConn();
      let [rows] = await dbConn.execute(`SELECT bucketkey FROM assets`);
      bucketkeys = rows.map(r => r.bucketkey);
    }
    finally {
      try { await dbConn.end(); } catch(e) { /*ignore*/ }
    }

    //
    // delete from S3 (only if there are objects to delete):
    //
    if (bucketkeys.length > 0) {
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

    //
    // clear DB (labels first due to FK constraint, then assets):
    //
    let dbConn2;
    try {
      dbConn2 = await get_dbConn();
      await dbConn2.execute(`DELETE FROM labels`);
      await dbConn2.execute(`DELETE FROM assets`);
    }
    finally {
      try { await dbConn2.end(); } catch(e) { /*ignore*/ }
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
