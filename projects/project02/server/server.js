// Approach 01-foundation.md § Phase 2 (entrypoint) + Phase 7 (pool shutdown).
//
// Lib config bridge — point @mbai460/photoapp-server's services.aws at the
// canonical project01/client/photoapp-config.ini (shared by both consumers;
// `services/pool.js` resolves to the same absolute path). The lib's default
// is the relative `../client/photoapp-config.ini` which assumes Part 03's
// CWD; project02 needs an absolute override at boot before any service call.
const path = require('path');
const { config: libConfig } = require('@mbai460/photoapp-server');
libConfig.photoapp_config_filename = path.resolve(
  __dirname,
  '../../project01/client/photoapp-config.ini',
);

const app = require('./app');
const logger = require('./observability/pino');
const { closePool } = require('./services/pool');

const port = process.env.PORT || 8080;

const httpServer = app.listen(port, () => {
  logger.info({ port }, 'web service listening');
});

async function gracefulShutdown(signal) {
  logger.warn({ signal }, 'received shutdown signal, draining…');
  httpServer.close(async () => {
    await closePool();
    process.exit(0);
  });
  // Hard-kill after 10s if connections don't drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
