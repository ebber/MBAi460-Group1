# Foundation Workstream Approach

> **For agentic workers:** Execute this as a checklist. TDD: write the failing test, watch it fail, implement the smallest change, verify green. Configuration-only steps still need an integration or smoke check. **This workstream must be complete before `02-web-service.md` starts** — the layered architecture, observability, error middleware, pool, and test harness are preconditions for every route implementation that follows.

> **Hard precondition: `00-shared-library-extraction.md` (Phase −1) is complete and accepted.** Project 02 begins as a *consumer* of `@mbai460/photoapp-server`, not as a copy-and-adapt sibling of Part 03. If `lib/photoapp-server/` does not yet exist — or `node -e "require('@mbai460/photoapp-server')"` does not yet resolve from inside `projects/project02/server/` — stop and run Phase −1 first.

> **Read `00-overview-and-conventions.md` "Inherited Assets" section first.** Project 02 is **not** built from scratch. The service core lives in the shared library (extracted in Phase −1); the shared backbone (`infra/terraform/`, `utils/`, `docker/`) is already applied. Phase 0 below configures Project 02 as a workspace consumer of the library and brings in the shared backbone references; the genuinely-new Project 02 modules (`request_id`, `logging`, `validate`, `observability/`, the route + controller layer) are built in subsequent phases.

## Goal

Build the production-grade scaffolding that every subsequent workstream depends on: docker-compose for local dev, Terraform module skeletons for cloud resources, structured logging, request id propagation, health endpoints, central error middleware, mysql connection pool, lint/format/pre-commit, OpenAPI 3.1 stub, and the full test pyramid harness (unit / integration / contract / smoke / happy-path / live). At the end of this workstream the server starts cleanly with a placeholder `/healthz`, the test harness runs (passes with no tests), and Terraform plan succeeds against an empty backend.

## Scope

This workstream owns:

- `docker-compose.yml` — client image, server image, MySQL 8, LocalStack (S3 + IAM endpoints).
- `projects/project02/infra/` — Terraform modules **refactored from the existing flat layout** at `MBAi460-Group1/infra/terraform/`: RDS, S3, IAM, CloudWatch log groups; envs scaffold (`dev/`, `prod/`); remote state config (S3 + DynamoDB lock; placeholder until Part 02 lands). **Non-destructive** — the existing applied resources are preserved via `terraform state mv`.
- `server/observability/` — `pino` config, `pino-http` middleware, OpenTelemetry stub. **Net-new in Project 02; not in the shared library** (1.1.0 promotion candidate after Project 02 ships).
- `server/middleware/request_id.js` + `server/middleware/logging.js` + `server/middleware/validate.js` — request id propagation, `pino-http` integration, `zod`-based validation. **Net-new in Project 02.**
- `server/services/pool.js` — `mysql2.createPool` factory; injected into the library's `services/photoapp.js` for transactional flows. **Net-new in Project 02; promotion to library 1.1.0 candidate.**
- `server/services/breakers.js` — `opossum` circuit breakers wrapping the library's `getBucket()` / `getRekognition()` clients. **Net-new in Project 02; promotion candidate.**
- `server/app.js` — exports `app`; no `listen()`; mount order `/v2` (when enabled) → `/v1` router at root → 404; `/healthz` + `/readyz` outside the `/v1` namespace; constructs `createErrorMiddleware({ statusCodeMap: project02MountPrefixAwareMap, errorShapeFor: req => res.locals.errorShape, logger: pinoInstance })` from the library.
- `server/server.js` — sole `listen()` entrypoint; calls `pool.end()` in the SIGTERM handler.
- `package.json` — devDeps (`jest`, `supertest`, `pino`, `pino-http`, `pino-pretty`, `zod`, `opossum`, `p-retry`, `mysql2`, AWS SDK v3, `eslint`, `prettier`, `husky`, `lint-staged`).
- `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`, `.nvmrc`, `.gitignore`, `commitlint.config.cjs`.
- `api/openapi.yaml` — OpenAPI 3.1 stub with the spec-compliant route inventory and shared response envelope schemas.
- `tools/package-submission.sh` — submission tarball builder with allowlist.
- `tools/run-local.sh`, `tools/teardown-local.sh` — convenience wrappers.
- `Makefile` — `make up`, `make down`, `make test`, `make lint`, `make submit-server`, `make submit-client`.
- Python client tooling: `pyproject.toml` (or extending existing setup) with `pytest`, `responses`, `ruff`, `black`, `mypy`.
- Test harness scaffold across all six layers (unit / integration / contract / smoke / happy-path / live).
- `MetaFiles/refactor-log.md`, `MetaFiles/EXPECTED-OUTCOMES.md`, `MetaFiles/NAMING-CONVENTIONS.md`. (The cross-workstream deferred-decisions queue is **global** at `MBAi460-Group1/MetaFiles/TODO.md` — established in `00-shared-library-extraction.md` § 5.7 — not duplicated here.)

This workstream does **not** own:

- Implementing the spec-compliant routes — owned by `02-web-service.md`.
- Rewriting `photoapp.py` — owned by `03-client-api.md`.
- Engineering `/v2` routes — owned by `04-engineering-surface.md`.
- CI/CD pipeline — `Future-State-cicd.md`.
- Any `terraform apply` against AWS — Part 02.

## Dependencies

Read first:

- `00-overview-and-conventions.md`
- `00-shared-library-extraction.md` — **must be complete and accepted**. Project 02 cannot begin until the shared library exists.
- `project02-part01.pdf` (assignment handout)
- `MBAi460-Group1/projects/project01/Part03/MetaFiles/Approach/02-server-foundation.md` (precedent for split `app.js` / `server.js`, `/health` outside the API namespace, mount order — historical reference; the patterns now live in `@mbai460/photoapp-server`)
- `MBAi460-Group1/projects/project01/Part03/MetaFiles/Approach/03-api-routes.md` (precedent for layered services, envelope helpers, error middleware — historical reference; the implementations now live in `@mbai460/photoapp-server`)
- `lib/photoapp-server/README.md` — the shared library's public API and DI seams (created in Phase −1)
- `MBAi460-Group1/CONTRIBUTING.md` — workspace etiquette, lockfile merge, library change protocol (created in Phase −1)
- `MBAi460-Group1/MetaFiles/DOC-FRESHNESS.md` — doc-staleness prevention protocol (created in Phase −1)

Required tools on the workstation:

- Docker Desktop or Colima (already installed for Project 01 — `utils/docker-up` / `utils/docker-down` work).
- Node 24.x (matches Part 03's `engines.node >=24.x`; `.nvmrc` pins this).
- Python 3.11+ (already used by `client/photoapp.py` in Part 02 + `utils/_run_sql.py`).
- Terraform 1.7+ (already used by `infra/terraform/`).
- AWS CLI v2 (already used by `utils/smoke-test-aws`, `utils/aws-inventory`).
- The shared `mbai460-client:latest` Docker image (built via `docker/build` in Part 01) is already present.

## Phase 0: Consume Library & Extend

> Goal: register Project 02 as a workspace consumer of `@mbai460/photoapp-server`, scaffold the surface-specific tree, and confirm the library boots inside Project 02 before any new logic lands. This phase is mostly `package.json` plumbing + tiny smoke files — there is no copy-and-adapt of source code, because the source code already lives in the library after Phase −1.

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-foundation-consumer-bootstrap-v1.md`
>
> Before executing 0.2, render a one-page Mermaid `flowchart LR` of the **library consumer bootstrap**.
>
> - **Story**: "Workspace root → npm install → symlink resolves → Project 02 imports library exports → app.js constructs the DI seams (errorMiddleware factory, pool injection, opossum breakers) and boots."
> - **Focus**: paint the **DI seams** (`createErrorMiddleware({...mountPrefixAwareMap})`, `pool` injection into `services/photoapp`, `breakers` wrapping `getBucket`/`getRekognition`) in **amber** — these are the configuration points where Project 02's wiring differs from Part 03's. Paint the **library boundary** (`@mbai460/photoapp-server`) in **gray** to signal "do not modify here; library extraction owns this." Paint Project 02's net-new files (`request_id`, `logging`, `validate`, `pool`, `breakers`, `app.js`, `server.js`) in **green**.
> - **Shape vocab**: cylinder `[(...)]` = `node_modules` symlink; rounded rect = source file; trapezoid = DI seam; subgraph = tree (`lib/photoapp-server` / `projects/project02/server`); arrows labeled `requires`, `injects`, `wraps`.
> - **Brevity**: file/module name only.
> - **Direction**: `flowchart LR` so the bootstrap reads left → right (workspace root → library → consumer wiring).

### 0.1 Verify shared library + backbone

These are checked because Phase −1 and the shared lab backbone established them. Each is a *precondition*; if any is missing, stop and resolve before proceeding.

- [x] (existing — Phase −1) `MBAi460-Group1/package.json` workspace root with `["lib/*", "projects/project01/Part03", "projects/project02/server"]`.
- [x] (existing — Phase −1) `MBAi460-Group1/.npmrc` with `package-lock=true`, `engine-strict=true`, `save-exact=true`.
- [x] (existing — Phase −1) `lib/photoapp-server/` with `package.json` (`@mbai460/photoapp-server@1.0.0`), `src/{config,services,repositories,middleware,schemas}/`, `tests/`, README, CHANGELOG.
- [x] (existing — Phase −1) `lib/photoapp-server/src/middleware/error.js` exports `createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`.
- [x] (existing — Phase −1) `lib/photoapp-server/src/middleware/upload.js` exports `createUploadMiddleware({ destDir, sizeLimit })`.
- [x] (existing — Phase −1) `lib/photoapp-server/src/schemas/envelopes.js` exports variadic `successResponse({...extras})` and `errorResponse(message, extras?)`.
- [x] (existing — Phase −1) `MBAi460-Group1/CONTRIBUTING.md`, `MBAi460-Group1/MetaFiles/DOC-FRESHNESS.md`, `.github/pull_request_template.md`, `.gitattributes` lockfile merge directive.
- [x] (existing — Phase −1) Part 03 (`projects/project01/Part03/server/`) consumes the library; Part 03 tests green.
- [x] (existing — backbone) `infra/terraform/main.tf` — S3 bucket, RDS MySQL 8, security group, IAM users (`s3readonly`, `s3readwrite` w/ Rekognition full access), test images.
- [x] (existing — backbone) `infra/terraform/variables.tf` + `outputs.tf` + `terraform.tfvars.example`.
- [x] (existing — backbone) `infra/config/photoapp-config.ini.example` — backbone config template.
- [x] (existing — backbone) `projects/project01/client/photoapp-config.ini` — RW DB user + s3readwrite profile (gitignored; lives on each collaborator's workstation).
- [x] (existing — backbone) `projects/project01/create-photoapp.sql` — canonical DDL with `users`, `assets` (incl. `kind` ENUM), seeded users 80001-80003, IAM app users `photoapp-read-only` / `photoapp-read-write`.
- [x] (existing — backbone) `projects/project01/create-photoapp-labels.sql` — `labels` table with `labelid` PK + FK CASCADE to `assets`.
- [x] (existing — backbone) `projects/project01/migrations/2026-04-26-add-assets-kind.sql` — one-shot kind column migration (do not re-run).
- [x] (existing — backbone) `utils/run-sql`, `utils/_run_sql.py` — SQL runner inside Docker.
- [x] (existing — backbone) `utils/validate-db`, `utils/_validate_db.py` — 26-check schema + seed validator.
- [x] (existing — backbone) `utils/rebuild-db` — runs `create-photoapp.sql` + `create-photoapp-labels.sql` + `validate-db`.
- [x] (existing — backbone) `utils/smoke-test-aws` — 10-check live AWS verification.
- [x] (existing — backbone) `utils/cred-sweep` — staged-content secret scanner.
- [x] (existing — backbone) `utils/rotate-access-keys`, `utils/rotate-passwords` — rotation scripts.
- [x] (existing — backbone) `utils/aws-inventory` — TF vs MANUAL drift scanner.
- [x] (existing — backbone) `utils/docker-up`, `utils/docker-down`, `utils/docker-status` — Mac/Colima helpers.
- [x] (existing — backbone) `docker/Dockerfile`, `docker/build`, `docker/run`, `docker/run-8080` — Ubuntu image with Python + boto3 + pymysql + cloudflared + Gradescope `gs` CLI.
- [x] (existing — backbone) `MetaFiles/QUICKSTART.md` — collaborator setup walkthrough (updated in Phase −1 for the workspace-aware install flow).

### 0.2 Bootstrap Project 02 as a workspace consumer

- [ ] Create `projects/project02/server/` directory.
- [ ] Create `projects/project02/server/package.json` with:
  - `"name": "project02-server"`, `"private": true`, `"main": "server.js"`.
  - `"dependencies": { "@mbai460/photoapp-server": "*", "express": "^5.x", "ini": "^...", "uuid": "^..." }` (`*` resolves to the library workspace per CL8 floating-pre-1.0.0).
  - `"devDependencies":` (added in subsequent phases) — `pino`, `pino-http`, `pino-pretty`, `zod`, `opossum`, `aws-sdk-client-mock`, `chai-openapi-response-validator`, `jest`, `supertest`, `eslint`, `prettier`, `husky`, `lint-staged`.
  - `"engines": { "node": ">=24.x" }` (matches Part 03 + the shared `.nvmrc`).
- [ ] Create `projects/project02/server/jest.config.js` — multi-project layout placeholder (Phase 11 fills it in with the six layers).
- [ ] Create `projects/project02/server/.eslintrc.cjs`, `.prettierrc` — net-new, Project 02-specific. Do not duplicate from Part 03; pick the standards your team agreed in `CONTRIBUTING.md`.
- [ ] From the **monorepo root**, run `npm install`. This must:
  - Update the root `package-lock.json` to include Project 02's deps.
  - Create `projects/project02/server/node_modules/@mbai460/photoapp-server` as a symlink (or hoisted to the root `node_modules/`).
  - Exit 0.
- [ ] Verify the symlink: `cd projects/project02/server && node -e "console.log(Object.keys(require('@mbai460/photoapp-server')))"` prints the library's exports map.
- [ ] **Do not** copy any source from Part 03 into `projects/project02/server/`. The library is the canonical source; copying defeats the purpose of Phase −1. If you find a service-layer behaviour the library doesn't yet expose, that is a *library issue* — open an issue, propose a library change, get review, land the change in the library, then continue Project 02. CL9 in `00-shared-library-extraction.md` describes the bounded reconciliation pattern.

### 0.3 Construct the smoke `app.js` + `server.js`

> This step builds *just enough* of `app.js` and `server.js` to prove the library boots inside Project 02. Real route mounts, error middleware DI, observability, and `/healthz`/`/readyz` land in subsequent phases (2, 4, 5).

- [ ] Create `projects/project02/server/app.js`:
  ```js
  const express = require('express');
  const { schemas } = require('@mbai460/photoapp-server');
  const app = express();
  app.get('/__bootcheck', (req, res) => res.json(schemas.envelopes.successResponse({ ok: true })));
  module.exports = app;
  ```
- [ ] Create `projects/project02/server/server.js`:
  ```js
  const app = require('./app');
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`project02-server listening on :${port}`));
  ```
  *(`console.log` is fine here only because `pino` is not introduced until Phase 3; Phase 3 replaces it.)*
- [ ] `cd projects/project02/server && npm start &` then `curl http://localhost:8080/__bootcheck` returns `{"message":"success","ok":true}`. **This proves the library symlink works end-to-end.** Tear down the process before continuing.
- [ ] Delete `/__bootcheck` after the smoke confirms — it has no further purpose.

