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
| 47 | §9.1 Login layout | Wordmark serif 40px + "Cloud PhotoApp" subhead + AuthCard with username/password/duration fields | partial: ✅ structure / ⏳ duration field | `frontend/src/components/LoginScreen.tsx` (Phase 5+6 Calibration #4) — wordmark + sign-in card present; duration field not in MVP (Q10 non-blocking simplification) | |
| 48 | §9.1 Login data flow | POST /auth → token in memory + session-storage refresh flag | ⏳ | `Future-State-auth-and-account-management-workstream.md` | mockAuth in Zustand store toggles instead; no real auth fetch |
| 49 | §9.1 Login states | Default (button disabled until inputs); Submitting (locked); Error (inline red banner); Locked out (5+ failures countdown) | partial: ✅ default+submitting / 🚩 error+lockout | LoginScreen has visual states but no rate-limit logic. Phase 4 triage (probably Future-State auth covers this when real auth lands) |
| 50 | §9.1 Login interactions | Enter on password submits; tab order username→password→duration→sign in→register; autocomplete attrs; password show/hide toggle | partial: ✅ tab/enter / 🚩 password show-hide / 🚩 autocomplete attrs | Phase 4 triage candidate — minor polish items |
| 51 | §9.1 Acceptance L1–L5 | L1 token → /library <2s; L2 invalid creds stay; L3 duration 1–1440 client-side; L4 axe zero violations; L5 Sign in reachable in ≤3 tabs | partial: ⏳ auth flow / 🚩 axe formal audit | Q10 makes L1–L3 N/A in MVP. L4 axe audit is the WCAG concern (row 14). L5 keyboard reachability ✅ in shipped LoginScreen |
| 52 | §9.2 Register layout + data | Single-card form (username/pw/confirm/given/family/agree-to-terms); POST /users → bcrypt + transaction → token | ⏳ | `Future-State-auth-and-account-management-workstream.md` + Q10 | |
| 53 | §9.2 Register acceptance R1–R3 | R1 username uniqueness server-enforced; R2 password rules live checklist; R3 auto-sign-in to /library | ⏳ | `Future-State-auth-and-account-management-workstream.md` | |
| 54 | §9.3 Forgot password placeholder | "Forgot password?" link → modal explaining unavailability + contact staff | 🚩 | n/a | Phase 4 triage candidate; ties to Future-State auth |
| 55 | §9.4 Library TopBar | Wordmark + ⌘K command-palette search + notification bell + avatar | partial: ✅ wordmark / ⏳ ⌘K + 🚩 notification bell + 🚩 avatar menu | `frontend/src/components/TopBar.tsx` (MVP-trimmed for shipped MVP per Phase 3 plan); ⌘K → `Future-State-command-palette-workstream.md`; notification + avatar → 🚩 Phase 4 triage (likely Future-State auth/notifications) |
| 56 | §9.4 Library LeftRail | Icons: 🖼 Library / ⬆ Upload / 💬 Chat / ⚙ Admin / ❔ Help | partial: ✅ Library+Upload+Help / ⏳ Chat / ⏳ Admin | `frontend/src/components/LeftRail.tsx` has Library + Upload + Profile + Help + status indicator; Chat/Admin items absent (Future-State) |
| 57 | §9.4 Library controls | Upload button + Select (multi-select) + Filter bar (type/date/labels) + Grid/List toggle + Sort: Newest ▾ | partial: ✅ Upload+Grid/List / 🚩 Select+Filter bar+Sort | Multi-select + filter bar + sort: Phase 4 triage (likely Future-State production-hardening) |
| 58 | §9.4 Library data shape | GET /assets paginated with cursor + type/from/to filters; per-asset: thumbnail (signed) / localname / assetid / bucketkey / type / labels[≤3] / ocr_excerpt | partial: ✅ basic shape / 🚩 cursor pagination + signed thumbnail URLs + ocr_excerpt | `GET /api/images` returns assets w/o pagination; thumbnails served via `/api/images/:id/file` (no signed URL); ocr_excerpt ⏳ Textract. Phase 4 triage. |
| 59 | §9.4 Library states | Loading (12 skeletons); Empty (illustration + CTA); Error (banner + retry); Partial (loaded pages + retry banner) | partial: ✅ loading + empty / 🚩 partial-failure handling | `LibraryPage.tsx` shipped with skeleton + empty state; partial-failure flow not in MVP |
| 60 | §9.4 Library interactions | Click → /asset/:id; shift-click → batch actions (zip/delete/move); ⌘K global search; / inline search focus; "u" key opens upload modal; right-click context menu (rename/delete/copy link) | partial: ✅ click→detail / 🚩 shift-click + keyboard shortcuts + right-click | Most are Future-State (command palette + advanced library workstream). Click-through to AssetDetail ✅ |
| 61 | §9.4 Acceptance LIB1–LIB3 | LIB1 first paint <2s; LIB2 grid responsive (2/3/4/5 cols at breakpoints); LIB3 ≤3 labels with "+N" pill | ✅ | Phase 8.1 acceptance items per `Human-Feature-Test-Suite.md`; LIB2 + LIB3 specifically validated in design | |
| 62 | §9.5 Asset detail photo layout | Two-pane: image left + labels (confidence-DESC) + metadata (uploaded/type/size/bucket/key/asset id) + actions (Download/Re-analyze/Delete) right | partial: ✅ structure + labels-DESC / 🚩 full metadata + Re-analyze + per-asset Delete | `AssetDetailPage.tsx` + `AssetDetail.tsx` shipped with image + labels-DESC. Metadata partial (we show some fields, not all); Re-analyze/Delete: 🚩 Phase 4 triage |
| 63 | §9.5 Asset detail data | GET /assets/:id (metadata + labels); GET /assets/:id/download; POST /assets/:id/labels (re-run); DELETE /assets/:id | partial: ✅ download / 🚩 metadata endpoint + re-run + per-id delete | Per-id endpoints: see rows 36/38/40 |
| 64 | §9.5 States | Loading labels shimmer with "Analyzing…"; No-labels-yet "Analyze now"; Deletion confirm modal with type-the-name | partial: ✅ delete-all type-name / 🚩 per-asset variants | We have type-the-name modal for delete-all (`DeleteAllConfirm.tsx`); per-asset analyze + delete: 🚩 |
| 65 | §9.5 Acceptance A1–A3 | A1 cross-user 404 (not 403); A2 re-analyze idempotent + toast refresh; A3 download streamed up to 50 MB | partial: 🚩 cross-user 404 + 🚩 re-analyze / ✅ download | A1 (cross-user): ⏳ Future-State auth (no multi-user in MVP). A2: 🚩 Phase 4. A3: ✅ (50 MB enforced server-side) |
| 66 | §9.6 Asset detail document | Split view (scan left + extracted text right); synchronized highlighting between word + bounding box; Copy / Download .md | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 67 | §9.6 Textract call model | textract:AnalyzeDocument FEATURES=FORMS for forms; DetectDocumentText for handwriting/typed; us-east-2 region; user picks via Upload screen "Just text" vs "Forms+tables" | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 68 | §9.6 Acceptance D1–D3 | D1 OCR <500ms start + progress; D2 typical <30s + backgrounded for longer; D3 copy whole/paragraph + Clipboard API + toast | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 69 | §9.7 Upload layout | Drop zone (large central) with accepted types (.jpg .png .pdf .heic) + max 50 MB + classify-as picker (Photo/Document/Auto-detect) + OCR options + Queue with progress | partial: ✅ drop zone + 50 MB + auto-detect / 🚩 explicit class picker / ⏳ OCR options | `UploadScreen.tsx` shipped with drop zone + auto-classify by content-type; explicit classify picker: 🚩; OCR options: ⏳ |
| 70 | §9.7 Upload data + auto-classify model | POST /assets (Phase 2 base64; Phase 3 presigned PUT); after upload POST /assets/:id/labels OR /ocr; auto-classify uses content-type then optional Rekognition DetectText cheap check | partial: ✅ upload + content-type classify / 🚩 Rekognition-DetectText fallback / ⏳ presigned URL | Our `deriveKind()` uses content-type alone; DetectText fallback: not implemented. Phase 4 triage (probably Future-State documents) |
| 71 | §9.7 Acceptance U1–U3 | U1 drag-drop ≤20 concurrent; U2 per-file retry; U3 file picker non-blocking | partial: ✅ drop / 🚩 concurrent + retry + non-blocking | Single-file upload shipped; multi-file concurrent + retry: 🚩 Phase 4 triage |
| 72 | §9.8 Search | Command-palette style ⌘K; client-side over cache (Phase 1) → server-side /search?q (Phase 3); fuzzy match labels + OCR text | partial: ✅ basic label search via /api/search / ⏳ ⌘K command palette / ⏳ OCR text search | `searchImages` wired to `LibraryPage.tsx` (Phase 7.5 of 01); ⌘K → `Future-State-command-palette-workstream.md`; OCR search → Textract Future-State |
| 73 | §9.8 Acceptance S1–S3 | S1 opens <100ms; S2 live update debounced 150ms; S3 keyboard-only operable | ⏳ | `Future-State-command-palette-workstream.md` | |
| 74 | §9.9 Profile screen | GET /me + stats (avatar/name/username/total assets/total size/last upload/account created) | partial: ✅ scaffold / ⏳ real data | `frontend/src/pages/ProfilePage.tsx` is a scaffold; real data needs `GET /me` from `Future-State-auth-and-account-management-workstream.md` |
| 75 | §9.10 Account settings | Change password + change display name + delete account (with type-the-name "delete my account") | ⏳ | `Future-State-auth-and-account-management-workstream.md` | |
| 76 | §9.11 Chat full screen | Participants list + message stream + delivery state (Sending→Sent→Delivered) + SSE reconnect with backoff | ⏳ | `Future-State-chat-workstream.md` | |
| 77 | §9.12–9.13 Admin (Users + Assets) | Staff-only table with asset counts; cursor pagination 100/page; allowlist gating; CSV export; cross-user asset filters server-side | ⏳ | (no Future-State doc — same as audit row 20) | |
| 78 | §9.14 Help / keyboard shortcuts | `?` modal overlay with sections (Global / Library / Asset / Chat); dismissable Esc + click-outside; screen-reader accessible | partial: ✅ /help route page / 🚩 ? modal overlay | `frontend/src/pages/HelpPage.tsx` exists as a static help page; modal overlay version triggered by `?`: 🚩 Phase 4 triage (Future-State command palette likely covers `?` as a shortcut) |
| 79 | §9.15 404 / error / offline | 404 page (wordmark + asset-themed copy + link home); ErrorBoundary with correlation ID + retry; offline banner + cache-only browse | partial: ✅ 404 / 🚩 ErrorBoundary + offline | `frontend/src/pages/NotFoundPage.tsx` shipped with route list + home link. ErrorBoundary + offline detection: 🚩 Phase 4 triage |
| 80 | §10.1 FR-AUTH-1..9 (token from POST /auth, Authentication header, redirect-to-login w/ ?next=, 401 → clear token + banner, Sign-out → POST /logout, session-duration 1–1440, account registration with client-side validation, "Remember username" via storage, captcha after N failures) | ⏳ | `Future-State-auth-and-account-management-workstream.md` | Q10 explicitly descopes auth from MVP. Each FR specifies behaviors that apply when real auth lands. |
| 81 | §10.2 FR-ASSET-1 (POST /assets upload) | ✅ | `POST /api/images` (multipart) | (matches row 37) |
| 82 | §10.2 FR-ASSET-2 (GET /assets paged + sorted + filtered) | partial: ✅ list / 🚩 paging+sort+filter | `GET /api/images` returns full list; pagination/sort/filter: 🚩 (matches rows 35, 57, 58) |
| 83 | §10.2 FR-ASSET-3 (asset detail at /asset/:id from GET /assets/:id) | partial: ✅ route / 🚩 per-id endpoint | `AssetDetailPage.tsx` route shipped; resolves via list-filter today (matches row 36) |
| 84 | §10.2 FR-ASSET-4 (inline rename via PATCH /assets/:id) | 🚩 | n/a in MVP | Phase 4 triage candidate (matches row 23 fragment) |
| 85 | §10.2 FR-ASSET-5 (per-asset delete with confirmation) | 🚩 | n/a in MVP (only delete-all) | Phase 4 triage candidate (matches row 38) |
| 86 | §10.2 FR-ASSET-6 (download via GET /assets/:id/download streamed for >5MB) | partial: ✅ download / 🚩 streaming for large files | `GET /api/images/:id/file` works; streaming behavior depends on Express defaults (matches row 39) |
| 87 | §10.2 FR-ASSET-7 (multi-select + batch actions) | 🚩 | n/a in MVP | Phase 4 triage candidate (matches rows 25, 57, 60) |
| 88 | §10.2 FR-ASSET-8 (client-side search across cached assets' name/labels/OCR) | partial: ✅ server-side label search / 🚩 client-side cache + name/OCR search | `searchImages` is server-side only; client-cache + name + OCR search 🚩 |
| 89 | §10.2 FR-ASSET-9 (server-side search when cache window exceeded) | partial: ✅ basic /api/search | `searchImages` exists; cache-window logic 🚩 (overlaps FR-ASSET-8) |
| 90 | §10.2 FR-ASSET-10 (folders / tags) | ⏳ MAY | (no Future-State doc; consider adding to a Future-State Library workstream) | Deferred past v1 |
| 91 | §10.3 FR-AI-1 (auto-classify on upload via content-type + optional Rekognition DetectText) | partial: ✅ content-type / 🚩 DetectText fallback | `deriveKind()` uses content-type only (matches row 70) |
| 92 | §10.3 FR-AI-2 (Rekognition labels via POST /assets/:id/labels + display) | partial: ✅ labels exist / 🚩 model differs | We auto-run on upload, expose via GET; Andrew specs POST on-demand (matches row 40) |
| 93 | §10.3 FR-AI-3 (Textract OCR via POST /assets/:id/ocr + display) | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 94 | §10.3 FR-AI-4 (Textract mode picker — DetectDocumentText vs AnalyzeDocument) | ⏳ | `Future-State-documents-and-textract-workstream.md` | (matches row 67) |
| 95 | §10.3 FR-AI-5 (bounding-box ↔ text-block highlighting) | ⏳ | `Future-State-documents-and-textract-workstream.md` | (matches row 66) |
| 96 | §10.3 FR-AI-6 (manual re-run analysis) | 🚩 | n/a in MVP | Phase 4 triage candidate (overlaps FR-AI-2 model gap, row 40) |
| 97 | §10.3 FR-AI-7 (client-side cache for labels + OCR within session) | 🚩 | n/a in MVP | Phase 4 triage candidate |
| 98 | §10.3 FR-AI-8 (translation of OCR output) | ⏳ MAY | `Future-State-documents-and-textract-workstream.md` (deferred) | |
| 99 | §10.4 FR-CHAT-1..8 (list participants, POST /chat/message, SSE stream at /chat/stream, message states Sending→Sent→Delivered→Failed, auto-reconnect with backoff, "Deregister from chat", DM to one participant, file attachments) | ⏳ | `Future-State-chat-workstream.md` | |
| 100 | §10.5 FR-ADMIN-1..4 (staff-only routes via /me's roles field, /admin/users with pagination, CSV export, /admin/assets cross-user view) | ⏳ | (no Future-State doc — same as audit row 20; Phase 4 triage candidate) | |
| 101 | §10.6 FR-PROFILE-1..4 (GET /me data, password change via POST /me/password, display-name change via PATCH /me, avatar upload) | ⏳ | `Future-State-auth-and-account-management-workstream.md` (FR-PROFILE-4 avatar may warrant separate handling) | |
| 102 | §10.7 FR-SYS-1 (health-check backend on first load via GET /ping → /offline render if down) | partial: ✅ getPing + connection state / 🚩 /offline render | `App.tsx` uses `getPing()` on mount and stores `connection: 'connected' \| 'disconnected' \| 'loading'`; explicit `/offline` route does not exist (matches row 79 offline) |
| 103 | §10.7 FR-SYS-2 (correlation ID in every request via X-Correlation-Id ULID + display on error) | 🚩 | n/a in MVP | Phase 4 triage candidate (overlaps row 12 — recoverable errors) |
| 104 | §10.7 FR-SYS-3 (migrate off base64 JSON uploads to presigned URLs by end of Phase 3) | ⏳ | `Future-State-production-hardening-workstream.md` | (matches row 31) |
| 105 | §10.7 FR-SYS-4 (dark mode, default = system preference) | 🚩 | n/a in MVP | Phase 4 triage candidate (light-only shipped) |
| 106 | §10.7 FR-SYS-5 (telemetry hook with opt-in consent banner) | ⏳ MAY | `Future-State-production-hardening-workstream.md` (or new) | |
| 107 | §7.1 Sitemap (16 routes: /, /login, /register, /library, /asset/:id, /upload, /profile, /profile/settings, /chat, /admin, /admin/users, /admin/users/:id, /admin/assets, /help, /404, /offline) | partial: ✅ 7 routes / ⏳ 7 routes / 🚩 /offline | `App.tsx` shipped: /library /upload /profile /help /asset/:id /404 /login /register (8). Missing: /profile/settings ⏳ + /chat ⏳ + /admin/* ⏳ (all Future-State auth/chat/admin). /offline 🚩 Phase 4 triage |
| 108 | §7.2 Route-table auth guards (most routes "required") | ⏳ | `Future-State-auth-and-account-management-workstream.md` | Q10 makes all routes non-blocking in MVP; auth guards apply when real auth lands |
| 109 | §7.3 Navigation pattern (TopBar 64px + LeftRail 240/56 + main centered 1280max + no auth-route footer; mobile <768px hides rail behind hamburger) | partial: ✅ TopBar + LeftRail collapsible / 🚩 mobile <768 hamburger | TopBar 64px ✅ (per `tailwind.config.ts` `topbar-h`), LeftRail 240/56 ✅ (per `LeftRail.tsx` props). Mobile hamburger: 🚩 Phase 4 triage candidate (mobile artifacts in Andrew's drop) |
| 110 | §8 Claude-console parallels (cream paper, single coral accent, high-contrast text, serif H1/H2 + sans body, narrow content column 72-80ch, sparse Lucide 20px, subtle 8px corners, very little shadow, keyboard-first) | partial: ✅ visual parallels / ⏳ ⌘K + ? help | All visual parallels match (per Andrew's tokens.css → our tailwind.config.ts translation). Keyboard ⌘K + ? overlay → `Future-State-command-palette-workstream.md` (matches rows 13, 55, 78) |
| 111 | §11.1 Brand wordmark serif weight 500 + login subhead "Cloud PhotoApp · Spring 2026" sans 400 | partial: ✅ wordmark / 🚩 subhead | TopBar wordmark "MBAi 460" present; subhead on login: 🚩 minor polish |
| 112 | §11.2 Color tokens (paper/paper-2/paper-3, ink/ink-2/ink-3, line, accent/accent-fg/accent-2, success, warn, error, info) | ✅ | `frontend/tailwind.config.ts` (4-level paper, 4-level ink, accent + accent-2, semantic state colors) | Translated from Andrew's tokens.css during Phase 1.2 of 01 |
| 113 | §11.3 Typography (Inter sans, Tiempos→Source Serif fallback serif, JetBrains Mono mono; modular scale 12/14/16/18/20/24/30/40 px; weights 400/500/600; line heights 1.5/1.25) | partial: ✅ font scale + weights / 🚩 specific font families | Font scale + weights match `tailwind.config.ts`; specific Inter/Source-Serif/JetBrains-Mono families: 🚩 may use system stacks; Phase 4 triage |
| 114 | §11.4 Spacing 4px grid + radii xs/sm/md/lg/full + shadows 1/2/3 + motion 120/180/280ms + prefers-reduced-motion | ✅ | `tailwind.config.ts` (full 4px grid scale, radius xs-xl, shadows 1/2/3, motion durations + ease) | |
| 115 | §11.5 Layout max widths (1280 Library/Admin, 720 AssetDetail/Profile, 480 Auth) + breakpoints (480/768/1024/1280/1440) | partial: ✅ breakpoints / 🚩 specific max-widths per route | Breakpoints in tailwind.config.ts; per-route max-widths: 🚩 Phase 4 triage (could land via simple page-level width constraints) |
| 116 | §11.6 Iconography (Lucide MIT, sizes 16/20/24, color tokens, never without label) | ✅ | `frontend/src/components/Icon.tsx` (Lucide named imports, 18 icons; size + color via Tailwind classes) | |
| 117 | §11.7 Component inventory (25 components: Button/TextField/PasswordField/NumberField/Textarea/Select/Combobox/Checkbox/Radio/Toggle/Badge/Pill/Tag/Chip/Card/Toast/Modal/Popover/Dropdown/Tabs/Table/Pagination/Drop zone/Image viewer/Code block/Command palette/Skeleton/Empty state/Error boundary surface/Banner/Alert) | partial: ✅ ~10 / 🚩 ~10 / ⏳ ~5 | Shipped: Button, TextField, Toast, Modal, Card pattern, Drop zone, Skeleton, Empty state, Banner-via-toast, Tabs-via-router. Missing: PasswordField (show/hide), NumberField (±), Textarea autosize, Select/Combobox, Toggle, Pill/Tag/Chip variants, Popover, Dropdown menu, Table (sort/select), Pagination, Image viewer (pan/zoom), Code block, Command palette ⏳, Error boundary surface 🚩 — many fold into Phase 4 triage |
| 118 | §11.7 "Use shadcn/ui primitives where possible" recommendation | ❌ | R1 reviewer remediation `01-ui-workstream.md` Phase 1.3 strikethrough | Explicitly descoped 2026-04-27 — replaced with custom Tailwind primitives |
| 119 | §11.8 Voice & tone (concise, specific, human on errors, no exclamations, no emoji in product copy except ⬆ drop-zone) | partial: ✅ alignment | We don't have a systematic voice review; copy in shipped MVP is broadly aligned but no formal style audit |
| 120 | §11.9 Illustration (line-art empty states in accent color at 20% opacity; no mascots) | 🚩 | n/a in MVP | EmptyLibrary.tsx uses text only; line-art illustration: 🚩 Phase 4 triage candidate |
| 121 | §12.1 Page chrome (TopBar + LeftRail + page-title row + optional banner slot; auth pages have only centered wordmark) | partial: ✅ chrome / 🚩 banner slot | Auth pages currently include LeftRail in our shipped MVP — could match Andrew's "wordmark-only" auth pattern as a polish item; Phase 4 triage |
| 122 | §12.2 Page-title row (title fs-2xl serif + primary action right-aligned, no breadcrumbs) | partial: ✅ pattern | `PageHeader.tsx` shipped; per-page title styling matches; primary action right-align: depends per page |
| 123 | §12.3 Table patterns (sticky header, row hover, selected highlight at 8% accent + left border, em-dash for nulls) | 🚩 | n/a in MVP — `ListView.tsx` is simpler | Phase 4 triage candidate (table polish lands when admin/library evolves) |
| 124 | §12.4 Form patterns (labels above, required `*`, errors below field, inline-first then banner-fallback) | partial: ✅ alignment | LoginScreen + RegisterScreen + UploadScreen forms broadly follow this; no formal field-pattern audit |
| 125 | §12.5 Dialog patterns (focus trap, Esc closes, click outside closes except destructive, focus return) | ✅ | `frontend/src/components/Modal.tsx` shipped with focus trap + Esc + click-outside + focus return | |
| 126 | §13.1 Stack — TypeScript 5.x strict + React 18 + Vite 5+ + React Router 6 + Zustand + Tailwind 3 + shadcn (descoped) + RHF+Zod + fetch wrapper + Vitest+RTL+Playwright+axe | partial: ✅ TS+React+Vite+Router+Zustand+Tailwind+Vitest+RTL / ❌ shadcn / 🚩 RHF+Zod / ⏳ Playwright + axe | TS 5.6 strict + React 18.3.1 + Vite 5.4 + react-router-dom 6 + Zustand 5 + Tailwind 3 ✅. shadcn ❌ (R1 descope). RHF + Zod 🚩 (we use plain useState forms in MVP — no schema validation library). Playwright + axe-core ⏳ (`Future-State-playwright-e2e-workstream.md`). TanStack Query 🚩 not used (we use direct fetch). pnpm 🚩 (we use npm) |
| 127 | §13.2 Project layout (src/app, src/components, src/features, src/api, src/lib, src/styles, src/tests, e2e/) | partial: ✅ shape varies | Our layout: `src/api/`, `src/components/`, `src/pages/` (vs `src/app/`), `src/stores/`, `src/styles/`, `src/__tests__/`. No `src/features/` or `src/lib/`. Phase 4 triage minor |
| 128 | §13.3 API client (single apiFetch wrapper + correlation ID + Authentication header + timeout + retry + 401-redirect; TanStack Query hooks; Zod-validated responses) | partial: ✅ wrapper / 🚩 correlation ID + retry + Zod validation / ⏳ Authentication header + 401 redirect / 🚩 TanStack Query | `photoappApi.ts` is a typed wrapper but no correlation ID, no retry, no Zod runtime validation. Phase 4 triage clusters |
| 129 | §13.4 Auth handling (token in memory only, no localStorage; 401 → clear + redirect; GET /me on mount) | ⏳ | `Future-State-auth-and-account-management-workstream.md` | mockAuth Q10 |
| 130 | §13.5 File uploads (Phase 2: base64 JSON; Phase 3: presigned PUT init/finalize handshake; chunked >100MB deferred) | partial: ✅ Phase 2 multipart / ⏳ Phase 3 presigned | Multer-based multipart matches Phase 2 spirit (slightly different from Andrew's base64-in-JSON model); presigned URL handshake: ⏳ (matches rows 31, 104) |
| 131 | §13.6 Textract integration (POST /assets/:id/ocr; AnalyzeDocument/DetectDocumentText branching; async job polling for >1 page; result stored at s3://<bucket>/ocr/<key>.textract.{json,txt}; cost guard 20/hour user + 3/day asset) | ⏳ | `Future-State-documents-and-textract-workstream.md` | |
| 132 | §13.7 Accessibility (WCAG 2.1 AA hard gate, axe CI, contrast 4.5:1/3:1, focus visible 2px+2px offset, keyboard, screen reader, reduced motion, no-color-only-state) | partial: ✅ alignment / 🚩 axe CI + formal audit | Tab order + focus-visible shipped; formal WCAG/axe audit: 🚩 (matches row 14) |
| 133 | §13.8 Performance budgets (LCP /login <1.5s, /library <2.5s with 50 assets; INP <200ms p75; CLS <0.1; initial JS gzipped <200KB; per-route <80KB; thumbnail <50KB @ 400px) | partial: ✅ JS bundle / 🚩 formal RUM measurement + per-route splits | Built JS bundle is 214KB ungzipped → ~66KB gzipped (under budget ✅). Per-route lazy chunks: 🚩 not configured. RUM: 🚩 |
| 134 | §13.9 Browser support (last-2 versions of Chrome/Edge/Firefox/Safari; iOS Safari 15+; Chrome Android 100+; min viewport 360px; no IE11) | partial: ✅ alignment | Vite default targets cover this; min viewport 360px not formally tested |
| 135 | §13.10 Security (CSP, X-Frame-Options DENY, Referrer-Policy, X-Content-Type-Options, HSTS, no token in URL/localStorage, no `dangerouslySetInnerHTML`, presigned 15-min S3 GET URLs, pnpm audit + Dependabot) | partial: ✅ no-localStorage + react default escape / 🚩 CSP + headers + dependabot / ⏳ HSTS + presigned URLs | `Future-State-production-hardening-workstream.md` covers headers/CSP/HSTS; Dependabot: 🚩 setup-level concern |
| 136 | §13.11 Deployment (S3+CloudFront us-east-1; SPA-fallback to /index.html; CI: build→test→axe→upload→invalidate; env-specific .env builds) | ⏳ | `Future-State-production-hardening-workstream.md` (or new Future-State-deployment-workstream.md) | We deploy locally only via `npm start` Express; cloud deployment ⏳ |
| 137 | §13.12 Observability (logger wrapper + RUM + Sentry/GlitchTip + correlation IDs + synthetic checks) | partial: ✅ basic console / 🚩 structured logger + RUM + error reporting + synthetic checks | Phase 4 triage cluster — multiple TODOs |
| 138 | §13.13 Internationalization (English only v1; t() helper from day one; Intl.DateTimeFormat for dates) | 🚩 | n/a in MVP | t() wrapper not in MVP; Phase 4 triage candidate |
| 139 | §13.14 Feature flags (JSON manifest /flags.json fetched at app boot; flags: textract_enabled, chat_enabled, admin_enabled, presigned_uploads, dark_mode) | 🚩 | n/a in MVP | Phase 4 triage candidate |
| 140 | §14.1 Success metrics (time-to-first-upload p75 <90s, upload success ≥99%, Rekognition success ≥97%, Textract success ≥95%, search-to-click p75 <6s) | 🚩 | n/a in MVP | Phase 4 triage — likely Future-State production-hardening (RUM ties in) |
| 141 | §14.2 Testing strategy (unit/component/E2E/a11y/visual-regression layered) | partial: ✅ unit+component / ⏳ E2E + a11y + visual-regression | Vitest 17 files / 74 tests + backend Jest 12 files / 77 tests (backend) shipped. E2E + axe + visual-regression: ⏳ `Future-State-playwright-e2e-workstream.md` |
| 142 | §14.3 Error taxonomy (4xx auth/validation/cost-guard/conflict; 5xx server/timeout/AWS; client UI errors with correlation IDs) | 🚩 | n/a formal taxonomy in MVP | Toast errors exist; formal taxonomy + correlation ID: 🚩 (overlaps row 12, 103) |
| 143 | §14.4 Edge cases catalog (large files, multi-file batches, network drops mid-upload, token expiry mid-action, concurrent OCR jobs, etc.) | 🚩 partial | We handle 50MB limit + basic upload errors; comprehensive edge-case audit: 🚩 |
| 144 | §14.5 SLOs (availability 99.5%, error budget, latency targets per page) | 🚩 | n/a in MVP | Phase 4 triage candidate |
| 145 | §15 Implementation roadmap — 5 phases (Foundation, P01-aligned, P02 server, P03 features, Hardening) over 8 weeks | partial: ✅ alignment | Our actual plan diverged from Andrew's phase numbering (we did Phase 0–8 of UI workstream over ~2 days). Phase numbering is purely organizational. |
| 146 | §16 Open questions and risks | 🚩 | n/a captured | Andrew's open questions (e.g., chat webhook adapter R-3) overlap our Future-State concerns. Phase 4 triage may surface specific items into TODOs |
| 147 | §17 Appendices A–F (endpoint inventory + design tokens + UI↔photoapp.py mapping + keyboard shortcuts glossary + references + changelog) | partial: ✅ tokens (B used) / partial overlap | Appendix A overlaps §6.4 (rows 35-46). Appendix B (design tokens) → Andrew's tokens.css translated to `tailwind.config.ts` ✅. Appendix C (UI↔photoapp.py mapping) overlaps §6.4. Appendix D (keyboard shortcuts) overlaps §11.7 / §13.x. Appendix E refs informational. Appendix F changelog meta. |

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
