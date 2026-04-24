//
// API function: GET /image/:assetid
//
// Downloads an image from S3 by assetid.
// Returns: { message, assetid, userid, localname, bucketkey, data: base64 }
//

const { get_dbConn, get_bucket, get_bucket_name } = require('./helper.js');
const { GetObjectCommand } = require('@aws-sdk/client-s3');


exports.get_image = async (request, response) => {

  try {
    console.log("**Call to GET /image/:assetid...");

    const assetid = parseInt(request.params.assetid);

    //
    // look up asset in DB:
    //
    let row;
    let dbConn;
    try {
      dbConn = await get_dbConn();
      let [rows] = await dbConn.execute(
        `SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?`,
        [assetid]
      );
      if (rows.length === 0) {
        return response.status(404).json({ "message": "no such assetid" });
      }
      row = rows[0];
    }
    finally {
      try { await dbConn.end(); } catch(e) { /*ignore*/ }
    }

    //
    // download from S3:
    //
    const bucket = get_bucket();
    const bucketName = get_bucket_name();

    console.log(`downloading ${row.bucketkey} from S3...`);
    const s3response = await bucket.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: row.bucketkey,
    }));

    //
    // convert stream to base64:
    //
    const chunks = [];
    for await (const chunk of s3response.Body) {
      chunks.push(chunk);
    }
    const imageData = Buffer.concat(chunks).toString('base64');

    console.log("success, sending response...");
    response.json({
      "message": "success",
      "assetid": row.assetid,
      "userid": row.userid,
      "localname": row.localname,
      "bucketkey": row.bucketkey,
      "data": imageData,
    });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message });
  }
};
