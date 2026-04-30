# Engineering Surface Workstream Approach

> **For agentic workers:** Execute as a TDD checklist. Every change is **additive** to the spec-compliant `/v1` surface from `02-web-service.md` — the Gradescope contract must keep passing throughout. Anything that would alter `/v1` behaviour is out of scope for this workstream and belongs in `02-web-service.md` instead. **Precondition: `02-web-service.md` (60/60) and `03-client-api.md` (30/30) are both Gradescope-green.**

> **Existing infrastructure to extend, not rebuild:** the Terraform tree at `MBAi460-Group1/infra/terraform/` already provisions S3, RDS, IAM (`s3readonly`, `s3readwrite`), and the security group; `01-foundation.md` Phase 12 refactors these into reusable modules under `projects/project02/infra/modules/`. This workstream **adds new modules** (`cloudwatch/` extended with dashboards + alarms, `scheduler/` for spindown) on top of that refactored layout. The shared utils — `utils/smoke-test-aws`, `utils/aws-inventory`, `utils/cred-sweep`, `utils/rotate-*` — are reused without modification for live regression and ops checks.

> **Library 1.1.0 promotion governance:** Several `/v2` features (presigned URL service methods, OTel-instrumented use cases, `getSigner()` / `getCloudWatch()` AWS factory exports, idempotency repository) are best-implemented in `@mbai460/photoapp-server` rather than only in Project 02's tree, so Part 03 inherits them for free if it ever opts in. Per CL9 in `00-shared-library-extraction.md`, every library-touching task in this workstream: (a) is its own commit with `feat(lib:photoapp-server)` scope, (b) carries the `lib:photoapp-server` GitHub label, (c) is gated on **both** consumers' tests staying green (Part 03 + Project 02), (d) bumps the library to 1.1.0 and updates both consumers' `package.json` in the same PR. **Pool factory + breakers** (`projects/project02/server/services/pool.js` + `breakers.js`) remain in Project 02's tree until/unless Part 03 needs them — that promotion is a separate workstream when justified.

## Goal

Add the engineering-grade `/v2` surface (presigned URL upload + download, idempotency keys, pagination, REST-correct status codes), wire OpenTelemetry tracing through every span, ship CloudWatch dashboards + alarms, automate scheduled spindown, and turn the live regression suite into a reliable signal. Everything is additive: `/v1` continues to serve the Gradescope autograder, and `/v2` becomes the production-quality interface for the rest of the project's lifetime.

## Scope

This workstream owns:

- `server/routes/v2/*.js`, `server/controllers/v2/*.js` — the engineered surface.
- `lib/photoapp-server/src/services/photoapp.js` — *library 1.1.0 candidate* — extended with use cases that produce / consume presigned URLs and accept idempotency keys (added via DI seam: each new use case is configurable so Part 03 can opt out). Promotion follows CL9 bounded reconciliation per `00-shared-library-extraction.md`.
- `lib/photoapp-server/src/services/aws.js` — *library 1.1.0 candidate* — extended with `getSigner()` (S3 v4 signer) and `getCloudWatch()`. Both surfaces benefit; injection optional for Part 03.
- `projects/project02/server/services/breakers.js` — `circuit_breaker_state` metric emission on state change (Project 02-specific; consumes the library's clients via Project 02's wrapper).
- `server/middleware/idempotency.js` — `Idempotency-Key` header handling and dedupe table integration.
- `server/observability/tracing.js` — full OTel SDK init (Phase 1 of 04 promotes the foundation stub to a real exporter).
- `projects/project02/infra/modules/cloudwatch/` — extended with dashboards + alarms (skeleton from `01-foundation.md` Phase 12).
- `projects/project02/infra/modules/scheduler/` — new module for EventBridge → Lambda spindown.
- `client/photoapp.py` — `api_version=v2` branch (default still `v1`; engineering tests opt in).
- Live regression suite — every `live_*` file fully implemented.
- New tests across all six layers.

This workstream does **not** own:

- Anything in `/v1` — owned by `02-web-service.md`.
- Gradescope submission — already locked.
- CI/CD wiring — `Future-State-cicd.md`.

## Dependencies

Read first:

- `00-overview-and-conventions.md`
- `01-foundation.md` (acceptance complete)
- `02-web-service.md` (Gradescope 60/60)
- `03-client-api.md` (Gradescope 30/30)

Required state:

- `make up` healthy.
- All foundation tests + v1 tests + client tests green.
- `MetaFiles/refactor-log.md` records the two Gradescope tags (`gradescope-server-60-60`, `gradescope-client-30-30`).

## Target Files

```text
server/
  routes/
    v2/
      index.js
      images_upload.js          # POST /v2/images/:userid/upload-url + POST /v2/images/:userid/finalize
      images_download.js        # GET /v2/images/:assetid/download-url
      images_paginated.js       # GET /v2/images?cursor=&limit=
      image_delete.js           # DELETE /v2/images/:assetid (404-correct)
  controllers/
    v2/
      images_upload.js
      images_download.js
      images_paginated.js
      image_delete.js
  services/
    photoapp.js                 # extended: presignUploadUrl, finalizeUpload, presignDownloadUrl, listImagesPaginated, deleteImageById
    aws.js                      # extended: getSigner, getCloudWatch
  middleware/
    idempotency.js
  observability/
    tracing.js                  # promoted from foundation stub to live OTel SDK init
  tests/
    unit/
      photoapp_service_v2.test.js
      idempotency_middleware.test.js
    integration/
      v2_images_upload.test.js
      v2_images_download.test.js
      v2_images_paginated.test.js
      v2_image_delete.test.js
    contract/
      openapi_conformance_v2.test.js
    happy_path/
      v2_upload_lifecycle.test.js
    live/
      live_v2_lifecycle.test.js
projects/project02/infra/
  modules/
    cloudwatch/                  # extended with dashboards + alarms (skeleton from 01-foundation.md Phase 12)
    scheduler/                   # new: EventBridge schedule + Lambda for RDS spindown
  envs/
    dev/                         # composes the new modules
  # Note: existing MBAi460-Group1/infra/terraform/ provides the base S3+RDS+IAM resources;
  # Phase 12 of 01-foundation.md refactors these into the modules referenced above.
api/
  openapi.yaml                   # extended with /v2/* operations
client/
  photoapp.py                    # api_version='v2' branch added
  tests/
    integration/
      test_against_compose_v2.py
    live/
      test_against_real_v2.py
```

