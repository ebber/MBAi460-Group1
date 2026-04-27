# Andrew MVP Integration — Audit + Triage

> **Purpose:** Per-section / per-item accountability table mapping Andrew Tapple's `UI-Design-Requirements.md` (1609 lines, scope = P01+P02+P03) against our shipped Part 03 MVP. Each requirement lands in one of five buckets: ✅ implemented / ⏳ Future-State / 📋 TODO / 🚩 gap-to-triage / ❌ out-of-scope-rejected.
>
> **Source spec:** `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (Andrew Tapple, 2026-04-26, commit `1f3c067`).
>
> **Owner of this audit:** Sub-Workstream A (Outstanding Integrations) — see `plans/outstanding-integrations-sub-A-plan.md` Phase 2.
>
> **Discipline:** TDD-style claim-then-verify. For each row: claim the bucket, then verify against repo state, then commit. No "appears implemented" rows.

---

## Status

🔄 **In progress** as of 2026-04-27. Phase 2 audit underway. Will flip to ✅ when Sub-A Phase 8 closes (all 1609 lines routed; gaps triaged; Accelerators populated; Future-State docs cross-referenced).

---

## Source pointers

- **Andrew's spec (canonical):** `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines, 15 sections).
- **Our Approach doc (what we actually implemented):** `Part03/MetaFiles/Approach/01-ui-workstream.md`.
- **Our design decisions (Q1–Q10):** `Part03/MetaFiles/DesignDecisions.md`.
- **Our coordination + contracts:** `Part03/MetaFiles/Approach/00-coordination-and-contracts.md`.
- **Our shipped MVP plan + tracker:** `Part03/MetaFiles/plans/01-ui-workstream-plan.md`.
- **Existing Future-State workstream docs:** `Part03/MetaFiles/Approach/Future-State-*.md` (8 docs at audit start; may grow per Phase 4 triage).
- **Andrew's source files (raw drop, preserved):** `Part03/ClaudeDesignDrop/raw/MBAi-460/src/` (13 files: jsx + css).

---

## Bucket legend

| Symbol | Meaning |
|---|---|
| ✅ | **Implemented** — in our shipped MVP. Cross-ref names the implementing file. |
| ⏳ | **Future-State** — captured in an existing `Approach/Future-State-*.md` doc. Cross-ref names the doc + relevant section. |
| 📋 | **TODO** — captured in `Part03/MetaFiles/TODO.md` or `MBAi460-Group1/MetaFiles/TODO.md`. Cross-ref names the TODO entry. |
| 🚩 | **Gap-to-triage** — not yet in any of the above. Becomes Phase 4 input. |
| ❌ | **Out-of-scope (rejected)** — explicitly descoped. Cross-ref names the descope decision (e.g., R1 reviewer remediation; Q9/Q10 deferral). |

---

## Audit table

Audit sweep proceeds section-by-section through `UI-Design-Requirements.md`. Each major claim or specified item gets a row. Sub-section groups commit at checkpoint boundaries per Phase 2 plan structure.

