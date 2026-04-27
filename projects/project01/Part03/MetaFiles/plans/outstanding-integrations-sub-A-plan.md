# Outstanding Integrations Sub-A — Andrew MVP Final Handshakes

> **For agentic workers:** Inline execution by the active agent (lightweight pattern, mirroring `02-server-foundation-plan.md` + `03-api-routes-plan.md`; NOT full `superpowers:subagent-driven-development` ceremony — overhead is wrong for doc work per `feedback_subagent_overhead.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Plan + Approach doc + source artifacts are ATOMIC with each task's commit — not deferred** (per the standing atomic-update gate from prior workstreams).

**Goal:** Close the open coordination thread with Andrew's Frontend MVP (`1f3c067`) — audit his `UI-Design-Requirements.md` (1609 lines, scope = P01+P02+P03) against our shipped MVP, route every functional/visual requirement to its bucket (✅ implemented / ⏳ Future-State / 📋 TODO / 🚩 gap-to-triage), curate his source artifacts as accelerators for future workstreams, and mark integration complete.

**Architecture (Erik 2026-04-27):** New top-level folder `Part03/Accelerators/` houses curated artifacts from external contributors. Pattern: subfolder per target Future-State workstream (e.g., `ArtifactsForMobile/` ↔ `Approach/Future-State-mobile-workstream.md`). `Accelerators/README.md` indexes all artifacts + their workstream mapping. Distinct concept from `Part03/ClaudeDesignDrop/` (raw drop, preserved as-is) — Accelerators is the *curated, purpose-organized* layer.

**Tech stack:** Doc work primarily. No frontend or backend code changes. Source files (Andrew's `.jsx`/`.css`) get **copied** (`cp`) from `ClaudeDesignDrop/raw/MBAi-460/src/` to `Accelerators/ArtifactsFor<X>/` per audit findings — originals stay in `raw/` per the `ClaudeDesignDrop/README.md` preservation contract ("Preserve the original export as much as possible"). Each location is canonical for its purpose: raw/ = preserved export, Accelerators/ = curated copy. F1 reviewer fix 2026-04-27.

**Reference:**
- `Part03/MetaFiles/OrientationMap.md` Active workstream
- Source spec: `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines)
- Andrew's source files: `Part03/ClaudeDesignDrop/raw/MBAi-460/src/` (13 files)
- Existing Future-State workstream docs: `Part03/MetaFiles/Approach/Future-State-*.md` (8 docs)
- First-touch communication: `MBAi460-Group1/MetaFiles/Journal/2026-04-26-express-pivot-and-andrew-frontend-mvp-coordination.md`

**Execution mode:** Inline by the active agent. No subagent dispatch (single-thread per phase; phases are doc-bounded with low parallelism payoff).

---

## 🎯 Definition of Done

Sub-A is complete when:

1. Every functional/visual item in `UI-Design-Requirements.md` has a routing decision (implemented / Future-State / TODO / out-of-scope-rejected).
2. `Accelerators/` directory + `README.md` exist; subfolder population reflects Phase 4 triage outcomes (zero or more `ArtifactsFor<X>/` subfolders, per confirmed routing — no pre-supposed workstream allocation per F2 + F-RESIDUAL fixes).
3. Each existing Future-State workstream doc has a "Andrew's accelerator artifacts" section pointing at relevant `Accelerators/` files (where applicable).
4. `Andrew-MVP-Integration.md` exists with full audit table + integration-status banner flipped to ✅.
5. `01-ui-workstream.md` Approach doc has a reference banner pointing at the integration doc.
6. New journal entry `2026-04-27-mvp-closeout-andrew-handshake.md` posted.
7. The 3 stale Part-03 TODO entries for sub-A are closed/updated.
8. Map row for Outstanding Integrations sub-A moves Active → Closed (recent).

---

## Master Tracker