## Design Decisions

- **E1 — `/v2` is mounted only when `ENABLE_V2_ROUTES=1`.** Default off in the submission build; default on in `docker-compose.yml`.
- **E2 — Presigned URLs replace base64 transit.** Client requests a presigned URL, streams to S3 directly, then calls a finalize endpoint that writes the DB row + triggers Rekognition.
- **E3 — Idempotency-Key for state-mutating routes.** A dedupe table `idempotency_keys(key, fingerprint, response_body, expires_at)` records the first response for a key + fingerprint; subsequent calls within 24 h replay the same response.
- **E4 — Cursor-based pagination on `/v2/images`.** Cursor is base64-encoded `{last_assetid, page_size}`. Default `limit=50`, max `100`.
- **E5 — REST-correct status codes on `/v2`.** `404` on "no such id" (not `400`), `409` on `Idempotency-Key` collision with different fingerprint.
- **E6 — OTel tracing real, not stub.** Spans for HTTP request, MySQL query, S3 op, Rekognition op. Exporter via `OTEL_EXPORTER_OTLP_ENDPOINT`. Local dev exports to `aspecto`-compatible stdout JSON; production wires to AWS X-Ray (Part 02).
- **E7 — CloudWatch dashboards as code.** Terraform `cloudwatch_dashboard` resources; one widget per critical metric (request rate, p50/p95 latency, 5xx rate, RDS connections, S3 latency, Rekognition rate).
- **E8 — Alarms gate on engineering-grade SLOs, not assignment-grade.** P95 < 1 s for `/v2/images` reads, P95 < 5 s for upload finalize, 5xx rate < 1% over 5 min, RDS `DatabaseConnections` < 80% of pool.
- **E9 — Spindown automation lives in `projects/project02/infra/modules/scheduler`.** EventBridge cron → Lambda → `aws rds stop-db-instance`. Stops at 23:59 CST nightly; restarts on first request via a startup hook (or manually). Defensive: never destroys data, only stops. Coordinates with the existing rotation tooling (`utils/rotate-passwords` does an interactive `rotate` confirm — when the DB is stopped, those tools should fail gracefully or schedule a wake-up).
- **E10 — Live regression runs on demand, not on a schedule.** `make test-live` against staging; the team triggers it before milestones. Future State CI lifts it to a nightly job.

---

## Phase 1: OTel Tracing — Foundation Stub → Real

### Task 1.1: Promote `observability/tracing.js`

**Files:**

- Modify: `server/observability/tracing.js`
- Modify: `server/server.js` — initialise tracing before `require('./app')`.
- Create: `server/tests/unit/tracing.test.js`

**Behavior:**

- When `TRACING_ENABLED=1`:
  - Initialises `@opentelemetry/sdk-node` with auto-instrumentation for `http`, `express`, `mysql2`, `aws-sdk`.
  - Exporter: OTLP HTTP to `OTEL_EXPORTER_OTLP_ENDPOINT`.
  - Sampler: `parentBasedSampler({ root: traceIdRatioBasedSampler(parseFloat(process.env.OTEL_SAMPLE_RATIO || '0.1')) })`.
