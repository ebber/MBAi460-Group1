# Web Service Workstream Approach

> **For agentic workers:** Execute as a TDD checklist. For each route: define the OpenAPI op, write the failing contract test, write failing unit + integration tests, implement the layered handler (route → controller → library service → library repository → DB), then verify all tests green plus the happy-path E2E flow. **Preconditions: `00-shared-library-extraction.md` (Phase −1) and `01-foundation.md` are complete and accepted.** Goal: pass the Gradescope web service autograder at 60/60.

> **The shared library `@mbai460/photoapp-server` already implements the use-case layer.** It exports `services.photoapp.{getPing, listUsers, listImages, uploadImage, downloadImage, getImageLabels, searchImages, deleteAll}` (extracted from Project 01 Part 03 in Phase −1; Part 03 already consumes it). This workstream is the **Project 02 spec adapter layer** sitting on top of that library — the route + controller files that adapt the assignment spec's URLs, request bodies (base64), and envelope shapes to the library's buffer-native services. This file describes how to build the spec adapters, **not** how to build the use-case logic (the library owns it; do not modify the library from this workstream).

## Goal

Implement six spec-compliant web service routes on top of the library + the foundation from `01-foundation.md`, plus wire the two assignment-provided routes (`/ping`, `/users`) onto the same architecture. Every route returns the documented JSON envelope (built via the library's `successResponse({...extras})`), retries MySQL where appropriate via `p-retry`, validates input via `zod`, and surfaces errors through the library's `createErrorMiddleware`-constructed middleware. Submit to Gradescope and reach 60/60.

**Service-layer reuse via the library:** `@mbai460/photoapp-server.services.photoapp` is the use-case layer for both Part 03 and Project 02. Project 02's controllers do the transport-shape adapting (base64 ↔ buffer for upload/download) at the route boundary; the library is buffer-native and does not change between surfaces. This workstream's job is purely the **route + controller layer + zod schemas + per-route tests** — no business logic is added in `projects/project02/server/services/`.

## Scope

This workstream owns:

- `server/routes/v1/*.js` — thin route registrations using `validate(schema), controller`.
- `server/controllers/v1/*.js` — controllers that translate request → library service call → response envelope. Includes the base64 ↔ buffer adapter for `image.js` (upload reads `req.body.data`, base64-decodes to a buffer, passes to library `uploadImage`; download awaits library `downloadImage` returning a buffer, base64-encodes for the response body).
- `server/schemas/request_schemas.js` — `zod` schemas per route.
- (Optional) Legacy adapter shims `server/api_*.js` for Gradescope file-shape compatibility — see *Compatibility Strategy with Gradescope* in `00-overview-and-conventions.md`.
- Per-route unit / integration / contract tests in `projects/project02/server/tests/{unit,integration,contract,happy_path}/`.
- Happy-path E2E `upload_lifecycle.test.js` unskips per route as it lands.
- The Gradescope web service submission (60/60).

This workstream does **not** own:

- The `photoapp.py` rewrite — owned by `03-client-api.md`.
- `/v2` engineering surface — owned by `04-engineering-surface.md`.
- The use-case layer (`services.photoapp.*`), repositories, AWS client factory, error middleware factory, upload middleware factory, envelope helpers, row converters — all live in `@mbai460/photoapp-server` (consumed unchanged). Service-layer unit tests live in the library too.
- The pool factory (`services/pool.js`), breakers (`services/breakers.js`), pino, request_id, validate middleware, error class hierarchy, OpenAPI stub — all consumed from `01-foundation.md` (which itself consumes the library).

## Dependencies

Read first:

- `00-overview-and-conventions.md`
- `01-foundation.md` — must be complete (acceptance checklist green).
- `project02-part01.pdf` — assignment handout (route signatures, response shapes).
- `MBAi460-Group1/projects/project01/Part02/MetaFiles/Implementation-Notes.md` (if present) — Part 02 PhotoApp behaviour as reference.

Required state at workstream start:

- `make up` brings server + mysql + localstack to healthy.
- `npm test --workspaces` from monorepo root: library tests pass; Project 02 foundation tests pass; route tests are skipped or absent.
- Library `@mbai460/photoapp-server` exposes `services.aws.{getBucket, getBucketName, getRekognition, getDbConn}` and `services.photoapp.*` (Phase −1) and is symlinked into `projects/project02/server/node_modules/`.
- Project 02's `services/pool.js` exports `getPool` / `closePool`; `services/breakers.js` exports `getBucketBreaker` / `getRekognitionBreaker` (`01-foundation.md` Phase 7).
- Project 02's `app.js` constructs error middleware via `middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })` — surface-specific DI for the library factory; `BadRequestError`/`NotFoundError` map per the v1 spec contract (`01-foundation.md` Phase 5).
- Library `schemas.envelopes` exports `successResponse({...extras})` / `errorResponse(message, extras?)` (Phase −1).

## Target Files

```text
projects/project02/server/
  routes/
    v1/
      index.js                         # exports the v1 router; mounts every route below
      ping.js
      users.js
      images.js                        # GET /v1/images
      image.js                         # POST /v1/image/:userid + GET /v1/image/:assetid
      image_labels.js                  # GET /v1/image_labels/:assetid
      images_with_label.js             # GET /v1/images_with_label/:label
      delete_images.js                 # DELETE /v1/images
  controllers/
    v1/
      ping.js                          # calls library services.photoapp.getPing(); shapes {message, M, N}
      users.js                         # calls library services.photoapp.listUsers(); shapes {message, data}
      images.js                        # calls library services.photoapp.listImages(); strips kind; shapes {message, data}
      image.js                         # POST: base64-decodes req.body.data → buffer → library uploadImage; GET: library downloadImage → buffer → base64 → {message, userid, local_filename, data}
      image_labels.js                  # calls library services.photoapp.getImageLabels()
      images_with_label.js             # calls library services.photoapp.searchImages()
      delete_images.js                 # calls library services.photoapp.deleteAll()
  schemas/
    request_schemas.js                 # zod schemas per route (surface-specific)
  api_get_ping.js                       # legacy shim — re-exports from controllers (only if Gradescope's autograder needs the literal filenames; default is layered structure without shims, see Compatibility Strategy)
  api_get_users.js
  api_get_images.js
  api_post_image.js
  api_get_image.js
  api_get_image_labels.js
  api_get_images_with_label.js
  api_delete_images.js
  tests/
    unit/
      controllers_v1.test.js           # surface-specific: shape assertions per controller; mocks the library service
    integration/
      v1_ping.test.js
      v1_users.test.js
      v1_images.test.js
      v1_image_post.test.js
      v1_image_get.test.js
      v1_image_labels.test.js
      v1_images_with_label.test.js
      v1_delete_images.test.js
    contract/
      openapi_conformance.test.js      # unskipped per route
    happy_path/
      upload_lifecycle.test.js         # unskipped per route
api/
  openapi.yaml                          # extended with full schemas
```

Service-layer logic and repositories live in `lib/photoapp-server/` (extracted in Phase −1) and are not duplicated in Project 02's tree. If you find yourself about to create `projects/project02/server/services/photoapp.js`, stop — the library owns it.

## Design Decisions

- **W1 — Routes are thin.** A route file imports `validate`, the request schema, and the controller; nothing else. The router file `routes/v1/index.js` mounts the routes in a stable order.
- **W2 — Controllers wrap success / error.** A controller awaits the service, calls `successResponse(...)`, and lets thrown errors propagate to the error middleware. Route-specific error envelopes are set on `res.locals.errorShape` *before* awaiting the service so the middleware can format failures correctly.
- **W3 — Services own the use case (in the library).** Each use case (in `lib/photoapp-server/src/services/photoapp.js`) opens a pool connection or uses `pool.execute` directly when one is injected, wraps MySQL calls in `pRetry`, wraps AWS calls in the appropriate breaker (when one is injected via `getBucketBreaker` / `getRekognitionBreaker` from Project 02's tree), and orchestrates the steps. Library services depend only on the library's `repositories/`, the library's `services/aws.js` for AWS clients, and the library's `schemas/rows.js`. Project 02's tree does **not** add to this — surface concerns are routes + controllers + zod schemas + DI config.
- **W4 — Repositories own the SQL.** Each repository function is a single SQL statement plus row mapping. They take a connection (or pool) and parameters; they do not catch errors. The service layer decides what to do with failures.
- **W5 — Transactions live in the service layer.** `uploadImage` and `deleteAllImages` are the only transactional flows. They acquire a connection from the pool, `BEGIN` / `COMMIT` / `ROLLBACK`, and release the connection in `finally`.
- **W6 — Legacy adapter shims preserve the submission file layout.** Each `server/api_*.js` shim re-exports the controller it replaces. The shim is one line: `module.exports = require('./controllers/v1/<name>');`. This lets the submission tarball contain both the layered structure and the spec-required filenames.
- **W7 — Mount alias for Gradescope.** `app.use('/v1', v1Router)` always; `app.use('/', v1Router)` when `STRIP_V1_PREFIX=1` (default in the submission build). Gradescope hits `/ping`; engineering tests hit `/v1/ping`.
- **W8 — Retry policy.** `p-retry({ retries: 2 })` wraps each MySQL call (max 3 attempts total). AWS calls go through `getBucketBreaker()` / `getRekognitionBreaker()` from foundation, which themselves wrap retries internally via the SDK.
- **W9 — Validation per route.** Every route has a `zod` schema in `request_schemas.js`. Body / params / query are parsed; the controller reads from `req.validated`.
- **W10 — Response shapes match the spec contract exactly.** No additional fields on success responses; legacy field names (`M`, `N`, `assetid`, `userid`, `local_filename`) preserved.
- **W11 — The library owns the use-case layer; the surface owns the route layer.** `@mbai460/photoapp-server.services.photoapp` is the canonical use-case implementation (extracted from Part 03 in Phase −1). Project 02 imports it; the controllers do the base64 ↔ buffer transport adapting at the route boundary. **Do not modify the library from this workstream** — if a behaviour gap surfaces, follow CL9 (bounded library change with its own commit + reconciliation log + tests in both surfaces).

---

## Phase 0: Configure Consumer & Verify DI

> Goal: confirm `01-foundation.md` Phase 0 wired Project 02 as a workspace consumer of `@mbai460/photoapp-server`; sanity-check that the library exports satisfy what the upcoming routes need; then proceed to spec-adapter route work. **No code is moved or copied here** — the service layer already lives in the library, and the foundation already wired the DI seams (error middleware, pool, breakers).

### 0.1 Verify library exports and consumer wiring

The library's service-layer exports (extracted in Phase −1, consumed unchanged by Project 02 in `01-foundation.md`):

- [x] (existing — library) `services.photoapp.getPing()` returns `{M, N}` (S3 object count + user count).
- [x] (existing — library) `services.photoapp.listUsers()` returns `[{userid, username, givenname, familyname}, ...]` ordered by `userid`.
- [x] (existing — library) `services.photoapp.listImages(userid?)` returns `[{assetid, userid, localname, bucketkey, kind}, ...]` ordered by `assetid`. Project 02's `controllers/v1/images.js` strips `kind` from the response shape (D11 in `00-overview-and-conventions.md`).
- [x] (existing — library) `services.photoapp.uploadImage({ userid, localFilename, dataBuffer })` — buffer-native (Phase −1 reconciliation; Part 03's controller now reads multer temp file → buffer; Project 02's controller will base64-decode `req.body.data` → buffer). The library does not know or care which transport produced the buffer.
- [x] (existing — library) `services.photoapp.downloadImage(assetid)` returns `{ userid, localFilename, dataBuffer }` — buffer-native. Part 03's controller streams the buffer via `Readable.from(buffer).pipe(res)`; Project 02's controller base64-encodes the buffer for the spec envelope.
- [x] (existing — library) `services.photoapp.getImageLabels(assetid)` returns `[{label, confidence}, ...]`.
- [x] (existing — library) `services.photoapp.searchImages(label)` returns `[{assetid, label, confidence}, ...]`.
- [x] (existing — library) `services.photoapp.deleteAll()` performs DB-first (labels → assets) then S3 deleteobjects, returns `true`.

### 0.2 Verify Project 02 DI seams from foundation

- [x] (existing — Phase 0 of foundation) `projects/project02/server/services/pool.js` exports `getPool()` / `closePool()`.
- [x] (existing — Phase 0 of foundation) `projects/project02/server/services/breakers.js` exports `getBucketBreaker()` / `getRekognitionBreaker()` wrapping the library's S3 / Rekognition clients.
- [x] (existing — Phase 0 of foundation) Project 02's `app.js` constructs `middleware.createErrorMiddleware({ statusCodeMap: project02MountPrefixAwareMap, errorShapeFor, logger })` from the library factory.
- [x] (existing — Phase 0 of foundation) Library `schemas.envelopes.successResponse({...extras})` / `errorResponse(message, extras?)` — variadic; satisfies all per-route shapes.
- [x] (existing — Phase 0 of foundation) Library `schemas.rows.{userRowToObject, imageRowToObject, labelRowToObject, searchRowToObject, deriveKind}` — consumed by the controllers when they need to re-shape rows.

### 0.3 Plan the new files (this workstream's net-new surface)

The following are **net-new for Project 02**:

- [ ] `routes/v1/index.js` + per-route files — thin route registrations that pair `validate(schema)` with the matching controller.
- [ ] `controllers/v1/*.js` — surface-specific spec-shape adapters; set `res.locals.errorShape` before awaiting the library service; call the library service; pass the buffer adapter at the route boundary for upload/download.
- [ ] `schemas/request_schemas.js` — zod schemas per route.
- [ ] (Optional) `api_*.js` shim layer — only if the Gradescope autograder requires the literal filenames; default is to ship without shims (see *Compatibility Strategy* in `00-overview-and-conventions.md`).

### 0.4 Acceptance for Phase 0

- [ ] `cd projects/project02/server && node -e "const { services } = require('@mbai460/photoapp-server'); console.log(Object.keys(services.photoapp));"` prints the eight use-case names above.
- [ ] All foundation tests green: `cd projects/project02/server && npm test` covers the surface-specific layers; `cd lib/photoapp-server && npm test` covers the service-layer.
- [ ] Library `services.photoapp.listUsers` returns the spec shape `{userid, username, givenname, familyname}` (verified by spec-shape acceptance tests written in `01-foundation.md` Phase 8).
- [ ] Library `services.photoapp.listImages` returns rows including `kind`; Project 02's `controllers/v1/images.js` (yet to be written) is responsible for stripping `kind` for `/v1/images` responses.
- [ ] **No source under `projects/project02/server/services/photoapp.js`, `repositories/`, `middleware/error.js`, `middleware/upload.js`, `schemas/envelopes.js`, or `schemas/rows.js`.** If `git ls-files` shows any of these, stop — they belong in the library.

### 0.5 Documentation touchpoint (per CL11)

- [ ] Update `projects/project02/server/README.md`: add a "Routes" subsection that names the eight `/v1/*` routes this workstream creates (the section is populated as routes land; here we add the heading + the convention).
- [ ] Update `projects/project02/api/README.md` (or create) to point at `api/openapi.yaml` as the contract source-of-truth for `/v1`.
- [ ] No library docs change — the library exports are unchanged by this workstream.

---

## Phase 1: Layered Skeleton + Provided Routes

This phase **wires up** the assignment-provided `/ping` and `/users` routes onto the layered architecture. The **service** code already exists in the shared library (`@mbai460/photoapp-server.services.photoapp`, extracted in Phase −1); this phase only authors the new `routes/v1/` + `controllers/v1/` files and confirms the spec envelope shapes via integration tests. Once green, the same pattern is replicated for every remaining route.

> **Governance for Phases 1–8 below (re-stated for emphasis):** *Every reference in subsequent phases to `server/services/photoapp.js`, `server/repositories/users.js`, `server/repositories/assets.js`, `server/repositories/labels.js`, or `server/schemas/rows.js` refers to the **library-resident** version (`lib/photoapp-server/src/...`).* These files are not created or modified inside `projects/project02/server/`. Tasks below that say "Modify: `server/services/photoapp.js`" mean: *(a) verify the library export already covers what this phase needs; (b) if not, surface a CL9 bounded library change request, get review, land it in the library; (c) then continue this phase against the updated library export.* Project 02's tree contributes the **route + controller + zod-schema + per-route test** files only. If you find yourself adding code to `projects/project02/server/services/`, `repositories/`, or `schemas/rows.js`, stop — that work belongs in the library.

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-v1-layered-flow-v1.md`
>
> Before authoring the first route file, render a `flowchart LR` of the **layered flow for a single read route** (use `/v1/users` as the example) so the layer ownership boundaries are unambiguous.
>
> - **Story**: "Project 02 owns route → controller; the library owns service → repository → DB. The library boundary is where mocking happens."
> - **Focus**: highlight the **library boundary** in **red** — `require('@mbai460/photoapp-server')` is the seam Project 02 controllers cross. Highlight the **controller's `res.locals.errorShape`** in **amber** — that's how the per-route error envelope is propagated. Highlight the **`successResponse({...})`** call in **green** to anchor the success path.
> - **Shape vocab**: stadium `([...])` = HTTP route; rounded `(...)` = surface-specific module (route / controller); subgraph (`Project 02 server` vs `lib/photoapp-server`) = ownership boundary; cylinder `[(...)]` = MySQL pool; trapezoid = library DI seam; diamond `{...}` = test mock seam (typically jest.mock at the library boundary).
> - **Brevity**: layer name + 1-line responsibility.
> - **Direction**: `flowchart LR`, with the response path as a dashed return arrow.

### Task 1.1: `routes/v1/index.js` router

**Files:**

- Create: `server/routes/v1/index.js`

**Behavior:**

```js
const express = require('express');
const router = express.Router();

router.use('/ping', require('./ping'));
router.use('/users', require('./users'));
router.use('/images', require('./images'));            // GET /v1/images
router.use('/image', require('./image'));              // POST /v1/image/:userid + GET /v1/image/:assetid
router.use('/image_labels', require('./image_labels'));
router.use('/images_with_label', require('./images_with_label'));
router.delete('/images', require('./delete_images').deleteImages);

module.exports = router;
```

**Checklist:**

- [ ] File created.
- [ ] `app.js` already mounts `/v1`; `STRIP_V1_PREFIX=1` aliases `/`.
- [ ] All sub-routers below are placeholders that return 501 until implemented.

### Task 1.2: Verify library `services.photoapp.getPing` shape

> **No service code is written here.** `getPing` already lives in `lib/photoapp-server/src/services/photoapp.js` (extracted from Part 03 in Phase −1) and is unit-tested in `lib/photoapp-server/tests/services/photoapp.test.js`. This task confirms the library export's shape against the spec.

**Files:**

- Read-only: `lib/photoapp-server/src/services/photoapp.js` — confirm `getPing()` returns `{M, N}` per spec.
- Read-only: `lib/photoapp-server/tests/services/photoapp.test.js` — confirm the unit test asserts `{M, N}` shape.

**Reference shape (from the library; do not retype here):**

```js
// in lib/photoapp-server/src/services/photoapp.js
async function getPing() {
  // S3 ListObjectsV2 + DB SELECT COUNT(*)
  return { M, N };
}
```

> When Project 02's controller calls `getPing()` it will receive `{M, N}` directly. Pool injection and breaker injection (the additions Project 02 needs for transactional flows / circuit-breaking) happen for the library's `uploadImage` / `downloadImage` / `deleteAll` use cases via dependency injection at the controller level — **not** by editing the library.

**Checklist:**

- [x] (existing — library) `services.photoapp.getPing()` returns `{M, N}`.
- [x] (existing — library) library tests cover the success + AWS-failure + DB-failure paths.
- [ ] If a behaviour gap is found (e.g., the breaker / pool injection point isn't where Project 02 needs it), open a CL9 bounded library change request — do not patch the library inline from this workstream.

### Task 1.3: `controllers/v1/ping.js` + `routes/v1/ping.js`

**Files:**

- Create: `server/controllers/v1/ping.js`
- Create: `server/routes/v1/ping.js`
- Create: `server/tests/integration/v1_ping.test.js`

**Controller:**

```js
const { schemas, services } = require('@mbai460/photoapp-server');

module.exports = async (req, res, next) => {
  res.locals.errorShape = { M: -1, N: -1 };
  try {
    const data = await services.photoapp.getPing();
    res.json(schemas.envelopes.successResponse(data));
  } catch (err) { next(err); }
};
```

**Route:**

```js
const express = require('express');
const router = express.Router();

router.get('/', require('../../controllers/v1/ping'));

module.exports = router;
```

**Failing integration test (`tests/integration/v1_ping.test.js`):**

```js
jest.mock('@mbai460/photoapp-server', () => {
  const actual = jest.requireActual('@mbai460/photoapp-server');
  return {
    ...actual,
    services: { ...actual.services, photoapp: { getPing: jest.fn() } },
  };
});
const request = require('supertest');
const { services } = require('@mbai460/photoapp-server');
const app = require('../../app');

describe('GET /ping', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns success envelope with M, N', async () => {
    services.photoapp.getPing.mockResolvedValue({ M: 5, N: 3 });
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'success', M: 5, N: 3 });
  });

  test('returns 500 envelope with M=-1, N=-1 on service failure', async () => {
    services.photoapp.getPing.mockRejectedValue(new Error('boom'));
    const res = await request(app).get('/ping');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'boom', M: -1, N: -1 });
  });
});
```

**Checklist:**

- [ ] Tests fail (no controller / route yet).
- [ ] Implement controller + route.
- [ ] Tests green.
- [ ] Smoke: `make up && curl http://localhost:8080/ping` returns the expected envelope (Gradescope-pinned root mount per D12). The `/v1/ping` mount remains available when `OPTIONAL_V1_PREFIX=1` for engineering tests that want a distinguishable URL.

