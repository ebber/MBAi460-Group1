# Future-State Workstream — Documents + Textract

**Status:** Aspirational. **Not committed to Part 03.** New AWS service (Textract) is out of the assignment scope; ships as a follow-on phase.
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §9.6, §9.7, §13.6 + `screens.jsx` UploadScreen's OCR-mode picker.

---

## Goal

**Document upload is already in Part 03** (per Q9 — multer accepts any file; non-image files land in S3 + DB with `kind='document'`; no OCR yet). This workstream **adds the OCR pipeline** for those existing document rows: **Textract OCR** to extract text + form structure; an asset-detail document view that shows the OCR text alongside the file; an upload flow that triggers OCR mode selection at upload time (text vs. forms); and the supporting AWS service + IAM + schema additions.

The schema starts in good shape: `kind ENUM('photo','document')` lands in Part 03 (Q8). This workstream **adds OCR-specific columns** (`textract_status`, `textract_text`, etc.) without touching `kind`. Existing document rows from Part 03 can be retroactively OCR'd through the new endpoint.

## Scope

**In scope (when this workstream lands):**

- New AWS service: **Textract** (us-east-2 — same region as Rekognition).
- New backend endpoints:
  - `POST /api/images/:id/ocr` body `{ mode: "text" | "forms" }` — triggers Textract on the asset's S3 object, persists results.
  - `GET /api/images/:id/ocr-status` — polls async Textract job status (for multi-page docs via `StartDocumentTextDetection`).
- New backend service module: `server/services/textract.js` — wraps `@aws-sdk/client-textract` calls (`DetectDocumentText` + `AnalyzeDocument`).
- Schema additions to `assets`:
  - `textract_status ENUM('none','pending','done','error') NOT NULL DEFAULT 'none'`
  - `textract_text MEDIUMTEXT` (flattened OCR text, for search indexing)
  - `textract_key VARCHAR` (S3 path to full Textract JSON response)
  - `ocr_mode ENUM('text','forms') NULL` (which Textract API was used)
  - `ocr_confidence FLOAT NULL` (avg block confidence)
- S3 layout for OCR artifacts:
  - `s3://photoapp-erik-mbai460/ocr/<bucketkey>.textract.json` (full Textract response)
  - `s3://photoapp-erik-mbai460/ocr/<bucketkey>.textract.txt` (flattened text)
- IAM perms: add `textract:DetectDocumentText`, `textract:AnalyzeDocument`, `textract:StartDocumentTextDetection`, `textract:GetDocumentTextDetection` to the `Claude-Conjurer` policy (or a scoped service role).
- **UI: Asset Detail (Document) — full split-pane view** — Andrew's design (image left, OCR text right, with synchronized highlighting of bounding boxes). Replaces the Part 03 "OCR coming soon" placeholder with real Textract output.
- **UI: Upload — OCR mode picker** — Andrew's `UploadScreen` "OCR mode: text / forms" radio (the `Classify as: photo / document` radio is already a UX hint in Part 03, but does nothing server-side; this workstream wires both).
- Cost guards: per-user OCR rate limit (default 20/hour); per-asset re-run cap (3/day) — surfaced as friendly errors per spec §13.6.
- Library updates document-card render: replace "OCR coming soon" placeholder with the OCR excerpt (when `textract_status='done'`); show progress state when `pending`; show error state when `error`.
- Search extends to OCR text across documents (`WHERE labels.label LIKE ? OR assets.textract_text LIKE ?`). Part 03 search is labels-only.
- Backfill path: an admin-only endpoint or migration that walks existing `kind='document'` rows from Part 03 and triggers OCR — captures rows uploaded before Textract was provisioned.

**Out of scope (still — even at this workstream):**

- Document upload through email attachments / Slack integration / etc.
- Multi-language OCR (Textract supports it; v1 is English).
- Form-data extraction beyond the spec's "key-value pairs" model — table extraction is in scope, complex layout parsing is not.
- Real-time OCR (everything is async-via-polling for >1 page; for single-page sync calls).

