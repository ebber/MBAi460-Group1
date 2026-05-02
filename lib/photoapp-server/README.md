# `@mbai460/photoapp-server`

Shared service core for MBAi 460 PhotoApp surfaces. Internals-only library (CL2): exports the use-cases, repositories, schemas, AWS clients, and middleware factories that both PhotoApp surfaces share. **Does not export routers** — consumers own routing because their wire contracts differ (Part 03 mounts under `/api/*`; Project 02's `/v1` mounts at root + `/v2` for the engineering surface).

**Version:** `1.0.0` (extraction-complete; see `learnings/2026-05-02-photoapp-server-extraction.md`).
**Consumers:** `projects/project01/Part03/server/` (live since Phase 0.2), `projects/project02/server/` (Phase 1+).
**Approach pointer:** `projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`.

---

## Install

This library is workspace-only — it is not published to npm. Install via npm workspaces from the monorepo root:

```sh
cd MBAi460-Group1
npm install                   # installs every workspace + symlinks the lib into consumer node_modules
```

In a consumer's `package.json`:

```json
"dependencies": {
  "@mbai460/photoapp-server": "*"
}
```

The `*` is the workspace protocol during pre-1.1.0 (CL8 relaxed). Strict pinning resumes after Phase 4 of Project 02 Part 01 acceptance.

---

## Public exports

```js
const lib = require('@mbai460/photoapp-server');
// { config, services, repositories, middleware, schemas }
```

### `config`

`.ini`-driven web-service config object. Exposes `web_service_port` (default 8080), `photoapp_config_filename`, `photoapp_s3_profile`, `response_page_size`. Loaded once at module-load time; consumers read fields directly.

```js
const { config } = require('@mbai460/photoapp-server');
app.listen(config.web_service_port);
```

### `services.aws`

AWS SDK v3 client factory. Singleton clients constructed from `photoapp-config.ini` credentials; `getDbConn()` opens a fresh mysql2/promise connection per call (caller is responsible for `.end()`).

| Export | Purpose |
|---|---|
| `getBucket()` | S3Client (singleton) |
| `getBucketName()` | bucket name string |
| `getDbConn()` | new mysql2/promise connection |
| `getRekognition()` | RekognitionClient (singleton) |

### `services.photoapp`

Buffer-native use-case layer. Every method opens its own `dbConn` via `aws.getDbConn()`, runs the use case, and closes the connection in a `try/finally`. Throws sentinel `Error` instances for known failure modes (`'no such userid'`, `'no such assetid'`, `'label is required'`); the consumer's error middleware translates these to status codes.

| Export | Purpose |
|---|---|
| `getPing()` | `{s3_object_count, user_count}` |
| `listUsers()` | `[userObject, ...]` |
| `listImages(userid?)` | `[imageObject, ...]` (filtered by userid when provided) |
| `getImageLabels(assetid)` | `[labelObject, ...]` (validates assetid first) |
| `searchImages(label)` | `[searchObject, ...]` (substring match) |
| `uploadImage(userid, multerFile)` | `{assetid}` (also runs Rekognition for photos) |
| `downloadImage(assetid)` | `{bucketkey, localname, contentType, s3Result}` |
| `deleteAll()` | `{deleted: true}` (clears DB tables + S3 objects) |

### `repositories.{users, assets, labels}`

SQL extracted from `services.photoapp` per Phase 0.3 CL9 reconciliation. Each function takes a connection (or pool) and runs a single statement. SQL strings are byte-identical to Part 03's pre-extraction inline SQL — locked by `tests/repositories/sql-characterization.test.js`.

| Module | Functions |
|---|---|
| `users` | `countAll`, `findAll`, `findById` |
| `assets` | `findAll`, `findByUserId`, `findById`, `existsById`, `insert`, `selectAllBucketkeys`, `deleteAll`, `resetAutoIncrement` |
| `labels` | `findByAssetId`, `findByLabelLike`, `insertOne`, `deleteAll` |

### `middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`

DI factory (CL3). Default invocation reproduces Part 03's pre-extraction error mapping byte-for-byte:

```js
const { middleware } = require('@mbai460/photoapp-server');
app.use(middleware.createErrorMiddleware());
```

Custom mapping for a Project 02 surface that needs `/v2` to return 404 where `/v1` returns 400:

```js
app.use(middleware.createErrorMiddleware({
  statusCodeMap: (err, req) =>
    req.baseUrl.startsWith('/v2') && err.code === 'NOT_FOUND' ? 404 : 400,
  errorShapeFor: (req) => res.locals.errorShape || { message: 'error' },
  logger: pinoInstance,
}));
```

### `middleware.createUploadMiddleware({ destDir, sizeLimit })`

DI factory wrapping multer. Default `destDir = 'tmp/'`, `sizeLimit = 10 * 1024 * 1024` (10 MB) — Part 03's pre-extraction values. Returns a multer instance; consumers call `.single('imagefile')` (or whatever field they expect).

```js
const { middleware } = require('@mbai460/photoapp-server');
const upload = middleware.createUploadMiddleware();
app.post('/upload', upload.single('imagefile'), handler);
```

### `middleware.cleanupTempFile(path)`

Plain function (no factory). Best-effort `fs.unlink` of a multer temp file; safe to call from a `finally` block. Used by `services.photoapp.uploadImage`.

### `schemas.envelopes`

| Export | Purpose |
|---|---|
| `successResponse({ ...extras })` | variadic `{message, data, ...}` shape — covers Part 03's `{message, data}` and Project 02's per-route variants from one helper |
| `errorResponse(message, extras?)` | `{message, ...}` |

### `schemas.rows`

Pass-through DB-row → response-object converters. Shapes match the column names mysql2 returns; the converters exist as a stable seam so route handlers don't bind directly to the driver's row shape and so a future schema rename lands in one place.

| Export | Output shape |
|---|---|
| `userRowToObject` | `{userid, username, givenname, familyname}` |
| `imageRowToObject` | `{assetid, userid, localname, bucketkey, kind}` |
| `labelRowToObject` | `{label, confidence}` |
| `searchRowToObject` | `{assetid, label, confidence}` |
| `deriveKind(filename)` | `'photo'` for `.jpg/.jpeg/.png/.heic/.heif`; `'document'` otherwise |
| `PHOTO_EXTENSIONS` | `Set` of photo extensions, exported for tests/consumers |

---

## Configurability via construction (CL3)

The library does **not** read environment variables. Configurability lives in the factory functions' DI surface. This keeps:

- the library a pure dependency (consumers control config; the library has no opinions about env-var conventions)
- Project 02's pino-based logging swappable for Part 03's `console`-based logging without forking
- testing trivial (pass a fake logger / fake destDir; no env mutation)

If you find yourself reaching for `process.env.X` inside the library, that is the signal: add a DI knob to the relevant factory instead.

---

## Version policy (CL8)

| Phase | Version | Consumer pinning |
|---|---|---|
| Phase 0 → Project 02 Part 01 acceptance | `1.0.0` (workspace protocol `*`) | Floating — both consumers see edits immediately via the workspace symlink |
| Post Phase 4 acceptance | `1.1.0` | Strict pin (`"@mbai460/photoapp-server": "1.1.0"`) — both consumers updated in lockstep |

The relaxed pre-1.1.0 policy reduces N-file PR overhead during the high-churn extraction + Project 02 build period. Once both surfaces are operating against a stable contract, strict pinning resumes for collaboration safety.

---

## How to add a new export

1. **Place the new module** in `src/<area>/<name>.js` (or extend an existing one). Areas today: `services/`, `repositories/`, `middleware/`, `schemas/`.
2. **Wire it up** in `src/index.js` under the right key. Top-level keys are `config`, `services`, `repositories`, `middleware`, `schemas` — don't add a new top-level key without an architectural conversation.
3. **Update `tests/exports-shape.test.js`** — add the new key to the explicit `toEqual()` list. The test exists precisely to make accidental rename / removal a CI failure rather than a runtime surprise hours later.
4. **Add unit tests** in `tests/<area>/<name>.test.js`. For repositories, follow the existing pattern: mock `conn.execute`, assert SQL string + params per scenario.
5. **If the export adds a SQL statement**, add a row to `tests/repositories/sql-characterization.test.js` so the literal SQL string is locked.
6. **Update this README** in the same PR — § Public exports is the contract.
7. **Update both consumers' READMEs** if the export changes their integration. The PR template carries a checkbox for this.

CL11 is enforced via the PR template; CL12 (lib-touching label) routes the PR through cross-consumer review.

---

## Test commands

```sh
cd lib/photoapp-server && npm test
```

Runs all unit + characterization tests. As of `1.0.0`: 99 tests across 11 suites, ~0.5s.

To run a single suite:

```sh
cd lib/photoapp-server && npx jest tests/repositories/assets.test.js
```

Live regression against real AWS lives in the **consumer** trees, not here — `projects/project01/Part03/server/tests/live_photoapp_integration.test.js` (gated by `PHOTOAPP_RUN_LIVE_TESTS=1`). The library's own tests are mock-only by design; AWS state is a consumer concern.

---

## What this library is NOT

- **Not a router.** Consumers own routing because their wire contracts differ.
- **Not transport-aware.** The library is buffer-native; consumers do their own base64 ↔ buffer or multer ↔ buffer adapting at the route boundary.
- **Not env-aware.** Configurability is via construction (CL3).
- **Not multi-tenant.** Single-config, single-DB, single-bucket. Multi-tenancy is a future-state concern documented in `Approach/Future-State-cicd.md`.

---

## Cross-references

- **Approach:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`
- **Reconciliation log:** `MBAi460-Group1/learnings/2026-05-02-photoapp-server-extraction.md`
- **Plan + state:** `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 0; `OrientationMap.md` § Active
- **Visualization:** `MBAi460-Group1/visualizations/Target-State-mbai460-photoapp-server-lib-extraction-v1.md`
- **Doc-freshness protocol:** `MBAi460-Group1/MetaFiles/DOC-FRESHNESS.md`
- **Contributor guide:** `MBAi460-Group1/CONTRIBUTING.md`
