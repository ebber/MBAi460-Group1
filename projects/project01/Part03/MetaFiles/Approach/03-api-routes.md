# API Routes Workstream Approach

> **For agentic workers:** Execute this as a checklist. Use TDD for every route, service function, middleware, and conversion helper. Write the failing test first, watch it fail, implement the minimal code, then verify it passes. Do not wire real AWS or RDS calls before the route/service contract is locked in with mocked clients.

## Goal

Implement the Express `/api/*` backend for Project 01 Part 03 by smoothing the existing `server/api_*.js` baseline into a clean `routes/` + `services/` + `middleware/` structure. The backend should expose browser-friendly JSON and file endpoints, orchestrate AWS S3, AWS Rekognition, and MySQL through Node-native SDKs (`@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`, `mysql2/promise`), and match the response envelope contract in `00-coordination-and-contracts.md`. **Part 2 `photoapp.py` is not imported at runtime** — it is preserved as a behavioral reference only.

## Scope

This workstream owns:

- `/api/*` Express routes.
- Request validation and response shaping.
- Tuple/row-to-object converters and envelope helpers (`server/schemas.js`).
- PhotoApp service module (`server/services/photoapp.js`) — orchestrates AWS SDK + `mysql2` use cases.
- AWS clients factory (`server/services/aws.js`) — evolved from existing `server/helper.js`.
- Multipart upload middleware (`server/middleware/upload.js`, multer-based).
- Centralized error/status-code mapping middleware (`server/middleware/error.js`).
- Server unit, integration, and smoke tests for API behavior (`server/tests/`).

This workstream does **not** own:

- React component implementation.
- Claude Design conversion.
- Static web app hosting mechanics (Express static for `frontend/dist`).
- Express app skeleton beyond mounting routes.
- Health/root endpoint or `listen()` entrypoint.
- Original Part 2 `photoapp.py` implementation (kept as reference only).

## Dependencies

Read first:

- `00-coordination-and-contracts.md` — source of truth for the API contract.
- `02-server-foundation.md` — Express skeleton, static serving, mount points.
- `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`
- `projects/project01/Part02/MetaFiles/Implementation-Notes.md` (Part 2 behavioral reference).
- `projects/project01/client/photoapp.py` (Part 2 behavioral reference; **not** imported).
- The existing baseline being smoothed:
  - `server/app.js`
  - `server/helper.js`
  - `server/config.js`
  - `server/api_get_ping.js`
  - `server/api_get_users.js`
  - `server/api_get_images.js`
  - `server/api_post_image.js`
  - `server/api_get_image.js`
  - `server/api_get_image_labels.js`
  - `server/api_get_images_search.js`
  - `server/api_delete_images.js`

Expected server foundation (from workstream 02):

- `server/app.js` exists, exports an Express `app` instance, and mounts a router under `/api`.
- `server/server.js` exists as the `listen()` entrypoint.
- `server/config.js` exposes `photoapp_config_filename`, `photoapp_s3_profile`, `web_service_port`.
- Jest + supertest works against the exported `app`.
- `GET /` (or static index) is wired by Server Foundation, not here.

## Target Files

Create or modify:

```text
projects/project01/Part03/
  server/
    routes/
      photoapp_routes.js          # /api/* router; thin handlers
    services/
      photoapp.js                 # PhotoApp use cases (S3 + Rekognition + mysql2)
      aws.js                      # AWS + DB client factory (formerly helper.js)
    middleware/
      upload.js                   # multer multipart upload config
      error.js                    # centralized JSON error mapping
    schemas.js                    # row-to-object converters; envelope helpers
    tests/
      schemas.test.js
      aws.test.js
      photoapp_service.test.js
      photoapp_routes.test.js
      upload.test.js
      error.test.js
      live_photoapp_integration.test.js
```

Possibly modify (coordination only — Server Foundation owns these):

```text
projects/project01/Part03/server/app.js     # mount routes/photoapp_routes.js under /api
projects/project01/Part03/package.json      # add multer, jest, supertest if missing
projects/project01/Part03/README.md         # route-specific run/test commands
```

The legacy `server/api_*.js` files are **kept as a reference** through this workstream. Their final disposition (delete, archive, or keep) is **deferred to the Part 03 TODO queue** (`MetaFiles/TODO.md`) and decided at end-of-Part-03. Do **not** delete them as part of this workstream.

## API Contract Summary

See `00-coordination-and-contracts.md` for the full contract. Routes to implement under the `/api` mount:

- `GET /api/ping`
- `GET /api/users`
- `GET /api/images`
- `GET /api/images?userid={userid}`
- `POST /api/images` (multipart: `userid`, `file`)
- `GET /api/images/:assetid/file` (native file response)
- `GET /api/images/:assetid/labels`
- `GET /api/search?label={label}`
- `DELETE /api/images`

JSON success envelope:

```json
{
  "message": "success",
  "data": {}
}
```

JSON error envelope:

```json
{
  "message": "error",
  "error": "human-readable failure message"
}
```

### URL Refactoring Map (existing baseline → new structure)

The existing `server/app.js` baseline mounts handlers without an `/api/*` prefix. Every endpoint moves under `/api`. Several response shapes also change.

| Existing baseline                       | New endpoint                           | Notes                                                            |
| --------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `GET /` (status/uptime)                 | (out of scope; Server Foundation owns) | Static index belongs to workstream 02.                           |
| `GET /ping`                             | `GET /api/ping`                        | Response shape: `{message, data: {s3_object_count, user_count}}` |
| `GET /users`                            | `GET /api/users`                       | Wrap rows in envelope `{message, data: [...]}`.                  |
| `GET /images` (and `?userid=`)          | `GET /api/images`                      | Same query param; envelope.                                      |
| `POST /image` (base64 JSON)             | `POST /api/images` (multipart)         | base64 → multipart via multer; envelope.                         |
| `GET /image/:assetid` (base64 JSON)     | `GET /api/images/:assetid/file`        | base64 → native streaming file response.                         |
| `GET /image/:assetid/labels`            | `GET /api/images/:assetid/labels`      | Envelope; `404` when assetid missing.                            |
| `GET /images/search?label=`             | `GET /api/search?label=`               | New URL; envelope; `400` on empty/whitespace label.              |
| `DELETE /images`                        | `DELETE /api/images`                   | DB-first delete order; envelope `{deleted: true}`.               |

## Design Decisions

