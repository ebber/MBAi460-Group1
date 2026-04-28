# Part 03 — Human Test Instructions (CLI)

> **Purpose:** hand-on-keyboard ways to exercise the Part 03 Express `/api/*` backend after execution.
> **Audience:** Erik (or any human reviewer / collaborator) who wants to verify the implementation themselves.
> **Last updated:** 2026-04-27 (initial).

This guide is **backend-only**. UI E2E smoke (Phase 9 of the plan) is gated on Andrew's `frontend/dist/` landing — see `MetaFiles/Approach/01-ui-workstream.md`.

For the full implementation map, see `MetaFiles/Approach/03-api-routes.md` (source of truth) and `MetaFiles/plans/archive/03-api-routes-plan.md` (execution tracker).

## Prerequisites

- Node ≥ 24 (verified in Phase 0 install).
- `npm install` already run inside `Part03/` (verifiable via `ls node_modules`).
- `projects/project01/client/photoapp-config.ini` exists and contains `[s3]`, `[rds]`, `[s3readwrite]` sections (it does — that file holds the AWS access keys + RDS endpoint).
- Live RDS + S3 reachable (proven via the live integration tests; Tier 2 below).
- For Tier 4+: any image/document file you have on disk (a small JPEG and a small PDF are ideal).

## Tier 1 — Mocked test suite (fast; no AWS)

```bash
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
npm test
```

**Expected:** 12 suites / 71 passed + 2 skipped. The 2 skipped are the live integration tests (gated behind `PHOTOAPP_RUN_LIVE_TESTS=1`); the 71 mocked tests cover the entire `/api/*` surface end-to-end with mocked AWS+RDS.

To see test names:

```bash
npm test -- --verbose
```

## Tier 2 — Live integration tests (real AWS+RDS, opt-in, READ-ONLY)

```bash
PHOTOAPP_RUN_LIVE_TESTS=1 npm test -- live_photoapp_integration.test.js
```

**Expected:** 2/2 passed in ~1s.

Hits real S3 (`photoapp-erik-mbai460` bucket) + RDS (`photoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com`) via public endpoints. Read-only — does not mutate.

This is the cheapest way to confirm:

- AWS credentials load via `fromIni({filepath, profile: 's3readwrite'})`.
- mysql2 connects to live RDS.
- The route → service → AWS factory chain is wired correctly end-to-end.

## Tier 3 — Run the server + curl walkthrough

**Terminal A** — start the server (foreground; Ctrl+C to stop):

```bash
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03
npm start
```

You should see: `**Web service running, listening on port 8080...**`.

**Terminal B** — curl walk:

```bash
# Health (server liveness, outside /api/*)
curl -s http://localhost:8080/health | jq
# → {"status":"running"}

# /api/ping — S3 + RDS roundtrip
curl -s http://localhost:8080/api/ping | jq
# → {"message":"success","data":{"s3_object_count":N,"user_count":M}}

# /api/users — RDS query
curl -s http://localhost:8080/api/users | jq
# → 3 seeded users (p_sarkar, e_ricci, l_chen) plus any extras

# /api/images — list all images
curl -s http://localhost:8080/api/images | jq

# /api/images filtered by userid
curl -s 'http://localhost:8080/api/images?userid=80001' | jq

# /api/images/:assetid/labels — pick an assetid from /api/images first
curl -s http://localhost:8080/api/images/1001/labels | jq

# /api/search — search labels (LIKE pattern). Try a label that exists.
curl -s 'http://localhost:8080/api/search?label=animal' | jq

# /api/images/:assetid/file — native binary file response (NOT JSON)
curl -s http://localhost:8080/api/images/1001/file -o /tmp/asset.bin
file /tmp/asset.bin   # → "JPEG image data" or similar
```

If `jq` is not installed, drop the `| jq` pipe — responses are valid JSON either way.

## Tier 4 — Upload flow (mutates live state; do consciously)

Pick any image file you have. The asset will be stored in S3 + the `assets` table on live RDS.

```bash
# Multipart upload — replace path/to/image.jpg with a real file.
curl -s -X POST http://localhost:8080/api/images \
  -F userid=80001 \
  -F file=@path/to/image.jpg | jq
# → {"message":"success","data":{"assetid":N}}
```

After upload:

- `/api/images` shows the new asset with `kind: "photo"` (for image extensions: `.jpg .jpeg .png .heic .heif`) or `kind: "document"` (everything else, per `DesignDecisions.md` Q8).
- For photos: `/api/images/:assetid/labels` returns Rekognition's labels (give it a few seconds; Rekognition runs synchronously inside the upload service).
- For documents: `/api/images/:assetid/labels` returns `[]` (Rekognition is intentionally skipped per Q9; Textract OCR is Future-State).

