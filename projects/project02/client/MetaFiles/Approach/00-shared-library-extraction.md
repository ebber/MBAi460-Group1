# Phase −1: Shared Library Extraction

> **Status:** Not started. **Hard precondition for `01-foundation.md`** — every downstream workstream consumes the library extracted here. Until this lands, `02-web-service.md` cannot reference `@mbai460/photoapp-server`, and the inheritance-map visualization is ambiguous.

> **For agentic workers:** Execute as a checklist. The single rule for this workstream is: **mechanically pure extraction — file movement and import-path updates only, no behaviour changes**. Any reconciled behaviour difference between Part 03 and Project 02 is captured as a `learnings/` entry and deferred to a separate, deliberate PR. If you find yourself "improving" code while extracting it, stop and split the work.

---

## Goal

Extract the service core that already lives in `projects/project01/Part03/server/` into a single shared library at `MBAi460-Group1/lib/photoapp-server/`, then make Part 03 import from it. **Project 02 is not built yet** — it will become a second consumer of the library in `01-foundation.md` Phase 0. The library contains only what Part 03 has already proven; net-new Project 02 code (request_id, validate, observability, the `/v1` route layer) lives in Project 02's own tree until a third consumer justifies promotion.

This workstream supersedes the prior "future-state consolidation" plan after a pressure test surfaced that the dual-tree port-and-adapt model is **deliberate duplication accepted under the banner of risk avoidance**. The CL1–CL8 design was already complete; only execution remained. Doing it first eliminates the "adapt and keep in sync" tax permanently and lets Project 02 begin as a clean consumer rather than a second copy.

## Why now (the pressure test, captured)

Three reasons this moves from future state to Phase −1:

1. **The dual-tree plan codifies known debt.** The "adaptation set" called out in the inheritance-map viz (`services/aws.js` → pool+breakers; `services/photoapp.js` → base64 upload/download; `middleware/error.js` → mount-prefix logic; `schemas.js` → split + variadic envelope) describes parallel divergence by design. Every adaptation is a place a bug could hide in one tree and not the other. **Library-first eliminates that surface area; library-later only minimizes it.**
2. **The library design is done.** CL1–CL8 (workspaces, internals-only, configurability via construction, backward-compatible API, shared service tests, surface-specific contract tests, injected logger, version pinning) were finalized in the prior planning round. We are not deferring design work — we are executing a designed thing.
3. **The "one cohesive project" principle requires it.** The user's own framing — *"that can include making changes to files in Project01, it's one cohesive project after all"* — is incompatible with maintaining two parallel internal implementations. Cohesion is a property of the codebase or it isn't.

The one defensible argument for dual trees — *"each surface evolves fully independently"* — does not apply here, because the surfaces are owned by the same team and intentionally aligned. If a future surface ever needs to hard-fork (Fastify port, Hono experiment), the library's DI seams (CL3) make that explicit and reviewable.

## Scope

This workstream owns:

- Bootstrapping `MBAi460-Group1/package.json` as an npm workspace root.
- Creating `MBAi460-Group1/lib/photoapp-server/` and moving Part 03's service core into it.
- Updating Part 03 to import from `@mbai460/photoapp-server`.
- Refactoring Part 03's existing inline SQL into the library's `repositories/` layer (the only behaviour-affecting change in this workstream — see CL9 below for why this is allowed and how it is bounded).
- Updating Part 03's `Dockerfile`, CI workflow, and Gradescope packaging script to handle the workspace structure.
- Setting up the collaboration-safety scaffolding: lockfile merge driver, branch-protection guidance, CI fan-out.
- **Refreshing every onboarding-touching document** (`README.md`, `QUICKSTART.md`, `CONTRIBUTING.md`, per-project READMEs, `lib/photoapp-server/README.md`) so a fresh-clone contributor can succeed without folklore. The doc refresh is a **hard acceptance criterion**, not a follow-up.

This workstream does **not** own:

- Any change to Part 03's `/api/*` wire contract — the library refactor is internals-only (CL2). The HTTP behaviour observable to a Part 03 client must be byte-identical before and after.
- Building Project 02's server tree — that is `01-foundation.md` Phase 0, which begins by `npm install`-ing the library extracted here.
- Promoting Project 02-specific middleware (`request_id`, `validate`, `pino-http`, OTel) into the library — that is YAGNI until a third consumer exists.
- Any infrastructure or Terraform change.

## Dependencies

**Hard preconditions:**

- Part 03's test suite (`projects/project01/Part03/server/npm test`) is green at HEAD. **Verify before starting.** This is the regression baseline.
- No in-flight PRs targeting `projects/project01/Part03/server/`. If there are, coordinate with their authors before merging Phase −1 (see Pre-flight Communication below).
- `MBAi460-Group1/MetaFiles/QUICKSTART.md` exists (it does, per the lab backbone) and is the canonical onboarding doc — Phase −1 will update it.

**Soft preconditions:**

