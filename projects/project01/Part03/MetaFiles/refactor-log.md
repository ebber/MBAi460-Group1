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

**Decisions recorded (Q1–Q6):**

- **Q1 — URL scheme:** keep `/api/*` prefix. Cleaner separation; matches the contract's "browser calls only `/api/*` plus static" rule. Existing Express baseline (`/ping`, `/users`, `/image/:id`, …) needs URL refactoring during Server Foundation work.
- **Q2 — `photoapp.py` reuse:** drop direct Python reuse. Project 03 backend uses Node-native AWS SDK (`@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`) + `mysql2` (extending the existing Express baseline). Part 02 `photoapp.py` becomes a behavioral reference only. Project Queue item `[Project01/Part03] Correctly deprecate Part 02 Python from Part 03 backend` tracks the deprecation decision.
- **Q3 — Response envelope:** keep `{message, data}` / `{message, error}` envelope across all endpoints. Existing `api_*.js` route responses will be aligned during API Routes work (e.g., `get_ping` currently returns `{message, M, N}` — refactor to `{message, data: {s3_object_count, user_count}}`).
- **Q4 — Test stack:** Jest + supertest. Mature, conventional Express pairing. Adds `jest`, `supertest` as devDependencies; replaces the placeholder `npm test` script.
- **Q5 — Local dev mode:** built-only. UI workstream produces `frontend/dist` via `npm run build`; Express serves it via static middleware. No Vite dev-server proxy. UI iteration on components can still use Vite dev server independently with mocked API responses.
- **Q6 — Visualization:** `Target-State-project01-part03-photoapp-architecture-v1.md` updated to be language/implementation-agnostic (FastAPI/Python labels removed; "PhotoApp Service Module" replaces "imported photoapp.py"). Queued for design-agent review.

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

