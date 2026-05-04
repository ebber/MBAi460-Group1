const fs = require('fs');
const ini = require('ini');
const config = require('./config.js');
const mysql2 = require('mysql2/promise');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { S3Client } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');

async function get_dbConn() {
  const config_data = fs.readFileSync(config.photoapp_config_filename, 'utf-8');
  const photoapp_config = ini.parse(config_data);
  const endpoint = photoapp_config.rds.endpoint;
  const port_number = photoapp_config.rds.port_number;
  const user_name = photoapp_config.rds.user_name;
  const user_pwd = photoapp_config.rds.user_pwd;
  const db_name = photoapp_config.rds.db_name;

  let dbConn = mysql2.createConnection({
    host: endpoint,
    port: port_number,
    user: user_name,
    password: user_pwd,
    database: db_name,
    multipleStatements: true
  });

  return dbConn;
}

function get_bucket() {
  const config_data = fs.readFileSync(config.photoapp_config_filename, 'utf-8');
  const photoapp_config = ini.parse(config_data);
  const s3_region_name = photoapp_config.s3.region_name;

  let bucket = new S3Client({
    region: s3_region_name,
    maxAttempts: 3,
    defaultsMode: "standard",
    credentials: fromIni({ profile: config.photoapp_s3_profile })
  });

  return bucket;
}

function get_bucket_name() {
  const config_data = fs.readFileSync(config.photoapp_config_filename, 'utf-8');
  const photoapp_config = ini.parse(config_data);
  return photoapp_config.s3.bucket_name;
}

function get_rekognition() {
  const config_data = fs.readFileSync(config.photoapp_config_filename, 'utf-8');
  const photoapp_config = ini.parse(config_data);
  const s3_region_name = photoapp_config.s3.region_name;

  let rekognition = new RekognitionClient({
    region: s3_region_name,
    maxAttempts: 3,
    defaultsMode: "standard",
    credentials: fromIni({ profile: config.photoapp_s3_profile })
  });

  return rekognition;
}

module.exports = { get_dbConn, get_bucket, get_bucket_name, get_rekognition };