### 0.4 Reuse shared infrastructure references

- [ ] Document the shared config path in `projects/project02/server/README.md`: Project 02 reads `photoapp-config.ini` from the same path Part 03 reads from (`projects/project01/client/photoapp-config.ini`). The library's `config.js` accepts a path; Project 02's `app.js` passes the path Part 03 already established.
- [ ] Document in the same README that `utils/run-sql`, `utils/validate-db`, `utils/rebuild-db`, `utils/smoke-test-aws`, `utils/cred-sweep`, `utils/aws-inventory`, `utils/docker-up`/`docker-down`/`docker-status`, `utils/rotate-access-keys`, `utils/rotate-passwords` are the **canonical** ops tools; do not duplicate them.
- [ ] Run `utils/validate-db` from repo root to confirm the schema is in place and seeded.
- [ ] Run `utils/smoke-test-aws --mode live` to confirm AWS connectivity.

### 0.5 Acceptance for Phase 0

- [ ] `cd MBAi460-Group1 && npm install` from a clean state succeeds; root `node_modules/` and per-workspace symlinks resolve.
- [ ] `cd projects/project02/server && node -e "require('@mbai460/photoapp-server')"` exits 0.
- [ ] The smoke `app.js` + `server.js` boot and the `/__bootcheck` round-trip works (then the route is removed).
- [ ] Part 03's tests still green (Phase −1 acceptance is preserved): `cd projects/project01/Part03 && npm test`.
- [ ] No source code copied from Part 03 into `projects/project02/server/`. **If `git diff` shows files in `projects/project02/server/services/`, `middleware/error.js`, `middleware/upload.js`, `schemas/envelopes.js`, or `schemas/rows.js`, stop and remove them — they belong in the library.** (Project 02-specific `services/pool.js`, `services/breakers.js`, `middleware/request_id.js`, `middleware/logging.js`, `middleware/validate.js`, `schemas/request_schemas.js` are correct and land in subsequent phases.)
- [ ] `utils/cred-sweep` clean.

> **Optional Test Step** — suggested file `projects/project02/server/tests/unit/library_resolution.test.js`
>
> The Phase 0 smoke `__bootcheck` route is going to be deleted; without a permanent test, "does the workspace still resolve `@mbai460/photoapp-server` from Project 02?" becomes a tribal-knowledge fact again. A 5-line unit test makes that question CI-checkable forever.
>
> - **What to lock down**: `require('@mbai460/photoapp-server')` returns an object with the documented top-level keys (`config`, `services`, `repositories`, `middleware`, `schemas`); `services.photoapp.getPing` is callable. Mirror the library's `exports-shape.test.js` from a *consumer's* perspective — symmetric assertions, different vantage point.
> - **Why this catches bugs**: a future `package.json` cleanup that accidentally drops the `@mbai460/photoapp-server` dep, or a future workspace topology change, would break this test in CI before the next contributor pulls and is mystified by `Cannot find module`.
> - **Decision branches**: build now (recommended — costs 5 lines, replaces the about-to-be-deleted smoke route with permanent coverage), queue (defer to Phase 11 test-pyramid wiring), skip (rely on integration tests to catch resolution failures indirectly — they will, but slower).

