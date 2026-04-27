# Part 03 — Design Decisions

This is the canonical record of significant design decisions for **Project 01 Part 03 (PhotoApp Web UI)**. Each decision answers a specific question that shaped the architecture or workflow.

**Audience:** any collaborator (human or agent) who needs to understand *why* Part 03 looks the way it does. Andrew, this is the file to skim if you've been building from a pre-pivot baseline.

**Maintenance rule:** when a non-trivial design question gets answered, add it here. Don't bury decisions in commit messages or the refactor-log; the refactor-log is *what was changed*, this doc is *what we decided*. Cross-reference between them.

**Conventions:**

- Each decision has: **Question · Decision · Rationale · Status · Cross-refs**
- "Status" is dated when resolved.
- Cross-refs point to the artifacts that reify the decision (commits, approach-doc sections, code).

---

## Q1 — URL scheme: keep `/api/*` prefix?

**Decision:** **Yes — `/api/*` prefix.**

**Rationale:**

- Cleaner separation between API and static frontend serving (frontend mounts under `/`; API under `/api/*` only).
- Matches the `00-coordination-and-contracts.md` rule: *"Browser calls only HTTP endpoints under `/api/*` plus static website routes."*
- Makes static-frontend mounting unambiguous (no fear of static catchall absorbing API requests, when API is mounted before static).

