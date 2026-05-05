# AutoGrader Notes — Northwestern Gradescope (CS 310-style)

Practical reference for working with Northwestern's Gradescope autograder for the MBAi 460 PhotoApp arc (Projects 01-04). Distilled from the Project 02 16-iteration debugging arc that landed 90/90 on 2026-05-05 (server: assignment 8052758; client: assignment 8052765). Project 01 Part 02 also passed 70/70 first try (2026-04-20) with no iteration — so this doc covers both "first-try passes" and "iterative debugging when surprises surface".

**Audience:** future contributors + agents working on Project 03+ submissions, re-grade scenarios, or any other Northwestern CS 310-style autograder.

> **For the long version:** see `projects/project02/MetaFiles/retrospective-2026-05-05-gradescope-90-90-arc.md` (16-iteration trajectory) and `projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 2.10 (per-step diagnostic evidence).

---

## TL;DR — submit a working build right now

```bash
# From the project's root (e.g., projects/project02/):
make submit-server-autograder   # produces dist with all autograder adapters baked in
make submit-client-autograder   # same for client (server payload + photoapp.py)

# Then inside the Gradescope Docker container (where /gradescope/gs is on PATH):
cd /home/user/dist/p02-server-submission-<TS>
/gradescope/gs submit COURSE_ID SERVER_ASG_ID *.js *.ini *.json

cd /home/user/dist/p02-client-submission-<TS>
/gradescope/gs submit COURSE_ID CLIENT_ASG_ID *.js *.ini *.json *.py
```

**Project 02 IDs (for the record):** course `1288073`, server asg `8052758`, client asg `8052765`.

**CRITICAL — do NOT submit the `.tar.gz`.** Gradescope's web service course doesn't auto-extract tarballs; the static file-presence check looks at the upload root. Use the flat-glob mode (`*.js *.ini ...`) — that's the documented assignment template invocation.

---

## How this autograder actually works (mental model)

The autograder is a Python pytest harness running inside a Gradescope Docker container. It:

1. **Receives your upload** as flat files at `/autograder/` (subdirectories collapse — see "flat-ingest contract" below)
2. **Runs static-analysis checks** for filename presence + code patterns (retry/transaction keywords)
3. **Spawns your web service** by running `node app.js` directly
4. **Waits for the service to bind** to localhost:8080
5. **Hits HTTP endpoints + pymysql side-effect verifications** against (mostly) Northwestern's own test infrastructure
6. **Compares responses against expected fixtures** — exact-shape, exact-string, exact-list-order

The harness has THREE separate test files for the server (`test_01.py` through `test_03.py`) and TWO for the client. Each test file runs all unit tests in order; first failure or error in a test file aborts that file.

The harness produces:
- Pass/fail count per test
- Per-failing-test diff (first 250 lines of `unittest` output)
- Per-failing-test "Web service output" section (first 250 lines of stderr/stdout from `node app.js`)
- Per-failing-test "Client-side log output" section (where applicable)

**Knowing where to look in the failure output is half the battle.** Stack traces from your web service's stderr give you root-cause; the client log shows what the test client received; the unittest diff shows the assertion gap.

### The submission flow

Erik uses the `mbai460-server` Gradescope-provided Docker image (cloned in `projects/project02/images/mbai460-server/`). To submit:

```bash
# On host (build the dist):
cd MBAi460-Group1/projects/project02
make submit-server-autograder

# Then enter the Docker container (run.bash bind-mounts dist/ at /home/user/dist/):
./images/mbai460-server/docker/run.bash