> **Optional Utility Step** — suggested artifact `make doctor` extension (extends Phase −1's `make doctor`)
>
> The 0.4 + 0.5 sequence (validate-db + smoke-test-aws + cred-sweep + lib-symlink-check) is about to be the canonical "is my Project 02 dev env healthy?" check. Extending `make doctor` to know about Project 02-specific paths makes it the single command to run on a Tuesday morning when something feels off.
>
> - **What it does**: extends Phase −1's `make doctor` with three additional probes: (a) `projects/project02/server/photoapp-config.ini` exists and parses (warns + prints the symlink command if missing), (b) `node -e "require('@mbai460/photoapp-server')"` succeeds *from inside* `projects/project02/server/` (proves the workspace symlink is intact for this consumer specifically — not just the root), (c) `npm ls --workspace=projects/project02/server` reports zero unmet peer-dependency warnings (catches a hoisting failure that would otherwise show up as a confusing test failure later).
> - **Why now**: Phase 0 acceptance is the *first* time these checks compose. Future selves running `make doctor` after a branch switch or an `npm install` will appreciate the unified output instead of triaging four commands by hand.
> - **Decision branches**: build now (recommended if `make doctor` exists from Phase −1; the extension is ~10 lines), queue (until docker-compose lands in Phase 10 — then add a `(d) compose health` probe in the same pass), skip (only if `make doctor` was itself skipped in Phase −1 and you don't want a half-built ladder).

### 0.6 Documentation touchpoint (per CL11)

The act of bootstrapping Project 02 changes the contributor-facing *Quickstart* path: previously, the only consumer of the workspace was Part 03; now Project 02 is also a consumer.

- [ ] Update `projects/project02/server/README.md`: this file's stub is created in 0.4 above; ensure it includes (a) "consumes `@mbai460/photoapp-server`", (b) link to `lib/photoapp-server/README.md`, (c) the four-line install/test/start command sequence, (d) link to `MBAi460-Group1/CONTRIBUTING.md`.
- [ ] Update `projects/project02/client/README.md` (if it exists, otherwise create as part of workstream 03): note that the client side is workstream 03's concern; this README is the entry point.
- [ ] Update `MBAi460-Group1/MetaFiles/QUICKSTART.md` (created in Phase −1): append a "Working on Project 02" subsection mirroring the existing "Working on Part 03" subsection.
- [ ] Update `MBAi460-Group1/README.md` "Repository Structure" to mention `projects/project02/` as a sibling of `projects/project01/Part03/`.
- [ ] **Fresh-clone smoke test.** Have a teammate (or yourself, in a fresh checkout) follow the updated Quickstart and confirm `npm install` + `cd projects/project02/server && npm test` reaches green. Document any friction in `MetaFiles/QUICKSTART.md` and re-run until friction is zero.

## Target Files

```text
MBAi460-Group1/projects/project02/
  client/
    photoapp-client-config.ini.example
    pyproject.toml                                 # or extends existing client setup
    MetaFiles/
      refactor-log.md
      EXPECTED-OUTCOMES.md
      NAMING-CONVENTIONS.md
      TODO.md
  server/                                           # NEW: thin Project 02 surface; consumes @mbai460/photoapp-server
    app.js                                          # constructs DI seams; mount order /v2 → /v1 → 404 → error
    server.js                                       # sole listen() entrypoint + closePool() on SIGTERM
    photoapp-config.ini.example                     # template (.ini consumed via library config loader)
    routes/
      v1/                                           # populated by workstream 02 — thin spec adapters
      v2/                                           # populated by workstream 04 — engineering surface
    controllers/
      v1/                                           # populated by workstream 02 — set res.locals.errorShape; call lib services
    services/
      pool.js                                       # NEW Project 02 — mysql2.createPool factory; promotion candidate
      breakers.js                                   # NEW Project 02 — opossum wrappers around lib AWS clients; promotion candidate
    middleware/
      request_id.js                                 # NEW Project 02
      logging.js                                    # NEW Project 02 — pino-http
      error_config.js                               # NEW Project 02 — statusCodeMap + errorShapeFor; NOT the middleware itself (that comes from the library factory)
      errors.js                                     # NEW Project 02 — AppError class hierarchy
      validate.js                                   # NEW Project 02 — zod-based
    schemas/
      request_schemas.js                            # NEW Project 02 — zod schemas per route; shape established here, populated per route in workstream 02
    observability/
      pino.js                                       # NEW Project 02
      tracing.js                                    # NEW Project 02 — OTel stub (workstream 04 fills it in)
    tests/                                          # surface-specific only; service-layer tests live in lib/photoapp-server/tests/
      unit/
        request_id.test.js
        validate_middleware.test.js
        pool.test.js
        breakers.test.js
        errors.test.js                              # AppError hierarchy + Project 02 statusCodeMap behaviour (asserts the library factory + Project 02 DI produce the spec contract)
        envelopes_spec_shapes.test.js               # asserts library helpers satisfy Project 02 spec envelopes
      integration/
        health.test.js
        readiness.test.js
      contract/
        openapi_conformance.test.js                 # uses openapi.yaml as source of truth
      smoke/
        smoke.test.js                               # post-up probe
      happy_path/
        e2e_skeleton.test.js                        # placeholder until routes land
      live/
        live_skeleton.test.js                       # gated; placeholder
    package.json                                    # depends @mbai460/photoapp-server (workspace protocol *)
    jest.config.js
    .eslintrc.cjs
    .prettierrc
    .editorconfig
    .nvmrc
    .gitignore
    commitlint.config.cjs
    Dockerfile                                      # workspace-aware copy pattern (mirror of Phase −1's Part 03 pattern)
    README.md                                       # NEW — references lib/photoapp-server/README.md; documents DI seams
infra/
  modules/
    rds/
      main.tf
      variables.tf
      outputs.tf
      README.md
    s3/
      main.tf
      variables.tf
      outputs.tf
      README.md
    iam/
      main.tf
      variables.tf
      outputs.tf
      README.md
    cloudwatch/
      main.tf
      variables.tf
      outputs.tf
      README.md
  envs/
    dev/
      main.tf
      backend.tf                                   # placeholder; remote state in Part 02
      terraform.tfvars.example
    prod/
      (mirror of dev)
  README.md
api/
  openapi.yaml
docker-compose.yml
Makefile
tools/
  run-local.sh
  teardown-local.sh
  package-submission.sh
  smoke.sh
.github/                                           # populated by Future-State-cicd
```

## Design Decisions

- **F1 — `app.js` does not call `listen()`.** Same reason as project01 Part03: supertest needs to import the app without binding a port.
- **F2 — `/healthz` and `/readyz` are mounted outside `/v1`.** Liveness is for the EB ALB; readiness probes RDS + S3 + Rekognition reachability and is for monitoring dashboards. Keeping them outside `/v1` prevents Gradescope autograder traffic from accidentally seeing them.
- **F3 — Mount order.** `request_id` → `pino-http` → `express.json` (50 MB cap, route-overridable) → `/healthz` → `/readyz` → `/v1` router → (if `ENABLE_V2_ROUTES=1`) `/v2` router → 404 fallback → error middleware. The error middleware is *last* by Express convention.
- **F4 — One `mysql2.createPool` per process.** Configured in `services/aws.js` with `connectionLimit: 5`. Closed in `server.js` `SIGTERM` / `SIGINT` handler.
- **F5 — `opossum` circuit breakers wrap each AWS service call.** One breaker per service (S3, Rekognition); breakers are constructed once and reused. State changes (`open` / `halfOpen` / `close`) are logged at `warn`.
- **F6 — `zod` is the validation library.** Schemas live next to the route registration so a route handler is `validate(schema), controller`. The middleware writes parsed values to `req.validated.{body, params, query}`.
- **F7 — OpenAPI 3.1 is the single source of truth for the wire contract.** The contract test suite parses `api/openapi.yaml` and asserts that for every documented operation, the corresponding express route returns a response that conforms to the schema. Tests fail if the YAML drifts from the implementation.
- **F8 — Terraform modules are local-only here.** No `apply` happens in Part 01. `terraform validate` and `terraform plan` against an empty / mock backend are part of the test harness so we catch syntax breaks early.
- **F9 — LocalStack covers S3 + IAM only.** Rekognition is mocked at the SDK level in integration tests (LocalStack's free-tier Rekognition support is incomplete and not worth the setup cost). `aws.js` reads the `AWS_ENDPOINT_URL` env var so the same code runs against LocalStack locally and real AWS in deployment.
- **F10 — Pre-commit hooks via `husky` + `lint-staged`.** ESLint + Prettier on staged JS; ruff + black on staged Python; `commitlint` on the commit message; a custom hook denies committed `*-config.ini` files outside `*.example` and `tests/fixtures/`.
- **F11 — Submission tarball is allowlist-based.** `tools/package-submission.sh` reads `tools/submission-allowlist.txt`; anything not on the allowlist is excluded. A unit test loads the allowlist and asserts the spec-required filenames are present.

---

## Phase 1: Repo Skeleton & Tooling Bootstrap

### Task 1.1: Pin Node and Python versions

**Files:**

- Create: `server/.nvmrc`
- Create or modify: `client/pyproject.toml`

**Checklist:**

- [ ] `server/.nvmrc` contains `20.11.1` (or the latest Node 20 LTS at execution time).
- [ ] `client/pyproject.toml` declares `python = "^3.11"` and tool sections for `ruff`, `black`, `mypy`, `pytest`.
- [ ] `nvm use` in `server/` switches to the pinned version.

**Check your work:**

- Smoke: `node -v` matches the `.nvmrc` value after `nvm use`.
- Smoke: `python --version` reports a 3.11+ interpreter.

### Task 1.2: Initialise `package.json` for the server

**Files:**

- Create: `server/package.json`

**Checklist:**

- [ ] `name`: `mbai460-photoapp-server`.
- [ ] `version`: `0.1.0`.
- [ ] `engines.node`: `>=20.11.0 <21`.
- [ ] `main`: `server.js`.
- [ ] `type`: `commonjs` (mirrors the assignment baseline; flip to `module` is a deliberate refactor).
- [ ] `scripts`: `start`, `dev` (`nodemon`), `test`, `test:unit`, `test:integration`, `test:contract`, `test:smoke`, `test:happy`, `test:live`, `lint`, `lint:fix`, `format`.
- [ ] Production deps: `express`, `mysql2`, `@aws-sdk/client-s3`, `@aws-sdk/client-rekognition`, `@aws-sdk/credential-providers`, `pino`, `pino-http`, `zod`, `p-retry`, `opossum`, `uuid`, `ini`.
- [ ] Dev deps: `jest`, `supertest`, `nodemon`, `pino-pretty`, `eslint`, `@eslint/js`, `prettier`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `openapi-types`, `chai-openapi-response-validator`, `aws-sdk-client-mock`.
- [ ] `npm install` runs cleanly.

**Check your work:**

- Integration: `npm ls --depth=0` shows every dep installed and no peer warnings.
- Smoke: `node -e "require('express')"` exits 0.

### Task 1.3: Lint + format + commitlint config

**Files:**

- Create: `server/.eslintrc.cjs`
- Create: `server/.prettierrc`
- Create: `server/.editorconfig`
- Create: `server/commitlint.config.cjs`
- Create: `server/.gitignore`
- Modify: `package.json` (lint-staged + husky config)

**Checklist:**

- [ ] ESLint config extends `eslint:recommended`; sets `node` and `jest` envs; bans `console.log` (`no-console: ["error", { allow: ["error", "warn"] }]` is intentional — `pino` replaces every `console.log` outside `app.js` startup, where startup logging stays on `console.warn` / `console.error` for early-boot signal).
- [ ] Prettier config matches the project01 Part03 style (`singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`).
- [ ] `commitlint.config.cjs` extends `@commitlint/config-conventional`.
- [ ] `husky` configured: `pre-commit` runs `lint-staged`; `commit-msg` runs `commitlint`.
- [ ] `lint-staged`: JS files run `eslint --fix` + `prettier --write`; Python files run `ruff check --fix` + `black`.
- [ ] `.gitignore` excludes `node_modules/`, `coverage/`, `*.log`, `*.ini` (with `!*-config.ini.example` exception), `.env*`, `.DS_Store`.
- [ ] Pre-commit hook denies committing `*-config.ini` outside the example template.

**Check your work:**

- Unit: `npx eslint server/` exits 0 against the empty tree (no source files yet).
- Smoke: `git commit -am "chore: lint test"` triggers pre-commit; reverting tests `commitlint` rejects a non-conventional message.

### Task 1.4: Python tooling

**Files:**

- Create or modify: `client/pyproject.toml`
- Create: `client/.gitignore` (if not already)

**Checklist:**

- [ ] `pyproject.toml` declares dev dependencies: `pytest`, `pytest-cov`, `responses`, `ruff`, `black`, `mypy`.
- [ ] `[tool.ruff]` config matches lab02's style.
- [ ] `[tool.black]` line length 100.
- [ ] `[tool.pytest.ini_options]` sets `testpaths = ["tests"]`, `markers = ["live: opt-in live AWS tests; gated on PHOTOAPP_RUN_LIVE_TESTS=1"]`.
- [ ] `[tool.mypy]` strict for new files; `--ignore-missing-imports` for `client.py` / `gui.py` (legacy).

**Check your work:**

- Integration: `pip install -e ".[dev]"` (or equivalent) succeeds.
- Smoke: `pytest --collect-only` reports zero tests but exits 0.

### Task 1.5: Makefile

**Files:**

- Create: `Makefile`

**Checklist:**

- [ ] `make help` lists every target with a one-line description.
- [ ] `make up` runs `docker compose up --build -d` and waits for healthchecks.
- [ ] `make down` runs `docker compose down -v`.
- [ ] `make test` runs `npm test` in `server/` and `pytest` in `client/`.
- [ ] `make test-unit` / `test-integration` / `test-contract` / `test-smoke` / `test-happy` / `test-live` map to the respective test scripts.
- [ ] `make lint` runs ESLint + Prettier check + ruff + black --check + mypy.
- [ ] `make submit-server` invokes `tools/package-submission.sh server`.
- [ ] `make submit-client` invokes `tools/package-submission.sh client`.

**Check your work:**

- Smoke: `make help` exits 0 and prints the targets.
- Smoke: `make lint` exits 0 against the empty tree.

---

## Phase 2: Express App Skeleton

> **Phase 0 created a *smoke* `app.js` + `server.js`** that prove the library boots. This phase **expands** them into the production shape: mount order (`/v2` when enabled → `/v1` router at root → 404), `/healthz` + `/readyz`, request id + logging middleware, error middleware constructed from `createErrorMiddleware({...mountPrefixAwareMap, logger})`, graceful shutdown hook. **No source from Part 03 is copied here** — the patterns are familiar but the files are net-new for Project 02 because the wire contract is different.

> **Documentation touchpoint:** `projects/project02/server/README.md` updates with the new mount order + the env vars introduced (`PORT`, `ENABLE_V2_ROUTES`, `LOG_LEVEL`).

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-app-middleware-order-v1.md`
>
> Before editing `app.js`, render a `flowchart LR` of the **middleware mount order** so reviewers see the request lifecycle on one page.
>
> - **Story**: "A request enters the top, exits the bottom. Order is load-bearing — moving any node breaks something."
> - **Focus**: highlight the **delta from Part 03** in **red**: removed `/api` mount, removed static + SPA fallback, added `/v1` router and `/healthz` / `/readyz`. Bold the **error middleware** at the bottom — it terminates every error path.
> - **Shape vocab**: stadium `([...])` = HTTP entry; rounded `(...)` = middleware; cylinder `[(...)]` = router; diamond `{...}` = 404 fallback; trapezoid for the error terminator.
> - **Brevity**: ≤ 4 words / node; edges labeled `next()`, `error`, `404`.
> - **Direction**: `flowchart TD` so middleware order reads top → bottom.

### Task 2.1: Failing test for `app` export shape

**Files:**

- Create: `server/tests/unit/app_export.test.js`

**Write failing test first:**

```js
const app = require('../../app');

test('app exports an Express application', () => {
  expect(typeof app).toBe('function');
  expect(typeof app.use).toBe('function');
  expect(typeof app.get).toBe('function');
});

test('importing app does not bind a port', () => {
  expect(app).toBeDefined();
});
```

**Checklist:**

- [x] (existing — Phase 0) Smoke `app.js` exports an Express app via `module.exports = app`.
- [x] (existing — Phase 0) Smoke `server.js` is the sole `listen()` entrypoint.
- [ ] Test added (Project 02 covers its own surface; service-layer tests live in `lib/photoapp-server/tests/` and aren't duplicated here).
- [ ] `npm test` ran; confirmed red on the **production-shape** mount points (`/v1` router not yet wired, `/healthz` / `/readyz` not yet present, error middleware factory not yet constructed).

### Task 2.2: Expand `app.js` to production shape; add graceful shutdown to `server.js`

**Files:**

- Modify: `server/app.js`
- Create: `server/server.js`

**`server/app.js` shape:**

```js
const express = require('express');
const { config, middleware } = require('@mbai460/photoapp-server');

const requestId = require('./middleware/request_id');
const logging = require('./middleware/logging');
const { statusCodeMap, errorShapeFor } = require('./middleware/error_config');
const logger = require('./observability/pino');

const app = express();

app.use(requestId);
app.use(logging);
app.use(express.json({ strict: false, limit: '50mb' }));

// Health endpoints — outside any version namespace.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'live' }));
app.get('/readyz', require('./routes/_internal/readyz'));

// Optional /v2 surface (workstream 04) — mounted FIRST so /v2/images/:assetid doesn't shadow /v1's /image/:assetid.
if (process.env.ENABLE_V2_ROUTES === '1') {
  app.use('/v2', require('./routes/v2'));
}

// /v1 router mounted at root per D12 (Gradescope hits unprefixed paths).
app.use('/', require('./routes/v1'));

// 404 fallback — must precede error middleware.
app.use((req, res) => {
  res.status(404).json({ message: 'error', error: `route not found: ${req.method} ${req.path}` });
});

// Error middleware constructed via the library factory with Project 02's DI config.
app.use(middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger }));

module.exports = app;
```

**`server/server.js` shape:**

```js
const app = require('./app');
const { config } = require('@mbai460/photoapp-server');
const { closePool } = require('./services/pool');
const logger = require('./observability/pino');

const port = config.web_service_port;

const httpServer = app.listen(port, () => {
  logger.info({ port }, 'web service listening');
});

async function gracefulShutdown(signal) {
  logger.warn({ signal }, 'received shutdown signal, draining…');
  httpServer.close(async () => {
    try { await closePool(); } catch (err) { logger.error({ err }, 'pool close failed'); }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

**Checklist:**

- [x] (existing — Phase 0 smoke) `app.js` exports an Express app, no `listen()`.
- [x] (existing — Phase 0 smoke) `server.js` is the sole `listen()` site.
- [ ] Expand `app.js` from the smoke version to the production shape above (request id + logging + json + health + v2 + v1 + 404 + error).
- [ ] Mount order matches `D11`/`D12`: `/v2` first (when enabled) → `/v1` at root → 404 → error middleware terminator.
- [ ] Error middleware is constructed via `middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })` — **the library factory, called from Project 02's tree with Project 02's DI config**. Do not reach into the library to modify the underlying middleware.
- [ ] `closePool()` is imported from `./services/pool` (Project 02-specific; created in Phase 7) and called in `gracefulShutdown`.
- [ ] `npm start` runs `node server.js`; smoke `/__bootcheck` route from Phase 0 is removed (it served its purpose).
- [ ] Failing test from Task 2.1 now passes.

**Check your work:**

- Unit: `app_export.test.js` green.
- Integration: `npm start` prints the structured `web service listening` log.
- Smoke: `kill -TERM <pid>` triggers the graceful shutdown log line.

> **Optional Test Step** — suggested file `projects/project02/server/tests/unit/mount_order.test.js`
>
> Mount order is the kind of thing that's fine until someone "cleans up" `app.js` and silently breaks `/v1/image/:assetid` because `/v2/images/:assetid` now shadows it (D11/D12 in `00-overview-and-conventions.md`). A test that introspects the Express router stack pins the order *before* a future cleanup forgets why it mattered.
>
> - **What to lock down**: middleware order — request_id → logging → json → optional `/v2` mount → `/v1` mount at root → 404 → error middleware terminator. Walk `app._router.stack` and assert the regexp / handler types in the documented order. Add a comment in the test that quotes D11/D12 verbatim so the next maintainer sees the why before the assertion.
> - **Why this catches bugs**: a misplaced 404 handler swallows `/v2` traffic; a misplaced error terminator skips logging; a `/v1` mount that lands before `/v2` shadows engineering routes. All silent failures in production; loud failures in CI with this test.
> - **Decision branches**: build now (recommended — the cost is low and the bug class is high-impact), queue (defer to Phase 11 multi-project test wiring if you want to keep Phase 2 small), skip (only if you have a separate "every documented route returns expected behaviour" suite that incidentally exercises mount order).

---

## Phase 3: Observability — Logging & Request IDs

### Task 3.1: `pino` logger module + failing test

**Files:**

- Create: `server/observability/pino.js`
- Create: `server/tests/unit/pino.test.js`

**Module shape:**

```js
const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logger = pino({
  level,
  transport: process.env.NODE_ENV === 'production'
    ? undefined
    : { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' } },
  base: { service: 'photoapp-web', env: process.env.NODE_ENV || 'local' },
});

module.exports = logger;
```

**Checklist:**

- [ ] Failing test asserts `logger.info` exists, level honours `LOG_LEVEL`, base fields include `service: 'photoapp-web'`.
- [ ] Implement the module; test green.
- [ ] No `console.log` introduced.

### Task 3.2: Request id middleware

**Files:**

- Create: `server/middleware/request_id.js`
- Create: `server/tests/unit/request_id.test.js`

**Behavior:**

- Reads `X-Request-Id` header if present; otherwise generates `uuid.v4()`.
- Sets `req.id` and adds the header `X-Request-Id` to the response.

**Checklist:**

- [ ] Failing tests for both branches (header present, header absent).
- [ ] Implement; both tests green.

### Task 3.3: `pino-http` middleware wired with request id

**Files:**

- Create: `server/middleware/logging.js`
- Create: `server/tests/integration/request_id.test.js`

**Behavior:**

- Configures `pino-http` with `genReqId: (req) => req.id`.
- Per-request log fields: `req.id`, `req.method`, `req.url`, `res.statusCode`, `responseTime`.

**Checklist:**

- [ ] Failing supertest asserts that hitting `GET /healthz` produces a single `pino-http` log line containing the supplied `X-Request-Id`.
- [ ] Implement; test green.

### Task 3.4: OpenTelemetry stub

**Files:**

- Create: `server/observability/tracing.js`

**Behavior:**

- If `TRACING_ENABLED=1`, initialise `@opentelemetry/sdk-node` with the OTLP exporter (env: `OTEL_EXPORTER_OTLP_ENDPOINT`).
- Otherwise, exports a no-op `trace`.

**Checklist:**

- [ ] Unit test asserts that with `TRACING_ENABLED` unset, the stub initialises without throwing and exposes a no-op span helper.
- [ ] Real OTel wiring is **deferred** to workstream 04; this is the stub.

**Check your work:**

- Unit + integration: all three tests above green.
- Smoke: `LOG_LEVEL=debug npm start` shows pretty-printed startup log; `LOG_LEVEL=info` shows JSON.

---

## Phase 4: Health Endpoints

> **The library does not own health endpoints** — they are surface-specific (different surfaces probe different deps). Project 02 writes `/healthz` (liveness, no-op JSON) and `/readyz` (probes the pool from `services/pool.js` + the library's S3 + Rekognition clients). The pattern from Part 03 (`/health` returning `{status: "running"}`) is a useful precedent but the file is net-new in Project 02.

> **Documentation touchpoint:** `projects/project02/server/README.md` adds a "Probes" subsection naming the two endpoints and what they probe.

### Task 4.1: `/healthz` (liveness) — already wired in Phase 2

**Files:**

- Create: `server/tests/integration/health.test.js`
- Create: `server/tests/integration/health.test.js` — surface-specific assertions for `/healthz` (liveness, no-op) and `/readyz` (probes pool + library AWS clients).

**Write failing test first:**

```js
const request = require('supertest');
const app = require('../../app');

test('GET /healthz returns 200 {status: "live"}', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'live' });
});
```

**Checklist:**

- [ ] Test passes (handler is in `app.js` from Phase 2).

### Task 4.2: `/readyz` (readiness) probes RDS + S3

**Files:**

- Create: `server/routes/_internal/readyz.js`
- Create: `server/tests/integration/readiness.test.js`

**Behavior:**

- Calls `pool.execute('SELECT 1')` against RDS — wrap in 1.5 s timeout.
- Calls `bucket.send(new HeadBucketCommand({ Bucket: get_bucket_name() }))` against S3 — wrap in 1.5 s timeout.
- Returns 200 `{status: "ready", checks: {rds: "ok", s3: "ok"}}` if both pass; 503 with the failing check name otherwise.

**Checklist:**

- [ ] Failing test asserts: with mocked `aws.js` returning successful pool + bucket, response is 200 with both checks `ok`.
- [ ] Failing test asserts: with mocked `pool.execute` rejecting, response is 503 with `checks.rds: "<error>"`.
- [ ] Implement; both tests green.

**Check your work:**

- Integration: `make up && curl localhost:8080/readyz` returns 200 once MySQL + LocalStack are healthy.
- Smoke: stop LocalStack; `curl localhost:8080/readyz` returns 503.

---

## Phase 5: Error Handling Middleware (consume + DI-configure)

> **The library `@mbai460/photoapp-server` exports `createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`.** Phase 0 verified the symlink. This phase: (a) defines a typed `AppError` hierarchy in Project 02's tree (because surface-specific error classes are surface concerns; the library's existing `'no such userid'` / `'no such assetid'` string-matching mapping continues to satisfy Part 03), (b) writes Project 02's `statusCodeMap` (mount-prefix-aware: `/v1` → spec status codes per `D7`; `/v2` → REST-correct), (c) writes Project 02's `errorShapeFor` (reads from `res.locals.errorShape`), (d) constructs the middleware in `app.js` with the library factory and Project 02's `pino` logger.
>
> **Net-new in Project 02 (lives in `projects/project02/server/middleware/`):** `errors.js` (the `AppError` class hierarchy: `AppError`, `BadRequestError`, `NotFoundError`, `ServiceUnavailableError`, `ConflictError`).
>
> **Net-new in Project 02 (lives in `projects/project02/server/`):** the `statusCodeMap` and `errorShapeFor` functions, wired in `app.js`.
>
> **Library is not modified** — Project 02 satisfies all of its needs by passing different DI config to the same exported factory. If a future surface needs a different mapping shape, that's a 1.1.0 candidate library change.

> **Documentation touchpoint:** `projects/project02/server/README.md` adds an "Error mapping" subsection naming the AppError subclasses + which HTTP status they map to per surface.

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-error-class-mapping-v1.md`
>
> Before designing `AppError` subclasses, render a `flowchart TD` showing **error class → HTTP status code per mount prefix**.
>
> - **Story**: "Throw any of these classes from anywhere; the middleware maps to the right code based on `req.baseUrl`."
> - **Focus**: highlight the **`NotFoundError` row** in **red** — it maps to 400 on `/v1` (per spec) but 404 on `/v2` (REST-correct). That's the only place the spec deviates from convention. Highlight `res.locals.errorShape` in **amber** to signal it's the per-route extension point.
> - **Shape vocab**: rounded rect = error class; stadium `([...])` = HTTP status; subgraph = mount prefix (`/v1` vs `/v2`); diamond `{...}` = mount-prefix decision.
> - **Brevity**: class name only; status code only.
> - **Direction**: `flowchart TD` with two parallel columns under `/v1` and `/v2` subgraphs.

### Task 5.1: `AppError` class hierarchy

**Files:**

- Create: `server/middleware/errors.js`
- Create: `server/tests/unit/errors.test.js`

**Hierarchy:**

```js
class AppError extends Error {
  constructor(message, { cause, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.details = details;
  }
}
class BadRequestError extends AppError {}        // 400 v1, 400 v2
class NotFoundError extends AppError {}          // 400 v1 (per spec), 404 v2
class ConflictError extends AppError {}          // 409 v2
class ServiceUnavailableError extends AppError {} // 503

module.exports = { AppError, BadRequestError, NotFoundError, ConflictError, ServiceUnavailableError };
```

**Checklist:**

- [ ] Failing tests for each subclass: instance of `AppError`, `name` matches, `details` round-trips.
- [ ] Implement; tests green.

### Task 5.2: Central error middleware

**Files:**

- Create: `server/middleware/error.js`
- Create: `server/tests/unit/error_middleware.test.js`

**Behavior:**

- Mount-prefix-aware: `req.baseUrl.startsWith('/v2')` enables REST-correct status codes; `/v1` keeps spec-mandated codes.
- Maps:
  - `BadRequestError` → 400 (both v1 and v2).
  - `NotFoundError` → 400 on `/v1` (per spec), 404 on `/v2`.
  - `ConflictError` → 409 on `/v2`, 400 on `/v1` (with the conflict message in `error`).
  - `ServiceUnavailableError` → 503.
  - Multer / `LIMIT_*` errors → 400.
  - Anything else → 500 with a sanitised `internal server error` message; full error logged via `pino` with `err`, `err.cause`, `err.stack`.
- Body shape on error follows the spec contract: `{message, ...payload}` where payload defaults match the route family (e.g., `{message, M: -1, N: -1}` for `/ping`-shaped responses, `{message, data: []}` for list-shaped responses, `{message, assetid: -1}` for upload-shaped responses). The shape comes from `res.locals.errorShape`, which the route handler sets *before* delegating to the service.

**Checklist:**

- [ ] Failing tests for each branch: `BadRequestError` on `/v1` → 400, on `/v2` → 400; `NotFoundError` on `/v1` → 400, on `/v2` → 404; multer `LIMIT_FILE_SIZE` → 400; unknown error → 500 with sanitised message.
- [ ] Failing test asserts that the error shape matches `res.locals.errorShape` (e.g., a route that set `res.locals.errorShape = { M: -1, N: -1 }` produces `{message, M: -1, N: -1}` on error).
- [ ] Implement; tests green.

**Check your work:**

- Unit: every branch green.
- Integration: deferred until routes land — workstream 02 adds happy-path error tests per route.

> **Optional Test Step** — suggested file `projects/project02/server/tests/unit/error_status_code_map.test.js`
>
> The mount-prefix-aware `statusCodeMap` is *the* place where Project 02 differs from Part 03 in error behaviour. A table-driven test that enumerates every (`AppError` subclass × mount prefix × expected status code × expected envelope shape) combination locks the contract in 30 lines and catches D7/D11 violations the moment they're introduced.
>
> - **What to lock down**: a table like `[ { err: BadRequestError, baseUrl: '/v1', expectedStatus: 400, expectedShape: 'errorShape' }, { err: NotFoundError, baseUrl: '/v1', expectedStatus: 400 /* D7 */, ... }, { err: NotFoundError, baseUrl: '/v2', expectedStatus: 404 /* D7+D11 */, ... } ]`. Drive a fake `(err, req, res, next)` through the constructed middleware for each row.
> - **Why this catches bugs**: the spec contract requires `400` for "no such userid" on `/v1` (not `404`!) — this is the kind of thing every "let me make this REST-correct" refactor breaks. The test is the spec contract in code form. Worth its weight in re-grading hours.
> - **Decision branches**: build now (strongly recommended — this is one of the highest-leverage tests in the whole project), queue (only if you'd rather author it inside workstream 02 alongside route tests, which works but loses the *unit* isolation), skip (no — please don't).

> **Optional Documentation Step** — suggested artifact `projects/project02/api/error-map.md`
>
> The same table the test above iterates is also the canonical reference humans will look up ("what status does `/v1/image/:assetid` return on no-such-asset?"). Author the table once, link from the test source (so the test's data structure references the doc as its provenance) and from `lib/photoapp-server/README.md`'s error-mapping section.
>
> - **What it produces**: a single Markdown table mapping `(error class × mount prefix)` → `(status code × envelope shape × example body)`. Lives at `projects/project02/api/error-map.md` next to `openapi.yaml` for proximity.
> - **Why now**: you're already writing the table in code; capturing it in human-readable form is a 10-minute amortization. Authoring it later means re-deriving it from the test source — a worse experience.
> - **Decision branches**: build now (recommended — pairs naturally with the test step above), queue (defer to OpenAPI spec authoring in Phase 9 if you'd rather keep the table inline in `openapi.yaml`'s top-level description as one source of truth), skip (rely on the test as the only source of truth — fine, but harder to read on a Friday afternoon).

---

## Phase 6: Validation Middleware

### Task 6.1: `zod` validation middleware skeleton

**Files:**

- Create: `server/middleware/validate.js`
- Create: `server/schemas/request_schemas.js`
- Create: `server/tests/unit/validate_middleware.test.js`

**Middleware shape:**

```js
const { ZodError } = require('zod');
const { BadRequestError } = require('./errors');

function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
      };
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new BadRequestError('validation failed', { details: err.flatten() }));
      }
      next(err);
    }
  };
}

