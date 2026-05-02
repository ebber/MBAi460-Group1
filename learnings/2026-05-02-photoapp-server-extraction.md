# 2026-05-02 — `@mbai460/photoapp-server` extraction reconciliation log

**Status:** Phase 0.0–0.3 complete; Phase 0.4 (workspace-aware Dockerfile + Gradescope packaging) next.
**Branch:** `feat/lib-extraction`.
**Canary:** Part 03 (`projects/project01/Part03`) consumes the library; `npm test` green at every commit.
**Live AWS regression:** **PENDING ERIK** — see § "Live regression status" below.

This log is the durable record required by Approach
`MBAi460-Group1/projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md` § Phase 3.2.
It documents every behavioural surface that moved from `projects/project01/Part03/server/`
into `lib/photoapp-server/`, and — for each — what was preserved verbatim,
what changed (and why), and which test locks the post-extraction behaviour.

---

## Scope of the reconciliation

CL9 ("bounded reconciliation") applies to a single architectural change:
**SQL moves out of the service layer and into a new repositories layer.**
Everything else in Phase 0 is a *mechanically pure* extraction — files
moved on disk; their content is identical or differs only in `require()`
paths.

| Surface | Pre-extraction location | Post-extraction location | Reconciliation scope |
|---|---|---|---|
| AWS clients (S3, Rekognition, RDS conn) | `Part03/server/services/aws.js` | `lib/photoapp-server/src/services/aws.js` | Pure move |
| Service orchestration (use-cases) | `Part03/server/services/photoapp.js` | `lib/photoapp-server/src/services/photoapp.js` | SQL extracted into repos (CL9); orchestration logic unchanged |
| SQL statements | inline in `services/photoapp.js` | `lib/photoapp-server/src/repositories/{users,assets,labels}.js` | **CL9 reconciliation** — SQL byte-identical, callers updated |
| Error middleware | `Part03/server/middleware/error.js` | `lib/photoapp-server/src/middleware/error.js` | Pure move + factory wrap (CL3) — defaults reproduce Part 03 behaviour |
| Upload middleware | `Part03/server/middleware/upload.js` | `lib/photoapp-server/src/middleware/upload.js` | Pure move + factory wrap (CL3) |
| Schemas (response envelopes) | `Part03/server/schemas.js` | `lib/photoapp-server/src/schemas/envelopes.js` | Pure move |
| Schemas (DB row mappers) | inline in `services/photoapp.js` | `lib/photoapp-server/src/schemas/rows.js` | Pure move into named module |
| Config loader | `Part03/server/config.js` | `lib/photoapp-server/src/config.js` | Pure move |
| Routing (`app.js`, `routes/`) | `Part03/server/{app,routes}.js` | **stays in Part 03** | Per CL2 — routers are consumer-owned |

The entire repositories layer is the only thing that changed in shape.
Everything else changed in `require()` paths only, with the deliberate
exception of middleware which gained factory wrappers per CL3.

---

## Behavioural diff log (per service-layer use-case)

For each method on `services.photoapp.*`, the table records: what SQL it
issued pre-extraction (in Part 03), what SQL it issues now (via the
repositories), and which test asserts the SQL string + params are
byte-identical.

### `getPing()`

| Pre-extraction (Part 03 inline) | Post-extraction (lib repo) | Locked by |
|---|---|---|
| `SELECT count(userid) AS num_users FROM users` | `usersRepo.countAll(conn)` issues same SQL | `tests/repositories/users.test.js` `countAll` describe + `tests/repositories/sql-characterization.test.js` |

**Preserved:** lowercase `count()`; aliasing as `num_users`; access pattern `rows[0].num_users`.

### `listUsers()`

| Pre-extraction | Post-extraction | Locked by |
|---|---|---|
| `SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC` | `usersRepo.findAll(conn)` | `users.test.js` `findAll` + characterization |

**Preserved:** column order (`userid, username, givenname, familyname`); explicit `ORDER BY userid ASC`.

### `listImages(userid?)`

