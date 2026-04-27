# API Routes (03) Execution Plan

> **For agentic workers:** Inline execution by the active agent. Atomic doc updates apply regardless of auto-mode state (per Erik 2026-04-26; see `feedback_atomic_substep_updates.md` + `feedback_auto_mode_toggle_checkpoint.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Updating this plan, the 03 approach doc, install-log, and source code are ATOMIC with each task's commit — not deferred.**

**Goal:** Implement the Express `/api/*` backend per `MetaFiles/Approach/03-api-routes.md` — schemas + helpers, AWS clients factory, multer middleware, PhotoApp service module (read + write use cases), routes, error middleware, opt-in live tests, end-to-end smoke. All TDD-disciplined; all reviewer-flagged Q9 (documents accepted) and Q8 (kind from extension) requirements honored.

**Architecture:** Smooth Project 2's Express baseline into clean `routes/` + `services/` + `middleware/` structure. Node-native `@aws-sdk/client-s3` + `@aws-sdk/client-rekognition` + `mysql2/promise`. Photos go through Rekognition; documents (per Q9) skip Rekognition. Multer accepts all files (50MB limit). Centralized error middleware maps domain errors to HTTP status. `app.js` mounts router at `/api` (single integration point with Server Foundation 02; replaces the placeholder router from 02 Phase 7).

**Tech Stack:** Node ≥24, Express 5, multer, `@aws-sdk/client-s3` ≥3.972, `@aws-sdk/client-rekognition` ≥3.946, `@aws-sdk/credential-providers` ≥3.969, `mysql2/promise` ≥3.16, `ini` ≥6, `uuid` (re-added — see Task 0.2), Jest 30, supertest 7.

**Approach doc (source of truth):** `MetaFiles/Approach/03-api-routes.md`. This plan adds **state tracking, evidence, atomic-update gates, parallelism dispatch, and recovery** — code snippets and full task content live in 03. Where this plan says "per 03 Task X.Y", read 03 for the failing-test code, expected commands, and implementation snippets.

**Execution mode:** inline by the active agent (NOT `superpowers:subagent-driven-development` ceremony — that overhead is wrong for `feedback_subagent_overhead.md` calibration). Selective subagent dispatch in two phases (Phase 1+2+4, Phase 6+7); rest is main thread.

---

## Standing Instructions

### Atomic doc-update gate (Erik 2026-04-26 — STRICT)

After each task's tests confirm GREEN, **before** moving on:

1. Update **this plan's tracker** — flip the task's `[ ]` → `[x]` and the phase row in Master Tracker (✅ + commit hash + date).
2. Update **`03-api-routes.md`** corresponding task checkboxes — `[ ]` → `[x]` with date.
3. Update **`install-log.md`** if this task ran any `npm install` / `npm uninstall` / `npm prune`.
4. **Stage source + doc changes together** and commit in ONE git commit. The commit captures the full atomic state.
5. **Only then** start the next task.

**Rationale:** record reality, never forecast (per `feedback_atomic_substep_updates.md`). A test going green is the *signal*; the commit is the *record*. Forecasted commits or batched docs make crash-recovery unreliable.

**Anti-pattern:** "I'll batch the doc updates at end of phase." NO. Per task. Always.

### Push policy

No `git push` during execution. Erik signals `/btw` when ready (likely at end of execution).

### Install log

`Part03/MetaFiles/install-log.md` records every `npm install` / `npm uninstall` / `npm prune` per Erik 2026-04-26. Each entry: date, cwd, command, exit code, packages added/removed/updated, vulnerability count, notable warnings.

### Doc-staleness incident log

`Part03/MetaFiles/agent-warnings.md` (created on demand) — describe what went stale and why if a doc-state error causes rework. Per Erik 2026-04-26.

### Resumption protocol (post-crash recovery)

1. Read this plan → state column shows current position.
2. Read latest commit on `MBAi460-Group1` main → confirms last completed task (commit message names the task: `Part03 03 Phase X.Y: <task name>`).
3. If plan ≠ commit reality, **trust git**; update plan state to match before resuming.
4. Resume at next ⏳ task.

### Subagent calibration

Two parallel-dispatch points (Phase 1+2+4, Phase 6+7); rest is main thread. Decisions logged to `claude-workspace/scratch/system-plane-notes.md` — wall time, token cost, scope discipline, coherence outcomes. Hypothesis under test: parallel subagents win for **independent files** (Phase 1+2+4); they tax coordination on **same-file sequential work** (Phase 3, 5); they're a calibration test on **separate-files-coupled-tests** (Phase 6+7).

### Working directory

Most commands run from `/Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/`. SQL via `utils/run-sql` runs from repo root `/Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/`. Each Bash call should re-establish cwd (don't trust persisted CWD).

---

## Master Tracker

| Phase | Goal | State | Commit | Evidence |
|---|---|---|---|---|
| 0 | Pre-execution prep + dep install | ✅ 2026-04-26 / reverified 2026-04-27 | a50ef8c | install-log entry written; 5/5 suites + 8/8 tests green; `/health` + `/api` smoke confirmed; **reverification 2026-04-27: 3 packages at pinned versions, tests green, smoke green** |
| Pre-1 | Schema migration (kind column) | ✅ 2026-04-27 | (this commit) | migration ran clean on live RDS; validate-db kind check PASSES; SELECT kind GROUP BY returned 1 group (all 10 existing rows defaulted to `'photo'`) |
| 1 | `server/schemas.js` (envelope + converters + deriveKind) | ✅ 2026-04-27 | (this commit) | 10 tests green; 7 exports per Q8 (envelope + 4 row converters + deriveKind) |
| 2 | `server/services/aws.js` (smooth helper.js) | ✅ 2026-04-27 | (this commit) | 4 tests green; 4 factories + module-private readPhotoAppConfig; explicit-await on getDbConn |
| 4 | `server/middleware/upload.js` + cleanupTempFile | ✅ 2026-04-27 | (this commit) | 5 tests green; multer with no MIME filter (Q9), 50 MB limit, cleanupTempFile defensive on missing |
| (1+2+4 PARALLEL — subagent dispatch) | | | | |
| 3 | `server/services/photoapp.js` read use cases | ✅ 2026-04-27 | (this commit) | 12 tests green covering getPing, listUsers, listImages (4 cases), getImageLabels (3 cases), searchImages (3 cases) |
| 5 | `server/services/photoapp.js` write use cases | ⏳ | — | photoapp_service.test.js write tests green |
| 6 | `server/routes/photoapp_routes.js` | ⏳ | — | photoapp_routes.test.js green |
| 7 | `server/middleware/error.js` | ⏳ | — | error.test.js green |
| (6+7 PARALLEL — subagent dispatch) | | | | |
| 8 | live integration tests (opt-in) | ⏳ | — | PHOTOAPP_RUN_LIVE_TESTS=1 → green |
| 9 | E2E smoke + README route-specific commands (after UI ready) | ⏳ | — | full curl evidence captured; README documents route-specific run/test commands |

State legend: ⏳ Planned · 🔄 In progress · ✅ Complete · 🚩 Blocked · ⚠️ Executed pre-approval (reverification required at resumption)

---

## Phase 0: Pre-Execution Prep

**Goal:** confirm everything still works after the recent doc revisions; install runtime deps that 03 needs.

> **⚠️ Pre-approval execution flag (2026-04-27 refresh ritual):** Tasks 0.1 + 0.2 were executed during plan-writing 2026-04-26 in auto mode, **before plan review and approval**. The work landed in commit `a50ef8c` (npm install of `multer` + `ini` + `uuid@9`; install-log entry; smoke verification). When execution resumes post-approval, treat the outputs as an **untrusted accelerator** — re-verify each deliverable rather than skip the phase. Specifically:
>
> - Verify the three packages are installed (`npm ls multer ini uuid`) and spot-check installed versions against `package.json` `dependencies` pins.
> - Re-run `npm test` to confirm 5/5 suites + 8/8 tests still green.
> - Re-run the `/health` + `/api` smoke.
> - Re-read `MetaFiles/install-log.md` 2026-04-26 entry for context (the audit-finding rationale especially).
>
> The work is not wasted — but the approval gate was bypassed, so the verification gate must compensate. Plan tracker will flip Phase 0 from ⚠️ → ✅ once these reverification steps complete during resumption.
>
> **✅ Reverification completed 2026-04-27** (post-approval, plan greenlit by reviewing agent):
>
> - `npm ls multer ini uuid` → `multer@2.1.1`, `ini@6.0.0`, `uuid@9.0.1`; matches `package.json` pins (`^2.1.1`, `^6.0.0`, `^9.0.1`).
> - `npm test` → 5 suites / 8 tests, all green.
> - `/health` → `{"status":"running"}`; `/api` → placeholder envelope `{"message":"success","data":{"service":"photoapp-api","status":"placeholder"}}`.
> - `MetaFiles/install-log.md` 2026-04-26 entry context confirmed (uuid <14 advisory unreachable in our usage; v14 is ESM-only and would break Jest CommonJS transform).
>
> Phase 0 ⚠️ → ✅ at this commit.

### Task 0.1: Verify existing tests still pass

**Files:** none modified. Read-only verification.

- [x] **Step 0.1.1:** From `Part03/`, run `npm test`. Expected: 5 suites / 8 tests / all green (the Server Foundation 02 result). _2026-04-26 — Confirmed: 5 suites / 8 tests, all green._
- [x] **Step 0.1.2:** Run `npm start` in background, then `curl -s http://localhost:8080/health` (expect `{"status":"running"}`), `curl -s http://localhost:8080/api` (expect placeholder envelope), kill the server. Confirms baseline still works post-doc-revisions. _2026-04-26 — `/health` returned `{"status":"running"}`; `/api` returned `{"message":"success","data":{"service":"photoapp-api","status":"placeholder"}}`._
- [x] **Step 0.1.3:** Run `git status` — confirm working tree clean. _2026-04-26 — Clean (2 ahead of origin/main from plan commit + earlier work)._

**Atomic doc update:** mark Task 0.1 ✅ in this plan tracker (was ⚠️ pre-approval per EOR-5; reverified 2026-04-27 — see Phase 0 blockquote above). (No 03 boxes apply — pre-03.) _Done 2026-04-26 (commit a50ef8c); reverification confirmed 2026-04-27._

**Commit:** none (read-only verification).

### Task 0.2: Install runtime deps for 03

**Why uuid is back:** the production polish (commit `dbe05d3`) removed `uuid` because it was unused. 03 Phase 5 `uploadImage` uses it for the bucketkey shape `<username>/<uuid>-<localname>`. Re-installing pinned to `v9` for CommonJS compatibility (per refactor-log 2026-04-26 Phase 2 side-finding — `uuid@14` is ESM-only and would need `transformIgnorePatterns` in jest config).

**Files modified:**
- `package.json` (devDependency moves)
- `package-lock.json`
- `Part03/MetaFiles/install-log.md` (append entry)

- [x] **Step 0.2.1:** From `Part03/`, run `npm install --save multer ini uuid@9`. Capture output. _2026-04-26 — exit 0; 15 packages added; 530 audited; 1 moderate vuln (uuid <14, unreachable in our usage; not fixed because v14 is ESM-only and would break Jest)._

- [x] **Step 0.2.2:** Append entry to `Part03/MetaFiles/install-log.md`: _2026-04-26 — entry written._

```markdown
## 2026-04-26 — Phase 0 install: multer, ini, uuid@9 for /api/* implementation

- **Source:** `03-api-routes-plan.md` Phase 0 Task 0.2.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install --save multer ini uuid@9`
- **Exit code:** `0`
- **Packages added:** `multer@<vN>`, `ini@<vN>`, `uuid@<v9.x>`. (Note: uuid is pinned to v9 for CommonJS compatibility — v14 is ESM-only and would require jest transformIgnorePatterns. See refactor-log.md 2026-04-26 Phase 2 side-finding.)
- **Vulnerabilities:** record `npm audit` count.
- **Notes:** these three packages are runtime deps for 03's PhotoApp service module + multipart upload middleware.
```

- [x] **Step 0.2.3:** Run `npm test` → confirm 5/5 suites green (no regression from new deps). _2026-04-26 — 5/5 suites, 8/8 tests, all green._

**Atomic doc update:** mark Task 0.2 ✅; install-log entry written. _Done._

**Commit:** `Part03 03 Phase 0: install multer + ini + uuid@9 for /api/* implementation`. Files: `package.json`, `package-lock.json`, `MetaFiles/install-log.md`, this plan tracker update.

---

## Pre-Phase 1: Schema Migration

**Reference:** 03 §"Pre-Phase 1: Schema migration for `kind` column".

**Critical context:** ALTER TABLE on **live RDS**. Forward-only. Existing rows get default `'photo'`. The migration is a **one-shot** operation — never re-run after a `rebuild-db` (will fail with "column already exists" because `create-photoapp.sql` updates make rebuild include `kind` natively).

### Task M.1: Write the migration SQL file

**Files:**
- Create: `MBAi460-Group1/projects/project01/migrations/2026-04-26-add-assets-kind.sql`

- [x] **Step M.1.1:** Create the migrations directory if missing (`mkdir -p MBAi460-Group1/projects/project01/migrations`). _2026-04-27 — created._
- [x] **Step M.1.2:** Create the SQL file with content from 03 Pre-Phase 1. _2026-04-27 — created `2026-04-26-add-assets-kind.sql`. **Parser bug surfaced + fixed:** initial draft had semicolons inside `--` comments; `_run_sql.py` splits naively on `;` and broke parsing. Rewrote without comment-semicolons; ran cleanly second time._
- [x] **Step M.1.3:** Visually inspect — confirm: ENUM ordering (`'photo','document'`), `NOT NULL`, `DEFAULT 'photo'`, `AFTER bucketkey`. _2026-04-27 — confirmed._

**Atomic doc update:** Task M.1 ✅. No commit yet (batch with M.2 + M.3). _Done._

### Task M.2: Update `create-photoapp.sql` for fresh-rebuild compatibility

**Files:**
- Modify: `MBAi460-Group1/projects/project01/create-photoapp.sql`

- [x] **Step M.2.1:** Read the existing `create-photoapp.sql`. _2026-04-27 — read._
- [x] **Step M.2.2:** Find the `CREATE TABLE assets (...)` statement; add the column line:
  ```sql
  kind ENUM('photo','document') NOT NULL DEFAULT 'photo',
  ```
  positioned AFTER `bucketkey` and BEFORE the closing `)`. _2026-04-27 — added; column-name padding aligned to existing 4 columns (type starts at col 18)._
- [x] **Step M.2.3:** Visually inspect. _2026-04-27 — confirmed._

**Atomic doc update:** Task M.2 ✅. _Done._

### Task M.3: Update validate-db check

**Files:**
- Modify: `MBAi460-Group1/utils/_validate_db.py`

- [x] **Step M.3.1:** Read `_validate_db.py`. Find the existing column-shape checks (style template). _2026-04-27 — read; `cols = {r[0]: r for r in cur.fetchall()}` pattern noted._
- [x] **Step M.3.2:** Add a check that `assets.kind` exists with `ENUM('photo','document')` and `NOT NULL`. Match existing check style (function name, message format). _2026-04-27 — single composite check inserted after the bucketkey check; uses `detail=str(cols.get('kind'))` for diagnostic output. Total checks: 26 → 27._

**Atomic doc update:** Task M.3 ✅. _Done._

### Task M.4: Run the migration on live RDS

**Files:** none modified (executes SQL).

- [x] **Step M.4.1:** Confirm Docker up: `utils/lab-status` (from repo root `mbai460-client/`). If down, halt and prompt Erik. _2026-04-27 — Lab operational (Colima + Docker daemon green, image present)._
- [x] **Step M.4.2:** Run `MBAi460-Group1/utils/run-sql MBAi460-Group1/projects/project01/migrations/2026-04-26-add-assets-kind.sql` (from repo root). Capture output. _2026-04-27 — first run failed (comment-semicolon parser bug; see Step M.1.2 note); second run after SQL fix: `Statements: 2 | OK: 2 | Errors: 0 | All statements executed successfully.`_
- [x] **Step M.4.3:** Expect "Query OK" / 0 warnings. If error, halt and surface. _2026-04-27 — both `USE photoapp` and `ALTER TABLE assets ADD COLUMN kind ...` reported `[OK] (rows affected: 0)`._

**Atomic doc update:** Task M.4 ✅. _Done._

### Task M.5: Verify migration

- [x] **Step M.5.1:** Run `MBAi460-Group1/utils/validate-db` (from repo root). Expect 27/27 checks green (was 26/26 + the new kind check). _2026-04-27 — kind check PASSED: `[PASS] assets.kind: ENUM('photo','document') NOT NULL — ('kind', "enum('photo','document')", 'NO', '', 'photo', '')`. **Pre-existing unrelated failure surfaced (out-of-scope):** validate-db expects empty assets table but live RDS has 10 rows (prior testing). 26 PASS / 1 FAIL — the FAIL is the assets-empty assertion, not the kind check. Soft flag for later cleanup._
- [x] **Step M.5.2:** Run an inline `SELECT kind, COUNT(*) FROM photoapp.assets GROUP BY kind;` query via `run-sql` (write a tiny query.sql or use the inline mode). Expect `photo` rows only (existing 1 row = `01degu.jpg`). _2026-04-27 — wrote temp `_verify-kind.sql` inside `migrations/` (run-sql requires SQL files inside the Class Project repo); query returned 1 group (rows affected: 1) → all 10 existing rows defaulted to `'photo'`. Temp file cleaned up._

**Atomic doc update for the whole Pre-Phase 1:**
- Mark M.1–M.5 ✅ in this plan + Pre-Phase 1 boxes in 03. _2026-04-27 — done._
- Append a `## 2026-04-27 — Pre-Phase 1: Schema migration for kind column` entry to `Part03/MetaFiles/refactor-log.md` documenting: SQL run, validate-db output, baseline row count, parser-bug side-finding. _2026-04-27 — done in this commit._

**Commit:** `Part03 03 Pre-Phase 1: schema migration for kind column (live RDS migrated; create-photoapp.sql + validate-db updated)`.

**Risk note:** ALTER could fail if RDS is sleeping or creds drift. Capture full error verbatim if it happens. Rollback: `ALTER TABLE photoapp.assets DROP COLUMN kind;` (additive, no data loss). _2026-04-27 — actual failure encountered was different: `_run_sql.py` naive `;`-split tripped on semicolons inside `--` comments. Fixed at SQL-file level (no comment-semicolons). The script-hardening fix is out-of-scope; captured as a TODO-worthy parser bug._

---

## Phase 1+2+4: PARALLEL SUBAGENT DISPATCH (Calibration Test #1)

**Why parallel:** `server/schemas.js` (Phase 1), `server/services/aws.js` (Phase 2), and `server/middleware/upload.js` (Phase 4) are **three independent files with disjoint test surfaces**. No cross-imports between them at this stage. Perfect parallelism opportunity.

**Hypothesis:** parallel subagents save ~50% wall time vs. sequential, with no quality cost when each subagent has tight scope.

### Task P.1: Dispatch 3 subagents in parallel

- [x] **Step P.1.1:** Single message with three Agent tool invocations (parallel runtime fan-out). _2026-04-27 — three general-purpose subagents dispatched in parallel; agentIds a6d4163d (Phase 1), acd4ca60 (Phase 2), a5bf6451 (Phase 4)._

**Subagent 1 brief — Phase 1: `server/schemas.js`** (full text written at dispatch time, summarized here):

- Read `MetaFiles/Approach/03-api-routes.md` §Phase 1 (Tasks 1.1, 1.2, 1.3).
- Implement, in `server/schemas.js`:
  - `successResponse(data)` and `errorResponse(err)` (envelope helpers; `errorResponse` coerces Error instances to message string).
  - `userRowToObject`, `imageRowToObject` (with `kind` per Q8), `labelRowToObject`, `searchRowToObject`.
  - `deriveKind(filename)` — `PHOTO_EXTENSIONS` Set; default `'document'`.
- Tests in `server/tests/schemas.test.js`. TDD discipline — write tests first, watch them fail (or note that `npm test -- schemas.test.js` reports module-not-found), implement, watch green.
- Run `npm test -- schemas.test.js` and confirm all green.
- Mark Phase 1 task checkboxes `[x]` with date in `MetaFiles/Approach/03-api-routes.md`.
- DO NOT touch any other source file or test file. DO NOT modify the plan or 02/00 docs.
- Return: list of files written, total test count, any deviations from 03's spec, any opens.

**Subagent 2 brief — Phase 2: `server/services/aws.js`** (full text at dispatch time):

- Read `MetaFiles/Approach/03-api-routes.md` §Phase 2 (Tasks 2.1, 2.2).
- Implement, in `server/services/aws.js`:
  - Module-private `readPhotoAppConfig()` helper — reads `config.photoapp_config_filename` via `fs.readFileSync` + `ini.parse`.
  - `getDbConn()` — async, **explicit `return await mysql2.createConnection(...)`** (NOT the legacy implicit double-Promise pattern); `multipleStatements: false`.
  - `getBucket()` — `S3Client` configured from `[s3].region_name` + `fromIni({profile: config.photoapp_s3_profile})`.
  - `getBucketName()` — returns `[s3].bucket_name`.
  - `getRekognition()` — `RekognitionClient`, same region/profile.
- Tests in `server/tests/aws.test.js` — `jest.mock('fs')` + a sample ini fixture string per 03 Phase 2 Task 2.1 + the explicit-await assertion from Task 2.2.
- Run `npm test -- aws.test.js` and confirm all green.
- Mark Phase 2 task checkboxes `[x]` with date in 03 doc.
- DO NOT touch any other file. DO NOT touch existing `server/helper.js` (legacy reference; deletion deferred to end of Part 03).
- Return: file list, test count, deviations, opens.

**Subagent 3 brief — Phase 4: `server/middleware/upload.js`** (full text at dispatch time):

- Read `MetaFiles/Approach/03-api-routes.md` §Phase 4 (Tasks 4.1, 4.2).
- Implement, in `server/middleware/upload.js`:
  - `multer` config — `dest: TEMP_DIR (path.join(os.tmpdir(), 'photoapp-uploads'))`, 50MB size limit, **NO file filter** (per Q9 — accept all MIMEs).
  - `cleanupTempFile(absPath)` — deletes if exists; never throws.
  - Exports: `{ upload, TEMP_DIR, cleanupTempFile }`.
- Tests in `server/tests/upload.test.js` per 03 Phase 4 — accepts JPEG, accepts PDF, rejects > 50MB, cleanup removes existing, cleanup is no-op on missing.
- Run `npm test -- upload.test.js` and confirm all green.
- Mark Phase 4 task checkboxes `[x]` with date in 03 doc.
- DO NOT touch any other file.
- Return: file list, test count, deviations, opens.

**Each subagent must:**
- Use proper module exports (`module.exports = { ... }`); no `Object.assign(window, ...)` style.
- Run their target test file ONLY before returning (full `npm test` is a main-thread step after merge).
- Keep imports minimal and clean.

### Task P.2: Verify all three subagents merged cleanly

- [x] **Step P.2.1:** Receive all 3 subagent reports. _2026-04-27 — all three returned with structured reports + test-green confirmation._
- [x] **Step P.2.2:** From `Part03/`, run full `npm test`. Expected: 5 (existing) + 3 new suites; all green. Total test count climbs by ~10–15. _2026-04-27 — 8 suites / 27 tests, all green. Delta: +3 suites, +19 tests (10 schemas + 4 aws + 5 upload)._
- [x] **Step P.2.3:** `git status` to confirm only the expected files changed. _2026-04-27 — only the 6 expected files in working tree (3 source + 3 test); no stray edits._

### Task P.3: Atomic doc update + commit

- [x] **Step P.3.1:** Update Master Tracker: Phases 1, 2, 4 → ✅ with this commit hash + date. _2026-04-27 — done._
- [x] **Step P.3.2:** Confirm 03 doc Phase 1, 2, 4 task checkboxes are `[x]` (subagents did this; verify). _2026-04-27 — N/A: 03 doesn't have task-level checkboxes for Phase 1/2/4 (only Pre-Phase 1 had them). Subagents were instructed to skip 03 box-flips per scope discipline; no checkboxes to verify._
- [x] **Step P.3.3:** Single commit: `Part03 03 Phase 1+2+4: schemas + aws factory + upload middleware (parallel subagent dispatch)`. _2026-04-27 — this commit._

**Subagent calibration log entry:** append to `claude-workspace/scratch/system-plane-notes.md` Subagents section: total wall time, sum of token usage across 3 subagents, any scope-discipline issues, coherence outcomes.

---

## Phase 3: PhotoApp Service Module — Read Use Cases (Main Thread)

**Reference:** 03 §Phase 3 (Tasks 3.1–3.5).

**Why main thread:** all five tasks land in `server/services/photoapp.js` — same file. Sequential to avoid merge complexity.

### Task 3.1: `getPing()` — S3 object count + user count

**Files:**
- Create: `server/services/photoapp.js`
- Create: `server/tests/photoapp_service.test.js`

- [x] **Step 3.1.1:** Write the failing test per 03 Task 3.1 (jest.mock services/aws; fakeBucket + fakeDb mocks). _2026-04-27 — written._
- [x] **Step 3.1.2:** Run `npm test -- photoapp_service.test.js`. Expected: RED (`getPing is not a function` or module not found). _2026-04-27 — RED confirmed (module not found at `require('../services/photoapp')`)._
- [x] **Step 3.1.3:** Implement `getPing()` per 03's behavior spec — `Promise.all([s3.send(ListObjectsV2Command), db.execute('SELECT count(userid) ...')])`; return `{s3_object_count, user_count}`; close DB in `finally`. _2026-04-27 — implemented; `??` coalesce on `KeyCount` for safety._
- [x] **Step 3.1.4:** Run `npm test -- photoapp_service.test.js`. Expected: GREEN. _2026-04-27 — 1/1 test green._

**Atomic doc update:** Task 3.1 ✅ in this plan; 03 Task 3.1 boxes checked. _2026-04-27 — 03 has no task-level boxes for Phase 3 (only Pre-Phase 1 had them); plan Step 3.1 boxes flipped._

**Commit:** `Part03 03 Phase 3.1: getPing() — S3 object count + user count`. _2026-04-27 — this commit._

### Task 3.2: `listUsers()`

- [x] **Step 3.2.1:** Write failing test per 03 Task 3.2. _2026-04-27 — written; added regex assertion on the SELECT statement._
- [x] **Step 3.2.2:** Run test → RED. _2026-04-27 — RED confirmed (`listUsers is not a function`)._
- [x] **Step 3.2.3:** Implement per 03 — `SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC`; map through `userRowToObject`; `dbConn.end()` in finally. _2026-04-27 — implemented._
- [x] **Step 3.2.4:** Run test → GREEN. _2026-04-27 — 2/2 tests green._
- [x] Atomic doc update + commit: `Part03 03 Phase 3.2: listUsers()`. _2026-04-27 — this commit._

### Task 3.3: `listImages(userid?)` (with kind, mixed-kind round-trip)

- [x] **Step 3.3.1:** Write failing tests per 03 Task 3.3 (both query forms + mixed-kind result test). _2026-04-27 — wrote 4 tests: no-userid, with-userid, mixed-kind round-trip, end()-on-failure._
- [x] **Step 3.3.2:** Run → RED. _2026-04-27 — 4 fail / 2 pass (listImages undefined)._
- [x] **Step 3.3.3:** Implement per 03: SELECT includes `kind`; ORDER BY assetid ASC; with/without `WHERE userid = ?`. _2026-04-27 — implemented; ternary on `userid !== undefined` to choose SQL form._
- [x] **Step 3.3.4:** Run → GREEN. _2026-04-27 — 6/6 tests green._
- [x] Atomic doc update + commit: `Part03 03 Phase 3.3: listImages() with kind`. _2026-04-27 — this commit._

### Task 3.4: `getImageLabels(assetid)`

- [x] **Step 3.4.1:** Write failing tests per 03 Task 3.4 (unknown assetid throws; known with no labels returns []; known with labels returns mapped rows). _2026-04-27 — wrote 3 tests using `mockResolvedValueOnce` to sequence the validation + labels SELECTs._
- [x] **Step 3.4.2:** Run → RED. _2026-04-27 — 3 fail / 6 pass (getImageLabels undefined)._
- [x] **Step 3.4.3:** Implement per 03: `SELECT assetid FROM assets WHERE assetid = ?` validates; `SELECT label, confidence FROM labels WHERE assetid = ? ORDER BY confidence DESC`; throws `'no such assetid'` on missing. _2026-04-27 — implemented; throw inside try block so `finally` still closes the connection._
- [x] **Step 3.4.4:** Run → GREEN. _2026-04-27 — 9/9 tests green._
- [x] Atomic doc update + commit: `Part03 03 Phase 3.4: getImageLabels()`. _2026-04-27 — this commit._

### Task 3.5: `searchImages(label)`

- [x] **Step 3.5.1:** Write failing tests per 03 Task 3.5 (empty throws 'label is required'; non-empty returns mapped rows). _2026-04-27 — wrote 3 tests: empty string, whitespace-only, non-empty with mapped rows + LIKE pattern + ORDER BY assertion._
- [x] **Step 3.5.2:** Run → RED. _2026-04-27 — 3 fail / 9 pass (searchImages undefined)._
- [x] **Step 3.5.3:** Implement per 03: throw `Error('label is required')` on empty/whitespace; otherwise `SELECT assetid, label, confidence FROM labels WHERE label LIKE ? ORDER BY assetid ASC, label ASC` with `%${label}%`. _2026-04-27 — implemented; throw is BEFORE opening DB connection (saves a roundtrip on bad input)._
- [x] **Step 3.5.4:** Run → GREEN. _2026-04-27 — 12/12 tests green._
- [x] Atomic doc update + commit: `Part03 03 Phase 3.5: searchImages()`. _2026-04-27 — this commit._

**Phase 3 wrap:** Master Tracker Phase 3 → ✅ with last commit hash. _2026-04-27 — done in this commit._

---

## Phase 5: PhotoApp Service Module — Write Use Cases (Main Thread)

**Reference:** 03 §Phase 5 (Tasks 5.1, 5.2, 5.3).

**Why main thread:** continues `photoapp.js`; same file as Phase 3.

### Task 5.1: `uploadImage(userid, multerFile)` — branch on kind

**Files:**
- Modify: `server/services/photoapp.js`
- Modify: `server/tests/photoapp_service.test.js`

- [x] **Step 5.1.1:** Write failing tests per 03 Task 5.1 (in this order — photo path baseline first, document branch test second; per the reviewer-flag fix):
  - `uploadImage rejects unknown userid`
  - `uploadImage round-trips through S3, Rekognition, and INSERT (photo path)`
  - `uploadImage stores a document without calling Rekognition (Q9)`
  _2026-04-27 — wrote 3 tests in the prescribed order. Added `jest.mock('../middleware/upload')` and partial `jest.mock('fs')` at file top (the `jest.requireActual('fs')` pattern from Subagent B's earlier finding) so AWS SDK token-providers don't break at module load._
- [x] **Step 5.1.2:** Run → RED. _2026-04-27 — 3 fail / 12 pass (uploadImage undefined)._
- [x] **Step 5.1.3:** Implement per 03 §Phase 5.1 — Shared prelude (validate userid → bucketkey → kind → buffer → S3 PutObject → assets INSERT) → branch on kind (photo: Rekognition + labels INSERT; document: skip both) → shared epilogue (cleanupTempFile + dbConn.end in finally). _2026-04-27 — implemented. Bucketkey shape `<username>/<uuid>-<localname>` per 00 contract; kind via `deriveKind`; INSERT IGNORE INTO labels for photo path; ROUND(confidence) for integer column._
- [x] **Step 5.1.4:** Run → GREEN. **Note:** the photo-path round-trip test in 03 has a "(setup mocks for ...)" placeholder — write the actual mock assertions as you implement (set `aws.getBucket().send` resolved values, `aws.getRekognition().send` returns DetectLabels output, etc.). _2026-04-27 — 15/15 tests green; photo-path test asserts `s3Send` + `rekogSend` called once each, INSERT INTO assets receives `kind='photo'`, bucketkey matches `^p_sarkar/[0-9a-f-]+-01degu\.jpg$`, cleanupTempFile called._
- [x] Atomic doc update + commit: `Part03 03 Phase 5.1: uploadImage() with photo + document branches`. _2026-04-27 — this commit._

### Task 5.2: `downloadImage(assetid)` — streams S3 to response

- [x] **Step 5.2.1:** Write failing tests per 03 Task 5.2 (unknown assetid throws; known returns the streamable shape). _2026-04-27 — wrote 4 tests: unknown throws, known returns streamable shape with S3 ContentType, fallback to ext map (PDF), fallback to octet-stream for unknown ext._
- [x] **Step 5.2.2:** Run → RED. _2026-04-27 — 4 fail / 15 pass (downloadImage undefined)._
- [x] **Step 5.2.3:** Implement per 03 — DB lookup → `GetObjectCommand` → return `{ bucketkey, localname, contentType: s3Result.ContentType ?? contentTypeFromExt(localname), s3Result }`. Module-private `contentTypeFromExt` helper inside `services/photoapp.js` (full ext map per 03 Task 5.2 — includes `.pdf → application/pdf`). _2026-04-27 — implemented; module-private `CONTENT_TYPE_BY_EXT` constant + `contentTypeFromExt()` function; not exported._
- [x] **Step 5.2.4:** Run → GREEN. _2026-04-27 — 19/19 tests green._
- [x] Atomic doc update + commit: `Part03 03 Phase 5.2: downloadImage() with content-type fallback chain`. _2026-04-27 — this commit._

### Task 5.3: `deleteAll()` — DB-first ordering

- [ ] **Step 5.3.1:** Write failing tests per 03 Task 5.3 (empty DB → no S3; non-empty → DELETE labels before DELETE assets, then S3 DeleteObjects; DB delete failure short-circuits).
- [ ] **Step 5.3.2:** Run → RED.
- [ ] **Step 5.3.3:** Implement per 03 — read bucketkeys, DELETE FROM labels, DELETE FROM assets, close conn, then S3 DeleteObjects (batched).
- [ ] **Step 5.3.4:** Run → GREEN.
- [ ] Atomic doc update + commit: `Part03 03 Phase 5.3: deleteAll() with DB-first ordering`.

**Phase 5 wrap:** Master Tracker Phase 5 → ✅.

---

## Phase 6+7: Routes + Error Middleware (PARALLEL SUBAGENT DISPATCH — Calibration Test #2)

**Why parallel:** `server/routes/photoapp_routes.js` and `server/middleware/error.js` are independent files. **Reviewing-agent concern (2026-04-27):** route + error middleware are coupled enough that sequential might be safer. **Mitigation — three-tier test factoring:**

- **Phase 6 unit tests** (Subagent A): route happy paths + inline-route-validation 400s only. No error-middleware envelope assertions.
- **Phase 7 unit tests** (Subagent B): error middleware in **isolation** — tiny self-contained Express app inside the test file; do NOT load the real `app.js`.
- **Integration test** (Task Q.2 Step Q.2.0, main thread): NEW `server/tests/integration_routes_error.test.js` — real `app`, mocked services, verifies end-to-end route → error-middleware flow.

This produces three test surfaces with disjoint dependencies; both subagents pass tests pre-merge; main-thread integration verifies wiring post-merge.

**Hypothesis under test:** parallel subagents work for separate-but-coupled files IF the test layering is properly factored (unit vs. integration). Test #2 measures whether "isolated unit tests + main-thread integration test" cleanly separates parallel work.

**Fallback:** if either subagent reports unexpected coordination friction, fall back to main-thread sequential cleanup. The Step Q.2.0 integration test is the canonical verification regardless of dispatch path.

**Coordination concern:** only Subagent B touches `server/app.js`. Subagent A modifies `routes/photoapp_routes.js` (body replacement only — the `/api` mount in `app.js` is already in place from Server Foundation 02 and stays unchanged). Subagent B appends `app.use(require('./middleware/error'));` at the END of `app.js` (last middleware, AFTER static + SPA fallback per Express convention). No merge conflict surface.

### Task Q.1: Dispatch 2 subagents in parallel

- [ ] **Step Q.1.1:** Single message with two Agent tool invocations.

**Subagent A brief — Phase 6: `server/routes/photoapp_routes.js`** (full text at dispatch):

- Read 03 §Phase 6 (Tasks 6.1–6.9).
- **Replace** the existing placeholder `server/routes/photoapp_routes.js` (created by 02 Phase 7) with the full router per 03. Imports: `express`, `Router`, `services/photoapp`, `middleware/upload` (just `upload`), `schemas` (both `successResponse` and `errorResponse`).
- Implement all 8 routes per 03's per-task specs (Tasks 6.2–6.9; routes register WITHOUT the `/api` prefix — the mount in `app.js` makes them `/api/*` from the client's view):
  - `GET /ping` → `successResponse(getPing())`
  - `GET /users` → `successResponse(listUsers())`
  - `GET /images` (with `?userid=` parsing) → `successResponse(listImages(userid?))`
  - `POST /images` (multer-wrapped, multipart) → `successResponse(uploadImage(userid, req.file))`
  - `GET /images/:assetid/file` → stream S3 `s3Result.Body.pipe(res)` with `Content-Type` header
  - `GET /images/:assetid/labels` → `successResponse(getImageLabels(assetid))`
  - `GET /search?label=` → validate non-empty, then `successResponse(searchImages(label))`
  - `DELETE /images` → `successResponse(deleteAll())`
- **Do NOT modify `server/app.js`** — Server Foundation 02 already mounted the placeholder router at `app.use('/api', require('./routes/photoapp_routes'))`. Phase 6's job is to replace the BODY of `routes/photoapp_routes.js` (the placeholder handler) with the real router; the mount line in `app.js` stays unchanged.
- Tests in `server/tests/photoapp_routes.test.js` — `jest.mock('../services/photoapp')` and `jest.mock('../middleware/upload')` (multer mock); supertest against the exported `app`. **Test scope (decoupled from Phase 7 — calibration design):**
  - Happy paths for each route (200 + envelope `{message: 'success', data: ...}`).
  - Inline-route-validation 400 envelopes (e.g., missing `file` for `POST /api/images`, non-int `userid` parse, missing `?label=`). These come from validation IN the route handler, not from error middleware.
  - **DO NOT** assert error envelope shapes from service-thrown exceptions (e.g., `Error('no such userid')` → 400) — those are Phase 7's territory and verified in the integration test (Task Q.2 Step Q.2.0).
- Run `npm test -- photoapp_routes.test.js` and confirm GREEN.
- Mark Phase 6 task checkboxes `[x]` with date in 03 doc.
- DO NOT modify Phase 7 files.
- Return: files written, test counts (passing + pending error-middleware), `app.js` diff, opens.

**Subagent B brief — Phase 7: `server/middleware/error.js`** (full text at dispatch):

- Read 03 §Phase 7 (Task 7.1).
- Implement `server/middleware/error.js`:
  - Exact-match conditions (per the reviewer-flag fix):
    - `err.message === 'no such userid'` → 400 envelope.
    - `err.message === 'no such assetid'` → 404 envelope.
    - `err.code` startsWith `'LIMIT_'` → 400 envelope.
    - else → 500 with `errorResponse('internal server error')` + `console.error('UNHANDLED ERROR:', err)`.
  - Single export: `module.exports = errorMiddleware;`.
- Modify `server/app.js`: append `app.use(require('./middleware/error'));` at the END of the file, AFTER static + SPA fallback.
- Tests in `server/tests/error.test.js` — **isolation pattern (decoupled from Phase 6 — calibration design)**: build a tiny self-contained Express app inside the test file with contrived throwing routes; mount the error middleware on it; assert behavior. Do NOT load the real `app.js`.

  Example shape:
  ```js
  const express = require('express');
  const request = require('supertest');
  const errorMw = require('../middleware/error');

  function buildIsolatedApp(routeHandlers) {
    const app = express();
    for (const [path, handler] of Object.entries(routeHandlers)) {
      app.get(path, handler);
    }
    app.use(errorMw);
    return app;
  }

  test('error mw maps "no such userid" to 400', async () => {
    const app = buildIsolatedApp({
      '/throws': (req, res, next) => next(new Error('no such userid')),
    });
    const res = await request(app).get('/throws');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'error', error: 'no such userid' });
  });
  ```

  03's Phase 7 example test (which uses supertest against the real `app`) becomes the integration test in Task Q.2 Step Q.2.0. Phase 7 unit tests are isolation-only.
- Three error-mapping tests required: `'no such userid'` → 400, `'no such assetid'` → 404, generic Error → 500 with `'internal server error'` message. Optionally a fourth: multer `LIMIT_*` → 400.
- Run `npm test -- error.test.js` and confirm GREEN. Tests are self-contained; no Phase 6 dependency.
- Mark Phase 7 task checkboxes `[x]` with date in 03 doc.
- DO NOT modify Phase 6 files.
- Return: files written, test count, `app.js` diff, opens.

### Task Q.2: Verify merge + write integration test

- [ ] **Step Q.2.0 (NEW — main thread):** Write `server/tests/integration_routes_error.test.js` — the canonical end-to-end verification of route → error middleware flow. Uses the real `app`, mocks services per-test:
  - `POST /api/images` with `userid` that triggers `Error('no such userid')` from mocked `photoapp.uploadImage` → 400 envelope `{message: 'error', error: 'no such userid'}`.
  - `GET /api/images/:assetid/labels` where mocked `photoapp.getImageLabels` throws `Error('no such assetid')` → 404 envelope.
  - `GET /api/users` where mocked `photoapp.listUsers` throws `Error('SQL connection refused')` → 500 envelope with sanitized `'internal server error'` message.
  This is what 03's Phase 7 example test was originally — relocated here to live at the proper integration layer.
- [ ] **Step Q.2.1:** Receive both subagent reports.
- [ ] **Step Q.2.2:** Inspect `git diff server/app.js` — confirm only Subagent B's edit applied (the `app.use(require('./middleware/error'));` append at end of file).
- [ ] **Step Q.2.3:** From `Part03/`, run full `npm test`. Expected: ALL suites green — Subagent A's route unit tests, Subagent B's error mw isolation tests, and the new integration test from Step Q.2.0.
- [ ] **Step Q.2.4:** Optional live smoke: `npm start` in background, `curl http://localhost:8080/api/ping` (real RDS+S3 — requires AWS creds loaded; may fail if env not set up; that's fine, Phase 8 covers live).

### Task Q.3: Atomic doc update + commit

- [ ] **Step Q.3.1:** Master Tracker: Phases 6 + 7 → ✅ with this commit hash.
- [ ] **Step Q.3.2:** Verify 03 doc Phase 6 + 7 boxes are `[x]` (subagents did this).
- [ ] **Step Q.3.3:** Single commit: `Part03 03 Phase 6+7+integration: routes + error mw + route↔error-mw integration test (parallel subagent dispatch + main-thread integration)`.

**Subagent calibration log entry:** append to System Plane Notes — wall time, token cost, scope discipline, the test-coupling outcome (did Subagent A's pending tests pass cleanly post-merge? any drift?).

---

## Phase 8: Live Integration Tests (Opt-In)

**Reference:** 03 §Phase 8 Task 8.1.

### Task 8.1: Add guarded live tests

**Files:**
- Create: `server/tests/live_photoapp_integration.test.js`

- [ ] **Step 8.1.1:** Implement per 03 — `RUN_LIVE = process.env.PHOTOAPP_RUN_LIVE_TESTS === '1'`; `maybeDescribe = RUN_LIVE ? describe : describe.skip`.
- [ ] **Step 8.1.2:** Initial test set: `GET /api/ping` returns success envelope, `GET /api/users` returns at least the 3 seeded users. Defer upload/labels/search/download/delete (mutating) until baseline confirms read-side health.
- [ ] **Step 8.1.3:** Run `npm test` → confirm live tests SKIPPED (default).
- [ ] **Step 8.1.4:** Run `PHOTOAPP_RUN_LIVE_TESTS=1 npm test -- live_photoapp_integration.test.js`. Expected: GREEN against real RDS + S3. Capture output.
- [ ] **Step 8.1.5:** Atomic doc update + commit: `Part03 03 Phase 8: opt-in live integration tests`.

---

## Phase 9: End-to-End Smoke Checklist

**Reference:** 03 §Phase 9.

**Gate:** runs only after the UI workstream's `frontend/dist/` exists. **Andrew's territory.** Do not block 03 completion on this — Phase 9 is the integration verification across 01 + 02 + 03.

**Coordination:** when Andrew's UI is ready (signal via `MetaFiles/Journal/`), come back and run Phase 9.

### Task 9.1: Run smoke checklist

- [ ] **Step 9.1.1:** Per 03 §Phase 9 — full curl walk + UI flow (upload, gallery, labels, search, download, delete). Capture raw outputs.
- [ ] **Step 9.1.2:** Append a `## 2026-XX-XX — Phase 9 E2E smoke evidence` section to this plan at the bottom.
- [ ] **Step 9.1.3:** Append a `## 2026-XX-XX — Server Foundation (02) + API Routes (03) + UI (01) integrated` entry to `Part03/MetaFiles/refactor-log.md`.
- [ ] **Step 9.1.4:** Atomic doc update + commit: `Part03 03 Phase 9: end-to-end smoke green; full integration verified`.

### Task 9.2: README updates for route-specific run/test commands

**Files:**
- Modify: `Part03/README.md`

- [ ] **Step 9.2.1:** Append a "Running the API" section with: `npm install`, `npm test`, `npm start`, plus `PHOTOAPP_RUN_LIVE_TESTS=1 npm test` for live integration tests, plus a short curl walk for `/api/ping` and `/api/users` against a running server.
- [ ] **Step 9.2.2:** Append a "Routes" section listing the 8 API endpoints with one-line summaries (link out to `MetaFiles/Approach/03-api-routes.md` for full spec).
- [ ] **Step 9.2.3:** Atomic doc update + commit: `Part03 03 Phase 9.2: README route-specific run/test commands`.

**Phase 9 wrap:** Master Tracker Phase 9 → ✅ once both Task 9.1 and Task 9.2 land. (Per 03's Acceptance Checklist line 1395: "README documents route-specific run/test commands.")

---

## Subagent Calibration Notes (logged at each parallel-dispatch boundary)

Append to `claude-workspace/scratch/system-plane-notes.md` Subagents section after each calibration test:

**Test #1 — Phase 1+2+4 parallel (3 independent files, disjoint test surfaces) — RESULT 2026-04-27:**
- **Wall time:** ~109s (longest of 3 parallel; Subagent B was longest due to an fs-mock issue). Estimated sequential: ~234s (sum). **Parallel saved ~125s wall (~53% reduction).**
- **Total token usage across 3 subagents:** ~81k (25k schemas + 33k aws + 23k upload). Main thread context preserved (only briefs + reports loaded into main).
- **Scope discipline:** ✅ all three stayed strictly in their 2 files each; no docs touched; no commits.
- **Coherence:** ✅ no naming/import drift. All three used CommonJS, matched existing codebase style, exported documented symbols.
- **Side-finding (Subagent B):** `jest.mock('fs')` (full auto-mock) broke `@aws-sdk/token-providers` because it destructures `fs.promises.writeFile` at module load time. Fix: partial mock with `jest.requireActual('fs')` + override only `readFileSync`. Captured for future jest+fs+aws-sdk-v3 patterns.
- **Verdict:** Parallel WON — 3 independent files with disjoint test surfaces is a clean parallelism opportunity. Confirms H1 (parallel wins for independent files).

**Test #2 — Phase 6+7 parallel (2 separate-but-coupled files; tests decoupled via three-tier factoring):**
- Wall time + tokens
- Coordination: only Subagent B touched `app.js` (Subagent A's territory is `routes/photoapp_routes.js` body); was the append clean?
- Test-factoring outcome: did Subagent A's route unit tests pass without depending on error mw? Did Subagent B's isolation tests pass without depending on routes? Did the main-thread integration test (Step Q.2.0) catch wiring issues that the unit tests missed?
- Verdict: "isolated unit tests + main-thread integration test" is the right factoring for separate-but-coupled parallel work? Or did sequential prove safer?

**Hypotheses to confirm/refute:**
- H1: parallel wins for independent files (Phase 1+2+4) — confirm or refute.
- H2: parallel + integration step works for coupled-test scenarios (Phase 6+7) — confirm or refute.
- H3: same-file sequential (Phase 3, 5) does not benefit from subagents — confirmed by not even attempting; document the rationale.

These observations feed into a future `feedback_subagent_calibration.md` memory at SD-5.

---

## Acceptance Evidence (filled at end)

_(Captured after Phase 9 smoke + final acceptance run.)_