- Route handlers stay thin: parse inputs, call the service module, wrap success/error envelope, hand exceptions to error middleware.
- The PhotoApp service module (`server/services/photoapp.js`) owns every use case (ping, listUsers, listImages, uploadImage, downloadImage, getImageLabels, searchImages, deleteAll).
- The service uses **AWS SDK v3 + `mysql2/promise` directly**. There is no Python adapter, no `Local File Bridge` as a separate concept; multer handles file mechanics on the way in, and S3 streams handle the way out.
- Envelope helpers (`successResponse`, `errorResponse`) live in `server/schemas.js` alongside row converters so every route returns identical shape.
- Multipart uploads use `multer` middleware writing to a temp directory; the service reads the temp file, uploads to S3, then cleans up in `finally` (do not rely on multer auto-cleanup alone).
- File downloads stream the S3 object body directly into the Express response (`response.setHeader('Content-Type', ...); s3Result.Body.pipe(response)`). No temp-file roundtrip.
- A centralized error middleware maps known errors to status codes:
  - `ValueError`-style messages: `"no such userid"` → 400, `"no such assetid"` → 404.
  - Multer/validation errors → 400.
  - Anything unhandled → 500 with a user-safe message; stack stays in the server log.
- Service tests use Jest mocks for `server/services/aws.js` (`jest.mock('../services/aws')`) so unit tests never reach AWS or RDS.
- Route tests use `supertest` against the exported `app` with the service module mocked (`jest.mock('../services/photoapp')`).
- Live AWS tests are **opt-in** via `PHOTOAPP_RUN_LIVE_TESTS=1`. They are skipped by default so `npm test` is safe in CI and on workstation.

---

## Pre-Phase 1: Schema migration for `kind` column (per Q8)

Per `DesignDecisions.md` Q8 (resolved 2026-04-26: asset `kind` is server-derived from filename extension), the `photoapp.assets` table needs a new column. Forward-only migration; existing rows default to `'photo'`.

**Files:**

- New: `projects/project01/migrations/2026-04-26-add-assets-kind.sql`
- Modify: `projects/project01/create-photoapp.sql` (clean rebuilds include the column from the start)
- Modify: `MBAi460-Group1/utils/_validate_db.py` (add a check for the `kind` column)

**SQL:**

```sql
USE photoapp;

ALTER TABLE assets
  ADD COLUMN kind ENUM('photo','document') NOT NULL DEFAULT 'photo'
  AFTER bucketkey;
```

**Steps:**

- [ ] Write migration SQL.
- [ ] Run via `utils/run-sql projects/project01/migrations/2026-04-26-add-assets-kind.sql`.
- [ ] Update `utils/validate-db` to add a check that the `kind` column exists with the expected enum.
- [ ] Update `projects/project01/create-photoapp.sql` so a clean rebuild includes `kind` from the start.

**Note (Part 03 scope):** the enum value `'document'` is reserved for the Future-State Documents + Textract workstream. In Part 03 the multer file filter (Phase 4) rejects non-photo MIME types, so no `'document'` rows will exist yet — the migration is forward-compatible.

**Check your work:**

- Integration: `utils/validate-db` passes.
- Smoke: `SELECT kind FROM assets LIMIT 5;` returns `'photo'` for all existing rows.

---

## Phase 1: Schemas And Envelope Helpers

### Task 1.1: Define response envelope helpers

**Files:**

- Create: `server/schemas.js`
- Create: `server/tests/schemas.test.js`

**Write failing test first:**

```js
// failing test first
const { successResponse, errorResponse } = require('../schemas');

test('successResponse wraps data', () => {
  expect(successResponse({ count: 3 })).toEqual({
    message: 'success',
    data: { count: 3 },
  });
});

test('errorResponse wraps error message as string', () => {
  expect(errorResponse('no such userid')).toEqual({
    message: 'error',
    error: 'no such userid',
  });
});

test('errorResponse coerces Error instances to message string', () => {
  expect(errorResponse(new Error('boom'))).toEqual({
    message: 'error',
    error: 'boom',
  });
});
```

**Implement minimal helpers:**

```js
function successResponse(data) {
  return { message: 'success', data };
}

function errorResponse(err) {
  const text = err && err.message ? err.message : String(err);
  return { message: 'error', error: text };
}

module.exports = { successResponse, errorResponse };
```

**Check your work:**

- Unit: `npx jest server/tests/schemas.test.js` passes.
- Integration: not applicable yet.
- Smoke: not applicable yet.

### Task 1.2: Add row-to-object converters

**Files:**

- Modify: `server/schemas.js`
- Modify: `server/tests/schemas.test.js`

**Write failing tests first:**

```js
// failing test first
const {
  userRowToObject,
  imageRowToObject,
  labelRowToObject,
  searchRowToObject,
} = require('../schemas');

test('userRowToObject normalizes a mysql2 user row', () => {
  expect(
    userRowToObject({
      userid: 80001,
      username: 'p_sarkar',
      givenname: 'Pooja',
      familyname: 'Sarkar',
    })
  ).toEqual({
    userid: 80001,
    username: 'p_sarkar',
    givenname: 'Pooja',
    familyname: 'Sarkar',
  });
});

test('imageRowToObject normalizes a mysql2 asset row including kind (Q8)', () => {
  expect(
    imageRowToObject({
      assetid: 1001,
      userid: 80001,
      localname: '01degu.jpg',
      bucketkey: 'p_sarkar/uuid-01degu.jpg',
      kind: 'photo',
    })
  ).toEqual({
    assetid: 1001,
    userid: 80001,
    localname: '01degu.jpg',
    bucketkey: 'p_sarkar/uuid-01degu.jpg',
    kind: 'photo',
  });
});

test('labelRowToObject normalizes a (label, confidence) row', () => {
  expect(labelRowToObject({ label: 'Animal', confidence: 99 })).toEqual({
    label: 'Animal',
    confidence: 99,
  });
});

test('searchRowToObject normalizes a (assetid, label, confidence) row', () => {
  expect(
    searchRowToObject({ assetid: 1001, label: 'Animal', confidence: 99 })
  ).toEqual({ assetid: 1001, label: 'Animal', confidence: 99 });
});
```

**Implementation notes:**

- `mysql2/promise` returns rows as objects keyed by column. Converters exist so that if the SQL ever changes column case or adds columns, the route surface stays stable.
- Coerce numeric fields with `Number(...)` or `parseInt(...)` if the driver hands back strings (defensive).

**Check your work:**

- Unit: converter tests pass.
- Integration: service tests can now import these helpers.
- Smoke: not applicable yet.

### Task 1.3: Add `deriveKind(filename)` helper (per Q8)

**Files:**

- Modify: `server/schemas.js`
- Modify: `server/tests/schemas.test.js`

**Why:** the `kind` column is server-derived from the file extension at upload (Q8). Centralize the mapping in one place so both the upload service and any future migration tools agree.

**Write failing tests first:**