module.exports = validate;
```

**Checklist:**

- [ ] Failing tests: valid body parses to `req.validated.body`; invalid body throws `BadRequestError`; missing schema for a section is a no-op.
- [ ] Implement; tests green.

---

## Phase 7: AWS Client Factory Wrapping (consume + extend, do not modify the library)

> **The library `@mbai460/photoapp-server` exports `services.aws`** with `getBucket()`, `getBucketName()`, `getRekognition()`, and `getDbConn()` (per-request `mysql2.createConnection` — Part 03's behaviour). This phase **wraps** the library's exports from Project 02's tree without modifying the library:
>
> - **Net-new in Project 02 (`projects/project02/server/services/pool.js`):** a `mysql2.createPool({ connectionLimit: 5, multipleStatements: true, ... })` factory. The pool is constructed once at module load. Project 02's controllers and (in workstream 02) the route layer pass a connection from this pool into the library's `services/photoapp.js` functions when they need transactional behaviour. **Promotion candidate** for library 1.1.0 (after Project 02 ships and the pool factory has stabilised).
> - **Net-new in Project 02 (`projects/project02/server/services/breakers.js`):** `getBucketBreaker()` and `getRekognitionBreaker()` factories that wrap the library's `services.aws.getBucket()` and `getRekognition()` returns with `opossum`. Bounded timeouts, error-threshold tripping, fallback. **Promotion candidate** for library 1.1.0.
> - **Net-new in Project 02:** LocalStack `AWS_ENDPOINT_URL` override. The library's `services.aws` already passes through `AWS_ENDPOINT_URL` because that's an SDK-level env (no library change needed). Project 02's `docker-compose.yml` (Phase 10) sets it; nothing more is required.
>
> **Why this isn't a library modification:** the pool and breakers are *Project 02-specific reliability decisions*. Part 03 has been operating without them and is content; forcing them into the library now would either break Part 03 or require a config option for Part 03 to opt out — both worse than letting Project 02 own them in its own tree until/unless promotion is justified.

> **Documentation touchpoint:** `projects/project02/server/README.md` adds a "Reliability" subsection naming the pool + breaker factories and where to tune them. `lib/photoapp-server/CHANGELOG.md` gets a *forward-looking* note: "1.1.0 promotion candidates: pool factory, breakers (currently in Project 02 tree)".

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-aws-factory-v1.md`
>
> Before adapting `aws.js`, render a `flowchart LR` of the **service factory + resilience boundary** so reviewers see the new shape next to the old.
>
> - **Story**: "A service calls `getPool()`, `getBucketBreaker()`, `getRekognitionBreaker()`. Behind those, a single ini load + memoised clients + pooling."
> - **Focus**: highlight the **new pool** (`mysql2.createPool` replacing per-request `createConnection`) and the **two breakers** (`opossum` wrapping `bucket.send` / `rekog.send`) in **red** — those are the engineering additions vs Part 03. Highlight the **`AWS_ENDPOINT_URL` branch** (LocalStack) in **amber**.
> - **Shape vocab**: rounded rect = service consumer; cylinder `[(...)]` = pool / DB; hexagon `{{...}}` = breaker; cloud-style subgraph = AWS managed service (S3, Rekognition, RDS); diamond `{...}` = LocalStack-vs-real env decision.
> - **Brevity**: ≤ 4 words / node; edges labeled `getPool()`, `wraps`, `executes`, `falls back`.
> - **Direction**: `flowchart LR`.

