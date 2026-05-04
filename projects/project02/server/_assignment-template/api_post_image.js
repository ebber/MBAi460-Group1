//
// API function: POST /image
//
// Uploads an image to S3, runs Rekognition, stores record + labels in DB.
// Body: { userid: int, data: base64string, filename: string }
// Returns: { message, assetid }
//

const { get_dbConn, get_bucket, get_bucket_name, get_rekognition } = require('./helper.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


exports.post_image = async (request, response) => {

  try {
    console.log("**Call to POST /image...");

    const { userid, data, filename } = request.body;

    if (userid === undefined || data === undefined || filename === undefined) {
      return response.status(400).json({ "message": "missing required fields: userid, data, filename" });
    }

    //
    // validate userid exists:
    //
    let dbConn;
    try {
      dbConn = await get_dbConn();
      let [rows] = await dbConn.execute(
        `SELECT userid FROM users WHERE userid = ?`, [userid]
      );
      if (rows.length === 0) {
        return response.status(400).json({ "message": "no such userid" });
      }
    }
    finally {
      try { await dbConn.end(); } catch(e) { /*ignore*/ }
    }

    //
    // decode base64 image data:
    //
    const imageBuffer = Buffer.from(data, 'base64');

    //
    // generate a unique key for S3 (uuid + original extension):
    //
    const ext = path.extname(filename) || '.jpg';
    const bucketkey = uuidv4() + ext;
    const bucketName = get_bucket_name();
    const bucket = get_bucket();

    //
    // upload to S3:
    //
    console.log(`uploading to S3 as ${bucketkey}...`);
    await bucket.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: bucketkey,
      Body: imageBuffer,
    }));

    //
    // call Rekognition on the S3 object we just uploaded:
    //
    console.log("calling Rekognition...");
    const rekognition = get_rekognition();
    const rekResult = await rekognition.send(new DetectLabelsCommand({
      Image: {
        S3Object: { Bucket: bucketName, Name: bucketkey }
      },
      MaxLabels: 100,
      MinConfidence: 80,
    }));

    const detectedLabels = rekResult.Labels || [];

    //
    // insert asset record and labels into DB:
    //
    let assetid;
    let dbConn2;
    try {
      dbConn2 = await get_dbConn();

      let [result] = await dbConn2.execute(
        `INSERT INTO assets(userid, localname, bucketkey) VALUES (?, ?, ?)`,
        [userid, filename, bucketkey]
      );
      assetid = result.insertId;

      for (const lbl of detectedLabels) {
        const labelName = lbl.Name;
        const confidence = Math.round(lbl.Confidence);
        await dbConn2.execute(
          `INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ?)`,
          [assetid, labelName, confidence]
        );
      }
    }
    finally {
      try { await dbConn2.end(); } catch(e) { /*ignore*/ }
    }

    console.log(`success, assetid: ${assetid}`);
    response.json({ "message": "success", "assetid": assetid });
  }
  catch (err) {
    console.log("ERROR:");
    console.log(err.message);
    response.status(500).json({ "message": err.message });
  }
};