```js
// failing test first
const { deriveKind } = require('../schemas');

test('deriveKind returns photo for image extensions', () => {
  expect(deriveKind('a.jpg')).toBe('photo');
  expect(deriveKind('b.JPEG')).toBe('photo');
  expect(deriveKind('c.png')).toBe('photo');
  expect(deriveKind('d.heic')).toBe('photo');
});

test('deriveKind returns document for non-image extensions', () => {
  expect(deriveKind('e.pdf')).toBe('document');
  expect(deriveKind('f.docx')).toBe('document');
  expect(deriveKind('g.txt')).toBe('document');
  expect(deriveKind('h.zip')).toBe('document');
});

test('deriveKind defaults to document for unknown / extensionless files', () => {
  // Multer accepts ALL file types in Part 03 (Q9). Anything that isn't a
  // recognized image extension is classified as document; safer default
  // because the asset still gets stored in S3 + DB with kind='document',
  // and the Future-State Textract workstream can pick up these rows for
  // OCR processing later.
  expect(deriveKind('weird.xyz')).toBe('document');
  expect(deriveKind('no-extension')).toBe('document');
});
```

**Implementation:**

```js
const path = require('path');

const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif']);

function deriveKind(filename) {
  const ext = path.extname(filename).toLowerCase();
  return PHOTO_EXTENSIONS.has(ext) ? 'photo' : 'document';
}

module.exports = { deriveKind, /* ... */ };
```

**Check your work:**

- Unit: 3 deriveKind tests pass.
- Integration: imported by Phase 5's `uploadImage`.

---

## Phase 2: AWS Clients Factory

### Task 2.1: Smooth `helper.js` into `server/services/aws.js`

**Files:**

- Create: `server/services/aws.js`
- Create: `server/tests/aws.test.js`

**Purpose:**

Centralize AWS S3, Rekognition, and `mysql2` client construction so routes/services depend on stable factory functions, not on `helper.js` quirks. This is a refactor of the existing `server/helper.js`.

**Required exports:**

- `getDbConn()` → async, returns a `mysql2/promise` connection. Caller must `await dbConn.end()` in `finally`.
- `getBucket()` → returns an `S3Client` configured from `photoapp-config.ini` `[s3].region_name`.
- `getBucketName()` → returns `[s3].bucket_name`.
- `getRekognition()` → returns a `RekognitionClient` (same region/profile).

**Write failing tests first:**

```js
// failing test first
jest.mock('fs');
const fs = require('fs');

const FAKE_INI = `
[s3]
region_name = us-east-2
bucket_name = test-bucket

[rds]
endpoint = test-endpoint
port_number = 3306
user_name = test-user
user_pwd = test-pwd
db_name = photoapp
`;

beforeEach(() => {
  fs.readFileSync.mockReturnValue(FAKE_INI);
});

test('getBucketName reads bucket_name from config', () => {
  const { getBucketName } = require('../services/aws');
  expect(getBucketName()).toBe('test-bucket');
});

test('getBucket returns an S3Client configured for the region', () => {
  const { getBucket } = require('../services/aws');
  const client = getBucket();
  expect(client).toBeDefined();
  // client.config.region is a function in AWS SDK v3
  expect(typeof client.config.region).toBe('function');
});

test('getRekognition returns a RekognitionClient', () => {
  const { getRekognition } = require('../services/aws');
  const client = getRekognition();
  expect(client).toBeDefined();
});
```

**Implementation notes:**

- Read the ini file once per call (matches existing `helper.js` semantics; we can memoize later if it bites perf).
- Use `fromIni({ profile: config.photoapp_s3_profile })` for S3 + Rekognition credentials.
- For `mysql2`, use `mysql2.createConnection({...})` with `multipleStatements: false` (we will not depend on multi-statement queries; the DELETE all path issues two separate `execute()` calls).
- Export named functions (camelCase). The legacy `helper.js` used snake_case; the new factory uses camelCase to match Node convention. Update all callers.

**Check your work:**

- Unit: aws factory tests pass with mocked `fs`.
- Integration: importing `services/aws` does not connect to AWS or RDS by itself.
- Smoke: defer real `getDbConn()` / `getBucket()` calls until live config is confirmed.

### Task 2.2: Tighten the `getDbConn()` async contract

**Files:**

- Modify: `server/services/aws.js`
- Modify: `server/tests/aws.test.js`

**Why this exists:**

In the legacy `server/helper.js`, `get_dbConn()` is marked `async` and returns the result of `mysql2.createConnection({...})` without an explicit `await`. `mysql2/promise.createConnection` returns a `Promise<Connection>`; an `async` function whose return value is itself a Promise will resolve through it, so callers `await get_dbConn()` end up with a `Connection` and the code works in practice. But the contract is implicit — readers have to reason about double-Promise resolution, and any future caller who *forgets* to `await` will get a `Promise<Connection>` and a runtime "TypeError: dbConn.execute is not a function" the first time they try to use it.

The new factory should make the contract explicit so it cannot drift.

**Required behavior:**

- `getDbConn()` is `async` and returns a `Connection` (resolved), not a `Promise<Connection>` (un-resolved).
- The function body uses `return await mysql2.createConnection({...})` (or equivalent `const conn = await ...; return conn;`).
- A unit test asserts the returned value behaves like a connection (has `.execute`, `.end`).

**Write failing test first:**

```js
// failing test first — asserts the return value is awaited (resolved), not a bare Promise
test('getDbConn resolves to a connection-shaped object, not a Promise', async () => {
  const fakeConn = { execute: jest.fn(), end: jest.fn() };
  const mysql2 = require('mysql2/promise');
  jest.spyOn(mysql2, 'createConnection').mockResolvedValue(fakeConn);

  const { getDbConn } = require('../services/aws');
  const conn = await getDbConn();

  // If the implementation returns the unawaited Promise, conn would still be a Promise
  // and these would fail.
  expect(typeof conn.execute).toBe('function');
  expect(typeof conn.end).toBe('function');
});
```

**Implementation:**

```js
async function getDbConn() {
  const photoappConfig = readPhotoAppConfig();
  return await mysql2.createConnection({
    host: photoappConfig.rds.endpoint,
    port: photoappConfig.rds.port_number,
    user: photoappConfig.rds.user_name,
    password: photoappConfig.rds.user_pwd,
    database: photoappConfig.rds.db_name,
    multipleStatements: false,
  });
}
```

**Check your work:**

- Unit: failing test described above passes after the explicit `await` is in place.
- Integration: `await getDbConn()` returns a connection that responds to `.execute(...)` (this is exercised by all downstream service tests).
- Smoke: live `getDbConn()` against real RDS still works (verified in Phase 8 live tests).

---

## Phase 3: PhotoApp Service Module — Read Use Cases

### Task 3.1: `getPing()` — S3 object count + user count

**Files:**

- Create: `server/services/photoapp.js`
- Create: `server/tests/photoapp_service.test.js`

**Behavior (from `00-coordination-and-contracts.md` and existing `api_get_ping.js`):**

- Fan out to S3 `ListObjectsV2` and SQL `SELECT count(userid) AS num_users FROM users`.
- Return `{ s3_object_count: <KeyCount>, user_count: <num_users> }`.
- Always close the DB connection.

