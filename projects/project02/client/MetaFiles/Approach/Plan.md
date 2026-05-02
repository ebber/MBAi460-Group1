# Project 02 Part 01 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan workstream-by-workstream. Phase + cross-cutting checkboxes (`- [ ]`) track progress. Per-step TDD content lives in the Approach docs (see below); this Plan is the orchestration + state layer.
>
> **Plan-vs-Approach:** the Approach docs in this directory (`00-overview-and-conventions.md` + the five workstream docs + `Future-State-cicd.md`) already provide bite-sized TDD checklists with code samples. This Plan does NOT re-state per-step content — it tracks workstreams, surfaces cross-cutting concerns, registers Optional Steps for execution-time prompting, and guides multi-agent collaboration via git VCS.
>
> **Audience:** humans (you, future readers, collaborators) AND agents. Tone is project-doc, not agent-brief.

**Goal:** Rebuild PhotoApp as a multi-tier cloud application — Node.js/Express web service in front of S3 / RDS / Rekognition, with the Python client rewritten to call the web service. Pass two Gradescope autograders (60/60 web service + 30/30 client API = 90/90 total) on top of production-grade scaffolding (Terraform modules, observability, structured error handling, full test pyramid) reusable for Part 02 deployment and beyond.

**Architecture:** Phase 0 extracts Project 01 Part 03's service core into the shared library `@mbai460/photoapp-server` at `MBAi460-Group1/lib/photoapp-server/`. Both Part 03 and Project 02 become *consumers*; no parallel duplication. Phases 1–3 build Project 02's spec-compliant `/v1` surface on top of the library + add Project 02-specific scaffolding (pino, request_id, validate, opossum breakers, OpenAPI 3.1, six-layer test pyramid). Phase 4 adds the engineering `/v2` surface (presigned URLs, idempotency, pagination, REST-correct status codes, OpenTelemetry tracing, CloudWatch dashboards + alarms, scheduled RDS spindown), promoting select features to library 1.1.0.

**Tech Stack:** Node.js 24 / Express 5 / mysql2 / AWS SDK v3 / multer / ini / p-retry / pino / pino-http / zod / opossum / OpenTelemetry / Jest / supertest / aws-sdk-client-mock; Python 3.11 / requests / tenacity / pytest / responses; Terraform / Docker / docker-compose / LocalStack; npm workspaces.

**Quest sphere:** `MBAi460-Group1/projects/project02/` — operative directory; deliverables land here (plus shared library at `MBAi460-Group1/lib/photoapp-server/`, plus Part 03 consumer updates from Phase 0).

