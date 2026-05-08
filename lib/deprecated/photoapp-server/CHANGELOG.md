# Changelog — `@mbai460/photoapp-server`

All notable changes to the shared service-core library.

## 1.0.0 — 2026-05-02 (in progress on `feat/lib-extraction`)

- Library skeleton created at Phase 0.1 of the Project 02 Part 01 quest. Public exports map (`config`, `services`, `repositories`, `middleware`, `schemas`) is `null` placeholders — populated during Phase 0.2.
- Workspace structure: monorepo at `MBAi460-Group1/` with workspaces `lib/*`, `projects/project01/Part03`, `projects/project02/server`.
- Reference: `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`.

### To populate at Phase 0.2 (mechanically pure extraction)

- `config.js` ← `projects/project01/Part03/server/config.js` (move).
- `services/aws.js` ← `projects/project01/Part03/server/services/aws.js` (move).
- `services/photoapp.js` ← `projects/project01/Part03/server/services/photoapp.js` (move).
- `middleware/error.js` ← `projects/project01/Part03/server/middleware/error.js` (factorize: `createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`; default args reproduce Part 03 behaviour exactly).
- `middleware/upload.js` ← `projects/project01/Part03/server/middleware/upload.js` (factorize: `createUploadMiddleware({ destDir, sizeLimit })`).
- `schemas/envelopes.js` + `schemas/rows.js` ← split from `projects/project01/Part03/server/schemas.js`.

### To populate at Phase 0.3 (CL9 bounded reconciliation)

- `repositories/users.js`, `repositories/assets.js`, `repositories/labels.js` — SQL extracted from `services/photoapp.js`'s inline statements; pre-extraction observable behaviour preserved per Part 03's existing test suite (regression baseline canary).
- Reconciliation entries: `learnings/2026-05-XX-photoapp-server-extraction.md`.