### Task 7.1: Wrap library AWS clients with Project 02's pool + breakers (no library modification)

**Files:**

- Create: `projects/project02/server/services/pool.js` — `mysql2.createPool` factory + `closePool()`. Net-new in Project 02. Promotion candidate for library 1.1.0.
- Create: `projects/project02/server/services/breakers.js` — `opossum` wrappers around the library's `services.aws.getBucket()` / `getRekognition()`. Net-new in Project 02. Promotion candidate.
- Create: `projects/project02/server/tests/unit/pool.test.js` and `breakers.test.js`.

**Required exports (from Project 02's `services/`, not the library):**

- [x] (existing — library) `services.aws.getBucket()` → `S3Client`. *Consumed unchanged from `@mbai460/photoapp-server`.*
- [x] (existing — library) `services.aws.getBucketName()` → string from `[s3] bucket_name`. *Consumed unchanged.*
- [x] (existing — library) `services.aws.getRekognition()` → `RekognitionClient`. *Consumed unchanged.*
- [x] (existing — library) `services.aws.getDbConn()` → per-request `mysql2.Connection`. *Still works for non-transactional flows; Part 03 continues to use it. Project 02 prefers the pool below for transactional flows but the library export is unchanged.*
- [ ] **New in Project 02 (`services/pool.js`):** `getPool()` → `mysql2.Pool` (memoised module-level singleton; reads `photoappConfig` via `require('@mbai460/photoapp-server').config`).
- [ ] **New in Project 02 (`services/pool.js`):** `closePool()` → async; safely closes the pool (idempotent); called from `server.js` graceful shutdown hook.
- [ ] **New in Project 02 (`services/breakers.js`):** `getBucketBreaker()` / `getRekognitionBreaker()` → `opossum` instances wrapping the library client `send()` calls.

**Pool config:**

```js
mysql2.createPool({
  host: photoappConfig.rds.endpoint,
  port: photoappConfig.rds.port_number,
  user: photoappConfig.rds.user_name,
  password: photoappConfig.rds.user_pwd,
  database: photoappConfig.rds.db_name,
  multipleStatements: true,    // required by DELETE /images per spec; never used elsewhere
  connectionLimit: 5,
  waitForConnections: true,
  queueLimit: 0,
});
```

**Endpoint override:**

- If `AWS_ENDPOINT_URL` is set (LocalStack), pass `{ endpoint: process.env.AWS_ENDPOINT_URL, forcePathStyle: true }` to S3 client.

**Checklist:**

- [ ] Failing tests with `jest.mock('fs')` + canned `FAKE_INI`:
  - `getBucketName()` returns `'test-bucket'`.
  - `getBucket()` returns an object whose `config.region` is callable (AWS SDK v3 idiom).
  - `getRekognition()` returns a client.
  - `getPool()` is memoised — calling twice returns the same instance.
  - `closePool()` is idempotent — calling twice does not throw.
- [ ] Implement; tests green.

### Task 7.2: Circuit breakers

**Files:**

- Modify: `server/services/aws.js`
- Modify: `server/tests/unit/aws_factory.test.js`

**Behavior:**

- `getBucketBreaker()` and `getRekognitionBreaker()` return memoised `opossum` instances.
- Breaker config: `{ timeout: 10_000, errorThresholdPercentage: 50, resetTimeout: 30_000 }`.
- State change events log via `pino` at `warn`.

**Checklist:**

- [ ] Failing test: invoking the breaker resolves successfully when the wrapped fn resolves; breaker opens after the configured number of failures within the window.
- [ ] Implement; test green.

**Check your work:**

- Unit: factory + breaker tests green.
- Integration: `make up`; `node -e "require('./server/services/aws').getPool().execute('SELECT 1').then(...)"` succeeds against the compose MySQL.

> **Optional Test Step** — suggested file `projects/project02/server/tests/integration/breaker_lifecycle.test.js`
>
> A circuit breaker is a stateful artifact whose value lives in its *transitions* (closed → open → half-open → closed). Asserting only that the breaker exists is like asserting a database exists without ever inserting a row. A focused integration test against a fake S3 client that fails N times forces the open transition, waits the reset timeout, allows a fake success, and asserts the closed transition.
>
> - **What to lock down**: (1) breaker stays closed under `errorThresholdPercentage`, (2) opens at threshold + bounded timeout, (3) fails fast (rejects without invoking the underlying client) while open, (4) transitions to half-open after `resetTimeout`, (5) closes on a successful half-open call. Use a programmable fake S3 (`aws-sdk-client-mock`) so all five transitions land in <2s of test time.
> - **Why this catches bugs**: the *only* signal that breakers are correctly configured is observing them trip in production — too late, expensive, and only one team member sees it. This test is the cheapest possible substitute and the only one that will catch a misconfigured `errorThresholdPercentage: 100` (effectively disabled) before it hits real AWS.
> - **Decision branches**: build now (recommended — breakers are introduced *in this phase*; testing them later means re-loading the breaker config into your head), queue (defer to workstream 04 if you're not yet sure breakers are pulling their weight; risky), skip (only if you're committing to "we'll see if breakers help in prod" — not engineering-grade).

---

## Phase 8: Envelope Helpers (consume from library)

> **The library `@mbai460/photoapp-server` already exports** `schemas.envelopes.successResponse({...extras})` (variadic — produced by Phase −1's split of Part 03's `schemas.js`) and `schemas.envelopes.errorResponse(message, extras?)`. The variadic shape was a deliberate Phase −1 design choice (not an "adaptation" Project 02 has to invent) so a single helper satisfies Part 03's `{message, data}` and Project 02's per-route shapes from the same code path.
>
> **This phase has nothing to write.** It exists in the workstream sequence as a *checkpoint*: confirm the library helpers do what the upcoming routes need; if they don't, surface the gap and do a bounded library change before workstream 02 starts (CL9 forbids in-flight ad-hoc library mods). The corresponding row converters (`userRowToObject`, `imageRowToObject`, `labelRowToObject`, `searchRowToObject`, `deriveKind`) live in `lib/photoapp-server/src/schemas/rows.js` and are also consumed unchanged.

> **Documentation touchpoint:** none — Phase −1 already documents the library's schema exports in `lib/photoapp-server/README.md`.

### Task 8.1: Verify library envelope helpers satisfy Project 02 spec shapes

**Files:**

- Read-only verification: `lib/photoapp-server/src/schemas/envelopes.js` — confirm `successResponse({...extras})` and `errorResponse(message, extras?)` match the variadic spec used in Project 02 routes.
- Create: `projects/project02/server/tests/unit/envelopes_spec_shapes.test.js` — surface-specific acceptance tests that assert the library helpers produce the exact spec-required envelope for each Project 02 route family (ping `{message, M, N}`, upload `{message, assetid}`, list `{message, data}`, download `{message, userid, local_filename, data}`, error `{message, ...specErrorExtras}`).

**Behavior:**

- [x] (existing — library) `successResponse({...extras})` returns `{ message: 'success', ...extras }` (variadic merge by Phase −1 design). Part 03 callsites pass `{ data }`; Project 02 callsites pass `{ M, N }` / `{ assetid }` / `{ data }` / `{ userid, local_filename, data }`.
- [x] (existing — library) `errorResponse(message, extras = {})` returns `{ message, ...extras }`. Spec contract uses the error message in the `message` field directly (e.g., `{ message: 'no such userid', assetid: -1 }`).
- [ ] If the library's helpers do not match the spec shapes, **stop** and open a bounded library change request (CL9). Do not adapt envelope helpers from Project 02's tree.

**Checklist:**

- [ ] Spec-shape acceptance tests pass against the library's exported helpers for ping, users, images list, upload, download, error envelopes.
- [ ] No source under `projects/project02/server/schemas/envelopes*` (envelopes are library-owned).

---

## Phase 9: OpenAPI 3.1 Stub

### Task 9.1: Author `api/openapi.yaml` covering the spec routes

**Files:**

- Create: `api/openapi.yaml`

**Checklist:**

- [ ] Document every spec-compliant route: `GET /` (uptime), `GET /v1/ping`, `GET /v1/users`, `GET /v1/images` (with optional `userid` query), `POST /v1/image/{userid}`, `GET /v1/image/{assetid}`, `GET /v1/image_labels/{assetid}`, `GET /v1/images_with_label/{label}`, `DELETE /v1/images`. (Note: spec routes are documented under `/v1` in our local schema; the route mount aliases `/` → `/v1` for the Gradescope autograder via `app.use('/', v1Router)` when `STRIP_V1_PREFIX=1`. See Task 9.2 for the alias toggle.)
- [ ] Reusable schema components: `SuccessEnvelope`, `ErrorEnvelope`, `PingResponse`, `UserList`, `ImageList`, `ImageUploadResponse`, `ImageDownloadResponse`, `LabelList`, `SearchResultList`.
- [ ] Each response documents its 200 + 400 + 500 shapes (and 404 for v2 once that workstream lands).
- [ ] `info.version: 0.1.0`.

### Task 9.2: Gradescope-compatible mount alias

**Files:**

- Modify: `server/app.js`

**Behavior:**

- The Gradescope autograder hits `GET /ping`, `GET /users`, etc. — no `/v1` prefix. Our internal contract documents them under `/v1/*`.
- When `STRIP_V1_PREFIX=1` (default in production submission build), `app.js` mounts the v1 router at both `/v1` and `/`. The duplicate mount is acceptable because both routes go through the same middleware chain.

**Checklist:**

- [ ] Failing supertest asserts that with `STRIP_V1_PREFIX=1`, `GET /ping` returns the same body as `GET /v1/ping` (route is wired in workstream 02; here we wire a placeholder at `/v1/__alias_test`).
- [ ] Implement; test green.

### Task 9.3: Contract test suite skeleton

**Files:**

- Create: `server/tests/contract/openapi_conformance.test.js`

**Behavior:**

- Loads `api/openapi.yaml` via `js-yaml`.
- Uses `chai-openapi-response-validator` to assert each route's response conforms.
- Skips routes that aren't implemented yet (`test.skip`); workstream 02 unskips them as routes land.

**Checklist:**

- [ ] Failing test on the placeholder `__alias_test` route (asserts conformance).
- [ ] Implement; test green.

> **Optional Utility Step** — suggested artifact `utils/openapi-routes-diff` (Node script) or `make openapi-check`
>
> The OpenAPI spec and the actual mounted routes are two sources of truth that *must* agree. Right now they will, because you're authoring both. In a month, someone adds `routes/v1/foo.js` and forgets the `openapi.yaml` entry. A script that walks the Express router stack and diffs against the spec catches the drift the same day it's introduced.
>
> - **What it does**: imports `app.js`, traverses `app._router.stack` to enumerate `(method, path)` pairs, parses `openapi.yaml` to enumerate the spec's `(method, path)` pairs, prints any one-sided differences. Exits non-zero if there are any. Pre-commit / CI candidate.
> - **Why now**: Phase 9 just authored the OpenAPI stub; the diff is empty *right now*; that's the moment to lock it. Locking it post-hoc means triaging dozens of differences from accumulated drift.
> - **Decision branches**: build now (recommended — costs ~50 lines, defends a class of contract bugs), queue (defer to workstream 02 once routes land — at that point the diff actively matters; before that, it's a tautology), skip (rely on `chai-openapi-response-validator` running per route — *partly* sufficient, but doesn't catch routes that exist in code but not in spec, only the reverse).

> **Optional Test Step** — suggested file `projects/project02/server/tests/contract/openapi_internal_consistency.test.js`
>
> Beyond "does the spec match the routes?" there's "does the spec make sense at all?" — every `$ref` resolves, every response schema is reachable, no orphan components. A 5-line test that loads `openapi.yaml` through `swagger-parser` and runs `validate()` catches authoring bugs before contract tests do.
>
> - **What to lock down**: `swagger-parser.validate('api/openapi.yaml')` resolves without error (it does both syntactic and semantic validation: `$ref` resolution, JSON Schema validity per response).
> - **Why this catches bugs**: a `$ref: '#/components/schemas/UserResposne'` (typo) would manifest as a confusing chai-openapi-response-validator error per route; this test points at the typo directly.
> - **Decision branches**: build now (recommended — 3 lines), queue, skip.

---

## Phase 10: docker-compose + LocalStack

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-local-dev-topology-v1.md`
>
> Before authoring `docker-compose.yml`, render a `flowchart LR` of the **local dev topology** so collaborators see what `make up` brings online.
>
> - **Story**: "Four services on one Docker network: server hits MySQL on 3306 and LocalStack on 4566; Python client hits server on 8080."
> - **Focus**: highlight the **`AWS_ENDPOINT_URL=http://localstack:4566`** wire in **red** — that's the seam between dev (LocalStack) and prod (real AWS); a wrong env there means tests pass locally but break against AWS. Highlight the **schema-bootstrap mount** (`infra/migrations/` → `/docker-entrypoint-initdb.d/`) in **amber**.
> - **Shape vocab**: rounded rect = container/service; cylinder `[(...)]` = MySQL; cloud-style subgraph = LocalStack (S3 + IAM); subgraph = Docker network; stadium `([...])` = exposed port.
> - **Brevity**: container name + port only.
> - **Direction**: `flowchart LR` — client on the left, AWS-mock services on the right.

### Task 10.1: Author `docker-compose.yml`

**Files:**

- Create: `docker-compose.yml`

**Services:**

- `mysql`: `mysql:8.4`, env-driven root password, mounts `infra/migrations/` to `/docker-entrypoint-initdb.d/`, exposes `3306`, healthcheck via `mysqladmin ping`.
- `localstack`: `localstack/localstack:3`, services `s3,iam`, exposes `4566`, `AWS_ACCESS_KEY_ID=test`, `AWS_SECRET_ACCESS_KEY=test`, healthcheck on `/_localstack/health`.
- `server`: builds from `server/Dockerfile`, depends on `mysql` + `localstack` healthchecks, env: `AWS_ENDPOINT_URL=http://localstack:4566`, `LOG_LEVEL=debug`, mounts `server/` for hot reload.
- `client`: builds from `client/Dockerfile` (provided assignment image; reused), depends on `server`, mounts `client/`.

**Checklist:**

- [ ] `docker compose config` validates.
- [ ] `make up` brings every service to healthy.
- [ ] `make down` removes containers and volumes.

### Task 10.2: Bootstrap LocalStack S3 bucket

**Files:**

- Create: `tools/bootstrap-localstack.sh`
- Modify: `docker-compose.yml` to run the script on startup.

**Behavior:**

- Creates the bucket named in `server/photoapp-config.ini` (read at runtime).
- Creates the IAM role used by the application code.
- Idempotent.

**Checklist:**

- [ ] Failing test in `server/tests/integration/health.test.js` asserts `/readyz` returns 200 against compose.
- [ ] Implement bootstrap; `make up && curl localhost:8080/readyz` returns 200.

---

## Phase 11: Test Pyramid Harness

> **Service-layer unit tests already live in `lib/photoapp-server/tests/`** (from Phase −1: `services/`, `repositories/`, `middleware/`, `schemas/` test trees, run via `cd lib/photoapp-server && npm test`). Project 02 does **not** duplicate them — the library's tests run once and cover both surfaces. This phase scaffolds the **surface-specific** layers in `projects/project02/server/tests/`: `integration/` (LocalStack + ephemeral MySQL hitting Project 02's wired-up `app.js`), `contract/` (OpenAPI conformance), `smoke/` (post-`make up` probe), `happy_path/` (end-to-end through compose), `live/` (gated by `PHOTOAPP_RUN_LIVE_TESTS=1`). The Jest multi-project config makes each layer runnable independently.

