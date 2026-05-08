# Project 02 Server

Project 02 Part 01's web service is self-contained for the split MVP. The local PhotoApp app core lives in `src/photoapp-core/`; Project 02 owns its routes, runtime config, tests, Docker shape, and Terraform shape.

> **Status:** split-MVP local core. The code in `src/photoapp-core/` is derived from the former shared workspace core and kept module-shaped for a future PhotoApp/DocumentApp core extraction.

## Install / test / start

From the **monorepo root** (`MBAi460-Group1/`):

```bash
npm install                       # installs workspace dependencies from the root lockfile
npm test --workspaces             # lib + Part 03 + Project 02 server tests
cd projects/project02/server
npm start                         # boots the smoke shell on PORT=8080 (override via env)
```

Direct workspace test: `npm test --workspace=projects/project02/server`.

## Local core wiring

This server owns:

```
src/photoapp-core/
├── config        — Project 02-owned INI path resolution
├── services
│   ├── photoapp  — getPing / getUsers / getImages / uploadImage / downloadImage / ...
│   └── aws       — getBucket / getRekognition / getDbConn
├── repositories  — SQL access for users / assets / labels
├── middleware
│   ├── createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })  — DI factory
│   └── createUploadMiddleware({ destDir, sizeLimit })                    — multer wrapper
└── schemas
    └── envelopes.successResponse(data) / errorResponse(err)
```

See `src/photoapp-core/README.md` for provenance and future extraction guidance.

## Project 02 configuration

Project 02 reads `photoapp-config.ini` from:

```
PHOTOAPP_CONFIG_PATH                             # preferred override
projects/project02/client/photoapp-config.ini    # local fallback; gitignored
```

Copy `projects/project02/client/photoapp-config.ini.example` to `projects/project02/client/photoapp-config.ini` for local development.

## Canonical ops tools (do not duplicate)

The shared lab backbone owns these utilities — invoke them, do not re-implement:

| Tool                                                            | Purpose                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `utils/run-sql`                                                 | Execute a SQL file against RDS through the shared Docker image |
| `utils/validate-db`                                             | 26-check schema + seed validator                               |
| `utils/rebuild-db`                                              | Idempotent rebuild from canonical DDL                          |
| `utils/smoke-test-aws`                                          | 10-check live AWS verification (`--mode live` for full path)   |
| `utils/cred-sweep`                                              | Staged-content secret scanner (pre-commit hook)                |
| `utils/aws-inventory`                                           | TF vs. MANUAL drift report                                     |
| `utils/lab-up` / `utils/lab-down` / `utils/lab-status`          | Lab Terraform spin-up + spin-down                              |
| `utils/docker-up` / `utils/docker-down` / `utils/docker-status` | Docker Desktop / Colima helpers                                |
| `utils/rotate-access-keys` / `utils/rotate-passwords`           | Credential rotation                                            |

## Layout

```
projects/project02/server/
├── package.json            — Project 02 server manifest + lint-staged config
├── .nvmrc                  — Node version pin (24)
├── eslint.config.js        — flat config (ESLint v9+); no-console allows warn/error
├── .prettierrc / .prettierignore
├── .editorconfig
├── .gitignore              — server-tree-local ignores (node_modules, *-config.ini)
├── commitlint.config.cjs   — conventional-commits enforcement (husky wire-up deferred)
├── jest.config.js          — six-layer Jest test pyramid
├── app.js                  — Express app
├── server.js               — listen() entrypoint; pool.end() on SIGTERM (Phase 7+)
├── src/photoapp-core/      — Project 02 local PhotoApp app core
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── smoke/
│   ├── happy_path/
│   └── live/
└── _assignment-template/   — Prof. Hummel's starter; reference only (deleted post Phase 2)
```

## Workstream pointers

- **Plan + execution state:** `projects/project02/client/MetaFiles/Approach/Plan.md` + `OrientationMap.md`
- **Foundation Approach (current workstream):** `projects/project02/client/MetaFiles/Approach/01-foundation.md`
- **Web Service Approach (Phase 2 — Gradescope 60/60):** `MetaFiles/Approach/02-web-service.md`
- **Refactor log:** `projects/project02/client/MetaFiles/refactor-log.md`