## Dependencies

**Workstream-blocking:**

- Terraform IAM updates: add Textract perms to `Claude-Conjurer` (or new service role).
- Schema migration: forward-only ALTER TABLE on `photoapp.assets`.
- Cost-monitoring decision: Textract is **not free-tier** — confirm budget alarm is wired (`Lab Budget` $300/mo + `dont do shit` $0.01 tripwire are already in place; capture Textract cost as a tracked budget category).

**Non-blocking:**

- S3 lifecycle policy on `ocr/` prefix (auto-archive Textract JSON after N days?).
- CloudWatch alarms on Textract API errors.

## Implementation phases (sketch)

### Phase A — Infra: IAM + Terraform

- Add `textract:DetectDocumentText`, `textract:AnalyzeDocument`, `textract:StartDocumentTextDetection`, `textract:GetDocumentTextDetection` to the Terraform-managed policy.
- `terraform plan` → review → `terraform apply` per `feedback_terraform_plan_workflow.md`.
- Smoke: `aws textract detect-document-text` with a simple test image from CLI confirms IAM.

### Phase B — Schema migration

- Forward-only ALTER on `photoapp.assets` adding the 5 new columns.
- Backfill: existing rows get `textract_status = 'none'`; the trigger or upload flow populates new rows.
- Update `MBAi460-Group1/utils/validate-db` to assert the new columns exist.

### Phase C — Backend service module

- New: `server/services/textract.js` — `runOcr(bucketkey, mode) → { textract_text, textract_key, ocr_confidence }`.
- For single-page docs: synchronous call to `DetectDocumentText` or `AnalyzeDocument`.
- For multi-page docs (>10 pages? configurable threshold): async path via `StartDocumentTextDetection`; UI polls `GET /api/images/:id/ocr-status`.
- Cleanup: write JSON + flattened text to S3 `ocr/<bucketkey>.{json,txt}`.

### Phase D — Backend route + UI wire-up

- `POST /api/images/:id/ocr` — calls service module; returns `{ textract_text, ocr_confidence }` (sync) or `{ job_id }` (async).
- `GET /api/images/:id/ocr-status?job_id=<>` — polls job; returns same shape on completion.
- UI: migrate Andrew's Asset Detail (Document) split-pane from spec §9.6.
- UI: migrate Upload's document classification + OCR mode radios from `screens.jsx` lines 60–82.

### Phase E — Search extension

