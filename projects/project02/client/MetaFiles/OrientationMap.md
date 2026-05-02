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
> **Last updated:** 2026-05-02 — Phase 0.1 (Workspace Bootstrap) ✅ closed (commits `9b4bf47` + `38f258b`); Mermaid + lib-symlink-check Optional Steps Built; Phase 0.2 (mechanically pure service-core extraction) is the next sub-frame.

---

## Frame Position (where this Map sits)

```
- Back:  Spin-Up Ritual + git posture cleanup + Project 02 Part 01 quest declared
         + Approach analyzed (~5000 lines across 7 docs) + Plan.md authored & committed (2385bb5)
- Now:   Orchestration scaffolding complete (Plan + Map both authored); execution arc ready
- Next:  Execution handoff decision (subagent-driven / inline / multi-clone); first
         workstream pickup is Phase 0 (Library Extraction) — entry gate; everything else gates on it
- Down:  Phase 0 (next sub-frame to enter when execution begins)
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

**🔄 Phase 0 — Library Extraction** (entry-gate workstream; In Progress on branch `feat/lib-extraction` since 2026-05-02)

```
[Frame Instance: Phase 0 — Library Extraction]

Purpose:
- Extract Part 03's service core into @mbai460/photoapp-server@1.0.0; Part 03
  becomes a consumer post-extraction; Project 02 will be a second consumer in
  Phase 1. Mechanically pure extraction (CL9) — only behaviour change is the
  bounded SQL-into-repositories refactor in Phase 0.3.

Position:
- Back: Project 02 Part 01 quest declared; Plan + Map authored, committed,
  pushed (06c0250). Pre-flight gates verified 2026-05-02.
- Now: Phase 0 pickup — feat/lib-extraction branch live; refactor-log seeded;
  Mermaid render in flight (review checkpoint pending).
- Next: Phase 0.1 (Workspace Bootstrap) — npm workspace root + .npmrc +
  .gitattributes; first commit chore(monorepo): introduce npm workspaces with
  lib/photoapp-server skeleton.
- Down: 6 internal phases — 0.1 Workspace Bootstrap → 0.2 Service-Core
  Extraction (mechanically pure) → 0.3 Repository Layer (CL9 reconciliation)
  → 0.4 Update Part 03 to Consume → 0.5 Doc-Freshness Protocol → 0.6 Acceptance.
- Up: Project 02 Part 01 quest.

Scope:
- In:
  - MBAi460-Group1/lib/photoapp-server/ (new) — extracted service core, repos,
    middleware factories, envelopes, row converters
  - MBAi460-Group1/package.json + .npmrc + .gitattributes — npm workspace root
  - MBAi460-Group1/CONTRIBUTING.md (new) — workspace etiquette, lockfile, library protocol
  - MBAi460-Group1/MetaFiles/DOC-FRESHNESS.md (new) — onboarding-doc protocol
  - MBAi460-Group1/MetaFiles/TODO.md (new) — Optional-Steps queue schema
  - MBAi460-Group1/projects/project01/Part03/server/ (modify) — consume the library
  - MBAi460-Group1/projects/project01/Part03/Dockerfile (modify) — workspace-aware copy pattern
  - .github/pull_request_template.md (new) — onboarding-impact + library label
  - lib:photoapp-server GitHub label (new)
  - learnings/2026-XX-XX-photoapp-server-extraction.md (new) — CL9 reconciliation log