> **Documentation touchpoint:** `projects/project02/server/README.md` adds a "Test layers" subsection naming each layer + the command to run it.

> **Optional Mermaid Visualization Step** — suggested file `visualizations/Target-State-project02-test-pyramid-v1.md`
>
> Before splitting Jest into projects, render a `flowchart TD` of the **six-layer test pyramid** with a column showing **what each layer mocks**.
>
> - **Story**: "Each layer trades fidelity for speed. Unit mocks everything. Live mocks nothing."
> - **Focus**: highlight the **contract layer** (OpenAPI conformance) in **red** — that's the *locking* layer that catches drift between the spec and the implementation regardless of which mock level is in play. Highlight the **live gate** (`PHOTOAPP_RUN_LIVE_TESTS=1`) in **amber**.
> - **Shape vocab**: stadium `([...])` = test layer; rounded `(...)` = subject under test; cylinder `[(...)]` = real or mocked dep; hexagon `{{...}}` = gating env var; subgraph = layer.
> - **Brevity**: layer name + ≤ 3 words on what it mocks.
> - **Direction**: `flowchart TD` so the pyramid reads top → bottom (broad → narrow).

### Task 11.1: Jest projects configuration for the six test layers

**Files:**

- Modify: `server/jest.config.js`

**Configuration:**

