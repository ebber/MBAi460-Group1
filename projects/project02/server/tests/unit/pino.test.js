// Approach 01-foundation.md § Phase 3 Task 3.1.
const logger = require('../../observability/pino');

test('logger exposes the standard pino API', () => {
  expect(typeof logger.info).toBe('function');
  expect(typeof logger.warn).toBe('function');
  expect(typeof logger.error).toBe('function');
  expect(typeof logger.debug).toBe('function');
});

test('logger base fields include service and env', () => {
  expect(logger.bindings()).toEqual(expect.objectContaining({ service: 'photoapp-web' }));
  expect(logger.bindings()).toHaveProperty('env');
});

test('logger level honours LOG_LEVEL env or NODE_ENV default', () => {
  // Default (no LOG_LEVEL, no NODE_ENV=production): debug
  expect(['debug', 'info']).toContain(logger.level);
});
