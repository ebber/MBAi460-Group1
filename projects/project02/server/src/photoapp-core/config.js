//
// Defines important app-wide config parameters
//
// Web service configuration parameters, separate from the
// photoapp-config file which contains AWS-specific config
// information (e.g. pwds and access keys which we don't
// want in the code).
//
// Initial template:
//   Prof. Hummel
//   Northwestern University
//

const path = require('path');

const config = {
  // Project 02 owns its runtime config. Docker/Compose and tests may override
  // this with PHOTOAPP_CONFIG_PATH; local fallback stays inside project02.
  photoapp_config_filename:
    process.env.PHOTOAPP_CONFIG_PATH ||
    path.resolve(__dirname, '../../../client/photoapp-config.ini'),
  photoapp_s3_profile: process.env.PHOTOAPP_S3_PROFILE || 's3readwrite',
  web_service_port: Number(process.env.PORT || 8080),
  response_page_size: 12,
};

module.exports = config;