| Phase | Goal | State | Commit | Evidence |
|---|---|---|---|---|
| 0 | Pre-execution baseline (git clean + Map confirmation) | ⏳ | — | `git status` shows clean tree; `OrientationMap.md` Active section shows sub-A is the designated next workstream |
| 1 | Fill `export-notes.md` with Andrew's export metadata | ⏳ | — | All template fields populated; integration-status section added |
| 2 | Audit `UI-Design-Requirements.md` (per-screen + per-feature triage table) → `Andrew-MVP-Integration.md` | ⏳ | — | Audit table covers all 1609 lines via section sweep with checkpoint commits per section group; every row has a bucket assignment |
| 3 | Set up `Accelerators/` scaffold (README only) | ⏳ | — | `Accelerators/` directory + `Accelerators/README.md` documenting the pattern. Subfolder population deferred to Phase 4 (post-triage) per F2 reviewer fix |
| 4 | Triage gaps from Phase 2 audit + populate confirmed `Accelerators/` subfolders (with ⚠️ PAUSE gate for routing confirmation) | ⏳ | — | Each 🚩 gap routed via Erik confirmation; subfolders created for confirmed workstreams; artifacts copied (not moved) from `raw/src/` per F1 fix |
| 5 | Cross-references in Future-State workstream docs → `Accelerators/` | ⏳ | — | All applicable Future-State docs have pointer sections |
| 6 | Naming reconciliation note ("MBAi-460" vs `MBAi460-Group1`) | ⏳ | — | One-paragraph clarification in `00-coordination-and-contracts.md` (extends existing section if present per F10) |
| 7 | Coordination follow-up journal entry | ⏳ | — | New `2026-04-27-mvp-closeout-andrew-handshake.md` |
| 8 | Mark integration complete + close TODO entries + Map row update | ⏳ | — | Integration-status banner flipped to ✅ in 3 places; 3 Part-03 TODO entries closed; Map row Active→Closed |

State legend per `Part03/MetaFiles/OrientationMap.md`.

---

## Standing Instructions

### Atomic doc-update gate (per task)

After each task's substeps complete:

1. Update **this plan's tracker** — flip task's `[ ]` → `[x]` and Master Tracker row (✅ + commit hash + date).
2. Update **`Andrew-MVP-Integration.md`** if the task touched audit content.
3. **Stage source + doc changes together** and commit in ONE atomic commit.
4. **Only then** start the next task.

### Naming-rule new files (Ask column compliance)

Per `MetaFiles/PossiblePermissionsModel.md`, naming new files surfaces for Erik approval:
- `Part03/MetaFiles/Andrew-MVP-Integration.md` — audit table + integration status (new file)
- `Part03/Accelerators/README.md` — pattern doc + index (new file)
- `Part03/Accelerators/ArtifactsForMobile/` — mobile artifacts directory (new dir)
- `MBAi460-Group1/MetaFiles/Journal/2026-04-27-mvp-closeout-andrew-handshake.md` — coordination follow-up (new file)

Erik confirmed the `outstanding-integrations-sub-A-plan.md` name (this file). Other names listed above pending approval at Step 4 review; will adjust based on review feedback.

### Push policy

No `git push` during execution. Erik signals when ready (likely at sub-A closeout).

### Working directory (CWD) — F3 reviewer clarification

**All git commands in this plan assume CWD = `MBAi460-Group1/` repo root** (i.e., `cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1` before running). Paths in `git add` are relative to that root — some start with `projects/project01/Part03/...` (most phases), others start with `MetaFiles/...` (Phase 7 journal entry which lives at MBAi460-Group1 root, not Part 03). Both forms resolve correctly from the repo root. Per `feedback_working_directories.md`: each `Bash` call should re-establish CWD explicitly because CWD doesn't persist reliably across calls — wrap each git block with `cd <repo-root> && ...` if running fresh.

### Placeholder-resolution rule (F9 reviewer fix)

Some commit-message templates in this plan use `<PLACEHOLDER>` markers (e.g., `<N>` gaps triaged, `<X>` TODOs added). **Before any commit with placeholder markers, resolve all `<...>` values to actual numbers/paths/details from the just-completed work.** A literal `<N>` shipping in a commit message is a discipline failure. Currently affects: Phase 4 commit message (gap counts), Phase 4 staged-files list (depends on triage outcome), Phase 8 staged-files list (depends on triage outcome flow-through).

### "TDD-style" for doc work (Frame Step 7)

Doc-work analogue to TDD: for each audit table row, write the **claim** first ("X is in bucket Y"), then **verify** against file/repo state, then **commit** the row. The claim-verify cycle keeps the audit honest — no "appears implemented" rows that turn out to be partial.

