// lib/photoapp-server/src/services/photoapp.js
//
// PhotoApp service layer — orchestrates repositories + AWS clients to
// implement the use cases consumed by both Part 03 and (eventually)
// Project 02 surfaces.
//
// Phase 0.3 CL9 reconciliation (2026-05-02): SQL extracted from this file
// into the repositories layer (../repositories/{users,assets,labels}.js).
// The service is now responsible for: connection lifecycle (open/end via
// aws.getDbConn()), error semantics ("no such userid" / "no such assetid"),
// AWS orchestration (S3, Rekognition), and download contentType derivation.
// SQL strings are byte-identical to Part 03's pre-extraction inline SQL —
// see learnings/2026-05-02-photoapp-server-extraction.md for the
// reconciliation log.

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');

const aws = require('./aws');
const { cleanupTempFile } = require('../middleware/upload');
const usersRepo = require('../repositories/users');
const assetsRepo = require('../repositories/assets');
const labelsRepo = require('../repositories/labels');
const {
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
  deriveKind,
} = require('../schemas/rows');

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

async function getPing() {
  const bucket = aws.getBucket();
  const bucketName = aws.getBucketName();
  const dbConn = await aws.getDbConn();
  try {
    const [s3Result, num_users] = await Promise.all([
      bucket.send(new ListObjectsV2Command({ Bucket: bucketName })),
      usersRepo.countAll(dbConn),
    ]);
    return {
      s3_object_count: s3Result.KeyCount ?? 0,
      user_count: num_users,
    };
  } finally {
    await dbConn.end();
  }
}

async function listUsers() {
  const dbConn = await aws.getDbConn();
  try {
    const rows = await usersRepo.findAll(dbConn);
    return rows.map(userRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function listImages(userid) {
  const dbConn = await aws.getDbConn();
  try {
    const rows = userid !== undefined
      ? await assetsRepo.findByUserId(dbConn, userid)
      : await assetsRepo.findAll(dbConn);
    return rows.map(imageRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function getImageLabels(assetid) {
  const dbConn = await aws.getDbConn();
  try {
    const validation = await assetsRepo.existsById(dbConn, assetid);
    if (!validation) {
      throw new Error('no such assetid');
    }
    const rows = await labelsRepo.findByAssetId(dbConn, assetid);
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
    const rows = await labelsRepo.findByLabelLike(dbConn, label);
    return rows.map(searchRowToObject);
  } finally {
    await dbConn.end();
  }
}

async function uploadImage(userid, multerFile) {
  const dbConn = await aws.getDbConn();
  try {
    const user = await usersRepo.findById(dbConn, userid);
    if (!user) {
      throw new Error('no such userid');
    }
    const { username } = user;

    const localname = multerFile.originalname;
    const kind = deriveKind(localname);
    const bucketkey = `${username}/${uuidv4()}-${localname}`;
    const buffer = fs.readFileSync(multerFile.path);

    await aws.getBucket().send(new PutObjectCommand({
      Bucket: aws.getBucketName(),
      Key: bucketkey,
      Body: buffer,
    }));

    const insertResult = await assetsRepo.insert(dbConn, { userid, localname, bucketkey, kind });
    const assetid = insertResult.insertId;

    if (kind === 'photo') {
      const rekogResult = await aws.getRekognition().send(new DetectLabelsCommand({
        Image: { S3Object: { Bucket: aws.getBucketName(), Name: bucketkey } },
        MaxLabels: 100,
        MinConfidence: 80,
      }));
      const labels = rekogResult.Labels || [];
      for (const lbl of labels) {
        await labelsRepo.insertOne(dbConn, assetid, lbl.Name, lbl.Confidence);
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
    const asset = await assetsRepo.findById(dbConn, assetid);
    if (!asset) {
      throw new Error('no such assetid');
    }
    const { localname, bucketkey } = asset;

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
    bucketkeys = await assetsRepo.selectAllBucketkeys(dbConn);

    await labelsRepo.deleteAll(dbConn);
    await assetsRepo.deleteAll(dbConn);
    // Reset auto-increment so the next upload starts at 1001 again
    // (matches the seed value in create-photoapp.sql).
    await assetsRepo.resetAutoIncrement(dbConn);
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
