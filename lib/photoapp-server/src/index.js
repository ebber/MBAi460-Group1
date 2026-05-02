// @mbai460/photoapp-server — shared service core for MBAi 460 PhotoApp surfaces.
//
// Internals-only library (CL2): exports services / repositories / middleware
// (factories) / schemas; never routers. Consumers own routing because their
// wire contracts differ.
//
// Public API populated during Phase 0.2 (mechanically pure extraction from
// projects/project01/Part03/server/) + Phase 0.3 (CL9 SQL-into-repositories
// reconciliation; populates `repositories`).
//
// Approach: MBAi460-Group1/projects/project02/client/MetaFiles/Approach/
// 00-shared-library-extraction.md
//
// DI seams (CL3 — configurability via construction, not env):
//   middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })
//   middleware.createUploadMiddleware({ destDir, sizeLimit })

const config = require('./config');

const services = {
  aws: require('./services/aws'),
  photoapp: require('./services/photoapp'),
};

const middleware = {
  createErrorMiddleware: require('./middleware/error').createErrorMiddleware,
  createUploadMiddleware: require('./middleware/upload').createUploadMiddleware,
  cleanupTempFile: require('./middleware/upload').cleanupTempFile,
};

const schemas = {
  envelopes: require('./schemas/envelopes'),
  rows: require('./schemas/rows'),
};

module.exports = {
  config,
  services,
  repositories: null,  // populated in Phase 0.3 (CL9 SQL-into-repositories reconciliation)
  middleware,
  schemas,
};