| # | Source (§ / line) | Item / claim | Bucket | Cross-ref | Notes |
|---|---|---|---|---|---|
| 1 | §0 (line 14–15) | Spec scope = P01 + P02 + P03 (cross-project UI) | ⏳ | `Future-State-roadmap.md` | Our MVP scope is Part 03 only; P02 backend was the foundation; P03 (auth + chat) is Future-State |
| 2 | §1 (line 46) | Single-page web app, Claude-console styled | ✅ | `frontend/` (Vite + React 18.3 SPA), `tailwind.config.ts` (Andrew's tokens.css translated) | |
| 3 | §1 (line 46) | "MBAi 460" brand placeholder throughout | ✅ | `frontend/src/components/TopBar.tsx` (wordmark), `index.html` `<title>` | |
| 4 | §1 (line 48) | Asset-first vocabulary (photo OR document) | ✅ | Q9 in `DesignDecisions.md`; `server/schemas.js` `deriveKind()`; `frontend/src/api/types.ts` `AssetKind` | |
| 5 | §1 (line 48) | Photo class via Rekognition + document class via Textract from day one | partial: ✅ photos / ⏳ documents | Photos: `server/services/photoapp.js` Rekognition wiring (Phase 5 of 03 plan). Textract: `Future-State-documents-and-textract-workstream.md` | Q9 explicitly defers OCR; placeholder shipped on document cards |
| 6 | §1 lines 64–71 | Out-of-scope items: native mobile, SSR marketing, billing, Figma library, prod runbooks | ✅ (alignment) | n/a | Our scope matches; native mobile we may revisit (mobile artifacts in Andrew's drop). |
| 7 | §2 (glossary) | Term definitions for Asset / Rekognition / Textract / S3 / RDS / photoapp.py / Auth service / Token / Webhook chat / Zero-state / Claude console | ✅ alignment | `00-coordination-and-contracts.md` | Glossary is descriptive; our docs use the same terms |
| 8 | §3.2 principle 1 | Asset-first, not image-first | ✅ | Q9 in `DesignDecisions.md`; `frontend/src/api/types.ts` `kind: AssetKind` | |
| 9 | §3.2 principle 2 | Login is the front door — every route requires a valid token except /login and /register | ❌ | Q10 in `DesignDecisions.md` ("non-blocking auth scaffolds") | Explicitly descoped 2026-04-26 — auth is Future-State; LoginScreen + RegisterScreen are visual scaffolds only |
| 10 | §3.2 principle 3 | Latency honesty — progress visible, no silent waits, no >2s spinners without explanation | ✅ | `frontend/src/components/UploadScreen.tsx` (queue + progress), `frontend/src/components/ToastProvider.tsx` (status toasts), `frontend/src/pages/LibraryPage.tsx` (loading skeleton) | |
| 11 | §3.2 principle 4 | Quiet by default — cream background, single accent, no gratuitous animation | ✅ | `tailwind.config.ts` (cream `#F0EEE6` paper, coral `#CC785C` accent — single token); R1 descoped shadcn → custom Tailwind primitives | |
| 12 | §3.2 principle 5 | Recoverable errors — retry path, clear message, copy-to-clipboard correlation ID | partial: ✅ retry+message / 🚩 correlation ID | Toast on failure ✅ (`ToastProvider.tsx`); correlation ID copy: not present in MVP | Phase 4 triage candidate — minor polish item |
| 13 | §3.2 principle 6 | Keyboard-first — every primary action has a shortcut, discoverable via `?` help overlay | partial: ✅ tab order + focus / ⏳ shortcuts + ? overlay | Tab order + focus-visible ✅ (`Modal.tsx` focus trap, page-level focus indicators); `?` overlay + named shortcuts (⌘K palette) ⏳ in `Future-State-command-palette-workstream.md` | |
| 14 | §3.2 principle 7 | WCAG 2.1 AA as pre-launch hard gate | 🚩 | (not yet) | We ship focus indicators + landmarks + keyboard nav; no formal WCAG audit done. Phase 4 triage candidate (TODO add: "WCAG 2.1 AA audit pass before any external launch") |
| 15 | §3.3 phased boundary (lines 114–118) | Phase 1: photoapp.py direct (dev only) | ❌ | n/a | We shipped at Phase 2 boundary (Express server); never went through the Phase-1 direct-Python path. Express pivot 2026-04-26 (`DesignDecisions.md` Q1 region). |
| 16 | §3.3 | Phase 2: Node server (Express) | ✅ | `Part03/server/` (Express 5 + multer + AWS SDK v3) | |
| 17 | §3.3 | Phase 3: real auth + chat + Textract | ⏳ | `Future-State-auth-and-account-management-workstream.md`, `Future-State-chat-workstream.md`, `Future-State-documents-and-textract-workstream.md` | |
| 18 | §4.1 (Pooja: student end user) | Login <5s, upload <10s for 5MB, labels within 3s of upload | partial: ✅ upload+labels / ⏳ login | Upload + Rekognition: live demo confirmed 2026-04-27 (3 photos, labels rendered). Real login: ⏳ Future-State auth. Latency targets not formally measured. |
| 19 | §4.2 (Emanuele: note-taker) | Handwritten note OCR via Textract; copy text + download as `.txt`/`.md` | ⏳ | `Future-State-documents-and-textract-workstream.md` | All persona-specific features deferred |
| 20 | §4.3 (Staff TA: admin) | Read-only user list + asset browser with filters | ⏳ | (no Future-State doc yet) | Phase 4 triage candidate — admin views workstream may need creation |
| 21 | §4.4 (Prof. Hummel: guest reviewer) | Shared asset URL → asset detail with guest-mode banner | 🚩 | (not yet) | Phase 4 triage candidate (Future-State Sharing workstream OR descope) |
| 22 | §5.1 J1 first-time user onboarding | Visit / → /login → /register → auto-sign-in → /library empty-state CTA → upload → asset detail | partial: ✅ shape / ⏳ real auth | Routes exist and render (Q10 non-blocking); register submit toggles mockAuth. Real auth flow ⏳ |
| 23 | §5.2 J2 returning-user session | Token expired → re-login → last-viewed filter restored → inline-edit asset display name → logout from avatar menu | partial: ⏳ login flow / 🚩 inline-edit + logout in MVP | Inline display-name edit: not in MVP. Logout: not in MVP (mockAuth has no logout). Phase 4 triage candidates. |
| 24 | §5.3 J3 analyze handwritten note (Textract) | Upload .jpg scan → classify document → Textract AnalyzeDocument → side-by-side view → copy/download | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 25 | §5.4 J4 browse + search library | Gallery view → list view toggle → search by label/OCR text → date range filter → multi-select + zip download | partial: ✅ search by label + grid+list toggle / 🚩 OCR-text search + date filter + multi-select+zip | Search by label: ✅ (`searchImages` wired to `LibraryPage.tsx`). Grid+list: ✅ (`ListView.tsx`). OCR-text search: ⏳ Textract. Date range filter + multi-select-zip: 🚩 — Phase 4 triage candidates. |
| 26 | §5.5 J5 chat | Chat icon → registered participants → send/receive messages via webhook adapter | ⏳ | `Future-State-chat-workstream.md` | |
| 27 | §5.6 J6 admin audit | Staff sign-in → Admin menu item → /admin/users → user detail → CSV export | ⏳ | (Admin views — no Future-State doc; same as row 20) | |
| 28 | §6.1 architecture diagram | React SPA → Express → AWS (S3 + RDS + Rekognition + Textract) | partial: ✅ shape / ⏳ Textract | We have SPA → Express → S3+RDS+Rekognition. Textract not wired. Diagram in our `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md` (deferred-to-Erik update). |
| 29 | §6.2 rule 1 | Browser never talks directly to `photoapp.py` | ✅ | `frontend/src/api/photoappApi.ts` only hits `/api/*`; no direct boto in browser | |
| 30 | §6.2 rule 2 | Browser never holds AWS credentials | ✅ | All credentials in `projects/project01/client/photoapp-config.ini`, loaded server-side via `server/services/aws.js` | |
| 31 | §6.2 rule 3 | S3 uploads via presigned PUT URLs in Phase 3 (vs base64 in P02) | ⏳ | `Future-State-production-hardening-workstream.md` (or new) | We use multer + base64-style multipart per the P02 baseline; presigned-URL migration deferred |
| 32 | §6.2 rule 4 | Auth token in `Authentication` HTTP header (NOT `Authorization`) | ⏳ | `Future-State-auth-and-account-management-workstream.md` | When real auth lands, the header name choice gets decided then |
| 33 | §6.2 rule 5 | Textract is a UI-driven addition; UI ships with feature-flagged `POST /assets/:id/ocr` | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 34 | §6.3 known endpoints (P02+P03 surface) | GET / (status), GET /ping, GET /users (P02); POST /auth, PUT /register, DELETE /register, POST /message (P03) | partial: ✅ /api/ping / ❌ rest | Our Part 03 implements `GET /health` + `GET /api/ping` + `/api/images*` + `/api/search` (Phase 7 wired). The P02 root paths (/ /ping /users) and P03 chat/auth endpoints are not in our Part 03 scope. |
| 35 | §6.4 required endpoint: GET /assets | Listing endpoint, paginated | ✅ partial | `GET /api/images` exists; pagination not yet | Pagination: 🚩 Phase 4 triage candidate — `Future-State-production-hardening-workstream.md` likely target |
| 36 | §6.4 required endpoint: GET /assets/:id | Get one asset by id | 🚩 | n/a | We have `GET /api/images/:id/file` (binary) + `GET /api/images/:id/labels` (per-asset metadata for photos), but no per-id detail/metadata endpoint — frontend filters from list. Phase 4 triage candidate. |
| 37 | §6.4 required endpoint: POST /assets | Upload (Phase 2: base64 JSON; Phase 3: presigned URL handshake) | ✅ | `POST /api/images` (multipart via multer) | Phase-3 presigned-URL migration ⏳ (row 31) |
| 38 | §6.4 required endpoint: DELETE /assets/:id | Single-asset delete | 🚩 | n/a (only DELETE /api/images for delete-all) | Phase 4 triage candidate — single-asset delete is reasonable feature |
| 39 | §6.4 required endpoint: GET /assets/:id/download | Asset bytes / presigned GET | ✅ | `GET /api/images/:id/file` | Returns binary directly; presigned-GET migration ⏳ (paired with row 31) |
| 40 | §6.4 required endpoint: POST /assets/:id/labels | Run Rekognition on demand | ⏳ (model differs) | n/a in MVP | Our model: labels generated at upload time, stored, retrieved via `GET /api/images/:id/labels`. Andrew's spec: run-on-demand. Phase 4 triage — keep current model OR add re-run endpoint |
| 41 | §6.4 required endpoint: POST /assets/:id/ocr | Run Textract on demand | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 42 | §6.4 required endpoint: POST /users | Create user (register) | ⏳ | `Future-State-auth-and-account-management-workstream.md` | |
| 43 | §6.4 required endpoint: GET /me | Return current user from token | ⏳ | `Future-State-auth-and-account-management-workstream.md` | |
| 44 | §6.4 required endpoint: POST /logout | Invalidate token | ⏳ | `Future-State-auth-and-account-management-workstream.md` | |
| 45 | §6.4 required endpoint: GET /chat/participants | List from `chatapp.registered` | ⏳ | `Future-State-chat-workstream.md` | |
| 46 | §6.4 required endpoint: GET /chat/messages?since=… | Poll messages since timestamp | ⏳ | `Future-State-chat-workstream.md` | |

---

## Triage queue (🚩 gaps surfacing — Phase 4 input)

_(Populated as 🚩 rows are added to the audit table. Phase 4 takes this list to a ⚠️ PAUSE gate for Erik routing confirmation.)_

| # | Item | Audit row ref | Suggested routing | Rationale |
|---|---|---|---|---|
| _(empty — populated during audit)_ | | | | |

---

## Accelerators inventory (Phase 4 output)

_(Populated post-Phase-4 triage. Lists `Accelerators/ArtifactsFor<X>/` subfolders confirmed by routing + the source files copied into each.)_

| Subfolder | Target Future-State workstream | Files (copied from `raw/src/`) | Created in commit |
|---|---|---|---|
| _(empty — populated during Phase 4)_ | | | |

---

## Closeout summary (filled at Phase 8)

_(Captured at Sub-A Phase 8 close. Includes total row count, bucket distribution, Phase 4 triage outcomes, Accelerators populated, Future-State docs cross-referenced, sub-A closeout commit hash.)_

- Audit row count: __
- Bucket distribution: ✅ __ / ⏳ __ / 📋 __ / ❌ __ / 🚩 __ → triaged to TODO __ / Future-State __ / rejected __
- Accelerators subfolders: __
- Future-State docs cross-ref'd: __ / 8 (or more if new workstream docs created)
- Sub-A closeout commit: __