**Write failing test first:**

```js
// failing test first
jest.mock('../services/aws');
const aws = require('../services/aws');
const { getPing } = require('../services/photoapp');

test('getPing returns counts from S3 and MySQL', async () => {
  const fakeBucket = { send: jest.fn().mockResolvedValue({ KeyCount: 5 }) };
  const fakeDb = {
    execute: jest.fn().mockResolvedValue([[{ num_users: 3 }]]),
    end: jest.fn().mockResolvedValue(),
  };
  aws.getBucket.mockReturnValue(fakeBucket);
  aws.getBucketName.mockReturnValue('test-bucket');
  aws.getDbConn.mockResolvedValue(fakeDb);

  const result = await getPing();

  expect(result).toEqual({ s3_object_count: 5, user_count: 3 });
  expect(fakeDb.end).toHaveBeenCalled();
});
```

**Check your work:**

- Unit: ping service test passes with mocked AWS and DB.
- Integration: route test in Phase 6 will call this through the router with the service module mocked.
- Smoke: real ping in Phase 8.

### Task 3.2: `listUsers()`

**Behavior:**

- SQL: `SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC`.
- Map rows through `userRowToObject`.
- Always close the DB connection.

**Write failing test first:**

```js
// failing test first
test('listUsers returns user objects ordered by userid', async () => {
  const fakeDb = {
    execute: jest.fn().mockResolvedValue([
      [{ userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' }],
    ]),
    end: jest.fn().mockResolvedValue(),
  };
  aws.getDbConn.mockResolvedValue(fakeDb);

  const result = await listUsers();

  expect(result).toEqual([
    { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
  ]);
  expect(fakeDb.end).toHaveBeenCalled();
});
```

**Check your work:**

- Unit: listUsers test passes.
- Integration: route test wires through.
- Smoke: real listUsers in Phase 8.

### Task 3.3: `listImages(userid?)`

**Behavior:**

- If `userid` is provided: `SELECT assetid, userid, localname, bucketkey FROM assets WHERE userid = ? ORDER BY assetid ASC`.
- Otherwise: same SELECT without WHERE clause.
- Map rows through `imageRowToObject`.

**Write failing tests first:**

- `listImages()` calls `dbConn.execute(sql, [])` and returns image objects.
- `listImages(80001)` calls `dbConn.execute(sql, [80001])` with the parameterized variant.
- DB connection is closed in both paths, including on failure.

**Check your work:**

- Unit: both branches test green.
- Integration: route test passes both query forms.

### Task 3.4: `getImageLabels(assetid)`

**Behavior:**

- Validate the asset exists: `SELECT assetid FROM assets WHERE assetid = ?`. If no rows → throw `new Error('no such assetid')` (caught by error middleware → 404).
- Then: `SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC` (per `00-coordination-and-contracts.md`; if executors prefer the existing `ORDER BY label ASC` ordering, update 00 first).
- Map rows through `labelRowToObject`.

**Write failing tests first:**

- Unknown assetid → service throws `Error('no such assetid')`.
- Known assetid with no labels → service returns `[]`.
- Known assetid with labels → service returns `[{label, confidence}, ...]`.

**Check your work:**

- Unit: three label test cases green.
- Integration: 404 wiring exercised in Phase 6.

### Task 3.5: `searchImages(label)`

**Behavior:**

- Empty/whitespace-only label: route boundary returns 400 (per `00`); the service treats it as a programming error and may throw `Error('label is required')` if called directly. Service-level decision: throw, route-level: validate before calling.
- SQL: `SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC`, with the parameter as `%${label}%` (case-insensitive LIKE preserved from existing baseline).
- Map rows through `searchRowToObject`.

**Write failing tests first:**

- `searchImages('')` throws `Error('label is required')`.
- `searchImages('animal')` returns mapped rows from the mocked DB.

**Check your work:**

- Unit: search service tests pass.
- Integration: route validates input before calling service.

---

## Phase 4: Multipart Upload Middleware

### Task 4.1: Configure multer for multipart `file` field

**Files:**

- Create: `server/middleware/upload.js`
- Create: `server/tests/upload.test.js`

**Configuration target:**

```js
const multer = require('multer');
const path = require('path');
const os = require('os');

const TEMP_DIR = path.join(os.tmpdir(), 'photoapp-uploads');

// Part 03 accepts ALL file types. Photos and documents both flow through this
// middleware; the upload service branches on `kind` (Q8) — photos go through
// Rekognition, documents are stored as-is (OCR via Textract is Future-State,
// per Q9). The 50 MB size limit is the only filter at this layer.
const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

module.exports = { upload, TEMP_DIR };
```

Add a test that the middleware accepts both photos and documents:

```js
test('upload middleware accepts a JPEG (photo)', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) => res.json({ ok: true, mime: req.file.mimetype }));

  const res = await request(app)
    .post('/test-upload')
    .attach('file', Buffer.from('fake'), { filename: 'a.jpg', contentType: 'image/jpeg' });
  expect(res.status).toBe(200);
  expect(res.body.mime).toBe('image/jpeg');
});

test('upload middleware accepts a PDF (document)', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) => res.json({ ok: true, mime: req.file.mimetype }));

  const res = await request(app)
    .post('/test-upload')
    .attach('file', Buffer.from('fake'), { filename: 'b.pdf', contentType: 'application/pdf' });
  expect(res.status).toBe(200);
  expect(res.body.mime).toBe('application/pdf');
});

test('upload middleware rejects files over 50 MB', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) => res.sendStatus(200));
  app.use((err, req, res, next) => res.status(400).json({ error: err.code }));

  const big = Buffer.alloc(51 * 1024 * 1024);
  const res = await request(app)
    .post('/test-upload')
    .attach('file', big, { filename: 'huge.bin', contentType: 'application/octet-stream' });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('LIMIT_FILE_SIZE');
});
```

**Write failing test first (supertest, with a stub route mounted only in this test):**

```js
// failing test first
const express = require('express');
const request = require('supertest');
const { upload } = require('../middleware/upload');

test('upload middleware accepts a multipart file under field "file"', async () => {
  const app = express();
  app.post('/test-upload', upload.single('file'), (req, res) => {
    res.json({ filename: req.file.originalname, size: req.file.size });
  });

  const res = await request(app)
    .post('/test-upload')
    .field('userid', '80001')
    .attach('file', Buffer.from('fakebytes'), 'test.jpg');

  expect(res.status).toBe(200);
  expect(res.body.filename).toBe('test.jpg');
  expect(res.body.size).toBe(9);
});
```

**Check your work:**

- Unit: the supertest above is effectively a tight integration test; passes when multer is wired.
- Integration: real `POST /api/images` test in Phase 6.
- Smoke: real upload in Phase 8.

### Task 4.2: Add `cleanupTempFile(path)` helper

**Files:**

