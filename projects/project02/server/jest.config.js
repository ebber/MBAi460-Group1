// Phase 1.0 placeholder. The six-layer test pyramid (unit / integration / contract /
// smoke / happy_path / live) is wired into a multi-project layout in sub-phase 1.11
// per Approach 01-foundation.md § Phase 11. Until then, this single config runs whatever
// .test.js files land under tests/ in any sub-phase that adds coverage.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
};
