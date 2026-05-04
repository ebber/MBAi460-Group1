// listen() entrypoint. SIGTERM graceful shutdown + pool.end() integration land
// in Approach Phase 7 (Plan sub-phase 1.7) once services/pool.js exists.
const app = require('./app');
const logger = require('./observability/pino');

const port = process.env.PORT || 8080;

const httpServer = app.listen(port, () => {
  logger.info({ port }, 'web service listening');
});

async function gracefulShutdown(signal) {
  logger.warn({ signal }, 'received shutdown signal, draining…');
  httpServer.close(() => {
    process.exit(0);
  });
  // Hard-kill after 10s if connections don't drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