```js
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
    },
    {
      displayName: 'contract',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/contract/**/*.test.js'],
    },
    {
      displayName: 'smoke',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/smoke/**/*.test.js'],
    },
    {
      displayName: 'happy',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/happy_path/**/*.test.js'],
    },
    {
      displayName: 'live',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/live/**/*.test.js'],
      globalSetup: '<rootDir>/tests/live/setup.js',
    },
  ],
};
```

**Checklist:**

- [ ] `npm run test:unit` runs only the unit project.
- [ ] `npm run test:integration` runs only the integration project (requires compose up).
- [ ] `npm run test:live` is gated: `tests/live/setup.js` exits `process.exit(0)` after printing a skip message when `PHOTOAPP_RUN_LIVE_TESTS !== '1'`.

### Task 11.2: Smoke harness

**Files:**

- Create: `server/tests/smoke/smoke.test.js`
- Create: `tools/smoke.sh`

**Behavior:**

- `tools/smoke.sh` accepts `BASE_URL` and runs supertest-equivalent checks against a live (compose or deployed) instance.
- Tests exercised: `GET /healthz`, `GET /readyz`, `GET /v1/ping`, `GET /v1/users`. Routes not yet implemented are `test.skip` until workstream 02 lands.

**Checklist:**

- [ ] `BASE_URL=http://localhost:8080 ./tools/smoke.sh` succeeds with `make up`.

### Task 11.3: Happy-path E2E skeleton

**Files:**

- Create: `server/tests/happy_path/upload_lifecycle.test.js`

**Behavior:**

- End-to-end flow: ping → list users → upload an image → list images → fetch labels → search → delete.
- All routes start as `test.skip` and are unskipped per route in workstream 02 as they land.
- Uses `make up` LocalStack + MySQL.

**Checklist:**

- [ ] Skeleton authored; all tests skipped initially.
- [ ] CI integration deferred to Future State.

### Task 11.4: Live regression harness

**Files:**

- Create: `server/tests/live/upload_lifecycle.test.js`
- Create: `server/tests/live/setup.js`

**Behavior:**

- Same shape as happy-path but against real AWS (requires `PHOTOAPP_RUN_LIVE_TESTS=1` and a configured `photoapp-config.ini`).
- Cleans up after itself: deletes any test rows / S3 objects with the agreed `live-test-` prefix.

**Checklist:**

- [ ] Setup file confirms env var is set; otherwise prints a clear skip message and exits.
- [ ] Skeleton authored; expanded as routes land.

### Task 11.5: Python client harness

**Files:**

- Create: `client/tests/conftest.py`
- Create: `client/tests/unit/test_envelopes.py`
- Create: `client/tests/integration/test_against_compose.py`
- Create: `client/tests/live/test_against_real.py`

**Behavior:**

- Unit: uses `responses` to mock the web service.
- Integration: hits `make up` web service.
- Live: gated on `PHOTOAPP_RUN_LIVE_TESTS=1`.
- Markers: `@pytest.mark.live` skips by default.

**Checklist:**

- [ ] `pytest` runs; reports the number of tests in each layer.
- [ ] `pytest -m "not live"` excludes live tests.

**Check your work:**

- Unit + integration + contract + smoke + happy + live: each layer reports zero or more passing tests, no failures.

