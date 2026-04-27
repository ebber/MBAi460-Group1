# Contract Audit — Frontend ↔ Backend ↔ Approach-Doc

> **Purpose:** Drift detection across the contract surface that holds the Part 03 MVP together. Verifies that the four files claiming truth about the `/api/*` contract agree.
> **Owner:** Sub-Workstream B (Outstanding Integrations) — see `plans/outstanding-integrations-sub-B-plan.md`.
> **Discipline:** TDD-style claim-then-verify. Each row asserts an alignment claim, then verifies against file content.

---

## Status

🔄 **In progress** as of 2026-04-27. **Step 3 audit complete (this file)**; remediation plan + execute + re-validate to follow per the 12-step Frame.

Will flip to ✅ when sub-B Plan Phase 4 (re-audit + validation) closes — drift resolved; re-audit shows zero 🚩; tests stay green. See `plans/outstanding-integrations-sub-B-plan.md` for the Plan-phase-numbered tracker (Plan has 7 phases 0-6; the broader 12-step Frame contains the Plan as Steps 4-11 of the Frame).

---

## Audit scope

Per Map sub-B + Q-B-6 extension (2026-04-27 — Erik approved scope expansion to caller + handler):

| File | Role | Lines |
|---|---|---|
| `Part03/frontend/src/api/types.ts` | TypeScript interfaces consumed by the React app | 46 |
| `Part03/server/schemas.js` | Backend envelope helpers + row converters + `deriveKind()` | 77 |
| `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` | Contract spec (canonical) | 643 |
| `Part03/frontend/src/api/photoappApi.ts` (Q-B-6 extension) | Typed fetch wrappers calling `/api/*` | 57 |
| `Part03/server/routes/photoapp_routes.js` (Q-B-6 extension) | Express handlers serving `/api/*` | 119 |

**Out of scope:** the service layer (`server/services/photoapp.js`), backend tests (`server/tests/*.test.js`), frontend tests (`frontend/src/__tests__/*`). These would all be downstream of the contract; their audit is a separate concern.

---

## Bucket legend

| Symbol | Meaning |
|---|---|
| ✅ | **Aligned** — the contract item agrees across all owning files |
| 🚩 | **Drift** — owning files disagree; remediation needed |
| ⏳ | **Documented gap** — intentional non-coverage in one or more files (not drift) |

---

## Audit table

### Envelope shapes

| # | Contract item | types.ts | schemas.js | 00-coord | photoappApi.ts | photoapp_routes.js | Bucket |
|---|---|---|---|---|---|---|---|
| 1 | Success envelope `{ message:'success', data:<T> }` | ApiSuccess<T> ✅ | successResponse(data) ✅ | §Error Contract + every route ✅ | unwrap checks `body.message === 'success'` ✅ | uses successResponse() in every route ✅ | ✅ |
| 2 | Error envelope `{ message:'error', error:string }` | ApiError ✅ | errorResponse(err) ✅ | §Error Contract line 466-471 ✅ | unwrap throws `new Error(body.error)` ✅ | uses errorResponse() in inline 400s ✅ | ✅ |

### Domain object shapes

| # | Contract item | types.ts | schemas.js | 00-coord | Bucket |
|---|---|---|---|---|---|
| 3 | User shape `{ userid, username, givenname, familyname }` | User ✅ | userRowToObject() ✅ | §GET /api/users line 228-232 ✅ | ✅ |
| 4 | Asset shape `{ assetid, userid, localname, bucketkey, kind }` | Asset ✅ | imageRowToObject() ✅ | §GET /api/images prose (line 279) ✅; example block 1 (line 263-273) MISSING `kind`; example block 2 (line 282-297) ✅ includes `kind` | 🚩 **DRIFT — see Drift Finding #1** |
| 5 | Label shape `{ label, confidence }` | Label ✅ | labelRowToObject() ✅ | §GET /api/images/:id/labels line 384-388 ✅ | ✅ |
| 6 | SearchHit shape `{ assetid, label, confidence }` | SearchHit ✅ | searchRowToObject() ✅ | §GET /api/search line 416-419 ✅ | ✅ |
| 7 | PingData shape `{ s3_object_count, user_count }` | PingData ✅ | (no row converter — ping is service-assembled) ⏳ | §GET /api/ping line 195-196 ✅ | ⏳ — schemas.js absence is intentional (not a row-converter use case) |

### Type values + classification

