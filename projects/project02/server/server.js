// Approach 01-foundation.md § Phase 2 (entrypoint) + Phase 7 (pool shutdown).
// Project 02 now owns its PhotoApp core copy and runtime config resolution
// inside `src/photoapp-core/config.js`; no shared-lib config bridge is needed.

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