| Branch | Pre-extraction | Post-extraction | Locked by |
|---|---|---|---|
| no userid | `dbConn.execute(sql, params=[])` where sql = `SELECT assetid, userid, localname, bucketkey, kind FROM assets ORDER BY assetid ASC` | `assetsRepo.findAll(conn)` — passes `[]` as second arg explicitly | `assets.test.js` `findAll` + characterization |
| with userid | same SQL + `WHERE userid = ?`, params=[userid] | `assetsRepo.findByUserId(conn, userid)` | `assets.test.js` `findByUserId` + characterization |

**Preserved (subtle):** `findAll` passes `params=[]` as the second arg even though there are no bind values. Part 03's pre-extraction code branched on `userid !== undefined` and then called `dbConn.execute(sql, params)` against a `params` array that was `[]` in the no-userid branch. Stripping that arg ("the array's empty, why pass it?") would change the call shape from `execute(sql, [])` to `execute(sql)` — the seeded test fixture wouldn't notice, but the characterization test catches it.

### `getImageLabels(assetid)`

| Step | Pre-extraction | Post-extraction | Locked by |
|---|---|---|---|
| validation | `SELECT assetid FROM assets WHERE assetid = ?` | `assetsRepo.existsById(conn, assetid)` | `assets.test.js` `existsById` + characterization |
| fetch | `SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC` | `labelsRepo.findByAssetId(conn, assetid)` | `labels.test.js` `findByAssetId` + characterization |

**Preserved (subtle):** the validation query is its own SELECT — it does **not** reuse the `findById` query (which selects `userid, localname, bucketkey` too). Part 03 had two distinct SELECTs against `assets` keyed on `assetid`; the lib preserves both as separate functions (`existsById` vs `findById`) rather than collapsing them. A future "DRY this up" refactor would change the row shape returned to `getImageLabels`'s validation step and is exactly the kind of change CL9 forbids without a re-reconciliation pass.

**Error semantics preserved:** `if (!validation) throw new Error('no such assetid')` — service layer (not repo) throws. Repo returns `null`.

### `searchImages(label)`

| Pre-extraction | Post-extraction | Locked by |
|---|---|---|
| `SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC` with params=[`%${label}%`] | `labelsRepo.findByLabelLike(conn, label)` | `labels.test.js` `findByLabelLike` + characterization |

**Preserved (subtle):** the `%` wrapping happens in the **repo function**, not in the service. Part 03's caller passed the raw label string and the inline SQL did the wrapping. The repo replicates that — caller passes `'dog'`, repo binds `'%dog%'`. Two-arg `ORDER BY` (`assetid ASC, label ASC`) preserved.

**Validation preserved:** `if (!label || !label.trim()) throw new Error('label is required')` — service layer enforces, repo trusts caller.

### `uploadImage(userid, multerFile)`

| Step | Pre-extraction | Post-extraction | Locked by |
|---|---|---|---|
| user validation | `SELECT userid, username FROM users WHERE userid = ?` | `usersRepo.findById(conn, userid)` | `users.test.js` `findById` + characterization |
| asset insert | `INSERT INTO assets(userid, localname, bucketkey, kind) VALUES (?, ?, ?, ?)` | `assetsRepo.insert(conn, {userid, localname, bucketkey, kind})` | `assets.test.js` `insert` + characterization |
| label insert (loop) | `INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))` | `labelsRepo.insertOne(conn, assetid, name, confidence)` | `labels.test.js` `insertOne` + characterization |

**Preserved (subtle):**

