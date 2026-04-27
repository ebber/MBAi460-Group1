# Project 01 Part 03 Refactor Log

This log tracks intentional changes made while turning copied collaborator work into the Part 03 implementation. Use it to keep the team aligned on what was copied, what was changed, why it changed, and what still needs cleanup.

---

## 2026-04-25 - Copy Project 2 Web/API Work Into Part 3

Copied the merged Project 2 web-service and UI-reference work into Project 1 Part 3 as a self-contained starting point.

Copied runtime baseline:

- From `projects/project02/server/`
- To `projects/project01/Part03/server/`
- Includes Express app, config/helper files, and API route handlers for ping, users, images, upload, download, labels, search, and delete.

Copied dependency baseline:

- From `projects/project02/package.json`
- To `projects/project01/Part03/package.json`

Copied reference material:

- `projects/project02/client/gui.py` to `projects/project01/Part03/MetaFiles/Reference/project02-streamlit-gui.py`
- `projects/project02/client/photoapp.py` to `projects/project01/Part03/MetaFiles/Reference/project02-client-photoapp.py`

Reason:

- Accelerates Project 1 Part 3 by reusing already-merged collaborator work.
- Keeps Part 3 self-contained for Canvas submission.
- Avoids symlink and cross-project submission risks.
- Gives the React/Claude Design UI workstream a concrete workflow reference.
- Gives the API workstream a concrete endpoint baseline to smooth rather than starting from a blank server.

Current decision:

- Treat copied code as a **Part 3 working baseline**, not a final best-practice architecture.
- Keep the copied server in `Part03/server/` for now.
- Preserve original Project 2 files unchanged until after Part 3 submission.
- Reconcile duplicated Project 2 / Part 3 server code after the Part 3 deadline.

Known gaps to smooth:

- Route files currently mix HTTP handling, SQL, AWS calls, response shaping, and error mapping.
- Upload currently uses base64 JSON (`POST /image`) rather than browser-standard multipart upload.
- Download currently returns base64 JSON rather than a native file/image response.
- `DELETE /images` deletes S3 objects before clearing database rows; the Part 2 notes prefer DB-first ordering.
- `api_post_image.js` uses bucket keys shaped like `uuid.ext`; Part 2 used `username/uuid-local_filename`.
- API response shapes are not yet aligned with `MetaFiles/Approach/00-coordination-and-contracts.md`.
- Automated tests are not yet present; `package.json` still has a failing placeholder `npm test`.
- `create-photoapp.sql` now includes a `labels` table that differs from `create-photoapp-labels.sql`; schema strategy needs reconciliation.

Immediate next checks:

- Confirm copied server starts from `projects/project01/Part03`.
- Confirm config file path expectations for `photoapp-config.ini`.
- Decide whether Part 3 should keep Express for delivery or port baseline behavior into FastAPI later.
- Add smoke-test instructions before asking collaborators to run the copied baseline.

---

## 2026-04-26 — Server Foundation (02) complete

All nine phases of the Server Foundation workstream (plus the new Phase 0 baseline-verification step) landed today, each with TDD discipline (failing test → minimal implementation → green) and atomic doc updates per task.

**Final state:**

```
Part03/
  package.json          # start: node server/server.js  |  test: jest --passWithNoTests
  jest.config.js        # testMatch server/tests/**/*.test.js (node env)
  server/
    app.js              # exports configured Express app — no listen()
    server.js           # listen entrypoint; preserves AWS_SHARED_CREDENTIALS_FILE side-effect
    config.js           # web service config (preserved baseline)
    helper.js           # AWS/RDS factory helpers (preserved baseline; workstream 03 evolves this)
    routes/
      photoapp_routes.js  # /api placeholder router (workstream 03 replaces the handler body)
    tests/
      app.test.js
      health.test.js
      static.test.js
      api_placeholder.test.js
    api_*.js            # legacy Project 2 baseline (kept as reference per Part 03 TODO; not wired into app)
  frontend/
    dist/
      index.html        # placeholder; UI workstream replaces with Vite build
      assets/
        app.css         # placeholder rule
```

**Live URL contract after 02:**

| URL | Behavior |
|---|---|
| `GET /` | 200 HTML (placeholder index) |
| `GET /health` | 200 `{"status":"running"}` (server liveness; outside `/api/*`) |
| `GET /api` | 200 placeholder envelope `{message:"success", data:{service:"photoapp-api", status:"placeholder"}}` |
| `GET /assets/app.css` | 200 CSS (placeholder) |
| `GET /ping`, `GET /users`, `GET /image/:id`, `GET /image/:id/labels`, `GET /images`, `GET /images/search`, `POST /image`, `DELETE /images` | **404** — legacy URLs decommissioned in Phase 2 |