> **Optional Utility Step** — suggested artifact `make test-layer LAYER=<name>` (Makefile target) or `tools/run-test-layer`
>
> Six test layers means six different invocations to remember. Wrapping `jest --selectProjects=<layer>` (and the pytest equivalent) into a single Makefile target collapses six commands into one parametric one. Future selves grepping shell history will thank you.
>
> - **What it does**: `make test-layer LAYER=integration` runs the integration project; `LAYER=live PHOTOAPP_RUN_LIVE_TESTS=1` runs the gated live layer; `LAYER=all` runs everything. Underlying call is `jest --selectProjects=$(LAYER)` for Node + `pytest -m $(LAYER)` for Python.
> - **Why now**: the moment six layers exist is the moment the wrapper earns its keep. Earlier, there's nothing to parameterize; later, you've already memorized the verbose forms.
> - **Decision branches**: build now (recommended — Phase 11 *creates* the layers, so wrap them now), queue (defer to workstream 02 if you'd rather author it once you have a richer test set to validate against), skip (your shell history alias is fine — but only-you knowledge).

> **Optional Utility Step** — suggested artifact `tools/wait-for` (Bash, ≤ 30 lines) or use upstream `wait-for-it.sh`
>
> docker-compose health probes (Phase 10) plus integration tests against compose-managed deps (this phase) need a "wait until MySQL is actually ready" step that's more robust than `sleep 5`. `wait-for` is a 30-line ubiquity that every dev shop ends up with.
>
> - **What it does**: polls a `host:port` (or curl URL) until success or timeout, with optional `--interval` + `--timeout` knobs. Exits 0 on success, non-zero on timeout.
> - **Why now**: integration + happy-path + smoke layers all benefit; `make up && make test-integration` becomes `make up && tools/wait-for mysql:3306 && make test-integration` and stops being flaky.
> - **Decision branches**: build now (recommended — or vendor `wait-for-it.sh` from upstream — 30 seconds either way), queue, skip (only if compose's healthcheck-based `depends_on: condition: service_healthy` covers your needs entirely; often partly true, partly not).

---

## Phase 12: Terraform Module Refactor

> **The shared backbone Terraform tree at `MBAi460-Group1/infra/terraform/` already exists** and is applied: it provisions the S3 bucket, RDS MySQL 8 instance (`db.t3.micro`, public, IAM auth on), `photoapp-rds-sg` security group, IAM users `s3readonly` + `s3readwrite` with custom + managed policies, test-image objects, and outputs the access keys. Project 02 does **not** rebuild this — it **refactors** the existing flat `main.tf` into reusable modules under `projects/project02/infra/modules/` while preserving the running state (`terraform state mv`).

> **Optional Mermaid Visualization Step (strongly recommended — IAM is involved)** — suggested file `visualizations/Target-State-project02-terraform-state-mv-v1.md`
>
> **Before** running any `terraform state mv`, render a `flowchart LR` of the **before/after resource layout** plus the explicit `state mv` command per resource.
>
> - **Story**: "Same resources, new addresses. Each `state mv` row is one resource hopping from a flat path to a module path. No destroy, no recreate."
> - **Focus**: highlight the **IAM resources** (`s3readonly` user, `s3readwrite` user, custom policy templated from `s3-read-write-policy.json.txt`, access keys) in **red** — these are the highest-risk to mismove because they include sensitive outputs. Highlight the **policy file path** (referenced by `templatefile()`) in **amber** since that path must remain valid through the refactor.
> - **Shape vocab**: rounded rect = TF resource; subgraph = module (`rds`, `s3`, `iam`, `cloudwatch`); cylinder `[(...)]` = `terraform.tfstate`; arrow labels = exact `state mv` command (truncated for the diagram, full in `refactor-log.md`).
> - **Brevity**: resource type + name only (`aws_iam_user.s3readwrite`).
> - **Direction**: `flowchart LR`, with the flat `infra/terraform/` layout on the left and the modular `projects/project02/infra/` layout on the right.
>
> **Critical:** This phase is **non-destructive**. No `terraform destroy`. No resource recreation. The cutover happens by `terraform state mv` from the old flat layout to the new modular layout. If state mv is risky, the alternative is to keep `infra/terraform/main.tf` as the dev env and create `projects/project02/infra/envs/prod/` as the *new* (currently empty) prod env — that's what `D10` (forward-only Terraform) intends.

### Task 12.0: Inventory existing state

- [x] (existing) `MBAi460-Group1/infra/terraform/main.tf` — applied; resources present in state.
- [x] (existing) `MBAi460-Group1/infra/terraform/variables.tf`, `outputs.tf`, `terraform.tfvars.example`.
- [x] (existing) `MBAi460-Group1/infra/terraform/terraform.tfstate` — local state file (remote state is on the `infra/MetaFiles/TODO.md` queue).
- [ ] Run `terraform -chdir=MBAi460-Group1/infra/terraform state list` and capture the output in `projects/project02/client/MetaFiles/refactor-log.md` as the pre-refactor baseline.

### Task 12.1: Extract `modules/rds`, `modules/s3`, `modules/iam`, `modules/cloudwatch`

**Files:**

- Create: `projects/project02/infra/modules/rds/{main.tf,variables.tf,outputs.tf,README.md}` — extract `aws_db_instance.photoapp` + `aws_security_group.rds_public` from existing flat `main.tf`.
- Create: `projects/project02/infra/modules/s3/{main.tf,variables.tf,outputs.tf,README.md}` — extract `aws_s3_bucket.photoapp` + ownership / public access / ACL + `aws_s3_object.test_images`.
- Create: `projects/project02/infra/modules/iam/{main.tf,variables.tf,outputs.tf,README.md}` — extract `s3readonly`, `s3readwrite` users + policies + access keys.
- Create: `projects/project02/infra/modules/cloudwatch/{main.tf,variables.tf,outputs.tf,README.md}` — **new** (workstream 04 fills in: log groups, alarms, dashboards).

**Behavior:**

- Modules describe the resources without changing them. Each module's `README.md` documents inputs / outputs.
- `tags` variable is required on every module; default `{}`; merged into every taggable resource. Standard tag set from `MetaFiles/TODO.md` aspiration: `Owner`, `Project`, `Env`, `AgentSafe`.
- `modules/iam` references the existing policy file at `projects/project01/s3-read-write-policy.json.txt` via `templatefile()`; do **not** move the policy file (it's referenced from the running state).

**Checklist:**

- [ ] `terraform fmt -check -recursive projects/project02/infra/` exits 0.
- [ ] `terraform validate` from `projects/project02/infra/envs/dev/` exits 0.
- [ ] Each module's `README.md` lists inputs, outputs, and example usage.

### Task 12.2: `envs/dev/` and `envs/prod/`

**Files:**

- Create: `projects/project02/infra/envs/dev/main.tf` — composes the four modules; matches the resource set currently in `infra/terraform/`.
- Create: `projects/project02/infra/envs/dev/backend.tf` — placeholder for remote state (see `infra/MetaFiles/TODO.md` "remote state" item).
- Create: `projects/project02/infra/envs/dev/terraform.tfvars.example` — same vars as the existing example.
- Create: `projects/project02/infra/envs/prod/{main.tf,backend.tf,terraform.tfvars.example}` — **mirror of dev**, intentionally empty until Part 02 (EB env) lands.

**Checklist:**

- [ ] `dev` env composes the four modules; resource graph is **identical** to the current flat layout (verified by `terraform plan` showing zero changes after a state-aware migration).
- [ ] `backend.tf` declares a remote backend stanza but is **commented out** until the `infra/MetaFiles/TODO.md` "remote state (S3 + DynamoDB lock)" item lands. A note in the file explains this.
- [ ] `terraform plan -var-file=terraform.tfvars.example` from `envs/dev/` succeeds and reports zero changes against the existing state.

### Task 12.3: State migration (forward-only)

> **Skip this task** if the team chooses the safer alternative (D10 forward-only): leave `infra/terraform/` as the dev env and only build the new modular `envs/prod/` for the EB cutover in Part 02. Document the choice in `refactor-log.md`.

**If migrating:**

- [ ] Run `terraform plan` on the new modular layout and confirm it reports the *same* resources as the current state (zero diff).
- [ ] For each resource, run `terraform state mv 'aws_db_instance.photoapp' 'module.rds.aws_db_instance.photoapp'` (and similar) — capture the full sequence of `state mv` commands in `refactor-log.md`.
- [ ] Re-run `terraform plan` — should now report zero changes against the modular layout.
- [ ] Run `utils/smoke-test-aws --mode live` to confirm no operational regression.
- [ ] Run `utils/aws-inventory` and confirm every resource is still tagged `[TF]` (not `[MANUAL]`).

**Check your work:**

- Smoke: `cd projects/project02/infra/envs/dev && terraform init -backend=false && terraform validate` exits 0.
- Smoke: `utils/smoke-test-aws --mode live` shows all 10 checks passing after the refactor.

---

## Phase 13: Submission Tooling

### Task 13.1: Submission allowlist + packager

**Files:**

- Create: `tools/submission-allowlist.txt`
- Create: `tools/package-submission.sh`
- Create: `server/tests/unit/submission_allowlist.test.js`

**Allowlist contents (server submission):**

```text
server/app.js
server/server.js
server/config.js
server/photoapp-config.ini
server/services/aws.js                  # required by the layered route handlers
server/services/photoapp.js
server/middleware/error.js
server/middleware/logging.js
server/middleware/request_id.js
server/middleware/validate.js
server/schemas/envelopes.js
server/schemas/rows.js
server/schemas/request_schemas.js
server/observability/pino.js
server/repositories/users.js
server/repositories/assets.js
server/repositories/labels.js
server/routes/v1/index.js
server/routes/v1/ping.js
server/routes/v1/users.js
server/routes/v1/images.js
server/routes/v1/image.js
server/routes/v1/image_labels.js
server/routes/v1/images_with_label.js
server/routes/v1/delete_images.js
# Optional thin shim layer (see "Note on legacy filenames" below):
server/api_get_ping.js
server/api_get_users.js
server/api_get_images.js
server/api_post_image.js
server/api_get_image.js
server/api_get_image_labels.js
server/api_get_images_with_label.js
server/api_delete_images.js
server/package.json
server/package-lock.json
```

**Note on legacy filenames:** The Gradescope autograder grades `server/*.js + *.ini` by **uploading the bundle and running it as an Express app via `app.js`**. As long as `app.js` mounts the spec-compliant routes correctly, the autograder doesn't care about file structure under `routes/v1/`. The optional `server/api_*.js` shim files are a **backwards-compatibility bridge** for graders that scan for those filenames specifically; if the autograder doesn't enforce the file layout (most don't), the shims can be omitted.

Recommended: ship the layered structure without shims first; if the autograder fails on a missing-file check, add the shims as one-liners (`module.exports = require('./routes/v1/<route>')`).

**`tools/package-submission.sh`:**

- Reads the allowlist for the chosen target (`server` or `client`).
- Builds a tarball under `dist/submission-{server,client}-<timestamp>.tgz`.
- Optionally runs `gs submit 1288073 8052758 *.js *.ini` (server) or `gs submit 1288073 8052765 *.js *.ini photoapp.py` (client) when invoked with `--submit`.

**Checklist:**

- [ ] Failing test asserts the allowlist contains every Gradescope-required filename for both submissions.
- [ ] Implement; test green.
- [ ] `make submit-server` produces a tarball; manual `gs submit` works from the server image.

---

## Phase 14: Foundation Acceptance

### Task 14.1: Full local verification

**Checklist:**

- [ ] `make up` brings server + mysql + localstack to healthy.
- [ ] `make test` runs every layer with zero failures (zero passing tests is acceptable for routes; harness tests pass).
- [ ] `curl http://localhost:8080/healthz` → 200.
- [ ] `curl http://localhost:8080/readyz` → 200.
- [ ] `curl http://localhost:8080/__alias_test` (placeholder) → 200 (proof of `/` ↔ `/v1` mount alias).
- [ ] `make lint` exits 0 across JS + Python + Terraform (`tflint`).
- [ ] `make submit-server` produces a valid tarball.
- [ ] Pre-commit hook fires on a no-op commit; rejects a non-conventional message.
- [ ] `terraform fmt -check -recursive projects/project02/infra/` exits 0.
- [ ] `terraform -chdir=projects/project02/infra/envs/dev validate -no-color` exits 0.
- [ ] `terraform -chdir=projects/project02/infra/envs/dev plan -var-file=terraform.tfvars` shows zero changes (state-aware refactor) **OR** `terraform -chdir=MBAi460-Group1/infra/terraform plan` still shows zero changes if you took the safer path of leaving the existing tree untouched.
- [ ] `utils/smoke-test-aws --mode live` passes all 10 checks (no operational regression after the Terraform refactor).
- [ ] `utils/validate-db` passes all 26 checks.
- [ ] `utils/cred-sweep` exits 0 against the staged tree.
- [ ] `pino` log lines on every request carry `req_id` and never include credentials.
- [ ] No `console.log` in committed source (ESLint `no-console` rule blocks it).

## Suggested Commit Points

- After Phase 0: `feat(server): bootstrap project02 as @mbai460/photoapp-server consumer (workspace + smoke)`.
- After Phase 1: `chore(foundation): pin tooling, lint/format, makefile, gitignore`.
- After Phase 2: `feat(server): expand app.js to production shape (mount order, error DI, graceful shutdown)`.
- After Phase 3: `feat(observability): pino + request_id middleware`.
- After Phase 4: `feat(server): healthz + readyz endpoints`.
- After Phase 5: `feat(server): AppError hierarchy + mount-prefix-aware error mapping (consumed via library factory)`.
- After Phase 6: `feat(server): zod validation middleware`.
- After Phase 7: `refactor(server): replace per-request mysql connection with createPool; add opossum breakers`.
- After Phase 8: `test(server): verify library envelope helpers satisfy project02 spec shapes`.
- After Phase 9: `feat(api): openapi 3.1 stub + contract harness`.
- After Phase 10: `feat(infra): docker-compose with mysql + localstack`.
- After Phase 11: `feat(tests): six-layer pyramid harness for project02 surface (service-layer tests live in @mbai460/photoapp-server)`.
- After Phase 12: `refactor(infra): extract project02 terraform modules from existing flat layout (state-mv preserves resources)`.
- After Phase 13: `feat(tools): submission allowlist + packager`.
- After Phase 14: `chore(foundation): part 02 part 01 foundation acceptance green`.

## Risks And Mitigations

- **Risk:** ESLint `no-console` rule rejects useful early-boot logs in `server.js` before `pino` is ready.
  - **Mitigation:** allow `console.warn` / `console.error`; only `console.log` is banned. The startup flow uses `pino` from line 1.
- **Risk:** LocalStack S3 endpoint differs subtly from real S3 (e.g., no Rekognition, ListObjectsV2 KeyCount semantics).
  - **Mitigation:** integration tests exercise both real LocalStack S3 and mocked Rekognition. Live tests cover the real-AWS gap.
- **Risk:** mysql2 pool with `multipleStatements: true` is a footgun for SQL injection.
  - **Mitigation:** the pool is `multipleStatements: true` only because `DELETE /images` requires it (per spec). Every other call uses parameterized `pool.execute(...)`. A lint rule (`no-restricted-syntax`) flags any `pool.query(\`${...}\`)` template-literal SQL outside the delete handler.
- **Risk:** Husky pre-commit hooks slow down commits enough that contributors disable them.
  - **Mitigation:** `lint-staged` runs only on staged files; full `make lint` runs in CI when CI lands.
- **Risk:** The submission tarball includes engineering files (`/v2`, `observability/`, `infra/`) and the autograder rejects.
  - **Mitigation:** allowlist-based packager; unit test asserts the allowlist matches the spec list; the legacy `api_*.js` adapter shim keeps the submission shape.
- **Risk:** Terraform module skeletons drift from the eventual Part 02 apply because they were never planned against a real backend.
  - **Mitigation:** `terraform plan -refresh=false` runs against an empty / mock backend in the test harness; Part 02 will discover the first real-apply gaps and round-trip them back into the modules.
- **Risk:** Two parallel agents touch `package.json` and produce merge conflicts.
  - **Mitigation:** workstream order (`01-foundation` → `02-web-service`) is sequential; engineering surface (`04-engineering-surface`) only adds dev deps.

## Footnote: Foundation Provenance

The shape of this workstream — split `app.js` / `server.js`, layered architecture, `pino` + request id, central error middleware, contract-first OpenAPI — is a direct successor to project01 Part03's `02-server-foundation.md` and `03-api-routes.md`. **In Project 02, that successor relationship is concrete and library-mediated:** Phase −1 (`00-shared-library-extraction.md`) extracts Part 03's service core into `@mbai460/photoapp-server`; Phase 0 here registers Project 02 as a workspace consumer of that library; later phases add what Project 02 needs *outside* the library (`pino`, request id, `pool` factory, `opossum` breakers, `zod` validation, mount-prefix-aware DI for the library's error middleware, six-layer pyramid). The Project 02 specifics (multi-tier deployment, LocalStack, refactored Terraform) extend that pattern without breaking it. **No source code is copy-and-adapted between trees** — the shared library is the single canonical source for services / repositories / middleware / schemas; surfaces own routing, controllers, and configuration.

Both server trees consume one shared library — `@mbai460/photoapp-server`, extracted in Phase −1 (`00-shared-library-extraction.md`). The consolidation that was previously deferred to "future state" is now a precondition; this workstream begins as a library consumer rather than a parallel implementation.

When subsequent workstreams discover gaps in this foundation, they should:

1. Pause the route / feature work.
2. Add the missing scaffold here (`01-foundation.md`) with a corresponding test.
3. Resume the route / feature work against the now-complete foundation.

Drift between this workstream and the route / feature workstreams is the highest-cost mistake we can make; tightening the foundation late is cheap, and routing around a missing primitive is expensive.