**Implication:** the existing Project 2 Express baseline (`/ping`, `/users`, `/image/:id`, etc.) was decommissioned during Phase 2 of Server Foundation execution. The legacy `server/api_*.js` files remain on disk as a *behavioral reference* per the `Part03/MetaFiles/TODO.md` Cleanup item.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/00-coordination-and-contracts.md` (API contract section); `MetaFiles/refactor-log.md` 2026-04-26 entry; commits `2df494c`, `fadc449` (legacy URL decommission), `2b61a0f` (`/api` placeholder mount).

---

## Q2 — Reuse `projects/project01/client/photoapp.py` from Part 02?

**Decision:** **No — Node-native re-implementation.** Server uses `@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`, and `mysql2/promise` directly. Part 02 `photoapp.py` is preserved as a behavioral reference only.

**Rationale:**

- Express + Node is the chosen backend (see Q1 / overall stack). Cross-language reuse (Node → Python module) requires either subprocess/IPC plumbing or a separate Python service — both add complexity disproportionate to the value.
- The Project 2 Express baseline already implements the same behaviors in Node; Workstream 03 smooths that baseline into a clean `services/photoapp.js` rather than building a new Python adapter layer.
- Part 02's `photoapp.py` remains valuable as a **canonical behavioral reference**: when implementing each `/api/*` endpoint, read `photoapp.py` to understand expected results, then port the behavior to the Node service module.

**Implication:** the `Project Queue` has an item *"correctly deprecating Part 02 Python from Part 03 backend"* tracking the formal deprecation path (banner in `client/photoapp.py`, README updates, etc.).

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/03-api-routes.md` (service-module architecture); `MetaFiles/refactor-log.md` 2026-04-26 entry; `MBAi460-Group1/MetaFiles/TODO.md` "[Project01/Part03] Correctly deprecate Part 02 Python..." item.

---

## Q3 — Response envelope shape?

**Decision:** **Wrap every response in `{message, data}` (success) or `{message, error}` (failure).**

**Rationale:**

- Uniform shape across endpoints lets the UI write a single response-handling helper.
- Distinguishing `success` from `error` at the message-field level (rather than via HTTP status alone) keeps the UI robust to partial-success or domain-error patterns.
- Already aligned with parts of the legacy baseline (`api_get_users.js` returns `{message, data}`); other legacy routes (`/ping` returning `{message, M, N}`) need normalization, which Workstream 03 handles.

**Implication:** schema/conversion helpers live in `server/schemas.js`; envelope helpers (`successResponse`, `errorResponse`) are the first artifact API Routes builds (Phase 1 of `03-api-routes.md`).

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/00-coordination-and-contracts.md` (Error Contract section + per-endpoint examples); `MetaFiles/Approach/03-api-routes.md` Phase 1.

---

## Q4 — Test stack for the Express server?

**Decision:** **Jest + supertest.**

**Rationale:**

- Mature, conventional Express pairing (per the "mature, best-practice heuristic" — see `claude-workspace/scratch/system-plane-notes.md`).
- Jest runs the Node testEnv natively; supertest exercises Express handlers without binding a port.
- Vitest was considered but Jest's deeper Express ecosystem outweighed Vitest's faster startup for this assignment-window project.
- `--passWithNoTests` flag added to `npm test` (Phase 1 of Server Foundation) so the toolchain reports clean before any test files exist.

**Implication:** test files live at `server/tests/**/*.test.js`. UI workstream uses **Vitest** (Vite-native) for frontend tests — separate test surface, no Jest/Vitest interleave.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `Part03/jest.config.js`; `MetaFiles/Approach/02-server-foundation.md` Phase 1; `Part03/package.json` `devDependencies`.

---

## Q5 — Local dev mode for the UI?

**Decision:** **Built-only.** UI workstream runs `npm run build` (Vite) to produce `frontend/dist/`; Express serves that built output via static middleware. No Vite-dev-server-with-proxy mode for full-stack development.

**Rationale:**

- Single port (8080), single process — simplest deployment story; matches the "one local backend server process" rule in `00-coordination-and-contracts.md`.
- UI iteration on isolated components can still use `vite dev` independently with mocked API responses; full-stack integration testing always uses the built artifact.
- Removes the dev/prod parity question for Part 03 (production demo path == local development path).

**Implication:** UI workstream's iteration cycle includes a build step before each integration test. Acceptable for an assignment-window project. Future projects with longer UI iteration loops may revisit.

**Status:** ✅ Resolved 2026-04-26.
**Cross-refs:** `MetaFiles/Approach/01-ui-workstream.md` (Goal section dev-mode callout); `MetaFiles/Approach/00-coordination-and-contracts.md` Open Questions resolution note.

---

## Q6 — Visualization language/implementation agnosticism?

**Decision:** **The Target-State architecture diagram (`visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`) is written language-agnostic** — no "FastAPI", "Python", "JS", "Node", or "Express" in box labels or prose. Boxes describe roles ("Local Web Server", "PhotoApp Service Module", "AWS service clients"); the implementation is documented in the approach docs.

**Rationale:**

- The diagram captures *architecture* (what talks to what, in which order). The *implementation* of each box (Express, mysql2, AWS SDK v3) belongs in the approach docs and code.
- Agnostic visualizations survive future re-platform decisions without rework.
- Design agent has reviewed the agnostic version (`visualizations/MetaFiles/TODO.md` item closed).

**Implication:** when describing the live architecture verbally, prefer architecture-level vocabulary first ("the server orchestrates AWS clients and a database driver"), then drop into implementation details when the audience is implementing.

**Status:** ✅ Resolved 2026-04-26 (design-agent reviewed).
**Cross-refs:** `visualizations/Target-State-project01-part03-photoapp-architecture-v1.md`; `visualizations/MetaFiles/TODO.md` closed item.

---

## Q7 — Frontend stack prescription

**Status:** ✅ Resolved 2026-04-26 by Erik (curated subset of Andrew's spec §13.1).

**Decision: hybrid prescription.** The active Part 03 UI stack adopts a curated subset of Andrew's full prescription; two specific items move to Future-State.

**Active in Part 03:**

- **React + Vite** — UI framework + build.
- **TypeScript strict** — `tsconfig.json` `"strict": true`. Migrate Andrew's `.jsx` to `.tsx` with explicit prop / state / response types.
- **Tailwind CSS** — translate `tokens.css` (Andrew's MVP) into a Tailwind theme config so utility classes resolve to the same coral / cream / serif design system.
- **shadcn/ui** — adopt the Radix-based primitives where they map to Andrew's components (Toast, Dialog, Popover, Dropdown, Tabs, Command). Style with Tailwind classes that consume the tokens.
- **Zustand** — global UI state only (sidebar collapsed, theme selection, command-palette open, mock-auth flag). Local component state stays in component-level `useState`.
- **Vitest + React Testing Library** — unit and component tests.
- **Playwright** — E2E happy-path checks (mock-login → library → upload → asset-detail → search → delete).

**Deferred to Future-State (Production Hardening workstream):**

- **TanStack Query** — server-state library. Useful when network-latency stories grow (caching, refetching, optimistic updates), but the assignment-window UI is small enough that hand-written `useEffect + fetch` plus the `apiFetch` wrapper is fine.
- **axe-core automated accessibility gate in CI** — adds CI-visible regressions catch. Real value, real friction; the design has accessibility built in (Andrew's `tokens.css` already has `prefers-reduced-motion`, focus-visible rings, color-not-only-state). Manual a11y review covers Part 03; the automated gate lands with Production Hardening.

**Implicit defaults (not adopted unless needed):** React Hook Form + Zod (Andrew's Login/Register use plain controlled state — fine for v1). pnpm vs npm — stay with `npm` (Express baseline already uses it; Class Project tooling assumes `npm`). ESLint + Prettier — adopt as conventional defaults.

**Rationale:**

- **Production-quality scaffolding from day one.** TypeScript strict prevents whole categories of bugs and is the lab default; Tailwind + shadcn give a consistent design-system implementation aligned with the tokens; Zustand for global UI state is lightweight and matches the spec; Vitest + RTL + Playwright covers the testing pyramid.
- **Migration cost is real but proportionate.** Andrew's MVP components reshape from `.jsx` → `.tsx`, inline-styles → Tailwind classes, and custom Modal/Toast → shadcn primitives. This is more than a rename; it's a re-implementation that *preserves component boundaries and accessibility behaviors* but changes the styling layer. The phased migration plan in `01-ui-workstream.md` accounts for this.
- **TanStack Query + axe-core deferral is honest.** Both are genuine production wins, but each carries setup + maintenance cost that's higher value once the app is past assignment scope.

**Implication for migration (drives `01-ui-workstream.md`):**

- Andrew's `tokens.css` → `tailwind.config.ts` theme extension (colors, spacing, fontFamily, fontSize, borderRadius, boxShadow, animation tokens).
- Andrew's `.jsx` files → `.tsx` files with explicit types for props and fetch response shapes.
- Andrew's `<Modal>`, `<ToastProvider>`, `<Dropdown>`, `<CommandPalette>` → reimplement using shadcn/ui's Dialog / Toast / DropdownMenu / Command primitives, styled with Tailwind classes that consume the new theme.
- Andrew's `localStorage.getItem("lib_view")` → Zustand store (with persist middleware) or keep direct localStorage for single-boolean cases.
- Inline styles in JSX → Tailwind utility classes. One-offs go in `tailwind.config.ts` `extend`.

**Cross-refs:** `01-ui-workstream.md` (full phase migration plan reflecting this stack); `Future-State-production-hardening-workstream.md` (where TanStack Query + axe-core land); spec §13.1.

**Decided:** Erik 2026-04-26.

---

## Q8 — Asset `kind` field on the API contract

**Status:** ✅ Resolved 2026-04-26.

**Decision:** **Server-derived from filename extension** at upload time; stored as a column on the `assets` table; returned on every asset response.

**Rationale:**

- Makes `kind` authoritative for downstream services (Textract triggering, search indexing) without requiring the UI to send classification metadata.
- The `auto` / `photo` / `document` upload radio in Andrew's spec becomes a *hint* (UX), not the source of truth.
- Simple mapping: image extensions (`.jpg|.jpeg|.png|.heic|.heif`) → `'photo'`; **everything else** (`.pdf`, `.txt`, `.docx`, unknown / extensionless) → `'document'`. Documents are stored in Part 03 (Q9), they just don't get OCR processing yet.

**Schema impact (workstream 03):** `assets` table adds a `kind ENUM('photo','document') NOT NULL` column. Migration is forward-only; existing rows default to `'photo'` for the seed `01degu.jpg` etc. Both enum values are **active in Part 03** — photos get Rekognition labels, documents are stored without further processing.

**Cross-refs:** `00-coordination-and-contracts.md` "Asset response shape"; `03-api-routes.md` Pre-Phase 1 schema migration + Phase 1 row converter + Phase 5 upload service (with branch on `kind`); Q9 for the document-acceptance scope; spec §6 endpoints table.

**Decided:** Erik 2026-04-26.

---

## Q9 — Textract OCR scope (and document-acceptance tension)

**Status:** ✅ Resolved 2026-04-26. Updated 2026-04-26 (later same day) after a reviewer flagged a tension between "photo-only" and Andrew's broader asset model. Final shape:

**Decision:** **Textract OCR is deferred to Future-State.** But documents themselves are **accepted in Part 03** — stored in S3 + the `assets` table with `kind='document'` — they just don't get OCR processing yet.

**Concretely:**

- **Multer accepts ALL file types** (size-limited to 50 MB; no MIME filter).
- **Server derives `kind` from extension** (Q8). Image extensions → `'photo'`; everything else → `'document'`.
- **Photos** go through Rekognition `DetectLabels` and produce label rows.
- **Documents** are uploaded to S3 + INSERT into `assets` with `kind='document'`. **Rekognition is skipped for documents.** No label rows. No Textract yet.
- **When the Future-State Textract workstream lands**, existing document rows can be retroactively OCR'd via the new `POST /api/images/:id/ocr` endpoint — no data migration needed; the schema is forward-compatible.

**Rationale:**

- Andrew's spec (and the asset-first product principle) treats documents as first-class assets. Rejecting them in Part 03 would force users into "this isn't a photo, you can't upload it" dead-ends and contradict the spec.
- Storing documents now with `kind='document'` and no OCR is a **clean intermediate state**: the UI can show them, the schema supports them, and the OCR pipeline lands cleanly when Textract is provisioned.
- Part 03's assignment scope is photo-focused for the core demonstration (Rekognition labels), but document acceptance is a low-cost addition that future-proofs the schema and avoids artificial UX gates.

**What's still deferred (Future-State Documents + Textract workstream):**

- New AWS Textract service + IAM permissions (`textract:DetectDocumentText`, `textract:AnalyzeDocument`, async job APIs).
- New endpoint: `POST /api/images/:id/ocr`.
- Schema additions for OCR metadata: `textract_status`, `textract_text`, `textract_key`, `ocr_mode`, `ocr_confidence`.
- UI: Asset Detail (Document) split-pane view with image + OCR text, bounding-box highlighting, low-confidence underlines.
- Cost guards (per-user rate limit, per-asset re-run cap).

**Implication for `01-ui-workstream.md`:**

- Upload screen accepts any file; the `document` classification radio is a UX hint, not the source of truth (server derives `kind` from extension regardless).
- Library renders both photo and document cards. Document cards show metadata (filename, size, date, kind badge) instead of labels/OCR-excerpt. An "OCR processing coming soon" pill or empty-state replaces the labels/excerpt section.
- Asset Detail (Document) is **partially in scope for Part 03**: a basic file preview (PDF inline via `<embed>` or `<iframe>` for browsers that support it; download link for other types) + an "OCR coming soon" placeholder where the text panel will live. The full split-pane view with Textract output is Future-State.
- Search by label only matches photo assets (correct — documents have no labels in Part 03). Search across OCR text is Future-State.

**Cross-refs:** `Future-State-documents-and-textract-workstream.md` (full Textract scope, schema additions, IAM, cost guards); `Future-State-roadmap.md` (where Textract sits in the broader sequencing); spec §9.6, §13.6; Q8 for the `kind` derivation rules.

**Decided:** Erik 2026-04-26 (initial). Reviewer-flagged refinement 2026-04-26 (same day): documents accepted; only Textract OCR deferred.

---

## Q10 — Auth scaffolds in Part 03

**Status:** ✅ Resolved 2026-04-26 by Erik.

**Decision:** Login/Register migrate as **visual scaffolds**, but they must stay **NON-BLOCKING**. Real auth implementation is Future-State (see `Future-State-auth-and-account-management-workstream.md`).

**Concretely:**

- Migrate Andrew's `LoginScreen` and `RegisterScreen` components from `auth.jsx` into the new app (TypeScript + Tailwind + shadcn `Input`).
- They are reachable at `/login` and `/register` for visual-demo purposes.
- They do **NOT** gate access to other routes. **The default route is `/library`.** Users can demonstrate the entire app — library, upload, asset detail, search, delete — without ever visiting `/login`.
- No auth-guard middleware on any route in Part 03.
- The Login form's "Sign in" button optionally toggles a `isMockAuthed` flag in the Zustand store, used only for visual differentiation (e.g., the topbar avatar shows a name vs. anonymous initials). It does not change route accessibility.
- The "Forgot?" modal stays as a placeholder pointing at staff contact (per spec §9.3) — no `password_resets` table exists yet.

**Rationale:**

- The assignment window is photo-focused and backend-blocked on Project 03's `authsvc` Lambdas for real auth.
- Andrew's spec assumes auth is in place ("Login is the front door"); we honor the *visual* part of that assumption while explicitly NOT depending on it for app demonstration.
- Non-blocking means demo-readiness — the video teammate can record a working flow without needing to wire mock-credentials at every step.

**Implication for `01-ui-workstream.md`:**

- Phase 6 ships `LoginScreen` + `RegisterScreen` as visual scaffolds.
- `App.tsx` default route → `/library` (not `/login`).
- No `<RequireAuth>` wrapper; routes are accessible directly.
- Topbar avatar reads from Zustand `mockAuth` (default: anonymous; manual override via Login form for visual demo).

**What lands when Auth workstream ships (Future-State):** `<RequireAuth>` wrapper added; default route flips to `/login` for unauthenticated visitors; real `POST /api/auth` wired; tokens flow into the `apiFetch` wrapper.

**Cross-refs:** `01-ui-workstream.md` Phase 6 (visual scaffolds, non-blocking); `Future-State-auth-and-account-management-workstream.md` (full real-auth scope); spec §3 product principle "Login is the front door" (deferred to Future-State).

**Decided:** Erik 2026-04-26.

---

## How to add a future decision

1. Pick the next available Q number.
2. Use the **Question · Decision · Rationale · Status · Cross-refs** template above.
3. Cross-link from the relevant approach doc(s) and the next refactor-log entry.
4. If the decision changes a previous one, link the previous Q and add a "Superseded by Q-N" line under its Status.
