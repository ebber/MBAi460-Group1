// @mbai460/photoapp-server — Jest configuration
//
// Service-layer unit tests live under tests/services|repositories|middleware|schemas/.
// Surface-specific tests (contract, integration, live) stay in each consumer's
// tree (projects/project01/Part03/server/tests/, projects/project02/server/tests/).
//
// See MBAi460-Group1/projects/project02/client/MetaFiles/Approach/
// 00-shared-library-extraction.md § CL5 for the test-pyramid split rationale.

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  passWithNoTests: true,
};
