# Project 02 Server

Project 02 Part 01's web service — a **consumer of `@mbai460/photoapp-server`**, not a parallel implementation. The shared service core (services / repositories / middleware factories / schemas) lives in `lib/photoapp-server/` (extracted in Phase 0 of the Project 02 Part 01 quest); this tree carries Project 02-specific surface concerns (route adapters, observability, `request_id`, `validate`, `pool`, `breakers`, `app.js`, `server.js`).

> **Status:** Sub-phase 1.0 (workspace consumer bootstrap) — smoke-boot proves the library symlink resolves; routes + observability + error middleware DI land in subsequent sub-phases per `MetaFiles/Approach/01-foundation.md`.

## Install / test / start

From the **monorepo root** (`MBAi460-Group1/`):

```bash
npm install                       # resolves the workspace symlink
npm test --workspaces             # lib + Part 03 + Project 02 server tests
cd projects/project02/server
npm start                         # boots the smoke shell on PORT=8080 (override via env)
```

Direct workspace test: `npm test --workspace=projects/project02/server`.

## Library wiring

This server consumes:

```
@mbai460/photoapp-server (1.0.0)
├── config        — INI-driven configuration loader
├── services
│   ├── photoapp  — getPing / getUsers / getImages / uploadImage / downloadImage / ...
│   └── aws       — getBucket / getRekognition / getDbConn (Project 02 wraps these)
├── repositories  — SQL access for users / assets / labels (extracted Phase 0.3)
├── middleware
│   ├── createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })  — DI factory
│   └── createUploadMiddleware({ destDir, sizeLimit })                    — multer wrapper
└── schemas
    └── envelopes.successResponse(data) / errorResponse(err)
```

See `lib/photoapp-server/README.md` for the full library API and `MBAi460-Group1/CONTRIBUTING.md` for workspace etiquette + lockfile rules.

## Shared configuration

Project 02 reads `photoapp-config.ini` from the same path Project 01 already established:

```
projects/project01/client/photoapp-config.ini    # gitignored; per-collaborator
```

The library's `config.js` accepts a path; Project 02's `app.js` (Phase 2) passes the same path Part 03 uses. Do not duplicate the INI under `projects/project02/`.

## Canonical ops tools (do not duplicate)

The shared lab backbone owns these utilities — invoke them, do not re-implement:

| Tool | Purpose |
|---|---|
| `utils/run-sql` | Execute a SQL file against RDS through the shared Docker image |
| `utils/validate-db` | 26-check schema + seed validator |
| `utils/rebuild-db` | Idempotent rebuild from canonical DDL |
| `utils/smoke-test-aws` | 10-check live AWS verification (`--mode live` for full path) |
| `utils/cred-sweep` | Staged-content secret scanner (pre-commit hook) |
| `utils/aws-inventory` | TF vs. MANUAL drift report |
| `utils/lab-up` / `utils/lab-down` / `utils/lab-status` | Lab Terraform spin-up + spin-down |
| `utils/docker-up` / `utils/docker-down` / `utils/docker-status` | Docker Desktop / Colima helpers |
| `utils/rotate-access-keys` / `utils/rotate-passwords` | Credential rotation |

## Layout

```
projects/project02/server/
├── package.json            — workspace consumer manifest
├── jest.config.js          — Phase 1.0 placeholder (six-layer pyramid lands in 1.11)
├── .eslintrc.cjs           — minimal lint config (full kit lands in Approach Phase 1)
├── .prettierrc
├── app.js                  — Express app (sub-phase 1.0 shell; phases 2–5 expand)
├── server.js               — listen() entrypoint; pool.end() on SIGTERM (Phase 7+)
├── tests/
│   └── unit/
│       └── library_resolution.test.js   — permanent guard for the workspace symlink
└── _assignment-template/   — Prof. Hummel's starter; reference only (deleted post Phase 2)
```

## Workstream pointers

- **Plan + execution state:** `projects/project02/client/MetaFiles/Approach/Plan.md` + `OrientationMap.md`
- **Foundation Approach (current workstream):** `projects/project02/client/MetaFiles/Approach/01-foundation.md`
- **Web Service Approach (Phase 2 — Gradescope 60/60):** `MetaFiles/Approach/02-web-service.md`
- **Refactor log:** `projects/project02/client/MetaFiles/refactor-log.md`