**Test surface:** Jest 4 suites / 6 tests, all green. Run via `npm test`. Test environment: Node. Test pattern: `server/tests/**/*.test.js`.

**What's now unblocked:**

- **API Routes workstream (03):** `/api` mount point is live; `server/routes/photoapp_routes.js` is the seam; supertest works against the exported `app`. Replace `router.get('/', ...)` with the real PhotoApp endpoints. Add `server/services/{photoapp,aws}.js`, `server/middleware/{upload,error}.js`, `server/schemas.js`, and the test files described in `03-api-routes.md`.
- **UI workstream (01):** static-serving contract is live. UI Vite build → `Part03/frontend/dist/`. The placeholder `index.html` and `assets/app.css` are safe to overwrite.

**Plan-doc reference:** `Part03/MetaFiles/plans/02-server-foundation-plan.md` (full per-phase tracker, evidence, TDD red→green records).

**Commit chain (this session):**
- `df1f3d9` Phase 0
- `a6014fe` Phase 1
- `fadc449` Phase 2
- `c5ef7c6` Phase 3
- `9da98ac` Phase 4
- `b113abf` Phase 5
- `04347d8` Phase 6
- `2b61a0f` Phase 7
- `be0c7ac` Phase 8
- (this commit) Phase 9 — closeout

---

## 2026-04-26 — Phase 2 (Server Foundation) — app.js / server.js split; legacy URLs decommissioned

The Express baseline `app.js` was split: `app.js` now exports the configured `app` instance only; `server/server.js` is a thin entrypoint that imports `app` and calls `listen(config.web_service_port)`.

**Removed from `app.js`:**

- `app.listen(...)` block (moved to `server.js`).
- Legacy `app.get('/', ...)` uptime handler — `/` will return 404 until Phase 5 mounts the SPA fallback.
- All legacy `api_get_*` / `api_post_*` / `api_delete_*` requires + `app.get`/`app.post`/`app.delete` lines. Legacy `server/api_*.js` source files **stay on disk** as a behavioral reference per the Part 03 TODO queue; they are simply not wired into the running app any more.

**Effect on URLs (live server):**

- `GET /ping`, `GET /users`, `GET /image/:assetid`, `GET /image/:assetid/labels`, `GET /images`, `GET /images/search`, `POST /image`, `DELETE /images` → all return 404 from now on.
- `GET /` → 404 (until Phase 5 SPA fallback).
- The new `/api/*` contract arrives in workstream 03 (after Phase 7 mounts the placeholder router).

**TDD gates:**

- Failing test (`server/tests/app.test.js`): app exports a function with `.use`/`.get`; importing app does not bind a port.
- Before refactor: red — Jest could not import `app` because (a) it called `listen()` at module load, leaving a zombie socket, AND (b) loading transitively required `node_modules/uuid` which is now ESM-only and Jest's default CommonJS transform rejects it.
- After refactor: green — `app.js` no longer calls `listen()` and no longer requires `api_post_image.js` (the file that pulls in `uuid`).

**Side-finding (recorded for future agents working on workstream 03):**

When workstream 03 re-introduces `uuid` (in the new `server/services/photoapp.js` for bucketkey generation), Jest will need a transform for the `uuid` package. Two options: (a) add `transformIgnorePatterns: ['node_modules/(?!uuid)']` to `jest.config.js` so babel-jest processes `uuid`; (b) pin `uuid` to v9.x which still ships CommonJS. Document the choice in 03's refactor notes when it lands.

**Smoke evidence (after refactor):**

- `npm test` → 2 tests passed, 1 suite passed, exit 0.
- `npm start` → "**Web service running, listening on port 8080...**".
- `curl http://localhost:8080/` → HTTP 404 with `Cannot GET /` (expected).
- Server stopped cleanly via SIGTERM.

---

## 2026-04-26 — Phase 0 Baseline Smoke Verified (Server Foundation pre-execution)

Before Server Foundation (workstream 02) execution begins, the un-refactored Project 2 Express baseline was verified end-to-end. Captured here as the "before" state for the prove-it-works principle (Erik 2026-04-26).

**Versions:** Node v24.8.0, npm 11.6.0 (above `package.json` engines).

**Install:** `npm install` from `Part03/` → exit 0, 305 packages, 8 vulnerabilities (all transitive through `sqlite3@5.1.7`; flagged in `install-log.md` for Erik decision). `node_modules/` + `package-lock.json` created.

**Live smoke (against real RDS + S3):**

