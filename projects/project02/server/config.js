const config = {
  photoapp_config_filename: process.env.PHOTOAPP_CONFIG_PATH || "photoapp-config.ini",
  photoapp_s3_profile: "s3readwrite",
  web_service_port: parseInt(process.env.PORT) || 8080,
  response_page_size: 12
};

module.exports = config;