**Sibling artifact:** `MBAi460-Group1/projects/project02/client/MetaFiles/OrientationMap.md` — durable execution state (Active / Pending / Closed sections derived from this Plan's Master Tracker; updated atomically per substep close-out).

---

## Frame for the Execution Arc

```
[Execution Frame: Project 02 Part 01]

Purpose:
- Ship the multi-tier PhotoApp + pass Gradescope 90/90 + leave behind production-grade
  scaffolding reusable for Part 02 (EB deployment) and beyond.

Position:
- Back: Project 01 Part 03 UI MVP dev-complete (collaborator UAT in flight); Outstanding
  Integrations workstream closed 2026-04-27; spin-up + git posture cleanup closed today.
- Now: Project 02 Part 01 execution arc opening; this Plan + sibling OrientationMap
  bootstrap the arc.
- Next: 5 workstreams in dependency order — Phase 0 → 1 → 2 → 3 → 4. Future-State-cicd
  deferred (out of Part 01 scope).
- Down: Phase 0 (Library Extraction) — first sub-frame, hard precondition gate.
- Up: Lab session arc.

Scope:
- In:
  - `MBAi460-Group1/lib/photoapp-server/` — shared library extracted from Part 03 (Phase 0)
  - `MBAi460-Group1/projects/project02/server/` — Project 02 server tree (Phases 1, 2, 4)
  - `MBAi460-Group1/projects/project02/client/photoapp.py` rewrite (Phase 3)
  - `MBAi460-Group1/projects/project02/infra/` — Terraform module refactor + new modules
  - `MBAi460-Group1/projects/project02/api/openapi.yaml` — OpenAPI 3.1 contract
  - `MBAi460-Group1/projects/project02/docker-compose.yml` — local dev orchestration
  - Both Gradescope submissions (server 60/60 + client 30/30)
  - Library 1.0.0 (Phase 0 acceptance) and 1.1.0 (Phase 4 promotions)
- Out:
  - Elastic Beanstalk deployment + real-account `terraform apply` (Part 02)
  - CI/CD pipeline (`Future-State-cicd.md`)
  - Production-tier monitoring (Datadog / Grafana / SLO dashboards)
  - Auth / multi-tenant security beyond IAM scaffold
  - Mobile client / native apps
  - Promotion of `services/pool.js` + `services/breakers.js` to library (deferred until 3rd consumer justifies it)

Workset:
- 7 Approach docs at `MBAi460-Group1/projects/project02/client/MetaFiles/Approach/`
- This Plan + sibling OrientationMap
- Existing infra: `MBAi460-Group1/infra/terraform/`, `MBAi460-Group1/utils/`, `MBAi460-Group1/docker/`
- Existing schema: `MBAi460-Group1/projects/project01/create-photoapp.sql` + `create-photoapp-labels.sql`
- Existing client config: `MBAi460-Group1/projects/project01/client/photoapp-config.ini`
- Behavioural reference: `MBAi460-Group1/projects/project01/client/photoapp.py` (Part 02)
- Service-core source: `MBAi460-Group1/projects/project01/Part03/server/`

State: Planned (transitions to In Progress when Phase 0 begins)

Entry Conditions:
- Spin-up complete (DONE 2026-05-01)
- Approach docs read end-to-end (DONE 2026-05-01)
- This Plan + OrientationMap.md authored and committed
- VCS posture agreed: feature branches per workstream; merge over rebase (per ingested
  feedback memo `feedback_preserve_parallel_collaborator_signal.md`)
- Lab unlocked + AWS path verified + Lab is operational (DONE 2026-05-01)

Exit Conditions:
- All 5 workstreams ✅ COMPLETE in OrientationMap
- Both Gradescope tags landed: `gradescope-server-60-60` + `gradescope-client-30-30`
- Library 1.0.0 (Phase 0 acceptance) + 1.1.0 (Phase 4 promotions) tagged in
  `lib/photoapp-server/CHANGELOG.md`
- Every workstream's Documentation touchpoint fulfilled (CL11)
- `MetaFiles/refactor-log.md` carries the full execution-arc record
- All Optional Steps in the Registry routed (Built / Queued / Skipped / Retired)
- No regression in Part 03 (`cd projects/project01/Part03 && npm test` green)

Verification:
- Gradescope dashboard shows server 60/60 + client 30/30
- `cd MBAi460-Group1 && npm install && npm test --workspaces` green from monorepo root
- `cd MBAi460-Group1/projects/project02/client && pytest -m "not live"` green
- `MBAi460-Group1/projects/project01/Part03 && PHOTOAPP_RUN_LIVE_TESTS=1 npm test` green
- `MBAi460-Group1/utils/smoke-test-aws --mode live` green
- `MBAi460-Group1/utils/validate-db` green
- `MBAi460-Group1/utils/cred-sweep` reports zero leaks
- `git log --oneline` shows the suggested commit points from each Approach workstream

Resumption:
- If Planned: enter Phase 0 (Library Extraction); branch `feat/lib-extraction` from `main`
- If In Progress: read OrientationMap.md Active section + recent git log + Approach doc
  for the in-flight phase's task list. Verify last commit's claims against file state
  (per `feedback_refresh_ritual.md` adversarial Phase 2 stance).
- If Verified at workstream level: tag the commit + update OrientationMap to Closed +
  close out the workstream's Documentation touchpoint.
- If Blocked: capture in `MetaFiles/refactor-log.md` with the specific blocker;
  surface to the user.
```

---

## How Collaborating Agents Pick Up This Plan

The plan is designed for **multi-Claude collaboration via git VCS**: feature branches per workstream, merge-over-rebase reconciliation, parallel-collaborator signal preserved in history.

### Collaborator pickup protocol

1. **Read this Plan top-down** (you are here).
2. **Read `00-overview-and-conventions.md`** (the Approach umbrella).
3. **Read `OrientationMap.md`** (sibling to this Plan, one level up) — see which workstream is Active vs Pending.
4. **Pick an unclaimed workstream** whose dependencies are met:
   - Phase 0 (Library Extraction) — no dependency
   - Phase 1 (Foundation) — depends on Phase 0 ✅
   - Phase 2 (Web Service) — depends on Phase 1 ✅
   - Phase 3 (Client API) — depends on Phase 2 ✅
   - Phase 4 (Engineering Surface) — depends on Phase 2 ✅ AND Phase 3 ✅
5. **Branch from `main`:**
   ```bash
   git checkout main && git pull
   git checkout -b feat/<workstream-name>
   ```
   Branch names: `feat/lib-extraction`, `feat/p02-foundation`, `feat/p02-web-service`, `feat/p02-client-api`, `feat/p02-engineering-surface`.
6. **Announce in `MetaFiles/refactor-log.md`** (under a *Workstream pickup log* heading; one line):
   ```
   2026-MM-DD agent-<id> picked up Phase <N> on branch feat/<workstream-name>
   ```
7. **Read the Approach doc for that workstream end-to-end** before any code:
   - Phase 0 → `00-shared-library-extraction.md`
   - Phase 1 → `01-foundation.md`
   - Phase 2 → `02-web-service.md`
   - Phase 3 → `03-client-api.md`
   - Phase 4 → `04-engineering-surface.md`
8. **Execute the Approach doc's phases in order.** Each Approach doc is a TDD checklist; follow it as written.
9. **At each Optional Step callout** in the Approach: surface to your session's user per the *Optional Steps Execution Protocol* below; route per their direction; record the routing in this Plan's Optional Steps Registry checkbox.
10. **At each phase close:** commit per the Approach's *Suggested Commit Points*; update `OrientationMap.md` Active section atomically (per `feedback_atomic_substep_updates.md`); confirm tests stay green.
11. **At workstream acceptance:**
    - Open a PR / merge to `main` with `git merge --no-ff feat/<workstream-name>` (per `feedback_preserve_parallel_collaborator_signal.md` — preserve parallel-collaborator signal; merge commit message names actor + work).
    - Tag if applicable (`library-1.0.0-extraction-complete`, `gradescope-server-60-60`, `gradescope-client-30-30`).
    - Move the workstream from Active → Closed (recent) in `OrientationMap.md`.
12. **If blocked or surprised:** capture in `MetaFiles/refactor-log.md` + surface to user. Don't paper over.

### VCS posture (working assumption pending formal codification)

Per F1 in the Plan-authoring conversation: **feature branches per workstream + merge over rebase**. This is the Plan's *working* assumption, not a codified Lab strategy. The formal VCS strategy decision is queued at lab-root `MetaFiles/TODO.md` line 4 (*"Examine and design the Lab VCS strategy"*); when that decision lands, this section may need updating.

Special case: **Phase 0 is a high-coordination event** — it touches the workspace root + Part 03 simultaneously. The Approach (`00-shared-library-extraction.md` § *Pre-flight Communication*) requires opening an announcement issue, confirming no in-flight Part 03 PRs, and posting a rebase one-liner. Honor this checklist before Phase 0 merges.

### Cross-clone collaboration

The lab supports multi-clone parallel agent work (per `feedback_preserve_parallel_collaborator_signal.md`). Two agents on different clones can each work a different workstream simultaneously *as long as* their Approach docs don't touch the same files. Phase 0 (touches the whole repo structurally) is mutex with everything else; Phases 1 / 2 / 3 / 4 can interleave per the dependency graph.

### Optional Steps Execution Protocol

Per F2 in the Plan-authoring conversation: executing agents should ask their user how to handle Optional Steps. The Plan promotes all Optional Steps to first-class items (registered below) but leaves the routing decision to the user.

**At workstream entry**, the executing agent surfaces the cadence question:

> *"This workstream has N Optional Steps tagged in the Plan's Optional Steps Registry. How would you like me to handle them?*
> *(a) Per-step prompt — pause at each callout, surface routing options, route per your call.*
> *(b) Per-phase batch prompt — at the start of each Phase, surface that Phase's optionals in one routing pass; execute per the routing.*
> *(c) Pre-route the whole workstream — surface all this workstream's optionals up front; route once; execute.*
> *(d) Custom cadence — you tell me when to stop and ask."*

Default if no preference stated: **(b) per-phase batch**. Once chosen, operate consistently within the session.

**Routing options per Optional Step** (from the Approach):
- **Build now** — build the artifact, use it, commit it. Update the registry checkbox to ✅.
- **Queue** — add to `MetaFiles/TODO.md` per the schema in `00-shared-library-extraction.md` § 5.7. Update the registry checkbox to 📋.
- **Skip** — silent default; if contrarian, capture reason in the closing commit message. Update the registry checkbox to ⏭️.
- **Retire** — built-consideration / decided-not-to-pursue; row in `MetaFiles/TODO.md` § Retired with a one-sentence reason. Update the registry checkbox to 🚫.

---

## Master Tracker

Each workstream is a Frame-shaped block: Purpose / Position / Scope (In/Out from Approach) / State / Branch / Dependency / Acceptance / Approach pointer.

### Phase 0 — Library Extraction (Preparation Gate)

```
Purpose: Extract Part 03's service core into @mbai460/photoapp-server@1.0.0;
         Part 03 becomes a consumer; Project 02 will become a second consumer in Phase 1.
Position:
  Back: Part 03 owns the service core (current state)
  Now: extract into shared library
  Next: Phase 1 (Foundation) consumes the library
  Down: 6 internal phases — Workspace Bootstrap → Service-Core Extraction → Repository
        Layer → Part 03 Update → Doc-Freshness Protocol → Acceptance
  Up: Project 02 Part 01 quest
Scope: see 00-shared-library-extraction.md § Scope
State: ⏳ Planned
Branch: feat/lib-extraction
Dependency: NONE (entry gate; everything else depends on this)
Acceptance: 00-shared-library-extraction.md § Phase 6 — clean install + workspace tests
            green + Part 03 tests green + Part 03 live regression green +
            workspace-aware Dockerfile + lib:photoapp-server label live + fresh-clone
            smoke test passes
Tag at acceptance: library-1.0.0-extraction-complete
Approach pointer: 00-shared-library-extraction.md (697 lines)
```

- [ ] **Phase 0.1** — Workspace Bootstrap (`00-shared-library-extraction.md` § Phase 1)
- [ ] **Phase 0.2** — Extract Service Core mechanically pure (§ Phase 2)
- [ ] **Phase 0.3** — Repository Layer (CL9 bounded reconciliation; § Phase 3)
- [ ] **Phase 0.4** — Update Part 03 to Consume the Library (§ Phase 4)
- [ ] **Phase 0.5** — Doc-Staleness Prevention Protocol (CL11; § Phase 5)
- [ ] **Phase 0.6** — Acceptance + branch-protection update + tag (§ Phase 6)

### Phase 1 — Foundation

```
Purpose: Stand up Project 02's server tree as a consumer of @mbai460/photoapp-server;
         add Project 02-specific scaffolding (pino, pino-http, request_id, validate,
         opossum breakers, mysql pool, OpenAPI stub, AppError hierarchy, full test
         pyramid harness, Terraform module refactor, docker-compose, ESLint/Prettier).
Position:
  Back: Phase 0 ✅ (library 1.0.0 extracted)
  Now: build Project 02 scaffolding on top of the library
  Next: Phase 2 (Web Service) implements /v1 routes on this scaffolding
  Down: 12 internal phases (consume library → docker-compose → Terraform refactor →
        pino + pino-http → request_id → validate → mysql pool + opossum → OpenAPI stub
        → AppError → ESLint/Prettier → six-layer test pyramid harness → state-mv
        Terraform refactor)
  Up: Project 02 Part 01 quest
Scope: see 01-foundation.md § Scope
State: ⏳ Planned
Branch: feat/p02-foundation
Dependency: Phase 0 ✅
Acceptance: 01-foundation.md § Phase 12 — make up healthy + test pyramid harness in
            place + Terraform refactor non-destructive + lint clean
Approach pointer: 01-foundation.md (very large; read carefully)
```

- [ ] **Phase 1.0** — Phase 0 of foundation: Consume library (foundation Phase 0)
- [ ] **Phase 1.1** — docker-compose + LocalStack
- [ ] **Phase 1.2** — Terraform module refactor (rds/, s3/, iam/, cloudwatch/ skeleton)
- [ ] **Phase 1.3** — pino + pino-http structured logging
- [ ] **Phase 1.4** — request_id middleware
- [ ] **Phase 1.5** — error middleware via library factory + AppError hierarchy
- [ ] **Phase 1.6** — validate middleware (zod-based)
- [ ] **Phase 1.7** — mysql2 pool factory + opossum breakers (Project 02-specific)
- [ ] **Phase 1.8** — OpenAPI 3.1 stub + library exports verified
- [ ] **Phase 1.9** — ESLint / Prettier / pre-commit hooks
- [ ] **Phase 1.10** — docker-compose orchestration validated
- [ ] **Phase 1.11** — six-layer test pyramid harness (unit / integration / contract / smoke / happy-path / live)
- [ ] **Phase 1.12** — Terraform `state mv` cutover from `MBAi460-Group1/infra/terraform/` to module form

### Phase 2 — Web Service (Gradescope 60/60)

```
Purpose: Implement six spec-compliant /v1 routes + wire the two assignment-provided
         routes (/ping, /users) onto the layered architecture. Submit to Gradescope
         and reach 60/60.
Position:
  Back: Phase 1 ✅ (foundation in place)
  Now: spec-adapter route + controller layer; library owns service layer
  Next: Phase 3 (Client API) consumes /v1
  Down: 9 internal phases — Phase 0 verify library + DI / 1 layered skeleton + provided
        routes / 2 GET /v1/images / 3 POST /v1/image/:userid (transactional) / 4 GET
        /v1/image/:assetid (base64 download) / 5 GET /v1/image_labels/:assetid / 6 GET
        /v1/images_with_label/:label / 7 DELETE /v1/images / 8 contract + happy-path
        sweep / 9 Gradescope submission (60/60)
  Up: Project 02 Part 01 quest
Scope: see 02-web-service.md § Scope
State: ⏳ Planned
Branch: feat/p02-web-service
Dependency: Phase 1 ✅
Acceptance: Gradescope server 60/60; tag gradescope-server-60-60
Approach pointer: 02-web-service.md (1059 lines)
```

- [ ] **Phase 2.0** — Verify library exports + Project 02 DI seams (no code moved)
- [ ] **Phase 2.1** — Layered skeleton + provided routes (`/ping`, `/users`)
- [ ] **Phase 2.2** — `GET /v1/images` (with optional `?userid=`)
- [ ] **Phase 2.3** — `POST /v1/image/:userid` (transactional upload + Rekognition)
- [ ] **Phase 2.4** — `GET /v1/image/:assetid` (base64 download)
- [ ] **Phase 2.5** — `GET /v1/image_labels/:assetid`
- [ ] **Phase 2.6** — `GET /v1/images_with_label/:label`
- [ ] **Phase 2.7** — `DELETE /v1/images`
- [ ] **Phase 2.8** — Contract + happy-path sweep
- [ ] **Phase 2.9** — Gradescope submission (60/60); tag

### Phase 3 — Client API (Gradescope 30/30)

```
Purpose: Rewrite client/photoapp.py so every API function calls the web service over
         HTTP. Preserve Part 02's public contract (function signatures, return types,
         exception semantics, ordering). Submit to Gradescope and reach 30/30.
Position:
  Back: Phase 2 ✅ (server 60/60; wire contract locked)
  Now: rewrite the six remaining API functions
  Next: Phase 4 (Engineering Surface) — adds /v2 client branch (api_version='v2')
  Down: 6 internal phases — bootstrap pytest + api_version config / read functions /
        write functions / integration + contract + live coverage / tests.py update /
        Gradescope submission
  Up: Project 02 Part 01 quest
Scope: see 03-client-api.md § Scope
State: ⏳ Planned
Branch: feat/p02-client-api
Dependency: Phase 2 ✅
Acceptance: Gradescope client 30/30; tag gradescope-client-30-30
Approach pointer: 03-client-api.md (684 lines)
```

- [ ] **Phase 3.1** — Bootstrap pytest harness + `api_version` config knob
- [ ] **Phase 3.2** — Read functions (`get_images`, `get_image`, `get_image_labels`, `get_images_with_label`)
- [ ] **Phase 3.3** — Write functions (`post_image`, `delete_images`)
- [ ] **Phase 3.4** — Integration + contract + live coverage
- [ ] **Phase 3.5** — Extend `tests.py` with one happy-path call per function
- [ ] **Phase 3.6** — Gradescope submission (30/30); tag

### Phase 4 — Engineering Surface

```
Purpose: Add the engineering /v2 surface (presigned URL upload + download,
         idempotency, cursor pagination, REST-correct status codes), wire OpenTelemetry
         tracing through every span, ship CloudWatch dashboards + alarms, automate
         scheduled spindown, harden live regression. Promote select features to library
         1.1.0 (presign service methods, OTel-instrumented use cases, getSigner() /
         getCloudWatch() AWS factory exports).
Position:
  Back: Phases 2 ✅ + 3 ✅ (Gradescope 90/90 locked)
  Now: engineering surface additive; /v1 contract stays untouched
  Next: Future-State-cicd (out of Part 01 scope)
  Down: 12 internal phases (real OTel → /v2 mount → idempotency → presigned upload →
        presigned download → cursor pagination → REST DELETE → CW dashboards + alarms →
        scheduled spindown → live regression → client v2 branch → acceptance)
  Up: Project 02 Part 01 quest
Scope: see 04-engineering-surface.md § Scope
State: ⏳ Planned
Branch: feat/p02-engineering-surface
Dependency: Phase 2 ✅ AND Phase 3 ✅
Acceptance: 04-engineering-surface.md § Phase 12 — every layer green + dashboards
            terraform-plan-clean + spindown Lambda smoke-tested + library 1.1.0 tagged
Tag at acceptance: library-1.1.0
Approach pointer: 04-engineering-surface.md (765 lines)
```

- [ ] **Phase 4.1** — OTel tracing: foundation stub → real (library 1.1.0 candidate: tracer DI seam)
- [ ] **Phase 4.2** — `/v2` skeleton + mount behind `ENABLE_V2_ROUTES=1`
- [ ] **Phase 4.3** — Idempotency middleware + dedupe table migration
- [ ] **Phase 4.4** — Presigned URL upload flow (library 1.1.0 candidate: `presignUploadUrl` + `finalizeUpload` + `getSigner`)
- [ ] **Phase 4.5** — Presigned URL download flow (library 1.1.0 candidate: `presignDownloadUrl`)
- [ ] **Phase 4.6** — Cursor pagination on `/v2/images` (library 1.1.0 candidate: `listAssetsPaginated`)
- [ ] **Phase 4.7** — REST-correct DELETE per asset (library 1.1.0 candidate: `deleteAssetById`)
- [ ] **Phase 4.8** — CloudWatch dashboards + alarms + custom application metrics (`getCloudWatch` library 1.1.0 candidate)
- [ ] **Phase 4.9** — Scheduled RDS spindown (EventBridge + Lambda + IAM role)
- [ ] **Phase 4.10** — Full live regression suite (server v1 + v2; client v1 + v2)
- [ ] **Phase 4.11** — Client `api_version='v2'` branch added
- [ ] **Phase 4.12** — Engineering-surface acceptance; library 1.1.0 promotion + tag

### Out of scope (explicit deferral)

- **Future-State-cicd.md** — GitHub Actions pipeline (OIDC + ECR + branch-protected deploy + nightly live regression). Captured in the same Approach directory as `Future-State-cicd.md`; deferred to post-Part-01 iteration. Local equivalents documented in that file's footnote.

---

## Cross-Cutting Threads

Six threads cut across all workstreams. They get dedicated visibility here per Erik's emphasis on testing / utility-building / Mermaid + the Approach's structural disciplines (CL9 / CL11 / CL12 / mount-order / submission tarball composition).

### Thread A — Testing Pyramid (six layers)

The Approach establishes a six-layer test pyramid that runs throughout. **Erik flagged testing as incredibly important.**

| Layer | Where | When |
|---|---|---|
| Unit (mocked) | `lib/photoapp-server/tests/services|repositories|middleware|schemas/`; `projects/project02/server/tests/unit/`; `projects/project02/client/tests/unit/` | Throughout — every TDD cycle |
| Integration | `lib/photoapp-server/tests/integration/`; `projects/project02/server/tests/integration/` (LocalStack + ephemeral MySQL); `projects/project02/client/tests/integration/` (against `make up`) | Phase 1 (harness); Phase 2 (per-route); Phase 3 (per-function); Phase 4 (per `/v2` route) |
| Contract (OpenAPI) | `projects/project02/server/tests/contract/`; `projects/project02/client/tests/contract/` | Phase 1.8 (OpenAPI stub); Phase 2.1 + per-route as routes land; Phase 4 for `/v2` |
| Smoke | `tools/smoke.sh`; `projects/project02/server/tests/smoke/` | Phase 1.11 (harness); per-workstream pre-acceptance |
| Happy-path E2E | `projects/project02/server/tests/happy_path/upload_lifecycle.test.js`; `projects/project02/client/tests/integration/test_against_compose.py` | Phase 2.8 (full v1 flow); Phase 3.4 (full client flow); Phase 4 (v2 flow) |
| Live (gated by `PHOTOAPP_RUN_LIVE_TESTS=1`) | `projects/project02/server/tests/live/`; `projects/project02/client/tests/live/` | Phase 1.11 (skeleton); Phase 4.10 (full v1 + v2 lifecycle) |

**Cross-thread tracking:**

- [ ] Six-layer harness in place (Phase 1.11)
- [ ] Service-layer tests in `lib/photoapp-server/tests/` (Phase 0.2 + 0.3)
- [ ] Per-route integration + contract tests for every `/v1` route (Phase 2)
- [ ] Per-function unit + integration + contract tests for every client function (Phase 3)
- [ ] Happy-path E2E green for `/v1` (Phase 2.8)
- [ ] Happy-path E2E green for `/v2` (Phase 4)
- [ ] Live regression: server v1 + v2 + client v1 + v2 all green when opted in (Phase 4.10)
- [ ] Contract suite covers every `/v1` and `/v2` route (Phase 2.8 + Phase 4.12)

### Thread B — Utility Building

**Erik flagged utility building as incredibly important.** The Approach surfaces many `tools/` and `utils/` candidates. Naming convention (per `00-overview-and-conventions.md` § *Naming convention for utilities*):
- **`utils/<name>`** — small, focused helpers invoked by other things (pre-commit hooks, CI jobs, Makefile targets). Single-purpose, often parameterless.
- **`tools/<name>`** — developer-facing CLIs with arguments and human-readable output. Multi-purpose / parameterized; interactive use.

**Permanent (mandatory) utilities** introduced in this arc:

- [ ] `utils/lib-symlink-check` — workspace install-state sanity (Phase 0.2 Optional Utility, **strongly recommended**)
- [ ] `utils/no-service-leak` — pre-commit guard against `cp lib/.../services/X.js projects/.../services/X.js` regressions (Phase 0.2 Optional Utility)
- [ ] `utils/freshen-lockfile` — referenced as part of CL10 collaboration-safety; introduced in Phase 0.5 (Doc-Freshness Protocol)
- [ ] `utils/run-extraction-canary` — Phase 0.3 reconciliation iteration helper (Optional Utility)
- [ ] `utils/freshclone-smoke` — CL11 self-enforcement (Phase 0.6 Optional Utility, **strongly recommended**)
- [ ] `tools/route-scaffold.sh <name>` — Phase 2 route scaffolder (Optional Utility)
- [ ] `tools/gradescope-preview` — Phase 2.9 submission iteration loop closer (Optional Utility, **strongly recommended for iteration speed**)
- [ ] `tools/gradescope-preview-client` — Phase 3.6 client submission preview (Optional Utility)
- [ ] `tools/run-client-suite` — Phase 3.1 multi-layer pytest wrapper (Optional Utility)
- [ ] `tools/presign-curl <id>` — Phase 4.4 presigned-URL debugging helper (Optional Utility)
- [ ] `tools/synthetic-alarm-trigger <name>` — Phase 4.8 alarm validation helper (Optional Utility)
- [ ] `tools/rds-spin.sh` — Phase 4.9 manual spindown override CLI
- [ ] `tools/wait-for host:port` — referenced from compose orchestration; build during Phase 1.10 if `make up` needs it
- [ ] `tools/package-submission.sh` — Phase 0.4 (Part 03 Gradescope packaging) + Phase 2.9 (Project 02 server submission)
- [ ] `make up` / `make down` / `make lint` / `make test-layer` / `make freshclone-smoke` / `make submit-server` / `make submit-client` — Makefile targets introduced through Phase 1.10 + workstream-specific phases
- [ ] `utils/runbook` — Phase 7 of Future-State-cicd (out of Part 01 scope; noted for awareness)

Existing utilities **reused as-is** (no work; tracking for visibility):
- `utils/lab-status`, `utils/lab-up`, `utils/lab-down`, `utils/lock.sh`, `utils/unlock.sh`
- `utils/cred-sweep`, `utils/run-sql`, `utils/validate-db`, `utils/rebuild-db`
- `utils/smoke-test-aws`, `utils/aws-inventory`, `utils/Erik-AWS-Scan`
- `utils/rotate-passwords`, `utils/rotate-access-keys`
- `utils/docker-status`, `utils/docker-up`, `utils/docker-down`, `utils/docker-run`, `utils/docker-run-8080`

### Thread C — Mermaid Visualizations

**Erik flagged Mermaid visualizations as incredibly important.** The Approach has many Optional Mermaid Steps; several are tagged "strongly recommended." All visualizations land in `MBAi460-Group1/visualizations/`.

**Visualizations introduced in this arc** (organized by workstream + flagged for strongly-recommended status):

- [ ] **Phase 0** — `Target-State-mbai460-photoapp-server-lib-extraction-v1.md` (**strongly recommended** — major architectural pivot)
- [ ] **Phase 1** — `Target-State-project02-foundation-architecture-v1.md` (recommended foundation overview)
- [ ] **Phase 1** — `Target-State-project02-inheritance-map-v1.md` (Phase 0 of foundation; library boundary visible)
- [ ] **Phase 2** — `Target-State-project02-v1-layered-flow-v1.md` (request lifecycle through `app.js`; mount-order unambiguous)
- [ ] **Phase 2** — `Target-State-project02-app-mount-order-v1.md` (D11 + D12 mount-order invariants visible)
- [ ] **Phase 2** — `project02-api-contract-v1-vs-v2-v1.md` (two surfaces, shared service layer)
- [ ] **Phase 2** — `Target-State-project02-upload-transaction-v1.md` (**strongly recommended** — multi-AWS transaction with rollback paths; Phase 3 of web service)
- [ ] **Phase 2** — `Target-State-project02-download-base64-v1.md` (Phase 4 of web service)
- [ ] **Phase 2** — `Target-State-project02-delete-order-v1.md` (**strongly recommended** — destructive operation; Phase 7 of web service)
- [ ] **Phase 3** — `Target-State-project02-client-adapter-v1.md` (client as adapter between two contracts)
- [ ] **Phase 3** — `Target-State-project02-client-post-image-flow-v1.md` (base64 round-trip)
- [ ] **Phase 4** — `Target-State-project02-v2-presigned-upload-vs-v1-base64-v1.md` (**strongly recommended** — major architectural change; Phase 4 of engineering surface)
- [ ] **Phase 4** — `Target-State-project02-cloudwatch-emission-topology-v1.md` (**strongly recommended** — IAM permissions added; Phase 8)
- [ ] **Phase 4** — `Target-State-project02-rds-spindown-iam-v1.md` (**strongly recommended** — new IAM principal + RDS modification; Phase 9)
- [ ] **Phase 4** — `Target-State-project02-cicd-pipeline-v1.md` (Future State CICD; out of Part 01 scope but viz worth holding)
- [ ] **Phase 4** — `Target-State-project02-github-aws-oidc-trust-v1.md` (Future State CICD; out of Part 01 scope)

Naming convention per `feedback_visualization_naming.md`: `Target-State-<scope>-<subject>-v<N>.md` for proposed/target state; rename to `<scope>-<subject>-v<N>.md` when implementation completes.

### Thread D — Library-Touching Governance (CL9 + CL12)

Library-touching commits cross consumers (Part 03 + Project 02). Discipline:

**CL9 — Mechanically pure extraction is the rule; bounded reconciliation is the only exception.** Any behaviour change in the library (vs Part 03's pre-extraction observable behaviour) is captured as a separate commit + a `learnings/2026-XX-XX-<reason>.md` reconciliation entry + a Part 03 test that asserts pre-extraction behaviour is preserved. The SQL-into-repositories refactor (Phase 0.3) is the canonical example — bounded by being *forced by extraction*. Anything else that "could be improved" gets split into a follow-up.

**CL12 — Library-touching PRs are visibly tagged.** GitHub label `lib:photoapp-server` on every PR that modifies `lib/photoapp-server/`. Reviewers are expected to think across consumers when they see the label.

**Library version policy (CL8 relaxed):** During pre-1.0.0 (Phase 0 → Phase 4 acceptance), workspace protocol `*` for both consumers; library churn doesn't require N-file PRs. After Phase 4 acceptance: bump to 1.1.0, strict-pin both consumers.

**Cross-thread tracking:**

- [ ] Library 1.0.0 extracted (Phase 0.6 acceptance)
- [ ] CL9 reconciliation log entry: `learnings/2026-XX-XX-photoapp-server-extraction.md` (Phase 0.3.2)
- [ ] `lib:photoapp-server` GitHub label created (Phase 0.6.3)
- [ ] Library 1.1.0 promotions land per Phase 4 phases:
  - [ ] OTel tracer DI seam (Phase 4.1)
  - [ ] `presignUploadUrl` + `finalizeUpload` + `getSigner` (Phase 4.4)
  - [ ] `presignDownloadUrl` (Phase 4.5)
  - [ ] `listAssetsPaginated` (Phase 4.6)
  - [ ] `deleteAssetById` (Phase 4.7)
  - [ ] `getCloudWatch` (Phase 4.8)
- [ ] Library 1.1.0 tagged + both consumers strict-pinned (Phase 4.12)
- [ ] CHANGELOG.md updated for every library-touching commit
- [ ] Both consumers' tests stay green throughout (Part 03 + Project 02)

### Thread E — Doc-Freshness Protocol (CL11)

Every workstream phase ends with a Documentation touchpoint per CL11 (established in Phase 0.5; codified in `MetaFiles/DOC-FRESHNESS.md`). Onboarding-affecting PRs **must** update the matching docs in the same PR; the PR template asks the question; major onboarding-affecting PRs carry a fresh-clone smoke test.

**Onboarding-facing inventory** (maintained in `MetaFiles/DOC-FRESHNESS.md` post Phase 0.5):
- `MBAi460-Group1/README.md` — repo entry point
- `MBAi460-Group1/MetaFiles/QUICKSTART.md` — full collaborator setup walkthrough
- `MBAi460-Group1/CONTRIBUTING.md` — workspace etiquette + lockfile + library protocol
- Every `projects/<X>/README.md` (existing + `projects/project02/server/README.md` + `projects/project02/client/README.md`)
- Every `lib/<Y>/README.md` (`lib/photoapp-server/README.md` introduced Phase 0.5.5)
- `infra/README.md`, `utils/README.md`, `docker/README.md`

**Cross-thread tracking:**

- [ ] `MetaFiles/DOC-FRESHNESS.md` exists with the protocol (Phase 0.5.1)
- [ ] `CONTRIBUTING.md` summarizes the protocol (Phase 0.5.3)
- [ ] PR template (`.github/pull_request_template.md`) includes onboarding-affecting checkbox (Phase 0.5.6)
- [ ] Each workstream's Documentation touchpoint fulfilled at workstream close

### Thread F — Dual Gradescope Tarball Composition

Two submissions. Two compositions. Don't conflate.

| Submission | Files | Target | Built by |
|---|---|---|---|
| Project 02 — web service (60/60) | `server/*.js` + `server/*.ini` (no `routes/v2/`, no `observability/`, no engineering files) | 60/60 | `tools/package-submission.sh` (Phase 0.4 + Phase 2.9); allowlist asserted by `tools/__tests__/package-submission.test.sh` |
| Project 02 — client API (30/30) | `server/*.js` + `server/*.ini` + `client/photoapp.py` (server-image submission with `photoapp.py` copied in) | 30/30 | Same packaging script extended for the client bundle (Phase 3.6) |

**Phase 0 Gradescope-tarball implication:** the submission tarball must `npm ci --omit=dev` cleanly without resolving `@mbai460/photoapp-server` from npm — `tools/package-submission.sh` inlines the library into a temp `node_modules/@mbai460/photoapp-server/` inside the tarball, rewrites `package.json` to remove the workspace dep, and asserts the resulting tarball passes the contract suite before invoking `gs submit`.

**Cross-thread tracking:**

- [ ] `tools/package-submission.sh` exists + tests pass (Phase 0.4.3)
- [ ] Submission allowlist (`tools/submission-allowlist.txt`) enforced by unit test
- [ ] Project 02 server submission lands at 60/60 (Phase 2.9)
- [ ] Project 02 client submission lands at 30/30 (Phase 3.6)
- [ ] Tags landed: `gradescope-server-60-60`, `gradescope-client-30-30`

---

## Optional Steps Registry

All Optional Steps from the Approach docs are lifted here as first-class tracking items. **At workstream entry**, the executing agent surfaces these per the *Optional Steps Execution Protocol*. Status legend: ⏳ awaiting routing • ✅ Built • 📋 Queued in `MetaFiles/TODO.md` • ⏭️ Skipped • 🚫 Retired.

Each row references the Approach doc section so the executing agent can read the "What it does / Why now / Decision branches" content there.

### Phase 0 — Library Extraction Optionals

- [ ] ⏳ **VIZ** `Target-State-mbai460-photoapp-server-lib-extraction-v1.md` (`00-shared-library-extraction.md` § Phase 1 area; **strongly recommended**)
- [ ] ⏳ **TEST** `lib/photoapp-server/tests/exports-shape.test.js` (snapshot of public exports map; § Phase 2.2)
- [ ] ⏳ **UTIL** `utils/lib-symlink-check` (§ Phase 1.2; **strongly recommended**)
- [ ] ⏳ **UTIL** `utils/no-service-leak` (pre-commit; § Phase 2.2)
- [ ] ⏳ **TEST** `lib/photoapp-server/tests/repositories/sql-characterization.test.js` (CL9 SQL byte-identical assertion; § Phase 3.1)
- [ ] ⏳ **UTIL** `utils/run-extraction-canary` (Phase 3 iteration helper; § Phase 3.1)
- [ ] ⏳ **UTIL** `utils/freshclone-smoke` / `make freshclone-smoke` (CL11 enforcement; § Phase 6.2; **strongly recommended**)

### Phase 1 — Foundation Optionals

- [ ] ⏳ **VIZ** `Target-State-project02-foundation-architecture-v1.md` (architecture overview before authoring)
- [ ] ⏳ **VIZ** `Target-State-project02-inheritance-map-v1.md` (one-page Phase 0 inheritance map)
- [ ] ⏳ Items embedded in `01-foundation.md` Phases (read the Approach doc to enumerate; this Plan tracks at workstream-level)

### Phase 2 — Web Service Optionals

- [ ] ⏳ **VIZ** `Target-State-project02-v1-layered-flow-v1.md` (Phase 1 of web service)
- [ ] ⏳ **VIZ** `Target-State-project02-app-mount-order-v1.md` (D11 + D12 invariants)
- [ ] ⏳ **VIZ** `project02-api-contract-v1-vs-v2-v1.md` (two surfaces shared service layer)
- [ ] ⏳ **VIZ** `Target-State-project02-upload-transaction-v1.md` (Phase 3; **strongly recommended** — multi-AWS transaction)
- [ ] ⏳ **VIZ** `Target-State-project02-download-base64-v1.md` (Phase 4)
- [ ] ⏳ **VIZ** `Target-State-project02-delete-order-v1.md` (Phase 7; **strongly recommended** — destructive operation)
- [ ] ⏳ **TEST** `tests/contract/spec_envelope_table.test.js` (Phase 1; **strongly recommended** — table-driven envelope conformance)
- [ ] ⏳ **TEST** `tests/unit/base64_buffer_roundtrip.test.js` (Phase 3; base64 ↔ buffer round-trip property test; **strongly recommended**)
- [ ] ⏳ **UTIL** `tools/route-scaffold.sh <name>` (Phase 1; routes-2-7 boilerplate scaffolder)
- [ ] ⏳ **UTIL** `tools/gradescope-preview` / `make gradescope-preview` (Phase 9; **strongly recommended for iteration speed**)
- [ ] ⏳ **TEST** `tests/contract/submission_self_contained.test.js` (Phase 9; tarball boots from inlined library)

### Phase 3 — Client API Optionals

- [ ] ⏳ **VIZ** `Target-State-project02-client-adapter-v1.md` (Phase 1; client as adapter between two contracts)
- [ ] ⏳ **VIZ** `Target-State-project02-client-post-image-flow-v1.md` (Phase 3; base64 round-trip)
- [ ] ⏳ **UTIL** `tools/run-client-suite` / `make test-client` (Phase 1; multi-layer pytest wrapper)
- [ ] ⏳ **TEST** `tests/contract/test_tuple_shape_compatibility.py` (Phase 1; Part 02 vs Project 02 dataclass parity)
- [ ] ⏳ **UTIL** `tools/gradescope-preview-client` / `make gradescope-preview-client` (Phase 6)
- [ ] ⏳ **TEST** `tests/contract/test_request_envelopes.py` (Phase 6; client-side request-shape conformance)

### Phase 4 — Engineering Surface Optionals

- [ ] ⏳ **VIZ** `Target-State-project02-v2-presigned-upload-vs-v1-base64-v1.md` (Phase 4; **strongly recommended** — major architectural change)
- [ ] ⏳ **VIZ** `Target-State-project02-cloudwatch-emission-topology-v1.md` (Phase 8; **strongly recommended** — IAM perms added)
- [ ] ⏳ **VIZ** `Target-State-project02-rds-spindown-iam-v1.md` (Phase 9; **strongly recommended** — new IAM principal)
- [ ] ⏳ **TEST** `tests/integration/idempotency_replay_byte_identical.test.js` (Phase 3; idempotency byte-equality)
- [ ] ⏳ **TEST** `tests/integration/presigned_url_real_s3.test.js` (Phase 4; LocalStack roundtrip; **strongly recommended**)
- [ ] ⏳ **UTIL** `tools/presign-curl <id>` (Phase 4 / 5; presigned-URL debugging)
- [ ] ⏳ **TEST** `tests/live/alarms_fire.test.js` (Phase 8; alarm-fires-at-threshold)
- [ ] ⏳ **UTIL** `tools/synthetic-alarm-trigger <name>` (Phase 8; alarm validation)

### Future-State CICD Optionals (out of Part 01 scope; tracked for visibility)

- [ ] ⏳ **VIZ** `Target-State-project02-cicd-pipeline-v1.md` (out of scope)
- [ ] ⏳ **VIZ** `Target-State-project02-github-aws-oidc-trust-v1.md` (out of scope)
- [ ] ⏳ **UTIL** `tools/preview-ci-locally` (act-based local CI preview; out of scope)
- [ ] ⏳ **TEST** `.github/workflows/ci.yml` self-test or `tools/__tests__/ci-yaml-validate.sh` (out of scope)
- [ ] ⏳ **UTIL** `tools/runbook` (named procedures launcher; out of scope)

---

## Cross-cutting invariants (for executor reference)

These are decisions from the Approach worth re-stating as invariants to *check against* during execution:

- **D2 — Spec-compliant routes are the wire contract; engineering work happens *behind* them.** Routes in `routes/v1/*.js` are thin adapters; logic lives in the library's `services/photoapp.js`.
- **D7 — Spec status codes are 200 / 400 / 500 only.** REST-correct 404 lives only on `/v2`. Error middleware checks the request mount prefix to choose.
- **D10 — Forward-only Terraform.** No destroy-then-recreate cycles in shared envs.
- **D11 — Same Express app instance for `/v1` and `/v2`.** Mount order: `/v2` first (when enabled) → `/v1` → 404 fallback. `/v2` first prevents shadowing by parameterised v1 paths.
- **D12 — Spec-compliant routes are mounted at root (`/`), not `/v1`.** Gradescope hits paths without a prefix. The "v1" in this Approach refers to the *router module*, not the URL prefix. Default mount is at root; `OPTIONAL_V1_PREFIX=1` enables `/v1` mounting for distinguishable engineering traffic.
- **D13 — Both server trees consume one shared library; neither owns the service core.** No parallel internal source to keep in sync.
- **CL2 — Library is internals-only.** Exports services, repositories, middleware (constructed via factory), schemas. **Never routers** — surfaces own routing because their wire contracts differ.
- **CL3 — Configurability via construction, not env.** Library middleware factories take config objects (`createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })`). Surfaces inject DI config.

---

## Risks (carry-forward from Approach)

Each Approach doc has its own Risks section; this is the cross-arc summary lifted from each:

**Architectural:**
- Engineering work breaks Gradescope contract → mitigated by contract tests in P0 (Phase 1.11 + per-route in Phase 2 + Phase 3)
- Two Docker images drift in config / dependencies → mitigated by `docker-compose.yml` + `make up` rebuild flow + colocation of `.example` templates
- `/v2` mounts before `/v1` and shadows parameterised paths → mitigated by D11 (mount order locked) + routing assertions
- Library-touching PRs reviewers don't think across consumers → mitigated by CL12 (`lib:photoapp-server` label) + PR template

**Data + State:**
- `mysql2` pool with `multipleStatements: true` SQL injection surface → mitigated by parameterised `pool.execute(?, [...])` everywhere except `truncateAllAssetsAndLabels` (no user input)
- RDS connection exhaustion under retries → mitigated by `mysql2.createPool({connectionLimit: 5})` + `pRetry({retries: 2})` + circuit breaker
- Base64 image transit eats memory → mitigated by spec-compliant 50 MB cap + `pino` log of `Content-Length` per upload + `/v2` presigned URLs eliminate body
- Idempotency dedupe table grows unbounded → mitigated by `expires_at` TTL + nightly cleanup Lambda (queued post Phase 4)
- Transaction in `uploadImage` leaks connection on `pRetry` exhaustion → mitigated by `try/finally` always releasing + tests assert release on every branch

**Operational:**
- Live AWS tests run accidentally → mitigated by `PHOTOAPP_RUN_LIVE_TESTS=1` gate + pre-commit denies `PHOTOAPP_RUN_LIVE_TESTS=` in committed files
- Submission tarball includes engineering files → mitigated by `tools/package-submission.sh` allowlist + asserted by unit test
- `photoapp-config.ini` with real credentials gets committed → mitigated by `.gitignore` rule + `*.example` template + pre-commit hook checks for staged `*-config.ini` (non-`.example`) files
- Live regression cost spikes (Rekognition on every run) → mitigated by smallest-fixture flow + budget alarm
- Spindown Lambda fires while long-running test mid-flight → mitigated by 23:59 CST schedule + manual live regression during business hours

**Coordination:**
- Phase 0 lands during a teammate's in-flight Part 03 work → mitigated by *Pre-flight Communication* checklist in `00-shared-library-extraction.md`
- Doc updates in Phase 5 drift before PR merges → mitigated by `make freshclone-smoke` re-validation immediately before merge (CL11)
- Lockfile contention on subsequent PRs → mitigated by `npm-merge-driver` + `.gitattributes` + documented "rebuild the lockfile" fallback (CL10)
- Gradescope autograder uses field names not in the PDF → mitigated by contract test suite locking shapes + autograder feedback captured in `MetaFiles/refactor-log.md`

---

## Acceptance for Project 02 Part 01

Workstream-level milestones:

- [ ] **Phase 0 acceptance** — `library-1.0.0-extraction-complete` tagged; both `lib/photoapp-server` + Part 03 tests green; live regression green; fresh-clone smoke test green.
- [ ] **Phase 1 acceptance** — `make up` healthy; six-layer test pyramid harness in place; lint clean; Terraform refactor non-destructive (`state mv` cutover green).
- [ ] **Phase 2 acceptance** — Gradescope server **60/60**; tag `gradescope-server-60-60`; contract suite green for every `/v1` route; happy-path E2E green.
- [ ] **Phase 3 acceptance** — Gradescope client **30/30**; tag `gradescope-client-30-30`; integration sweep green against compose; contract conformance green; `tests.py` exercises every function.
- [ ] **Phase 4 acceptance** — engineering surface deliverables green (per `04-engineering-surface.md` § Phase 12); library 1.1.0 tagged with promoted features; both consumers strict-pinned to 1.1.0; live regression (server v1 + v2 + client v1 + v2) green when opted in.

**Final arc acceptance:** all five workstreams ✅ in OrientationMap; both Gradescope tags landed; library 1.0.0 → 1.1.0 transition recorded in `lib/photoapp-server/CHANGELOG.md`; Optional Steps Registry resolved (every entry routed to ✅ / 📋 / ⏭️ / 🚫); no Part 03 regression; `MetaFiles/refactor-log.md` carries the full execution-arc record.

---

## Suggested Commit Points (rolled up from Approach docs)

The Approach docs each have *Suggested Commit Points* sections; these are the **workstream-level** rollups the agent can use as milestone commits when granular per-step commits aren't appropriate. Always prefer the per-phase commits documented inside each Approach doc; the rollups below are emergency / batched-execution fallbacks.

- After Phase 0: `chore(monorepo): library-1.0.0 extraction acceptance green`
- After Phase 1: `feat(infra): part 02 foundation - compose, terraform, observability, error middleware, pool, lint, openapi, test harness`
- After Phase 2 + Gradescope green: `feat(server): part 02 web service - 6 spec-compliant routes on layered architecture (60/60 gradescope)`
- After Phase 3 + Gradescope green: `feat(client): part 02 client api - photoapp.py rewrite to call web service (30/30 gradescope)`
- After Phase 4: `feat(server): part 02 engineering surface - v2 presigned urls, idempotency, tracing, alarms; library 1.1.0`

Conventional Commits scopes in use: `feat(server)`, `feat(client)`, `feat(infra)`, `feat(lib:photoapp-server)`, `fix(*)`, `chore(*)`, `test(*)`, `docs(*)`, `refactor(*)`.

---

## Out of scope — reaffirmed

The following live in `Future-State-cicd.md` (same directory) and are deferred until Project 02 Part 02 (EB deployment) ships:

- GitHub Actions CI workflow (PR validation, parallel lint/test/plan jobs)
- Dev/prod deploy workflows (OIDC + ECR + EB rollback-gated deploy)
- Nightly live regression workflow
- Operator runbook + composite setup action
- AWS OIDC + ECR Terraform modules
- Branch protection enforcement via required status checks

Until that workstream lands, the *local equivalents* documented in `Future-State-cicd.md`'s footnote serve as the pre-submit checklist (`make lint` / `make test` / `terraform plan` / `tools/smoke.sh` / `make submit-server` / `make submit-client`).

---

## Plan provenance

- **Authored:** 2026-05-01 during Project 02 Part 01 quest opening.
- **Source:** `00-overview-and-conventions.md` + `00-shared-library-extraction.md` + `01-foundation.md` + `02-web-service.md` + `03-client-api.md` + `04-engineering-surface.md` + `Future-State-cicd.md` (all in this directory).
- **Sibling artifact:** `MBAi460-Group1/projects/project02/client/MetaFiles/OrientationMap.md` (to be authored next; derives Active section from this Plan's Master Tracker).
- **Plan-vs-Approach posture:** lightweight orchestration; per-step content stays in the Approach docs.
- **VCS posture:** feature branches per workstream; merge over rebase (per `feedback_preserve_parallel_collaborator_signal.md`); formal Lab VCS strategy decision queued at `MBAi460-Group1/MetaFiles/TODO.md`.
- **Frame integration:** top-of-plan Frame block + per-workstream Frame-shaped tracker entries (experimental; mining what works at SD-5 per Focus 2 of `claude-workspace/scratch/system-plane-notes.md`).
