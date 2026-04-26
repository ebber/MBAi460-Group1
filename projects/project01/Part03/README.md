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

- `ClaudeDesignDrop/` - collaborator drop zone for raw Claude Design exports.
- `server/` - copied Express API baseline from Project 2, now owned by Part 3.
- `MetaFiles/Reference/` - reference-only copies of Project 2 Streamlit UI and Python client.
- `MetaFiles/Approach/` - execution checklists for the team.

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

## Current Server Baseline

Install dependencies from this directory:

```bash
npm install
```

Start the baseline server:

```bash
npm start
```

Expected local server port:

```text
http://localhost:8080
```

**Current smoke targets** (work today against the un-refactored Project 2 baseline):

```text
GET http://localhost:8080/        # uptime ping
GET http://localhost:8080/ping    # S3 + DB connectivity (M, N)
GET http://localhost:8080/users   # users list
```

**Target smoke targets** (after Server Foundation Phase 7 + API Routes Phase 6):

```text
GET http://localhost:8080/health          # server liveness
GET http://localhost:8080/api             # API placeholder envelope
GET http://localhost:8080/api/ping        # PhotoApp ping with envelope
GET http://localhost:8080/api/users       # users list with envelope
GET http://localhost:8080/                # served frontend (after UI integration)
```

The URL prefix shift (`/ping` → `/api/ping`, etc.) and response envelope alignment happen during the Server Foundation + API Routes phased work — see `MetaFiles/refactor-log.md` 2026-04-26 and `00-coordination-and-contracts.md` for the agreed contract.

## Guardrails

- Do not put secrets, AWS keys, or `photoapp-config.ini` into frontend files or `ClaudeDesignDrop/`.
- Keep Part 3 self-contained for Canvas submission.
- Treat copied Project 2 files as a working baseline, not final architecture.
- Before changing endpoint paths or response shapes, update `MetaFiles/Approach/00-coordination-and-contracts.md`.

