//
// API function: POST /image/:userid
//
// Uploads an image to S3, runs Rekognition (photos only), and inserts
// the asset record + Rekognition labels into the database inside a
// single transaction. MySQL-based steps are wrapped in p-retry per
// the project spec (retry at most 3 times).
//
// URL param: userid
// Body: { local_filename: string, data: base64-encoded string }
// Returns: { message, assetid } on 200; { message, assetid: -1 } on 400/500.
//

const { get_dbConn, get_bucket, get_bucket_name, get_rekognition } = require('./helper.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const pRetry = (...args) => import('p-retry').then(({default: pRetry}) => pRetry(...args));

const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif']);

function derive_kind(filename) {
  const ext = path.extname(filename).toLowerCase();
  return PHOTO_EXTENSIONS.has(ext) ? 'photo' : 'document';
}


exports.post_image = async (request, response) => {

  try {
    console.log("**Call to POST /image/:userid...");

    const userid = parseInt(request.params.userid, 10);
    const { data, local_filename } = request.body;

    if (Number.isNaN(userid)) {
      return response.status(400).json({ "message": "userid must be an integer", "assetid": -1 });
    }
    if (data === undefined || local_filename === undefined) {
      return response.status(400).json({ "message": "missing required body fields: local_filename, data", "assetid": -1 });
    }

    //
    // validate userid exists (with retry):
    //
    async function validate_user() {
      let dbConn;
      try {
        dbConn = await get_dbConn();
        let [rows] = await dbConn.execute(
          `SELECT userid FROM users WHERE userid = ?`, [userid]
        );
        return rows;
      }
      finally {
        try { await dbConn.end(); } catch(e) { /*ignore*/ }
      }
    }

    let userRows = await pRetry(() => validate_user(), {retries: 2});
    if (userRows.length === 0) {
      return response.status(400).json({ "message": "no such userid", "assetid": -1 });
    }

    //
    // derive kind from extension; gates Rekognition below.
    //
    const kind = derive_kind(local_filename);

    //
    // decode base64 image data and prepare S3 object key:
    //
    const imageBuffer = Buffer.from(data, 'base64');
    const ext = path.extname(local_filename) || '.jpg';
    const bucketkey = uuidv4() + ext;
    const bucketName = get_bucket_name();
    const bucket = get_bucket();

    //
    // upload to S3:
    //
    console.log(`uploading to S3 as ${bucketkey} (kind=${kind})...`);
    await bucket.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: bucketkey,
      Body: imageBuffer,
    }));

    //
    // call Rekognition only for photos; documents skip label detection:
    //
    let detectedLabels = [];
    if (kind === 'photo') {
      console.log("calling Rekognition...");
      const rekognition = get_rekognition();
      const rekResult = await rekognition.send(new DetectLabelsCommand({
        Image: {
          S3Object: { Bucket: bucketName, Name: bucketkey }
        },
        MaxLabels: 100,
        MinConfidence: 80,
      }));
      detectedLabels = rekResult.Labels || [];
    } else {
      console.log(`skipping Rekognition (kind=${kind})`);
    }

    //
    // insert asset + labels inside a single transaction (with retry).
    // INSERT IGNORE on labels guards against duplicate (assetid, label)
    // pairs that Rekognition can occasionally return.
    //
    async function insert_with_transaction() {
      let dbConn;
      try {
        dbConn = await get_dbConn();
        await dbConn.beginTransaction();
        try {
          let [result] = await dbConn.execute(
            `INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)`,
            [userid, local_filename, bucketkey, kind]
          );
          const assetid = result.insertId;

          for (const lbl of detectedLabels) {
            await dbConn.execute(
              `INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))`,
              [assetid, lbl.Name, lbl.Confidence]
            );
          }

          await dbConn.commit();
          return assetid;
        }
        catch (err) {
          try { await dbConn.rollback(); } catch(e) { /*ignore*/ }
          throw err;
        }
      }
      finally {
        try { await dbConn.end(); } catch(e) { /*ignore*/ }
      }
    }

    const assetid = await pRetry(() => insert_with_transaction(), {retries: 2});

    console.log(`success, assetid: ${assetid}`);
    response.json({ "message": "success", "assetid": assetid });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message, "assetid": -1 });
  }
};
