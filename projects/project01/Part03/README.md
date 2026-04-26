# Project 01 Part 03 - PhotoApp Web UI

Part 03 builds the user interface for the PhotoApp API from earlier project work. The current team strategy: keep Part 3 self-contained for Canvas submission, reuse the merged Project 2 Express web-service baseline, and smooth it toward the shared approach docs.

**Stack (decided 2026-04-26):** React + Vite frontend, Express + Node backend. Built-only dev mode (Vite build → Express serves `frontend/dist`). See `MetaFiles/refactor-log.md` 2026-04-26 for the full Q1–Q6 decision record.

## Start Here

Read these in order:

1. `MetaFiles/Approach/00-coordination-and-contracts.md` — shared contract (API endpoints, response shapes, ownership)
2. `MetaFiles/Approach/01-ui-workstream.md` — UI plan
3. `MetaFiles/Approach/02-server-foundation.md` — Express skeleton plan
4. `MetaFiles/Approach/03-api-routes.md` — `/api/*` plan (Node-native AWS SDK + `mysql2`)
5. `MetaFiles/refactor-log.md` — decision history

## Current Working Areas

- `ClaudeDesignDrop/` — collaborator drop zone for raw Claude Design exports.
- `server/` — Express server. Smoothed `app.js` (exports app), `server.js` (listen entrypoint), `routes/photoapp_routes.js` (`/api` placeholder), `tests/` (Jest + supertest). Legacy `api_*.js` files retained as a behavioral reference (per Part 03 TODO).
- `frontend/` — placeholder build under `frontend/dist/` (UI workstream replaces with a real Vite build).
- `MetaFiles/Reference/` — reference-only copies of Project 2 Streamlit UI and Python client.
- `MetaFiles/Approach/` — execution checklists for the team.
- `MetaFiles/plans/` — execution-augmented plans (Server Foundation plan tracks progress against `02-server-foundation.md`).
- `MetaFiles/install-log.md` — chronological npm install record.
- `MetaFiles/refactor-log.md` — decision history and per-phase refactor evidence.

## Immediate Team Tasks

UI collaborator:

- Put Claude Design export files in `ClaudeDesignDrop/raw/`.
- Put images, icons, fonts, or other design assets in `ClaudeDesignDrop/assets/`.
- Fill out `ClaudeDesignDrop/notes/export-notes.md`.
- Use `MetaFiles/Reference/project02-streamlit-gui.py` only as workflow reference.

Server/API collaborator:

- Run the current baseline from this directory (see "Current Server Baseline" below).
- Smooth route behavior against `MetaFiles/Approach/00-coordination-and-contracts.md` and the phased plan in `02-server-foundation.md` / `03-api-routes.md`.
- Record refactors in `MetaFiles/refactor-log.md`.

## Run the Server

From this directory:

```bash
# 1. Install dependencies (first run only)
npm install

# 2. Run the test suite (Jest + supertest)
npm test

# 3. Start the server (Express on port 8080)
npm start
```

Expected `npm start` output:

```text
**Web service running, listening on port 8080...
```

### Smoke targets (after Server Foundation completes)

These reflect the live state at end of workstream 02 (Server Foundation):

```text
GET http://localhost:8080/                → 200 HTML       (placeholder frontend)
GET http://localhost:8080/health          → 200 {"status":"running"}
GET http://localhost:8080/api             → 200 {"message":"success","data":{"service":"photoapp-api","status":"placeholder"}}
GET http://localhost:8080/assets/app.css  → 200 CSS        (placeholder asset)
```

Legacy URLs from the un-refactored Project 2 baseline (`/ping`, `/users`, `/image/:id`, `/images`, `/images/search`, etc.) **return 404**. They are decommissioned in favor of the `/api/*` contract — see `MetaFiles/Approach/00-coordination-and-contracts.md` for endpoint shapes and `MetaFiles/refactor-log.md` 2026-04-26 for the decision record.

### Smoke targets (after API Routes — workstream 03 — completes)

The `/api` placeholder will be replaced with real PhotoApp endpoints. From the contract:

```text
GET http://localhost:8080/api/ping                    # service-module ping (S3 + RDS)
GET http://localhost:8080/api/users                   # users list (envelope)
GET http://localhost:8080/api/images?userid=80001     # images list
POST http://localhost:8080/api/images                 # multipart upload
GET http://localhost:8080/api/images/{assetid}/file   # native file response
GET http://localhost:8080/api/images/{assetid}/labels # Rekognition labels
GET http://localhost:8080/api/search?label=animal     # search by label
DELETE http://localhost:8080/api/images               # destructive reset
```

## Workstream Handoff (post Server Foundation)

After workstream 02 acceptance, downstream workstreams have:

- **API Routes (03):** a confirmed mount point at `/api`. The placeholder router lives at `server/routes/photoapp_routes.js`; replace its single `router.get('/', ...)` with the real endpoints. The Jest harness is wired (testMatch: `server/tests/**/*.test.js`) and supertest works against the exported `app`.
- **UI (01):** a static-serving target. UI Vite build output goes to `Part03/frontend/dist/`; Express serves `index.html` at `/` and assets at `/assets/*`. The placeholder `frontend/dist/index.html` and `assets/app.css` can be safely overwritten by the real Vite build.

## Guardrails

- Do not put secrets, AWS keys, or `photoapp-config.ini` into frontend files or `ClaudeDesignDrop/`.
- Keep Part 3 self-contained for Canvas submission.
- Treat copied Project 2 files as a working baseline, not final architecture.
- Before changing endpoint paths or response shapes, update `MetaFiles/Approach/00-coordination-and-contracts.md`.