---

## Phase 0: Pre-execution baseline (F5 reviewer fix)

**Goal:** Confirm clean baseline before any sub-A work begins. Read-only verification.

**Files:** none modified.

- [ ] **Step 0.1:** From `MBAi460-Group1/`, run `git status`. **Expected:** `nothing to commit, working tree clean`. If anything is staged or unstaged, surface to Erik before proceeding — do NOT auto-commit or stash.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git status
```

- [ ] **Step 0.2:** Read `Part03/MetaFiles/OrientationMap.md` Active section. Confirm: (a) Outstanding Integrations workstream is Active; (b) sub-A is the designated next sub-workstream (not "in progress" already; not yet Closed). If the Map says otherwise, surface the discrepancy to Erik before proceeding.

- [ ] **Step 0.3:** No commit (read-only phase). Update Master Tracker Phase 0 row to ✅ as part of Phase 1's commit (atomic close-out absorbs Phase 0's verification).

---

## Phase 1: Fill `export-notes.md`

**Reference:** `ClaudeDesignDrop/notes/export-notes.md` (template, 454 bytes).

**Files:**

- Modify: `Part03/ClaudeDesignDrop/notes/export-notes.md`

**Why:** Closes one of the 3 stale Part-03 TODO entries; gives cold readers the "what is this drop" context immediately.

- [ ] **Step 1.1:** Fill template fields:
  - **Source:** Andrew Tapple (MBAi 460 Spring 2026, Group 1)
  - **Date:** 2026-04-26 (commit `1f3c067` "Frontend MVP")
  - **File Type:** Hybrid — HTML (9 files, Console + Mobile variants), JSX (13 files in `src/`), CSS (`tokens.css`, `mobile.css`), supporting (`uploads/UI-Design-Requirements.md` 1609 lines + 1 PNG)
  - **Known Issues:** (a) original location was repo-root `MBAi-460/` (out-of-contract per `ClaudeDesignDrop/README.md`) — relocated 2026-04-26 to `ClaudeDesignDrop/raw/MBAi-460/`; (b) HTML files use React via unpkg CDN (not bundled); (c) src files include both desktop (shell, library, screens, etc.) and mobile (mobile-shell, mobile-core, mobile-screens, ios-frame) — desktop largely migrated to TS in our MVP, mobile is Future-State
  - **Integration Notes:** Point at `UI-Design-Requirements.md` as the canonical spec; cross-reference our `01-ui-workstream.md` for what landed in MVP; cross-reference `Andrew-MVP-Integration.md` (Phase 2 deliverable) for the audit table.

- [ ] **Step 1.2:** Add an "Integration Status" section at the bottom of the file with:
  - Status: 🔄 In progress (Phase 2 audit underway as of 2026-04-27)
  - Will flip to ✅ when sub-A Phase 8 closes.

- [ ] **Step 1.3:** Atomic commit.

```bash
git add projects/project01/Part03/ClaudeDesignDrop/notes/export-notes.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 1: fill export-notes.md with Andrew MVP metadata"
```

---

## Phase 2: Audit `UI-Design-Requirements.md` → `Andrew-MVP-Integration.md`

**Reference:** Source = `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines). Output = new file `Part03/MetaFiles/Andrew-MVP-Integration.md`.

**Files:**

- Create: `Part03/MetaFiles/Andrew-MVP-Integration.md`

**Why:** Produces the per-screen / per-feature accountability table that drives Q-A1's "everything goes into implemented / Future-State / TODO; surface the rest." Without it, gap-finding is informal/lossy.

**Bucket classifications used in the audit:**

- ✅ **Implemented** — in our shipped MVP. Cross-ref the implementing file.
- ⏳ **Future-State** — captured in an existing `Approach/Future-State-*.md` doc. Cross-ref the doc.
- 📋 **TODO** — captured in `Part03/MetaFiles/TODO.md` or `MBAi460-Group1/MetaFiles/TODO.md`. Cross-ref the entry.
- 🚩 **Gap-to-triage** — not in any of the above. Becomes Phase 4 input.
- ❌ **Out-of-scope (rejected)** — explicitly descoped (e.g., shadcn per R1; Q9-Q10 deferred patterns). Cross-ref the descope decision.

