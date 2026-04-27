# Outstanding Integrations Sub-B — FE↔BE↔Approach-Doc Coherence Audit Plan

> **For agentic workers:** Inline execution by the active agent (lightweight pattern, mirroring sub-A; NOT full `superpowers:subagent-driven-development` ceremony — overhead is wrong for this scope per `feedback_subagent_overhead.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Plan + audit doc + source-file changes are ATOMIC with each task's commit — not deferred** (per the standing atomic-update gate).

**Goal:** Resolve the contract drift surfaced by the Step 3 audit (`contract-audit-FE-BE-doc.md`); optionally tighten one type-precision note; re-validate via re-audit; close out sub-B with all alignment markers green.

**Architecture:** Doc-first remediation. The single canonical drift is doc-internal (stale example block in `00-coord-and-contracts.md` §GET /api/images); fix is a ~10-line surgical edit. Optional type-precision improvement is a 1-line TypeScript narrowing in `photoappApi.ts`. No backend changes; no behavioral changes; no test changes (the implementations + tests already match the corrected shapes).

**Tech stack:** Markdown doc edits + minimal TypeScript narrowing.

**Reference:**
- **Audit doc (canonical):** `Part03/MetaFiles/contract-audit-FE-BE-doc.md` (committed at `45d2d4f`).
- **Drift Finding #1 location:** `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` lines 263-273 (stale Asset example missing `kind`).
- **Optional remediation location:** `Part03/frontend/src/api/photoappApi.ts` line 54 (deleteAllImages return type wider than contract literal).
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
| 0 | Pre-execution baseline (git clean + Map confirm) | ⏳ | — | `git status` clean; OrientationMap shows sub-B as next active sub-workstream |
| 1 | Contract audit landed | ✅ 2026-04-27 | `45d2d4f` | 23-item audit table + 1 drift + 91% alignment + 5 adjacent observations + scope extension to caller + handler |
| 2 | Drift Finding #1 fix (00-coord stale example) | ⏳ | — | First example block (lines 263-273) removed; canonical example (lines 282-297) becomes single response shape; preamble headers cleaned up |
| 3 | (Optional) `deleteAllImages` type tightening | ⏳ (gated on Erik approval at Step 5 review) | — | `photoappApi.ts` line 54: `Promise<{ deleted: boolean }>` → `Promise<{ deleted: true }>`; tests stay green |
| 4 | Re-audit + validation | ⏳ | — | Audit doc updated: drift row → ✅; status banner 🔄 → ✅; bucket distribution updated; closeout-summary section filled |
| 5 | Closeout (Map + plan tracker + summary) | ⏳ | — | Map sub-B row state → ✅ Closed; workstream Status updated; plan tracker rows all ✅ |
| 6 | Push | ⏳ | — | Erik signal |

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

- [ ] **Step 0.1:** Run `git status` from MBAi460-Group1 root. Expected: clean tree (we just pushed sub-A; only `45d2d4f` audit-doc commit since).

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git status
```

- [ ] **Step 0.2:** Read `Part03/MetaFiles/OrientationMap.md` Active section. Confirm: (a) Outstanding Integrations workstream is Active, (b) sub-A is ✅ Closed, (c) sub-B is the designated next sub-workstream (state should reflect Frame in flight, not yet ✅).

- [ ] **Step 0.3:** No commit (read-only phase). Phase 0 verification absorbed into Phase 2's commit (atomic close-out).

---

## Phase 1: Contract audit (already DONE Step 3)

**Status:** ✅ 2026-04-27 — `contract-audit-FE-BE-doc.md` landed at commit `45d2d4f`.

Tracker entry kept here for completeness; no execution work required in this phase.

---

## Phase 2: Drift Finding #1 fix — stale example block in 00-coord §GET /api/images

**Files:**

- Modify: `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` (lines 261-297 — remove stale example block + adjust headers).

**Why:** The §GET /api/images section currently has TWO example response blocks. The first (lines 263-273) is stale (predates Q8 introduction of `kind`); the second (lines 282-297) is canonical. Cold readers may see the first and assume `kind` is optional. Fix: keep only the canonical shape with `kind` as the single response example.

- [ ] **Step 2.1:** Edit `00-coordination-and-contracts.md` §GET /api/images:
  - Remove the first example block (lines 263-273) including its `Success response:` preamble (line 259 ish) — the second block's preamble is what stays
  - Remove "Example response with `kind`:" header above the second block (line 282) and replace with simply "Success response:" — since it's now the single canonical example

  Net effect: §GET /api/images shows ONE response example, and that example includes `kind`. Prose at line 279 (which already correctly documents `kind`) stays as-is.

- [ ] **Step 2.2:** Atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/Approach/00-coordination-and-contracts.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 2: drift fix — single canonical Asset response example in 00-coord §GET /api/images"
```

---

## Phase 3 (OPTIONAL): `deleteAllImages` type-precision tightening

**Status:** Gated on Erik's call at Step 5 (plan review). If Erik approves, execute. If not, skip + close at Phase 4.

**Files:**

- Modify: `Part03/frontend/src/api/photoappApi.ts` (line 54 — narrow return type).

**Why:** The contract specifies `DELETE /api/images` returns `{ deleted: true }` (literal `true`). The current TypeScript type is `Promise<{ deleted: boolean }>`, which permits a wider universe (could be `false`). Tightening to `Promise<{ deleted: true }>` aligns the type with the contract.

**Trade-offs:**

- ✅ Type matches contract exactly
- ✅ Caller code (`DeleteAllConfirm.tsx`) doesn't need to handle a `false` case it can never see
- ⚠️ Slightly more brittle if the contract ever changes to permit `false` (one place to update)
- ⚠️ Pure type tightening with no runtime impact (the implementation always returns `true`); reasonable people could call this over-engineering

**Recommendation at review:** include — single-line change, contract-precision improvement, zero risk. But not blocking; happy to skip if you prefer.

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

- [ ] **Step 3.3:** Run `npm test -- --run` from `Part03/frontend/` to confirm Vitest stays at 17 files / 74 tests green.

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

- [ ] **Step 4.2:** (If Phase 3 executed) Read `photoappApi.ts` post-Phase-3 fix; verify the type is narrowed. Update Adjacent Observation E (deleteAllImages type-precision) from "optional remediation; defer to your call" to "✅ resolved at sub-B Phase 3".

- [ ] **Step 4.3:** Re-run backend + frontend test sweeps; confirm both green.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03 && npm test 2>&1 | tail -5
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/projects/project01/Part03/frontend && npm test -- --run 2>&1 | tail -5
```

Expected: 77 + 74 tests pass.

- [ ] **Step 4.4:** Update `contract-audit-FE-BE-doc.md`:
  - Status banner: 🔄 → ✅ COMPLETE 2026-04-27
  - Bucket distribution table: ✅ Aligned now 22-23 / 23 (depending on whether Phase 3 executed)
  - Closeout summary section: filled with row count, drift resolution, optional remediation status, sub-B closeout commit ref

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
  - Optional remediation: depends on Phase 3 execution
  - Sub-B closeout commit ref
  - Total commits in sub-B chain

- [ ] **Step 5.4:** Final atomic commit.

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
git add projects/project01/Part03/MetaFiles/OrientationMap.md projects/project01/Part03/MetaFiles/plans/outstanding-integrations-sub-B-plan.md
git commit -m "Part03 sub-B Phase 5: 🎯 sub-B COMPLETE — coherence audit + drift fix + re-audit ✅"
```

---

## Phase 6: Push

**Files:** none modified.

- [ ] **Step 6.1:** Run pre-push hygiene (mirror sub-A's pattern):
  - `git status` clean
  - `git log origin/main..HEAD --oneline` — review the chain
  - `cred-sweep` — verify no new credential patterns
  - `git diff origin/main..HEAD | grep -E "^\+.*abc123|^\+.*def456"` — confirm zero matches
  - Backend + Frontend test sweeps (already done in Phase 4; spot-confirm)

- [ ] **Step 6.2:** Surface findings + notes for Erik before push (mirror sub-A's `Notes for you before you push` pattern).

- [ ] **Step 6.3:** Erik pushes.

---

## Acceptance Evidence (filled at Phase 5 closeout)

_(Captured at sub-B Phase 5 close.)_

- Audit row count: __ contract items + __ adjacent observations
- Drift findings (canonical): 1 / 1 resolved (Drift Finding #1 — 00-coord stale example block)
- Optional remediation status: __ (executed / skipped at Step 5 review)
- Bucket distribution post-fix: ✅ __ / ⏳ __ / 🚩 __
- Sub-B chain commits: __
- Sub-B closeout commit: __
- Tests at closeout: backend __/__ + frontend __/__
