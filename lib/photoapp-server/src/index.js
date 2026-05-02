// @mbai460/photoapp-server — shared service core for MBAi 460 PhotoApp surfaces.
//
// SKELETON STATE (Phase 0.1 of Project 02 Part 01 quest):
// All exports are `null` placeholders. The exports map's *shape* is established
// here so consumer `require('@mbai460/photoapp-server')` resolves correctly via
// npm workspace symlinks. Real exports populated during Phase 0.2 (mechanically
// pure extraction from projects/project01/Part03/server/).
//
// See MBAi460-Group1/projects/project02/client/MetaFiles/Approach/
// 00-shared-library-extraction.md for the full extraction plan.
//
// Library is internals-only (CL2): exports services / repositories / middleware
// (factories) / schemas; never routers. Consumers own routing because their
// wire contracts differ.

module.exports = {
  config: null,        // Phase 0.2: from projects/project01/Part03/server/config.js
  services: null,      // Phase 0.2: { aws, photoapp } — photoapp is buffer-native
  repositories: null,  // Phase 0.3: { users, assets, labels } — CL9 reconciliation
  middleware: null,    // Phase 0.2: { createErrorMiddleware, createUploadMiddleware } DI factories
  schemas: null,       // Phase 0.2: { envelopes, rows } — split from server/schemas.js
};