- Out:
  - Any change to Part 03 /api/* wire contract (CL2 internals-only)
  - Project 02 server tree (Phase 1)
  - Project 02-specific middleware promotions (request_id, validate, pino-http,
    OTel) — YAGNI per CL2 until 3rd consumer
  - Infrastructure / Terraform changes

Workset:
- Approach: 00-shared-library-extraction.md (697 lines)
- Branch: feat/lib-extraction
- Refactor-log: projects/project01/Part03/MetaFiles/refactor-log.md (seeded 2026-05-02)
- Files moving from Part 03 → lib/photoapp-server/src/:
  config.js • services/aws.js • services/photoapp.js • middleware/error.js
  (becomes factory) • middleware/upload.js (becomes factory) • schemas.js
  (splits → schemas/envelopes.js + schemas/rows.js)
- Files NEW in lib/photoapp-server/src/repositories/: users.js, assets.js,
  labels.js (CL9 SQL-from-services extraction)

State: 🔄 In Progress

Entry Conditions:
- ✅ Lab status PASS (utils/lab-status 2026-05-02)
- ✅ Class Project main clean + synced with origin/main (06c0250)
- ✅ Part 03 regression baseline: 77 passed, 2 skipped (live-gated), 0 failed
- ✅ No in-flight Part 03 PRs (Erik manual confirm 2026-05-02)
- ✅ Branch feat/lib-extraction created
- ✅ Pickup announcement in Part 03 refactor-log
- ⏳ Slack heads-up posted (Erik action; draft prepared)

Exit Conditions:
- All 6 sub-phases ✅
- Part 03 npm test green throughout (regression baseline maintained)
- Part 03 live regression green (PHOTOAPP_RUN_LIVE_TESTS=1)
- Workspace-aware Dockerfile + Gradescope packaging script working
- lib:photoapp-server GitHub label live; PR template updated
- DOC-FRESHNESS.md exists; CONTRIBUTING.md authored; lib README authored
- MetaFiles/TODO.md schema established (Phase 0.5.7)
- Fresh-clone smoke test passes (CL11)
- Tag library-1.0.0-extraction-complete on merge

Verification:
- cd MBAi460-Group1 && rm -rf node_modules && npm install (clean state succeeds)
- npm test --workspaces (every workspace's tests green)
- cd projects/project01/Part03 && npm test (surface tests green)
- cd lib/photoapp-server && npm test (lib tests green)
- PHOTOAPP_RUN_LIVE_TESTS=1 npm test (live regression green)
- docker build -t mbai460-server-test projects/project01/Part03/ (workspace-aware)
- utils/cred-sweep (no leaks)
- utils/smoke-test-aws (env intact)

Resumption (per state):
- If Planned: read Approach 00-shared-library-extraction.md end-to-end; ensure
  pre-flight gates are still green; begin Phase 0.1.
- If In Progress: read this Active section + recent git log on feat/lib-extraction
  + refactor-log.md to find current sub-phase. Verify last commit's claims
  against file state (adversarial Phase 2 stance per feedback_refresh_ritual.md).
- If Verified at sub-phase: update tracker + continue to next sub-phase.
- If Blocked: capture in refactor-log + surface to user.
```

**Sub-phase progress** (lifted from Plan.md § Phase 0):

- [x] **Phase 0.1** — Workspace Bootstrap ✅ 2026-05-02 (commits `9b4bf47` + `38f258b`)
- [ ] **Phase 0.2** — Extract Service Core mechanically pure (§ Phase 2)
- [ ] **Phase 0.3** — Repository Layer (CL9 bounded reconciliation; § Phase 3)
- [ ] **Phase 0.4** — Update Part 03 to Consume the Library (§ Phase 4)
- [ ] **Phase 0.5** — Doc-Staleness Prevention Protocol (CL11; § Phase 5)
- [ ] **Phase 0.6** — Acceptance + branch-protection update + tag (§ Phase 6)

---

## Pending (queued by dependency)

Frame-compact rows derived from the Plan's Master Tracker. Each row references the full Frame block in `Approach/Plan.md` for complete fields; the Map carries the *cursor view*.

| Workstream | State | Branch | Depends on | Acceptance | Approach pointer |
|---|---|---|---|---|---|
| **Phase 0 — Library Extraction** | 🔄 **In Progress** (Active) | `feat/lib-extraction` | NONE | `library-1.0.0-extraction-complete` tag; lib + Part 03 tests green; live regression green; fresh-clone smoke green | `Approach/00-shared-library-extraction.md` |
| **Phase 1 — Foundation** | ⏳ Planned | `feat/p02-foundation` | Phase 0 ✅ | `make up` healthy; six-layer harness in place; lint clean; Terraform `state mv` cutover green | `Approach/01-foundation.md` |
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

Empty — execution has not started.

When workstreams close, rows land here with the workstream name, completion date, closeout commit chain, and key milestones. Historical OrientationMap precedent for the row shape: see `projects/project01/Part03/MetaFiles/OrientationMap.md` § *Closed (recent — Class Project)*.

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
