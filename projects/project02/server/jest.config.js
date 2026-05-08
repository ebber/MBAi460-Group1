// Approach 01-foundation.md § Phase 11 Task 11.1
// Six-layer Jest multi-project configuration.
// Each layer is independently runnable via npm run test:<layer>.
//
// Project 02 owns local-core tests under tests/unit/photoapp_core/.
// Surface tests cover the integration and contract layers.
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      clearMocks: true,
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      clearMocks: true,
    },
    {
      displayName: 'contract',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/contract/**/*.test.js'],
      clearMocks: true,
    },
    {
      displayName: 'smoke',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/smoke/**/*.test.js'],
      clearMocks: true,
    },
    {
      displayName: 'happy',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/happy_path/**/*.test.js'],
      clearMocks: true,
    },
    {
      displayName: 'live',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/live/**/*.test.js'],
      globalSetup: '<rootDir>/tests/live/setup.js',
      clearMocks: true,
    },
  ],
};