### Task 1.4: Legacy adapter shim `api_get_ping.js`

**Files:**

- Modify or create: `server/api_get_ping.js`

**Shim:**

```js
module.exports = { get_ping: require('./controllers/v1/ping') };
```

**Checklist:**

- [ ] Legacy filename re-exports the controller.
- [ ] Submission tarball includes `api_get_ping.js`; the autograder is happy.

### Task 1.5: Repeat the pattern for `/users`

**Files:**

- Create: `server/repositories/users.js` — `listUsers(pool)` + `countUsers(pool)`.
- Create: `server/services/photoapp.js` — `listUsers()`.
- Create: `server/controllers/v1/users.js` — error shape `{ data: [] }`.
- Create: `server/routes/v1/users.js`.
- Create: `server/tests/integration/v1_users.test.js`.
- Modify: `server/api_get_users.js` shim.
- Update: `api/openapi.yaml` — `/v1/users` schema.

**Checklist:**

- [ ] Failing service test: returns mapped user objects in the spec shape `{userid, username, givenname, familyname}` (matches `create-photoapp.sql` columns and Part 02 `photoapp.py` tuple ordering).
- [x] (existing — library) `services.photoapp.listUsers()` returns rows mapped via `schemas.rows.userRowToObject` to `{userid, username, givenname, familyname}`. Project 02's controller calls the library export and shapes the envelope; no library change needed.
- [ ] Failing integration test: success envelope wraps `data: [...]`.
- [ ] Implement; tests green.
- [ ] Contract test (`openapi_conformance`) unskipped for `/v1/users`; passes.
- [ ] Smoke: `curl http://localhost:8080/v1/users` returns seeded users from compose MySQL.

