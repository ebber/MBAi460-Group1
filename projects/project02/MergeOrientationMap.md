# Orientation Map — Catch-and-Merge Quest

> **For:** Post-compaction orientation + step-level navigation through this quest. Read this **first** when resuming after a context break (per `claude-workspace/memory/feedback_refresh_ritual.md` Phase 2 — Map is the structured starting hypothesis to verify, not the ground truth itself).
>
> **Updated atomically** at each step close-out, never from prediction (per `claude-workspace/memory/feedback_atomic_substep_updates.md`).
>
> **Quest scope:** reconcile two collaborator branches (`feat/p02-foundation` @ `685b501` and `feat/p02-gradescope-mvp` @ `e3d9a58`) — both branched from the post-Phase-0 main at `d2e039c` — into a clean main, with per-branch + comparison + process-retrospective code reviews authored as durable artifacts. End state: merged main, updated trackers reflecting on-the-ground reality, collaborators thanked, next workstream selected.
>
> **Why this is its own quest, not a sub-phase of Phase 1:** the catch-and-merge has its own deliverables (4 review files + a merge), its own acceptance gate (push to main + collaborators thanked + assessment archived + next-quest-selected), and its own characteristic risk profile (uncoordinated parallel work reconciliation across divergent design philosophies). Workstream-shaped, not sub-phase-shaped.
>
> **Predecessor Map:** `projects/project02/legacy_PlanningOrientationMap.md` — the Project 02 Part 01 planning + Phase 0 (Library Extraction) arc. Frozen 2026-05-02 at "between workstreams" pause point. Phase 0 closeout row (commit chain, test state, milestone bullets) lives there.
>
> **Compass relationship:** there is **no Compass section in this Map**. The lite Compass (`← Back / ● Now / → Next / ↓ Down / ⬆ Up`, 5-direction) is in-chat only, printed at the end of in-conversation responses during active execution, and is derived on-the-fly from this Map's Active section + current Frame nesting. The Map is the authoritative durable state; the Compass is its ephemeral conversational echo. Compaction loses the Compass (convenience), not the Map (authority).
>
> **Lifecycle:** This Map is grounded in the Catch-and-Merge quest. When the quest closes (Step 11 select-next executes), this Map's Active section reverts to "quest closed; see <successor>" and the Phase rows from the parent Project 02 Part 01 plan re-anchor in whatever new Map the next quest needs.
>
> **Last updated:** 2026-05-05 — **STALE / SUPERSEDED.** The Catch-and-Merge quest's Steps 7-11 (push, merge-to-main, collaborator notes, quest-close, next-quest-select) were executed implicitly between sessions; the merged main was the foundation for the subsequent Project 02 Phase 2.10 Gradescope-debugging arc. That arc closed 2026-05-05 with **90/90 on Gradescope** (server 60/60 + client 30/30). Authoritative state for the closed arc lives in `projects/project02/client/MetaFiles/Approach/Plan.md` § Phase 2.10 (16-iteration trajectory) + `projects/project02/MetaFiles/retrospective-2026-05-05-gradescope-90-90-arc.md` (full retrospective). **No new quest declared yet** — open candidates: Phase 4 (engineering surface /v2 routes), credential rotation post-grading, refactor-log case study, packaging-smoke contract test. When a successor quest opens, this Map either rotates with `legacy_` prefix (if its closeout is durable historical reference) or is archived. **Previous "Last updated" content (2026-05-04) preserved below for historical reference.**
>
> **2026-05-04 (preserved):** (Refresh Ritual Phase 2 trace + Map reconciliation pass + bug-remediation frame for pytest 500s) — **Steps 0–3 + 5 + 6 ✅; Step 4 sub-frame ✅ (lab spin-up); Step 4 full battery ✅ (5/6 pytest PASS post-fix, test_02 fixture-mismatch queued separately per Erik path-C 2026-05-04); Steps 7–11 ⏳.** Integration branch `merge/collab-reconciliation` will carry **22 commits ahead of `main`** after the bug-fix commit (server.js lib config bridge). All test gates green at fix tip: lib 104 + Part 03 32+2 skipped + project02/server 81+13 skipped + Part 03 live 34/34 + project02/server live 83/94+11 + pytest 5/6. Branch artifact sweep + tracker reconciliation + OpenAPI yaml Q2 fix + lib config bridge all landed. Merge commit message drafted at `projects/project02/MetaFiles/merge-commit-message.draft.md`. **Next:** Step 4 close-pause (Mermaid checkpoint) → Step 7 push-readiness → Step 8 merge-to-main via `--no-ff`.
>
> **Numbering note (2026-05-04 trace finding):** Map sub-phase checklist uses 0-indexed scheme (0–11). Some commit messages and the refactor-log used 1-indexed ("Step 7 tracker reconciliation" = Step 5 in this Map). Substance was correct in both schemes; labels drifted during autonomous run. Going forward, this Map's 0-indexed scheme is canonical.

