# Project 02 — Refactor Log

> Durable record of major refactor / quest events at the Project 02 level.
> Pairs with the per-quest Orientation Maps at `projects/project02/`:
> `MergeOrientationMap.md` (current), `legacy_PlanningOrientationMap.md` (frozen).
>
> **Pattern:** date-headed entries; each captures *what we set out to do*,
> *who's involved*, and *what state we entered from* — the durable "this
> is what happened" record alongside the Map's "this is current state".
>
> **Predecessor file (Phase 0 + planning era):** Phase 0 closeout entry
> lives in `projects/project01/Part03/MetaFiles/refactor-log.md` 2026-05-02
> (because Phase 0 was Part 03 → library extraction; the closeout
> reasonably lives in the source surface's log). Future Project-02-level
> entries land here.

---

## 2026-05-04 — Catch-and-Merge Quest Pickup

Catch-and-Merge quest declared 2026-05-04 to reconcile two collaborator
branches into `main` after Phase 0 (Library Extraction) closed and was
merged + tagged `library-1.0.0-extraction-complete` (commit `d2e039c`).

### What's beginning

Reconcile two branches that **both branched from `d2e039c`** and executed
in parallel:

| Branch | Tip | Author | Scope claimed |
|---|---|---|---|
| `feat/p02-foundation` | `685b501` | **pranavvaranasi1254** (Pranav Varanasi) | 7 commits, 91 files (+7261/-582) — full Phase 1 Foundation + 8 routes; lib-consumer wiring; full test pyramid; Terraform modules; LocalStack bootstrap |
| `feat/p02-gradescope-mvp` | `e3d9a58` | **andrew-apple** (Andrew Apple) | 7 commits, 10 files (+400/-160) — surgical PDF-spec route corrections on instructor-baseline `api_*.js`; Python client + tests aligned to PDF-conformant server |

The two collaborators **knew about each other but did not coordinate
scope** (per Erik 2026-05-04). Both started from the same `d2e039c` baseline.
Branch A (Pranav) interpreted the Phase 1 + 2 Approach as authoritative
and built the foundation per spec; Branch B (Andrew) operated on the
existing instructor baseline and prioritized PDF-spec wire correctness
over Approach sequencing. Architecturally divergent, not just
content-divergent.

### Quest scope

Reconcile the two branches into a clean `main` per the team's
direct-to-main flow (no PRs yet at this VCS maturity). Produce **four
durable review artifacts** at `projects/project02/client/MetaFiles/code-reviews/`:

1. `2026-05-04-feat-p02-foundation-review.md` — per-branch review of Pranav's work
2. `2026-05-04-feat-p02-gradescope-mvp-review.md` — per-branch review of Andrew's work
3. `2026-05-04-merge-comparison.md` — branch-vs-branch comparison
4. `2026-05-04-process-retrospective.md` — process retro on parallel-collaboration

### Inputs

- **Predecessor Map:** `projects/project02/legacy_PlanningOrientationMap.md` (frozen)
- **Active Map:** `projects/project02/MergeOrientationMap.md` (declared 2026-05-04)
- **Plan:** `projects/project02/client/MetaFiles/Approach/Plan.md` (parent-quest spec spanning Phases 0–4)
- **Approach:** `projects/project02/client/MetaFiles/Approach/{01-foundation,02-web-service,03-client-api,04-engineering-surface}.md`
- **Assessment criteria:** `projects/project02/client/MetaFiles/code-reviews/00-assessment-criteria.md` (drafted 2026-05-04; Step 1 of the quest)

### State at quest open (2026-05-04 pre-flight)

Step 0 verified ground truth before any forward execution:

- ✅ `main` @ `d2e039c` with tag `library-1.0.0-extraction-complete` intact
- ✅ Working tree clean, attached HEAD
- ✅ Both collaborator branches discoverable post Erik fetch (`git fetch` — agent's SSH sandbox can't reach origin, but local refs picked up his fetch)
- ✅ Three guaranteed merge conflicts catalogued: `package-lock.json`, `projects/project02/server/app.js`, `projects/project02/server/package.json`
- ✅ Docker dev environment operational (`utils/lab-status` PASS)
- ✅ `utils/freshclone-smoke` against `main` PASS in ~3-4s — base is stable; Phase 0 work survives a true zero-state install
- 🟡 AWS lab spun-down (`utils/smoke-test-aws --mode live` 3/10) — **Step 4 sub-frame trigger**; not blocking now; will resolve via `utils/lab-up` when Step 4 entered

### Branch + working location

Working directly on `main` for this quest. No `feat/catch-and-merge` branch — per current team VCS maturity (direct-to-main; fetch / merge / conflict / push). The strategy choice in Step 2c may revise this (e.g., the integration-branch pattern would create a temporary `merge/collab-reconciliation` branch as a safe staging surface; documented inside the quest if invoked).

### Quest acceptance gate

All 11 sub-phases ✅ in the MergeOrientationMap progress checklist:
1. Pre-flight ✅
2. Assessment scaffolding (criteria file + Erik checkpoint)
3. Assess branches (2a parallel audits / 2b comparison / 2c strategy pick)
4. Execute merge sequence
5. End-to-end verification (lab spin-up sub-frame if needed)
6. Reconcile trackers with reality
7. Write review deliverables (4 artifacts under code-reviews/)
8. Push-readiness checks
9. Push to main (team's direct-to-main flow)
10. Send notes to collaborators
11. Close the catch-and-merge quest
   — 12. Select next execution (conditional on Step 5 findings; likely Phase 2 or finish-Phase-1)

### Cross-references

- **Map:** `projects/project02/MergeOrientationMap.md` (active state; atomic substep updates)
- **Criteria:** `projects/project02/client/MetaFiles/code-reviews/00-assessment-criteria.md` (assessment contract)
- **Plan:** `projects/project02/client/MetaFiles/Approach/Plan.md` § Master Tracker (parent-quest)
- **Phase 0 closeout:** `projects/project01/Part03/MetaFiles/refactor-log.md` § 2026-05-02 closeout (predecessor quest's record)

---

## 2026-05-04 — Catch-and-Merge Quest Progress (Chunks 1-5 + Chunk 6 partial)

Catch-and-Merge quest opened 2026-05-04 (entry above). Steps 0-2 closed across 4 commits + verification gate. Step 3 (execute merge sequence) Chunks 1-5 closed autonomously between Erik checkpoints; Chunk 6 (full E2E with lab spin-up) pinned mid-flight when Erik stepped away.

### What landed on `merge/collab-reconciliation`

**Foundation (Chunk 1 — code-only cherry-picks from pranavvaranasi1254's `feat/p02-foundation`, commits e6923d3..2e88078):**

- `projects/project02/server/{package.json, jest.config.js, .nvmrc, .editorconfig, .gitignore, .prettierrc, .prettierignore, eslint.config.js, commitlint.config.cjs, README.md}` — workspace consumer scaffold + Phase 1.9 tooling
- `projects/project02/server/{app.js, server.js}` — Express skeleton + SIGTERM closePool
- `projects/project02/server/middleware/{request_id, logging, errors, error_config, validate}.js` — full middleware suite consuming lib factory
- `projects/project02/server/observability/{pino, tracing}.js`
- `projects/project02/server/services/{pool, breakers}.js` — mysql2 pool + opossum breakers
- `projects/project02/server/schemas/request_schemas.js` — zod placeholder
- `projects/project02/server/routes/_internal/readyz.js` — RDS + S3 readiness probe
- `projects/project02/server/tests/{unit,integration,contract,smoke,happy_path,live}/` — full 6-layer pyramid (15 suites; 64 passed + 13 skipped placeholders at Foundation tip)
- `projects/project02/api/openapi.yaml` — OpenAPI 3.1 spec (383 lines, 8 routes documented; **schemas adjusted to lib reality 2026-05-04 commit `bb19b21`**)
- `projects/project02/{Makefile, docker-compose.yml, infra/{modules,envs/{dev,prod},migrations}/...}` — orchestration + Terraform module refactor
- `projects/project02/server/Dockerfile` + `projects/project02/tools/bootstrap-localstack.sh`
- Lib CL9: `lib/photoapp-server/src/schemas/envelopes.js` variadic `successResponse({...extras})` + Part 03 callsite updates (`projects/project01/Part03/server/routes/photoapp_routes.js`); lib went 99 → 104 tests
- `MetaFiles/QUICKSTART.md` "Working on Project 02" subsection (CL11)
- `visualizations/Target-State-project02-foundation-consumer-bootstrap-v1.md`
- `projects/project02/server/_assignment-template/{api_*.js, app.js, config.js, helper.js, README.md}` — instructor baseline preserved as wire-contract reference

**Skipped (Chunk 2): pranavvaranasi1254's `685b501`** — verified main-context as a byte-identical baseline-restore of `api_*.js` mislabeled "implement"; replaced by Chunk 3's port from Branch B.

**Chunk 3 — port Branch B's PDF-spec-correct route handlers into A's structure:**

- `projects/project02/server/routes/v1/{ping, users, images, image_post, image_get, image_labels, images_with_label, delete_images}.js` — 8 route handlers consuming `services.photoapp.*` + middleware factory + spec-shaped 400 envelopes for sentinel errors
- App.js mounting at root per D12; mount-order specificity per D11 (more-specific paths before parameterized ones)
- Lib CL9 (Chunk 3 addition): `services.photoapp.downloadImage` return shape gains `userid` (required by PDF spec for GET /image/:assetid; lib's `repos.assets.findById` already had it but `downloadImage` wasn't propagating)
- `projects/project02/server/tests/integration/v1_routes.test.js` — 17 tests covering happy path + 1-3 error cases per route; mocks `@mbai460/photoapp-server` services.photoapp via `jest.requireActual` + spread pattern
- Bucketkey-shape divergence resolved in favor of lib's `${username}/${uuidv4()}-${localname}` pattern (Branch B's `uuidv4() + ext` not carried forward)
- Test gate close: project02/server 81 passed (was 64; +17 from route tests) + 13 skipped + 16/18 suites

**Chunk 4 — Branch B's Python client commits (`acc4063` + `e3d9a58`) cherry-picked code-only:**

- `projects/project02/client/photoapp.py` — PDF-spec-aligned URLs + body shapes
- `projects/project02/client/tests.py` — extended with 2 read-only smokes + 1 full-lifecycle destructive test (test_99 with assertGreaterEqual 1001 invariant)
- Syntactic gate: parse OK; integration gate (pytest -m "not live") deferred to Chunk 6 (requires running server via lab spin-up)

**Chunk 5 — final consolidation:**

- All workspace tests green: lib 104/104 (CL9 +5) + Part 03 32+2 skipped (no regression) + project02/server 81+13 skipped
- `utils/freshclone-smoke` PASS in ~4s
- `utils/lib-symlink-check` 7/7 PASS
- App.js mount order verified: middleware → health → /v1 routes → 404 fallback → error middleware
- cred-sweep delta clean (4 hits in `photoapp-config.ini.example` are LocalStack `test` placeholder credentials, not real keys)

**Step 4 sub-frame — `utils/aws-probe` authored:**

- New utility at `utils/aws-probe` (commit `711254c`) — read-only diagnostic composing `terraform state list` + `aws rds describe-db-instances` + `utils/smoke-test-aws --mode live` + recommended-action logic. Per Erik's Unix-philosophy directive 2026-05-04: every utility one job, do it well, easily call sub-utils.
- Discovery: `utils/lab-up` at lab-repo level is Docker-only (delegates to `docker-up`); AWS spin-up needs its own utility chain. Future utilities flagged: `utils/aws-tf-apply` (when destroyed; deferred), `utils/aws-down` (terraform destroy with confirmation gate; deferred — destructive op deserves dedicated design).

### What's PENDING for full quest acceptance

- **Step 4 / Chunk 6 lab spin-up** — Erik runs `utils/aws-probe` from his terminal; recommended-action drives next step. Lab is stopped (not destroyed), so likely single-command `aws rds start-db-instance`. Then schema seed (`utils/rebuild-db`) + live regression (`PHOTOAPP_RUN_LIVE_TESTS=1` against Part 03 + project02/server) + `cd projects/project02/client && pytest`.
- **Step 5 / Chunk 7 tracker reconciliation** — autonomous run is filling Plan + Map sub-phase entries against on-disk reality (this entry + Plan.md updates 2026-05-04).
- **Step 6 / Chunk 8 push-readiness + merge to main** — held for Erik (mutation floor: integration branch only during autonomous run).
- **Steps 9-11** — Erik post-merge actions (notes to collaborators, quest closeout, next-quest selection).

### Open queues

- **Branch artifact sweep** (`projects/project02/client/MetaFiles/code-reviews/2026-05-04-branch-artifact-sweep.md`) — pulled forward from post-merge to autonomous run per Erik 2026-05-04. Targets both collaborator branches; deep treatment per Erik Q4.
- **Memory promotions** (validated this quest): `verification-as-its-own-work`. Others (`subagent_prompt_template`, `disk_offload_during_execution`, `lab_terminology_overload`) need more cycles to validate.

### Cross-references

- Active Map: `projects/project02/MergeOrientationMap.md` (this quest)
- Predecessor Map: `projects/project02/legacy_PlanningOrientationMap.md` (Phase 0 / Library Extraction)
- Plan: `projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 1/2/3 (updated 2026-05-04)
- Reviews: `projects/project02/client/MetaFiles/code-reviews/{00-assessment-criteria, 2026-05-04-feat-p02-foundation-review, 2026-05-04-feat-p02-gradescope-mvp-review, 2026-05-04-merge-comparison, 2026-05-04-process-retrospective}.md`
