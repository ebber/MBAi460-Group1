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
> **Last updated:** 2026-05-04 — Catch-and-Merge quest declared. Step 0 (pre-flight) ✅ — main intact at `d2e039c` + tag `library-1.0.0-extraction-complete` + working tree clean + collaborator branches discovered (`feat/p02-foundation` @ `685b501` / `feat/p02-gradescope-mvp` @ `e3d9a58`) + Docker dev env operational + AWS lab spun-down (queued for Step 4 sub-frame). Step 1 (assessment scaffolding) is the next sub-phase.

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
- 🔄 **Step 1** — Assessment scaffolding — `projects/project02/client/MetaFiles/code-reviews/00-assessment-criteria.md` drafted 2026-05-04; awaiting Erik checkpoint per Mermaid-checkpoint pattern (Choice 1 from Session Operating Principles); flips to ✅ on sign-off, then Step 2a entry
- [ ] **Step 2** — Assess branches:
  - [ ] **Step 2a** — Parallel subagent audits (audit-before-author shape per system-plane reflection)
  - [ ] **Step 2b** — Branch-vs-branch comparison (main context synthesis)
  - [ ] **Step 2c** — Pick merge strategy from F catalog informed by 2a + 2b; document chunking
- [ ] **Step 3** — Execute merge sequence (chunked per 2c; tests after each chunk; inline merge-execution notes)
- [ ] **Step 4** — End-to-end verification:
  - [ ] **Step 4 sub-frame (conditional)** — Lab spin-up if `utils/lab-status` shows down: `utils/lab-up` → wait for RDS ready → `utils/smoke-test-aws --mode live` 10/10
  - [ ] Full battery: workspace tests / freshclone-smoke / docker build / package-submission / live regression / smoke-test-aws
- [ ] **Step 5** — Reconcile Plan + this Map with reality (atomic substep updates against on-disk evidence; flag any inversions)
- [ ] **Step 6** — Write review deliverables (4 artifacts under code-reviews/)
- [ ] **Step 7** — Push-readiness checks
- [ ] **Step 8** — Push to main (team's direct-to-main flow)
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

- **AWS lab spun-down** (`utils/smoke-test-aws --mode live` returned 3/10 on 2026-05-04). Same state as 2026-05-02. Step 4 sub-frame trigger; not blocking now.
- **Branch divergence on architectural philosophy.** Branch A (Approach-aligned full Foundation) vs Branch B (surgical PDF-spec MVP on instructor baseline). Step 2c strategy decision will hinge on this. Default lean noted as integration-branch + curated reconciliation (F catalog).
- **Three guaranteed merge conflicts** if sequential merge attempted: `package-lock.json`, `projects/project02/server/app.js`, `projects/project02/server/package.json`. Strategy choice in 2c should account for these.

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