- Modify: `server/middleware/upload.js`
- Modify: `server/tests/upload.test.js`

**Behavior:**

- `cleanupTempFile(absPath)` deletes `absPath` if it exists; never throws.

**Write failing test first:**

```js
// failing test first
const fs = require('fs');
const path = require('path');
const os = require('os');
const { cleanupTempFile } = require('../middleware/upload');

test('cleanupTempFile removes an existing file', () => {
  const p = path.join(os.tmpdir(), 'photoapp-test-cleanup.bin');
  fs.writeFileSync(p, 'x');
  cleanupTempFile(p);
  expect(fs.existsSync(p)).toBe(false);
});

test('cleanupTempFile is a no-op when the file is missing', () => {
  expect(() =>
    cleanupTempFile(path.join(os.tmpdir(), 'definitely-not-here.bin'))
  ).not.toThrow();
});
```

**Check your work:**

- Unit: cleanup tests pass.
- Integration: upload service uses cleanup in success and failure paths.
- Smoke: repeated multipart uploads do not leak `os.tmpdir()/photoapp-uploads` files.

---

## Phase 5: PhotoApp Service Module — Write Use Cases

### Task 5.1: `uploadImage(userid, multerFile)`

**Files:**

- Modify: `server/services/photoapp.js`
- Modify: `server/tests/photoapp_service.test.js`

**Behavior:**

1. Validate `userid` exists: `SELECT userid, username FROM users WHERE userid = ?`. If missing → throw `Error('no such userid')`.
2. Build `bucketkey = <username>/<uuid>-<localname>` (per `00`; deviates from existing baseline which used `uuid + ext`). Username comes from the user lookup row; `localname` is `multerFile.originalname`.
3. Compute `kind = deriveKind(multerFile.originalname)` (per Q8 — image extensions → `'photo'`, everything else → `'document'`).
4. Read `multerFile.path` from disk into a Buffer (or stream — Buffer is fine for assignment scope).
5. `PutObjectCommand` to S3 with `Bucket`, `Key=bucketkey`, `Body=buffer`, optionally `ContentType` from extension. **This step runs regardless of `kind`** — both photos and documents are stored in S3.
6. **Branch on `kind`:**
   - **`kind === 'photo'`:** call `DetectLabelsCommand` against the just-uploaded S3 object (`Image: { S3Object: { Bucket, Name: bucketkey } }`, `MaxLabels: 100`, `MinConfidence: 80`). Collect the resulting labels.
   - **`kind === 'document'`:** **skip** Rekognition entirely. No labels are produced in Part 03 (Textract OCR for documents is Future-State per Q9).
7. INSERT row into `assets(userid, localname, bucketkey, kind)`; capture `result.insertId` as `assetid`. The row's `kind` reflects the actual file type and stays valid when Future-State Textract lands and starts populating `textract_text` for document rows.
8. **If `kind === 'photo'`:** for each detected label: `INSERT IGNORE INTO labels(assetid, label, confidence) VALUES (?, ?, ROUND(?))`. **If `kind === 'document'`:** no label inserts.
9. Return `{ assetid }`.
10. **Always** call `cleanupTempFile(multerFile.path)` in `finally`, regardless of success or failure or branch.
11. **Always** `await dbConn.end()` in `finally` for each opened connection.

**Add a failing test for the document branch:**

```js
test('uploadImage stores a document without calling Rekognition (Q9)', async () => {
  const fakeDb = {
    execute: jest.fn()
      .mockResolvedValueOnce([[{ userid: 80001, username: 'p_sarkar' }]])    // user lookup
      .mockResolvedValueOnce([{ insertId: 1042 }])                            // assets INSERT
      .mockResolvedValue([[]]),                                               // any extra calls
    end: jest.fn().mockResolvedValue(),
  };
  aws.getDbConn.mockResolvedValue(fakeDb);
  aws.getBucket.mockReturnValue({ send: jest.fn().mockResolvedValue({}) });
  // Note: Rekognition mock is NOT armed; the test asserts it's never called.
  const rekogSend = jest.fn();
  aws.getRekognition.mockReturnValue({ send: rekogSend });

  const fakeFile = { path: '/tmp/abc', originalname: 'lecture-notes.pdf' };
  const result = await uploadImage(80001, fakeFile);

  expect(result).toEqual({ assetid: 1042 });
  expect(rekogSend).not.toHaveBeenCalled();   // ← key assertion: documents skip Rekognition
  // assets INSERT received kind='document'
  expect(fakeDb.execute).toHaveBeenCalledWith(
    expect.stringMatching(/INSERT INTO assets/),
    expect.arrayContaining([80001, 'lecture-notes.pdf', expect.any(String), 'document'])
  );
  // No labels INSERT for documents
  expect(fakeDb.execute).not.toHaveBeenCalledWith(
    expect.stringMatching(/INSERT IGNORE INTO labels/),
    expect.anything()
  );
  expect(upload.cleanupTempFile).toHaveBeenCalledWith('/tmp/abc');
});
```

**Write failing tests first:**

```js
// failing test first
jest.mock('../services/aws');
jest.mock('../middleware/upload');
const aws = require('../services/aws');
const upload = require('../middleware/upload');
const { uploadImage } = require('../services/photoapp');

test('uploadImage rejects unknown userid', async () => {
  const fakeDb = {
    execute: jest.fn().mockResolvedValue([[]]), // userid lookup empty
    end: jest.fn().mockResolvedValue(),
  };
  aws.getDbConn.mockResolvedValue(fakeDb);

  const fakeFile = { path: '/tmp/abc', originalname: 'x.jpg' };

  await expect(uploadImage(99999, fakeFile)).rejects.toThrow('no such userid');
  expect(upload.cleanupTempFile).toHaveBeenCalledWith('/tmp/abc');
});

test('uploadImage round-trips through S3, Rekognition, and INSERT', async () => {
  // setup mocks for: dbConn.execute (user lookup -> [{userid, username}]),
  // S3 PutObject (resolve), Rekognition DetectLabels (resolve [{Name, Confidence}]),
  // assets INSERT (resolve { insertId: 1001 }), labels INSERT (resolve).
  // assert returned { assetid: 1001 } and cleanupTempFile called.
});
```

**Check your work:**

- Unit: mocked-AWS upload tests pass.
- Integration: multipart route test in Phase 6.
- Smoke: real upload in Phase 8.

### Task 5.2: `downloadImage(assetid)`

**Behavior:**

- Look up `(assetid, userid, localname, bucketkey)` from `assets` by id. Missing → throw `Error('no such assetid')`.
- Build a `GetObjectCommand({ Bucket, Key: bucketkey })`.
- Return an object the route can stream:
  ```js
  return {
    bucketkey,
    localname,
    contentType: contentTypeFromExt(localname),
    s3Result: await bucket.send(getCmd), // { Body, ContentType, ... }
  };
  ```