---

## Frame Position (where this Map sits)

```
- Back:  Project 02 Part 01 Phase 0 (Library Extraction) ✅ closed + merged to main
         + tagged library-1.0.0-extraction-complete (commit d2e039c, 2026-05-02);
         two collaborators branched off and executed Phase 1 / Phase 2-ish work
         independently. Predecessor Map at legacy_PlanningOrientationMap.md.
- Now:   Catch-and-Merge quest declared 2026-05-04. Pre-flight ✅; both
         collaborator branches discovered + first-pass characterized as
         architecturally divergent (one Approach-aligned full Phase 1 + Phase 2
         scaffolding; one surgical PDF-spec MVP on the instructor baseline).
- Next:  Step 1 — author projects/project02/client/MetaFiles/code-reviews/
         00-assessment-criteria.md as the criteria scaffolding; Erik checkpoint
         before Step 2.
- Down:  11-step approach (the sub-phases of THIS quest):
         0. Pre-flight ✅
         1. Assessment scaffolding (criteria file + Erik checkpoint)
         2. Assess branches (2a parallel audits / 2b comparison / 2c strategy pick)
         3. Execute merge sequence
         4. End-to-end verification (lab-up sub-frame if needed)
         5. Reconcile trackers with reality
         6. Write review deliverables (4 artifacts)
         7. Push-readiness checks
         8. Push to main
         9. Send notes to collaborators
         10. Close the catch-and-merge quest
         11. Select next execution (likely Phase 2 or finish-Phase-1 conditional on Step 2 findings)
- Up:    Project 02 Part 01 quest (parent arc; spans library + server + client + infra
         from Phase 0 through Phase 4). Catch-and-Merge is one quest within it.
```

---

## Status legend

Map status symbols mapped to Frame `State` semantics (per `Approach/Proposed_Execution_Frame_Template.md` style equivalents in `claude-workspace/recommendations/`):

| Symbol | Map meaning | Frame `State` equivalent |
|---|---|---|
| ⏳ | Queued / planned — not yet started | `Planned` |
| 🔄 | In progress — actively being worked by this agent | `In Progress` |
| 🟡 | In-flight async — work happening outside this agent's direct execution (collaborators, Erik handles outside, async humans, background processes) | `In Progress` (external) |
| 🌗 | Partially complete — some sub-units done, others pending; may be a hybrid state where collaborators landed partial work that needs reconciliation | `In Progress` (mixed) |
| ✅ | Complete — work confirmed via file evidence + commit | `Verified` → `Complete` |
| 🚩 | Blocked / flagged for attention (also continuity-discrepancy flags per `feedback_flag_emoji.md`) | `Blocked` |
| ⚠️ | Executed pre-approval — reverification required at next resumption | (anti-pattern flag; pre-ritual action) |

---

## Active

**🔄 Catch-and-Merge** (the quest itself; In Progress on branch `main` working tree since 2026-05-04)