**Check your work for Phase 1:**

- Unit + integration green for `/v1/ping`, `/v1/users`.
- Contract tests for those two routes pass.
- Happy-path E2E unskips the ping + users steps; both pass.

> **Optional Test Step** — suggested file `projects/project02/server/tests/contract/spec_envelope_table.test.js`
>
> Two routes done; six to go. Each will assert essentially the same shape claims (`{message: 'success', ...}` on 2xx; `{message: <errstr>, <route-specific-error-keys>}` on error). A single table-driven test that captures *every* spec-required envelope for *every* route in one place makes the spec contract grep-able and the test runnable in <1 second.
>
> - **What to lock down**: a flat array like `[ { route: 'GET /ping', success: { status: 200, body: { message: 'success', M: <int>, N: <int> } }, errors: [{ status: 500, body: { message: <string>, M: -1, N: -1 } }] }, ... ]` — one entry per route family. The test mocks `services.photoapp` per row and asserts shapes. As routes land, you fill in rows; until then, the row is `test.skip`.
> - **Why this catches bugs**: Gradescope tests *exactly* the envelope shape. A drift on `images.kind` leakage, on `assetid: -1` typo, on an `error` field accidentally added — all caught by one test instead of N independent ones. Also: it's the closest thing to a literal restatement of the assignment PDF.
> - **Decision branches**: build now (strongly recommended — Phase 1 is the moment the pattern crystallizes for two routes; Phase 2-7 will paste the same shape six times either way), queue (acceptable if you'd rather wait until `04-engineering-surface.md` and bundle with `/v2` envelope tests), skip (no — every individual route test is a worse version of this).

> **Optional Utility Step** — suggested artifact `tools/route-scaffold.sh <route-name>` (Bash) or a single-template generator
>
> Routes 2–7 follow the same pattern: `routes/v1/<name>.js` + `controllers/v1/<name>.js` + `tests/integration/v1_<name>.test.js` + `tests/unit/<name>_controller.test.js` + an `api/openapi.yaml` op + an entry in `routes/v1/index.js`. Six routes × five files = thirty files of essentially-the-same boilerplate.
>
> - **What it does**: `tools/route-scaffold.sh users` produces stub versions of the five files with the route-name interpolated, opens them in `$EDITOR`, and prints the next-step checklist. Ten minutes of authoring saves 30 minutes of copy-paste-edit-rename.
> - **Why now**: Phase 1 is the *only* moment the template is clear and you haven't started the copy-paste tax yet. Build the scaffolder *with* the second route as your test case; routes 3–7 amortize.
> - **Decision branches**: build now (recommended only if you've done a copy-paste round and noticed the friction; otherwise the abstraction is premature), queue (revisit at Phase 3 — by then you'll know if the friction is real), skip (acceptable; six routes is borderline for justifying a generator).

---

## Phase 2: `GET /v1/images` (with optional `?userid=`)

### Task 2.1: Repository layer

**Files:**

- Create: `server/repositories/assets.js`
- Modify: `server/tests/unit/repositories.test.js`

**Functions:**

```js
async function listAllAssets(pool) {
  const [rows] = await pool.execute(
    'SELECT assetid, userid, localname, bucketkey FROM assets ORDER BY assetid ASC',
  );
  return rows;
}

async function listAssetsByUser(pool, userid) {
  const [rows] = await pool.execute(
    'SELECT assetid, userid, localname, bucketkey FROM assets WHERE userid = ? ORDER BY assetid ASC',
    [userid],
  );
  return rows;
}
```

**Checklist:**

- [x] (existing — Part 03 `services/photoapp.js#listImages` already has the SQL above, returning rows with `localname`; just port + reuse).
- [ ] Failing test for both functions using a mocked pool.
- [ ] Implement; tests green.
- [ ] Note: the actual DB column name is `localname` (per `create-photoapp.sql` line in `projects/project01/`); both the spec and the DB agree on the name. **Do not** alias to `assetname` — there is no such column. (The spec field name `localname` is the same as the DB column name; this is consistent across Part 02 client, Part 03 server, and Project 02 server.)

### Task 2.2: Service `listImages(userid?)`

**Files:**

- Modify: `server/services/photoapp.js`
- Modify: `server/tests/unit/photoapp_service.test.js`

**Behavior:**

- If `userid` is undefined → `listAllAssets`.
- Otherwise → `listAssetsByUser(userid)`.
- Wrap in `pRetry({ retries: 2 })`.
- Map rows through `imageRowToObject` from `schemas/rows.js`.

**Checklist:**

- [ ] Failing tests for both branches.
- [ ] Failing test for retry behaviour (transient failure).
- [ ] Implement; tests green.

### Task 2.3: Request schema

**Files:**

- Modify: `server/schemas/request_schemas.js`

**Schema:**

```js
const z = require('zod');

const imagesQuery = z.object({
  userid: z.coerce.number().int().positive().optional(),
});

module.exports = { ...module.exports, imagesQuery };
```

**Checklist:**

- [ ] Failing unit test: valid integer parses; non-integer string rejects with `BadRequestError`.

### Task 2.4: Controller + route + integration test

**Files:**

- Create: `server/controllers/v1/images.js`
- Create: `server/routes/v1/images.js`
- Create: `server/tests/integration/v1_images.test.js`

**Controller:**

```js
module.exports = async (req, res, next) => {
  res.locals.errorShape = { data: [] };
  try {
    const data = await photoapp.listImages(req.validated.query.userid);
    res.json(successResponse({ data }));
  } catch (err) { next(err); }
};
```

**Route:**

```js
router.get('/', validate({ query: imagesQuery }), require('../../controllers/v1/images'));
```

**Failing tests:**

- `GET /v1/images` → 200, `{message: 'success', data: [...]}`.
- `GET /v1/images?userid=80001` → 200, filters to that user.
- `GET /v1/images?userid=abc` → 400, `{message: <validation msg>, data: []}`.
- Service throws → 500 envelope.

**Checklist:**

- [ ] Failing tests added.
- [ ] Implement controller + route + service + repo wiring.
- [ ] Legacy shim `api_get_images.js` re-exports the controller.
- [ ] Update OpenAPI for `/v1/images`.
- [ ] All tests green.

**Check your work:**

- Smoke: `curl localhost:8080/v1/images` returns ordered list; `?userid=` filters.
- Contract test for `/v1/images` passes.

---

## Phase 3: `POST /v1/image/:userid`

This is the most complex route — multipart-style base64 body, S3 upload, Rekognition labels, transactional DB write.

> **Optional Mermaid Visualization Step (strongly recommended — multi-AWS transaction)** — suggested file `visualizations/Target-State-project02-upload-transaction-v1.md`
>
> Before implementing `uploadImage`, render a `flowchart TD` of the **upload transaction**: base64 → S3 → DB → Rekognition → labels, with rollback paths.
>
> - **Story**: "DB transaction wraps the S3 + Rekognition + DB writes; on any failure, DB rolls back. S3 may leak orphan objects on Rekognition failure (acceptable per spec); cleanup is best-effort."
> - **Focus**: highlight the **rollback edges** (every step's failure path back to `conn.rollback()` + `conn.release()`) in **red** — these are the most common bug source. Highlight the **`kind = deriveKind(localFilename)` branch** (skip Rekognition for documents) in **amber** since it's a Q8 design decision.
> - **Shape vocab**: stadium `([...])` = HTTP entry / exit; rounded `(...)` = service step; cylinder `[(...)]` = DB op; cloud-style subgraph = AWS call (S3 / Rekognition); hexagon `{{...}}` = breaker boundary; diamond `{kind?}` = decision; bold red edges = rollback path.
> - **Brevity**: ≤ 4 words / node; edges are verbs (`begin`, `puts`, `inserts`, `detects`, `commits`, `rolls back`).
> - **Direction**: `flowchart TD` so the happy path reads top → bottom and rollback edges visibly cross-cut.

### Task 3.1: Request schema

**Files:**

- Modify: `server/schemas/request_schemas.js`

**Schemas:**

```js
const imagePostParams = z.object({
  userid: z.coerce.number().int().positive(),
});

const imagePostBody = z.object({
  local_filename: z.string().min(1).max(512),
  data: z.string().min(1),                       // base64-encoded; size cap enforced by express.json limit
});
```

**Checklist:**

- [ ] Failing unit tests: missing fields reject; valid payload parses.

### Task 3.2: Repository functions

**Files:**

- Modify: `server/repositories/users.js` — `findUserById(conn, userid)`.
- Modify: `server/repositories/assets.js` — `insertAsset(conn, {userid, localname, bucketkey, kind})`. Note: the `kind` column is mandatory in `assets` (ENUM `'photo'|'document'`); derive via `deriveKind(localname)` from `schemas/rows.js` (already in Part 03's `schemas.js`).
- Create or modify: `server/repositories/labels.js` — `insertLabels(conn, assetid, labels)` — takes a list of `{Name, Confidence}` and inserts via `INSERT INTO labels(assetid, label, confidence) VALUES ?`.

**Checklist:**

- [ ] Failing tests for each function.
- [ ] Implement; tests green.

### Task 3.3: Service `uploadImage(userid, localFilename, base64Data)`

**Files:**

- Modify: `server/services/photoapp.js`
- Modify: `server/tests/unit/photoapp_service.test.js`

**Behavior:**

1. `pool.getConnection()` → `conn`. Begin transaction.
2. `users.findUserById(conn, userid)` — wrapped in `pRetry`. If null → throw `BadRequestError('no such userid')`.
3. Build `bucketkey = ${user.username}/${uuid.v4()}-${localFilename}` (Part 02 + Part 03 convention; preserves the username folder structure).
4. Decode `Buffer.from(base64Data, 'base64')` → `imageBytes`.
5. Through `getBucketBreaker()`: `PutObjectCommand({Bucket, Key: bucketkey, Body: imageBytes})`.
6. `kind = deriveKind(localFilename)` (from `schemas/rows.js`).
7. `assets.insertAsset(conn, {userid, localname: localFilename, bucketkey, kind})` — wrapped in `pRetry`. Capture `result.insertId` as `assetid`.
8. If `kind === 'photo'` — through `getRekognitionBreaker()`: `DetectLabelsCommand({Image: {S3Object: {Bucket, Name: bucketkey}}, MaxLabels: 100, MinConfidence: 80})`. If `kind === 'document'` — skip Rekognition (no labels for documents per Q8).
9. Map labels → `[{Name, Confidence}, ...]`.
10. `labels.insertLabels(conn, assetid, mappedLabels)` — wrapped in `pRetry`. Skip if no labels (document path).
11. `conn.commit()`.
12. Return `{assetid}`.
13. On any throw: `conn.rollback()` (best-effort; ignore rollback errors); rethrow.
14. `finally`: `conn.release()`.

**Failing tests (highlights):**

- Unknown userid → `BadRequestError('no such userid')`.
- Successful flow → returns `{assetid: <insertId>}`; transaction committed.
- S3 upload fails → transaction rolled back; no DB writes; error propagates.
- Rekognition fails → transaction rolled back; no DB writes; S3 object remains (acceptable per spec).
- DB labels insert fails → transaction rolled back; no asset row.

**Checklist:**

- [ ] Tests for each branch.
- [ ] Implement; tests green.

> **Optional Test Step** — suggested file `projects/project02/server/tests/unit/base64_buffer_roundtrip.test.js`
>
> Project 02's transport contract is base64 in JSON; the library is buffer-native; the controller is the adapter. The base64 ↔ buffer transform at the controller boundary is the kind of code where a one-character bug (forgetting `'base64'` argument, padding mishandling) silently corrupts every image without raising an error. A property-style test that exercises the round-trip with random bytes catches it.
>
> - **What to lock down**: for N random buffers (1B, 100B, 1MB, exactly-50MB-1, 49.99MB), `Buffer.from(buf.toString('base64'), 'base64')` returns bytes byte-equal to the source; the upload controller's input transform produces the same buffer the library expects. Use `crypto.randomBytes` for the fixtures; commit a couple of well-known fixtures (`00no-labels.jpg`, etc.) for golden cases.
> - **Why this catches bugs**: silent bit-flips in image encoding. Gradescope will not catch this — its tests post fixed fixtures and check that the *DB row* exists and the *response shape* is correct, not that the bytes round-trip. A user reporting "my image came back corrupted" is the alternative discovery mechanism. Worth 5 lines.
> - **Decision branches**: build now (strongly recommended — the cost is trivial and the failure mode is otherwise invisible), queue (acceptable until Phase 4 download lands so you can test the *full* round-trip; risk is small drift), skip (only if you trust Node's `Buffer` wholesale — you should, but the controller wrapper around it is yours).

### Task 3.4: Controller + route + integration test

**Files:**

- Create: `server/controllers/v1/image.js` — handles POST and GET in one router (mounted at `/v1/image`).
- Create: `server/routes/v1/image.js`
- Create: `server/tests/integration/v1_image_post.test.js`

**Controller (POST):**

```js
exports.postImage = async (req, res, next) => {
  res.locals.errorShape = { assetid: -1 };
  try {
    const { userid } = req.validated.params;
    const { local_filename, data } = req.validated.body;
    const result = await photoapp.uploadImage(userid, local_filename, data);
    res.json(successResponse({ assetid: result.assetid }));
  } catch (err) { next(err); }
};
```

**Route:**

```js
router.post('/:userid', validate({ params: imagePostParams, body: imagePostBody }), controller.postImage);
```

**Failing tests:**

- Valid upload → 200, `{message: 'success', assetid: <int>}`. The service is mocked; assert it was called with `(80001, 'photo.jpg', '<base64 string>')`.
- `BadRequestError('no such userid')` → 400, `{message: 'no such userid', assetid: -1}`.
- Body missing `data` → 400, validation envelope.
- Service throws unexpectedly → 500, `{message: <sanitised>, assetid: -1}`.

**Checklist:**

- [ ] Failing tests.
- [ ] Implement controller + route + legacy shim `api_post_image.js`.
- [ ] OpenAPI update.
- [ ] Tests green.

**Check your work:**

- Smoke: from the client image, run `python -c "from photoapp import post_image; print(post_image(80001, '01degu.jpg'))"` (after workstream 03 lands; until then, manual `curl` with a base64-encoded fixture). Expect a positive `assetid`.
- Confirm S3 object exists in LocalStack; confirm `assets` row + `labels` rows exist in compose MySQL.

---

## Phase 4: `GET /v1/image/:assetid`

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-download-base64-v1.md`
>
> Before implementing `downloadImage`, render a `flowchart LR` of the **base64 download path** so the spec contract delta vs Part 03 is visible at a glance.
>
> - **Story**: "Lookup asset row → S3 GetObject → buffer → base64 → JSON envelope. No streaming, no Content-Type negotiation."
> - **Focus**: highlight the **`Body.transformToString('base64')`** node in **red** — that's the spec-mandated divergence from Part 03 (which streams via `Body.pipe(res)`). Highlight the **memory bound** (50 MB cap, server-side) in **amber** since the whole image lives in heap during the encode.
> - **Shape vocab**: stadium `([...])` = HTTP route; rounded `(...)` = service step; cylinder `[(...)]` = DB lookup; cloud-style subgraph = S3 GET; hexagon `{{...}}` = breaker; trapezoid = base64 transform.
> - **Brevity**: ≤ 4 words / node; edges = verbs (`looks up`, `gets`, `transforms`, `wraps`).
> - **Direction**: `flowchart LR`.

### Task 4.1: Repository

**Files:**

- Modify: `server/repositories/assets.js` — `findAssetById(pool, assetid)` returns `{assetid, userid, localname, bucketkey, kind}` or null.

**Checklist:**

- [ ] Failing test; implement; green.

### Task 4.2: Service `downloadImage(assetid)`

**Files:**

- Modify: `server/services/photoapp.js`

**Behavior:**

1. `findAssetById(pool, assetid)` — `pRetry`. Null → throw `BadRequestError('no such assetid')` (per v1 spec; `/v2` would use `NotFoundError`).
2. Through `getBucketBreaker()`: `GetObjectCommand({Bucket, Key: bucketkey})`.
3. `s3Result.Body.transformToString('base64')` → base64 string.
4. Return `{userid, local_filename: localname, data: base64string}`.

**Checklist:**

- [ ] Failing tests for unknown assetid + success path.
- [ ] Implement; green.

### Task 4.3: Controller + route + integration test

**Files:**

- Modify: `server/controllers/v1/image.js` — add `getImage` handler.
- Modify: `server/routes/v1/image.js` — `router.get('/:assetid', validate({params: imageGetParams}), controller.getImage)`.
- Create: `server/tests/integration/v1_image_get.test.js`.

**Controller error shape:** `res.locals.errorShape = { userid: -1 }`.

**Failing tests:**

- Valid assetid → 200, `{message: 'success', userid: int, local_filename: string, data: '<base64>'}`.
- Unknown assetid → 400, `{message: 'no such assetid', userid: -1}`.

**Checklist:**

- [ ] Failing tests.
- [ ] Implement; green.
- [ ] OpenAPI update; legacy shim.

**Check your work:**

- Smoke: download an image just uploaded in Phase 3; base64-decode the response and confirm bytes match the original fixture.

---

## Phase 5: `GET /v1/image_labels/:assetid`

### Task 5.1: Repository

**Files:**

- Modify: `server/repositories/labels.js` — `listLabelsForAsset(pool, assetid)` returns rows ordered by `label ASC`.

**Checklist:**

- [ ] Failing test; implement; green.

### Task 5.2: Service `getImageLabels(assetid)`

**Files:**

- Modify: `server/services/photoapp.js`

**Behavior:**

1. `findAssetById(pool, assetid)` — null → throw `BadRequestError('no such assetid')`.
2. `listLabelsForAsset(pool, assetid)` — `pRetry`.
3. Map rows through `labelRowToObject({label, confidence})`.

**Checklist:**

- [ ] Failing tests (unknown assetid, valid with labels, valid with no labels).
- [ ] Implement; green.

### Task 5.3: Controller + route + integration test

**Files:**

- Create: `server/controllers/v1/image_labels.js`
- Create: `server/routes/v1/image_labels.js`
- Create: `server/tests/integration/v1_image_labels.test.js`

**Error shape:** `res.locals.errorShape = { data: [] }`.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI; legacy shim `api_get_image_labels.js`.

---

## Phase 6: `GET /v1/images_with_label/:label`

### Task 6.1: Repository

**Files:**

- Modify: `server/repositories/labels.js` — `searchLabels(pool, partial)` runs:

```sql
SELECT assetid, label, confidence
FROM labels
WHERE label LIKE ?
ORDER BY assetid ASC, label ASC
```

with `[%${partial}%]`. Note: MySQL's default `utf8mb4_0900_ai_ci` collation makes `LIKE` case-insensitive, which matches the spec ("case-insensitive search").

**Checklist:**

- [ ] Failing test (partial label match, ordering correct, case-insensitive).
- [ ] Implement; green.

### Task 6.2: Service `searchImagesByLabel(label)`

**Files:**

- Modify: `server/services/photoapp.js`

**Behavior:**

- Trim `label`. If empty → `BadRequestError('label is required')`. (Note: the spec defines this as a URL parameter, not query, so an empty path segment is naturally rejected by Express. The check guards against whitespace-only labels passed via URL encoding.)
- `searchLabels(pool, label)` — `pRetry`.
- Map through `searchRowToObject({assetid, label, confidence})`.

**Checklist:**

- [ ] Failing tests (empty label, valid label, no matches, multiple matches across assets).
- [ ] Implement; green.

### Task 6.3: Controller + route + integration test

**Files:**

- Create: `server/controllers/v1/images_with_label.js`
- Create: `server/routes/v1/images_with_label.js`
- Create: `server/tests/integration/v1_images_with_label.test.js`

**Error shape:** `res.locals.errorShape = { data: [] }`.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI; legacy shim `api_get_images_with_label.js`.
- [ ] Smoke: search for `boat` and confirm `sailboat` matches; ordering `assetid ASC, label ASC`.

---

## Phase 7: `DELETE /v1/images`

> **Optional Mermaid Visualization Step (strongly recommended — destructive operation)** — suggested file `visualizations/Target-State-project02-delete-order-v1.md`
>
> Before implementing `deleteAll`, render a `flowchart TD` of the **delete ordering invariant** so the DB-first / S3-second contract is locked in before any code is written.
>
> - **Story**: "Collect bucketkeys first, DELETE labels, DELETE assets, then S3 deleteobjects. If S3 fails, DB is already consistent (orphan objects are tolerable; orphan rows are not)."
> - **Focus**: highlight the **`SELECT bucketkey` step** (collect-before-delete) in **red** — skipping this is a common bug (you can't read from a row after you've deleted it). Highlight the **AUTO_INCREMENT reset** (`ALTER TABLE assets AUTO_INCREMENT = 1001`) in **amber** because that's the spec's expectation and easy to forget.
> - **Shape vocab**: stadium `([...])` = HTTP entry; cylinder `[(...)]` = MySQL op; cloud-style subgraph = S3 DeleteObjects; diamond `{...}` = best-effort branch; trapezoid = AUTO_INCREMENT reset.
> - **Brevity**: ≤ 4 words / node; edges = verbs (`collects`, `deletes`, `resets`, `best-effort`).
> - **Direction**: `flowchart TD` — the strict ordering reads top → bottom.

### Task 7.1: Repository

**Files:**

- Modify: `server/repositories/assets.js` — `truncateAllAssetsAndLabels(conn)`.

**Behavior:**

- Per the assignment, the multi-statement query is required because `mysql2` `query()` (not `execute()`) is used to run multiple statements at once:

```sql
SET foreign_key_checks = 0;
TRUNCATE TABLE labels;
TRUNCATE TABLE assets;
SET foreign_key_checks = 1;
ALTER TABLE assets AUTO_INCREMENT = 1001;
```

- Pool is configured with `multipleStatements: true` (per `01-foundation.md` Phase 7).

**Checklist:**

- [ ] Failing test using `pool.query` (not `execute`); confirm tables truncated and auto-increment reset.

### Task 7.2: Service `deleteAllImages()`

**Files:**

- Modify: `server/services/photoapp.js`

**Behavior:**

1. `pool.getConnection()` → `conn`. Begin transaction.
2. `listAllAssets(conn)` — collect bucketkeys.
3. `truncateAllAssetsAndLabels(conn)` — `pRetry`.
4. `conn.commit()`.
5. Through `getBucketBreaker()`: `DeleteObjectsCommand({Bucket, Delete: {Objects: bucketkeys.map((Key) => ({Key}))}})` — only if `bucketkeys.length > 0`. Best-effort; failures here log a warning but do not roll back the DB.
6. `conn.release()` in `finally`.
7. Return `{}` (empty object; controller wraps in `successResponse` → `{message: 'success'}`).

**Checklist:**

- [ ] Failing tests: empty DB → no S3 call; non-empty DB → DB truncated *before* S3 delete; DB error rolls back.
- [ ] Failing test: S3 delete error after DB commit logs warning but returns success (the spec accepts this trade-off).
- [ ] Implement; green.

### Task 7.3: Controller + route + integration test

**Files:**

- Create: `server/controllers/v1/delete_images.js`
- Modify: `server/routes/v1/index.js` — `router.delete('/images', controller.deleteImages)` (already wired in Task 1.1).
- Create: `server/tests/integration/v1_delete_images.test.js`

**Controller:**

```js
exports.deleteImages = async (req, res, next) => {
  res.locals.errorShape = {};
  try {
    await photoapp.deleteAllImages();
    res.json(successResponse({}));
  } catch (err) { next(err); }
};
```

**Failing tests:**

- 200 envelope `{message: 'success'}` (no `data` key).
- 500 envelope `{message: <err>}` on service failure.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI; legacy shim `api_delete_images.js`.

---

## Phase 8: Contract + Happy-Path Sweep

### Task 8.1: Unskip every contract test

**Files:**

- Modify: `server/tests/contract/openapi_conformance.test.js`

**Checklist:**

- [ ] Every spec route is now exercised by the conformance suite.
- [ ] All conformance tests green.

### Task 8.2: Happy-path E2E

**Files:**

- Modify: `server/tests/happy_path/upload_lifecycle.test.js`

**Flow:**

1. `GET /v1/ping` → success, M ≥ 0, N ≥ seeded user count.
2. `GET /v1/users` → success, includes seeded users.
3. `POST /v1/image/:userid` with the `01degu.jpg` fixture → success, captures `assetid`.
4. `GET /v1/images` → contains the new asset.
5. `GET /v1/images?userid=:userid` → contains the new asset.
6. `GET /v1/image/:assetid` → success, base64 round-trips to identical bytes.
7. `GET /v1/image_labels/:assetid` → success, non-empty label list (Rekognition mock returns canned labels for the fixture).
8. `GET /v1/images_with_label/:label` (using one of the labels) → contains the asset.
9. `DELETE /v1/images` → success.
10. `GET /v1/images` → empty.

**Checklist:**

- [ ] All steps unskipped; happy-path test passes against `make up`.
- [ ] Smoke harness `tools/smoke.sh` covers every route.

---

## Phase 9: Gradescope Submission — Web Service

### Task 9.1: Pre-flight checks

**Checklist:**

- [ ] `make lint` clean.
- [ ] `make test` clean (excluding live).
- [ ] `make submit-server` produces a tarball; the tarball's file list matches `tools/submission-allowlist.txt`.
- [ ] No `*-config.ini` (non-example) files in the tarball.
- [ ] `npm install --omit=dev` against the tarball succeeds (Gradescope autograder installs prod deps).

> **Optional Utility Step** — suggested artifact `tools/gradescope-preview` (Bash + Node) or `make gradescope-preview`
>
> The "submit, see what fails, augment internal tests, fix, resubmit" loop is the highest-friction part of this workstream. A preview tool that runs the contract suite + happy-path against the *exact same tarball* the autograder will see — locally, in <30 seconds — closes the loop from "wait for Gradescope" to "wait for `npm test`".
>
> - **What it does**: (1) builds the submission tarball via `tools/package-submission.sh`, (2) extracts it to a tmp dir, (3) `npm ci --omit=dev` inside (mirrors Gradescope), (4) starts the server on a random port, (5) runs `tests/contract/` + `tests/happy_path/` against it, (6) prints a "you'd score N/60" estimate based on which contract assertions passed, (7) tears down the tmp dir.
> - **Why now**: Phase 9 is *the* iteration loop where this matters. Building it before submission turns the loop from "submit, wait, debug" into "submit, expect green". Building it after is a regret.
> - **Decision branches**: build now (strongly recommended — the wall-clock time saved on iterations 2-N exceeds the build cost on iteration 1; also reusable for `04-engineering-surface.md` `/v2` validation), queue (acceptable if you anticipate hitting 60/60 on the first try and don't want to over-invest), skip (you submit, you wait, you regret).

> **Optional Test Step** — suggested file `projects/project02/server/tests/contract/submission_self_contained.test.js`
>
> The submission tarball must `npm ci` cleanly with `--omit=dev` and not need anything from the workspace (Gradescope can't resolve `@mbai460/photoapp-server` from npm). Phase −1's `tools/package-submission.sh` inlines the library; this test verifies the inlining survives a fresh `npm ci`.
>
> - **What to lock down**: extract the latest tarball, `npm ci --omit=dev`, `node -e "const app = require('./app'); app.listen(0, () => process.exit(0))"`. Asserts the server boots from the tarball alone.
> - **Why this catches bugs**: a future "let me move this dep to dev" PR silently breaks Gradescope. This test catches it before submission.
> - **Decision branches**: build now (recommended — pairs with the gradescope-preview tool above), queue, skip (you'll discover the bug at submit time).

### Task 9.2: First submission

**Files:**

- Manual run: from inside the **server** docker image, execute:

```bash
/gradescope/gs submit 1288073 8052758 *.js *.ini
```

**Checklist:**

- [ ] Submitted.
- [ ] Reviewed Gradescope dashboard; record score in `MetaFiles/refactor-log.md`.
- [ ] If < 60/60: identify failing test cases, augment the internal test suite to reproduce, fix, resubmit.
- [ ] Iterate until 60/60.

### Task 9.3: Lock the wire contract

**Checklist:**

- [ ] After 60/60 lands, tag the commit `gradescope-server-60-60`.
- [ ] Update `MetaFiles/refactor-log.md` with the date, commit SHA, and a snapshot of the Gradescope output.
- [ ] Open `03-client-api.md` for the next workstream.

---

## Acceptance Checklist

Before marking this workstream complete:

- [ ] All eight v1 routes implemented (`/`, `/ping`, `/users`, `/images`, `/image/:userid`, `/image/:assetid`, `/image_labels/:assetid`, `/images_with_label/:label`, `/images` DELETE).
- [ ] Layered architecture in place: routes → controllers → services → repositories.
- [ ] Legacy `api_*.js` shims re-export controllers.
- [ ] Every route's request inputs validated via `zod`.
- [ ] Every MySQL call wrapped in `pRetry({retries: 2})`.
- [ ] Every AWS call routed through the appropriate breaker.
- [ ] Transactions used in `POST /v1/image/:userid` and `DELETE /v1/images`.
- [ ] Pool used everywhere; no `mysql2.createConnection` inside services.
- [ ] OpenAPI 3.1 documents every route with full schemas.
- [ ] All six test layers (unit / integration / contract / smoke / happy-path / live skeleton) green; live tests still gated.
- [ ] Gradescope web service: 60/60.
- [ ] No regression in foundation acceptance checklist.

## Suggested Commit Points

- After Phase 1: `feat(server): port /ping + /users to layered architecture`.
- After Phase 2: `feat(server): GET /v1/images with optional userid filter`.
- After Phase 3: `feat(server): POST /v1/image/:userid with rekognition + transaction`.
- After Phase 4: `feat(server): GET /v1/image/:assetid base64 download`.
- After Phase 5: `feat(server): GET /v1/image_labels/:assetid`.
- After Phase 6: `feat(server): GET /v1/images_with_label/:label search`.
- After Phase 7: `feat(server): DELETE /v1/images with db-first ordering`.
- After Phase 8: `test(server): contract + happy-path coverage for every v1 route`.
- After Phase 9: `chore(server): gradescope web service 60/60`.

## Risks And Mitigations

- **Risk:** `mysql2` pool with `multipleStatements: true` is exploited via SQL injection.
  - **Mitigation:** every other query uses parameterized `pool.execute(?, [...])`; the only call site that touches `pool.query` is `truncateAllAssetsAndLabels`, which has no user input.
- **Risk:** Rekognition labels for the assignment fixtures are unstable across runs.
  - **Mitigation:** mock Rekognition in unit + integration; only the live-test layer hits the real service. Happy-path uses a deterministic mock via `aws-sdk-client-mock`.
- **Risk:** Spec field name mismatches (e.g., row converter forgets to map `username` → `username` for `/users` or `localname` for `/images`) leak into client tests. (Note: the actual DB column is `localname` — there is no `assetname` column; reuse Part 03's `imageRowToObject` which already gets this right.)
  - **Mitigation:** SQL aliases handle the rename in the repository layer; row converters in `schemas/rows.js` enforce the response shape; contract tests catch any drift.
- **Risk:** Transaction in `uploadImage` leaks the connection on a `pRetry` exhaustion.
  - **Mitigation:** the `try/finally` block always calls `conn.release()`; tests assert release on every branch.
- **Risk:** Base64 transit leaks memory at the upload route under load.
  - **Mitigation:** the spec contract holds, but a `pino` log records `Content-Length` per upload so abuse is observable. Engineering `/v2` resolves this entirely (workstream 04).
- **Risk:** The Gradescope autograder uses field names not documented in the PDF.
  - **Mitigation:** every response shape comes from the PDF; the contract test suite locks them. Any field-name surprise during submission triggers an immediate revisit + spec footnote in `MetaFiles/refactor-log.md` rather than a silent fix.
- **Risk:** Submission tarball includes the layered files (`routes/`, `services/`, `repositories/`) and confuses the autograder.
  - **Mitigation:** allowlist is restrictive; tarball contains only `*.js + *.ini` at the `server/` root plus the `api_*.js` shims that delegate to the layered code. The layered files load via `require('./controllers/v1/...')` which Node resolves transparently inside the tarball.

## Footnote: Spec Compatibility & Cross-Project Reuse

Per `00-overview-and-conventions.md`, the spec routes are the wire contract. This workstream implements them in their exact verb, path, status code, and JSON envelope shape. Any engineering improvement that would change those (better status codes, better error shapes, presigned URLs) is deferred to `04-engineering-surface.md` and lives under `/v2`.

**Service-layer reuse via the library:** This workstream's success depends on Phase −1 (`00-shared-library-extraction.md`) having extracted the Part 03 service core into `@mbai460/photoapp-server`. If a defect is discovered in `services.photoapp` while implementing a Project 02 route — for example, a wrong join in `searchImages` — fix it **once, in the library**, with a CL9 bounded-reconciliation commit, and re-run both consumers' test suites (`cd projects/project01/Part03 && npm test` and `cd projects/project02/server && npm test`) to confirm zero regression in Part 03 plus the expected fix in Project 02. The "one cohesive project" principle from `00-overview-and-conventions.md` is now mechanically enforced: there is only one source for service-layer code, so a fix is structurally a single edit.

If the Gradescope autograder ever reveals that the spec's documented contract differs from the autograder's actual expectation, the discrepancy must be:

1. Recorded in `MetaFiles/refactor-log.md` with a quote from the autograder feedback and a quote from the PDF.
2. Resolved in the `routes/v1/*.js` adapter layer (controllers re-shape the response if needed) — never by changing the library's `services.photoapp` from this workstream. If the controller cannot adapt without reaching into service internals, that is a CL9 signal and triggers a bounded library change.
3. Confirmed via re-submission to Gradescope before marking the change complete.

This isolates the autograder's quirks from the rest of the engineering surface.
