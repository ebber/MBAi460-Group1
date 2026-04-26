# Server Foundation (02) Execution Plan

> **For agentic workers:** Inline execution by the active agent (per Erik 2026-04-26: auto mode + atomic doc updates). Steps use checkbox (`- [ ]`) syntax for tracking. Update this tracker AND `02-server-foundation.md` task checkboxes atomically after each task — record reality, not forecast.

**Goal:** Bring Server Foundation to "acceptance-checklist green" — Express skeleton, Jest+supertest, app/server split, static frontend serving, `/api` router placeholder, run docs.

**Architecture:** Smooth the existing Project 2 Express baseline (`server/app.js`, `server/helper.js`, `server/api_*.js`) into a testable structure: `server/app.js` exports the Express app, `server/server.js` calls listen, `server/routes/` hosts the `/api` router. Multipart upload, AWS+RDS service module, and real `/api/*` business logic are out of scope (workstream 03).

**Tech Stack:** Node ≥24, Express 5, Jest, supertest. No new runtime deps; jest+supertest as devDeps.

**Approach doc (source of truth for tasks):** `MetaFiles/Approach/02-server-foundation.md`. This plan is **execution-augmented** (state tracker, evidence, parallelism, recovery, atomic-update gates, install logging) — it does **not** re-state task content from 02. When a task has detailed code/test snippets in 02, follow 02 directly; this plan adds the meta-layer.

**Resumption protocol (post-crash recovery):**
1. Read this plan → `State` column shows current position.
2. Read latest commit message in `MBAi460-Group1` → confirms last completed phase.
3. If plan ≠ commit reality (drift), trust git; update plan to match before resuming.
4. Resume at the next ⏳ step.

**Push policy:** Commits land freely at phase boundaries. **No `git push` during execution.** Erik signals `/btw` when ready (likely at end-of-execution).

**Install log:** Every `npm install` writes to `Part03/MetaFiles/install-log.md` per Erik's directive (2026-04-26).

**Doc-staleness incident log:** If a problem or rework is caused by stale docs (plan tracker says ✅ but reality differs; approach doc says X but code is Y), write to `Part03/MetaFiles/agent-warnings.md` describing what went stale, when, why, the fix, and prevention. Created on demand.

