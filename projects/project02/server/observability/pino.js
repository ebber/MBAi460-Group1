// Approach 01-foundation.md § Phase 3 Task 3.1.
// Single pino logger instance for the whole server. The base fields
// (service, env) are surfaced on every log line so multi-service log
// aggregation (CloudWatch in Phase 4 of workstream 04) can filter by service
// without re-deriving from the message.
//
// Transport: in non-production, pino-pretty for human-readable colorized
// output during local dev. In production, omit the transport so pino emits
// raw JSON (one log line per record) suitable for stdout → CloudWatch Logs.
const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const transport =
  process.env.NODE_ENV === 'production'
    ? undefined
    : {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
      };

const logger = pino({
  level,
  transport,
  base: { service: 'photoapp-web', env: process.env.NODE_ENV || 'local' },
});

module.exports = logger;