```
[Frame Instance: Catch-and-Merge — Project 02 collaborator branch reconciliation]

Purpose:
- Reconcile two collaborator branches (feat/p02-foundation + feat/p02-gradescope-mvp)
  into main, producing 4 durable review artifacts (per-branch x2 + comparison +
  process retrospective), with trackers reflecting actual on-the-ground state at
  close. Selecting the next quest (likely Phase 2 or finish-Phase-1) is the
  closeout deliverable.

Position:
- Back: Pre-flight Step 0 ✅ — main + tag intact, working tree clean, both
  collaborator branches discovered + first-pass characterized.
- Now: Step 1 (assessment scaffolding) is the next sub-phase. Authoring the
  criteria file + Erik checkpoint before Step 2.
- Next: Step 2a — parallel-subagent audits of each branch against the criteria
  rubric, returning structured assessments.
- Down: (empty — Step 1 is a single-author task with Erik checkpoint, no further
  decomposition needed at this scope)
- Up: Project 02 Part 01 quest.

Scope:
- In:
  - projects/project02/client/MetaFiles/code-reviews/ (new directory; 5 files
    over the run: 00-assessment-criteria + per-branch x2 + comparison +
    process retrospective)
  - projects/project02/server/ + projects/project02/client/ — surface where
    collaborator work lands; reconciliation produces the on-disk merged state
  - projects/project02/MergeOrientationMap.md (this file) — atomic substep updates
  - projects/project02/client/MetaFiles/Approach/Plan.md — tracker reality
    reconciliation in Step 5
  - projects/project02/legacy_PlanningOrientationMap.md — existing artifact;
    no further updates expected (frozen)
  - main — receives the merged result via team's direct-to-main flow
- Out:
  - Library (lib/photoapp-server) — Phase 0 closed; no further changes during this quest
  - Part 03 (projects/project01/Part03) — frozen post-Phase-0 merge; no further changes
  - AWS resources — lab spin-up via utils/lab-up authorized for Step 4 sub-frame ONLY;
    other AWS-touching work out of scope
  - Phase 2/3/4 forward execution — happens in successor quests after this closes

Workset:
- Branches:
  - feat/p02-foundation @ 685b501 — author: pranavvaranasi1254 (Pranav Varanasi);
    7 commits, 91 files (+7261/-582); full Phase 1 Foundation + 8 routes;
    lib-consumer wiring; full test pyramid
  - feat/p02-gradescope-mvp @ e3d9a58 — author: andrew-apple (Andrew Apple);
    7 commits, 10 files (+400/-160); surgical PDF-spec corrections to
    instructor-baseline api_*.js; Python client + tests touched
- Pre-flight diagnostics in Step 0 message thread (commit topology, churn,
  overlap files: package-lock.json + projects/project02/server/{app.js,package.json})
- Coordination context: collaborators knew about each other but did NOT
  coordinate scope (per Erik 2026-05-04); both started from d2e039c (same
  baseline). Architectural divergence is structural, not just content.
- Quest-open record: projects/project02/MetaFiles/refactor-log.md § 2026-05-04
- Assessment contract: projects/project02/client/MetaFiles/code-reviews/00-assessment-criteria.md
- Lab state: Docker dev env operational (utils/lab-status PASS); freshclone-smoke
  against main PASS ~3-4s; AWS lab spun-down (RDS missing, S3 ACLs absent —
  same state as 2 days ago; Step 4 sub-frame trigger via utils/lab-up)

State: 🔄 In Progress

Entry Conditions:
- ✅ Pre-flight pass (Step 0 — main + tag + working tree + lab-status verified)
- ✅ Both collaborator branches visible locally (post Erik fetch)
- ✅ Branch first-pass characterization complete (commit topology, churn, overlap surface)
- ✅ Plan + this Map authored before forward execution
- ⏳ Step 1 criteria file Erik checkpoint (gates Step 2 entry)

Exit Conditions:
- All 11 steps ✅
- 4 review artifacts authored under projects/project02/client/MetaFiles/code-reviews/
- Plan + this Map reflect on-the-ground reality (Step 5 reconciliation pass)
- main pushed with merged collaborator work (Step 8)
- Collaborators thanked / outstanding items surfaced (Step 9)
- Next quest selected + handoff prepared (Step 11)

Verification:
- npm test --workspaces (every workspace's tests green at merged main)
- utils/freshclone-smoke (CL11 doc-staleness gate)
- docker build + container boot
- tools/package-submission.sh + tarball test (if Part 03 surface affected)
- PHOTOAPP_RUN_LIVE_TESTS=1 cd projects/project01/Part03 && npm test (if lab spun up in Step 4)
- utils/smoke-test-aws --mode live (10/10 if lab is up; otherwise queued)
- utils/cred-sweep delta (no NEW credential patterns since last main commit)

Resumption (per state):
- If Planned (pre-Step 1): read this Active Frame + Step 0 results in chat / commit
  log; verify pre-flight conditions still hold; begin Step 1.
- If In Progress (Steps 1–10 mid-flight): read this Active Frame's Step Progress
  checklist + recent merge-execution log notes (Step 3 produces these inline) +
  recent commits on main to find current step. Verify last commit's claims
  against file state (adversarial Phase 2 stance).
- If Verified at step: update sub-phase progress checklist below + continue.
- If Blocked: capture in chat + flag in this Map's Live findings section.
```

---

## Sub-phase progress (the 11 steps)