```
GET http://localhost:8080/
→ 200  {"status":"running","uptime_in_secs":12}

GET http://localhost:8080/ping
→ 200  {"message":"success","M":10,"N":3}
       (M=10 S3 objects, N=3 RDS users)

GET http://localhost:8080/users
→ 200  {"message":"success","data":[
         {"userid":80001,"username":"p_sarkar","givenname":"Pooja","familyname":"Sarkar"},
         {"userid":80002,"username":"e_ricci","givenname":"Emanuele","familyname":"Ricci"},
         {"userid":80003,"username":"l_chen","givenname":"Li","familyname":"Chen"}
       ]}
```

**State observed:** baseline runs as advertised. Pre-existing legacy URL contract works against live infra. Phase 2 will decommission these URLs in favor of `/api/*`.

**Open signal flagged:** `sqlite3@5.1.7` is in dependencies but not actually `require()`d by any `server/*.js` file. Carries 8 vulnerabilities + 9 deprecation warnings via its prebuild toolchain. Decision (remove vs. upgrade) deferred to Erik. See `install-log.md` 2026-04-26 entry.

---

## 2026-04-26 - Express Direction Confirmed; Approach Docs Aligned

The team committed to **Express/Node** as the Part 03 backend (rather than the FastAPI/Python target previously described in the approach docs). Decision made in coordination with the design agent on grounds of "future compatibility" — preserves the Project 02 collaborator baseline and avoids a Python↔Node bridge.

**Decisions recorded (Q1–Q6):** the full text of each decision, with rationale and cross-references, lives in `Part03/MetaFiles/DesignDecisions.md`. Brief summary:

- **Q1** — keep `/api/*` URL prefix.
- **Q2** — drop `photoapp.py` direct reuse; Node-native AWS SDK + `mysql2`.
- **Q3** — keep `{message, data}` / `{message, error}` response envelope.
- **Q4** — test stack = Jest + supertest.
- **Q5** — local dev mode = built-only (no Vite proxy).
- **Q6** — Target-State architecture viz is language/implementation-agnostic.

(Source: `Part03/MetaFiles/DesignDecisions.md` — decisions live there; this log records what *changed* in code.)

**Approach docs updated this session:**

- `00-coordination-and-contracts.md` — workstream definitions, directory contract, TDD section, open questions adjusted; API contract preserved unchanged.
- `02-server-foundation.md` — full rewrite around Express skeleton, Jest+supertest, static mount + `/api` router placeholder.
- `03-api-routes.md` — full rewrite around Node-native AWS SDK + mysql2; multer for multipart; service-module architecture replaces Python adapter + file bridge.
- `01-ui-workstream.md` — light edits: removed FastAPI mentions; clarified built-only dev mode.
- `Target-State-project01-part03-photoapp-architecture-v1.md` — agnosticized; design agent to review.
- `Part03/README.md` — accurate `npm install` / `npm start` instructions; pointers to approach docs.

**Server baseline behavior to smooth (carried into 02 + 03 execution):**

- Refactor `server/api_*.js` into `server/routes/` + `server/services/` per the new approach docs.
- Convert `POST /image` (base64 JSON) → `POST /api/images` (multipart via multer).
- Convert `GET /image/:assetid` (base64 JSON) → `GET /api/images/:assetid/file` (native file response).
- Align response shapes to the `{message, data}` envelope.
- DB-first delete ordering (per Part 2 notes).
- Bucket key shape: `username/uuid-localname` (Part 2 convention).
- Add automated tests (Jest + supertest).
- Split `server/app.js`: app instance separate from listen() for testability.

**Next steps:**

- Design agent reviews approach docs + agnosticized visualization.
- Once approach is set, generate detailed plan for Server Foundation (02) using `superpowers:writing-plans` — TDD-disciplined, phased for collaborator pushes.
- Execute the plan.

---

## 2026-04-25 - Smooth Part 3 Server Run Path

Updated the copied Node baseline so it can be run from `projects/project01/Part03`.

Changes:

- Updated `package.json` package name, description, and `main` to point at `server/app.js`.
- Updated `package.json` `start` script to `node server/app.js`.
- Left `npm test` as an explicit failing TODO instead of pretending tests exist.
- Updated `server/config.js` so `photoapp_config_filename` points to `../client/photoapp-config.ini` when running from `projects/project01/Part03`.

Reason:

- The copied Project 2 package assumed `app.js` lived next to `package.json`.
- In Part 3, the copied Express app lives under `server/`.
- The assignment config should remain in the canonical `projects/project01/client/` location rather than being duplicated into Part 3.

Remaining checks:

- Run `npm install` from `projects/project01/Part03`.
- Run `npm start` from `projects/project01/Part03`.
- Confirm `GET /`, `GET /ping`, and `GET /users` respond.

