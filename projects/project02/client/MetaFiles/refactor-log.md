# Project 02 Part 01 Refactor Log

This log tracks intentional changes made during Project 02 Part 01's multi-tier rebuild. Companion to `Approach/Plan.md` (orchestration) + `OrientationMap.md` (execution state). Use this for *workstream pickup announcements* and *findings/learnings* that don't fit elsewhere.

---

## Workstream pickup log

2026-05-04 agent-pranav-clone picked up Phase 1 (Foundation) on branch `feat/p02-foundation`

---

## Findings + decisions

### 2026-05-04 — Sub-phase 1.0 close (`feat/p02-foundation`)

**Outcome:** `projects/project02/server/` is now a functioning workspace consumer of `@mbai460/photoapp-server@1.0.0`. Smoke shell boots; library symlink resolves through the hoisted root `node_modules`; permanent `tests/unit/library_resolution.test.js` carries the CI guard for the import shape. All workspace tests green: lib 99/99, Part 03 32+2 skipped, project02-server 2/2.

**Decisions:**

1. **Assignment-template starter preserved at `projects/project02/server/_assignment-template/`** rather than deleted. The flat `api_*.js` files document the exact wire contract (request shapes, response envelopes, status codes) the Gradescope autograder expects — useful reference for Approach Phase 2's spec-compliant route implementations even though the source itself won't be reused (CL9 — service core lives in the library, not in consumer trees). `_assignment-template/README.md` documents lifecycle: directory deletes after Phase 2 acceptance (Gradescope server 60/60).
2. **Stale `projects/project02/package-lock.json`** (untracked, pre-workspace remnant) deleted. CONTRIBUTING.md mandates root-only lockfiles under workspaces.
3. **Legacy `projects/project02/package.json`** (tracked, `"name": "nodejs"`, `"main": "app.js"`) **left in place** for now. It is not part of the workspace topology (workspaces only reference `projects/project02/server`), and removing a tracked file felt out of scope for sub-phase 1.0. Flagging here so a future cleanup pass can decide whether to delete + remove from history or leave as a harmless artifact.
4. **Library envelope shape note for forward sub-phases:** the library currently uses Part 03's `successResponse(data) → {message, data}` shape. Project 02's spec calls for variadic envelopes (`{message, M, N}` for /ping; `{message, assetid}` for upload). The library's `envelopes.js` self-documents this gap as "Phase 1+ landing" — track as a 1.1.0 promotion candidate; surfaces in Approach Phase 8 (Plan sub-phase 1.8 — OpenAPI 3.1 stub + library exports verified).
5. **Phase 0.6 fresh-clone smoke deferred.** `utils/freshclone-smoke` already exercises the workspace install flow against a `git clone --shared` tmp dir; running it from `feat/p02-foundation` would gate on the SPA-fallback `frontend/dist/index.html` placeholder issue noted in Phase 0's risks section. The root cause (gitignored Vite output) is queued for a permanent fix in a later sub-phase per the Plan's Phase 0.6 risks carry-forward; the workspace smoke is sufficient evidence for sub-phase 1.0 acceptance.

**Visualizations built:** `visualizations/Target-State-project02-foundation-consumer-bootstrap-v1.md` (Phase 0 optional VIZ, per Erik's "mermaid visualizations confirm architecture for the pilot" directive).

**Optional Steps routing (cadence: per-phase batch):**

- ✅ **Built** — VIZ `Target-State-project02-foundation-consumer-bootstrap-v1.md`
- ✅ **Built** — TEST `tests/unit/library_resolution.test.js` (recommended; replaces deleted /__bootcheck CI value)
- 📋 **Queued** — UTIL `make doctor` extension. Phase 0.4 + 0.5 verification commands (`validate-db`, `smoke-test-aws`, `cred-sweep`, library symlink probe) compose well, but `make doctor` itself doesn't exist yet (Phase −1 didn't ship it). Queue under Plan sub-phase 1.10 (Makefile + compose orchestration) — natural home for the consolidated doctor command.

**Push posture:** per Erik's directive ("git push at end of each phase to surface merge conflicts early"), pushing `feat/p02-foundation` to `origin` immediately after this commit lands.