- Node 24.x installed (Part 03's `engines.node`) — workspaces require Node ≥ 16, so this is comfortable.
- A clean working tree at the start (`git status` clean) — the extraction touches many files and an interrupted state is hard to debug.

## Pre-flight Communication

Phase −1 is a high-coordination event because it touches the workspace root and Part 03 simultaneously. Before opening the PR:

- [ ] Open a `chore: announce shared-library extraction` issue with: target merge window, files affected, rebase one-liner for in-flight branches, and a link back to this Approach doc.
- [ ] Confirm via the issue that no Part 03 PRs are in flight; if there are, post the rebase one-liner on each and wait for ACK.
- [ ] Pick a quiet merge window (early morning by the team's modal time zone is a safe default for async-remote teams).
- [ ] Pin the issue to the repo's homepage / README banner area until the PR merges.

## Target Files

```text
MBAi460-Group1/
  package.json                          # NEW — workspace root: { "workspaces": ["lib/*", "projects/project01/Part03", "projects/project02/server"] }
  package-lock.json                     # NEW — single root lockfile
  .npmrc                                # NEW — package-lock=true, engine-strict=true, save-exact=true
  .gitattributes                        # EXTEND — package-lock.json merge=npm-merge-driver (or merge=union)
  README.md                             # UPDATE — workspace bootstrap section + lib/ pointer
  QUICKSTART.md (or MetaFiles/QUICKSTART.md) # UPDATE — clone → npm install at root → workspace navigation
  CONTRIBUTING.md                       # NEW (or extend existing) — workspace conventions, library change protocol, lockfile etiquette
  .github/
    pull_request_template.md            # EXTEND — "did this PR change a contributor-facing surface? Did you update the matching README?"
    workflows/
      ci.yml                            # UPDATE (Future-State-cicd.md picks this up; here we add the path-filtered job matrix skeleton)
  lib/
    photoapp-server/                    # NEW — extracted service core
      package.json                      # name: @mbai460/photoapp-server; version: 1.0.0; main: src/index.js
      README.md                         # NEW — library API, exports, DI seams, version policy
      CHANGELOG.md                      # NEW — starts at 1.0.0 with "extracted from projects/project01/Part03/server/ on YYYY-MM-DD"
      src/
        index.js                        # exports map: { config, services, repositories, middleware, schemas }
        config.js                       # MOVED from projects/project01/Part03/server/config.js
        services/
          aws.js                        # MOVED from Part 03 — AWS client factory + mysql2 connection (pool refactor lives in 01-foundation Phase 7, not here)
          photoapp.js                   # MOVED from Part 03 — getPing, listUsers, listImages, uploadImage, downloadImage, getImageLabels, searchImages, deleteAll
        repositories/                   # NEW (extracted from inline SQL in Part 03's services/photoapp.js — see CL9)
          users.js
          assets.js
          labels.js
        middleware/
          error.js                      # MOVED from Part 03; constructor takes { statusCodeMap, errorShapeFor, logger } (CL3)
          upload.js                     # MOVED from Part 03; constructor takes { destDir, sizeLimit }
        schemas/
          envelopes.js                  # MOVED from Part 03 schemas.js (successResponse/errorResponse — Part 03's uniform shape; Project 02's variadic shape is built via DI in 01-foundation)
          rows.js                       # MOVED from Part 03 schemas.js (userRowToObject, imageRowToObject, labelRowToObject, searchRowToObject, deriveKind)
      tests/                            # service-layer unit tests (mocked) — moved from Part 03's tests/
        services/
          aws.test.js
          photoapp.test.js
        repositories/                   # NEW — repository tests against ephemeral MySQL or a typed fake
          users.test.js
          assets.test.js
          labels.test.js
        middleware/
          error.test.js
          upload.test.js
        schemas/
          envelopes.test.js
          rows.test.js
      jest.config.js                    # NEW — runs against tests/ above
projects/project01/Part03/
  server/
    app.js                              # UPDATE — imports services / middleware / schemas from @mbai460/photoapp-server; constructs error middleware via createErrorMiddleware({...Part 03 mapping})
    server.js                           # unchanged
    config.js                           # DELETED (now imported from lib)
    services/                           # DELETED (now in lib)
    middleware/                         # DELETED (now in lib)
    schemas.js                          # DELETED (now in lib)
    routes/photoapp_routes.js           # UPDATE — imports services from lib; calls `successResponse({ data })` for the uniform envelope
    package.json                        # UPDATE — depends on @mbai460/photoapp-server; remove direct deps now hoisted to root
    Dockerfile                          # UPDATE — workspace-aware copy pattern (root package.json + lockfile + each workspace's package.json before src)
    tests/                              # UPDATE — service-layer tests removed (now in lib); integration + live tests stay
    README.md                           # UPDATE — "this server consumes @mbai460/photoapp-server"; add architecture pointer to lib/photoapp-server/README.md
  MetaFiles/
    Approach/
      02-server-foundation.md           # APPEND footnote — "service core extracted to @mbai460/photoapp-server on YYYY-MM-DD; see Project 02 MetaFiles/Approach/00-shared-library-extraction.md"
      03-api-routes.md                  # APPEND footnote — same
    refactor-log.md                     # APPEND extraction entry: file-by-file move map, behavioural reconciliations (CL9 entries), test-suite confirmation
projects/project02/                     # untouched here — 01-foundation.md Phase 0 makes it a consumer of the library
```

## Design Decisions

The CL1–CL8 set was carried forward from the prior plan with **CL8 relaxed for pre-1.0.0 development** and **CL9–CL12 added** as a result of the pressure test:

- **CL1 — npm workspaces, not git submodule.** Workspace root at `MBAi460-Group1/package.json`. `npm install` from the root resolves all workspaces. No new repo.
- **CL2 — Library is internals-only.** Exports services, repositories, middleware (constructed), schemas. Never routers — surfaces own routing because their wire contracts differ.
- **CL3 — Configurability via construction, not env.** Library middleware factories take config objects. Example: `createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })` so Part 03 picks Part 03's mapping and Project 02 picks Project 02's mount-prefix-aware mapping. No env-var forks inside the library.
- **CL4 — Backward-compatible API.** Library v1.0.0's exports satisfy what Part 03 already uses. Behavioural reconciliations (CL9) are the only API-affecting changes in this workstream and are caught by Part 03's existing test suite.
- **CL5 — Service-layer tests live in the library; integration / contract / live tests stay in each surface.**
- **CL6 — Test pyramid is the library's; smoke and happy-path are each surface's.**
- **CL7 — `pino` logger is injected, not imported.** Each surface configures its own logger and passes it to library factories. Library code uses an injected logger or a no-op stub.
- **CL8 — Library version pinning is *strict* post-1.0.0; *floating* during pre-release.** **Relaxed from the prior plan.** During Phase −1 → Project 02 submission, both consumers reference the library via the workspace protocol (`"@mbai460/photoapp-server": "*"`) so symlinks resolve and library churn does not require N-file PRs. Once both surfaces are submitted and accepted, bump the library to 1.0.0 and pin both consumers exactly. Until then, library changes ride in single-PR atomic commits.
- **CL9 — Mechanically pure extraction is the rule; bounded reconciliation is the only exception.** Behavioural changes are out of scope **except** where they are forced by extraction itself — the SQL-into-repositories refactor is the canonical example (Part 03 has SQL inlined in `services/photoapp.js`; the library has it in `repositories/`). Each forced reconciliation gets its own commit, its own `learnings/` entry, and a corresponding Part 03 test that asserts the pre-extraction observable behaviour is preserved. **If you find yourself "improving" code while extracting it, stop and split the work into a follow-up PR.**
- **CL10 — Collaboration-safety is a hard deliverable.** Lockfile merge driver, `.gitattributes` entry, branch-protection update, CI fan-out by workspace, lockfile-conflict troubleshooting in `CONTRIBUTING.md`. None of these are deferred.
- **CL11 — Doc-staleness prevention is a hard acceptance criterion.** Every onboarding-facing document touched by the workspace introduction is updated in this PR (see *Doc-Staleness Prevention Protocol* below). Acceptance includes a fresh-clone smoke test of the documented commands.
- **CL12 — Library-touching PRs are visibly tagged.** Every PR that modifies `lib/photoapp-server/` carries a `lib:photoapp-server` GitHub label. Reviewers are expected to think across consumers when they see the label. Set up the label in this workstream so the protocol exists from day one.

> **Optional Mermaid Visualization Step (strongly recommended — major architectural pivot)** — suggested file `visualizations/Target-State-mbai460-photoapp-server-lib-extraction-v1.md`
>
> Before kicking off Phase 1, render a `flowchart LR` of the **two-trees-becoming-one-library extraction** so the boundary between *shared* and *surface-specific* is explicit before any code moves.
>
> - **Story**: "Today: Part 03 owns the service core; Project 02 doesn't exist. Tomorrow: shared `@mbai460/photoapp-server` library; Part 03 is a consumer; Project 02 will become a consumer in 01-foundation Phase 0."
> - **Focus**: highlight the **library boundary** — the line between *shared internals* (services/repositories/middleware/schemas) and *surface-specific* (routes/controllers/integration tests) — in **red**. Highlight the **DI seams** (`createErrorMiddleware`, injected `pino` logger, repository factories) in **amber** because they are how the same library satisfies divergent surface needs.
> - **Shape vocab**: subgraph = tree (`Part 03 server (today)`, `Part 03 server (after)`, `lib/photoapp-server`, `Project 02 server (future)`); rounded rect = module; cylinder `[(...)]` = exported API; trapezoid = DI seam; diamond `{...}` = surface-specific decision (e.g., status-code mapping).
> - **Brevity**: module name only on rounded; subgraph titles carry the path.
> - **Direction**: `flowchart LR`, with the two surface trees on the outsides and the shared library in the middle so the extraction reads as fan-in.

---

## Phase 1: Workspace Bootstrap

### 1.1 Workspace root

**Files:**

- Create: `MBAi460-Group1/package.json` — workspace root, no source code, just the workspace manifest.
- Create: `MBAi460-Group1/.npmrc` — `package-lock=true`, `engine-strict=true`, `save-exact=true`.
- Extend: `MBAi460-Group1/.gitattributes` with `package-lock.json merge=union` (or wire the npm-merge-driver per CONTRIBUTING.md).

**Behavior:**

- `package.json` declares `{ "private": true, "workspaces": ["lib/*", "projects/project01/Part03", "projects/project02/server"] }`. The `projects/project02/server` entry is fine even though that directory does not exist yet — `npm install` tolerates missing workspace members and they pick up automatically when created.
- `.npmrc` ensures every contributor's local install matches CI behaviour (no auto-install of mismatched Node versions; lockfile required; exact versions saved on `npm install <pkg>`).

**Checklist:**

- [ ] `MBAi460-Group1/package.json` exists with the workspace declaration above.
- [ ] `MBAi460-Group1/.npmrc` exists with the three settings above.
- [ ] `MBAi460-Group1/.gitattributes` includes the lockfile merge directive.
- [ ] `npm install` from `MBAi460-Group1/` exits 0 and produces a single root `package-lock.json` (Part 03's existing lockfile is removed in Phase 3).

### 1.2 Library skeleton

**Files:**

- Create: `lib/photoapp-server/package.json` — `name: "@mbai460/photoapp-server"`, `version: "1.0.0"`, `main: "src/index.js"`, exports map for each subpath.
- Create: `lib/photoapp-server/jest.config.js`.
- Create: `lib/photoapp-server/README.md` (placeholder; populated in Phase 5).
- Create: `lib/photoapp-server/CHANGELOG.md` (`## 1.0.0 — extracted from projects/project01/Part03/server/`).
- Create: `lib/photoapp-server/src/index.js` — empty exports map (`module.exports = { config: null, services: null, ... }`); populated in Phase 2.

**Behavior:**

- The package is a sibling of the eventual Part 03 + Project 02 consumers. Workspace symlinks make `require('@mbai460/photoapp-server')` resolve from each consumer's `node_modules/`.

**Checklist:**

- [ ] Library package.json validates (`npm pkg get name version` returns the expected values).
- [ ] `npm install` from monorepo root creates `node_modules/@mbai460/photoapp-server` symlink in Part 03's tree.
- [ ] `node -e "console.log(require('@mbai460/photoapp-server'))"` from inside `projects/project01/Part03/` prints the placeholder exports map (proves the symlink works).

> **Optional Utility Step** — suggested artifact `utils/lib-symlink-check` (Bash) or `make doctor` (Makefile target)
>
> The "is my workspace install state sane?" question is about to come up every time someone rebuilds `node_modules`, switches branches, or hits a lockfile conflict. Wrapping the symlink check + library-require smoke into one command pays off the moment the second contributor asks "did your `npm install` produce a `lib/` symlink?".
>
> - **What it does**: from monorepo root, asserts (1) `lib/photoapp-server/package.json` exists, (2) `node_modules/@mbai460/photoapp-server` resolves from each consumer's directory, (3) `require('@mbai460/photoapp-server')` works inside each consumer, (4) the resolved version matches the workspace's library version. Exits non-zero with a hint on the first failure.
> - **Why now**: the symlink magic is *the* "did the workspace install correctly?" gate; without a one-shot check it gets diagnosed by sequence of `ls`, `cat`, and `node -e` invocations every time. Build once, paste into `CONTRIBUTING.md`'s troubleshooting section, done.
> - **Decision branches**: build now (recommended — Phase 4.1 onward will ask the same question repeatedly), queue (if you'd rather defer until Phase 5 doc refresh and bundle with `make freshclone-smoke`), skip (only if you're sure no teammate will ever hit a stale-symlink state).

---

## Phase 2: Extract the Service Core (mechanically pure)

> **Rule for this entire phase:** *git mv* the files; do not retype them. Update import paths only. If a file's content needs to change for any reason other than an import path, stop and read CL9 again — it's likely a reconciliation that belongs in Phase 3 with its own commit.

### 2.1 Move config + services + middleware + schemas

**Files (move with `git mv`):**

- `projects/project01/Part03/server/config.js` → `lib/photoapp-server/src/config.js`
- `projects/project01/Part03/server/services/aws.js` → `lib/photoapp-server/src/services/aws.js`
- `projects/project01/Part03/server/services/photoapp.js` → `lib/photoapp-server/src/services/photoapp.js`
- `projects/project01/Part03/server/middleware/error.js` → `lib/photoapp-server/src/middleware/error.js`
- `projects/project01/Part03/server/middleware/upload.js` → `lib/photoapp-server/src/middleware/upload.js`
- `projects/project01/Part03/server/schemas.js` → split into:
  - `lib/photoapp-server/src/schemas/envelopes.js` (`successResponse`, `errorResponse`)
  - `lib/photoapp-server/src/schemas/rows.js` (`userRowToObject`, `imageRowToObject`, `labelRowToObject`, `searchRowToObject`, `deriveKind`)

**Behavior:**

- Each moved file's `require()` statements update to library-internal relative paths (e.g., `services/photoapp.js`'s `require('./aws')` becomes `require('./aws')` — same relative path, just inside `lib/`).
- `middleware/error.js` becomes a factory: replace the existing direct export with `module.exports = function createErrorMiddleware({ statusCodeMap, errorShapeFor, logger }) { return (err, req, res, next) => { ... }; }`. The default `statusCodeMap` and `errorShapeFor` reproduce Part 03's current behaviour exactly so Part 03 callers can pass `createErrorMiddleware({})` and observe zero change. CL3 in action.
- `middleware/upload.js` similarly becomes a factory: `module.exports = function createUploadMiddleware({ destDir = '/tmp', sizeLimit = 100 * 1024 * 1024 } = {}) { return multer({ ... }); }`.

**Checklist:**

- [ ] All listed files are moved (verify with `git status`: shows renames, not delete + add).
- [ ] `lib/photoapp-server/src/index.js` exports each module.
- [ ] `cd projects/project01/Part03 && npm test` — **all tests still pass** (this is the regression baseline; the moves are pure and the factories produce Part 03's existing default behaviour).
- [ ] `git diff --stat HEAD~1` on the moves shows mostly rename headers with small intra-file edits to import paths and the two factory wrappers.

### 2.2 Move service-layer tests

**Files (move with `git mv`):**

- `projects/project01/Part03/server/tests/aws.test.js` → `lib/photoapp-server/tests/services/aws.test.js`
- `projects/project01/Part03/server/tests/photoapp_service.test.js` → `lib/photoapp-server/tests/services/photoapp.test.js`
- `projects/project01/Part03/server/tests/error.test.js` → `lib/photoapp-server/tests/middleware/error.test.js`
- `projects/project01/Part03/server/tests/upload.test.js` → `lib/photoapp-server/tests/middleware/upload.test.js`
- `projects/project01/Part03/server/tests/schemas.test.js` → split into `lib/photoapp-server/tests/schemas/envelopes.test.js` + `lib/photoapp-server/tests/schemas/rows.test.js`

**Stay in Part 03 (surface-specific):**

- `tests/app.test.js`, `tests/health.test.js`, `tests/static.test.js`, `tests/photoapp_routes.test.js`, `tests/integration_routes_error.test.js`, `tests/live_photoapp_integration.test.js` — these exercise the Part 03 wire contract.

**Behavior:**

- `error.test.js` now constructs middleware via `createErrorMiddleware(/* default Part 03 mapping */)` so the existing assertions remain valid. CL9 forbids tightening the assertions in this PR.

**Checklist:**

- [ ] All listed test files are moved.
- [ ] `cd lib/photoapp-server && npm test` — passes.
- [ ] `cd projects/project01/Part03 && npm test` — surface-specific tests pass.

> **Optional Test Step** — suggested file `lib/photoapp-server/tests/exports-shape.test.js`
>
> The library's public exports map is the contract that *both* surfaces consume. Right now there is one consumer; soon there will be two. A snapshot test of `Object.keys(require('@mbai460/photoapp-server'))` and the keys of each sub-export catches accidental rename / removal at the cheapest possible moment.
>
> - **What to lock down**: top-level keys (`config`, `services`, `repositories`, `middleware`, `schemas`); each sub-key (`services.aws`, `services.photoapp`, `middleware.createErrorMiddleware`, `middleware.createUploadMiddleware`, `schemas.envelopes.successResponse`, etc.). One `expect(api).toMatchSnapshot()` covers the whole surface.
> - **Why this catches bugs**: a refactor that accidentally drops `schemas.rows.deriveKind` from the exports map breaks Project 02's `controllers/v1/images.js` at *Project 02 boot time*, hours after the library PR merged. A snapshot test catches the rename in the library PR's CI.
> - **Decision branches**: build now (recommended — costs <10 lines, prevents a class of cross-consumer surprises), queue (if you'd rather author it alongside the library README in Phase 5), skip (only if you've committed to never refactoring the exports map, which you haven't).

> **Optional Utility Step** — suggested artifact `utils/no-service-leak`
>
> The library's whole point is that there is **one** copy of the service core. Within a week of this extraction, someone will instinctively `cp lib/photoapp-server/src/services/photoapp.js projects/project02/server/services/photoapp.js` "to debug something" and forget to delete it. A `git ls-files`-based check makes that mistake unmergeable.
>
> - **What it does**: scans `git ls-files projects/*/server/services/photoapp.js projects/*/server/services/aws.js projects/*/server/middleware/error.js projects/*/server/middleware/upload.js projects/*/server/schemas/envelopes.js projects/*/server/schemas/rows.js projects/*/server/repositories/`. Exits non-zero if any match. Pre-commit hook candidate.
> - **Why now**: the temptation is highest in the days *after* extraction, when the moves feel reversible. The check is 10 lines of bash and earns its keep the first time someone runs `git status` and sees `services/photoapp.js` re-appear in a Project 02 PR.
> - **Decision branches**: build now (recommended — pre-commit is the right shape and the cost is trivial), queue (if you want to bundle it with `utils/cred-sweep`-style scanners in a single pre-commit pass), skip (rely on code review — fine for a 2-person team, risky at 4+).

---

## Phase 3: Repository Layer (the one bounded reconciliation)

> **CL9 invocation:** This is the only behaviour-affecting refactor in Phase −1. Part 03's `services/photoapp.js` has SQL inlined; the library wants SQL in `repositories/`. The reconciliation is *forced by extraction*: the library's `services/photoapp.js` cannot meaningfully be reused if every caller has to reach inside it for SQL. Acceptance: Part 03's existing tests stay green throughout.

### 3.1 Extract SQL into repositories

**Files:**

- Create: `lib/photoapp-server/src/repositories/users.js` — `findById(conn, userid)`, `findAll(conn)`.
- Create: `lib/photoapp-server/src/repositories/assets.js` — `findById(conn, assetid)`, `findByUserId(conn, userid)`, `findAll(conn)`, `insert(conn, row)`, `deleteAll(conn)`, `selectAllBucketkeys(conn)`.
- Create: `lib/photoapp-server/src/repositories/labels.js` — `findByAssetId(conn, assetid)`, `findByLabelLike(conn, label)`, `insertMany(conn, rows)`, `deleteAll(conn)`.

**Behavior:**

- Each repository function is a single SQL statement plus row mapping (using `lib/photoapp-server/src/schemas/rows.js`). They take a connection (or pool) parameter; they do not catch errors.
- `lib/photoapp-server/src/services/photoapp.js` is updated to call the repositories instead of running SQL directly.
- The SQL strings, parameter binding, and ordering must remain byte-identical to Part 03's pre-extraction behaviour. Where Part 03 ordered by `userid ASC`, the repository orders by `userid ASC`. No reordering, no column changes, no alias renames.

**Checklist:**

- [ ] Three repository files exist with the listed exports.
- [ ] `lib/photoapp-server/tests/repositories/{users,assets,labels}.test.js` exist (move + adapt the SQL-touching subset of `photoapp_service.test.js`'s assertions; new file is OK if cleaner).
- [ ] `cd projects/project01/Part03 && npm test` — **all tests still pass**, including `tests/photoapp_routes.test.js` and `tests/integration_routes_error.test.js`. **This is the canary.** If they fail, Phase 3 has introduced a behaviour difference and must roll back.
- [ ] `cd lib/photoapp-server && npm test` — passes.
- [ ] Part 03's `live_photoapp_integration.test.js` (`PHOTOAPP_RUN_LIVE_TESTS=1`) — passes against real AWS. **Manual gate; do not skip.** A successful live-test run is the strongest signal that the extraction is mechanically pure.

### 3.2 Reconciliation log

**Files:**

- Create: `learnings/2026-XX-XX-photoapp-server-extraction.md`.

**Content:**

- Each behavioural difference between pre- and post-extraction Part 03, even ones that should be invisible (e.g., "row mapping moved from inline to `rows.js`; same output for all unit-tested inputs").
- For each: (a) what changed, (b) why it changed (CL9 reasoning), (c) which test asserts the pre-extraction behaviour is preserved, (d) the live-test result.

> **Optional Test Step** — suggested file `lib/photoapp-server/tests/repositories/sql-characterization.test.js`
>
> CL9 says the SQL into the repositories must be byte-identical to Part 03's pre-extraction inline SQL. The library's existing service-layer tests assert *outputs*; this test asserts the *queries themselves* (string match against the SQL Part 03 used to issue) so a future "let me clean up this SQL" refactor breaks loudly instead of silently.
>
> - **What to lock down**: each repository function's literal SQL string (or a normalized form), the parameter binding order (positional `?` count + order), and the `ORDER BY` clause. Capture by intercepting `pool.execute` calls in a fake `mysql2` and snapshotting the `[sql, params]` tuple per scenario.
> - **Why this catches bugs**: silently changing `ORDER BY userid ASC` to `ORDER BY userid` breaks no unit test (returns the same rows in the seeded fixture) but breaks the Gradescope contract on the unseeded grading database. Gradescope grading is the only signal — too late.
> - **Decision branches**: build now (recommended — characterization tests are highest-value at extraction moment because the "before" behaviour is right there in `git log -p`), queue (if you'd rather defer until the live regression catches the first drift; risky), skip (only if you have an external contract test that already exercises the SQL via real DB).

> **Optional Utility Step** — suggested artifact `utils/run-extraction-canary`
>
> Phase 3's acceptance gate runs `cd projects/project01/Part03 && npm test` repeatedly as the canary. Wrapping that into a single command (with the live-regression flag toggle) saves keystrokes during the inevitable 2–3 iterations of "extract, test, find a discrepancy, fix, re-test."
>
> - **What it does**: runs Part 03's full suite (unit + integration), then optionally the live regression with `PHOTOAPP_RUN_LIVE_TESTS=1` if `--live` is passed. Prints a clean PASS/FAIL header so the canary state is visible at a glance.
> - **Why now**: Phase 3 is the only phase where the canary will run 5+ times in an hour. After Phase 3, it runs occasionally; the wrapper's marginal value drops.
> - **Decision branches**: build now (recommended only if you anticipate 3+ iterations on the SQL extraction), queue (defer until Phase 6 acceptance if Phase 3 lands clean on the first try), skip (fine — `cd projects/project01/Part03 && npm test` is short enough).

---

## Phase 4: Update Part 03 to Consume the Library

### 4.1 Update Part 03's source

**Files:**

- Update: `projects/project01/Part03/server/app.js` — replace `require('./services/aws')` with `require('@mbai460/photoapp-server').services.aws`; replace `require('./middleware/error')` with `const { createErrorMiddleware } = require('@mbai460/photoapp-server').middleware; app.use(createErrorMiddleware({ /* Part 03 default mapping */ }))`; analogous for upload, schemas.
- Update: `projects/project01/Part03/server/routes/photoapp_routes.js` — imports services from the library; calls `successResponse({ data })` (or whatever shape Part 03 uses) from the library's envelope module.
- Update: `projects/project01/Part03/server/package.json` — remove deps now provided transitively by the library (`mysql2`, AWS SDK packages, `multer`, `ini`, `p-retry`, `pino` if Part 03 ever added it); add `"@mbai460/photoapp-server": "*"` (workspace protocol per CL8).
- Delete: `projects/project01/Part03/server/config.js`, `services/`, `middleware/`, `schemas.js` (now in lib).
- Delete: `projects/project01/Part03/package-lock.json` (replaced by root lockfile).

### 4.2 Update Part 03's Dockerfile

**Files:**

- Update: `projects/project01/Part03/Dockerfile`.

**Behavior:**

- Workspace-aware copy pattern. Before `npm ci`, copy: root `package.json` + `package-lock.json` + `.npmrc`, then each workspace's `package.json` (preserving directory structure). Then run `npm ci --workspace=projects/project01/Part03 --include-workspace-root --omit=dev` (production install, lib included as a workspace dep). Then `COPY` the source.
- Reference the npm workspaces Docker pattern docs verbatim. Add an inline comment pointing to them.

**Checklist:**

- [ ] `docker build` succeeds on Part 03's Dockerfile from the monorepo root.
- [ ] `docker run` boots; `curl http://localhost:8080/api/ping` returns the same JSON it did pre-extraction.

### 4.3 Update Part 03's Gradescope packaging

**Files:**

- Update (or create): `projects/project01/Part03/tools/package-submission.sh`.

**Behavior:**

- The Gradescope submission tarball must be self-contained — Gradescope cannot resolve `@mbai460/photoapp-server` from npm. The packaging script inlines the library: copies `lib/photoapp-server/src/` into a temp `node_modules/@mbai460/photoapp-server/` inside the staged tarball, rewrites `package.json` to remove the workspace dep, and asserts the resulting tarball passes Part 03's contract suite before invoking `gs submit` (when applicable).
- Add a `tools/__tests__/package-submission.test.sh` that builds the tarball, extracts it to a temp dir, runs `node -e "require('@mbai460/photoapp-server')"`, and asserts the require resolves.

**Checklist:**

- [ ] Packaging script produces a tarball with the inlined library.
- [ ] Tarball extracts cleanly and `require('@mbai460/photoapp-server')` resolves inside the extracted tree.
- [ ] If Part 03 needs to be re-submitted to Canvas (it is already accepted; this is a Gradescope contingency only), the inlined tarball passes Gradescope at the same score it did originally.

### 4.4 Smoke-test Part 03 end-to-end

**Checklist:**

- [ ] `cd projects/project01/Part03 && npm test` — passes from inside the workspace.
- [ ] `cd MBAi460-Group1 && npm test --workspaces` — passes (runs every workspace's tests).
- [ ] `docker compose up` (if Part 03 has compose; otherwise the equivalent boot) — the Part 03 server boots and serves.
- [ ] Part 03 live regression (`PHOTOAPP_RUN_LIVE_TESTS=1 npm test`) passes against real AWS — same green as pre-extraction.

---

## Phase 5: Doc-Staleness Prevention Protocol

> **Hard acceptance criterion (CL11).** This phase is *part of the same PR* as Phases 1–4. Onboarding documentation that was correct yesterday is incorrect today; closing the gap is non-optional.

### 5.1 The Doc-Staleness Prevention Protocol (codify the convention)

**Files:**

- Create: `MBAi460-Group1/CONTRIBUTING.md` (if it doesn't exist) — onboarding-facing.
- Create: `MBAi460-Group1/MetaFiles/DOC-FRESHNESS.md` — the canonical convention this protocol establishes.

**Content of `MetaFiles/DOC-FRESHNESS.md`:**

> Documentation that walks a contributor through *running, building, testing, or contributing* is **onboarding-facing**. Onboarding-facing documentation has the same status as production code: a PR cannot be merged if it makes onboarding-facing docs incorrect.
>
> **The protocol:**
>
> 1. **Inventory.** The following files are onboarding-facing today: `MBAi460-Group1/README.md`, `MBAi460-Group1/QUICKSTART.md` (or `MetaFiles/QUICKSTART.md`), `MBAi460-Group1/CONTRIBUTING.md`, every `projects/<project>/README.md`, every `lib/<lib>/README.md`, `infra/README.md`, `utils/README.md`, `docker/README.md`. The list is maintained in `MetaFiles/DOC-FRESHNESS.md` (this file). When a new onboarding-facing doc is added, append it here.
>
> 2. **Classification per PR.** A PR is *onboarding-affecting* if it changes any of:
>    - the install command (`npm install`, `pip install`, `terraform init`, etc.);
>    - the directory layout a contributor navigates (project structure, workspace topology);
>    - the development loop (test command, build command, dev-server command);
>    - the env vars a contributor must set;
>    - the local-dev infra (docker-compose, mysql port, env-file conventions);
>    - any tool added or removed from a contributor's day-to-day path;
>    - any IAM, AWS, or secrets-handling step a contributor performs.
>
> 3. **Update obligation.** Onboarding-affecting PRs **must** update the matching docs in the same PR. The PR template asks the question explicitly. Reviewers are expected to verify by reading the docs against the diff.
>
> 4. **Verification.** Major onboarding-affecting PRs (workspace introduction, new image, new tool) carry a fresh-clone smoke-test in their acceptance section: a clean clone + the exact documented commands lands at green tests. The smoke test belongs in the PR description so a reviewer can re-run it.
>
> 5. **Per-phase touchpoints.** Workstream Approach docs (`*/MetaFiles/Approach/*.md`) end each phase with a *Documentation touchpoint* item that names the specific docs to refresh based on what that phase changed.

**Checklist:**

- [ ] `MetaFiles/DOC-FRESHNESS.md` exists with the protocol above.
- [ ] `CONTRIBUTING.md` summarises the protocol and links to `MetaFiles/DOC-FRESHNESS.md` for the full text.
- [ ] PR template (`.github/pull_request_template.md`) includes a checkbox: *"Onboarding-affecting? If yes, READMEs / QUICKSTART / CONTRIBUTING updated and verified by fresh-clone walkthrough."*

### 5.2 Refresh root-level docs

**Files:**

- Update: `MBAi460-Group1/README.md` — add a *"Repository Structure"* section pointing at `lib/`, `projects/`, `infra/`, `utils/`. Add a *"Quickstart"* paragraph that says: clone, `npm install` from the root, then navigate into the project of interest. Link to `QUICKSTART.md` and `CONTRIBUTING.md`.
- Update: `MBAi460-Group1/MetaFiles/QUICKSTART.md` — first-run path for a new contributor: prerequisites (Node 24, Python 3.11, Docker, AWS CLI, Terraform), `git clone`, `npm install` (root!), navigate into Part 03, `npm test`. Add a "Working with the shared library" subsection explaining workspace symlinks, where the library lives, and how a typical change ripples (edit lib code → consumers see it via symlink → no `npm install` needed unless `package.json` changed).

**Checklist:**

- [ ] Root `README.md` updated.
- [ ] `MetaFiles/QUICKSTART.md` updated with workspace-aware install flow.
- [ ] Both files reference each other and `CONTRIBUTING.md`.

### 5.3 Author `CONTRIBUTING.md` (collaboration-safety scaffolding)

**Files:**

- Create or extend: `MBAi460-Group1/CONTRIBUTING.md`.

**Content:**

- *Workspace etiquette*: where to `npm install <pkg>` (almost always inside a workspace, rarely at root); how the symlinks work; what "the lockfile" means now (single root `package-lock.json`).
- *Lockfile conflicts*: install `npm-merge-driver` once (`npx npm-merge-driver install --global`); rebase strategy when two PRs both touched dependencies; the "rebuild the lockfile" fixup (`rm -rf node_modules package-lock.json && npm install`).
- *Library change protocol* (CL12): if your PR touches `lib/photoapp-server/`, add the `lib:photoapp-server` GitHub label, mention all consumers in the description, and confirm both consumers' tests pass in the PR's CI matrix.
- *Doc-freshness link*: pointer to `MetaFiles/DOC-FRESHNESS.md` and the PR template checkbox.
- *"It works locally but not in CI" troubleshooting*: phantom-dep symptom + `rm -rf node_modules && npm ci` fix.
- *Conventional Commits*: scopes added (`lib:photoapp-server`, `chore:workspace`).

**Checklist:**

- [ ] `CONTRIBUTING.md` exists and covers each section above.
- [ ] Linked from root `README.md`, `QUICKSTART.md`, `MetaFiles/DOC-FRESHNESS.md`, and PR template.

### 5.4 Update Part 03's docs

**Files:**

- Update: `projects/project01/Part03/README.md` — add a paragraph: *"This server consumes the shared library `@mbai460/photoapp-server` (see `lib/photoapp-server/README.md`). The library owns services, repositories, middleware, and schemas; this tree owns the `/api/*` route layer and surface-specific tests."* Update the *"Run locally"* section to reference workspace install (`npm install` from monorepo root, then `npm test` from this dir).
- Append footnote in `projects/project01/Part03/MetaFiles/Approach/02-server-foundation.md`: *"Service core extracted to `@mbai460/photoapp-server` on YYYY-MM-DD; see `projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`."*
- Append footnote in `projects/project01/Part03/MetaFiles/Approach/03-api-routes.md`: same.
- Append entry in `projects/project01/Part03/MetaFiles/refactor-log.md`: file-by-file move map, behavioural reconciliations from Phase 3, test-suite confirmation, live-regression result.

**Checklist:**

- [ ] All four files updated.
- [ ] The footnotes link **forward** to this file and **backward** from this file (cross-reference is bidirectional).

### 5.5 Author `lib/photoapp-server/README.md`

**Files:**

- Create: `lib/photoapp-server/README.md`.

**Content:**

- *Purpose*: shared service core for the PhotoApp web service surfaces.
- *Public exports*: list every exported module with a one-line description and a code snippet for the most common usage.
- *DI seams*: explicit list of factory functions and their config options. Example:
  ```js
  const { middleware } = require('@mbai460/photoapp-server');
  app.use(middleware.createErrorMiddleware({
    statusCodeMap: (err, req) => req.baseUrl.startsWith('/v2') && err.code === 'NOT_FOUND' ? 404 : 400,
    errorShapeFor: (req) => res.locals.errorShape || { message: 'error' },
    logger: pinoInstance,
  }));
  ```
- *Version policy*: pre-1.0.0 floats via workspace protocol; post-1.0.0 strict pinning per CL8.
- *Test commands*: `cd lib/photoapp-server && npm test`.
- *How to add a new export*: one-paragraph guide for contributors who need to extend the library.

**Checklist:**

- [ ] `lib/photoapp-server/README.md` exists with each section above.
- [ ] Linked from root README and from each consumer's README.

### 5.6 Update PR template

**Files:**

- Create or update: `.github/pull_request_template.md`.

**Content:**

```markdown
## What changed

<one-paragraph summary>

## Onboarding-facing impact

- [ ] No onboarding-facing change.
- [ ] Onboarding-facing change. Updated docs:
  - [ ] `README.md`
  - [ ] `QUICKSTART.md` / `MetaFiles/QUICKSTART.md`
  - [ ] `CONTRIBUTING.md`
  - [ ] `projects/<X>/README.md`
  - [ ] `lib/<Y>/README.md`
  - [ ] Other: <name>
- [ ] Performed a fresh-clone walkthrough of the documented commands and confirmed green tests.

## Library-touching?

- [ ] No.
- [ ] Yes — added `lib:photoapp-server` label; confirmed both consumers' tests pass.

## Test plan

<commands the reviewer can run to verify>
```

**Checklist:**

- [ ] PR template exists and is enforced for new PRs.
- [ ] The first PR opened after Phase −1 (the Phase −1 PR itself) demonstrates the template by example.

### 5.7 Establish `MetaFiles/TODO.md` (the deferred-decisions queue)

> **Why this is mandatory, not optional.** The Approach docs reference `MetaFiles/TODO.md` repeatedly as the receptacle for "queue rather than skip" decisions on Optional Test / Utility / Visualization Steps. If the queue doesn't exist, every "queue" decision points into the void and decays into a "skip" by accident. This sub-phase makes the queue a real artifact with a real schema before any workstream needs to use it.

**Files:**

- Create: `MBAi460-Group1/MetaFiles/TODO.md`.

**Schema (verbatim — copy this into the file):**

```markdown
# Deferred Optional Steps

Queue of Optional Test / Utility / Visualization Steps deferred from the Approach docs (see `MetaFiles/Approach/00-overview-and-conventions.md` § Optional Steps Convention). One row per deferred step; promote to `## Resolved` (with the resolving commit SHA) when built or formally retired.

## Format

- **Provenance** — `<workstream-doc>:<phase|task>` (e.g., `02-web-service.md:Phase 1`)
- **Type** — `Test` | `Utility` | `Visualization`
- **Suggested artifact** — file path, tool name, or visualization filename, verbatim from the callout
- **Decision date** — ISO date when "queue" was chosen (so stale entries are visible)
- **One-sentence intent** — verbatim from the callout's "What it does" / "What to lock down"
- **Trigger to revisit** — what event would make this worth promoting from queue to build (e.g., "second contributor onboards", "third repetition of this command sequence", "first live regression failure")

## Open

- [ ] **`<workstream>:<phase>`** — `<Type>` | `<artifact>` | `<YYYY-MM-DD>` | `<intent>` | _Trigger: <event>_

## Resolved

- [x] **`<workstream>:<phase>`** — `<Type>` | `<artifact>` | `<YYYY-MM-DD>` | resolved by `<commit-sha>` (`<commit-subject>`)

## Retired (built consideration; decided not to pursue)

- [ ] **`<workstream>:<phase>`** — `<Type>` | `<artifact>` | `<YYYY-MM-DD>` | retired: `<one-sentence reason>` (e.g., "covered by external tool X", "scope changed", "convention now enforced by lint rule")

## Grooming

Re-read this file at the start of every workstream (it is listed as a Documentation touchpoint in each Approach doc). Promote anything whose Trigger fired; retire anything whose context evaporated. Stale entries (>90 days, no Trigger movement) are reviewed at workstream-acceptance time.
```

**Checklist:**

- [ ] `MetaFiles/TODO.md` exists with the schema above.
- [ ] `MetaFiles/DOC-FRESHNESS.md` lists `MetaFiles/TODO.md` as an *internal-process* doc (not onboarding-facing — it's for executors, not new contributors) so it's tracked but not part of the fresh-clone smoke test.
- [ ] `00-overview-and-conventions.md` § Optional Steps Convention links to this file.

---

## Phase 6: Acceptance

### 6.1 Verification commands (run in this order)

- [ ] `cd MBAi460-Group1 && rm -rf node_modules && npm install` — clean install from a fresh state succeeds.
- [ ] `npm test --workspaces` — every workspace's tests green.
- [ ] `cd projects/project01/Part03 && npm test` — Part 03 tests green from inside the workspace.
- [ ] `cd lib/photoapp-server && npm test` — library tests green.
- [ ] `cd projects/project01/Part03 && PHOTOAPP_RUN_LIVE_TESTS=1 npm test` — live regression green against real AWS.
- [ ] `docker build -t mbai460-server-test projects/project01/Part03/` — image builds with the workspace-aware Dockerfile.
- [ ] `utils/cred-sweep` — no secrets staged.
- [ ] `utils/smoke-test-aws` — environment intact.

### 6.2 Fresh-clone smoke test (CL11 enforcement)

The single test that proves the docs are correct: a teammate (or the author, in a fresh checkout) runs the documented commands from `README.md` + `QUICKSTART.md` and reaches green tests without folklore intervention.

- [ ] `git clone <repo>` to a clean directory.
- [ ] Follow `README.md` "Quickstart" verbatim → green tests on `cd projects/project01/Part03 && npm test`.
- [ ] Document any "wait, that didn't work" friction in `MetaFiles/QUICKSTART.md` and re-run until friction is zero.

> **Optional Utility Step** — suggested artifact `utils/freshclone-smoke` (Bash) or `make freshclone-smoke` (Makefile target)
>
> Section 6.2 above is a manual sequence ("clone, follow README, see if it works"). The CL11 doc-staleness protocol asks for this gate on **every onboarding-affecting PR**, not just Phase −1. Wrapping the manual sequence into a script makes the gate cheap enough to actually run.
>
> - **What it does**: clones the current branch into a tmp dir, runs the *exact* commands quoted in `README.md` Quickstart (parsed via heredoc-marker comments in the README, or just hardcoded once and re-checked when the README changes), reports any non-zero exit. Tears down the tmp dir on success.
> - **Why now**: this is the *one* tool that makes CL11 self-enforcing. Without it, "fresh-clone smoke" is folklore that decays. With it, every PR with the onboarding-affecting box checked runs `make freshclone-smoke` locally and pastes the output in the PR description.
> - **Decision branches**: build now (recommended — Phase −1 is the *one* PR that has all the onboarding context fresh; capturing it here is much cheaper than trying to reconstruct the right command sequence two PRs later), queue (acceptable if you'd rather author the full version after the first onboarding-affecting follow-up PR runs into friction), skip (CL11 will erode without it; only viable if you ship CI-side fresh-clone in `Future-State-cicd.md` immediately).

### 6.3 Branch-protection update (collaboration-safety)

- [ ] Required status checks updated in GitHub branch protection: `test (lib/photoapp-server)` and `test (projects/project01/Part03)` are both required (path-filtered job matrix wired in `Future-State-cicd.md` Phase 1; the skeleton ships with this PR).
- [ ] `lib:photoapp-server` GitHub label created.

### 6.4 Communication wrap-up

- [ ] Comment-and-close the announcement issue from *Pre-flight Communication*. Include the rebase one-liner for any teammate who was blocked.
- [ ] Tag the merge commit `library-1.0.0-extraction-complete` for the retrospective.

---

## Suggested Commit Points

Each commit is a clean, reviewable atomic step. The full sequence is one PR; commits are for narrative clarity.

1. `chore(monorepo): introduce npm workspaces with lib/photoapp-server skeleton` (Phase 1)
2. `refactor(part03): extract config/services/middleware/schemas into @mbai460/photoapp-server (mechanical move)` (Phase 2)
3. `refactor(part03): extract SQL into lib/photoapp-server/repositories (CL9 reconciliation)` (Phase 3)
4. `refactor(part03): consume @mbai460/photoapp-server` (Phase 4.1)
5. `chore(part03): workspace-aware Dockerfile + Gradescope packaging` (Phase 4.2 + 4.3)
6. `docs(monorepo): doc-staleness prevention protocol + workspace-aware READMEs/QUICKSTART/CONTRIBUTING` (Phase 5.1–5.6)
7. `docs(monorepo): MetaFiles/TODO.md schema for deferred Optional Steps queue` (Phase 5.7)
8. `chore(monorepo): library-1.0.0 extraction acceptance green` (Phase 6)

## Risks And Mitigations

- **Risk:** A subtle service-layer bug surfaces because Part 03's `getDbConn()` was per-request and the library path moves it through a different call shape.
  - **Mitigation:** CL9 + Phase 3 explicitly bound this. Part 03's existing test suite (unit + integration + live) is the canary. If they fail, roll back; if they pass, the move is mechanically pure. **If the suite passes a broken refactor, the suite was inadequate — that is itself something we want to know and fix in a follow-up.**
- **Risk:** Lockfile contention on subsequent PRs after workspace adoption.
  - **Mitigation:** CL10. `.gitattributes` merge directive + `npm-merge-driver` documented in `CONTRIBUTING.md` + the documented "rebuild the lockfile" fallback.
- **Risk:** A contributor `cd`s into `lib/photoapp-server/` and runs `npm install <pkg>`, accidentally promoting a dep to the library that should have been in a consumer.
  - **Mitigation:** `CONTRIBUTING.md` explicitly addresses this. Code review is the safety net (`npm-debug.log` and `package.json` diffs are in the PR).
- **Risk:** Gradescope submission breaks because the autograder cannot resolve workspace-protocol dependencies.
  - **Mitigation:** Phase 4.3 — packaging script inlines the library into the tarball. Asserted by `tools/__tests__/package-submission.test.sh`.
- **Risk:** Library-touching PRs feel large and reviewers approve without thinking across consumers.
  - **Mitigation:** CL12 — `lib:photoapp-server` label is the visual cue. PR template asks the question.
- **Risk:** Phase −1 lands during a teammate's in-flight Part 03 work and creates merge pain.
  - **Mitigation:** *Pre-flight Communication* checklist gates the merge on confirmed-clear in-flight state. The rebase one-liner is published before merge.
- **Risk:** Doc updates in Phase 5 drift before the PR merges (someone changes a Dockerfile after the README was written).
  - **Mitigation:** Phase 6.2 fresh-clone smoke test re-validates immediately before merge. CL11 makes this a hard gate.

---

## Footnote: Why This Used to Be "Future State"

The original Project 02 plan deferred this workstream to "after both Part 03 and Project 02 ship." That deferral failed a pressure test on three counts:

1. **It accepted known debt under the banner of risk avoidance.** The "port + adapt" plan codified parallel divergence in two trees. The cost of that divergence — bugs fixed twice, drift invisible until tests flake, "are these still in sync?" review questions — accrues every day both trees coexist. Library-first eliminates the surface area; library-later only minimizes it.
2. **The library design was already done.** CL1–CL8 had been finalized. Deferring execution of designed work is the worst kind of debt: known, designed, and still postponed.
3. **The "one cohesive project" principle requires it.** The user's framing of the monorepo as one cohesive project is incompatible with maintaining two parallel internal implementations. Cohesion is a property of the codebase or it isn't.

The pressure test also surfaced collaboration-safety concerns that did not exist in the dual-tree plan (lockfile contention, library-PR cognitive cost, branch-protection update) and onboarding-doc concerns that the dual-tree plan ignored entirely. Both are addressed as hard deliverables in this workstream (CL10 + CL11). The result is a more honest plan: the costs are visible, the mitigations are concrete, and the wins are recurring rather than future.

For the related future-state context, see:

- `MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md` — long-term lab vision.
- `projects/project02/client/MetaFiles/Approach/Future-State-cicd.md` — CI/CD workstream that benefits from a single library to test and a single lockfile to cache.
