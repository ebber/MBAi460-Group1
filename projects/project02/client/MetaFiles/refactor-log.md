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
