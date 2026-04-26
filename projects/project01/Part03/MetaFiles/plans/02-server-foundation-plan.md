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
| 0 | Baseline verification (NEW; not in 02) | ⏳ | — | install-log + smoke output below |
| 1 | Test toolchain (02 §1) | ⏳ | — | `npm test` exit 0 |
| 2 | App.js / server.js split (02 §2) | ⏳ | — | failing test → green; `npm start` parity |
| 3 | Liveness endpoint `/health` (02 §3) | ⏳ | — | `curl /health` |
| 4 | Placeholder frontend dist (02 §4) | ⏳ | — | `cat frontend/dist/index.html` |
| 5 | Static web app host (02 §5) | ⏳ | — | `curl /` returns HTML |
| 6 | Static assets mount (02 §6) | ⏳ | — | `curl /assets/app.css` |
| 7 | `/api` router placeholder (02 §7) | ⏳ | — | `curl /api` returns envelope |
| 8 | Run documentation (02 §8) | ⏳ | — | README updated, accurate |
| 9 | Acceptance checklist (02 §9) | ⏳ | — | full smoke green |

---

## Phase 0 — Baseline Verification (NEW)

**Why:** Confirm the existing Express baseline runs AS-IS before refactoring. Catch config/dep drift before tearing things apart. Captures "before" evidence for prove-it-works.

**Files touched:** `Part03/MetaFiles/install-log.md`, `Part03/MetaFiles/refactor-log.md`, this plan. No source changes.

### Task 0.1 — Verify Node + npm versions

- [ ] **Step 0.1.1:** Run `node --version && npm --version`. Expected: Node ≥24.x, npm ≥11.x (per `package.json` engines).
- [ ] **Step 0.1.2:** If mismatch, halt and surface to Erik before continuing. (Auto-mode exception: version mismatch is destructive-class — Ask first.)

### Task 0.2 — Install baseline dependencies

- [ ] **Step 0.2.1:** From `Part03/`, run `npm install` and capture exit code, deps-installed count, vulnerabilities count, notable warnings.
- [ ] **Step 0.2.2:** Append a `## 2026-04-26 — Phase 0 baseline npm install` entry to `Part03/MetaFiles/install-log.md` with: date, cwd, command, exit, packages-installed count, vulnerabilities count, notable warnings.
- [ ] **Step 0.2.3:** Confirm `node_modules/` exists.

### Task 0.3 — Smoke the baseline server

- [ ] **Step 0.3.1:** From `Part03/`, run `npm start` in the background. Capture the port-bind line ("Web service running, listening on port 8080...").
- [ ] **Step 0.3.2:** `curl -s http://localhost:8080/` — expected JSON with `status: "running"` and a numeric `uptime_in_secs`.
- [ ] **Step 0.3.3:** `curl -s http://localhost:8080/ping` — expected `{message: "success", M: <int>, N: <int>}` (live S3 + RDS). Per memory, `N=3` (3 seeded users); `M` is current S3 object count (≥1 if `test/degu.jpg` is present).
- [ ] **Step 0.3.4:** `curl -s http://localhost:8080/users` — expected `{message: "success", data: [<3 user rows>]}`.
- [ ] **Step 0.3.5:** Stop the background server cleanly.

### Task 0.4 — Document baseline state

- [ ] **Step 0.4.1:** Append a `## 2026-04-26 — Phase 0 Baseline Smoke Verified` section to `Part03/MetaFiles/refactor-log.md` with the captured `curl` outputs as evidence. This is the "before" state for the prove-it-works principle.
- [ ] **Step 0.4.2:** Mark Phase 0 ✅ in this plan's Master Tracker.
- [ ] **Step 0.4.3:** Stage and commit: `install-log.md` (new), `refactor-log.md` (appended), this plan (tracker updated). Commit message: `Part03 02 Phase 0: baseline verified; install-log + refactor-log entries`.

