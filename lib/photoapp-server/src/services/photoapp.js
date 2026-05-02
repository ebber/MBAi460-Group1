const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');

const CONTENT_TYPE_BY_EXT = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain',
};

function contentTypeFromExt(name) {
  const ext = path.extname(name).toLowerCase();
  return CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
}
const aws = require('./aws');
const { cleanupTempFile } = require('../middleware/upload');
const {
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
} = require('../schemas/rows');

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

async function searchImages(label) {
  if (!label || !label.trim()) {
    throw new Error('label is required');
  }
  const dbConn = await aws.getDbConn();
  try {
    const [rows] = await dbConn.execute(
      'SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC',
      [`%${label}%`]
    );
    return rows.map(searchRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function uploadImage(userid, multerFile) {
  const dbConn = await aws.getDbConn();
  try {
    const [users] = await dbConn.execute(
      'SELECT userid, username FROM users WHERE userid = ?',
      [userid]
    );
    if (users.length === 0) {
      throw new Error('no such userid');
    }
    const { username } = users[0];

    const localname = multerFile.originalname;
    const kind = deriveKind(localname);
    const bucketkey = `${username}/${uuidv4()}-${localname}`;
    const buffer = fs.readFileSync(multerFile.path);

    await aws.getBucket().send(new PutObjectCommand({
      Bucket: aws.getBucketName(),
      Key: bucketkey,
      Body: buffer,
    }));

    const [insertResult] = await dbConn.execute(
      'INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)',
      [userid, localname, bucketkey, kind]
    );
    const assetid = insertResult.insertId;

    if (kind === 'photo') {
      const rekogResult = await aws.getRekognition().send(new DetectLabelsCommand({
        Image: { S3Object: { Bucket: aws.getBucketName(), Name: bucketkey } },
        MaxLabels: 100,
        MinConfidence: 80,
      }));
      const labels = rekogResult.Labels || [];
      for (const lbl of labels) {
        await dbConn.execute(
          'INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))',
          [assetid, lbl.Name, lbl.Confidence]
        );
      }
    }

    return { assetid };
  } finally {
    cleanupTempFile(multerFile.path);
    await dbConn.end();
  }
}

async function downloadImage(assetid) {
  const dbConn = await aws.getDbConn();
  try {
    const [rows] = await dbConn.execute(
      'SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?',
      [assetid]
    );
    if (rows.length === 0) {
      throw new Error('no such assetid');
    }
    const { localname, bucketkey } = rows[0];

    const s3Result = await aws.getBucket().send(new GetObjectCommand({
      Bucket: aws.getBucketName(),
      Key: bucketkey,
    }));

    return {
      bucketkey,
      localname,
      contentType: s3Result.ContentType ?? contentTypeFromExt(localname),
      s3Result,
    };
  } finally {
    await dbConn.end();
  }
}

async function deleteAll() {
  const dbConn = await aws.getDbConn();
  let bucketkeys = [];
  try {
    const [rows] = await dbConn.execute('SELECT bucketkey FROM assets');
    bucketkeys = rows.map(r => r.bucketkey);

    await dbConn.execute('DELETE FROM labels');
    await dbConn.execute('DELETE FROM assets');
    // Reset auto-increment so the next upload starts at 1001 again
    // (matches the seed value in create-photoapp.sql).
    await dbConn.execute('ALTER TABLE assets AUTO_INCREMENT = 1001');
  } finally {
    await dbConn.end();
  }

  if (bucketkeys.length > 0) {
    await aws.getBucket().send(new DeleteObjectsCommand({
      Bucket: aws.getBucketName(),
      Delete: { Objects: bucketkeys.map(k => ({ Key: k })) },
    }));
  }

  return { deleted: true };
}

module.exports = { getPing, listUsers, listImages, getImageLabels, searchImages, uploadImage, downloadImage, deleteAll };
