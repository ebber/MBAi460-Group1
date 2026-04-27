# Outstanding Integrations Sub-B — FE↔BE↔Approach-Doc Coherence Audit Plan

> **For agentic workers:** Inline execution by the active agent (lightweight pattern, mirroring sub-A; NOT full `superpowers:subagent-driven-development` ceremony — overhead is wrong for this scope per `feedback_subagent_overhead.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Plan + audit doc + source-file changes are ATOMIC with each task's commit — not deferred** (per the standing atomic-update gate).

**Goal:** Resolve the contract drift surfaced by the Step 3 audit (`contract-audit-FE-BE-doc.md`); optionally tighten one type-precision note; re-validate via re-audit; close out sub-B with all alignment markers green.

**Architecture:** Doc-first remediation. The single canonical drift is doc-internal (stale example block in `00-coord-and-contracts.md` §GET /api/images); fix is a ~10-line surgical edit. Optional type-precision improvement is a 1-line TypeScript narrowing in `photoappApi.ts`. No backend changes; no behavioral changes; no test changes (the implementations + tests already match the corrected shapes).

**Tech stack:** Markdown doc edits + minimal TypeScript narrowing.

**Reference:**
- **Audit doc (canonical):** `Part03/MetaFiles/contract-audit-FE-BE-doc.md` (committed at `45d2d4f`).
- **Drift Finding #1 location:** `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` lines 263-273 (stale Asset example missing `kind`).
- **Phase 3 type-tightening location:** `Part03/frontend/src/api/photoappApi.ts` line 54 (deleteAllImages return type narrowing).
- **Map:** sub-B row in `Part03/MetaFiles/OrientationMap.md`.

**Execution mode:** Inline by main thread. No subagent dispatch (Q-B-4 confirmed by Erik 2026-04-27 — three interconnected files; relational audit; subagent overhead exceeds payoff).

---

## 🎯 Definition of Done

Sub-B is complete when:

1. Drift Finding #1 resolved in 00-coord (stale example block removed/replaced; one canonical Asset response shape per route).
2. (Optional Phase 3) `deleteAllImages` type narrowed from `Promise<{ deleted: boolean }>` to `Promise<{ deleted: true }>` in photoappApi.ts.
3. Re-audit confirms zero 🚩 rows in the audit table; `contract-audit-FE-BE-doc.md` Status banner flipped 🔄 → ✅.
4. Backend Jest + Frontend Vitest stay green at sub-B closeout (no regressions from doc/type changes).
5. OrientationMap sub-B row marked ✅ Closed; workstream Status updated to "sub-A + sub-B done; sub-D + sub-E remain".
6. Plan tracker fully ✅; closeout commit lands.

---

## Master Tracker

| Phase | Goal | State | Commit | Evidence |
|---|---|---|---|---|
| 0 | Pre-execution baseline (git clean + Map confirm) | ✅ 2026-04-27 (verified retrospectively as part of plan formation; not a separate execution beat) | — | `git status` clean post `45d2d4f` + `43feb20`; OrientationMap confirms sub-B as designated active sub-workstream |
| 1 | Contract audit landed | ✅ 2026-04-27 | `45d2d4f` | 23-item audit table + 1 drift + 91% alignment + 5 adjacent observations + scope extension to caller + handler |
| 2 | Drift Finding #1 fix (00-coord stale example) | ✅ 2026-04-27 | (this commit) | Stale "Success response:" preamble + JSON block (was lines 259-273) removed; canonical block's preamble relabeled from "Example response with `kind`:" to "Success response:". §GET /api/images now shows ONE canonical response example including `kind`. Verified via re-read |
| 3 | `deleteAllImages` type tightening (confirmed include per Q-Phase3 2026-04-27) | ⏳ | — | `photoappApi.ts` line 54: `Promise<{ deleted: boolean }>` → `Promise<{ deleted: true }>`; tests stay green |
| 4 | Re-audit + validation | ⏳ | — | Audit doc updated: drift row → ✅; status banner 🔄 → ✅; bucket distribution updated; closeout-summary section filled |
| 5 | Closeout (Map + plan tracker + summary) | ⏳ | — | Map sub-B row state → ✅ Closed; workstream Status updated; plan tracker rows all ✅ |
| 6 | Push (with cred-sweep delta-check assessment + decision) | ⏳ | — | Step 6.0 assesses cred-sweep current capability + estimates LoE to add delta-check mode; Erik picks update-util-now vs queue-and-grep; Step 6.1 pre-push hygiene runs both full state scan + delta check |

State legend per `Part03/MetaFiles/OrientationMap.md`.

---

## Standing Instructions

### Atomic doc-update gate (per task)

After each phase's substeps complete:

1. Update **this plan's tracker** — flip task's `[ ]` → `[x]` and Master Tracker row (✅ + commit hash + date).
2. Update **audit doc** if the phase touched audit content (Phases 4 + 5).
3. **Stage source + doc changes together** and commit in ONE atomic commit.
4. **Only then** start the next phase.

### Working directory (CWD)

All git commands assume CWD = `MBAi460-Group1/` repo root (per the standing convention from sub-A). Wrap each fresh `Bash` call with `cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1 && …`.

### Push policy

No `git push` during Phases 0–5. Erik signals at Phase 6. Sub-B's expected push: 5-7 commits (sub-B chain only; could batch with sub-D/sub-E if Erik prefers).

### Subagent posture

Main thread end-to-end. Audit is relational (drift = mismatch BETWEEN files); a subagent reading one file in isolation can't find drift. Per Q-B-4 ruling 2026-04-27.

### Test discipline

Sub-B's changes are doc-only (Phase 2) + minimal-type (Phase 3). Backend Jest + Frontend Vitest sweeps run at Phase 4 (validation) — expect both to stay green at the same baselines as sub-A closeout (77/77 + 74/74).

---

## Phase 0: Pre-execution baseline

**Goal:** Confirm clean baseline before sub-B remediation begins. Read-only verification.

**Files:** none modified.

- [x] **Step 0.1:** Run `git status` from MBAi460-Group1 root. Expected: clean tree (we just pushed sub-A; commits since: `45d2d4f` audit-doc + `43feb20` plan-doc = 2 commits ahead at Phase 0). Verified retrospectively as part of plan v2 formation 2026-04-27.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git status
```

- [x] **Step 0.2:** Read `Part03/MetaFiles/OrientationMap.md` Active section. Confirm: (a) Outstanding Integrations workstream is Active, (b) sub-A is ✅ Closed, (c) sub-B is the designated next sub-workstream (state reflects Frame in flight, not yet ✅). Verified retrospectively 2026-04-27.

- [x] **Step 0.3:** No commit (read-only phase). Phase 0 verification absorbed into plan v2 commit (since v1 was ⏳ on Phase 0; v2 reflects retrospective verification).

---

## Phase 1: Contract audit (already DONE Step 3)

**Status:** ✅ 2026-04-27 — `contract-audit-FE-BE-doc.md` landed at commit `45d2d4f`.

Tracker entry kept here for completeness; no execution work required in this phase.

---

## Phase 2: Drift Finding #1 fix — stale example block in 00-coord §GET /api/images

**Files:**

- Modify: `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` (lines 261-297 — remove stale example block + adjust headers).

**Why:** The §GET /api/images section currently has TWO example response blocks. The first (lines 263-273) is stale (predates Q8 introduction of `kind`); the second (lines 282-297) is canonical. Cold readers may see the first and assume `kind` is optional. Fix: keep only the canonical shape with `kind` as the single response example.

- [x] **Step 2.1:** Edit `00-coordination-and-contracts.md` §GET /api/images:
  - Remove the first example block (lines 263-273) including its `Success response:` preamble (line 259 ish) — the second block's preamble is what stays
  - Remove "Example response with `kind`:" header above the second block (line 282) and replace with simply "Success response:" — since it's now the single canonical example

  Net effect: §GET /api/images shows ONE response example, and that example includes `kind`. Prose at line 279 (which already correctly documents `kind`) stays as-is.

- [x] **Step 2.2:** Atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/Approach/00-coordination-and-contracts.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 2: drift fix — single canonical Asset response example in 00-coord §GET /api/images"
```

---

## Phase 3: `deleteAllImages` type-precision tightening

**Status:** Confirmed include per Q-Phase3 2026-04-27.

**Files:**

- Modify: `Part03/frontend/src/api/photoappApi.ts` (line 54 — narrow return type).

**Why:** The contract specifies `DELETE /api/images` returns `{ deleted: true }` (literal `true`). The current TypeScript type is `Promise<{ deleted: boolean }>`, which permits a wider universe (could be `false`). Tightening to `Promise<{ deleted: true }>` aligns the type with the contract. Single-line change; pure type narrowing with no runtime impact.

- [ ] **Step 3.1:** Edit `photoappApi.ts` line 54:
  ```diff
  -export async function deleteAllImages(): Promise<{ deleted: boolean }> {
  +export async function deleteAllImages(): Promise<{ deleted: true }> {
  ```
  ...and similarly the inline cast on line 56:
  ```diff
  -  return unwrap<{ deleted: boolean }>(res);
  +  return unwrap<{ deleted: true }>(res);
  ```

- [ ] **Step 3.2:** Run `npm run build` from `Part03/frontend/` to confirm TypeScript still compiles. (Tighter type means any consumer that branched on `deleted === false` would now error — but no consumer does, since the implementation always returns `true`.)

- [ ] **Step 3.3:** Run `npm test` from `Part03/frontend/` to confirm Vitest stays at 17 files / 74 tests green. (Note: frontend `package.json` `"test"` script is already `"vitest run"` — single-pass — no `-- --run` needed.)

- [ ] **Step 3.4:** Atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/frontend/src/api/photoappApi.ts projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 3: tighten deleteAllImages type — Promise<{deleted:true}> matches contract literal"
```

---

## Phase 4: Re-audit + validation

**Files:**

- Modify: `Part03/MetaFiles/contract-audit-FE-BE-doc.md` (Status banner; Drift row 4; bucket distribution; closeout summary).

**Goal:** Re-run the audit row-by-row against the post-fix state. Expect zero 🚩 rows. Update the audit doc to reflect the resolved drift + flip the Status banner to ✅.

- [ ] **Step 4.1:** Read `00-coordination-and-contracts.md` §GET /api/images post-Phase-2 fix; verify the stale block is gone + the canonical block is the single response example. Update audit table row 4 from 🚩 to ✅.

- [ ] **Step 4.2:** Read `photoappApi.ts` post-Phase-3 fix; verify the type is narrowed. Update Adjacent Observation E (deleteAllImages type-precision) from "optional remediation; defer to your call" to "✅ resolved at sub-B Phase 3".

- [ ] **Step 4.3:** Re-run backend + frontend test sweeps; confirm both green.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03 && npm test 2>&1 | tail -5
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend && npm test 2>&1 | tail -5
```

Expected: 77 + 74 tests pass.

- [ ] **Step 4.4:** Update `contract-audit-FE-BE-doc.md`:
  - Status banner: 🔄 → ✅ COMPLETE 2026-04-27
  - Bucket distribution table: ✅ Aligned now 23 / 23 (Phase 3 type tightening + Drift Finding #1 fix both landed)
  - Closeout summary section: filled with row count, drift resolution, Phase 3 type tightening status, sub-B closeout commit ref

- [ ] **Step 4.5:** Atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/contract-audit-FE-BE-doc.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 4: re-audit ✅ — zero 🚩 rows; audit doc Status flipped to COMPLETE"
```

---

## Phase 5: Closeout

**Files:**

- Modify: `Part03/MetaFiles/OrientationMap.md` (sub-B row state; workstream Status).
- Modify: `Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md` (Master Tracker rows all ✅; Acceptance Evidence section filled).

- [ ] **Step 5.1:** Update `OrientationMap.md`:
  - Sub-B row state: ⏳ → ✅ COMPLETE 2026-04-27
  - Workstream `Status:` line update — "sub-A + sub-B both ✅ COMPLETE; sub-D + sub-E remain"

- [ ] **Step 5.2:** Update plan Master Tracker — Phase 5 row → ✅; populate any remaining placeholder commit refs in earlier rows.

- [ ] **Step 5.3:** Fill the Acceptance Evidence section at the end of this plan with sub-B's stats:
  - Audit row count: 23 + 5 adjacent observations
  - Drift resolved: 1 / 1 (Drift Finding #1)
  - Phase 3 type tightening: fill from actual Phase 3 execution results (commit ref + tests-stayed-green confirmation)
  - Sub-B closeout commit ref
  - Total commits in sub-B chain

- [ ] **Step 5.4:** Final atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/OrientationMap.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 5: 🎯 sub-B COMPLETE — coherence audit + drift fix + re-audit ✅"
```

---

## Phase 6: Push (with cred-sweep delta-check assessment + decision)

**Files:** depend on Step 6.0 outcome:
- If "update util now": modify `MBAi460-Group1/utils/cred-sweep` (extend with delta-check mode); possibly add a small test fixture.
- If "queue + grep fallback": modify `MBAi460-Group1/MetaFiles/TODO.md` (add TODO entry to utils queue).

**Why a separate assessment step (per reviewer feedback #6 + Erik 2026-04-27):** Two distinct credential checks matter at pre-push:

1. **Full state scan** — does `tracked files` contain credential patterns? `cred-sweep` does this today; WARN is expected (pre-existing course-mandated content).
2. **Delta check** — did *MY new commits* introduce *NEW* credential patterns since origin? cred-sweep doesn't currently support this; sub-A used inline `git diff origin/main..HEAD | grep -E "abc123|def456"` as a fallback.

The reviewer's framing was that the inline grep is brittle / placeholder-feeling — better to extend the utility OR explicitly queue the work + use grep transparently. Step 6.0 below resolves this before push.

- [ ] **Step 6.0a (assess `cred-sweep` capability + LoE):** Read `MBAi460-Group1/utils/cred-sweep`. Surface to Erik:
  - **What it does today:** scans tracked files (5 checks: AWS keys, known lab passwords `abc123!!`/`def456!!`, committed tfvars, RDS master-pw file, photoapp-config with live keys); exits 1 on any hit.
  - **What the delta-check needs:** a mode that filters to NEW additions in `git diff <ref>..HEAD` rather than scanning the whole tracked-file surface; same regex patterns; zero matches required (vs. current tolerate-known-hits-then-WARN).
  - **Estimated LoE for adding `--delta <ref>` mode:** ~30-60 min for a tight implementation: add CLI flag parsing, swap input from `git ls-files | xargs grep` to `git diff <ref>..HEAD | grep` (only `^+` added lines), update help text + docs, add a small smoke test. Not blocking; reasonable.

- [ ] **Step 6.0b (Erik picks):**
  - **Update-now path:** implement delta-check mode in `cred-sweep`; integrate into Step 6.1 hygiene as the canonical delta-check tool. Adds 1-2 commits to sub-B chain.
  - **Queue-and-grep path:** add a TODO entry to `MBAi460-Group1/MetaFiles/TODO.md` ("[Tooling] cred-sweep — add `--delta <ref>` mode for pre-push delta hygiene; ~30-60 min LoE"); use the inline `git diff` grep as the explicit acknowledged fallback. Adds 1 commit (TODO entry).

- [ ] **Step 6.0c (execute decision):** Per Erik's pick:
  - If update-now: implement + smoke-test the new mode; commit (`Class Project: cred-sweep — add --delta mode for pre-push hygiene`). Then Step 6.1 uses the new mode.
  - If queue + grep: add TODO entry; commit (`Class Project queue: cred-sweep --delta mode TODO`). Then Step 6.1 uses inline grep.

- [ ] **Step 6.1:** Run pre-push hygiene:
  - `git status` clean
  - `git log origin/main..HEAD --oneline` — review the sub-B chain
  - `cred-sweep` — full state scan (WARN expected; pre-existing course content unchanged from sub-A's last push)
  - **Delta check** — confirm zero NEW credential patterns introduced by sub-B commits. Tool: per Step 6.0c outcome:
    - If util updated: `cred-sweep --delta origin/main` — exit 0 required
    - If queue + grep: `git diff origin/main..HEAD | grep -E "^\+.*abc123|^\+.*def456"` — zero matches required
  - Backend + Frontend test sweeps (already done in Phase 4; spot-confirm)

- [ ] **Step 6.2:** Surface findings + notes for Erik before push (mirror sub-A's `Notes for you before you push` pattern).

- [ ] **Step 6.3:** Erik pushes.

---

## Acceptance Evidence (filled at Phase 5 closeout)

_(Captured at sub-B Phase 5 close.)_

- Audit row count: __ contract items + __ adjacent observations
- Drift findings (canonical): 1 / 1 resolved (Drift Finding #1 — 00-coord stale example block)
- Phase 3 type tightening: __
- Bucket distribution post-fix: ✅ __ / ⏳ __ / 🚩 __
- Sub-B chain commits: __
- Sub-B closeout commit: __
- Tests at closeout: backend __/__ + frontend __/__
