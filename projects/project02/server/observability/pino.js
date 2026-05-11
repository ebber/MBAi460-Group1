// Approach 01-foundation.md § Phase 3 Task 3.1.
// Single pino logger instance for the whole server. The base fields
// (service, env) are surfaced on every log line so multi-service log
// aggregation (CloudWatch in Phase 4 of workstream 04) can filter by service
// without re-deriving from the message.
//
// Transport policy:
//   - In production (NODE_ENV=production): no transport; pino emits raw JSON
//     (one log line per record) suitable for stdout → CloudWatch Logs.
//   - Otherwise: prefer pino-pretty for human-readable colorized output,
//     but fall back to raw JSON if pino-pretty is not installed. This makes
//     the logger safe in lean production-deps images (built with
//     `npm ci --omit=dev`) that nonetheless run with NODE_ENV=development
//     for hot reload (e.g., docker-compose). pino-pretty is a devDependency
//     by design; treating it as optional preserves the lean image while
//     keeping the dev experience nice on the host.
const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function resolvePrettyTransport() {
  if (process.env.NODE_ENV === 'production') return undefined;
  try {
    require.resolve('pino-pretty');
  } catch {
    // pino-pretty not installed (lean prod-deps image). Fall back to JSON.
    return undefined;
  }
  return {
    target: 'pino-pretty',
    options: { translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
  };
}

const logger = pino({
  level,
  transport: resolvePrettyTransport(),
  base: { service: 'photoapp-web', env: process.env.NODE_ENV || 'local' },
});

module.exports = logger;
