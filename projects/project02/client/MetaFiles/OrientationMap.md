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
> **Last updated:** 2026-05-02 — **Phase 0 ✅ closed (agent-side); workstream moved to Closed.** All six sub-phases complete; 23 commits on `feat/lib-extraction`; lib 99/99 + Part 03 32+2 skipped green; freshclone-smoke ~3s green. Erik post-merge actions: spin lab + run live AWS regression (gates the tag), update GitHub branch protection + create `lib:photoapp-server` label, tag merge commit `library-1.0.0-extraction-complete`. **Active section reverted to "between workstreams"** per OrientationMap protocol; Phase 1 (Foundation) is the next pickup once Phase 0 is merged.

---

## Frame Position (where this Map sits)

```
- Back:  Phase 0 (Library Extraction) ✅ closed agent-side 2026-05-02 across 23 commits
         on feat/lib-extraction (lib 1.0.0 extracted; Part 03 consumer migrated;
         CL9 SQL repos + characterization; doc-freshness protocol live;
         freshclone-smoke green). Phase 0 row in Closed section.
- Now:   Between workstreams. Awaiting Erik to push feat/lib-extraction, run live
         AWS regression + smoke-test-aws (lab spin-up first), update GitHub branch
         protection + lib:photoapp-server label, merge, and tag
         library-1.0.0-extraction-complete on the merge commit.
- Next:  Phase 1 (Foundation) — the next pickup once Phase 0 is merged. Branched
         off feat/p02-foundation from main; consumes the now-stable @mbai460/photoapp-server.
- Down:  (empty — between sub-frames)
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

**Between workstreams.** Phase 0 ✅ closed agent-side 2026-05-02 (see *Closed (recent — this quest arc)* for the row + commit chain). Phase 1 (Foundation) is the next pickup once Erik merges `feat/lib-extraction` and tags `library-1.0.0-extraction-complete` on the merge commit.

**To pick up Phase 1:** read `Approach/01-foundation.md` end-to-end, verify pre-flight gates (root `main` carries the merged Phase 0 work; `npm install` from root resolves the workspace; `npm test --workspaces` green; `utils/lab-status` PASS), then branch `feat/p02-foundation` from `main` and follow `Plan.md` § Phase 1 Master Tracker. The Active section flips to a Phase 1 Frame instance at that point.

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
