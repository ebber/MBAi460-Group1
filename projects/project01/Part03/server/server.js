//
// PhotoApp Express server entrypoint — imports the `app` instance from
// `./app` and binds it to the configured port. Run via `npm start`
// (which is `node server/server.js`).
//
// Splitting listen() out of app.js (Phase 2 of the Server Foundation
// workstream — see MetaFiles/Approach/02-server-foundation.md) lets
// Jest + supertest import `app` without holding a real socket.
//

const app = require('./app');
const config = require('./config');

const port = config.web_service_port;

app.listen(port, () => {
  console.log(`**Web service running, listening on port ${port}...`);
  // Preserved from baseline: point AWS SDK at the photoapp-config.ini so
  // the photoapp-credentials profile resolves. (The AWS service module
  // — workstream 03 — will likely move credential resolution into a
  // factory rather than via process.env.)
  process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config_filename;
});