- The route is responsible for `response.setHeader('Content-Type', ...)` and `s3Result.Body.pipe(response)`. The service does not buffer the bytes.
- Provide a small `contentTypeFromExt(localname)` helper (jpg/jpeg/png/gif/webp → image/<ext>; default `application/octet-stream`).

**Write failing tests first:**

- Unknown assetid → throws `Error('no such assetid')`.
- Known assetid → returns `{ bucketkey, localname, contentType, s3Result }` where `s3Result.Body` is the mocked stream.

**Check your work:**

- Unit: download service tests pass with mocked S3.
- Integration: route streams bytes in Phase 6.
- Smoke: real preview/download in Phase 8.

### Task 5.3: `deleteAll()`

**Behavior (matches `00`'s DB-first ordering):**

1. Open dbConn. `SELECT bucketkey FROM assets`. Collect `bucketkeys`.
2. `DELETE FROM labels`.
3. `DELETE FROM assets`.
4. Close dbConn.
5. If `bucketkeys.length > 0`, call `S3 DeleteObjects` (batched).
6. Return `{ deleted: true }`.

This deviates from the existing `api_delete_images.js`, which deletes from S3 *before* DB. The new ordering keeps S3 ⇄ DB consistent if the second step fails.

**Write failing tests first:**

- Empty DB → no S3 call, returns `{ deleted: true }`.
- Non-empty DB → `DELETE FROM labels` is called before `DELETE FROM assets`, and S3 `DeleteObjects` is called after both DB deletes succeed.
- DB delete failure short-circuits before S3 is touched.

**Check your work:**

- Unit: ordering assertions hold.
- Integration: route returns `{message: 'success', data: {deleted: true}}`.
- Smoke: real delete in Phase 8.

---

## Phase 6: Routes Wired To Service

### Task 6.1: Create `server/routes/photoapp_routes.js` and mount under `/api`

**Files:**

- Create: `server/routes/photoapp_routes.js`
- Create: `server/tests/photoapp_routes.test.js`
- Modify (coordinate with Server Foundation): `server/app.js` mounts the router under `/api`.

**Router skeleton:**

```js
const express = require('express');
const router = express.Router();
const photoapp = require('../services/photoapp');
const { upload } = require('../middleware/upload');
const { successResponse } = require('../schemas');

router.get('/ping', async (req, res, next) => {
  try {
    const data = await photoapp.getPing();
    res.json(successResponse(data));
  } catch (err) { next(err); }
});

// ...other routes follow the same pattern...

module.exports = router;
```

**Mount in `server/app.js` (Server Foundation owns this file, but this line is the integration point):**

```js
const photoappRoutes = require('./routes/photoapp_routes');
app.use('/api', photoappRoutes);
```

### Task 6.2: `GET /api/ping`

**Existing baseline:** `server/api_get_ping.js`. Smoothing: drop ad-hoc response shape (`{message, M, N}`) in favor of envelope `{message, data: {s3_object_count, user_count}}`.

**Write failing test first:**

```js
// failing test first
jest.mock('../services/photoapp');
const request = require('supertest');
const photoapp = require('../services/photoapp');
const app = require('../app');

test('GET /api/ping returns success envelope with counts', async () => {
  photoapp.getPing.mockResolvedValue({ s3_object_count: 2, user_count: 3 });

  const res = await request(app).get('/api/ping');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    message: 'success',
    data: { s3_object_count: 2, user_count: 3 },
  });
});
```

**Check your work:**

- Unit/integration: ping route test passes with mocked service.
- Smoke: `curl http://localhost:8080/api/ping` returns success in Phase 8.

### Task 6.3: `GET /api/users`

**Existing baseline:** `server/api_get_users.js`. Smoothing: same envelope, URL prefix.

**Write failing test first:**

```js
// failing test first
test('GET /api/users returns envelope with users', async () => {
  photoapp.listUsers.mockResolvedValue([
    { userid: 80001, username: 'p_sarkar', givenname: 'Pooja', familyname: 'Sarkar' },
  ]);

  const res = await request(app).get('/api/users');

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('success');
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0].username).toBe('p_sarkar');
});
```

**Check your work:**

- Unit/integration: users route test passes.

### Task 6.4: `GET /api/images` (with optional `?userid=`)

**Existing baseline:** `server/api_get_images.js`. Smoothing: prefix only.

**Write failing tests first:**

- Without `userid`: route calls `photoapp.listImages(undefined)`.
- With `?userid=80001`: route parses to int and calls `photoapp.listImages(80001)`.
- Non-int `userid` → 400 with envelope error.

**Check your work:**

- Unit/integration: both query branches green.

### Task 6.5: `POST /api/images` (multipart)

**Existing baseline:** `server/api_post_image.js`. Major change: **base64 JSON → multipart**. Also bucketkey shape changes from `uuid+ext` to `<username>/<uuid>-<localname>`.

**Route shape:**

```js
router.post('/images', upload.single('file'), async (req, res, next) => {
  try {
    const userid = parseInt(req.body.userid, 10);
    if (Number.isNaN(userid)) return res.status(400).json(errorResponse('invalid userid'));
    if (!req.file) return res.status(400).json(errorResponse('missing file'));

    const data = await photoapp.uploadImage(userid, req.file);
    res.json(successResponse(data));
  } catch (err) { next(err); }
});
```

**Write failing tests first:**

```js
// failing test first
test('POST /api/images accepts multipart upload and returns assetid', async () => {
  photoapp.uploadImage.mockResolvedValue({ assetid: 1001 });

  const res = await request(app)
    .post('/api/images')
    .field('userid', '80001')
    .attach('file', Buffer.from('fakebytes'), 'test.jpg');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ message: 'success', data: { assetid: 1001 } });
  expect(photoapp.uploadImage).toHaveBeenCalledWith(80001, expect.objectContaining({ originalname: 'test.jpg' }));
});

test('POST /api/images maps "no such userid" to 400', async () => {
  photoapp.uploadImage.mockRejectedValue(new Error('no such userid'));

  const res = await request(app)
    .post('/api/images')
    .field('userid', '99999')
    .attach('file', Buffer.from('x'), 'x.jpg');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ message: 'error', error: 'no such userid' });
});

test('POST /api/images without file returns 400', async () => {
  const res = await request(app).post('/api/images').field('userid', '80001');
  expect(res.status).toBe(400);
});
```

**Check your work:**

- Unit/integration: multipart, error mapping, missing-file all green.

### Task 6.6: `GET /api/images/:assetid/file` (native streaming response)

**Existing baseline:** `server/api_get_image.js`. Major change: **base64 JSON body → native streamed file response**.

**Route shape:**

```js
const { GetObjectCommand } = require('@aws-sdk/client-s3');

router.get('/images/:assetid/file', async (req, res, next) => {
  try {
    const assetid = parseInt(req.params.assetid, 10);
    if (Number.isNaN(assetid)) return res.status(400).json(errorResponse('invalid assetid'));

    const { contentType, s3Result } = await photoapp.downloadImage(assetid);
    res.setHeader('Content-Type', contentType);
    s3Result.Body.pipe(res);
  } catch (err) { next(err); }
});
```

**Write failing tests first:**

- Unknown assetid → 404 envelope.
- Known assetid → 200, response body equals the mocked stream bytes, `Content-Type` set from extension.

**Check your work:**

- Unit/integration: stream test passes.
- Smoke: browser preview works in Phase 8.

### Task 6.7: `GET /api/images/:assetid/labels`

**Existing baseline:** `server/api_get_image_labels.js`. Smoothing: prefix; lift the `404` mapping out of the route into the error middleware.

**Write failing tests first:**

- Valid assetid → 200, envelope with labels.
- Missing assetid (`Error('no such assetid')` from service) → 404 envelope.

### Task 6.8: `GET /api/search?label=...`

**Existing baseline:** `server/api_get_images_search.js`. URL change: `/images/search` → `/api/search`.

**Route validates:**

- `req.query.label` is a non-empty trimmed string. If not → 400 envelope `{message: 'error', error: 'missing required query param: label'}`.

**Write failing tests first:**

- Missing/empty label → 400.
- `?label=animal` → 200, envelope with search rows.

### Task 6.9: `DELETE /api/images`

**Existing baseline:** `server/api_delete_images.js`. Behavioral change: DB-first delete order.

**Write failing tests first:**

- 200 envelope `{message: 'success', data: {deleted: true}}`.
- Service exception → 500 envelope (covered by error middleware).

**Check your work for Phase 6:**

- Unit/integration: every route test green with `jest.mock('../services/photoapp')`.
- Smoke: deferred to Phase 8.

---

## Phase 7: Centralized Error Middleware

### Task 7.1: Map known errors to HTTP status

**Files:**

- Create: `server/middleware/error.js`
- Create: `server/tests/error.test.js`
- Modify (coordinate with Server Foundation): `server/app.js` registers the error middleware *after* the `/api` mount.

**Behavior:**

| Trigger                                       | Status | Body                                                 |
| --------------------------------------------- | ------ | ---------------------------------------------------- |
| `Error('no such userid')`                     | 400    | `{message: 'error', error: 'no such userid'}`        |
| `Error('no such assetid')`                    | 404    | `{message: 'error', error: 'no such assetid'}`       |
| Multer `LIMIT_FILE_SIZE` / similar            | 400    | `{message: 'error', error: <multer message>}`        |
| Anything else                                 | 500    | `{message: 'error', error: 'internal server error'}` (raw `err.message` stays in server log) |

**Skeleton:**

```js
const { errorResponse } = require('../schemas');

function errorMiddleware(err, req, res, next) {
  if (err && /no such userid/i.test(err.message)) {
    return res.status(400).json(errorResponse(err.message));
  }
  if (err && /no such assetid/i.test(err.message)) {
    return res.status(404).json(errorResponse(err.message));
  }
  if (err && err.code && err.code.startsWith('LIMIT_')) {
    return res.status(400).json(errorResponse(err.message));
  }
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json(errorResponse('internal server error'));
}

module.exports = errorMiddleware;
```

**Write failing tests first:**

```js
// failing test first
test('error middleware maps "no such userid" to 400', async () => {
  photoapp.uploadImage.mockRejectedValue(new Error('no such userid'));
  const res = await request(app)
    .post('/api/images')
    .field('userid', '99999')
    .attach('file', Buffer.from('x'), 'x.jpg');
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ message: 'error', error: 'no such userid' });
});

test('error middleware maps "no such assetid" to 404', async () => {
  photoapp.getImageLabels.mockRejectedValue(new Error('no such assetid'));
  const res = await request(app).get('/api/images/9999/labels');
  expect(res.status).toBe(404);
});

test('error middleware sanitizes unhandled errors to 500', async () => {
  photoapp.listUsers.mockRejectedValue(new Error('SQL connection refused'));
  const res = await request(app).get('/api/users');
  expect(res.status).toBe(500);
  expect(res.body.error).toBe('internal server error');
});
```

**Check your work:**

- Unit/integration: error route tests pass.
- Smoke: a forced bad input from the browser yields a friendly envelope, no traceback.

---

## Phase 8: Live AWS Integration Tests (Opt-In)

### Task 8.1: Add guarded live integration tests

**Files:**

- Create: `server/tests/live_photoapp_integration.test.js`

**Pattern:**

```js
const RUN_LIVE = process.env.PHOTOAPP_RUN_LIVE_TESTS === '1';
const maybeDescribe = RUN_LIVE ? describe : describe.skip;

const request = require('supertest');
const app = require('../app');

maybeDescribe('live PhotoApp integration', () => {
  test('GET /api/ping returns success', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
    expect(typeof res.body.data.s3_object_count).toBe('number');
    expect(typeof res.body.data.user_count).toBe('number');
  });

  test('GET /api/users returns seeded users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Upload, labels, search, download, delete only after confirming
  // the live environment is safe to mutate.
});
```

**Check your work:**

- Unit: `npm test` skips live tests by default.
- Integration: `PHOTOAPP_RUN_LIVE_TESTS=1 npx jest server/tests/live_photoapp_integration.test.js -v` exercises real AWS+RDS.
- Smoke: no accidental live AWS mutation without opt-in.

---

## Phase 9: End-To-End Smoke Checklist

Run only after UI and Server Foundation are ready.

**Checklist:**

- [ ] Build the frontend: `cd frontend && npm run build` (produces `frontend/dist`).
- [ ] Start the server: `npm start` (Server Foundation entrypoint).
- [ ] Open `http://localhost:8080/`.
- [ ] `GET /api/ping` returns success envelope with non-negative counts.
- [ ] `GET /api/users` returns seeded users.
- [ ] Select user in UI.
- [ ] Upload known image via UI (multipart → `POST /api/images`).
- [ ] Confirm upload returns `{message: 'success', data: {assetid}}`.
- [ ] Confirm gallery refreshes (`GET /api/images`).
- [ ] Confirm labels can be fetched (`GET /api/images/:assetid/labels`).
- [ ] Confirm search returns expected label/image (`GET /api/search?label=...`).
- [ ] Confirm image preview/download works (`GET /api/images/:assetid/file`).
- [ ] Confirm delete/reset works (`DELETE /api/images`).
- [ ] Confirm no raw traceback or stack appears in UI.
- [ ] Confirm no credentials appear in browser dev tools or frontend source.
- [ ] Confirm `os.tmpdir()/photoapp-uploads/` does not accumulate files across multiple uploads.

---

## Acceptance Checklist

Before marking API Routes complete:

- [ ] All schema/converter tests pass.
- [ ] AWS factory tests pass with mocked `fs`.
- [ ] Multer middleware + cleanup helper tests pass.
- [ ] Service tests pass with mocked `services/aws`.
- [ ] Route tests pass with mocked `services/photoapp` (supertest).
- [ ] Error middleware mapping tests pass.
- [ ] `npm test` skips live tests by default.
- [ ] `PHOTOAPP_RUN_LIVE_TESTS=1` live tests pass against real config.
- [ ] End-to-end smoke checklist passes.
- [ ] README documents route-specific run/test commands.
- [ ] API responses match `00-coordination-and-contracts.md` (envelope + status codes).
- [ ] Legacy `server/api_*.js` files remain in place as reference; final disposition is queued in `Part03/MetaFiles/TODO.md` for end-of-Part-03 decision (do **not** delete during this workstream).

## Suggested Commit Points

- After schemas + envelope helpers + converter tests pass.
- After `services/aws.js` factory replaces `helper.js`.
- After service module read use cases (ping/listUsers/listImages/labels/search) pass with mocks.
- After multer middleware + cleanup tests pass.
- After service module write use cases (upload/download/deleteAll) pass with mocks.
- After router + every supertest passes with mocked service.
- After centralized error middleware mapping is green.
- After guarded live integration tests pass.
- After end-to-end smoke checklist passes.

## Risks And Mitigations

- **Risk:** `mysql2` connection leaks if `dbConn.end()` is missed on an error path.
  - **Mitigation:** every service function uses `try { ... } finally { try { await dbConn.end(); } catch {} }`. Service tests assert `fakeDb.end` was called.
- **Risk:** Multer temp files leak when the upload service throws after the file is on disk.
  - **Mitigation:** `cleanupTempFile(file.path)` runs in the upload service `finally` block, not just on success. Smoke checklist verifies the temp dir does not accumulate.
- **Risk:** AWS SDK v3 error shapes vary (`err.name`, `err.$metadata.httpStatusCode`, etc.) and don't always carry a clean `message`.
  - **Mitigation:** error middleware logs the full error server-side and returns a generic `'internal server error'` for anything not explicitly recognized. UI never sees raw SDK detail.
- **Risk:** Promise chain mismanagement (forgotten `await`) silently swallows errors and produces 500s with empty bodies.
  - **Mitigation:** every async route handler wraps the body in `try/catch` and calls `next(err)`. Lint or code review catches unhandled `.then` chains.
- **Risk:** Route tests accidentally hit live AWS or RDS.
  - **Mitigation:** route tests `jest.mock('../services/photoapp')`; service tests `jest.mock('../services/aws')`. Live tests are gated on `PHOTOAPP_RUN_LIVE_TESTS=1` and live in their own file.
- **Risk:** Bucketkey shape drifts between Part 2 (`username/uuid-localname`) and the existing baseline (`uuid+ext`).
  - **Mitigation:** new `uploadImage` builds `<username>/<uuid>-<localname>`; service tests assert the shape; smoke check inspects S3 keys.
- **Risk:** Delete order regresses to S3-first (legacy baseline) and leaves S3 ⇄ DB inconsistent on partial failure.
  - **Mitigation:** `deleteAll` test asserts `DELETE FROM labels` and `DELETE FROM assets` execute before `DeleteObjectsCommand`.
- **Risk:** Streaming `s3Result.Body.pipe(response)` leaves the response open if the S3 stream errors mid-flight.
  - **Mitigation:** attach `s3Result.Body.on('error', next)` to forward stream errors into the error middleware.
- **Risk:** UI and API response shapes drift.
  - **Mitigation:** every change to envelope, status code, or endpoint updates `00-coordination-and-contracts.md` first.

## Footnote: API Baseline Provenance

On 2026-04-25, the team copied a Project 2 Express API baseline into Part 3:

- `projects/project01/Part03/server/app.js`
- `projects/project01/Part03/server/helper.js`
- `projects/project01/Part03/server/config.js`
- `projects/project01/Part03/server/api_get_ping.js`
- `projects/project01/Part03/server/api_get_users.js`
- `projects/project01/Part03/server/api_get_images.js`
- `projects/project01/Part03/server/api_post_image.js`
- `projects/project01/Part03/server/api_get_image.js`
- `projects/project01/Part03/server/api_get_image_labels.js`
- `projects/project01/Part03/server/api_get_images_search.js`
- `projects/project01/Part03/server/api_delete_images.js`

On 2026-04-26, the team committed to **Express/Node** as the Part 03 backend (rather than the FastAPI/Python target initially described) and decided **not** to import Part 2 `photoapp.py` at runtime; the server uses Node-native AWS SDK v3 and `mysql2/promise` directly. See `MetaFiles/refactor-log.md` 2026-04-26 (Q1–Q6 decision record) for the full rationale.

This provenance does not change the functional contract in `00-coordination-and-contracts.md`. The checklist above describes the smoothing actions required to bring the copied baseline into alignment with that contract.

Key smoothing actions embedded in the phases above:

- **URL prefix refactor.** Every route moves under `/api/*`. `GET /ping` → `GET /api/ping`, `GET /users` → `GET /api/users`, `GET /images` → `GET /api/images`, `POST /image` → `POST /api/images`, `GET /image/:assetid` → `GET /api/images/:assetid/file`, `GET /image/:assetid/labels` → `GET /api/images/:assetid/labels`, `GET /images/search` → `GET /api/search`, `DELETE /images` → `DELETE /api/images`.
- **Base64 → multipart upload.** `POST /api/images` accepts `multipart/form-data` via multer; the existing base64 JSON body shape is dropped.
- **Base64 → native file response.** `GET /api/images/:assetid/file` streams S3 bytes directly with a best-effort `Content-Type`; the existing base64 JSON body shape is dropped.
- **Response shape alignment.** Every JSON route returns `{message, data}` on success and `{message, error}` on failure. Legacy ad-hoc shapes (`{message, M, N}`, `{message, assetid}`, `{message, data: rows}` without nesting) are normalized.
- **DB-first delete ordering.** `DELETE /api/images` issues `DELETE FROM labels` → `DELETE FROM assets` → S3 `DeleteObjects`, matching Part 2 semantics. The existing baseline's S3-first ordering is reversed.
- **Bucketkey shape.** `<username>/<uuid>-<localname>` (Part 2 convention) replaces the existing baseline's `<uuid>+<ext>`.
- **Centralized error mapping.** `ValueError`-style strings (`"no such userid"`, `"no such assetid"`) flow through a single error middleware instead of being mapped per-route.
- **Automated tests.** Every route, service function, and middleware gets Jest unit/integration coverage; live AWS tests are opt-in via `PHOTOAPP_RUN_LIVE_TESTS=1`.

Track specific copied-baseline refactors in `projects/project01/Part03/MetaFiles/refactor-log.md`.
