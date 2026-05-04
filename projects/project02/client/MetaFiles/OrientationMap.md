# Orientation Map — Project 02 Part 01

> **For:** Post-compaction orientation + cross-workstream navigation. Read this **first** when resuming after a context break (per `claude-workspace/memory/feedback_refresh_ritual.md` Phase 2 — Map is the structured starting hypothesis to verify, not the ground truth itself).
>
> **Updated atomically** at each substep close-out, never from prediction (per `claude-workspace/memory/feedback_atomic_substep_updates.md`).
>
> **Complements (does not replace)** the Plan: `Approach/Plan.md` is the spec (stable; sequencing + cross-cutting threads + Optional Steps Registry); this Map is execution state (mutable; current Active + Pending + Closed). The Map's Pending section uses Frame-compact rows derived from the Plan's Master Tracker.
>
> **Frame integration (experimental, F3 — 2026-05-01):** the meta-quest Frame lives in `Plan.md`. This Map's *Active* section becomes a full Frame instance when execution opens; *Pending* uses compact Frame rows; the status legend maps Map symbols to Frame `State` semantics. Mining what works at SD-5.
>
> **Compass relationship:** there is **no Compass section in this Map**. The lite Compass (`← Back / ● Now / → Next / ↓ Down / ⬆ Up`, 5-direction since 2026-05-01) is in-chat only, printed at the end of in-conversation responses during active execution, and is derived on-the-fly from this Map's Active section + current Frame nesting. The Map is the authoritative durable state; the Compass is its ephemeral conversational echo. Compaction loses the Compass (convenience), not the Map (authority).
>
> **Lifecycle:** This Map is grounded in the current Project 02 Part 01 quest. When the quest closes, archival is guided per the prior pattern (Part 03's OrientationMap precedent).
>
> **Last updated:** 2026-05-04 — Sub-phases 1.1 ✅ + 1.2 ✅ + 1.10 ✅ + 1.12 ✅ close out Phase 1 (Foundation). `docker-compose.yml` (mysql:8.4 + localstack:3 + server); `infra/migrations/01-schema.sql`; `tools/bootstrap-localstack.sh`; `client/photoapp-config.ini.example`; `server/routes/_internal/readyz.js` (/readyz probes pool + S3); Terraform modules (rds/s3/iam/cloudwatch) + envs (dev/prod); `make up`/`make down` wired; `server.js` graceful shutdown calls `closePool()`; D10: no `terraform apply` / no `state mv` in Part 01. All 60 unit tests + 1 contract + lint green. **Phase 1 (Foundation) complete.** Next: Phase 2 (Web Service — Gradescope 60/60) on `feat/p02-foundation`.

---

## Frame Position (where this Map sits)

```
- Back:  Phase 0 (Library Extraction) ✅ merged to main with tag
         library-1.0.0-extraction-complete (Erik landed it; 156 commits fast-forwarded
         from origin on this clone 2026-05-04).
- Now:   Phase 1 (Foundation) ✅ complete on feat/p02-foundation. All 12 sub-phases
         done. Commit chain to be pushed; then Phase 2 (Web Service) opens on
         feat/p02-web-service.
- Next:  Phase 2 — Web Service (Gradescope 60/60): /v1 router, all spec routes,
         integration tests per route, happy-path E2E green.
- Down:  Phase 2 sub-phases per Approach/02-web-service.md
- Up:    Lab session arc
```

---

## Status legend

Map status symbols mapped to Frame `State` semantics (per `Approach/Proposed_Execution_Frame_Template.md` style equivalents in `claude-workspace/recommendations/`):

| Symbol | Map meaning | Frame `State` equivalent |
|---|---|---|
| ⏳ | Queued / planned — not yet started | `Planned` |
| 🔄 | In progress — actively being worked by this agent | `In Progress` |
| 🟡 | In-flight async — work is happening but outside this agent's direct execution (collaborators, Erik handles outside, async humans, background processes) | `In Progress` (external) |
| ✅ | Complete — work confirmed via file evidence + commit | `Verified` → `Complete` |
| 🚩 | Blocked / flagged for attention (also continuity-discrepancy flags per `feedback_flag_emoji.md`) | `Blocked` |
| ⚠️ | Executed pre-approval — reverification required at next resumption | (anti-pattern flag; pre-ritual action) |

---

## Active

### Phase 1 — Foundation ✅ Complete

```
Purpose: Stand up Project 02's server tree as a consumer of @mbai460/photoapp-server;
         add Project 02-specific scaffolding (pino, pino-http, request_id, validate,
         opossum breakers, mysql pool, OpenAPI stub, AppError hierarchy, full test
         pyramid harness, Terraform module refactor, docker-compose, ESLint/Prettier).
Position:
  Back: Phase 0 ✅ merged to main with library-1.0.0-extraction-complete tag
  Now:  Sub-phase 1.0 (Approach Phase 0 — Consume Library & Extend); workspace
        consumer wiring + smoke-boot
  Next: Sub-phase 1.1 (Approach Phase 1 — Repo Skeleton & Tooling Bootstrap)
  Down: Sub-phase 1.0 internals — package.json + jest.config.js + .eslintrc +
        .prettierrc + smoke app.js/server.js (prove library symlink) + README
        touchpoints (CL11)
  Up:   Project 02 Part 01 quest
State: ✅ Complete
Branch: feat/p02-foundation (off main; Erik's directive: push after each sub-phase)
Dependency: Phase 0 ✅
Acceptance: 01-foundation.md § Phase 12 — make up healthy + test pyramid harness in
            place + Terraform refactor non-destructive + lint clean
Approach pointer: Approach/01-foundation.md (Phases 0–13 enumerate sub-phases 1.0–1.12)
Verification (sub-phase 1.0):
- cd MBAi460-Group1 && npm install (clean) succeeds
- cd projects/project02/server && node -e "require('@mbai460/photoapp-server')" exits 0
- smoke /__bootcheck round-trips successfully (then route deleted)
- Part 03 tests stay green (npm test from Part 03)
- No source copied from Part 03 into projects/project02/server/
Pre-existing assignment-template files (api_*.js, app.js, config.js, helper.js) at
projects/project02/server/ are Project 02 starter code — preserve via move to
_assignment-template/ before fresh consumer wiring lands.
```

**Sub-phase progress (sub-phase 1.0 = Approach Phase 0):**

- [x] 1.0.1 — Verify shared library + backbone ✅ 2026-05-04 (preconditions all checked off in Approach doc; library 1.0.0 + workspace topology + CONTRIBUTING + DOC-FRESHNESS protocol all live on `main`)
- [x] 1.0.2 — Bootstrap Project 02 as workspace consumer ✅ 2026-05-04 (assignment-template starter moved under `_assignment-template/` to preserve wire-contract reference; new `package.json` + `jest.config.js` + `.eslintrc.cjs` + `.prettierrc` written; `npm install` from root resolves `@mbai460/photoapp-server` via hoisted root symlink; `node -e "require('@mbai460/photoapp-server')"` returns the documented 5-key exports map)
- [x] 1.0.3 — Construct smoke app.js + server.js ✅ 2026-05-04 (`/__bootcheck` round-trip on PORT=18080 returns `{"message":"success","data":{"ok":true}}`; library currently uses Part 03's `{message, data}` envelope shape — Project 02's variadic promotion is queued for Approach Phase 8 / Plan sub-phase 1.8; smoke route deleted post-verification)
- [x] 1.0.4 — Reuse shared infrastructure references ✅ 2026-05-04 (server `README.md` documents shared `photoapp-config.ini` path at `projects/project01/client/photoapp-config.ini` + canonical ops-tools table; `utils/validate-db` and `utils/smoke-test-aws --mode live` deferred — lab spun-down per `Plan.md` § Phase 0.6 deferred items pattern; non-blocking)
- [x] 1.0.5 — Acceptance for sub-phase 1.0 ✅ 2026-05-04 (`npm install` clean; `node -e "require(...)"` exits 0; smoke green then route deleted; Part 03 32+2 skipped green; project02-server 2/2 green via `library_resolution.test.js`; no Part 03 source copied; `cred-sweep` reports zero new patterns vs `main`)
- [x] 1.0.6 — Documentation touchpoint (CL11) ✅ 2026-05-04 (project02 server `README.md` created; root `README.md` "Repository Structure" already mentions `projects/project02/server` post Phase 0.5; `MetaFiles/QUICKSTART.md` extended with "Working on Project 02" subsection mirroring the Part 03 verify path; project02 client `README.md` deferred to workstream 03 per Approach 0.6 wording)

**Sub-phase 1.5 (= Approach Phase 5 — Error Handling Middleware):**

- [x] 1.5.1 — AppError class hierarchy ✅ 2026-05-04 (`middleware/errors.js`: AppError + BadRequestError + NotFoundError + ConflictError + ServiceUnavailableError; unit tests in `tests/unit/errors.test.js` — 13 tests; instance checks + details round-trips for all 4 subclasses)
- [x] 1.5.2 — error_config.js DI functions ✅ 2026-05-04 (`middleware/error_config.js`: `statusCodeMap(err, req)` mount-prefix-aware (D7: NotFoundError → 400 on /v1, 404 on /v2); `errorShapeFor(err, req)` — uses `req.errorShape` when set by route controllers (workstream 02), falls back to generic error envelope; library `errorResponse(err, extras)` updated with extras spread as CL9 bounded change)
- [x] 1.5.3 — Wire library factory in app.js ✅ 2026-05-04 (`middleware.createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })` replaces inline error terminator stub in `app.js`; table-driven test in `tests/unit/error_middleware.test.js` — 10 tests covering all (AppError subclass × mount prefix) combinations + multer LIMIT_ + unknown-500 + req.errorShape DI)

**Sub-phase 1.6 (= Approach Phase 6 — Validation Middleware):**

- [x] 1.6.1 — validate.js + request_schemas.js skeleton ✅ 2026-05-04 (`middleware/validate.js`: zod-based `validate({body, params, query})` factory; invalid input → BadRequestError with flattened zod issues in `err.details`; `schemas/request_schemas.js` is a placeholder that workstream 02 populates per-route; 5 unit tests — valid body/params/query + invalid + missing-section no-op)

**Sub-phase 1.7 (= Approach Phase 7 — AWS Client Factory Wrapping):**

- [x] 1.7.1 — pool.js ✅ 2026-05-04 (`services/pool.js`: `getPool()` mysql2.createPool singleton (memoised, connectionLimit:5, multipleStatements:true); `closePool()` async idempotent; reads INI via PHOTOAPP_CONFIG_PATH env or canonical path `../project01/client/photoapp-config.ini`; 5 unit tests mocking mysql2/promise + fs — memoisation, closePool idempotency, pool config assertions)
- [x] 1.7.2 — breakers.js ✅ 2026-05-04 (`services/breakers.js`: `getBucketBreaker()` + `getRekognitionBreaker()` opossum wrappers around library AWS clients; timeout:10000, errorThresholdPercentage:50, resetTimeout:30000; state-change events logged at warn via pino; 5 unit tests — instance checks + memoisation + successful fire)

**Sub-phase 1.8 (= Approach Phases 8+9 — Envelope Helpers + OpenAPI 3.1 Stub):**

- [x] 1.8.1 — CL9 library change: variadic successResponse ✅ 2026-05-04 (Phase 8 checkpoint surfaced the gap: `successResponse(data)` didn't support Project 02's per-route shapes; bounded library change: `successResponse({...extras})` spread; Part 03 callsites updated `successResponse(data)` → `successResponse({data})` — 7 occurrences in `routes/photoapp_routes.js`; `errorResponse(err, extras={})` gains optional extras spread; library envelope tests expanded from 3 → 8 tests; wire contract unchanged; lib 104/104 + Part 03 32+2 skipped still green)
- [x] 1.8.2 — Envelope spec shapes test ✅ 2026-05-04 (`tests/unit/envelopes_spec_shapes.test.js`: 9 tests asserting library helpers produce exact spec envelopes for all Project 02 route families: ping `{message,M,N}`, users/images `{message,data:[...]}`, upload `{message,assetid}`, download `{message,userid,local_filename,data}`, error with extras)
- [x] 1.8.3 — api/openapi.yaml Phase 9 stub ✅ 2026-05-04 (OpenAPI 3.1 spec at `projects/project02/api/openapi.yaml`; covers all 8 spec routes: /healthz, /v1/ping, /v1/users, /v1/images, /v1/image/{userid}, /v1/image/{assetid}, /v1/image_labels/{assetid}, /v1/images_with_label/{label}, DELETE /v1/images; reusable component schemas: SuccessEnvelope, ErrorEnvelope, PingResponse, UserListResponse, UploadResponse, DownloadResponse, LabelListResponse, SearchResultResponse, DeleteAllResponse; internal consistency validated via `swagger-parser.validate` — 1 contract test)

**Sub-phase 1.11 (= Approach Phase 11 — Test Pyramid Harness):**

- [x] 1.11.1 — Jest multi-project config ✅ 2026-05-04 (`jest.config.js` updated to 6-project layout: unit / integration / contract / smoke / happy / live; each independently runnable via `npm run test:<layer>`; live layer `globalSetup` logs skip message when `PHOTOAPP_RUN_LIVE_TESTS` is unset)
- [x] 1.11.2 — Smoke skeleton ✅ 2026-05-04 (`tests/smoke/smoke.test.js`: GET /healthz passes; /v1/* routes skipped until workstream 02)
- [x] 1.11.3 — Happy-path skeleton ✅ 2026-05-04 (`tests/happy_path/upload_lifecycle.test.js`: 8 skipped stubs for full lifecycle — ping/users/upload/list/download/labels/search/delete)
- [x] 1.11.4 — Live regression skeleton ✅ 2026-05-04 (`tests/live/upload_lifecycle.test.js` + `setup.js`; gated on PHOTOAPP_RUN_LIVE_TESTS=1; skipped when gate is off)
- [ ] 1.11.5 — Python client harness (conftest.py, tests/unit, tests/integration, tests/live) — DEFERRED to workstream 03 (client API rewrite)

**Sub-phase 1.1 (= Approach Phase 10 — docker-compose + LocalStack):**

- [x] 1.1.1 — docker-compose.yml ✅ 2026-05-04 (mysql:8.4 + localstack:3 + server; MYSQL_USER=photoapp + MYSQL_PASSWORD=photoapp_local; LocalStack services=s3,iam; server depends on mysql/localstack healthchecks; `AWS_ENDPOINT_URL=http://localstack:4566` + `PHOTOAPP_CONFIG_PATH` set; client service commented placeholder; `docker compose config` validates)
- [x] 1.1.2 — infra/migrations/01-schema.sql ✅ 2026-05-04 (combined schema: users+assets+labels tables + seed users; mounted to `/docker-entrypoint-initdb.d/`; uses `CREATE TABLE IF NOT EXISTS` + `INSERT IGNORE` for idempotency; `USE photoapp` targets the MYSQL_DATABASE)
- [x] 1.1.3 — tools/bootstrap-localstack.sh ✅ 2026-05-04 (idempotent bucket create + IAM user create via `aws --endpoint-url`; reads bucket_name from PHOTOAPP_CONFIG_PATH; `--no-sign-request` for LocalStack)
- [x] 1.1.4 — client/photoapp-config.ini.example ✅ 2026-05-04 (compose-specific template; rds.endpoint=mysql, s3readwrite + s3readonly creds = test/test for LocalStack)

**Sub-phase 1.2 (= Approach Phase 1.2 — Terraform Module Skeleton):**

- [x] 1.2.1 — infra/modules/rds ✅ 2026-05-04 (main.tf: aws_security_group + aws_db_instance; variables.tf + outputs.tf; extracted from flat MBAi460-Group1/infra/terraform/main.tf)
- [x] 1.2.2 — infra/modules/s3 ✅ 2026-05-04 (main.tf: bucket + public_access_block + ownership_controls + acl + optional test_image objects; variables.tf + outputs.tf)
- [x] 1.2.3 — infra/modules/iam ✅ 2026-05-04 (main.tf: s3readonly + s3readwrite users + policy + access keys; sensitive outputs)
- [x] 1.2.4 — infra/modules/cloudwatch ✅ 2026-05-04 (main.tf: /server + /access log groups; retention configurable; Phase 4.8 dashboards+alarms deferred)
- [x] 1.2.5 — infra/envs/dev + infra/envs/prod ✅ 2026-05-04 (main.tf calls all 4 modules; variables.tf + outputs.tf; terraform.tfvars.example; remote state S3 backend commented as placeholder until Part 02; D10: no apply in Part 01)

**Sub-phase 1.10 (= Approach Phase 10 — Orchestration + Makefile wiring):**

- [x] 1.10.1 — Makefile `up`/`make down` wired ✅ 2026-05-04 (checks config.ini exists; `docker compose up --build -d`; runs bootstrap-localstack.sh; prints health endpoint URLs; `down` does `docker compose down -v`)
- [x] 1.10.2 — server.js pool shutdown ✅ 2026-05-04 (`closePool()` called in SIGTERM/SIGINT handler callback after `httpServer.close()`)
- [x] 1.10.3 — /readyz route ✅ 2026-05-04 (`server/routes/_internal/readyz.js`: probes mysql pool via `conn.ping()` + S3 via `HeadBucketCommand`; returns 200/ready or 503/unavailable with `{status, checks: {rds, s3}}`; mounted in app.js outside /v1)

**Sub-phase 1.12 (= Approach Phase 1.12 — Terraform state mv):**

- [x] 1.12.1 — D10 forward-only decision documented ✅ 2026-05-04 (no `state mv` in Part 01; flat `MBAi460-Group1/infra/terraform/` remains the applied env; module tree is Part 02 target; `terraform validate` deferred until Terraform installed)

**Total project02-server tests after 1.5–1.11:** 60 passed + 13 skipped ✅ (60 not 64 — corrected count post-readyz integration)

**Sub-phase 1.9 (= Approach Phase 1 — Repo Skeleton & Tooling Bootstrap):**

- [x] 1.9.1 — Pin Node version ✅ 2026-05-04 (`server/.nvmrc` → `24`; matches workspace's `engine-strict=true` requirement; Approach's `20.11.1` callout was authored pre-Phase-0-merge and is stale)
- [x] 1.9.2 — package.json full shape ✅ 2026-05-04 (scripts: start/dev/test/test:unit/test:integration/test:contract/test:smoke/test:happy/test:live/lint/lint:fix/format; devDeps: @commitlint/cli + config-conventional, @eslint/js, eslint, globals, jest, lint-staged, prettier, supertest; deferred to later phases: nodemon (replaced by `node --watch`), pino-pretty + openapi-types + chai-openapi-response-validator + aws-sdk-client-mock + husky)
- [x] 1.9.3 — Lint + format + commitlint config ✅ 2026-05-04 (`eslint.config.js` flat config — ESLint v9 dropped `.eslintrc.cjs`; `.prettierrc` + `.prettierignore`; `.editorconfig`; `commitlint.config.cjs`; `.gitignore`; `no-console` rule allows warn/error so server.js startup signal works pre-pino; `console.log` in server.js switched to `console.warn`; **husky wire-up deferred** — configs in place, contributors honor-system until husky lands in a later sub-phase)
- [ ] 1.9.4 — Python tooling (pyproject.toml in `client/`) — DEFERRED to Approach Phase 3 / Plan sub-phase Phase 3 Client API workstream pickup (out of `feat/p02-foundation` scope; Phase 1 of foundation here only handles server-side tooling — Python tooling more naturally lands when client work begins)
- [x] 1.9.5 — Makefile ✅ 2026-05-04 (`projects/project02/Makefile` with help/install/test/test-* /lint/format/clean live now; `up`/`down`/`submit-server`/`submit-client` are visible-stub targets that print "wired in Approach Phase 10/13" and exit 1 — exposes the future surface without faking it)

**Erik's post-merge punch list (gates the Phase 0 tag):**

1. `git push origin feat/lib-extraction`
2. Open PR; reviewers see `lib:photoapp-server` label (create the label first if it doesn't exist yet — § 6.3 of the Phase 0 Approach)
3. Update GitHub branch protection: required status checks `test (lib/photoapp-server)` + `test (projects/project01/Part03)`
4. `utils/lab-up` (Terraform up — outside agent scope)
5. `cd projects/project01/Part03 && PHOTOAPP_RUN_LIVE_TESTS=1 npm test -- live_photoapp_integration.test.js` — green is the strongest signal Phase 0 is mechanically pure
6. `utils/smoke-test-aws --mode live` — should return to 10/10 with lab up
7. Local `cd MBAi460-Group1 && rm -rf node_modules && npm install` — belt-and-suspenders; freshclone-smoke already exercises the equivalent
8. Merge to `main`
9. `git tag library-1.0.0-extraction-complete <merge-commit-sha>`
10. `git push origin --tags`

**Phase 0 sub-phase progress** (frozen at workstream close; canonical row in *Closed (recent — this quest arc)*):

- [x] Phase 0.1 — Workspace Bootstrap ✅ 2026-05-02
- [x] Phase 0.2 — Extract Service Core (mechanically pure) ✅ 2026-05-02
- [x] Phase 0.3 — Repository Layer (CL9 bounded reconciliation) ✅ 2026-05-02
- [x] Phase 0.4 — Update Part 03 to Consume the Library ✅ 2026-05-02
- [x] Phase 0.5 — Doc-Staleness Prevention Protocol (CL11) ✅ 2026-05-02
- [x] Phase 0.6 — Acceptance ✅ 2026-05-02 (agent-side; § 6.1.5 / 6.1.8 / 6.3 / 6.4 are Erik's post-merge actions per his punch list above)

---

## Pending (queued by dependency)

Frame-compact rows derived from the Plan's Master Tracker. Each row references the full Frame block in `Approach/Plan.md` for complete fields; the Map carries the *cursor view*.

| Workstream | State | Branch | Depends on | Acceptance | Approach pointer |
|---|---|---|---|---|---|
| **Phase 1 — Foundation** | ⏳ Planned (next pickup) | `feat/p02-foundation` | Phase 0 ✅ (agent-side closed; merge + tag `library-1.0.0-extraction-complete` are Erik's post-merge actions) | `make up` healthy; six-layer harness in place; lint clean; Terraform `state mv` cutover green | `Approach/01-foundation.md` |
| **Phase 2 — Web Service (60/60)** | ⏳ Planned | `feat/p02-web-service` | Phase 1 ✅ | Gradescope server **60/60**; tag `gradescope-server-60-60`; contract suite + happy-path E2E green | `Approach/02-web-service.md` |
| **Phase 3 — Client API (30/30)** | ⏳ Planned | `feat/p02-client-api` | Phase 2 ✅ | Gradescope client **30/30**; tag `gradescope-client-30-30`; integration sweep + contract conformance green | `Approach/03-client-api.md` |
| **Phase 4 — Engineering Surface** | ⏳ Planned | `feat/p02-engineering-surface` | Phase 2 ✅ AND Phase 3 ✅ | engineering surface deliverables green; library 1.1.0 tagged; live regression green | `Approach/04-engineering-surface.md` |

### Out of scope (explicit deferral; tracked for visibility only)

| Workstream | Status | Note |
|---|---|---|
| **Future-State CICD** | ⏸️ Deferred | Out of Project 02 Part 01 scope; captured in `Approach/Future-State-cicd.md`. Local equivalents documented there as the pre-submit checklist until this lands |

### Cross-cutting deliverables (track in Plan; surface here when active)

The Plan's six cross-cutting threads (Testing Pyramid / Utility Building / Mermaid Visualizations / Library-Touching Governance / Doc-Freshness Protocol / Dual-Gradescope Tarball) are *interleaved across* Phases 0–4, not separate workstreams. The Map references them as cross-cutting state that updates throughout execution; canonical tracking lives in `Approach/Plan.md` § *Cross-Cutting Threads*.

---

## Closed (recent — this quest arc)

### Phase 0 — Library Extraction ✅ 2026-05-02 (agent-side; Erik post-merge actions queued)

**Outcome:** `@mbai460/photoapp-server@1.0.0` extracted from `projects/project01/Part03/server/` into `lib/photoapp-server/`. Part 03 successfully migrated to consume the library; npm workspaces topology established at the monorepo root. Mechanically pure (CL9) except the bounded SQL-into-repositories refactor in Phase 0.3, fully reconciled in `learnings/2026-05-02-photoapp-server-extraction.md`.

**Branch:** `feat/lib-extraction` — 23 commits ahead of `main`.

**Test state at close:**
- `lib/photoapp-server` — 99 tests across 11 suites, all green (~0.5s)
- `projects/project01/Part03` — 32 passed + 2 skipped (live-gated), 8 of 9 suites
- `utils/freshclone-smoke` — PASS in ~3s (true zero-state install via `git clone --shared`)
- Part 03 image (`mbai460-part03:dev`) — boots clean; `/health` 200
- Submission tarball — self-contained; lib resolves from extracted tree without any further install

**Optional Steps Built (6 of 7):** `Target-State-mbai460-photoapp-server-lib-extraction-v1.md`, `utils/lib-symlink-check`, `tests/exports-shape.test.js`, `utils/no-service-leak`, `tests/repositories/sql-characterization.test.js`, `utils/freshclone-smoke`. Retired: `utils/run-extraction-canary` (no iteration loop materialized).

**Key milestones:**
- Phase 0.1 ✅ — npm workspaces bootstrap; lib skeleton; lib-symlink-check util
- Phase 0.2 ✅ — mechanical extraction (services, middleware factories, schemas split, config); Part 03 source updates; exports-shape lock; no-service-leak guard
- Phase 0.3 ✅ — CL9 SQL-into-repositories bounded reconciliation; per-repo unit tests; SQL characterization test; reconciliation log
- Phase 0.4 ✅ — server.js boot fix + boot-smoke regression test; workspace-aware Dockerfile + monorepo .dockerignore; Gradescope packaging script + tarball self-containment test
- Phase 0.5 ✅ — DOC-FRESHNESS protocol; TODO.md Deferred Optional Steps schema; CONTRIBUTING.md; lib README full population; root README + QUICKSTART workspace-install path; PR template; Part 03 README + Approach doc touchpoints; refactor-log closeout
- Phase 0.6 ✅ — acceptance verification commands run; freshclone-smoke green

**Erik's post-merge punch list** (gates the `library-1.0.0-extraction-complete` tag): see § Active above.

**Closeout commits on `feat/lib-extraction`** (oldest → newest):

```
8b5b866 chore(meta): Phase 0 pickup — refactor-log + Map Frame transition
c86fb67 docs(viz): Target-State photoapp-server library extraction v1
cee5cad docs(viz): v1 review-pass round 1 (split Pre-Work State diagram)
f0a2e19 docs(viz): library-extraction review-pass round 2
9b4bf47 chore(monorepo): introduce npm workspaces with lib/photoapp-server skeleton
38f258b feat(utils): add lib-symlink-check + expose library package.json subpath
d76bf22 chore(meta): close out Phase 0.1 — flip trackers
6b9a35c refactor(part03): extract service core into @mbai460/photoapp-server (Phase 0.2)
2ec2f26 feat(lib+utils): Phase 0.2 optionals — exports-shape + no-service-leak
f484339 chore(meta): close out Phase 0.2 — flip trackers
1fe272c refactor(lib): extract SQL into repositories layer (Phase 0.3 CL9)
2c21634 test(lib): SQL characterization test (Phase 0.3 optional)
35f508c docs(learnings): photoapp-server extraction reconciliation log
2991412 chore(meta): close out Phase 0.3 — flip trackers
1092b89 fix(part03): repair server.js boot graph + boot-smoke regression test
1b4d720 feat(part03): workspace-aware Dockerfile + monorepo .dockerignore
66c28ab feat(part03): Gradescope packaging script + tarball test
b484d69 chore(meta): close out Phase 0.4 — flip trackers
c235e36 docs(meta): DOC-FRESHNESS protocol + Deferred Optional Steps schema
b765e56 docs(monorepo): doc-freshness scaffolding (CONTRIBUTING + READMEs/QUICKSTART + lib README + PR template + Part 03 touchpoints)
858cbf3 chore(meta): close out Phase 0.5 — flip trackers
cd7f6ab feat(utils): utils/freshclone-smoke (Phase 0.6.2 Optional)
5d6a5af chore(meta): Phase 0.6 acceptance — agent-side green
```

**Risks / queued forward:**
- The frontend pipeline is orthogonal to Phase 0 scope but caught a brittleness in freshclone-smoke (Part 03 SPA-fallback tests need `frontend/dist/index.html`, which is the Vite build output — gitignored). `utils/freshclone-smoke` pre-stamps a placeholder. Consider a permanent fix in Phase 1 (either check in a placeholder or make the tests provide their own).
- Per `MetaFiles/TODO.md` § Deferred Optional Steps: `utils/run-extraction-canary` retired; `make freshclone-smoke` Makefile wrapper rolled into Phase 1.10.

---

## Closed (recent — broader Lab activity, for cold-pickup context)

Lab + Class Project activity since the last quest closeout (Outstanding Integrations, 2026-04-27), surfaced here for any agent reading this Map cold:

**Class Project (`MBAi460-Group1`):**

```
2385bb5 projects/project02: add Plan.md — Project 02 Part 01 implementation orchestration   (2026-05-01)
67f7e0b MetaFiles/TODO: queue validate-db assets-empty assertion drift                       (2026-05-01)
732e14f merge'                                                                                (2026-04-30)
eac6446 Offered_Memories: 3 feedback entries + convention update                              (2026-04-30)
0c92a0c Merge: parallel agent streams converge — tempDir UI-sim + primary clone               (2026-04-30)
1452dcf README: cross-link MetaFiles/Offered_Memories/                                        (2026-04-30)
88bc31c Disambiguate dual photoapp-config.ini files (H2 footgun)                              (2026-04-30)
a73948e MetaFiles: establish Offered_Memories convention + 6 seed entries                     (2026-04-30)
cf28bff MetaFiles/Journal: SpinDown SD-2 amendment                                             (2026-04-30)
4351b01 End of session commit                                                                 (2026-04-28)
a3a737e Project02 Approach (the 7-doc Approach this quest executes)                           (2026-04-28)
8f2ec42 Part03/MetaFiles: SpinDown 1A — archive completed plans                                (2026-04-28)
0f2b976 Outstanding Integrations workstream: ✅ COMPLETE                                       (2026-04-27)
```

**Lab repo (`mbai460-client`, local-only relative to upstream):**

```
7716380 MetaFiles/TODO: queue git posture cleanup pass — 2026-05-01 catchup remainder        (2026-05-01)
d725ff6 claude-workspace/TODO: queue lab-repo remote-posture memory correction               (2026-05-01)
0998ac0 ErikTheWizard-workspace: track personal workspace TODOs                              (2026-05-01)
09713ed claude-workspace: bring agent workspace under version control (71 files)             (2026-05-01)
aaadd8d MetaFiles: extend PossiblePermissionsModel with Part 03 closeout actions             (2026-05-01)
9f66deb system-plane-notes: reset focuses to subagents + execution-flow                      (2026-05-01)
52b1795 MetaFiles: queue lab-root gitignore policy decision                                  (2026-04-30)
9303bb9 MetaFiles: add PossiblePermissionsModel draft                                        (2026-04-30)
9bd51c5 gitignore: remove dead labs/lab02 rule                                               (2026-04-30)
f517f18 MetaFiles: track lab-level orientation and TODO queue                                (2026-04-30)
6cd7660 MetaFiles: add lab-layer quick reference header                                      (2026-04-30)
6092467 gitignore: exclude MBAi460-Group1/ from lab repo                                     (2026-04-29)
5b31e51 disentangle: remove Class Project from lab repo tracking                             (2026-04-29)
05830ab restructure Class Project sphere (MBAi460-Group1)                                    (2026-04-29)
```

---

## Live findings + small queues

Empty — execution has not started. Reserved for in-flight findings the executing agent surfaces during workstream phases (e.g., bugs caught during TDD, scope-expansion candidates, optional-step routing decisions). See `Approach/Plan.md` § *Optional Steps Registry* for the canonical Optional-Steps tracking surface; small queues for cross-cutting findings will surface here when they emerge.

---

## Update protocol

1. **At each substep close-out:** flip status (⏳ → 🔄 → ✅), update pointer/notes, add commit hash if applicable. Update *only after confirmation*, never from prediction.
2. **At workstream pickup:** move the row from Pending → Active, transition the Active section to the full Frame instance (Purpose / Position with Down + Up / Scope In+Out / Workset / State=`In Progress` / Entry conditions verified / Exit conditions to-watch / Verification commands ready / Resumption per state).
3. **At workstream completion:** move row from Active → Closed (recent — this quest arc) with completion date, closeout commit chain, key milestones (e.g., Gradescope tags); Active reverts to "between workstreams" until the next pickup.
4. **The lite Compass is in-chat only.** Print at the end of every active-execution response, deriving directly from the Active section of this Map + current Frame nesting. There is no on-disk Compass to keep in sync.
5. **Before any forward execution after compaction:** re-read this Map, then perform the Refresh Ritual against it (per `feedback_refresh_ritual.md` Phase 2 adversarial stance). The Active section IS the execution-position claim — verify it against file state, not the other way around.
6. **Cross-cutting threads** (Testing / Utilities / Visualizations / Library / DOC-FRESHNESS / Tarballs) update inside their canonical tracker in `Approach/Plan.md` § *Cross-Cutting Threads*; when they affect Active execution, surface in the Active section's Frame.
7. **Optional Steps decisions** route to `Approach/Plan.md` § *Optional Steps Registry* (status checkbox flips) and, where applicable, to `MBAi460-Group1/MetaFiles/TODO.md` (queued items). The Map carries no Optional-Steps state of its own.

---

## Notes for cold-pickup readers

- **Quest sphere:** `MBAi460-Group1/projects/project02/`. Operative directory; deliverables land here (plus shared library at `MBAi460-Group1/lib/photoapp-server/`, plus Part 03 consumer updates from Phase 0).
- **Plan + Map relationship:** `Approach/Plan.md` is the spec (read for *how* to execute); this Map is execution state (read for *which* and *where*). Plans are stable; Maps are mutable. Plan duplicates content from the underlying Approach docs; the Map references both.
- **Approach docs intentionally have overlap with this Map and the Plan.** Approach owns content; Plan owns orchestration; Map owns current state. Don't treat the overlap as duplication — each artifact has a different stability profile and read-posture.
- **Lab side context:** the agent-internal workspace lives at `claude-workspace/` in the parent lab repo (`mbai460-client/`). System-plane focuses for this quest are codified at `claude-workspace/scratch/system-plane-notes.md` (resetted 2026-05-01 to *SubAgents Usage* + *Execution Flow*). Memory at `claude-workspace/memory/`; agent-internal TODO queue at `claude-workspace/TODO.md`.
- **Multi-agent collaboration is via git VCS:** feature branches per workstream + merge over rebase per `feedback_preserve_parallel_collaborator_signal.md` (ingested 2026-05-01 from `MetaFiles/Offered_Memories/`). The Plan's *How Collaborating Agents Pick Up* section is the canonical pickup protocol.
- **Execution has not started.** When it does, the Active section becomes a full Frame instance and the workstream's Pending row moves up. Until then, this Map's job is to make the *not-yet-engaged* state legible enough that any agent picking up this quest cold can find their way without folklore.
- **VCS posture for executing agents** is captured in `Approach/Plan.md` § *VCS posture (working assumption pending formal codification)*. The lab-root formal VCS strategy is itself queued at `mbai460-client/MetaFiles/TODO.md` line 4.