To test the document branch:

```bash
curl -s -X POST http://localhost:8080/api/images \
  -F userid=80001 \
  -F file=@path/to/notes.pdf | jq
```

The response shape is identical (`{data: {assetid: N}}`); the difference is in the `kind` column and the (lack of) labels.

## Tier 5 — Error envelopes (verifies Phase 7 error middleware)

```bash
# Missing required query param (inline route validation)
curl -s -i 'http://localhost:8080/api/search?label=' | head -5
# → 400 + {"message":"error","error":"missing required query param: label"}

# Unknown asset → 404 (via Phase 7 error middleware mapping)
curl -s -i http://localhost:8080/api/images/99999/labels | head -5
# → 404 + {"message":"error","error":"no such assetid"}

# Unknown user upload → 400 (via Phase 7 error middleware)
curl -s -i -X POST http://localhost:8080/api/images \
  -F userid=99999 \
  -F file=@some-file.txt | head -5
# → 400 + {"message":"error","error":"no such userid"}

# Missing file field → 400 (inline route validation)
curl -s -i -X POST http://localhost:8080/api/images -F userid=80001 | head -5
# → 400 + {"message":"error","error":"missing file"}

# Non-int assetid → 400 (inline route validation)
curl -s -i http://localhost:8080/api/images/abc/labels | head -5
# → 400 + {"message":"error","error":"invalid assetid"}
```

## Tier 6 — Destructive: clear everything

⚠️ **This actually deletes every asset from S3 + every row from the `assets` and `labels` tables.** Don't run unless that's the intent.

```bash
curl -s -X DELETE http://localhost:8080/api/images | jq
# → {"message":"success","data":{"deleted":true}}
```

After:

- `/api/images` returns `[]`.
- `/api/ping` shows `s3_object_count: 0`.

The implementation guarantees DB-first ordering: `DELETE FROM labels` → `DELETE FROM assets` → S3 `DeleteObjects`. If the DB delete fails, S3 is not touched (verified by unit test in `photoapp_service.test.js`).

## Tier 7 — Browser

Open `http://localhost:8080/` — placeholder index from Server Foundation 02 (Andrew's UI build will overwrite this).

Direct API calls in the browser:

- http://localhost:8080/api/ping
- http://localhost:8080/api/users
- http://localhost:8080/api/images

The browser renders raw JSON unless you have a JSON-pretty-printer extension; for pretty output, prefer the Tier 3 curl + `jq` flow.

## Quick-smoke (single fast verify)

If you want a one-shot smoke that exercises the meaningful subset:

```bash
# Terminal A:
cd ~/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03 && npm start

# Terminal B:
curl -s http://localhost:8080/api/ping | jq && \
  curl -s http://localhost:8080/api/users | jq && \
  curl -s 'http://localhost:8080/api/search?label=' -i | head -3
```

That hits S3+RDS through the live server, reads the seeded users, and verifies the error envelope path in one shot.

## Troubleshooting

- **`/api/ping` returns 500** — likely an AWS credentials issue. Check `projects/project01/client/photoapp-config.ini` has `[s3readwrite]` with valid `aws_access_key_id` / `aws_secret_access_key`. Resolution path is `fromIni({filepath: '../client/photoapp-config.ini', profile: 's3readwrite'})`.
- **`/api/users` returns 500** — likely an RDS connection issue. Verify the `[rds]` section in `photoapp-config.ini` has the right endpoint, port, and `photoapp-read-write` user credentials. The RDS endpoint must be reachable from your network.
- **`npm start` fails on port 8080** — another process is bound to 8080. Kill it (`lsof -ti:8080 | xargs kill`) or change `web_service_port` in `server/config.js`.
- **`POST /api/images` returns 500 (live)** — multer wrote a temp file but the upload service couldn't read or upload it. Check disk space in `os.tmpdir()/photoapp-uploads/` and S3 bucket permissions for the `s3readwrite` profile.

## Related docs

- `MetaFiles/plans/archive/03-api-routes-plan.md` — execution plan + state tracker.
- `MetaFiles/Approach/03-api-routes.md` — source-of-truth approach (per-route specs, behavior, edge cases).
- `MetaFiles/Approach/00-coordination-and-contracts.md` — API contract + envelope shapes.
- `MetaFiles/DesignDecisions.md` — Q1–Q10 (Q8 = `kind` derivation, Q9 = documents accepted / Textract deferred).
- `MetaFiles/refactor-log.md` — chronological record of decisions.
- `MetaFiles/install-log.md` — npm install history.