| # | Contract item | types.ts | schemas.js | 00-coord | Bucket |
|---|---|---|---|---|---|
| 8 | AssetKind values `'photo' \| 'document'` | AssetKind ✅ | deriveKind() returns `'photo'` or `'document'` ✅ | §GET /api/images line 279 ✅ | ✅ |
| 9 | Photo extension list `.jpg/.jpeg/.png/.heic/.heif` | n/a (runtime classification) | PHOTO_EXTENSIONS ✅ | §GET /api/images implementation note line 279 ✅ | ✅ |

### Per-route success shapes

| # | Route + contract success shape | Documented in 00-coord | Wrapped in photoappApi.ts | Implemented in photoapp_routes.js | Bucket |
|---|---|---|---|---|---|
| 10 | `GET /api/ping` → enveloped PingData | line 191-198 ✅ | getPing(): Promise<PingData> ✅ | router.get('/ping', ...) ✅ | ✅ |
| 11 | `GET /api/users` → enveloped User[] | line 222-235 ✅ | getUsers(): Promise<User[]> ✅ | router.get('/users', ...) ✅ | ✅ |
| 12 | `GET /api/images` (optional `?userid=`) → enveloped Asset[] | line 259-297 ✅ (with drift #1) | getImages(userid?): Promise<Asset[]> ✅; constructs `?userid=` query ✅ | router.get('/images', ...) ✅; parses `req.query.userid` to int + 400 if NaN | (covered by drift #1; impl side ✅) |
| 13 | `POST /api/images` → enveloped `{ assetid }` (multipart upload) | line 318-325 ✅; multipart fields userid + file documented line 312-314 ✅ | uploadImage(userid, file): Promise<{ assetid }>; FormData with userid + file ✅ | router.post('/images', upload.single('file'), ...); validates userid int + req.file presence with inline 400s ✅ | ✅ |
| 14 | `GET /api/images/:assetid/file` → binary stream + Content-Type | line 356-360 ✅ | getImageFileUrl(assetid): string (URL builder, not fetch) ✅ | router.get('/images/:assetid/file', ...); validates assetid int + 400 inline; sets Content-Type + pipes S3 body ✅ | ✅ |
| 15 | `GET /api/images/:assetid/labels` → enveloped Label[] | line 381-391 ✅ | getImageLabels(assetid): Promise<Label[]> ✅ | router.get('/images/:assetid/labels', ...); validates assetid int + 400 inline ✅ | ✅ |
| 16 | `GET /api/search?label=...` → enveloped SearchHit[]; empty-search → 400 always | line 411-422 ✅; empty-search 400 documented line 427 ✅ | searchImages(label): Promise<SearchHit[]> ✅ | router.get('/search', ...); validates `req.query.label` non-empty string + returns 400 inline 'missing required query param: label' ✅ | ✅ |
| 17 | `DELETE /api/images` → enveloped `{ deleted: true }` | line 442-448 ✅ | deleteAllImages(): Promise<{ deleted: boolean }> — **type permits any boolean** but contract specifies literal `true` | router.delete('/images', ...); calls deleteAll(); wraps in successResponse ✅ | ⏳ — type-precision matter (type permits boolean; contract specifies `true` literal); not implementation drift |

### Cross-cutting contract claims

| # | Contract item | Owner files | Bucket |
|---|---|---|---|
| 18 | Status codes `200/400/404/500/503` documented | 00-coord §Error Contract line 473-479 ✅; backend route handlers use 400 inline; service-thrown errors → error middleware (per Phase 7 of 03 plan) | ✅ |
| 19 | bucketkey convention `<username>/<uuid>-<localname>` (Part 2 convention) | 00-coord §GET /api/images line 278 + §POST /api/images line 339 ✅; verified live via CLI smoke (Phase 8.1 sub-A) | ✅ |
| 20 | 8 routes total (GET ping, users, images, images/:id/file, images/:id/labels, search; POST images; DELETE images) | 00-coord §API Contract ✅; photoappApi.ts wraps all 8 ✅; photoapp_routes.js mounts all 8 ✅ | ✅ |
| 21 | Multer 50 MB limit + no MIME filter (Q9 — accept all file types) | 00-coord §POST /api/images line 280 ✅; photoapp_routes.js uses `upload.single('file')` from `middleware/upload.js` (which enforces 50MB per Phase 4 of 03 plan) ✅ | ✅ |
| 22 | Empty-search → 400 ALWAYS at route boundary | 00-coord §GET /api/search implementation note line 427 ✅; photoapp_routes.js validates `raw.trim()` non-empty + returns 400 inline ✅ | ✅ |
| 23 | All file types accepted (Q9 — Textract OCR for documents Future-State) | 00-coord §GET /api/images line 280 ✅; deriveKind() classifies non-photo as document; document uploads skip Rekognition per route impl note line 341 ✅ | ✅ |

### Adjacent observations (out of strict drift scope but noted)

| # | Observation | Detail |
|---|---|---|
| A | photoappApi.ts `unwrap` is the single point of envelope handling | All 8 wrappers (except `getImageFileUrl` which builds a URL) flow through `unwrap<T>(res)`. This is good — if the envelope shape changes, only `unwrap` needs updating. No drift; just defensive design. |
| B | photoapp_routes.js validates inputs inline before calling service | Non-int userid/assetid + missing file/label all return 400 inline via `errorResponse()` — never reach the service layer. This matches the contract's status-code guidance (400 for invalid input). |
| C | photoapp_routes.js wires stream errors into error middleware | `s3Result.Body.on('error', next)` before `.pipe(res)` — matches the §GET /api/images/:id/file implementation note about streaming failures. |
| D | photoappApi.ts `getImageFileUrl` returns a string, not a Promise | Unlike other wrappers, this one is synchronous (URL builder). Used as image `src` per 00-coord §GET /api/images/:id/file UI behavior note. Aligned by design. |
| E | photoappApi.ts `deleteAllImages` return type wider than contract | Contract: `{ deleted: true }`; type: `Promise<{ deleted: boolean }>`. Type permits a wider universe than the contract specifies. **Possible tightening: `Promise<{ deleted: true }>`** — minor TypeScript type-precision improvement; not a true drift. Optional remediation. |

---

## Drift findings (canonical)

### 🚩 Drift Finding #1 — Stale example block in `00-coord §GET /api/images`

**Location:** `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` lines 263-273.

**Problem:** The first example response block under `### GET /api/images` shows an Asset row WITHOUT the `kind` field:

```json
{
  "message": "success",
  "data": [
    {
      "assetid": 1001,
      "userid": 80001,
      "localname": "01degu.jpg",
      "bucketkey": "p_sarkar/uuid-01degu.jpg"
    }
  ]
}
```

A second example block at lines 282-297 includes `kind` correctly. The intervening prose at line 279 documents `kind` as part of every asset row. The first example is **stale** — predates the Q8 introduction of `kind`.

**Impact:** doc-internal redundancy + potential confusion for cold readers (they may see the first example and assume `kind` is optional). Not a runtime impact — types.ts + schemas.js + the implementation all correctly include `kind`.

**Remediation:** delete the first stale example block (lines 263-273) AND its surrounding prose `Success response:` header, OR replace it with the second canonical example. Either keeps the route documentation clear with one canonical Asset shape.

**Recommended fix:** delete the stale block + its preamble; keep the canonical example with `kind` as the single response shape. The "Example response with `kind`:" header on the second block becomes redundant — relabel as plain "Success response:" + remove "with kind:" suffix.

### ⏳ Note — `deleteAllImages` type precision

**Location:** `Part03/frontend/src/api/photoappApi.ts` line 54.

**Detail:** `deleteAllImages(): Promise<{ deleted: boolean }>` — type permits any boolean; contract specifies `true` literal.

**This is NOT a drift** (the implementation always returns `true`; the type just permits a wider universe). Optional precision improvement: change to `Promise<{ deleted: true }>`. Surface as a minor remediation; defer to your call.

---

## Bucket distribution

| Bucket | Count | % |
|---|---|---|
| ✅ Aligned | 21 / 23 | 91% |
| 🚩 Drift | 1 / 23 | 4% |
| ⏳ Documented gap | 1 / 23 | 4% |

Plus 5 adjacent observations (A–E above) — informational, not bucketed.

**Overall verdict: contract surface is remarkably tight.** Sub-B's expected high-volume drift didn't materialize — the disciplined Q-driven design + atomic-commit gates during 03 plan execution + sub-A's audit-as-cleanup all paid off. Single drift finding is doc-internal redundancy with no runtime impact.

---

## Closeout summary (filled at sub-B Plan Phase 4-5 — re-audit + closeout)

_(Captured at validation step.)_

- Audit row count: 23 contract items + 5 adjacent observations
- Drift findings (canonical): 1 (Drift #1 — stale example block in 00-coord)
- Type-precision note (optional): 1 (deleteAllImages return type)
- Remediation commits: __
- Re-audit (Plan Phase 4) status: __
- Sub-B closeout commit: __