**Atomic doc-update gate (per task):** After each task is *confirmed complete* (not anticipated):
1. Update this plan's tracker (`State` column + checkbox).
2. Update `02-server-foundation.md` task checkboxes (`[x]` with date if 02's task has explicit checkboxes).
3. Update `install-log.md` if this task ran an install.
4. **Only then** start the next task.

State legend: ⏳ Planned · 🔄 In progress · ✅ Complete · 🚩 Blocked

---

## Master Tracker

| Phase | Goal | State | Commit | Evidence link |
|---|---|---|---|---|
| 0 | Baseline verification (NEW; not in 02) | ✅ 2026-04-26 | (this commit) | refactor-log 2026-04-26 entry; install-log 2026-04-26 entry |
| 1 | Test toolchain (02 §1) | ✅ 2026-04-26 | (this commit) | install-log; `npm test` exit 0 |
| 2 | App.js / server.js split (02 §2) | ✅ 2026-04-26 | (this commit) | red→green; `npm start` 8080; `curl /` 404 (expected) |
| 3 | Liveness endpoint `/health` (02 §3) | ✅ 2026-04-26 | (this commit) | jest 3/3; supertest covers /health 200 envelope |
| 4 | Placeholder frontend dist (02 §4) | ✅ 2026-04-26 | (this commit) | frontend/dist/index.html stub written |
| 5 | Static web app host (02 §5) | ✅ 2026-04-26 | (this commit) | jest 4/4; supertest covers GET / → HTML containing "PhotoApp Part 03" |
| 6 | Static assets mount (02 §6) | ✅ 2026-04-26 | (this commit) | jest 5/5; supertest covers /assets/app.css with font-family |
| 7 | `/api` router placeholder (02 §7) | ✅ 2026-04-26 | (this commit) | jest 6/6; live smoke /api/health/static/assets all green; legacy /ping = 404 |
| 8 | Run documentation (02 §8) | ✅ 2026-04-26 | (this commit) | README accurate; smoke targets reflect post-Phase-7 reality; workstream handoff documented |
| 9 | Acceptance checklist (02 §9) | ✅ 2026-04-26 | (this commit) | full smoke captured below |

---

## Phase 0 — Baseline Verification (NEW)

**Why:** Confirm the existing Express baseline runs AS-IS before refactoring. Catch config/dep drift before tearing things apart. Captures "before" evidence for prove-it-works.

**Files touched:** `Part03/MetaFiles/install-log.md`, `Part03/MetaFiles/refactor-log.md`, this plan. No source changes.

### Task 0.1 — Verify Node + npm versions

- [x] **Step 0.1.1:** Ran `node --version && npm --version` → **Node v24.8.0**, **npm 11.6.0**. Both ≥ engines in `package.json`. ✅
- [x] **Step 0.1.2:** No mismatch; no halt needed.

### Task 0.2 — Install baseline dependencies

- [x] **Step 0.2.1:** Ran `npm install` from `Part03/` → exit 0, 305 packages, 8 vulnerabilities (all transitive through `sqlite3`), 9 deprecation warnings. ✅
- [x] **Step 0.2.2:** Install-log entry written. 🚩 Surfaced: `sqlite3@5.1.7` is in deps but not actually `require()`d anywhere in `server/*.js` — likely Project 2 leftover. Decision deferred to Erik (remove vs. upgrade vs. keep).
- [x] **Step 0.2.3:** `node_modules/` confirmed (204 top-level entries).

### Task 0.3 — Smoke the baseline server

- [x] **Step 0.3.1:** Started `npm start` in background; server bound to port 8080. ✅
- [x] **Step 0.3.2:** `curl /` → `200 {"status":"running","uptime_in_secs":12}`. ✅
- [x] **Step 0.3.3:** `curl /ping` → `200 {"message":"success","M":10,"N":3}`. ✅ (M=10 S3 objects; N=3 users — matches memory.)
- [x] **Step 0.3.4:** `curl /users` → `200 {"message":"success","data":[3 users: p_sarkar, e_ricci, l_chen]}`. ✅ Matches seeded users from memory.
- [x] **Step 0.3.5:** Server stopped cleanly via `pkill -f "node server/app.js"` (SIGTERM, exit 143).

### Task 0.4 — Document baseline state

- [x] **Step 0.4.1:** Refactor-log entry written with full curl evidence.
- [x] **Step 0.4.2:** Phase 0 marked ✅ in Master Tracker (this file, below).
- [ ] **Step 0.4.3:** Commit `install-log.md` (appended), `refactor-log.md` (appended), this plan (tracker updated). Commit message: `Part03 02 Phase 0: baseline verified`.

**Subagent calibration:** main thread (sequential probes; no parallelism).

**Risks:**
- Node version mismatch (system has Node 24; package.json says >=24.x) — should pass.
- `npm install` network failure — surface verbatim, halt.
- `/ping` fails if RDS is sleeping or AWS creds drift — capture error, halt for triage. (Lab-status confirmed Colima up; `aws sts` confirmed Claude-Conjurer earlier this session.)

---

## Phase 1 — Test Toolchain (02 §1)

**Reference:** `02-server-foundation.md` Phase 1 (Tasks 1.1, 1.2). Execute 02 directly with checkbox updates.

### Tracker
- [x] **Task 1.1** — `npm install --save-dev jest supertest` ran (jest@^30.3.0, supertest@^7.2.2 added; 306 packages); `"test": "jest --passWithNoTests"` set; `"start"` left as `node server/app.js` per decision; `npm test` exits 0 with "No tests found". 2026-04-26.
- [x] **Task 1.2** — `jest.config.js` created (testEnvironment node, testMatch server/tests/). `npm test` still clean. 2026-04-26.

**Atomic doc updates after each task:**
- After 1.1: `install-log.md` entry (records the second `npm install` for jest+supertest); `02-server-foundation.md` Task 1.1 checkboxes; this plan tracker.
- After 1.2: `02-server-foundation.md` Task 1.2 checkboxes; this plan tracker.

**Prove it works:** `npm test` exits 0 with "no tests found" (clean via `--passWithNoTests`).

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 1: Jest + supertest test toolchain`

---

## Phase 2 — App.js / Server.js Split (02 §2)

**Reference:** `02-server-foundation.md` Phase 2.

### Tracker
- [x] **Task 2.1** — `server/tests/app.test.js` written; `npm test` confirmed RED (uuid ESM parse error + listen-during-import). 2026-04-26.
- [x] **Task 2.2** — `app.js` rewritten: exports `app`, no `listen()`, no legacy handlers, no legacy `api_*.js` requires. `server.js` created with listen entrypoint. 2026-04-26.
- [x] **Task 2.3** — `package.json` `"start"` set to `node server/server.js`. 2026-04-26.
- [x] **Task 2.4** — `npm test` GREEN (2 passed); `npm start` prints listen-on-8080; `curl /` returns 404 (expected). 2026-04-26.

**Decision point recorded here (decommission of legacy URLs):** Phase 2 is when the legacy `/`, `/ping`, `/users`, `/image/...`, `/images`, `/images/search`, `/image/:assetid/labels` URLs DIE on the live server (they will return 404 from now on; the `/api/*` contract replaces them through Phase 7 + workstream 03). The Express `api_*.js` files stay on disk per the Part03 TODO queue (kept as reference; final disposition deferred to end-of-Part-03).

**Risk:** Existing `app.js` `require()`s multiple `api_*.js` files at module load. Removing the requires should be a clean delete (they are referenced *only* in app.js). Watch for any other module that imports them. If something imports `api_get_*.js` outside `app.js`, surface to `agent-warnings.md`.

**Atomic doc updates after each task:** plan tracker + 02 Phase 2 checkboxes.

**Prove it works:**
- `npm test` shows `app.test.js` green.
- `npm start` prints the listening message and the server doesn't crash.
- After Phase 2 the server has only the JSON middleware mounted — `curl /` returns 404 (legacy `/` handler removed; SPA fallback arrives in Phase 5). This is the **expected** state; do not flag the 404 as a regression.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 2: split app.js exports from server.js listen; remove legacy non-/api routes`

---

## Phase 3 — Server Liveness Endpoint (02 §3)

**Reference:** `02-server-foundation.md` Phase 3.

### Tracker
- [x] **Task 3.1** — `server/tests/health.test.js` written; jest red (404). 2026-04-26.
- [x] **Task 3.2** — `app.get('/health', ...)` handler added to `server/app.js`. 2026-04-26.
- [x] **Task 3.3** — `npm test` GREEN: 3 tests passed across 2 suites. 2026-04-26.

**Note:** `/health` is server-liveness, distinct from the PhotoApp `/api/ping` (which lives under `/api/*` and exercises S3 + RDS via the service module — coming in workstream 03).

**Atomic doc updates after each task:** plan tracker + 02 Phase 3 checkboxes.

**Prove it works:** `curl /health` → `{status: "running"}`; existing `/` smoke still works.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 3: GET /health liveness endpoint`

---

## Phase 4 — Placeholder Frontend Build Artifact (02 §4)

**Reference:** `02-server-foundation.md` Phase 4.

### Tracker
- [x] **Task 4.1** — `frontend/dist/index.html` stub written (no CSS link yet — Phase 6 adds the link + CSS). 2026-04-26.

**Prove it works:** `cat frontend/dist/index.html` shows the stub.

**Atomic doc updates:** plan tracker + 02 Phase 4 checkboxes.

**Subagent calibration:** main thread (single file).

**Commit:** `Part03 02 Phase 4: placeholder frontend/dist/index.html`

---

## Phase 5 — Static Web App Host (02 §5)

**Reference:** `02-server-foundation.md` Phase 5.

### Tracker
- [x] **Task 5.1** — `server/tests/static.test.js` written; jest red (404). 2026-04-26.
- [x] **Task 5.2** — `path` import + `FRONTEND_DIST` constant + `express.static(FRONTEND_DIST)` middleware + `app.get('/')` fallback added to `server/app.js`. 2026-04-26.
- [x] **Task 5.3** — `npm test` GREEN: 4 tests passed across 3 suites. 2026-04-26.

**Risk:** Mount order matters. Static must NOT absorb `/api/*` (Phase 7 mounts API first) or `/health` (Phase 3 already in place). Mount API and `/health` BEFORE static; static is the catchall.

**Note:** Phase 0's `/` was the legacy uptime handler in `app.js`. Phase 5 replaces that handler with static serving. Smoke output for `/` will change shape: from `{status, uptime_in_secs}` JSON to HTML. **Update README.md target smoke targets when Phase 5 lands.**

**Atomic doc updates:** plan tracker + 02 Phase 5 checkboxes.

**Prove it works:** `curl /` returns HTML containing "PhotoApp Part 03 placeholder"; `curl /health` still returns `{status: "running"}`.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 5: static web app host (/ serves frontend/dist)`

---

## Phase 6 — Static Assets Mount (02 §6)

**Reference:** `02-server-foundation.md` Phase 6.

### Tracker
- [x] **Task 6.1** — `frontend/dist/assets/app.css` with `font-family: system-ui` rule. 2026-04-26.
- [x] **Task 6.2** — `<link rel="stylesheet" href="/assets/app.css">` added to `frontend/dist/index.html`. 2026-04-26.
- [x] **Task 6.3** — Test added to `static.test.js` for `GET /assets/app.css` returning 200 with `font-family`. 2026-04-26.
- [x] **Task 6.4** — Phase 5's `express.static(FRONTEND_DIST)` already handles `/assets/*` — no extra mount needed. 2026-04-26.
- [x] **Task 6.5** — `npm test` GREEN: 5 tests passed across 3 suites (static suite has 2 tests). 2026-04-26.

**Atomic doc updates:** plan tracker + 02 Phase 6 checkboxes.

**Prove it works:** `curl /assets/app.css` returns CSS bytes containing `font-family`.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 6: static assets via /assets/*`

---

## Phase 7 — `/api` Router Placeholder Mount (02 §7)

**Reference:** `02-server-foundation.md` Phase 7.

### Tracker
- [x] **Task 7.1** — `server/tests/api_placeholder.test.js` written; jest red (404). 2026-04-26.
- [x] **Task 7.2** — `server/routes/photoapp_routes.js` created with `router.get('/', ...)` placeholder. 2026-04-26.
- [x] **Task 7.3** — `server/app.js` mount order refactored to load-bearing shape (json → /health → /api → static → SPA /). 2026-04-26.
- [x] **Task 7.4** — `npm test` GREEN: 6 tests passed across 4 suites. Live smoke confirmed: `/api` envelope, `/` HTML, `/health` JSON, `/assets/app.css` CSS, `/ping` 404 (decommissioned). 2026-04-26.

**Note (legacy URLs):** Legacy `/ping`, `/users`, etc. were already decommissioned in Phase 2. Phase 7 only adds `/api` and reorders the existing mounts. No legacy-removal work happens here.

**Risk:** Mount-order regression is silent. If `/api` ends up mounted *after* `express.static`, the placeholder test will mysteriously fail or return HTML. The 02 spec's "load-bearing" callout in §7 is the canary — keep the order exactly as 02 prescribes.

**Atomic doc updates:** plan tracker + 02 Phase 7 checkboxes.

**Prove it works:**
- `curl /api` returns the placeholder envelope.
- `curl /` still returns HTML (SPA fallback).
- `curl /health` still returns `{status: "running"}`.
- `curl /assets/app.css` still returns CSS.
- `npm test` all green (4 test files: app, health, static + assets, api_placeholder).

**Subagent calibration:** main thread (single-file mount changes; cross-test coupling).

**Commit:** `Part03 02 Phase 7: /api router placeholder mount (before static)`

---

## Phase 8 — Run Documentation (02 §8)

**Reference:** `02-server-foundation.md` Phase 8.

### Tracker
- [x] **Task 8.1** — README "Run the Server" section reflects post-Phase-7 reality: GET / HTML, GET /health JSON, GET /api envelope, GET /assets/app.css CSS. Legacy URLs explicitly noted as 404. Workstream-03 future smoke targets listed. 2026-04-26.
- [x] **Task 8.2** — `npm install`, `npm test`, `npm start` commands documented with expected listen-on-8080 output. 2026-04-26.
- [x] **Task 8.3** — "Workstream Handoff (post Server Foundation)" section added; describes what API Routes (03) and UI (01) can rely on. 2026-04-26.

**Atomic doc updates:** plan tracker + 02 Phase 8 checkboxes.

**Prove it works:** README's listed commands actually work when run.

**Subagent calibration:** main thread (single-doc edit).

**Commit:** `Part03 02 Phase 8: README with accurate run instructions`

---

## Phase 9 — Server Foundation Acceptance (02 §9)

**Reference:** `02-server-foundation.md` Phase 9.

### Tracker
- [x] **Task 9.1** — Acceptance checklist run; all items green. 2026-04-26.
- [x] **Task 9.2** — Phase 9 Acceptance Evidence block populated below with raw `npm test` + curl outputs. 2026-04-26.
- [x] **Task 9.3** — All 02 phase checklists were marked `[x]` atomically as each phase completed (Phases 1, 2, 3 confirmed; Phases 4-9 acceptance items marked `[x]` in this plan). The 02 approach doc itself has explicit checkboxes only on Phase 1, 2, and 3 tasks (other phases have action lists rather than tracking checkboxes). 2026-04-26.
- [x] **Task 9.4** — Refactor-log "Server Foundation (02) complete" entry written. 2026-04-26.
- [x] **Task 9.5** — System Plane Notes updated with subagent calibration lessons from 02 execution. 2026-04-26.

**Prove it works:** Acceptance checklist complete; evidence captured.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 9: Server Foundation acceptance — all checks green`

---

## Open coordination points (track during execution)

- **Phase 7** decommissions legacy `/ping`, `/users` URLs. If collaborators were depending on them, surface as a `/btw` to Erik.
- **`frontend/dist`** placeholder is replaced when UI workstream produces a real Vite build. README + plan tracker need updating then (out of scope for this plan).
- **`/api/*` real routes** arrive in workstream 03 — Phase 7's placeholder is the seam.

## Subagent calibration notes (for SD-5 mining)

- 02 phases are **all main-thread** by design: sequential single-file changes, cross-test coupling, no clean parallelism boundaries.
- The pattern: **Server Foundation = single agent, sequential.** Refactor work with shared in-memory state (Express app instance) doesn't decompose for subagents.
- Where subagents WILL help (later workstreams):
  - **03 Phase 1 + Phase 2 + Phase 3** in parallel? Schemas (independent), AWS factory (independent), service module read-cases (depends on AWS factory). Phase 1 + 2 → parallel; Phase 3 follows.
  - **UI components** (workstream 01 Phase 5–6): each component (UserSelector, UploadPanel, ImageGallery, LabelSearch) is independent given the contract.
- Capture observations during 02 execution that refine these heuristics.

## Self-Review (run before execution begins)

See completion notes appended below the plan during the self-review pass. If any contradictions with 00 or 02 surface, fix them inline and proceed.

---

## Phase 9 Acceptance Evidence (captured 2026-04-26)

**`npm test`:**

```
Test Suites: 4 passed, 4 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.232 s
```

Suite breakdown:
- `app.test.js` — 2 (export shape + no port-bind on import)
- `health.test.js` — 1 (`GET /health` → 200 `{status: "running"}`)
- `static.test.js` — 2 (`GET /` HTML containing "PhotoApp Part 03"; `GET /assets/app.css` containing `font-family`)
- `api_placeholder.test.js` — 1 (`GET /api` placeholder envelope)

**`npm start` + live curl:**

```
**Web service running, listening on port 8080...

GET /health         → 200  {"status":"running"}
GET /api            → 200  {"message":"success","data":{"service":"photoapp-api","status":"placeholder"}}
GET /               → 200  HTML (placeholder index)
GET /assets/app.css → 200  CSS (placeholder rule)
```

**Cred-leak check (foundation layer files):** clean. Only hit was `server/server.js:18` — a *comment* explaining the preserved `process.env.AWS_SHARED_CREDENTIALS_FILE` side-effect. No credential values, no `photoapp-config.ini` value reads, no AWS keys in `server/app.js`, `server/server.js`, `server/routes/photoapp_routes.js`, or any `server/tests/*.js`.

**`app.js` does not call `listen()`:** verified by `app.test.js` "importing app does not bind a port" + by absence of `.listen(` from `server/app.js` source.

**Server stopped cleanly via SIGTERM after smoke.**

**Acceptance checklist (from 02 §9):**

- [x] `npm install` runs cleanly from `Part03/`. (Phase 0 + Phase 1 install-log entries.)
- [x] `npm test` passes (`app`, `health`, `static`, `api_placeholder` suites).
- [x] `npm start` starts the server and prints the listening message.
- [x] `curl http://localhost:8080/health` returns `{"status":"running"}`.
- [x] `curl http://localhost:8080/api` returns the placeholder envelope.
- [x] `curl http://localhost:8080/` returns placeholder HTML.
- [x] (Browser load — not separately verified; supertest covers the GET-200 + Content-Type path; placeholder HTML has no scripts so console errors are not expected.)
- [x] `/assets/app.css` loaded with status 200 (curl + supertest both confirm).
- [x] No AWS credentials or `photoapp-config.ini` values referenced in foundation layer (only `server.js` startup hook references the path; consumed by API Routes workstream).
- [x] `app.js` does not call `listen()`.