- Update `GET /api/search?q=<>` to include `WHERE textract_text LIKE ?` clause.
- UI: command palette includes OCR-text matches (already implemented — Andrew's `CommandPalette` searches `a.ocr_excerpt` already).

### Phase F — Cost guards + acceptance

- Express middleware: per-user OCR rate-limit counter (Redis or in-memory if low scale).
- Per-asset re-run cap enforced in service module.
- Acceptance smoke: upload `lecture-notes-w4.jpg` → OCR runs → text panel populates → confidence shown.

## Risks and Mitigations

- **Risk:** Textract cost surprises. Documents are charged per page; a multi-page PDF can balloon the bill.
  - **Mitigation:** rate limits + per-asset caps in Phase F. Surface estimated cost at upload time ("This is a 12-page PDF; estimated $0.18").
- **Risk:** Async polling story is complex (job_id round-trip; UX must not hang indefinitely).
  - **Mitigation:** spec §9.6 acceptance D2 — for handwritten notes ~300 words, OCR returns in <30s; otherwise UI shows a backgrounded state and continues to poll. Build the polling UX from day one.
- **Risk:** Handwriting OCR confidence is variable (~74% on wobbly cursive per Andrew's mock data).
  - **Mitigation:** UI surfaces low-confidence lines with subtle orange underline (per spec §9.6 layout); user can re-run OCR or hand-correct.
- **Risk:** Textract JSON responses can be large (multi-MB for multi-page); storing in S3 adds latency.
  - **Mitigation:** S3 lifecycle policy archives older JSONs; flattened text in DB stays the search target.
- **Risk:** Bounding-box highlighting (text panel ↔ image panel sync) is complex UI.
  - **Mitigation:** v1 of this workstream can ship without bounding-box sync; tag the sync as a v2 polish task.

## Extension — AI on-demand model (added 2026-04-27 per sub-A audit T6)

Beyond Textract OCR, our shipped MVP's AI model differs from Andrew's spec in a few ways that this workstream may want to reconcile:

1. **Run-on-demand vs. run-at-upload.** Our shipped MVP auto-runs Rekognition labels at upload time and exposes them via `GET /api/images/:id/labels`. Andrew specs `POST /api/images/:id/labels` — i.e., trigger labels analysis on demand. Trade-off: our model is simpler + cheaper (no re-runs); Andrew's allows re-analysis without re-upload + matches the Textract on-demand pattern. **Recommendation:** keep auto-on-upload as the default; add a manual re-run endpoint for users to refresh stale results.
2. **Manual re-run analysis.** Per spec FR-AI-6 (SHOULD): expose a "Re-analyze" button on Asset Detail. Server handles idempotency + cost guards. Required for the on-demand model + useful even with auto-on-upload (e.g., if Rekognition confidence improves over time).
3. **Client-side cache for labels + OCR within session.** Per spec FR-AI-7 (SHOULD): cache results so navigating back to a previously-viewed asset doesn't re-fetch. TanStack Query (Future-State Production-Hardening §8.5) provides this naturally; depends on adopting that library.
4. **DetectText fallback for ambiguous content-type classification.** Per spec FR-AI-1: when content-type alone is ambiguous, send the first 10KB to Rekognition `DetectText` as a cheap classification check; high text density → classify as document. Currently `deriveKind()` uses content-type only. Recommendation: defer until Textract lands (DetectText is cheap but adds latency to every upload; only worth it when document handling matters).

These items collectively constitute a "AI on-demand model" sub-stream within the broader Documents + Textract workstream — the patterns mirror Textract's design (POST-trigger + idempotent re-runs).

**Audit cross-refs:** rows 40 (POST /assets/:id/labels run-on-demand), 70 (DetectText fallback), 91 (FR-AI-1), 92 (FR-AI-2), 96 (FR-AI-6 manual re-run), 97 (FR-AI-7 client cache).

---

## Source / cross-refs

- Andrew's `UI-Design-Requirements.md`: §9.6 (asset detail — document split-pane), §9.7 (upload classification + OCR mode), §13.6 (Textract integration: API choices, async path, S3 layout, cost guards), §14.1 (95% OCR success target on supported types), §10.3 FR-AI-1..8 (AI requirements including the on-demand model items above)
- `ClaudeDesignDrop/raw/MBAi-460/src/screens.jsx` lines 6–119 (UploadScreen with OCR-mode picker) — also at `Part03/Accelerators/ArtifactsForFormLibrary/screens.jsx` for the Form Library workstream
- `ClaudeDesignDrop/raw/MBAi-460/src/data.jsx` (mock document assets with `ocr_excerpt`, `ocr_status`, `ocr_mode`, `ocr_conf`, `ocr_words`, `ocr_lines` — example shape for the schema)
- `MetaFiles/DesignDecisions.md` Q9 (Textract scope decision) — proposed in `DesignDecisions.md`
- `MetaFiles/Andrew-MVP-Integration.md` rows 40, 70, 91-97 (audit detail for on-demand AI items)
- AWS docs: [Textract DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html), [AnalyzeDocument](https://docs.aws.amazon.com/textract/latest/dg/API_AnalyzeDocument.html), [StartDocumentTextDetection](https://docs.aws.amazon.com/textract/latest/dg/API_StartDocumentTextDetection.html)
