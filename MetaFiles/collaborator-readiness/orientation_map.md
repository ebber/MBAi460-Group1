# Orientation Map — Collaborator Readiness Quest

**Status:** COMPLETE
**Created:** 2026-04-23
**Context:** Standalone quest between assignments — GitHub remote added; collaborators incoming; repo must be immaculate

---

## Execution Arc

| Phase | Name | Status |
|-------|------|--------|
| 0 | Planning — Orient, scope, alignment | ✅ COMPLETE |
| 1 | TODO Surface — Find, triage, execute, verify | ✅ COMPLETE |
| 2 | Structural Audit — Paths, security, artifacts, UX | ✅ COMPLETE |
| 3 | Final Polish — Execute, verify, commit + push | ✅ COMPLETE |
| 4 | Commit + Push — stage all, commit, push to origin/main | ✅ COMPLETE — 2026-04-23 (commit 745ea05; push confirmed) |

### Phase 1 Sub-Steps

| Step | Name | Status |
|------|------|--------|
| 1A | Structured sweep — read all TODO sources | ✅ COMPLETE |
| 1B | Opportunistic scan — inline TODOs, credential patterns, anomalies | ✅ COMPLETE |
| 1C | Triage — assign ack/act/queue/deprioritize to all ~28 items | ✅ COMPLETE |
| 1D | Execute — action all Act items | ✅ COMPLETE |
| 1E | Work Review / Verification — confirm all actions landed correctly | ✅ COMPLETE |
| 1F | Close Phase 1 — update map, return to phase level | ✅ COMPLETE |

### Phase 3 Sub-Steps

| Step | Name | Status |
|------|------|--------|
| 3A | PDF tracking policy — decide track-all vs. gitignore-all; execute | ✅ COMPLETE — 2026-04-23 (track all; Part03 PDF staged) |
| 3B | QUICKSTART walkthrough — simulate fresh collaborator, surface gaps | ✅ COMPLETE — 2026-04-23 (WK-1/WK-2 fixed: IAM key outputs + full config templates) |
| 3C | Credential sweep — grep tracked files for live values | ✅ COMPLETE — 2026-04-23 (clean; SW-2/SW-3 ACKed; EXPECTED-OUTCOMES.md ACKed) |
| 3D | Git status inventory — full change set review and sign-off | ✅ COMPLETE — 2026-04-23 (38 files + 1 staged PDF; confirmed; learnings written; Legacy archived) |
| 3E | Close Phase 3 — update map, hand off to Phase 4 | ✅ COMPLETE — 2026-04-23 |

### Phase 2 Sub-Steps

| Step | Name | Status |
|------|------|--------|
| 2A | Security sweep — gitignore, credentials, .example templates | ✅ COMPLETE — 2026-04-23 |
| 2B | Infra/Tooling sweep — utils/, docker/, terraform/ | ✅ COMPLETE — 2026-04-23 |
| 2C | Docs sweep — QUICKSTART, MetaFiles, README, setup/ | ✅ COMPLETE — 2026-04-23 |
| 2D | Codebase & Artifacts sweep — labs/, projects/, visualizations/ | ✅ COMPLETE — 2026-04-23 (re-swept) |
| 2E | Consolidate + Triage Table — master findings table, classify all items | ✅ COMPLETE — 2026-04-23 |
| 2F | Execute — action all Act items from triage (Blockers first) | ✅ COMPLETE — 2026-04-23 |
| 2G | Erik routing sign-off — review executed actions, route Queue/Deprioritize | ✅ COMPLETE — 2026-04-23 |
| 2H | Close Phase 2 — update map, hand off to Phase 3 | ✅ COMPLETE — 2026-04-23 |

---

## Current State

- **Phase:** 4 → Commit + Push — Phase 3 complete (2026-04-23); full change set confirmed; repo verified immaculate
- **1A/1B summary:** Swept all 6 structured sources + 14 opportunistic findings (B1-B14). Early actions executed: B1/B2 (README fixes), A3 (Terraform profile variable), A4 (AWS_PROFILE default), A5 (docker-run → utils/), A6-A8 (cred-sweep, rebuild-db, rotate-passwords), QUICKSTART.md created. All confirmed on disk (ground-truth verified 2026-04-23).
- **1C note:** Triage table rebuilt as file at `MetaFiles/collaborator-readiness/triage-table.md`. All 28 items triaged and signed off (2026-04-23). B3 unresolved — noted as Unknown in triage table.
- **1D note:** All Act batches complete — Trivial (LE1, B7, B8, B13, LE3, T7-close, T8-close, EP5-close), Quick (B10, T3/B4, T9, T16), Involved (B14, EP4). All 12 Queue items routed.
- **1E note:** 3 gaps found and closed — B10/B14/T3-B4 in MetaFiles/TODO.md were not updated post-execution. Fixed 2026-04-23. infra + visualizations + Part02 queues confirmed correct.
- **Trigger:** GitHub remote added (`git@github-personal:ebber/MBAi460-Group1.git`); `main` tracking `origin/main`; collaborators provision own AWS from scratch
- **Goal:** Repo any collaborator can clone, spin up (full terraform apply), and contribute to without confusion, security risk, or broken tooling

---

## TODO Queue

**Action items surfaced during this quest:** → `MetaFiles/TODO.md` (Class Project root master queue)

**Justification:** Items surfaced by this quest are Class Project-level concerns — they belong in the established root queue alongside other Class Project TODOs. A separate quest queue would fragment the TODO surface. The quest orientation map (this file) handles phase tracking; `MetaFiles/TODO.md` handles the residual action list.

---