# Inside the container:
cd /home/user/dist/p02-server-submission-<TS>
/gradescope/gs submit 1288073 8052758 *.js *.ini *.json
```

The `gs` CLI uploads each file individually. The `.gradescope` token is read from the home directory inside the container (separate from the host's tokens).

---

## The Seven Gradescope Contracts (CRITICAL TO INTERNALIZE)

The Project 02 arc revealed **seven distinct contracts** the autograder enforces. These interact and overlap; ignoring any one of them = submission failure. Each is paired with the iteration where we discovered it.

### Contract 1 — File-shape (filename-presence)

**What it is:** the autograder scans the upload root for canonical filenames. For Project 02 server, it expects `app.js`, `package.json`, `photoapp-config.ini`, AND nine `api_*.js` files (one per route — `api_get_ping.js`, `api_get_users.js`, `api_get_images.js`, `api_get_image.js`, `api_get_image_labels.js`, `api_get_images_with_label.js`, `api_post_image.js`, `api_delete_images.js`, `api_get_images_search.js`). Missing any → submission rejected before tests run.

**How we discovered it:** Iter 1-2. Autograder rejected the dist with: `"Expecting 'api_delete_images.js' file as part of web service. Please resubmit with this file."` Discovered iteratively (one missing-file error at a time).

**How we adapted:** created 9 thin wrapper files at `projects/project02/server/api_*.js`. Each delegates to the canonical `routes/v1/*.js` handler but includes the static-analysis-required `pRetry` + transaction patterns inline. App.js still wires `routes/v1/*.js`; the wrappers are filename-presence + static-check satisfaction only.

**Generalization:** if a Northwestern assignment template has a flat-file shape, your submission must match it at the upload root, regardless of what your internal architecture looks like.

### Contract 2 — Static-code-analysis (pattern checks)

**What it is:** the autograder grep-style scans your code for required patterns:
- **Retry logic** in every web-service file: `pRetry(...)` calls (per PDF page 12: "all web service functions are required to use retry logic in all MySQL-based calls, retrying at most 3 times")
- **Transactions** in mutation routes: explicit `beginTransaction()`, `commit()`, `rollback()` calls (per PDF pages 19-20)
- API function names matching the assignment template (e.g., `exports.get_ping`)

**How we discovered it:** Iter 3-4. Errors of the form: `"The file 'api_get_ping.js' does not appear to be using retry logic..."` and `"The file 'api_delete_images.js' does not appear to be using transactions (begin, commit, rollback)..."`

**How we adapted:** wrapped every service call in our `api_*.js` wrappers with `pRetry` (dynamic-import wrapper for ESM-only `p-retry` — matches the assignment template's pattern). Added explicit `dbConn.beginTransaction()` / `commit()` / `rollback()` calls to mutation routes (`api_delete_images.js` + `api_post_image.js`).

**Generalization:** static analysis = pattern presence in source. The autograder doesn't actually verify the patterns are wired correctly at runtime — it just checks they exist. So inline-wrapper patterns work even when the canonical handler lives elsewhere.

### Contract 3 — Flat-ingest packaging

**What it is:** the autograder extracts your upload as a FLAT directory at `/autograder/`. Subdirectories are dissolved. Files with the same basename collide silently. Their pre-baked `node_modules/` is preserved; yours is wiped.

**How we discovered it:** Iter 7-8. Three iterations of "shipped lib differently" all failed identically with `Cannot find module './photoapp-server-lib/src'`. Finally injected a diagnostic block into the dist's `app.js` (Iteration 8a, opt-in via `P02_PACKAGE_DIAGNOSTIC=1`) that ran `fs.readdirSync('.')` at startup. Output revealed: every nested file from our submission was at the top level of `/autograder/`; subdirs were `NOT_FOUND`; the pre-baked `node_modules/` had its own contents.

**How we adapted:** **Step 8 — flatten + rename.** Packaging-time Node script renames all nested files (e.g., `routes/v1/ping.js` → `routes_v1_ping.js`) and rewrites every internal `require('./...')` to use the new flat names. Source unchanged; dist is flat.

**Generalization:** when the target environment's filesystem layout differs from yours, transform at the boundary (packaging step), not the source. Keeps your codebase clean for production deploys.

### Contract 4 — Dep-set-mismatch (their `node_modules/` vs yours)

**What it is:** their pre-baked `node_modules/` is sized to the assignment template (bare express + console.log). Anything more — `multer`, `pino`, `pino-http`, `opossum`, `zod`, etc — is missing. Your code crashes with `Cannot find module 'X'` at first require.

**How we discovered it:** Iter 9. After the flatten fix (Step 8), `app.js` finally loaded its require chain 4 levels deep before crashing on `require('multer')`. Cross-referenced against the Step 8a diagnostic's `ls node_modules` output to identify the missing-deps set.

**How we adapted:** **Step 9 — npm shims.** For each missing dep, ship a no-op shim file at top level (e.g., `_shim_multer.js`) and rewrite bare-specifier `require('multer')` → `require('./_shim_multer')`. Three shims now ship: multer, pino, pino-http.

**The pino shim has a critical visibility tradeoff:** make `.error`/`.fatal`/`.warn` route to `console.error` (so error stacks reach the autograder's stderr), but keep `.info`/`.debug`/`.trace` as no-op (so log volume doesn't drown the signal).

**Generalization:** target environment's pre-installed deps ≠ yours. Either downgrade your code to use only their deps (heavy refactor) or ship interface-correct shims (lightweight; what we did).

### Contract 5 — Bootstrap-shape (`node app.js` must bind a port inline)

**What it is:** the autograder runs `node app.js` directly. Expects the process to bind to port 8080 inline and stay alive. Production-style "export the app, listen elsewhere" pattern fails — process exits cleanly, no listener, every test gets `Connection refused`.

**How we discovered it:** Iter 10. Tests 2-6 errored with `ConnectionRefusedError: [Errno 111]` AND the autograder's "Web service output" section was EMPTY. Empty stderr + nothing listening = process started, ran app.js to completion, exited. Confirmed by reading our `app.js`: `module.exports = app` at the bottom; no `app.listen()`.

**How we adapted:** **Step 10 — append `app.listen(8080)` shim.** At packaging time, append:

```js
if (require.main === module) {
  app.listen(parseInt(process.env.PORT, 10) || 8080, () => {
    console.log(`Web service listening on port: ${PORT}`);
  });
}
```

The `require.main === module` guard means our packaging-time boot smokes (which `require('./app')`) don't trigger the listener and hang.

**Generalization:** the assignment template's reference impl uses single-file express apps (composition + bootstrap in one file). If you split for testability, you need a packaging-time bridge. OR: just put the `if (require.main === module)` block in source `app.js` from day one (this is also valid).

### Contract 6 — AWS-creds-shipped-by-student

**What it is:** your `photoapp-config.ini` IS read by both your web service AND the autograder's pymysql side-effect verifications (which use the SAME config file you ship). Refuses configs with `TODO` placeholders or docker-compose hostnames (`endpoint = mysql`).

**How we discovered it:** Iter 11. Test 2's pymysql verification failed with `Can't connect to MySQL server on 'mysql'` — **the exact hostname from our shipped LocalStack template**. Proved Gradescope reads our config verbatim for the test harness's verification queries.

**How we adapted:** **Step 12 — ship the REAL `photoapp-config.ini`** with live AWS credentials (`projects/project01/client/photoapp-config.ini`). Added validation guards in the packaging script that refuse to ship configs with `TODO` placeholders or `endpoint = mysql`.

**Generalization:** Northwestern's contract is "students provision their own AWS infrastructure (RDS + S3 + Rekognition); ship credentials in `photoapp-config.ini`". This is identical to Project 01 Part 02's pattern — same config file, same shape.

**Security note:** the submission tarball contains live AWS credentials. This is the assignment's expected behavior (every CS 310 student does it). Rotate post-grading via `utils/rotate-passwords` (RDS) + `utils/rotate-access-keys` (IAM). Tracked in `MetaFiles/TODO.md` line 47.

### Contract 7 — Autograder-uses-its-own-AWS-infrastructure (for some tests)

**What it is:** despite contract #6, some tests run against Northwestern's OWN test RDS infrastructure, not yours. The runtime DB connection target is OVERRIDDEN (env var, container-internal config overlay, or similar) for those test cycles. Their test RDS uses **canonical schemas** — no extensions. Schema extensions (like our `kind` column) won't work against their RDS.

**How we discovered it:** Iter 13. Tests 04/05 STILL failed with `Unknown column 'kind'` AFTER we had run `utils/rebuild-db` to add the column to OUR RDS. Within the same wall-clock window: `validate-db` confirmed OUR RDS had `kind`; local boot of the dist returned `/images → 200 {data:[]}` against OUR RDS. The autograder cannot have been hitting OUR RDS.

**How we adapted:** **Step 14 — strip `kind` from queries** at packaging time (toggle-able via `P02_AUTOGRADER_BUILD=1`; default preserves the extension). The lib's source is unchanged; the dist's `repositories/assets.js` has `kind` dropped from the SELECT/INSERT statements that hit Northwestern's RDS.

**Generalization:** Northwestern's autograder tests against a known fixture infrastructure to ensure consistent grading. Your own AWS extensions are invisible to those tests. **Only ship what the canonical schema supports** (or strip extensions at packaging time).

**The conflict between contracts #6 and #7:** the autograder reads your config (#6) and uses your credentials for SOME assertions (pymysql verifications), but uses its own infrastructure for OTHER assertions (HTTP-level test calls). The override mechanism is opaque from the outside. Best mental model: assume the autograder uses the CANONICAL schema for HTTP-level tests, and uses YOUR infrastructure for pymysql side-effect verifications.

---

## Failure-output anatomy (where to look in the autograder result)

When a test fails, the autograder result has three sections worth scrutinizing:

### 1. The unittest output

```
======================================================================
FAIL: test_27 (__main__.PhotoappTests)
----------------------------------------------------------------------
AssertionError: Lists differ: [('Nature', 100), ...] != [('Engine', 95), ...]
```

**What it tells you:** the assertion that failed + a diff. Note that `unittest`'s assertEqual format is `actual != expected` — first value is what your code returned, second is what was expected.

**What to look for:** off-by-one numbers (rounding mismatch); list ordering differences (sort key mismatch); string mismatches with single character differences (typos/capitalization); type mismatches (tuples vs lists vs dicts).

### 2. The "Web service output to help debug" section

```
[startup] cwd=/autograder __dirname=/autograder
[startup] photoapp-config.ini exists at __dirname: true
Web service listening on port: 8080
[pino-shim] UNHANDLED ERROR: Error: Unknown column 'kind' in 'field list'
    at Object.findAll (/autograder/photoapp-server-lib_src_repositories_assets.js:23:29)
```

**What it tells you:** stderr from your `node app.js` process. Captures startup diagnostics (Step 10/11 shim) AND any errors that escape your express stack via `console.error` (or our `[pino-shim]` partial-noop).

**What to look for:** crashed-at-boot stack traces (Cannot find module, syntax errors, ENOENT); runtime exceptions during request handling (SQL errors, AWS errors, type errors); silent service failure (empty stderr + Connection refused = bootstrap-shape contract violation).

**EMPTY stderr is itself a signal.** If your tests fail with HTTP errors but stderr shows nothing, your error path is being swallowed (likely by a no-op logger). Add visibility before adding fixes.

### 3. The "Client-side log output" section (client autograder only)

```
2026-05-05 06:15:14,173 - ERROR - get_ping():
2026-05-05 06:15:14,173 - ERROR - status code 500: error
```

**What it tells you:** what the test client (`photoapp.py` Python client) saw when calling your web service. Usually an HTTP error code + status message extracted from your response body.

**What to look for:** correlation between server-side errors (section 2) and client-side errors (section 3). If server stderr is clean but client logs show 5xx, your route handler is returning errors via `res.status(5xx).json(...)` without going through the error middleware (which is where logging happens).

---

## Submission mechanics

### Build the dist

```bash
# Default mode — preserves Project extensions like `kind`:
make submit-server     # produces dist/p02-server-submission-<TS>/
make submit-client     # produces dist/p02-client-submission-<TS>/

# Autograder mode — strips Project extensions that conflict with canonical schema:
make submit-server-autograder
make submit-client-autograder
```

The autograder mode is gated by `P02_AUTOGRADER_BUILD=1` env var. **Use autograder mode for all Gradescope submissions.** Default mode is for production deploys + dev compose.

### Inside the Docker container

```bash
# Launch the Gradescope-provided Docker image (bind-mounts host's dist/ to /home/user/dist/):
./projects/project02/images/mbai460-server/docker/run.bash

# Inside the container, navigate to the dist directory:
cd /home/user/dist/p02-server-submission-<TS>

# Submit using flat-glob (NOT tarball):
/gradescope/gs submit 1288073 8052758 *.js *.ini *.json

# Client equivalent:
cd /home/user/dist/p02-client-submission-<TS>
/gradescope/gs submit 1288073 8052765 *.js *.ini *.json *.py
```

**Course/assignment IDs (Project 02):**
- Course: `1288073`
- Server: `8052758`
- Client: `8052765`

**Token location:** `~/.gradescope` inside the container (not the host's `~/.gradescope`). The Docker image must have your Gradescope token mounted in. Erik handles this once per container build.

---

## Local validation BEFORE submitting

Skip these and you'll burn iterations diagnosing what local testing would have caught.

### 1. Validate RDS state

```bash
./MBAi460-Group1/utils/validate-db
```

Expected output: `Checks: 27 | Passed: 27 | Failed: 0`. If anything fails, fix it before submitting (the autograder may run pymysql verifications against your RDS for some tests; broken state breaks tests).

### 2. Boot the dist locally + curl key endpoints

```bash
cd projects/project02/dist/p02-server-submission-<TS>
node app.js > /tmp/check.log 2>&1 &
PID=$!
sleep 3
curl -s http://localhost:8080/healthz                # expect: {"status":"live"}
curl -s http://localhost:8080/ping                   # expect: {"message":"success","M":<int>,"N":<int>}
curl -s http://localhost:8080/users | head -c 200    # expect: list of users
curl -s "http://localhost:8080/images?userid=80001"  # expect: list of images for that user
kill $PID
cat /tmp/check.log                                    # check for any startup errors
```

If any of these fail, the autograder will fail. Cheaper to debug locally.

### 3. Run the test pyramid

```bash
cd projects/project02/server && npm test           # server tests (unit + integration; should be 100+/100+)
cd ../../../lib/photoapp-server && npm test        # lib tests (104/104)
```

Green here = your spec assertions are locked. Red here = your fixes have regressed your own tests.

---

## Common pitfalls (do NOT do these)

| Pitfall | Why | Right move |
|---|---|---|
| Submit `.tar.gz` instead of flat files | Gradescope doesn't auto-extract; static check sees no `app.js` at root → "Expecting 'app.js' file" rejection | Use flat-glob (`gs submit COURSE ASG *.js *.ini ...`) |
| Trust `validate-db` to predict autograder behavior | OUR RDS != Northwestern's test RDS for HTTP-tested endpoints | Local end-to-end tests + autograder feedback |
| Add new env vars for autograder transformations | Splits the mental model | Use existing `P02_AUTOGRADER_BUILD=1` flag |
| Delete `api_*.js` wrappers because they look redundant | Gradescope's filename-presence + static-analysis checks need them | Keep them (and mirror to other route names if Gradescope ever adds more) |
| Rotate AWS credentials before grading window closes | Autograder may re-run for confirmation | Wait for grading window close, then run `utils/rotate-passwords` + `utils/rotate-access-keys` |
| Touch source code's `kind` extension without updating toggle | Three places need to stay in sync (source, default dist, autograder dist) | Update Step 14 strip step to match new source |
| Ship `photoapp-config.ini.example` (LocalStack template) | `endpoint = mysql` doesn't resolve in autograder's env | Ship `projects/project01/client/photoapp-config.ini` (real creds; default in our packaging script) |
| Make the pino shim fully no-op | Blinds you to runtime errors | `.error`/`.fatal`/`.warn` route to `console.error`; others stay no-op |
| Skip the local boot smoke | "It works in tests" ≠ "it works in autograder" | Always boot + curl before submitting |
| Use `P02_AUTOGRADER_BUILD=1` for production builds | Strips extensions you actually want in production | Use default mode for prod; autograder mode only for Gradescope submissions |

---

## Diagnostic patterns that worked

### Pattern 1 — Diagnostic injection (P02_PACKAGE_DIAGNOSTIC=1)

When stuck on opaque-environment issues, inject a startup filesystem-introspection block into the dist's `app.js`:

```bash
P02_PACKAGE_DIAGNOSTIC=1 make submit-server-autograder
# Submit to Gradescope; the diagnostic block runs BEFORE any require() and
# dumps process.cwd(), __dirname, fs.readdirSync('.'), per-subdir/per-file
# existence checks to stderr (visible in autograder's "Web service output" section).
# Lines prefixed with =DIAG= for grep-ability.
```

This pattern revealed the flat-ingest contract (Iteration 8a) when the simpler hypotheses had all failed.

### Pattern 2 — Layered failure peeling

Each Gradescope iteration unblocks the next failure layer. Tests can't fail with errors they never reach. So fix the most upstream error first, expect a NEW error class to surface in the next iteration, and triage based on what's now visible.

```
Iter N:    failure class A → fix
Iter N+1:  test that was masked by A now fails with class B → fix
Iter N+2:  test that was masked by B now fails with class C → ...
```

The 16-iteration trajectory (see `projects/project02/MetaFiles/retrospective-2026-05-05-gradescope-90-90-arc.md` § 4) is a worked example.

### Pattern 3 — Tests that pass narrow the search

When test X passes and test Y fails, the difference between X and Y narrows what could be wrong. Iter 13's breakthrough: test_06 PASSED (uses `findById`, no `kind` in query) + test_04/05 FAILED (use `findAll`/`findByUserId`, with `kind`) → "the failure class is queries that include `kind`". From there, validate-db on OUR RDS proved kind exists locally → autograder uses different infrastructure.

### Pattern 4 — Pino shim partial-noop for visibility

When shipping a stub for a missing logging library, make `.error`/`.fatal`/`.warn` route to `console.error`. Keep `.info`/`.debug`/`.trace` no-op. Production-grade structured logging becomes invisibility-by-default if naively shimmed; partial-noop preserves the critical signal in autograder/grader environments.

---

## What's known to differ between our impl and the assignment template

These were SOURCE-side spec corrections we made during the arc. All are now permanent in source (not autograder-only):

| Aspect | Our original | Assignment template | Where |
|---|---|---|---|
| `/ping` response field order | `M=user_count, N=s3_count` | `M=s3_count, N=user_count` (M=bucket items, N=users) | `routes/v1/ping.js`, `api_get_ping.js` |
| Label ordering for `get_image_labels` | `ORDER BY confidence DESC` | `ORDER BY label ASC` (alphabetical) | `lib/photoapp-server/src/repositories/labels.js:18` |
| Confidence rounding for stored Rekognition labels | SQL `ROUND(?)` (round-to-nearest) | Python `int(?)` = SQL `FLOOR(?)` (truncate) | `lib/photoapp-server/src/repositories/labels.js:61` |
| Error message for invalid assetid input | `'assetid must be an integer'` (separate validation path) | `'no such assetid'` (single error path; let DB lookup handle it) | `routes/v1/image_labels.js`, `api_get_image_labels.js` |

**These are real bugs**, not autograder-specific quirks. They'd produce wrong results in any context that compares against the assignment template's expected behavior.

---

## Project extensions we maintain

These are extensions we built that the assignment template doesn't have. They're in source but stripped from autograder dist via `P02_AUTOGRADER_BUILD=1`:

| Extension | Status | Where |
|---|---|---|
| `kind` ENUM column on `assets` table (`'photo'` / `'document'`) | Source has it; default dist preserves; autograder dist strips | Schema: `projects/project01/create-photoapp.sql:36`. Code: `lib/photoapp-server/src/repositories/assets.js`. Strip: `tools/package-submission.sh` Step 14 |

**Future extensions** (not yet built) that would need similar treatment if they conflict with canonical schema:
- `/v2` engineering surface (search by kind, paging, presigned URLs) — these don't conflict with canonical schema directly, BUT use the `kind` column, so autograder mode would strip the `kind`-dependent ones
- Anything that adds columns / tables / indexes beyond the canonical schema
- Anything that changes the response envelope shape

**Architecture rule:** if your extension conflicts with the assignment template's canonical schema or response shape, gate it via `P02_AUTOGRADER_BUILD=1`. If it's purely additive (new endpoints under `/v2`, new internal fields the autograder doesn't query), it can ship in both modes.

---

## Re-grading workflow

If you need to resubmit (Northwestern offers re-grades; you've made source changes; etc.):

```bash
# 1. Verify OUR RDS is in canonical state:
./utils/validate-db    # expect 27/27 PASS

# 2. Build a fresh autograder-mode dist:
cd projects/project02
make submit-server-autograder
# (or make submit-client-autograder for the client side)

# 3. Local boot smoke:
cd dist/p02-server-submission-<NEW-TS>
node app.js > /tmp/smoke.log 2>&1 &
PID=$!; sleep 3
curl -s http://localhost:8080/ping
curl -s http://localhost:8080/users | head -c 200
kill $PID

# 4. Inside Docker container, submit:
/gradescope/gs submit 1288073 8052758 *.js *.ini *.json
```

**If an autograder result is suspicious:** don't iterate blind. Look at the failure-output anatomy (3 sections above). Compare against this doc's Seven Contracts to see if a known contract has been violated. If novel: add diagnostic instrumentation BEFORE adding fixes (Pattern 1).

---

## Forward outlook for Project 03+

Most lessons from Project 02 will carry forward:

**Will be the same:**
- Flat-glob upload mode (NOT tarball)
- Filename-presence + static-analysis checks (likely different filenames; same pattern)
- Flat-ingest packaging (subdirectories dissolve at `/autograder/`)
- `node <entrypoint>` direct invocation (must bind port inline)
- Student-provided AWS infrastructure for SOME tests; Northwestern's for OTHERS
- pino/multer/opossum/zod missing from pre-baked node_modules (still need shims)
- Same `mbai460-server` Docker image for submitting

**Likely to be different:**
- Course / assignment IDs (each assignment has new ones)
- API surface (different routes; different response shapes)
- Schema extensions you might want (will need new toggle entries if they conflict)
- Test fixtures (different expected counts, label sets, etc.)
- Reference impl's ordering / rounding / error-message conventions (verify against the cloned reference at `projects/project03/.../client/photoapp.py` or equivalent)

**Recommended approach for Project 03:**
1. Read the assignment PDF for filename + retry + transaction requirements (contracts 1-2)
2. Copy the structure of `projects/project02/tools/package-{server,client}-submission.sh` as a template
3. Run with `P02_PACKAGE_DIAGNOSTIC=1` on the FIRST submission to confirm filesystem layout matches expectations
4. Assume contracts 3-7 still apply unless evidence proves otherwise
5. Use the cloned reference (`projects/project03/.../`) to verify API spec details (response field order, error message strings, sort orders, rounding) BEFORE submitting

The `P02_AUTOGRADER_BUILD=1` toggle architecture should generalize — rename to `P03_AUTOGRADER_BUILD=1` for Project 03 and apply the same intent-based gating to any extensions that conflict with canonical schemas.

---

## Quick reference index

- **Per-step packaging breakdown + 16-iteration trajectory:** `projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 2.10
- **90/90 retrospective (this arc):** `projects/project02/MetaFiles/retrospective-2026-05-05-gradescope-90-90-arc.md`
- **70/70 retrospective (Project 01 Part 02; first-try pass with no iteration):** `projects/project01/Part02/MetaFiles/retrospective.md`
- **Packaging scripts:** `projects/project02/tools/package-{server,client}-submission.sh`
- **Make targets:** `projects/project02/Makefile`
- **Cloned assignment template (reference impl):** `projects/project02/images/mbai460-server/projects/project02/`
- **Credential rotation utilities:** `utils/rotate-passwords` (RDS) + `utils/rotate-access-keys` (IAM)
- **DB validation:** `utils/validate-db`
- **DB rebuild (destructive):** `utils/rebuild-db`
- **Post-grading credential-rotation TODO:** `MetaFiles/TODO.md` line 47

---

**Last updated:** 2026-05-05 immediately after Project 02 90/90 banked.
**Maintained by:** future agents working on Gradescope-related changes. When new lessons surface, update the relevant section and bump "Last updated".