- [x] **Step 0** — Pre-flight ✅ 2026-05-04 — main + tag intact, working tree clean, both collaborator branches discovered + first-pass characterized (`feat/p02-foundation` @ `685b501` by **pranavvaranasi1254**; `feat/p02-gradescope-mvp` @ `e3d9a58` by **andrew-apple**), Docker dev env up, AWS lab spun-down (Step 4 sub-frame trigger queued), `utils/freshclone-smoke` against `main` PASS ~3-4s (base stable post-Phase-0 merge), `projects/project02/MetaFiles/refactor-log.md` quest-open entry authored.
- [x] **Step 1** — Assessment scaffolding ✅ 2026-05-04 — `projects/project02/client/MetaFiles/code-reviews/00-assessment-criteria.md` (290+ lines: 9 dimensions / academic grade scale / 4-tier severity / evidence rubric / per-branch + comparison + retrospective templates / depth-where-merited clause); Erik checkpoint sign-off received per Choice-1 Mermaid-checkpoint pattern
- [x] **Step 2** — Assess branches ✅ 2026-05-04:
  - [x] **Step 2a** — Parallel subagent audits (audit-before-author shape per system-plane reflection) ✅ — two `superpowers:code-reviewer` subagents dispatched in parallel; both wrote their per-branch reviews to disk and returned ~150-word syntheses. Reviewer A's original `_assignment-template/` source attribution corrected in-place after main-context git verification (substance unchanged; the byte-identical files come from the instructor baseline at `d2e039c`, restored by `685b501`).
  - [x] **Step 2b** — Branch-vs-branch comparison (main context synthesis) ✅ — `2026-05-04-merge-comparison.md` authored. Per-dimension comparison: Branch A wins 5 dimensions (Code Elegance / Supporting Work / Codebase Alignment / Plan Progress / Cross-cutting); Branch B wins 2 (Functional Completeness / Strengths count); 2 ties (Test Quality with caveats / Commit Hygiene both A-range).
  - [x] **Step 2c** — Pick merge strategy ✅ — **CURATE-AND-PICK** chosen. Rationale: branches are complementary, not redundant; A built Phase 1 Foundation, B built Phase 2 + 3 surface work. Sequential merge ships A's flawed `685b501`; integration-branch alone doesn't solve curation; discarding either loses real value. 8-chunk plan documented in the comparison file with test gates per chunk.
  - [x] **Step 2 verification gate** ✅ 2026-05-04 (Erik smell-check question prompted; not original to plan) — main-agent ran tests against both branches in tmp clones to verify subagent review claims. Branch A: lib 104/104 (Pranav's CL9 envelope expansion verified) + project02/server 64 passed / 13 skipped (full pyramid runs); Branch B: lib 99/99 (untouched) + no project02/server tests (matches review Dim 6 finding). Part 03's 4 SPA-fallback test failures appear on BOTH branches AND on main-without-build-artifacts → inherited system gap from `frontend/dist/index.html` not being in git, NOT a branch regression. Pranav review had 2 citation-class errors corrected in-place (`_assignment-template/` source + 2 inflated app.js line numbers); substance verified at-byte-level. Subagent prompt template minimal upgrade authored in retrospective for the next dispatch. Pattern caught: depth-vs-breadth tradeoff in subagent dispatch quality — main-context citation-spot-check is non-optional structural follow-up for large-scope audits.
- [x] **Step 3** — Execute merge sequence ✅ 2026-05-04 (chunked per 2c; tests after each chunk):
  - [x] **Chunk 1 ✅** — integration branch `merge/collab-reconciliation` created from `main`; 6 Foundation commits cherry-picked code-only (e6923d3 → 6347c95 → 78fb7db → 7a5131c → 5581051 → 2e88078, becoming 92cb003 → 85e971b → 8a8a4bd → f7f18ab → 8d2fc38 → fd62ecd). Tracker filter clean. Close gate: lib 104/104 (CL9 +5 verified) + Part 03 32+2 skipped + project02/server 64+13 skipped + lib-symlink-check 7/7. Conflicts on tracker files resolved per documented mechanic.
  - [x] **Chunk 2 ✅** — `685b501` skipped (documented in Chunk 3's commit body); baseline-restore mislabeled as "implement" → not carried forward.
  - [x] **Chunk 3 ✅** — Branch B's spec-correct route handlers ported into A's `routes/v1/` structure; CL9 lib-touching change (downloadImage userid expansion) + 8 route handlers + 17 integration tests added. Commit `04f7ee5`. Test gate: project02/server 81+13 skipped (was 64+13; +17 from new tests).
  - [x] **Chunk 4 ✅** — Branch B's Python client commits cherry-picked code-only (acc4063 → f0631a8; e3d9a58 → 46aa803). Syntactic gate: photoapp.py + tests.py parse cleanly. Integration tests (require live server) deferred to Chunk 6.
  - [x] **Chunk 5 ✅** — Final consolidation pass: all workspace tests green (lib 104 + Part 03 32+2 skipped + project02/server 81+13 skipped); freshclone-smoke PASS in ~4s; lib-symlink-check 7/7; app.js mount order verified correct.
  - 🟡 **Chunk 6** — full E2E with lab spin-up sub-frame — **PINNED 2026-05-04 (Erik stepping away mid-chunk)**. utils/aws-probe authored as the diagnostic entry point (commit `711254c`). Lab status confirmed DOWN (3/10 from probe); lab was stopped (not destroyed) per Erik so most likely path is `aws rds start-db-instance` after probe confirms. Stages B/C/D blocked on Stage A output. See Pinned section in Live findings for resumption.
  - [x] **Chunk 6.5 ✅** — 🛑 BREAKPOINT printed; Erik responded with greenlight to continue autonomous run with mutation floor (everything stays on integration branch; no main mutations).
- [x] **Step 4** — End-to-end verification ✅ 2026-05-04:
  - ✅ **Step 4 sub-frame** — **AWS lab spin-up confirmed live 2026-05-04 by Erik.** Post-pinning fixes landed: `aws-probe` profile-chain + secrets-absent (commit `523026d`), `aws-probe` smoke-test timeouts (`d14e152`), SQL parser semicolon→comma fix in `create-photoapp.sql` (`b2436ca`). Erik ran `utils/aws-probe` (per recommended-action: `aws rds start-db-instance`), then `utils/rebuild-db` re-seeded schema, smoke 10/10 confirmed live. `utils/aws-probe` (commit `711254c`) is the durable diagnostic asset for future spin-ups. **TODOs queued (commit `9fece1e`):** `_run_sql.py` parser bug fix; `aws-probe` hang investigation if it recurs; `test/degu.jpg` missing fixture.
  - ✅ **Full battery** — accepted as resolution per Erik path-C 2026-05-04 (5/6 pytest PASS sufficient; test_02 fixture-mismatch genuinely separate scope, queued). Composition: workspace tests ✅ (lib 104 + Part 03 32+2 skipped + project02/server 81+13 skipped — re-verified post-fix, no regression) / freshclone-smoke ✅ ~4s / lib-symlink-check ✅ 7/7 / smoke-test-aws live ✅ 10/10 / Part 03 live regression ✅ 34/34 / project02/server live regression ✅ 83/94 + 11 skipped, 0 failed / **Python pytest 5/6 PASS** (was 0/6 routing-passing before fix). **Diagnostic + fix landed 2026-05-04 post-Refresh-Ritual:** root cause was lib's `services/aws.js` reading `../client/photoapp-config.ini` relative to consumer CWD; project02 had no such file. Fix: project02 server bridges lib config at boot (`server.js` overrides `libConfig.photoapp_config_filename` to absolute path of canonical `projects/project01/client/photoapp-config.ini`, matching `services/pool.js`'s existing pattern). docker build + package-submission gates deferred (not Step 4 close-blockers).
  - [x] **🛑 Step 4 close → Step 5 entry pause** ✅ 2026-05-04 — Transited via Erik greenlight after bug-remediation frame close (Step 5 was already substantively done in autonomous run; close-pause's stated purpose — "verify on-disk reality before authoring trackers" — was already executed during the Refresh Ritual Phase 2 trace). Pause's verification-as-its-own-work principle satisfied.
- [x] **Step 5** — Reconcile Plan + this Map with reality ✅ 2026-05-04 — Substantively landed via commits `bb19b21` (OpenAPI yaml User+Image+DeleteAll schemas adjusted to lib reality; Q2 robustness fix verified by trace 2026-05-04) + `9955b15` ("Step 7 tracker reconciliation" in 1-indexed scheme): Phase 1 Master Tracker 13/13 ✅ (Phase 1.12 ✅ as forward-only per D10); Phase 2 partial entries 🌗 reflecting on-disk routes; Phase 3 partial entries 🌗 reflecting Branch B's Python client; Map sub-phase progress + refactor-log closeout authored. Comparison vs Pranav's claims at `git show 685b501:.../Plan.md`: agreement on all 13 Phase 1 sub-phases; divergence is on Phase 2/3 (Pranav skipped these tracker-wise; we author them based on the merged Chunk 3 + Chunk 4 work). Header reconciliation pass during 2026-05-04 Refresh Ritual Phase 2 trace consolidated post-pinning deltas + corrected numbering drift.
- [x] **Step 6** — Write review deliverables ✅ 2026-05-04 — 4 artifacts authored at `projects/project02/client/MetaFiles/code-reviews/`: `2026-05-04-feat-p02-foundation-review.md` (Pranav, graded) + `2026-05-04-feat-p02-gradescope-mvp-review.md` (Andrew, graded) + `2026-05-04-merge-comparison.md` (CURATE-AND-PICK strategy + 8-chunk plan) + `2026-05-04-process-retrospective.md`. Plus `00-assessment-criteria.md` (Step 1 deliverable) + `2026-05-04-branch-artifact-sweep.md` (Optional bonus per Erik directive 2026-05-04, leveraging Choice-2 default-to-optionals). Reviews authored via Step 2a parallel `superpowers:code-reviewer` subagents + Step 2-verification main-context citation spot-check (caught + corrected 2 errors in Pranav review pre-finalization).
- [x] **Step 7** — Push-readiness checks ✅ 2026-05-04 — All gates green:
  - `npm test --workspaces` ✅ (lib 104/104 + Part 03 32+2 skipped via freshclone + project02/server 81+13 skipped)
  - `utils/freshclone-smoke` ✅ PASS in 4s (CL11 doc-freshness)
  - `utils/cred-sweep` delta clean ✅ (1 pre-existing pattern in `projects/project03/*.sql` + `visualizations/lab-database-schema-v2.md`; not introduced by this branch's commits)
  - `npm run lint` ✅ (0 errors; 1 pre-existing warning at `routes/v1/image_post.js:45` unused `decodeErr` from Chunk 3 port — non-blocking, queued)
  - Prettier auto-fix landed (commit `28dc1a2`) — server.js trailing comma + v1_routes.test.js pre-existing
  - Live regression already verified Step 4: Part 03 live 34/34 + project02/server live 83/94+11 skipped + Python pytest 5/6 PASS (test_02 fixture-mismatch queued)
  - `utils/smoke-test-aws --mode live` ✅ 10/10 (verified Step 4)
  - docker build + package-submission deferred (Part 03 not affected; not Step 7 blockers per current scope)
- 🚩 **Step 8** — Push to main (team's direct-to-main flow) — **GATED 2026-05-04** — system-layer permission denied on `git checkout main` precursor; Erik's "execute through committing" greenlight covered local commits but not main-mutation. Awaiting explicit Step 8 auth. Mutation-gate proposal surfaced: local merge `--no-ff` from `merge/collab-reconciliation` (25 commits ahead) using drafted message; tag `catch-and-merge-complete-2026-05-04`; recovery `git reset --hard d2e039c` if needed (no remote impact pre-push). Push to origin gated separately per `operational_rules.md` ("Ask first for: git push").
- [ ] **Step 9** — Send notes to collaborators (channel TBD)
- [ ] **Step 10** — Close the catch-and-merge quest (this Map → "quest closed"; predecessor pattern: legacy_PlanningOrientationMap.md)
- [ ] **Step 11** — Select next execution (conditional on Step 2 findings; likely Phase 2 or finish-Phase-1)

---

## Pending (queued by dependency)

The Project 02 Part 01 phases that follow this quest. Frame-compact rows derived from the Plan's Master Tracker. Each row references the full Frame block in `Approach/Plan.md` for complete fields; the Map carries the *cursor view*.

| Workstream | State | Branch (target) | Depends on | Acceptance | Approach pointer |
|---|---|---|---|---|---|
| **Phase 1 — Foundation** | 🌗 **Partial** (collaborator work to be reconciled by THIS quest; final state confirmed at Step 5) | `feat/p02-foundation` (existing) + reconciliation result | Catch-and-Merge ✅ | `make up` healthy; six-layer harness in place; lint clean; Terraform `state mv` cutover green | `Approach/01-foundation.md` |
| **Phase 2 — Web Service (60/60)** | 🌗 **Partial** (collaborator work on routes; final state confirmed at Step 5) | TBD (likely a follow-up branch from main) | Catch-and-Merge ✅ + Phase 1 ✅ | Gradescope server **60/60**; tag `gradescope-server-60-60`; contract suite + happy-path E2E green | `Approach/02-web-service.md` |
| **Phase 3 — Client API (30/30)** | 🌗 **Partial** (Branch B touched Python client; scope TBD at Step 5) | TBD | Phase 2 ✅ | Gradescope client **30/30**; tag `gradescope-client-30-30`; integration sweep + contract conformance green | `Approach/03-client-api.md` |
| **Phase 4 — Engineering Surface** | ⏳ Planned | `feat/p02-engineering-surface` | Phase 2 ✅ AND Phase 3 ✅ | engineering surface deliverables green; library 1.1.0 tagged; live regression green | `Approach/04-engineering-surface.md` |

### Out of scope (explicit deferral; tracked for visibility only)

| Workstream | Status | Note |
|---|---|---|
| **Future-State CICD** | ⏸️ Deferred | Out of Project 02 Part 01 scope; captured in `Approach/Future-State-cicd.md`. Local equivalents documented there as the pre-submit checklist until this lands |

### Cross-cutting deliverables (track in Plan; surface here when active)

The Plan's six cross-cutting threads (Testing Pyramid / Utility Building / Mermaid Visualizations / Library-Touching Governance / Doc-Freshness Protocol / Dual-Gradescope Tarball) are *interleaved across* Phases 0–4, not separate workstreams. Catch-and-Merge specifically engages the **Doc-Freshness** thread (CL11 — Plan + Map + Approach updates); other threads engage as they're touched by the merge content (e.g., if Branch A's test pyramid lands, Testing Pyramid thread updates).

Canonical tracking lives in `Approach/Plan.md` § *Cross-Cutting Threads*.

---

## Closed (recent — this quest arc)

Empty — Catch-and-Merge quest is in Step 1 sub-phase. Per protocol § 3, sub-phase closeout rows accumulate here as Steps 1–11 complete. Final quest closeout (Step 10 deliverable) lands as a comprehensive row with: outcome, branch state at close, test state, deliverables list (4 review artifacts + merged main commits), milestones per step, forward-queued risks.

---

## Closed (recent — broader Lab activity, for cold-pickup context)

Lab + Class Project activity since this Map's creation (2026-05-04), surfaced here for any agent reading this Map cold:

**Project 02 Part 01 — predecessor quest closeout (Phase 0 / Library Extraction):**

```
d2e039c Merge Phase 0: @mbai460/photoapp-server library extraction (1.0.0)   (2026-05-02)
        ← tagged library-1.0.0-extraction-complete; 24 commits on feat/lib-extraction
        ← full closeout in projects/project02/legacy_PlanningOrientationMap.md
          § Closed (recent — this quest arc) — read there for the per-sub-phase
          milestone bullets, full commit chain, test state, Optional Steps inventory.
```

**Class Project (`MBAi460-Group1`) — pre-Phase-0 lab activity** (preserved from predecessor Map for cold-pickup completeness):

See `projects/project02/legacy_PlanningOrientationMap.md` § *Closed (recent — broader Lab activity, for cold-pickup context)*. Same content; not duplicating here.

---

## Live findings + small queues

Step 0 pre-flight findings flagged for Step-N visibility:

- **AWS lab still spun-down (re-verified 2026-05-04 pre-Step-3).** `utils/smoke-test-aws --mode live` returns 3/10 PASS — RDS missing, S3 ACLs absent, security group inbound rule missing. Erik's "I just got the lab unblocked (I think)" 2026-05-04 was hopeful; verification confirms the unblock didn't translate to actual `terraform apply`. **Lab spin-up via `utils/lab-up` is the Chunk 6 gate trigger** (mapped to Step 4 of this quest); non-blocking for Chunks 1–5. If `utils/lab-up` fails when invoked → troubleshooting sub-frame per Erik 2026-05-04 directive.
- **Branch divergence on architectural philosophy.** Branch A (Approach-aligned full Foundation) vs Branch B (surgical PDF-spec MVP on instructor baseline). Step 2c strategy: CURATE-AND-PICK (resolved). Chunking plan operational adjustment (code-only cherry-picks; tracker authoring at Step 5) integrated into the comparison file 2026-05-04.
- **app.js at `2e88078` (last Foundation commit before 685b501): 57 lines; NO `/v1/*` routes mounted** (verified 2026-05-04 main-context). Foundation cherry-picks land a clean app.js with no route-spec drift inherited; routes come purely via Chunk 3's port from Branch B. Ideal handoff confirmed.
- **Three guaranteed merge conflicts** if sequential merge attempted: `package-lock.json`, `projects/project02/server/app.js`, `projects/project02/server/package.json`. CURATE-AND-PICK strategy avoids these by chunking around them.
- **📋 Queued (per Erik 2026-05-04 at Chunk 6.5 breakpoint): branch artifact sweep.** Read both collaborator branches looking for VALUE we didn't capture in the merge: structural patterns / code idioms / READMEs / MetaFiles / naming conventions / test design / commenting style — anything signal that came from these fresh agents (not external sources) worth learning from. Output: new file `projects/project02/client/MetaFiles/code-reviews/2026-05-04-branch-artifact-sweep.md`. Timing: post-Chunk-8 (after merge lands on main; keeps merge as discrete shipping unit + lets the sweep inform the NEXT quest's design rather than this quest's tracker authoring). Scope: `feat/p02-foundation` + `feat/p02-gradescope-mvp` (both collaborator branches; skip already-merged `feature/part03-api-and-ui`).
- **📋 Queued (Step 4 bug-remediation frame close 2026-05-04): test_02 fixture-mismatch.** `projects/project02/client/tests.py:test_02` asserts `(M=0, N=3)` — empty users + 3 S3 photos. Current fixture (post-`utils/rebuild-db`) is `(M=3, N=0)` — 3 seeded users + empty S3. Internally inconsistent with `test_03` which depends on the 3 seeded users existing (asserts `[(80001, 'p_sarkar', ...), (80002, 'e_ricci', ...), (80003, 'l_chen', ...)]`). Likely instructor-template legacy assertion that doesn't match this lab's `rebuild-db` seed, OR the fixture is supposed to include a separate "upload 3 reference photos to S3" setup step that hasn't been wired. **Resolution paths:** (a) update test_02 expectations to `(M=3, N=0)` to match seed + test_03; (b) modify fixture/setup script to upload 3 reference photos pre-test; (c) accept 5/6 PASS — chosen by Erik 2026-05-04 path-C. **Trigger to revisit:** before Phase 2.9 / Phase 3.6 Gradescope submission (test_02 may affect grading), OR when `_run_sql.py` parser fix lands (TODO.md item) — both touch the fixture surface. Scope: separate from Step 4 routing fix; `tests.py` is from instructor template + Andrew's Branch B extensions.
- **📋 Queued (lib bug surfaced via bug-remediation frame): pino-vs-console logger.error mismatch in lib error middleware.** `lib/photoapp-server/src/middleware/error.js:52` uses `logger.error('UNHANDLED ERROR:', err)` — console-style two-arg signature. Pino's `logger.error(arg1, arg2)` interprets `arg1` as message + `arg2` as merging object only if `arg1` is a non-format string AND `arg2` is an object — the err arg is silently discarded. Result: "UNHANDLED ERROR" log lines lose the upstream error message + stack entirely (the bug-remediation frame proved this — needed a temporary diagnostic middleware in `app.js` to surface the actual ENOENT). **CL9 fix candidate:** `logger.error({ err }, 'UNHANDLED ERROR:')` — pino-canonical form. **Trigger to revisit:** next library-touching pass (Phase 4.1 OTel tracing or any other Phase 4 lib evolution).

Reserved for in-flight findings the executing agent surfaces during Steps 1–11 (e.g., bugs caught during merge, scope-expansion candidates, optional-step routing decisions, conflict-resolution design notes). See `Approach/Plan.md` § *Optional Steps Registry* for the canonical Optional-Steps tracking surface; small queues for cross-cutting findings will surface here when they emerge.

---

## Update protocol

1. **At each step close-out:** flip status (⏳ → 🔄 → ✅), update pointer/notes, add commit hash if applicable. Update *only after confirmation*, never from prediction.
2. **At step pickup:** if a step has internal sub-frames (e.g., Step 2a/b/c, Step 4's lab-up sub-frame), open the sub-frame as a transient Active section update + nest under the parent step in this Map's progress checklist.
3. **At quest completion (Step 10 deliverable):** move the Active section's full Frame instance into *Closed (recent — this quest arc)* with completion date, full step-by-step closeout summary, deliverables list, milestones, forward-queued risks. Active reverts to "quest closed; see <successor>".
4. **The lite Compass is in-chat only.** Print at the end of every active-execution response, deriving directly from this Map's Active section + current step nesting. There is no on-disk Compass to keep in sync.
5. **Before any forward execution after compaction:** re-read this Map, then perform the Refresh Ritual against it (per `feedback_refresh_ritual.md` Phase 2 adversarial stance). The Active section IS the execution-position claim — verify it against file state, not the other way around.
6. **Cross-cutting threads** (Testing / Utilities / Visualizations / Library / DOC-FRESHNESS / Tarballs) update inside their canonical tracker in `Approach/Plan.md` § *Cross-Cutting Threads*; when they affect Active execution, surface in the Active section's Frame.
7. **Step-5 reconciliation pass** is the formal moment to flip Plan-side checkboxes against on-disk reality from the merged collaborator work. Atomic substep updates apply per sub-step landed; the bulk reconciliation in Step 5 is for items the merge revealed but earlier steps didn't flag.

---

## Notes for cold-pickup readers

- **Quest sphere:** this quest's deliverables land in `projects/project02/` (server + client) + `projects/project02/client/MetaFiles/code-reviews/` (review artifacts) + `main` branch (the merged result). The library (`lib/photoapp-server/`) and Part 03 (`projects/project01/Part03/`) are explicitly out of scope for this quest.
- **Plan + Map relationship:** `Approach/Plan.md` (in `client/MetaFiles/Approach/`) is the parent-quest spec covering Phases 0–4; this Map is execution state for the Catch-and-Merge sub-quest specifically. Plans are stable; Maps are mutable. After Catch-and-Merge closes, the next quest's Map references back to this one for "what landed during the merge."
- **Predecessor Map:** `projects/project02/legacy_PlanningOrientationMap.md` — the planning + Phase 0 arc. Frozen. Do NOT edit further; if you need to add to the Phase 0 closeout record, surface to user instead.
- **Approach docs intentionally have overlap with this Map and the Plan.** Approach owns content; Plan owns orchestration; Map owns current state. Don't treat the overlap as duplication — each artifact has a different stability profile and read-posture.
- **Lab side context:** the agent-internal workspace lives at `claude-workspace/` in the parent lab repo (`mbai460-client/`). System-plane focuses for the Project 02 Part 01 quest are codified at `claude-workspace/scratch/system-plane-notes.md`. Memory at `claude-workspace/memory/`; agent-internal TODO queue at `claude-workspace/TODO.md`.
- **Multi-agent collaboration is via git VCS:** team's current VCS maturity is direct-to-main with fetch / merge / conflict / push (no PRs yet). The Catch-and-Merge quest itself is the response to two collaborators executing in parallel without coordination; the merge is the reconciliation moment.
- **Step 0 pre-flight is complete.** Step 1 (assessment scaffolding) is the active sub-phase. Pickup protocol: read this Active Frame → confirm Step-0 findings still hold against current file state → begin Step 1 from `projects/project02/client/MetaFiles/code-reviews/` directory creation + criteria file authorship.
- **VCS posture for executing agents** is captured in `Approach/Plan.md` § *VCS posture (working assumption pending formal codification)*. The lab-root formal VCS strategy is itself queued at `mbai460-client/MetaFiles/TODO.md` line 4.