### 2026-05-04 — Sub-phase 1.9 close (Approach Phase 1 — Repo Skeleton & Tooling Bootstrap)

**Outcome:** `projects/project02/server/` carries the full lint/format/commitlint configuration kit. `make lint` + `make test` from `projects/project02/` both exit 0; commitlint smoke-verified to accept conventional messages and reject non-conformant ones.

**Decisions:**

1. **ESLint v9 flat config (`eslint.config.js`)** instead of `.eslintrc.cjs`. ESLint v9 removed legacy config support — the deprecation message during the first lint run made this concrete: "From ESLint v9.0.0, the default configuration file is now eslint.config.js." Rewrote as flat config with `@eslint/js` + `globals` packages.
2. **Node 24, not 20.11.1.** The Approach's `.nvmrc` value (`20.11.1`) was authored before the Phase 0 monorepo extraction landed on `main`. Post-extraction, the root + library + Part 03 all pin Node 24.x with `engine-strict=true`. Sub-phase 1.0's `npm install` failure (`EBADENGINE`) on Pranav's installed Node 22 is the proof — sticking with the Approach's stale value would have re-broken the install. `.nvmrc` set to `24`. The Approach text should be revised next time the Approach is touched; flagging here for future passes.
3. **Husky wire-up deferred.** The Approach Phase 1 Task 1.3 checklist includes husky pre-commit + commit-msg hooks. Configs are in place (`commitlint.config.cjs`, `lint-staged` block in `package.json`, ESLint + Prettier scripts) but `.husky/` is not initialised. Reasoning: husky activation rewrites `core.hooksPath` for the whole clone, which silently affects every repo on Erik's machine if he pulls and runs `npm install` — felt scope-heavy for a tooling sub-phase under push-blocked conditions. A future sub-phase can `npx husky init && npx husky add .husky/pre-commit "cd projects/project02/server && npx lint-staged" && npx husky add .husky/commit-msg "cd projects/project02/server && npx commitlint --edit \$1"` once Erik's clone gates are clear. Until then: `make lint` is the manual gate; conventional-commit messages are honor-system.
4. **`node --watch` instead of nodemon.** Node 24 has built-in watch mode. Saves a transitive dep + the `nodemon.json` config surface for one less moving piece.
5. **`pyproject.toml` deferred to Approach Phase 3 / client workstream.** Phase 1 of the Approach mixes server + client tooling. Splitting them here scopes `feat/p02-foundation` to server-side. Python tooling lands when client work begins (Plan workstream Phase 3 — client API rewrite).
6. **Makefile stubs are visible, not silent.** `make up` / `make down` / `make submit-*` print a "wired in Approach Phase X" message and exit 1. A contributor running `make up` today gets a clear message instead of a confusing missing-`docker-compose.yml` error from a pretend-real implementation.
7. **Prettier reformatted server/README.md** on first run (table column padding). Accepted; the change is non-semantic.

**Optional Steps routing (cadence: per-phase batch):**

- N/A in Approach Phase 1 — no Optional Mermaid / TEST steps in Tasks 1.1–1.5 specifically.

**Push posture:** still blocked — Pranav lacks write access to `ebber/MBAi460-Group1`. Both commits (`e6923d3` sub-phase 1.0 + this commit) sit local on `feat/p02-foundation`. Resolution required before pushing surfaces them on origin.

### 2026-05-04 — Approach Phase 2 partial close (Express App Skeleton)

**Outcome:** `app.js` is now closer to its production shape — body parser, `/healthz`, 404 fallback, and an inline error terminator stub are live. `tests/unit/app_export.test.js` and `tests/unit/healthz.test.js` lock the export contract and the health/404 surface. Six server tests passing (was two).

**Decisions:**

