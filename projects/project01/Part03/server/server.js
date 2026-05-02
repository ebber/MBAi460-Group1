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
const { config } = require('@mbai460/photoapp-server');

const port = config.web_service_port;

app.listen(port, () => {
  console.log(`**Web service running, listening on port ${port}...`);
  // AWS credentials are loaded explicitly via `fromIni({ filepath, profile })`
  // inside server/services/aws.js, so no env-var side-effect is needed.
  // (The legacy AWS_SHARED_CREDENTIALS_FILE assignment was removed
  // 2026-04-27 during Phase 8 — see refactor-log.)
});
