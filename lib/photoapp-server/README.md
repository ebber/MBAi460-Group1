# @mbai460/photoapp-server

Shared service core for MBAi 460 PhotoApp surfaces — internals-only library consumed by both `projects/project01/Part03/server/` (Phase 0.4) and `projects/project02/server/` (Phase 1+ of Project 02 Part 01).

> **Status:** Skeleton (1.0.0). Public API surface is `null` placeholders pending Phase 0.2 (service-core extraction). The exports map's *shape* is established at this skeleton stage so consumer's `require('@mbai460/photoapp-server')` resolves correctly via npm workspace symlinks.
>
> Full README — public API, DI seams, version policy, contributor guide — populated at Phase 0.5 of the extraction plan per CL11 (DOC-FRESHNESS protocol).

## What this library is

After Phase 0.2 + 0.3 land, this library will export:

- `config` — `.ini`-driven config loader (consumed unchanged by both surfaces)
- `services.aws` — AWS SDK v3 client factory (`getDbConn`, `getBucket`, `getBucketName`, `getRekognition`)
- `services.photoapp` — buffer-native use-case layer (`getPing`, `listUsers`, `listImages`, `uploadImage`, `downloadImage`, `getImageLabels`, `searchImages`, `deleteAll`); surfaces own transport adapters at the route boundary
- `repositories.{users,assets,labels}` — SQL extracted from `services.photoapp` per Phase 0.3 CL9 reconciliation
- `middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })` — DI factory; consumers pass surface-specific config
- `middleware.createUploadMiddleware({ destDir, sizeLimit })` — DI factory
- `schemas.envelopes.successResponse({ ...extras })` — variadic envelope helper (satisfies Part 03's `{message, data}` and Project 02's per-route shapes from one helper)
- `schemas.envelopes.errorResponse(message, extras?)`
- `schemas.rows.{userRowToObject, imageRowToObject, labelRowToObject, searchRowToObject, deriveKind}` — row converters

## What this library is NOT

- **Not a router.** Consumers own routing because their wire contracts differ (CL2). Part 03 uses `/api/*`; Project 02 uses no prefix at root + optional `/v2` engineering surface.
- **Not transport-aware.** The library is buffer-native; consumers do their own base64 ↔ buffer or multer ↔ buffer adapting at the route boundary.
- **Not env-aware.** Configurability is via construction, not env (CL3). Each consumer constructs middleware with their own DI config.

## Cross-references

- **Approach:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`
- **Plan:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 0
- **Visualization:** `MBAi460-Group1/visualizations/Target-State-mbai460-photoapp-server-lib-extraction-v1.md`
- **Library version policy:** workspace protocol `*` during pre-1.0.0 (Phase 0 → Project 02 Part 01 acceptance); strict-pin both consumers post-1.0.0 (CL8).