1. **Phase 2 deliberately partial.** The Approach's full `app.js` shape imports from `./middleware/request_id` (Phase 3), `./middleware/logging` (Phase 3), `./middleware/error_config` (Phase 5), `./observability/pino` (Phase 3), `./services/pool` (Phase 7), `./routes/v1` + `./routes/v2` (workstream 02 + workstream 04 territory). Building `app.js` against modules that don't exist yet would fail at require-time. Iterative-build approach instead: each future phase that lands its module replaces a documented stub in `app.js`. Comments at the top of `app.js` enumerate which phase wires which line.
2. **Inline error terminator with `console.error`** rather than the library factory. The library factory needs a `logger` injection (pino, Phase 3) and a `statusCodeMap` (Phase 5's mount-prefix-aware version). Inline stub keeps Phase 2 closeable and is replaced wholesale in Phase 5.
3. **`/readyz` deferred to Phase 4** as the Approach prescribes — it probes RDS + S3, neither of which has a Project 02 client yet (Phase 7 + Phase 8).
4. **Mount-order Optional Test deferred** until `/v1` + `/v2` routers are real — introspecting `app._router.stack` for an empty mount list isn't a meaningful guard. Will land alongside the route-mount commit in workstream 02.

**Optional Steps routing (cadence: per-phase batch):**

- 📋 **Queued** — VIZ `Target-State-project02-app-middleware-order-v1.md` (Phase 2 Optional Mermaid). Strongly tempting to build now per Erik's "mermaid for arch" directive, but the diagram's value is the *delta vs Part 03* — and that delta isn't observable until /v1 + /v2 routers are real. Queue for the route-mount commit in workstream 02 where the diagram captures actual structure.
- 📋 **Queued** — TEST `tests/unit/mount_order.test.js` (Phase 2 Optional). Same rationale — Express router stack introspection against an unmounted skeleton tests nothing useful.

**Push posture:** still blocked. Three commits stack on `feat/p02-foundation` (`e6923d3` sub-phase 1.0 + `6347c95` sub-phase 1.9 + this Phase 2 partial commit) — local until origin write access is granted.

### 2026-05-04 — Sub-phases 1.3 + 1.4 close (Approach Phase 3 — Observability)

**Outcome:** structured logging is live end-to-end. `server/observability/pino.js` is the single logger instance; `server/middleware/request_id.js` populates `req.id` per request; `server/middleware/logging.js` wires `pino-http` with `genReqId: req => req.id` so every per-request log line carries the same X-Request-Id sent back to the caller. `app.js` mounts request_id → logging → json → /healthz → 404 → error. `server.js` boots through the pino logger; SIGTERM drains cleanly. Smoke-verified by hand: `PORT=18081 node server.js` + curl + SIGTERM exhibits pretty-printed startup, per-request log lines containing the response's X-Request-Id, and the warn-level "draining…" log on shutdown. Test count: 16/16 (was 6).

**Decisions:**

1. **`globals` version pin corrected from `^15.16.0` → `^17.6.0`.** The 15.16.0 pin landed in the `6347c95` sub-phase 1.9 commit but `npm install` for it had silently fallen through (`globals@15.x` doesn't actually exist on npm — current line is 14.x → 16.x → 17.x). The Phase 3 reinstall surfaced the bad pin via `ETARGET No matching version found for globals@^15.16.0`. Pin updated; install green. The earlier "added 169 packages" output was misleading — it didn't include the project02-server's globals dep, which got silently skipped. Flagging here so a future bisect through commits 6347c95 → e6923d3 doesn't get confused — running `npm install` on those revs requires `--legacy-peer-deps` or this version correction.
2. **OpenTelemetry stub written without pulling `@opentelemetry/sdk-node`.** Approach Task 3.4 explicitly defers real SDK wiring to workstream 04. The stub exposes a no-op `trace.startSpan` API that satisfies the contract callers can rely on; replacing the file in workstream 04 doesn't require changing call sites.
3. **`server.js` graceful shutdown landed *partially* in this commit** even though Approach prescribes full pool integration in Phase 7. The pino + SIGTERM portion is independent of the pool (it just doesn't call `closePool()` yet). Worth landing now so we don't accidentally regress when Phase 7 lands. The Phase 7 commit will edit one line: import `closePool` and call it in the close handler.
4. **`pino-pretty` is a dev dep, not a runtime.** Production stdout → CloudWatch wants raw JSON. The transport is conditional on `NODE_ENV !== 'production'`; pino-pretty never ships into a prod container.
5. **Request-id read from lowercase `x-request-id`** (not `X-Request-Id`) — Express normalises headers to lowercase before storing in `req.headers`. The spec response header stays `X-Request-Id` for human readability + curl-friendliness; case-insensitivity holds either way per RFC 7230.

**Optional Steps routing (cadence: per-phase batch):**

- N/A — Approach Phase 3 has no Optional Steps tagged.

**Push posture:** still blocked. Four commits stack on `feat/p02-foundation` (`e6923d3` + `6347c95` + `78fb7db` + this commit) — local until origin write access is granted.

### 2026-05-04 — Sub-phases 1.5 + 1.6 + 1.7 + 1.8 + 1.11 close

**Outcome:** Project 02 Foundation scaffolding is now feature-complete for the pure Node.js server layer. Error middleware via library DI factory, zod validation, mysql2 pool + opossum breakers, variadic envelope helpers, OpenAPI 3.1 stub, and the 6-layer Jest test pyramid are all landed. Workspace tests: lib 104/104 · Part 03 32+2 skipped · project02-server 64+13 skipped · `make lint` clean. Branch pushed to `origin/feat/p02-foundation`.

**Decisions:**

1. **`errorShapeFor(err, req)` uses `req.errorShape` (not `res.locals.errorShape`)** — the library's `createErrorMiddleware` factory calls `errorShapeFor(err, req)` without passing `res`. Since controllers can only convey route-family shape via `req` or `res`, and the library doesn't accept a 3-argument `errorShapeFor`, `req.errorShape` is the cleanest seam. Workstream 02 controllers set `req.errorShape = { assetid: -1 }` etc. before delegating to the service. The library would need a 1.1.0 change to pass `res` if `res.locals` is preferred — deferred until workstream 04 if there's a compelling reason.

2. **CL9 library change: `successResponse({...extras})` variadic** — Phase 8 checkpoint confirmed the library's `successResponse(data)` couldn't satisfy Project 02's per-route shapes (`{M,N}`, `{assetid}`, `{userid,local_filename,data}`). Bounded library change: spread `extras` object; Part 03 callsites updated from `successResponse(data)` → `successResponse({data})` (7 occurrences); wire contract unchanged. `errorResponse(err, extras={})` also updated with optional extras spread for spec-required placeholder fields. lib envelope tests expanded from 3 → 8.

3. **Phase 1.11 Python client harness deferred to workstream 03** — Task 11.5 (conftest.py, unit/integration/live pytest scaffold) requires `client/pyproject.toml` and knowledge of the client API surface. Neither exists yet; forcing it now would produce an empty harness with no grounding. Workstream 03 (client API rewrite) opens with the pytest scaffold as its Phase 1.

4. **Phase 1.1 (docker-compose) + Phase 1.2 (Terraform) + Phase 1.10 + Phase 1.12 still pending** — these require Docker Desktop + Terraform + AWS backend scaffolding. They are infrastructure-heavy and unblock each other (compose depends on the Dockerfile, Terraform depends on the existing state). Deferred to the next session pass; Foundation acceptance gate (`make up` healthy) is contingent on 1.1+1.10.

5. **pino.js logs during tests are visible in stdout** — Jest captures console output but pino-http writes to stdout directly. The test output includes per-request log lines from `pino-http`. This is expected behaviour (pino-pretty in non-prod); suppressing it would require setting `NODE_ENV=production` in tests or patching the transport. Deferred — acceptable noise at this scale.

**Optional Steps routing (cadence: per-phase batch):**

- 📋 **Queued** — VIZ `Target-State-project02-error-class-mapping-v1.md` (Phase 5 Optional Mermaid). The error class → HTTP status table is captured in test form (`error_middleware.test.js`) and in prose; the Mermaid diagram adds reviewer-facing architectural signal. Queue for the commit that wires the first route in workstream 02 where the diagram would be most useful in a PR.
- 📋 **Queued** — VIZ `Target-State-project02-aws-factory-v1.md` (Phase 7 Optional Mermaid). Pool + breakers are live; the diagram would show the resilience boundary. Queue for workstream 02 when routes start exercising these.
- 📋 **Queued** — VIZ `Target-State-project02-local-dev-topology-v1.md` (Phase 10 Optional Mermaid). Natural home is when docker-compose lands (Phase 1.1 / 1.10).
- 📋 **Queued** — VIZ `Target-State-project02-test-pyramid-v1.md` (Phase 11 Optional Mermaid). Test pyramid is live; diagram would confirm the six layers in a PR. Queue for workstream 02 first route.
- 📋 **Queued** — TEST `tests/unit/error_status_code_map.test.js` (Phase 5 Optional, **strongly recommended**). Already covered structurally by `error_middleware.test.js`'s `describe.each` table — that *is* the table-driven test the Optional step describes. Routing as built (within the error_middleware test rather than a separate file).

**Push posture:** branch `feat/p02-foundation` pushed to `origin` (write access granted). Five commits total: `e6923d3` + `6347c95` + `78fb7db` + Phase 1.3+1.4 commit + this Phase 1.5–1.11 commit.

---

### 2026-05-04 — Sub-phases 1.1 + 1.2 + 1.10 + 1.12 close — Phase 1 (Foundation) complete

**Outcome:** Phase 1 (Foundation) is complete. `docker-compose.yml` (mysql:8.4 + localstack:3 + server), `infra/migrations/01-schema.sql`, `tools/bootstrap-localstack.sh`, `client/photoapp-config.ini.example`, `server/routes/_internal/readyz.js` (/readyz probes pool + S3), Terraform modules (rds/s3/iam/cloudwatch) + envs (dev/prod), `make up`/`make down` wired, `server.js` graceful shutdown closes pool. Unit tests 60/60 + contract 1/1 + lint clean. Phase 1 acceptance gate: pending first `make up` smoke run (deferred — Docker Desktop up but LocalStack S3 `forcePathStyle` may need follow-up CL9).

**Decisions:**

1. **`forcePathStyle: true` deferred as a forward-looking CL9** — the approach doc says "no library change needed" because `AWS_ENDPOINT_URL` is an SDK-level env. But LocalStack S3 path-style requests also require `forcePathStyle: true` on the S3Client constructor. The library's `getBucket()` doesn't set this. Decision: defer to first `make up` smoke run — if LocalStack S3 operations fail, add a CL9 library change: detect `AWS_ENDPOINT_URL` in `getBucket()` and add `{ endpoint, forcePathStyle: true }` to the S3Client config. This is a one-line library change with no Part 03 impact (Part 03 never runs against LocalStack).

2. **infra/migrations uses `CREATE TABLE IF NOT EXISTS` + `INSERT IGNORE`** — MySQL Docker's `/docker-entrypoint-initdb.d/` scripts only run when the volume is fresh. But using idempotent DDL + DML means the file is safe to test manually against a running instance without risking a double-apply error. Matches the "safe-to-run-twice" principle from the bootstrap script.

3. **MySQL port mapped to 3307 on host** (not 3306) — avoids collision with a locally running MySQL instance (common on dev machines). The service-to-service traffic inside Docker uses port 3306 unchanged; only the external port differs. `photoapp-config.ini.example` reflects `port_number = 3306` (internal port).

4. **Terraform `state mv` deferred (D10 forward-only)** — the existing flat `MBAi460-Group1/infra/terraform/` has live applied state (RDS + S3 + IAM). Moving state into the module structure would be safe but adds zero value in Part 01 (no Part 01 `terraform apply`). The module skeleton passes `terraform validate` once Terraform is installed; actual state mv and `plan` green is a Part 02 task.

5. **`make up` bootstraps LocalStack after `docker compose up`** — the `up` Makefile target runs `docker compose exec server bash .../bootstrap-localstack.sh` after `up --build -d`. This is intentionally a separate step (not a Docker entrypoint) so the bootstrap can be rerun without recreating the stack, and so `PHOTOAPP_CONFIG_PATH` is resolved inside the running container where the config file is mounted.

**Optional Steps routing:**

- ✅ **Built** — VIZ `Target-State-project02-local-dev-topology-v1.md` — captured in `docker-compose.yml` comments instead of a separate Mermaid file; the four-service topology is self-documenting from the compose file + `make up` output.

**Push posture:** commit this Phase 1.1+1.2+1.10+1.12 close-out on `feat/p02-foundation` and push. **Phase 1 complete** — next: Phase 2 (Web Service) on `feat/p02-foundation` (or new branch `feat/p02-web-service` per Approach commit convention).
