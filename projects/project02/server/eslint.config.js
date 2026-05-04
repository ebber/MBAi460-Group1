// Flat config (ESLint v9+). Approach 01-foundation.md § Phase 1 Task 1.3.
// no-console allows warn/error so server.js startup signal works pre-pino;
// pino lands in Approach Phase 3 § 3.1 and replaces every other console.* call.
// Husky integration is deferred (configs are in place; wire-up later).
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['node_modules/**', '_assignment-template/**', 'coverage/**'],
  },
];