**Subagent calibration:** main thread (sequential probes; no parallelism).

**Risks:**
- Node version mismatch (system has Node 24; package.json says >=24.x) — should pass.
- `npm install` network failure — surface verbatim, halt.
- `/ping` fails if RDS is sleeping or AWS creds drift — capture error, halt for triage. (Lab-status confirmed Colima up; `aws sts` confirmed Claude-Conjurer earlier this session.)

---

## Phase 1 — Test Toolchain (02 §1)

**Reference:** `02-server-foundation.md` Phase 1 (Tasks 1.1, 1.2). Execute 02 directly with checkbox updates.

### Tracker
- [ ] **Task 1.1** — Add jest + supertest devDeps; `"test": "jest --passWithNoTests"`; `"start": "node server/server.js"` (note: server.js doesn't exist yet — Phase 2 creates it; for Phase 1 the start script can stay `node server/app.js` until Phase 2 completes the split, OR set to server.js now and run only after Phase 2). **Decision:** keep `start` script as `node server/app.js` through Phase 1; flip to `node server/server.js` in Phase 2 Task 2.2.
- [ ] **Task 1.2** — `jest.config.js` (testMatch `<rootDir>/server/tests/**/*.test.js`, testEnvironment `node`).

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
- [ ] **Task 2.1** — Failing test for `app` object export (`server/tests/app.test.js`).
- [ ] **Task 2.2** — Refactor `server/app.js` to export the Express app *without* calling `listen()`; create `server/server.js` that imports `app` and calls `listen(config.web_service_port)`. Also (per 02 Task 2.2 checklist): **remove the legacy `app.get('/', ...)` uptime handler** AND **remove the legacy `api_get_*` requires** from `app.js`. Legacy `server/api_*.js` source files stay on disk per Part03 TODO; only the inline requires + handlers are deleted from `app.js`.
- [ ] **Task 2.3** — Update `package.json` `"start"` to `node server/server.js`.
- [ ] **Task 2.4** — Run `npm test` → green; run `npm start` and confirm the listen-on-8080 message prints (server starts cleanly).

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
- [ ] **Task 3.1** — Failing test for `GET /health` returns 200 + `{status: "running"}`.
- [ ] **Task 3.2** — Implement `/health` handler in `server/app.js` (deliberately outside `/api/*`; this is server liveness, not PhotoApp API).
- [ ] **Task 3.3** — Run tests → green.

**Note:** `/health` is server-liveness, distinct from the PhotoApp `/api/ping` (which lives under `/api/*` and exercises S3 + RDS via the service module — coming in workstream 03).

**Atomic doc updates after each task:** plan tracker + 02 Phase 3 checkboxes.

**Prove it works:** `curl /health` → `{status: "running"}`; existing `/` smoke still works.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 3: GET /health liveness endpoint`

---

## Phase 4 — Placeholder Frontend Build Artifact (02 §4)

**Reference:** `02-server-foundation.md` Phase 4.

### Tracker
- [ ] **Task 4.1** — Create `Part03/frontend/dist/index.html` stub (placeholder HTML; UI workstream replaces with real Vite build later).

**Prove it works:** `cat frontend/dist/index.html` shows the stub.

**Atomic doc updates:** plan tracker + 02 Phase 4 checkboxes.

**Subagent calibration:** main thread (single file).

**Commit:** `Part03 02 Phase 4: placeholder frontend/dist/index.html`

---

## Phase 5 — Static Web App Host (02 §5)

**Reference:** `02-server-foundation.md` Phase 5.

### Tracker
- [ ] **Task 5.1** — Failing test for `GET /` returns 200 HTML.
- [ ] **Task 5.2** — Implement `express.static` mount + fallback `/` route serving `frontend/dist/index.html` (use `path.join(__dirname, '..', 'frontend', 'dist')`).
- [ ] **Task 5.3** — Run tests → green.

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
- [ ] **Task 6.1** — Add placeholder `Part03/frontend/dist/assets/app.css`.
- [ ] **Task 6.2** — Reference the CSS in `frontend/dist/index.html` (`<link rel="stylesheet" href="/assets/app.css">`).
- [ ] **Task 6.3** — Failing test for `GET /assets/app.css` returns 200 with CSS content.
- [ ] **Task 6.4** — Verify `express.static` already serves `/assets/*` (Phase 5's mount should handle this naturally; if not, add explicit mount).
- [ ] **Task 6.5** — Run tests → green.

**Atomic doc updates:** plan tracker + 02 Phase 6 checkboxes.

**Prove it works:** `curl /assets/app.css` returns CSS bytes containing `font-family`.

**Subagent calibration:** main thread.

**Commit:** `Part03 02 Phase 6: static assets via /assets/*`

---

## Phase 7 — `/api` Router Placeholder Mount (02 §7)

**Reference:** `02-server-foundation.md` Phase 7.

### Tracker
- [ ] **Task 7.1** — Failing test for `GET /api` returns 200 + envelope `{message: "success", data: {service: "photoapp-api", status: "placeholder"}}`.
- [ ] **Task 7.2** — Create `server/routes/photoapp_routes.js` with `router.get('/', ...)` placeholder (router will be mounted at `/api`, so the inner `'/'` becomes `/api`).
- [ ] **Task 7.3** — Refactor mount order in `server/app.js` to the load-bearing final shape from 02 §7: JSON middleware → `/health` → `/api` router → `express.static` → SPA `/` fallback. The `/api` router must be mounted **before** `express.static` so the static middleware does not absorb `/api` requests.
- [ ] **Task 7.4** — Run `npm test` → all green (`app.test.js`, `health.test.js`, `static.test.js`, `api_placeholder.test.js`).

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
- [ ] **Task 8.1** — Update `Part03/README.md` "Current Server Baseline" section: replace pre-refactor smoke targets with post-Phase-7 reality:
  - `GET /` → HTML (placeholder frontend)
  - `GET /health` → liveness JSON
  - `GET /api` → placeholder envelope
  - `GET /assets/app.css` → CSS
  - **Note:** `/api/ping`, `/api/users` etc. arrive in workstream 03.
- [ ] **Task 8.2** — Document `npm install`, `npm start`, `npm test` commands and expected outputs.
- [ ] **Task 8.3** — Add a "Workstream handoff" section explaining what UI and API Routes can rely on after Phase 9 acceptance.

**Atomic doc updates:** plan tracker + 02 Phase 8 checkboxes.

**Prove it works:** README's listed commands actually work when run.

**Subagent calibration:** main thread (single-doc edit).

**Commit:** `Part03 02 Phase 8: README with accurate run instructions`

---

## Phase 9 — Server Foundation Acceptance (02 §9)

**Reference:** `02-server-foundation.md` Phase 9.

### Tracker
- [ ] **Task 9.1** — Run the full Server Foundation acceptance checklist from 02 §9 (`npm test`, `npm start`, all curl smoke targets, README accuracy spot-check, no AWS creds in foundation layer).
- [ ] **Task 9.2** — Capture all evidence into a `## 2026-04-26 — Phase 9 Acceptance Evidence` block at the bottom of this plan, with raw command outputs.
- [ ] **Task 9.3** — Mark all 02 phase checklists `[x]` with completion dates.
- [ ] **Task 9.4** — Append a `## 2026-04-26 — Server Foundation (02) complete` entry to `Part03/MetaFiles/refactor-log.md` summarizing what 02 produced and what's now unblocked (workstream 03 + UI integration).
- [ ] **Task 9.5** — Final System Plane Notes update: capture subagent calibration lessons from 02 execution.

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

## Phase 9 Acceptance Evidence (filled in during Task 9.2)

_(Captured after Phase 9 runs.)_