- When `TRACING_ENABLED` is unset, the function returns immediately (no-op).
- The default in `docker-compose.yml`: `TRACING_ENABLED=1`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`. Compose adds a small `otel-collector` service (Jaeger or Tempo).

**Checklist:**

- [ ] Failing test asserts that with `TRACING_ENABLED=1` and a valid endpoint, the SDK initialises without throwing.
- [ ] Failing test asserts that with `TRACING_ENABLED` unset, the function is a no-op.
- [ ] Implement; tests green.
- [ ] Compose: `make up` brings the collector to healthy; spans appear in the collector logs after a `curl /v1/ping`.

### Task 1.2: Span attributes & sampling

**Files:**

- Modify: `server/middleware/logging.js` — log line includes `traceId` + `spanId` from `@opentelemetry/api`.
- Modify: `lib/photoapp-server/src/services/photoapp.js` — wrap each use case in a custom span (`photoapp.uploadImage`, `photoapp.deleteAllImages`, etc.) so service-layer timing is observable independently of HTTP timing. **Library change** — follow CL9: tracer is injected (no hard `@opentelemetry/*` dependency in the library); Part 03 passes a no-op tracer; Project 02 passes its OTel SDK instance. Bump to library 1.1.0; both consumers update lockstep.

**Checklist:**

- [ ] Logs and traces share `traceId` for the same request.
- [ ] Span tree visualised in Jaeger / Tempo: HTTP root → service span → repo / S3 / Rekognition spans.

---

## Phase 2: `/v2` Skeleton + Mount

### Task 2.1: `routes/v2/index.js`

**Files:**

- Create: `server/routes/v2/index.js`
- Modify: `server/app.js` — mount `/v2` when `ENABLE_V2_ROUTES=1`.

**Skeleton:**

```js
const express = require('express');
const router = express.Router();

router.use('/images', require('./images_paginated'));         // GET /v2/images
router.use('/images', require('./images_upload'));            // POST /v2/images/:userid/upload-url + finalize
router.use('/images', require('./images_download'));          // GET /v2/images/:assetid/download-url
router.use('/images', require('./image_delete'));             // DELETE /v2/images/:assetid

module.exports = router;
```

**Checklist:**

- [ ] Failing supertest asserts `GET /v2/images` returns 501 (placeholder) when `ENABLE_V2_ROUTES=1`.
- [ ] Failing supertest asserts the same path returns 404 when `ENABLE_V2_ROUTES` is unset.
- [ ] Implement; tests green.

---

## Phase 3: Idempotency Middleware

### Task 3.1: Dedupe table migration

**Files:**

- Create: `projects/project01/migrations/2026-XX-XX-add-idempotency-keys.sql` (use the existing `migrations/` directory; pattern follows `2026-04-26-add-assets-kind.sql`)
- Run via: `utils/run-sql projects/project01/migrations/2026-XX-XX-add-idempotency-keys.sql`
- Add to `utils/_validate_db.py`: a check for the `idempotency_keys` table (extends the 26-check baseline).

**SQL:**

```sql
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key_value     VARCHAR(255) NOT NULL,
  route         VARCHAR(255) NOT NULL,
  fingerprint   VARCHAR(64)  NOT NULL,
  status_code   INT          NOT NULL,
  response_body MEDIUMTEXT   NOT NULL,
  expires_at    DATETIME     NOT NULL,
  PRIMARY KEY (key_value, route)
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
```

**Checklist:**

- [ ] Migration applies cleanly to compose MySQL.
- [ ] Manually verify schema after `make up`.

### Task 3.2: Middleware

**Files:**

- Create: `server/middleware/idempotency.js`
- Create: `server/tests/unit/idempotency_middleware.test.js`

**Behavior:**

- Reads `Idempotency-Key` header (32–255 chars; rejects shorter / longer).
- Computes a `fingerprint` over `(method, path, body, userId)` — `sha256` truncated to 16 bytes hex.
- Look up `(key, route)`. If found:
  - Same fingerprint → return cached `(status_code, response_body)` immediately.
  - Different fingerprint → 409 `{message: 'idempotency-key collision'}`.
- If not found, attach a `res.on('finish')` hook that writes the row with the response body.
- TTL: 24 hours.

**Checklist:**

- [ ] Failing tests for cache-hit-same-fingerprint, cache-hit-different-fingerprint, cache-miss-records-response, missing-header-passthrough.
- [ ] Implement; tests green.
- [ ] Periodic cleanup (Phase 8 alarm + Lambda) is captured in `MetaFiles/TODO.md` for the engineering-surface long tail; not blocking this workstream.

> **Optional Test Step** — suggested file `projects/project02/server/tests/integration/idempotency_replay_byte_identical.test.js`
>
> The contract of an idempotency key is bytewise: replay returns the *same response body* the first call returned, byte for byte. Unit tests typically assert "the second call returned 200 + the right shape"; that's not the contract. The contract is "the second response is `===` the first." A focused integration test that does the replay against a real Express app + real (in-memory or LocalStack-backed) idempotency store catches it.
>
> - **What to lock down**: `body1 === body2` byte equality (use `expect(JSON.stringify(body1)).toBe(JSON.stringify(body2))` after `await request(app)` twice with the same key + body); the second call's wall-clock latency is dramatically lower than the first (no DB writes); the side-effect surface (DB row count, S3 object count) is identical to a single-call baseline; a different body with the same key yields 409 (already in unit tests, but worth re-asserting at the integration layer).
> - **Why this catches bugs**: idempotency stores that record only the *response status* and re-execute the handler look fine in unit tests but fail this test (different request id in body, different timestamps). Subtle failure mode; common bug.
> - **Decision branches**: build now (recommended — idempotency is the kind of feature where "looks right" is far from "is right"), queue (defer to Phase 10 live-regression), skip (the unit tests cover the cache-hit logic; *partly* sufficient).

---

## Phase 4: Presigned URL Upload Flow

> **Optional Mermaid Visualization Step (strongly recommended — major architectural change)** — suggested file `visualizations/Target-State-project02-v2-presigned-upload-vs-v1-base64-v1.md`
>
> Before implementing the `/v2` upload, render a single Mermaid `flowchart LR` showing the **two upload paths side by side** (`/v1` base64 inline vs `/v2` presigned three-step) so the architectural delta is unmistakable.
>
> - **Story**: "v1: bytes pass through the server (memory cost grows with payload). v2: bytes never touch the server (browser PUTs directly to S3 via a signed URL)."
> - **Focus**: highlight the **bytes path** in **red** — in v1 it traverses the server's heap; in v2 it bypasses the server entirely. Highlight the **finalize call** in v2 in **amber** because it's the seam where the server first sees the new asset (and where idempotency lives).
> - **Shape vocab**: stadium `([...])` = client; rounded `(...)` = server step; cloud-style subgraph = S3; trapezoid = base64 / signing transform; subgraph = `/v1` vs `/v2` columns.
> - **Brevity**: ≤ 4 words / node; edges = verbs (`posts`, `signs`, `puts`, `finalizes`).
> - **Direction**: `flowchart LR` with two parallel rows; align the client column on the left and S3 on the right so the v1 vs v2 difference reads as path divergence.

### Task 4.1: Service `presignUploadUrl(userid, localFilename)`

**Files:**

- Modify: `lib/photoapp-server/src/services/photoapp.js` — add `presignUploadUrl({ userid, localFilename })`. **Library 1.1.0 candidate; CL9 governance.**
- Modify: `lib/photoapp-server/src/services/aws.js` — add `getSigner()` returning `@aws-sdk/s3-request-presigner` `getSignedUrl`. **Library 1.1.0 candidate.**

**Behavior:**

1. `findUserById(pool, userid)` — null → `BadRequestError('no such userid')`.
2. Build `bucketkey = uuid.v4() + path.extname(localFilename)`.
3. `getSignedUrl(s3client, new PutObjectCommand({Bucket, Key: bucketkey, ContentType: <inferred>}), { expiresIn: 900 })` — 15 minutes.
4. Return `{bucketkey, presignedUrl, expiresIn: 900}`.

**Checklist:**

- [ ] Failing tests; implement; green.

### Task 4.2: Service `finalizeUpload(userid, bucketkey, localFilename, idempotencyKey?)`

**Files:**

- Modify: `lib/photoapp-server/src/services/photoapp.js` — add `finalizeUpload`. **Library 1.1.0 candidate; CL9 governance.**

**Behavior:**

1. Verify the S3 object exists (`HeadObjectCommand`). Missing → `BadRequestError('upload not found')`.
2. Open transaction.
3. `findUserById` — null → `BadRequestError('no such userid')`.
4. `insertAsset(conn, {userid, localname: localFilename, bucketkey, kind: deriveKind(localFilename)})`.
5. `DetectLabelsCommand` → `insertLabels`.
6. Commit. Return `{assetid}`.

**Checklist:**

- [ ] Failing tests for happy path, missing S3 object, unknown userid, transaction rollback on Rekognition failure.
- [ ] Implement; tests green.

### Task 4.3: Routes + controllers

**Files:**

- Create: `server/routes/v2/images_upload.js`
- Create: `server/controllers/v2/images_upload.js`
- Create: `server/tests/integration/v2_images_upload.test.js`

**Routes:**

```js
router.post('/:userid/upload-url', validate({...}), controller.requestUploadUrl);
router.post('/:userid/finalize', idempotency, validate({...}), controller.finalizeUpload);
```

**Failing tests:**

- `POST /v2/images/80001/upload-url` with valid userid → 200, `{message: 'success', data: {bucketkey, presignedUrl, expiresIn}}`.
- Same with unknown userid → 404 `{message: 'no such userid'}` (REST-correct on `/v2`).
- `POST /v2/images/80001/finalize` with valid bucketkey + idempotency key → 200 `{message: 'success', data: {assetid}}`.
- Replay with same idempotency key + same body → identical response, no second DB write (assert via mock).
- Replay with same idempotency key + different body → 409.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI updated.

> **Optional Test Step** — suggested file `projects/project02/server/tests/integration/presigned_url_real_s3.test.js`
>
> A presigned URL works only if (a) the URL was signed correctly, (b) the bucket policy permits the operation, (c) the object key is consistent with what `finalizeUpload` will look up. Three places to get wrong; integration tests against LocalStack catch each. The mocked unit tests assert the *signing call*; this test asserts the *signed URL actually works*.
>
> - **What to lock down**: (1) `presignUploadUrl()` returns a URL, (2) PUT to that URL with raw bytes succeeds (200), (3) `finalizeUpload()` finds the object at the same `bucketkey` and writes the DB row, (4) `presignDownloadUrl(assetid)` returns a URL whose GET returns the same bytes. End-to-end, no mocks.
> - **Why this catches bugs**: signing parameter mismatch (e.g., wrong `Content-Type` enforced in the URL but not sent on PUT) silently fails with a 403; only a real-S3-API roundtrip surfaces it. LocalStack is good enough; the test runs in `tests/integration/` against compose.
> - **Decision branches**: build now (strongly recommended — presigned URLs are the centerpiece of the engineering surface; "I'm sure the signing works" is the famous last words of S3 integration), queue (defer to Phase 10 live-regression if you trust LocalStack-equivalence less than direct AWS), skip (only if you have an external S3-replay tool).

> **Optional Utility Step** — suggested artifact `tools/presign-curl <assetid|bucketkey>` (Bash)
>
> Mid-flight debugging of presigned URLs almost always wants "give me a URL right now I can `curl`-PUT a file to." A 10-line wrapper around the upload-URL endpoint emits the URL + the matching `curl --upload-file` command, ready to paste. Same shape for download.
>
> - **What it does**: hits `/v2/images/:userid/upload-url` (or `/v2/images/:assetid/download-url`) against the running server, prints the URL + the corresponding `curl` command line.
> - **Why now**: every "is this URL doing what I think?" debug session benefits; future selves will run it 10+ times across Phases 4 + 5 + 11.
> - **Decision branches**: build now (recommended only if the API is stable), queue (until you hit the second debug session that wants this), skip (acceptable; `awscli` does the same with one extra command).

---

## Phase 5: Presigned URL Download Flow

### Task 5.1: Service `presignDownloadUrl(assetid)`

**Files:**

- Modify: `lib/photoapp-server/src/services/photoapp.js` — add `presignDownloadUrl`. **Library 1.1.0 candidate; CL9 governance.**

**Behavior:**

1. `findAssetById(pool, assetid)` — null → `NotFoundError('no such assetid')`.
2. `getSignedUrl(s3client, new GetObjectCommand({Bucket, Key: bucketkey}), { expiresIn: 900 })`.
3. Return `{userid, local_filename: localname, presignedUrl, expiresIn: 900}`.

**Checklist:**

- [ ] Failing tests; implement; green.

### Task 5.2: Route + controller

**Files:**

- Create: `server/routes/v2/images_download.js`
- Create: `server/controllers/v2/images_download.js`
- Create: `server/tests/integration/v2_images_download.test.js`

**Failing tests:**

- Valid assetid → 200, `{message: 'success', data: {userid, local_filename, presignedUrl, expiresIn}}`.
- Unknown assetid → 404 `{message: 'no such assetid'}`.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI updated.

---

## Phase 6: Pagination on `/v2/images`

### Task 6.1: Service `listImagesPaginated({userid?, cursor?, limit})`

**Files:**

- Modify: `lib/photoapp-server/src/services/photoapp.js` — add `listAssetsPaginated`. **Library 1.1.0 candidate; CL9 governance.**
- Modify: `lib/photoapp-server/src/repositories/assets.js` — `listAssetsPaginated(pool, {userid, lastAssetid, limit})`.

**Behavior:**

- Decode cursor: `{last_assetid: int, page_size: int}` from base64-decoded JSON. Empty / missing cursor → `last_assetid = 0`.
- SQL: `WHERE assetid > ? AND (userid = ? OR ? IS NULL) ORDER BY assetid ASC LIMIT ?` with `[lastAssetid, userid, userid, limit]`.
- Result: `{items, next_cursor}`. `next_cursor` is `base64(JSON({last_assetid: items[-1].assetid, page_size: limit}))` if `items.length === limit`, else `null`.

**Checklist:**

- [ ] Failing tests for empty cursor, mid-stream cursor, last page (`next_cursor: null`), `userid` filter combined with cursor.
- [ ] Implement; green.

### Task 6.2: Route + controller

**Files:**

- Create: `server/routes/v2/images_paginated.js`
- Create: `server/controllers/v2/images_paginated.js`
- Create: `server/tests/integration/v2_images_paginated.test.js`

**Failing tests:**

- `GET /v2/images` (no cursor) → 200, default `limit=50`.
- `GET /v2/images?limit=10&cursor=eyJsYXN0X2Fzc2V0aWQiOjEwMTAsInBhZ2Vfc2l6ZSI6MTB9` → returns next 10.
- Invalid cursor → 400 with details.
- `limit > 100` → clamped to 100 with a warning header `X-Limit-Clamped: 1`.

**Checklist:**

- [ ] Failing tests; implement; green.
- [ ] OpenAPI updated.

---

## Phase 7: REST-correct DELETE per asset

### Task 7.1: Service `deleteImageById(assetid)`

**Files:**

- Modify: `lib/photoapp-server/src/services/photoapp.js` — add `deleteAssetById`. **Library 1.1.0 candidate; CL9 governance.**
- Modify: `lib/photoapp-server/src/repositories/assets.js` — `deleteAssetById(conn, assetid)`.
- Modify: `lib/photoapp-server/src/repositories/labels.js` — `deleteLabelsByAssetId(conn, assetid)`.

**Behavior:**

1. Open transaction.
2. `findAssetById(conn, assetid)` — null → `NotFoundError('no such assetid')`.
3. `deleteLabelsByAssetId(conn, assetid)`.
4. `deleteAssetById(conn, assetid)`.
5. Commit.
6. `getBucketBreaker().fire(new DeleteObjectCommand({Bucket, Key: bucketkey}))` — best-effort.

**Checklist:**

- [ ] Failing tests; implement; green.

### Task 7.2: Route + controller

**Files:**

- Create: `server/routes/v2/image_delete.js`
- Create: `server/controllers/v2/image_delete.js`
- Create: `server/tests/integration/v2_image_delete.test.js`

**Failing tests:**

- Valid assetid → 200, `{message: 'success'}`.
- Unknown assetid → 404, `{message: 'no such assetid'}`.

**Checklist:**

- [ ] Failing tests; implement; green.

---

## Phase 8: Observability — Dashboards + Alarms

> **Optional Mermaid Visualization Step (strongly recommended — IAM permissions added)** — suggested file `visualizations/Target-State-project02-cloudwatch-emission-topology-v1.md`
>
> Before authoring the dashboards + alarms Terraform, render a `flowchart LR` of the **metric-emission topology** including the **new IAM permissions** required.
>
> - **Story**: "Express emits custom metrics → CloudWatch Metrics → dashboards (read-only render) + alarms → SNS topic → email/Slack. The EB instance role gains `cloudwatch:PutMetricData` to do the emission."
> - **Focus**: highlight the **new `cloudwatch:PutMetricData` IAM permission** on the EB instance role in **red** — that's the principal/permission boundary added by this phase. Highlight the **alarm thresholds** (P95 < 1s, 5xx < 1%, RDS conns < 80% pool) in **amber** so reviewers can challenge them before they ship.
> - **Shape vocab**: rounded rect = server / Lambda / role; cylinder `[(...)]` = CloudWatch namespace; cloud-style subgraph = AWS managed (CloudWatch / SNS); diamond `{...}` = alarm threshold; trapezoid = IAM permission grant.
> - **Brevity**: metric / permission name only on rounded; threshold expression on diamonds.
> - **Direction**: `flowchart LR`, with the IAM-grant trapezoid placed on the edge between the EB role and CloudWatch so the new permission is visually load-bearing.

### Task 8.1: CloudWatch dashboards (Terraform)

**Files:**

- Modify: `projects/project02/infra/modules/cloudwatch/main.tf`

**Resources:**

- `aws_cloudwatch_dashboard.photoapp_overview` — request rate, p50 / p95 latency by route, error rate by status class.
- `aws_cloudwatch_dashboard.photoapp_dependencies` — RDS connections, MySQL slow queries, S3 4xx/5xx, Rekognition throttles.

**Checklist:**

- [ ] `terraform fmt` / `validate` / `plan` clean.
- [ ] Dashboards render against a mock metric set (Plan-only; apply is Part 02).

### Task 8.2: Alarms

**Files:**

- Modify: `projects/project02/infra/modules/cloudwatch/main.tf`

**Alarms:**

- `5xx_rate_high`: 5xx requests > 1% over 5 min → SNS topic `photoapp-alerts`.
- `latency_p95_high`: p95 > 1 s for `/v2/images` reads or > 5 s for `/v2/images/:userid/finalize`.
- `rds_connections_high`: > 80% of pool over 10 min.
- `circuit_breaker_open`: any breaker reports `open` (custom metric from the application).

**Checklist:**

- [ ] Alarm thresholds set; SNS topic created with placeholder subscription.
- [ ] `terraform plan` clean.

### Task 8.3: Custom application metrics

**Files:**

- Modify: `server/observability/metrics.js` (new)
- Modify: `projects/project02/server/services/breakers.js` — push `circuit_breaker_state` metric on every state change. (Project 02-specific because the breakers themselves live here, not in the library.)

**Behavior:**

- `cloudwatch.PutMetricData` for `breaker_open_count`, `breaker_half_open_count` per service.
- Buffered: flushes every 10 s or when the buffer reaches 20 metrics.

**Checklist:**

- [ ] Failing test asserts that opening a breaker queues a metric.
- [ ] Implement; green.
- [ ] Local dev: metrics flush to LocalStack CloudWatch (or stdout if LocalStack CloudWatch is unavailable).

> **Optional Test Step** — suggested file `projects/project02/server/tests/live/alarms_fire.test.js`
>
> A CloudWatch alarm exists if and only if it fires at the threshold. Asserting the alarm is *configured* (terraform plan-zero) only verifies the YAML; asserting it *fires* requires actual CloudWatch metric data crossing the threshold. A live-gated test that publishes synthetic metric values + waits for the alarm state transition is the only honest way to validate the alarm.
>
> - **What to lock down**: for each documented alarm (e.g., 5xx-rate, p99 latency, RDS connection saturation, breaker-open count), publish synthetic metric data via `PutMetricData` that crosses the threshold; poll `DescribeAlarms` until the state transitions to `ALARM`; assert within ~3 minutes (alarms have a built-in evaluation period). Restore by publishing healthy data and waiting for `OK`.
> - **Why this catches bugs**: the most common alarm bugs (wrong namespace, wrong metric name, threshold off by 10x, statistic = `Average` when you wanted `Sum`) all silently produce alarms that never fire. The "alarm exists in console" check passes; the alarm itself is decorative. This test rejects decorative alarms.
> - **Decision branches**: build now (recommended only if you actually need production-quality alarming — i.e., this is a real ops surface, not just a Future-State demo), queue (defer until live-regression Phase 10 — same gate, same env), skip (acceptable for Project 02 if alarms are aspirational; document that they're untested).

> **Optional Utility Step** — suggested artifact `tools/synthetic-alarm-trigger <alarm-name>` (Bash + AWS CLI)
>
> The same synthetic-metric-publishing the test does is also useful for *humans*: "I want to see how the alarm-to-Slack chain feels end-to-end before relying on it in an outage." A wrapper that publishes a single threshold-crossing data point + tails the SNS topic is a 30-line CLI that earns its keep at every "are alarms wired correctly?" check-in.
>
> - **What it does**: `tools/synthetic-alarm-trigger 5xx-rate-high --duration=2m` publishes 2 minutes of high-5xx metric data, then watches `DescribeAlarms` and the SNS topic until the alarm transitions and the notification fires. Reports the wall-clock latency for each step.
> - **Why now**: same logic as the test step — but with a human-friendly output. The test pins; the tool explores.
> - **Decision branches**: build now (recommended if you'd want this during an alarming outage), queue (acceptable), skip (rely on production for end-to-end validation — fine for an academic project).

---

## Phase 9: Scheduled Spindown

> **Optional Mermaid Visualization Step (strongly recommended — new IAM principal + RDS modification)** — suggested file `visualizations/Target-State-project02-rds-spindown-iam-v1.md`
>
> Before authoring the `scheduler` module, render a `flowchart LR` of the **EventBridge → Lambda → RDS Stop chain** with the **new IAM execution role** explicit.
>
> - **Story**: "EventBridge schedule (cron) invokes a Lambda nightly. The Lambda's execution role lets it call `rds:StopDBInstance` on exactly one DB ARN. Restart is manual (or first-request triggered)."
> - **Focus**: highlight the **new Lambda execution role + the `rds:StopDBInstance` permission scoped to a single DB ARN** in **red** — that's the new IAM principal this phase introduces. Highlight the **schedule expression** (e.g., `cron(59 23 * * ? *)`) in **amber** so reviewers can sanity-check the timezone (CST vs UTC drift is a common bug).
> - **Shape vocab**: rounded rect = AWS resource (EventBridge rule / Lambda / RDS); trapezoid = IAM permission; cylinder `[(...)]` = data store; subgraph = AWS account boundary.
> - **Brevity**: resource name + ARN suffix only.
> - **Direction**: `flowchart LR`, with EventBridge on the left, RDS on the right, and the IAM trapezoid sitting on the Lambda → RDS edge so the principal/permission is visually load-bearing.

### Task 9.1: `projects/project02/infra/modules/scheduler/`

**Files:**

- Create: `projects/project02/infra/modules/scheduler/main.tf`, `variables.tf`, `outputs.tf`, `README.md`
- Create: `projects/project02/infra/modules/scheduler/lambda/spindown.js` (Lambda source)

**Resources:**

- `aws_lambda_function.spindown` — Node 20 runtime; calls `aws rds stop-db-instance`.
- `aws_iam_role.spindown_exec` — least privilege: `rds:StopDBInstance`, `cloudwatch:PutMetricData`.
- `aws_cloudwatch_event_rule.spindown_schedule` — `cron(59 5 * * ? *)` (23:59 CST → 05:59 UTC).
- `aws_cloudwatch_event_target.spindown_target` — wires the rule to the Lambda.

**Checklist:**

- [ ] `terraform fmt` / `validate` clean.
- [ ] Lambda smoke-tested locally via SAM or compose-emulated invocation.

### Task 9.2: Manual override CLI

**Files:**

- Create: `tools/rds-spin.sh` — wraps `aws rds start-db-instance` and `stop-db-instance` for the dev/prod identifiers.

**Checklist:**

- [ ] Script handles missing CLI / wrong region / nonexistent DB cases.

---

## Phase 10: Live Regression Suite

> Builds on Part 03's `live_photoapp_integration.test.js` (read-only ping + users), promoting it to a full mutating lifecycle. Reuses existing utils for environment validation: `utils/smoke-test-aws --mode live` runs the 10-check pre-flight, `utils/aws-inventory` confirms TF-vs-MANUAL parity, and `utils/cred-sweep` runs in CI before any live test invocation.

### Task 10.0: Pre-flight via existing utils

- [ ] `tests/live/setup.js` calls `utils/smoke-test-aws --mode live` as a child process; bails out if any check fails.
- [ ] `tests/live/setup.js` confirms `PHOTOAPP_RUN_LIVE_TESTS=1` and that `infra/config/photoapp-config.ini` exists.
- [ ] Documented in `MetaFiles/EXPECTED-OUTCOMES.md`: live regression depends on the shared lab environment being live; collaborator must have run `terraform apply` and `utils/rebuild-db` before invoking.

### Task 10.1: Live `v1` lifecycle

**Files:**

- Modify: `server/tests/live/upload_lifecycle.test.js` (extends Part 03's `live_photoapp_integration.test.js` from read-only to full mutating flow)

**Behavior:**

- Run the same flow as the happy-path test against real AWS (configured via the live `photoapp-config.ini` from `projects/project01/client/`).
- Use the seeded `live-test-` userid + bucketkey prefix (do not collide with Gradescope-seeded fixtures `00no-labels.jpg` … `04sailing.jpg`).
- Cleanup at the end: `DELETE /v1/images` followed by S3 delete-by-prefix.
- After test completion, run `utils/validate-db` to confirm the schema is intact.

**Checklist:**

- [ ] Test passes when `PHOTOAPP_RUN_LIVE_TESTS=1`.
- [ ] Test exits with a clear error message when the env var is unset.
- [ ] Cost per run is documented in `MetaFiles/EXPECTED-OUTCOMES.md` (estimate < $0.10 per run; Rekognition is the cost driver).
- [ ] Post-test `utils/validate-db` exits 0.

### Task 10.2: Live `v2` lifecycle

**Files:**

- Modify: `server/tests/live/live_v2_lifecycle.test.js`

**Behavior:**

- Presign upload → PUT bytes via `node-fetch` → finalize → list paginated → presign download → GET bytes → delete by id.
- Asserts the same byte round-trip plus the presigned URL flow.
- Idempotency: replay finalize with the same `Idempotency-Key`; assert no duplicate row.

**Checklist:**

- [ ] Test passes; cost documented.

### Task 10.3: Live client lifecycle

**Files:**

- Modify: `client/tests/live/test_against_real.py`
- Modify: `client/tests/live/test_against_real_v2.py`

**Behavior:**

- Mirror the v1 client integration test against real AWS.
- Add a v2 variant once `photoapp.py` gains the `api_version=v2` branch.

**Checklist:**

- [ ] `pytest -m live` runs every live test; all green; cleanup verified.

---

## Phase 11: Client `api_version=v2` Branch

### Task 11.1: `photoapp.py` v2 routing

**Files:**

- Modify: `client/photoapp.py`

**Behavior:**

- When `api_version == 'v2'`, the API functions call `/v2/...` paths and use the presigned URL flows for upload + download.
- `post_image(userid, local_filename)` becomes:

```python
def post_image(userid, local_filename):
    # 1. Request presigned URL
    pre = requests.post(f"{base}/v2/images/{userid}/upload-url",
                        json={"local_filename": os.path.basename(local_filename)},
                        timeout=10)
    pre.raise_for_status()
    body = pre.json()["data"]
    # 2. PUT bytes directly to S3
    with open(local_filename, "rb") as f:
        put = requests.put(body["presignedUrl"], data=f, timeout=120)
    put.raise_for_status()
    # 3. Finalize
    fin = requests.post(f"{base}/v2/images/{userid}/finalize",
                        headers={"Idempotency-Key": str(uuid.uuid4())},
                        json={"bucketkey": body["bucketkey"], "local_filename": os.path.basename(local_filename)},
                        timeout=30)
    fin.raise_for_status()
    return fin.json()["data"]["assetid"]
```

**Checklist:**

- [ ] Failing unit + integration tests in `client/tests/integration/test_against_compose_v2.py`.
- [ ] Implement; tests green.
- [ ] Default `api_version` stays `v1` so Gradescope flow is untouched.

---

## Phase 12: Engineering-Surface Acceptance

### Task 12.1: Full system check

**Checklist:**

- [ ] All v1 tests still green (no regression).
- [ ] All v2 unit / integration / contract tests green.
- [ ] Happy-path E2E for v2 green against compose.
- [ ] Live regression (server v1, server v2, client v1, client v2) green when opted in.
- [ ] Tracing visible end-to-end (HTTP → service → repo / S3 / Rekognition) in the local OTel collector.
- [ ] Custom metrics visible in LocalStack CloudWatch (or stdout fallback).
- [ ] Dashboards + alarms `terraform plan` clean.
- [ ] Spindown Lambda smoke-tested locally; can be applied to a real account in Part 02 without code changes.

## Suggested Commit Points

- After Phase 1: `feat(observability): otel tracing live, spans across http/service/aws`.
- After Phase 2: `feat(server): mount /v2 router behind ENABLE_V2_ROUTES`.
- After Phase 3: `feat(server): idempotency-key middleware + dedupe table`.
- After Phase 4: `feat(server): /v2 presigned upload + finalize`.
- After Phase 5: `feat(server): /v2 presigned download`.
- After Phase 6: `feat(server): /v2 cursor-paginated images`.
- After Phase 7: `feat(server): /v2 rest-correct delete by assetid`.
- After Phase 8: `feat(infra): cloudwatch dashboards + alarms + app metrics`.
- After Phase 9: `feat(infra): scheduled rds spindown via eventbridge + lambda`.
- After Phase 10: `test(live): full v1 + v2 regression suite, gated`.
- After Phase 11: `feat(client): api_version=v2 branch with presigned flow`.
- After Phase 12: `chore(engineering): part 02 part 01 engineering surface acceptance`.

## Risks And Mitigations

- **Risk:** `/v2` mounts before `/v1` and shadows a parameterised path.
  - **Mitigation:** Mount order is locked in `app.js` (`/v1` first, `/v2` second). Routing tests assert `GET /v1/image/:assetid` is not absorbed by `/v2/image/:assetid` even with `ENABLE_V2_ROUTES=1`.
- **Risk:** OTel auto-instrumentation breaks `app.js` because spans intercept `req`/`res` lifecycle.
  - **Mitigation:** SDK init runs *before* `require('./app')`; foundation tests assert that disabling tracing leaves the app behaviourally identical.
- **Risk:** Idempotency dedupe table grows unbounded.
  - **Mitigation:** TTL via `expires_at`; nightly cleanup Lambda (captured in `MetaFiles/TODO.md`).
- **Risk:** Presigned URL TTL of 15 min surprises a slow client.
  - **Mitigation:** TTL is documented; client uses streaming `requests.put` so even a very large file completes well within the window. Add a config knob for TTL.
- **Risk:** CloudWatch alarm noise during local dev.
  - **Mitigation:** Alarms only fire in real AWS (Part 02). Local dev uses LocalStack CloudWatch which is non-alerting.
- **Risk:** Spindown Lambda fires while a long-running test is mid-flight.
  - **Mitigation:** Schedule is 23:59 CST; `MetaFiles/EXPECTED-OUTCOMES.md` documents the window. Live regression is a manual trigger, run during business hours.
- **Risk:** Live regression cost spikes (Rekognition on every run).
  - **Mitigation:** Regression uses the smallest fixture (`00no-labels.jpg`, single asset) for the upload path; cost is < $0.10 per run. Nightly automation (Future State CI) would run on `main` only, not on every PR.
- **Risk:** v2 routes drift from the OpenAPI spec.
  - **Mitigation:** Contract suite covers v2 with the same conformance machinery as v1.

## Footnote: Why This Surface Matters Now

Even though Part 01 only requires the spec routes, building the engineered surface alongside them pays off immediately:

1. **Part 02 (EB deployment)** consumes the Terraform modules + dashboards + alarms; doing this work after the fact would mean re-touching the same files twice.
2. **Future-State workstreams** (CI/CD, multi-tenant auth, mobile client) all depend on stable observability + idempotency + pagination contracts.
3. **Operational confidence** during the rest of the semester comes from having spans, metrics, and a live regression we trust — debugging "why is the upload slow today?" is a 5-minute question with this surface and a 5-hour question without it.
4. **Existing-asset leverage:** the dashboards plug into the same CloudWatch namespace the existing `utils/aws-inventory` already enumerates; the alarm thresholds are informed by the existing `utils/smoke-test-aws --mode live` baseline; the spindown integrates with existing `utils/rotate-passwords` / `utils/rotate-access-keys`. This workstream is the **first** Project 02 surface that meaningfully extends — rather than just consumes — the shared lab tooling. See `MetaFiles/Future-State-Ideal-Lab.md` (CloudWatch dashboards, scheduled spindown) for the ideal-state alignment.

The spec routes are the floor; this workstream is the ceiling. Anything between is a deliberate trade-off recorded in `MetaFiles/refactor-log.md`.
