//
// API function: GET /image/:assetid
//
// Downloads an image from S3 by assetid; returns its bytes as a
// base64-encoded string in JSON.
//
// Per PDF: success response is {message, userid, local_filename, data};
// "no such assetid" returns 400 (not 404) with userid: -1.
//

const { get_dbConn, get_bucket, get_bucket_name } = require('./helper.js');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));


exports.get_image = async (request, response) => {

  try {
    console.log("**Call to GET /image/:assetid...");

    const assetid = parseInt(request.params.assetid, 10);

    if (Number.isNaN(assetid)) {
      return response.status(400).json({ "message": "assetid must be an integer", "userid": -1 });
    }

    //
    // look up asset in DB (with retry):
    //
    async function lookup_asset() {
      let dbConn;
      try {
        dbConn = await get_dbConn();
        let [rows] = await dbConn.execute(
          `SELECT userid, localname, bucketkey FROM assets WHERE assetid = ?`,
          [assetid]
        );
        return rows;
      }
      finally {
        try { await dbConn.end(); } catch(e) { /*ignore*/ }
      }
    }

    const rows = await pRetry(() => lookup_asset(), {retries: 2});
    if (rows.length === 0) {
      return response.status(400).json({ "message": "no such assetid", "userid": -1 });
    }
    const row = rows[0];

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
    // collect stream into a single buffer, then base64 encode:
    //
    const chunks = [];
    for await (const chunk of s3response.Body) {
      chunks.push(chunk);
    }
    const imageData = Buffer.concat(chunks).toString('base64');

    console.log("success, sending response...");
    response.json({
      "message": "success",
      "userid": row.userid,
      "local_filename": row.localname,
      "data": imageData,
    });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message, "userid": -1 });
  }
};