## Scope Clarifications (2026-04-23)

| Question | Answer | Impact on Quest |
|----------|--------|----------------|
| Collaborator AWS model | Own accounts; provision own infra from scratch via terraform | QUICKSTART must be fully self-contained; utils/ credential path = 🔴 Blocker |
| Gradescope submissions | Everyone submits independently | Each collaborator needs own `photoapp-config.ini` with their own live credentials |
| `labs/lab03`, `labs/lab04` | Class-provided starter files | Leave as-is; treat as provided artifacts during audit |
| Phase 4 execution plan `[ ]` items | Queued for explicit reverification | Never close without item-by-item confirmation — agent reliability principle |
| Collaborator spin-up model | Full terraform apply from zero | QUICKSTART + infra must work end-to-end for any account |

---

## Scope

**In scope:** Everything inside `MBAi460-Group1/` (the Class Project standalone repo)

**Out of scope:** `mbai460-client/` lab root (separate repo), `claude-workspace/` (agent-private), external AWS infra state (surface findings, confirm before acting)

---

## Classification System (Phase 2)

| Tag | Meaning |
|-----|---------|
| 🔴 Blocker | Would break collaborator setup or execution outright |
| 🟠 Risk | Likely confusion, fragility, or security issue |
| 🟡 Good Practice | Readability / consistency / cleanliness improvement |
| ⬜ Ownership Ambiguity | File without obvious purpose or clear owner |
| ✨ Polish | Small tweaks that make the repo seamless and beautiful |

---

## Phase 0 — Planning

**Goal:** Alignment on scope, approach, open questions answered before any execution

- [x] Identify quest context (GitHub push, collaborators incoming)
- [x] Design three-phase quest structure
- [x] Create this orientation map
- [x] Queue GitHub remote anomaly to `lab-environment.md` workstream
- [x] Erik answers scope questions (collaborator identity, AWS account model, submission model)
- [x] Erik approves quest structure

**→ COMPLETE**

---

## Phase 1 — TODO Surface

**Goal:** Exhaustive TODO discovery across the Class Project — nothing missed, all items routed

**Sweep targets:**

| Location | What to look for |
|----------|-----------------|
| `MetaFiles/TODO.md` | Open `[ ]` items in Active + Backlog |
| `infra/MetaFiles/TODO.md` | Open infra items |
| `visualizations/MetaFiles/TODO.md` | Open viz items |
| `projects/project01/Part02/MetaFiles/TODO.md` | Residual Part02 items |
| `projects/project01/Part02/MetaFiles/plans/execution-plan.md` | Stale Phase 4 `[ ]` checkboxes |
| All code files | Inline `# TODO`, `# FIXME`, `# HACK`, `# XXX` comments |
| `lab-environment.md` workstream | Open near-term priorities |
| Any other plans, MetaFiles | Unclosed items in any format |

**Output format:** Consolidated surface table, one row per item, with ack/act/queue routing

**→ COMPLETE**

---

## Phase 2 — Structural Audit

**Goal:** Comprehensive audit of repo health from the perspective of a collaborator arriving fresh

**Audit areas:**

| Area | What to check |
|------|--------------|
| `utils/` scripts | REPO_ROOT path correctness for standalone clone; CWD requirements; credential paths; Docker deps |
| `QUICKSTART.md` | End-to-end accuracy; missing steps; collaborator-specific gaps (separate AWS account?) |
| `.gitignore` | Coverage completeness for standalone repo; no over/under-ignoring |
| Secrets / credentials | Nothing committed; `.example` templates complete and accurate; hygiene |
| `infra/terraform/` | Hardcoded profile (`ErikTheWizard`); tfstate committing risk; collaborator blockers |
| `labs/` structure | Stale artifacts; confusing co-location; files a newcomer would misread |
| `projects/` structure | Noise; untracked files that would confuse; submission vs. backbone ambiguity |
| `visualizations/` | Naming consistency; accuracy; stale diagrams |
| `MetaFiles/` | Coordination files still relevant; stale content; agent-vs-human ownership clarity |
| `README.md` | Presence, accuracy, completeness for a new contributor |
| `docker/` | Scripts usable by non-Erik collaborators; Windows/Linux/Mac parity |
| General | Orphaned files; mystery files; `labs/lab03`, `labs/lab04` — class-provided or in progress? |

**Output:** Classified finding list with Blocker/Risk/Good Practice/Ownership Ambiguity/Polish tag per item

**→ 2A–2D COMPLETE (2026-04-23). Artifacts saved. → Proceeding to 2E Triage.**

---

## Phase 3 — Final Polish

**Goal:** Execute all confirmed action items; leave the repo immaculate and push

**Steps:**
- Execute all Act items from Phase 1 (batched by domain)
- Execute all Act items from Phase 2 (Blockers first, then Risk, then Polish)
- Mental QUICKSTART walkthrough — does every step actually work?
- Manual credential sweep (grep for key patterns in tracked files)
- Final `git status` review
- Commit + push to `origin/main`
- Update this orientation map to COMPLETE

**→ DONE 😎**

---

## Key Decisions / Invariants

- AWS operations always need Erik confirmation
- Secrets never committed — `.example` templates only
- `MetaFiles/TODO.md` is the master queue for residual items
- Quest findings that survive Phase 3 go into `MetaFiles/TODO.md` backlog, not abandoned
- This file stays in the repo as a historical artifact of the cleanup sprint

---

*Last updated: 2026-04-23 — Quest COMPLETE. All phases closed. Commit 745ea05 pushed to origin/main (confirmed). Collaborator Readiness Quest closed.*