**Checkpoint commit cadence (F6 reviewer fix):** rather than a single terminal commit at end of Phase 2, the audit lands in 5 incremental commits per logical section group of `UI-Design-Requirements.md`. Crash-recovery granularity is per-group, not per-1609-lines.

- [ ] **Step 2.1:** Create `Andrew-MVP-Integration.md` shell with header structure:
  - Status banner (🔄 In progress; flips to ✅ at Phase 8)
  - Source pointers (UI-Design-Requirements.md, our 01-ui-workstream.md, our DesignDecisions.md)
  - Audit table skeleton (column headers; rows added in 2.2–2.5)
  - Triage queue section (initially empty; populated as 🚩 rows surface)
  - Accelerators inventory section (cross-ref with Phase 4 output — populated later)

  Then commit (Phase 2 checkpoint #1):

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.1: Andrew-MVP-Integration.md shell + audit table skeleton"
```

- [ ] **Step 2.2:** Audit §0–6 of `UI-Design-Requirements.md` — Document metadata, glossary, vision, users, journeys. Mostly informational + design-decision conflicts with our Q1–Q6 + Q10 non-blocking auth model. Add audit rows per major claim. Apply TDD-style claim-then-verify per Standing Instructions. Then commit (Phase 2 checkpoint #2):

```bash
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.2: audit §0–6 (metadata + glossary + vision + users + journeys)"
```

- [ ] **Step 2.3:** Audit §9 — Screen-by-screen specs (the meat). Each screen Andrew specifies → one audit row. Cross-ref to our implementing page wrapper or component (e.g., LibraryPage.tsx, AssetDetailPage.tsx, etc.). Then commit (Phase 2 checkpoint #3):

```bash
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.3: audit §9 (screen-by-screen specs)"
```

- [ ] **Step 2.4:** Audit §10 — Numbered functional requirements (the other meat). Each FR → one audit row. Cross-ref to implementing file or assignment. Then commit (Phase 2 checkpoint #4):

```bash
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.4: audit §10 (numbered functional requirements)"
```

- [ ] **Step 2.5:** Audit §7–8 + §11–15 — System context + IA + visual design system + tech requirements + NFRs + phased roadmap. Section-by-section rows; cross-refs as before. Then commit (Phase 2 checkpoint #5):

```bash
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.5: audit §7–8 + §11–15 (system context + IA + visual + tech + NFR + roadmap)"
```

- [ ] **Step 2.6:** Final review pass — verify every ✅ row by reading the implementing file (TDD-style claim-then-verify). Reclassify anything that appears ✅ but isn't actually shipped. Confirm 🚩 rows are well-formed for Phase 4 triage input. Then commit (Phase 2 close-out):

```bash
git add projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 2.6: audit final-pass verification — every ✅ row file-confirmed; 🚩 gap queue ready for Phase 4"
```

---

## Phase 3: Set up `Accelerators/` scaffold (F2 reviewer fix — README only)

**Files:**

- Create: `Part03/Accelerators/` (directory)
- Create: `Part03/Accelerators/README.md`

**F2 reviewer fix scope:** Phase 3 creates ONLY the directory + README documenting the pattern. Subfolder population (`ArtifactsFor<X>/` + artifact copies) is deferred to Phase 4 (post-triage), so that subfolders only get created for workstreams the audit + triage actually confirms.

**Why:** Curated, purpose-organized layer for future workstreams. Distinct from the raw drop. Erik's architectural decision 2026-04-27.

- [ ] **Step 3.1:** Create `Accelerators/` directory.

```bash
mkdir -p /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/Accelerators
```

- [ ] **Step 3.2:** Author `Accelerators/README.md` documenting:
  - The pattern: curated artifacts from external contributors; subfolder per target Future-State workstream
  - Naming convention: `ArtifactsFor<WorkstreamName>` mirroring Future-State workstream names
  - 1:1 mapping with `Approach/Future-State-*.md` docs (e.g., `ArtifactsForMobile/` ↔ a Future-State Mobile workstream)
  - Lifecycle: artifacts stay until the target workstream consumes them, then they may be retired
  - Distinction from `ClaudeDesignDrop/`: raw/ = preserved export (don't modify); Accelerators/ = curated copies (modifiable, organized by purpose)

- [ ] **Step 3.3:** Atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/Accelerators/ projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 3: Accelerators/ scaffold + README.md (subfolder population deferred to Phase 4)"
```

---

## Phase 4: Triage gaps + populate confirmed `Accelerators/` subfolders (F2 + F7 reviewer fixes)

**Files:**

- Modify: `Part03/MetaFiles/TODO.md` (add new TODO entries for gaps routed to Part-03-scoped TODOs)
- Modify: `MBAi460-Group1/MetaFiles/TODO.md` (add new TODO entries for gaps routed to Class-Project-scoped TODOs)
- Possibly create: new `Approach/Future-State-<name>-workstream.md` docs for gaps that warrant their own Future-State workstream (likely Mobile per audit findings)
- Modify: `Andrew-MVP-Integration.md` (update gap rows with their routing destination + populate Accelerators inventory section)
- Create: `Part03/Accelerators/ArtifactsFor<X>/` directories for confirmed subfolders (post-PAUSE-gate routing)
- Copy (cp, not mv per F1): artifacts from `ClaudeDesignDrop/raw/MBAi-460/src/` → confirmed `ArtifactsFor<X>/` subfolders

**Why:** Per Erik's Q-A1: "anything that isn't [in implemented/Future-State/TODO] should be surfaced and triaged." Phase 4 takes 🚩 gap rows from Phase 2 and routes each. Subfolder population in Accelerators happens here (not Phase 3) so we only create folders for workstreams the triage actually confirms (per F2).

- [ ] **Step 4.1:** Enumerate 🚩 gap rows from Phase 2's audit table. Compile into a clean **gap table** in chat: row #, item description, suggested routing (TODO / Future-State / reject), one-line rationale.

---

> ## ⚠️ PAUSE GATE — Phase 4 routing confirmation (F7 reviewer fix)
>
> **The gap table from Step 4.1 must be surfaced to Erik in chat. STOP here. Do NOT proceed to Step 4.2 until Erik confirms the routing for each gap row.**
>
> Erik's confirmation may include: accepting the suggested routing, redirecting some rows, identifying additional gaps I missed, marking some as out-of-scope, or pre-approving a new Future-State workstream doc creation.
>
> If executing under auto mode, this PAUSE is non-skippable — auto-mode does not authorize routing decisions; only Erik does.

---

- [ ] **Step 4.2:** Once Erik confirms the routing per the PAUSE gate, execute each routing:
  - **TODO add** — append entries to `Part03/MetaFiles/TODO.md` (Part-03-scoped) or `MBAi460-Group1/MetaFiles/TODO.md` (Class-Project-scoped) per Erik's confirmed scope
  - **Future-State add** — extend an existing `Approach/Future-State-*.md` doc (preferred where the workstream already exists), OR draft a NEW Future-State doc following the existing pattern (e.g., `Future-State-mobile-workstream.md`). Naming the new file requires Erik approval per the naming rule (likely already given via the PAUSE gate).
  - **Reject** — capture explicit out-of-scope rationale in the audit row (no external file changes)

- [ ] **Step 4.3:** For each Future-State workstream confirmed in Step 4.2 that has Andrew-source artifacts to accelerate it, create the matching `Accelerators/ArtifactsFor<X>/` subfolder and copy (`cp`) the relevant files from `ClaudeDesignDrop/raw/MBAi-460/src/`. **Use `cp` not `mv`** — originals stay in raw/ per the preservation contract (F1). Add `Accelerators/ArtifactsFor<X>/README.md` per subfolder describing what's there + the target workstream.

- [ ] **Step 4.4:** Update `Andrew-MVP-Integration.md`:
  - Mark each 🚩 gap row with its routing destination (cross-link to the TODO entry / Future-State doc / out-of-scope rationale)
  - Populate the Accelerators inventory section (cross-ref to the subfolders created in Step 4.3)

- [ ] **Step 4.5:** **Resolve all `<PLACEHOLDER>` markers** in the commit message + staged-files list per the Standing Instructions placeholder-resolution rule (F9). Then atomic commit:

```bash
# Replace <touched files> with the actual paths from Step 4.2 / 4.3 work.
# Replace <N>, <X>, <Y>, <Z> with the actual counts from the triage outcome.
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add <touched files> projects/project01/Part03/MetaFiles/Andrew-MVP-Integration.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 4: triage <N> gaps from Andrew MVP audit (<X> TODOs added; <Y> Future-State entries; <Z> out-of-scope) + populate <K> Accelerators/ArtifactsFor<*>/ subfolders"
```

---

## Phase 5: Cross-references in Future-State workstream docs

**Files:**

- Modify: `Part03/MetaFiles/Approach/Future-State-auth-and-account-management-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-chat-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-command-palette-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-documents-and-textract-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-playwright-e2e-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-production-hardening-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-shadcn-primitive-migration-workstream.md`
- Modify: `Part03/MetaFiles/Approach/Future-State-tweaks-panel-workstream.md`
- Possibly modify: any new `Future-State-*` doc created in Phase 4

**Why:** Per Erik's Q-A2: each Future-State doc gets a "Andrew's accelerator artifacts" pointer section so the executing agent has direct access to relevant kickstarter material.

- [ ] **Step 5.1:** For each Future-State workstream doc, identify which `Accelerators/ArtifactsFor<X>/` files (if any) are relevant. Some workstreams may have zero relevant artifacts — note this explicitly rather than skipping.

- [ ] **Step 5.2:** Add a "Andrew's accelerator artifacts" section near the top of each Future-State doc with:
  - Bullet list of relevant files in `Accelerators/ArtifactsFor<X>/` (or "no specific artifacts; reference `UI-Design-Requirements.md` §X for spec")
  - Cross-ref to the audit row in `Andrew-MVP-Integration.md`

- [ ] **Step 5.3:** Atomic commit.

```bash
git add projects/project01/Part03/MetaFiles/Approach/Future-State-*.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 5: Future-State workstream docs cross-ref Accelerators + audit table (Q-A2 C-like)"
```

---

## Phase 6: Naming reconciliation note

**Files:**

- Modify: `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` (add a "Naming conventions" section if not present, or extend if present)

**Why:** Andrew uses "MBAi 460" / "MBAi-460" (brand placeholder); we use `MBAi460-Group1` (repo name). Stylistic but flagged in TODO; needs a one-paragraph clarification so future readers don't assume a typo.

- [ ] **Step 6.0:** Read `00-coordination-and-contracts.md` current state (F10 reviewer fix). Identify whether a "Naming conventions" section already exists. If yes → extend in place. If no → create the section in an appropriate location (likely near the top with other meta sections). Surface the read result in chat before editing so Erik can spot-check the chosen insertion point.

- [ ] **Step 6.1:** Add/extend a "Naming conventions" subsection in `00-coordination-and-contracts.md` clarifying:
  - "MBAi 460" — the brand/course placeholder (Andrew's spec uses this; lives in user-facing copy)
  - "MBAi-460" — hyphenated variant Andrew used in original drop folder name (pre-relocation)
  - `MBAi460-Group1` — the GitHub repo name (no spaces, no hyphens)
  - All three refer to the same lab; choose by context

- [ ] **Step 6.2:** Atomic commit.

```bash
git add projects/project01/Part03/MetaFiles/Approach/00-coordination-and-contracts.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 6: naming reconciliation note (MBAi 460 / MBAi-460 / MBAi460-Group1)"
```

---

## Phase 7: Coordination follow-up journal entry

**Files:**

- Create: `MBAi460-Group1/MetaFiles/Journal/2026-04-27-mvp-closeout-andrew-handshake.md`

**Why:** First-touch communication was 2026-04-26; this is the second-touch to surface MVP closeout + invite Andrew to review what landed. Preserves chronology by being a NEW entry rather than appending to the 2026-04-26 entry.

- [ ] **Step 7.1:** Author entry with sections:
  - Summary: UI MVP shipped; pointer to closeout commit + DEMO-QUICKSTART.md
  - What landed vs Andrew's spec (link to `Andrew-MVP-Integration.md`)
  - What's Future-State (pointer to relevant Future-State workstream docs + Accelerators)
  - Invite: review our MVP via `Human-Feature-Test-Suite.md`; surface anything not captured
  - Coordination: how to add to triage queue / suggest changes

- [ ] **Step 7.2:** Atomic commit.

```bash
git add MetaFiles/Journal/2026-04-27-mvp-closeout-andrew-handshake.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 7: coordination follow-up journal entry — MVP closeout + invite to Andrew"
```

---

## Phase 8: Mark integration complete + close TODO entries + Map row update

**Files:**

- Modify: `Part03/MetaFiles/Andrew-MVP-Integration.md` (status banner: 🔄 → ✅)
- Modify: `Part03/ClaudeDesignDrop/notes/export-notes.md` (Integration Status: 🔄 → ✅)
- Modify: `Part03/MetaFiles/Approach/01-ui-workstream.md` (add reference banner)
- Modify: `Part03/MetaFiles/TODO.md` (close 3 stale sub-A entries with cross-ref to this commit)
- Modify: `Part03/MetaFiles/OrientationMap.md` (sub-A row from Active → Closed; update Compass-derivable state)

**Why:** Closes the workstream cleanly. Three "integration complete" markers per the proposed locations (Erik 2026-04-27 routing).

**Pre-flight check (F4 reviewer fix):**

- [ ] **Step 8.0a:** Run `git status` from MBAi460-Group1 root — expect clean tree (each prior phase's atomic commit completed). If staged/unstaged content exists, surface to Erik before proceeding.
- [ ] **Step 8.0b:** Read `01-ui-workstream-plan.md` Master Tracker to confirm sub-A's edits to the 01 Approach doc don't conflict with concurrent 01 work. Note: 01-ui Phase 8 may be ✅ for autonomous portions and 🟡 in-flight for collaborator browser walk — that's expected and does NOT gate sub-A (the collaborator walk only touches `01-ui-workstream-plan.md` substep checkboxes, not `01-ui-workstream.md` Approach doc which sub-A modifies). Surface state to Erik for awareness, do not gate.

- [ ] **Step 8.1:** Flip integration-status banner in `Andrew-MVP-Integration.md` (🔄 → ✅) with closeout note.

- [ ] **Step 8.2:** Flip "Integration Status" section in `export-notes.md` (🔄 → ✅).

- [ ] **Step 8.3:** Add reference banner to `01-ui-workstream.md`: "Andrew's UI Design Requirements have been fully audited + integrated — see `Part03/MetaFiles/Andrew-MVP-Integration.md` for the audit table + triage queue."

- [ ] **Step 8.4:** Close the 3 stale sub-A entries in `Part03/MetaFiles/TODO.md`:
  - "[UI] Fill `ClaudeDesignDrop/notes/export-notes.md`..."
  - "[Coordination] Surface Express pivot + Q1–Q6 decisions to Andrew..."
  - "[UI/Coordination] Reconcile Andrew's design into the approach docs..."
  
  Each gets `[x]` + closure note + cross-ref to this commit.

- [ ] **Step 8.5:** Update `OrientationMap.md`:
  - Move "Outstanding Integrations sub-A" from Active to Closed (recent)
  - Update Active workstream — sub-A row removed, sub-B / D / E remain *(defined in `OrientationMap.md` Active section — currently sub-B FE↔BE↔doc audit, sub-D viz handoff, sub-E Future-State prioritization; F8 footnote)*
  - Update Compass-derivable state (Active section reflects whatever sub Erik signals next)

- [ ] **Step 8.6:** **Resolve all `<PLACEHOLDER>` markers** in the staged-files list (per the F9 placeholder-resolution rule). Then final atomic commit:

```bash
# Replace <all touched files> with the actual paths from Phase 8.1–8.5 work.
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add <all touched files> projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md
git commit -m "Part03 sub-A Phase 8: 🎯 Andrew MVP integration COMPLETE — audit + accelerators + cross-refs all landed; sub-A closed"
```

---

## Acceptance Evidence (filled at end)

_(Captured at Phase 8 closeout.)_

- Audit row count: __
- Bucket distribution: ✅ __ / ⏳ __ / 📋 __ / ❌ __ / 🚩 __ (gaps before triage)
- Phase 4 triage outcomes: __ TODOs added / __ Future-State entries / __ rejected
- Accelerators populated: ArtifactsForMobile/__files; other ArtifactsFor<X>/__ subfolders
- Future-State docs cross-ref'd: __ / 8
- Sub-A closeout commit: __