1. `users.findById` returns the **upload-validation projection** (`userid, username`) — not the full user shape. Part 03 had two distinct SELECTs against `users` (this one for upload validation, and `listUsers`'s 4-column projection). Both preserved as separate code paths.
2. `INSERT IGNORE` (not `INSERT`) — duplicate `(assetid, label)` rows from Rekognition don't blow up the request. Part 03 relied on this. A naïve port to plain `INSERT` would crash the upload path on duplicates.
3. `ROUND(?)` is in the **VALUES clause**, not in JS. Part 03's SQL rounds the confidence in the database. Doing the round in JS (`Math.round(confidence)`) before binding would produce the same numeric result for normal Rekognition confidences but is not byte-identical SQL — characterization test catches it.
4. The label insert is in a per-label loop (sequential) — preserved. Bulk-INSERT optimization is out of scope for Phase 0.

**Error semantics preserved:** `if (!user) throw new Error('no such userid')` — service-layer throw. `kind === 'photo'` gate around Rekognition call preserved.

**S3 / Rekognition call shapes preserved:** `PutObjectCommand`, `DetectLabelsCommand` with `MaxLabels: 100, MinConfidence: 80` — unchanged. AWS clients still come from `services/aws.js` (lib-internal singleton).

### `downloadImage(assetid)`

| Step | Pre-extraction | Post-extraction | Locked by |
|---|---|---|---|
| asset fetch | `SELECT assetid, userid, localname, bucketkey FROM assets WHERE assetid = ?` | `assetsRepo.findById(conn, assetid)` | `assets.test.js` `findById` + characterization |

**Preserved (subtle):** this projection does **not** include `kind` (compare to `assets.findAll`/`findByUserId`, which do). Part 03's downloadImage SELECT read 4 columns, not 5. Adding `kind` to this projection "for symmetry" would be a CL9 violation.

**ContentType derivation preserved:** `s3Result.ContentType ?? contentTypeFromExt(localname)` — falls back to extension-based MIME mapping if S3 didn't set one. The mapping table (`CONTENT_TYPE_BY_EXT`) is unchanged.

### `deleteAll()`

| Step | Pre-extraction | Post-extraction | Locked by |
|---|---|---|---|
| collect bucketkeys | `SELECT bucketkey FROM assets` | `assetsRepo.selectAllBucketkeys(conn)` | `assets.test.js` `selectAllBucketkeys` + characterization |
| delete labels | `DELETE FROM labels` | `labelsRepo.deleteAll(conn)` | `labels.test.js` `deleteAll` + characterization |
| delete assets | `DELETE FROM assets` | `assetsRepo.deleteAll(conn)` | `assets.test.js` `deleteAll` + characterization |
| reset auto-increment | `ALTER TABLE assets AUTO_INCREMENT = 1001` | `assetsRepo.resetAutoIncrement(conn)` | `assets.test.js` `resetAutoIncrement` + characterization |

**Preserved (subtle):**

1. **Order of operations**: labels DELETE *before* assets DELETE (FK constraint `labels.assetid → assets.assetid`). Reordering would crash on the seeded DB.
2. **AUTO_INCREMENT seed value `1001`**: this matches `create-photoapp.sql`'s seed. Resetting to `1` would mean the next upload's `assetid` is `1`, which would fail Gradescope's "next-asset-after-reset has id 1001" expectation. Locked as a literal in the SQL string by the characterization test.
3. **S3 deletion happens after DB**: bucketkey collection and DB cleanup happen inside the `try/finally` that closes `dbConn`; S3 `DeleteObjectsCommand` happens after. Order preserved.

---

## Schemas / row mappers

Pre-extraction, `services/photoapp.js` had inline functions to convert
SQL rows → response objects. These moved verbatim to
`lib/photoapp-server/src/schemas/rows.js`. All four row mappers are
**pass-through today** (mysql2/promise returns rows as objects keyed by
column name); they exist as a stable seam so route handlers don't bind
directly to the driver's row shape and so a future schema rename lands
in one place.

- `userRowToObject(row)` → `{userid, username, givenname, familyname}`
- `imageRowToObject(row)` → `{assetid, userid, localname, bucketkey, kind}`
- `labelRowToObject(row)` → `{label, confidence}`
- `searchRowToObject(row)` → `{assetid, label, confidence}`
- `deriveKind(filename)` — extension-based `photo` / `document` classifier; `PHOTO_EXTENSIONS = {.jpg, .jpeg, .png, .heic, .heif}` exported as a constant

**Preserved verbatim**, asserted by `tests/schemas/rows.test.js` and locked as exports by `tests/exports-shape.test.js`.

---

## Middleware (CL3 factory wrap)

Both error and upload middleware gained a factory layer when extracted.
This is the **one** intentional shape change (CL3 — configurability via
construction, not env). Critical correctness property: **calling each
factory with no args reproduces Part 03's pre-extraction behaviour
byte-for-byte.**

### `createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`

- Defaults: `statusCodeMap` reproduces Part 03's mapping (`'no such userid'` → 404, `'no such assetid'` → 404, `'label is required'` → 400, fallback 500).
- `errorShapeFor` defaults to `(message) => ({ message })` — same JSON shape Part 03 returned.
- `logger` defaults to `console`.

**Locked by:** `tests/middleware/error.test.js` asserts default factory output for each known error message. `tests/exports-shape.test.js` asserts `createErrorMiddleware` is a factory function whose return value is itself a function (Express middleware signature).

### `createUploadMiddleware({ destDir, sizeLimit })`

- Defaults: `destDir = 'tmp/'` (matches Part 03), `sizeLimit = 10 * 1024 * 1024` (10 MB — matches Part 03's literal).
- Returns a `multer` instance with `.single()` available.

**Locked by:** `tests/middleware/upload.test.js` + `tests/exports-shape.test.js`.

`cleanupTempFile` exported as a plain function (no factory) — same shape as before.

---

## Test coverage matrix

| Test file | Asserts | Status |
|---|---|---|
| `tests/services/photoapp.test.js` | use-case orchestration, error semantics, AWS call shapes | green (mocks repos + AWS) |
| `tests/repositories/users.test.js` | per-function SQL + params + row mapping | green |
| `tests/repositories/assets.test.js` | per-function SQL + params + row mapping | green |
| `tests/repositories/labels.test.js` | per-function SQL + params + LIKE wrapping | green |
| `tests/repositories/sql-characterization.test.js` | literal SQL string lockdown for every repo function | green (15 assertions) |
| `tests/middleware/error.test.js` | factory defaults reproduce Part 03 behaviour | green |
| `tests/middleware/upload.test.js` | factory defaults; multer instance shape | green |
| `tests/schemas/rows.test.js` | row mapper outputs | green |
| `tests/schemas/envelopes.test.js` | success/error envelope shape | green |
| `tests/exports-shape.test.js` | top-level public API surface | green |
| Part 03 `tests/photoapp_routes.test.js` (canary) | Part 03 wire contract via mocked services | green |
| Part 03 `tests/integration_routes_error.test.js` (canary) | Part 03 error envelope shape | green |

**Lib totals:** 99 tests / 11 suites, all green.
**Part 03 canary:** green at every commit on this branch.

---

## Live regression status — **pending Erik run**

The Approach explicitly requires a live AWS run as the strongest signal
that the extraction is mechanically pure:

> Part 03's `live_photoapp_integration.test.js` (`PHOTOAPP_RUN_LIVE_TESTS=1`) — passes against real AWS. **Manual gate; do not skip.**

**I have not run this** — per the run directive ("don't change AWS"),
I'm leaving live AWS calls to you. To run when convenient:

```sh
cd projects/project01/Part03
PHOTOAPP_RUN_LIVE_TESTS=1 npm test -- live_photoapp_integration.test.js
```

Expected: green, with the same upload/download/labels assertions as the
last green run pre-extraction. If anything fails, the discrepancy is in
**this branch** — file a roll-back on the offending phase commit, not a
forward-fix, until the live regression is back to green. Update the
"Status" line at the top of this log with the live-test outcome.

---

## Open items / queued

- **Phase 0.4** (workspace-aware Dockerfile + Gradescope packaging script) — depends on the `npm pack`-style packaging strategy decision. Approach § Phase 4.2.
- **Phase 0.5** (CONTRIBUTING.md, DOC-FRESHNESS.md, lib README, MetaFiles/TODO.md schema, PR template).
- **Phase 0.6** (acceptance gates + tag `library-1.0.0-extraction-complete`).
- **`utils/run-extraction-canary`** (Optional Utility from § 3.2) — deferred. The canary has been hit once per phase commit (3 times so far), well under the 3+ iteration threshold the optional suggested. Build if a Phase 1 change re-triggers iteration.

---

## References

- Approach: `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`
- Plan tracker: `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/Plan.md`
- Orientation map: `MBAi460-Group1/projects/project02/client/MetaFiles/OrientationMap.md`
- Target-state visualization: `MBAi460-Group1/visualizations/Target-State-mbai460-photoapp-server-lib-extraction-v1.md`
- Phase 0.3 commits:
  - `1fe272c` — refactor(lib): extract SQL into repositories layer
  - `2c21634` — test(lib): add SQL characterization test
