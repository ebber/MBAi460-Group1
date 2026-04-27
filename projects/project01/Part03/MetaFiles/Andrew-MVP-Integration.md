# Andrew MVP Integration — Audit + Triage

> **Purpose:** Per-section / per-item accountability table mapping Andrew Tapple's `UI-Design-Requirements.md` (1609 lines, scope = P01+P02+P03) against our shipped Part 03 MVP. Each requirement lands in one of five buckets: ✅ implemented / ⏳ Future-State / 📋 TODO / 🚩 gap-to-triage / ❌ out-of-scope-rejected.
>
> **Source spec:** `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (Andrew Tapple, 2026-04-26, commit `1f3c067`).
>
> **Owner of this audit:** Sub-Workstream A (Outstanding Integrations) — see `plans/outstanding-integrations-sub-A-plan.md` Phase 2.
>
> **Discipline:** TDD-style claim-then-verify. For each row: claim the bucket, then verify against repo state, then commit. No "appears implemented" rows.

---

## Status

🔄 **In progress** as of 2026-04-27. Phase 2 audit underway. Will flip to ✅ when Sub-A Phase 8 closes (all 1609 lines routed; gaps triaged; Accelerators populated; Future-State docs cross-referenced).

---

## Source pointers

- **Andrew's spec (canonical):** `Part03/ClaudeDesignDrop/raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines, 15 sections).
- **Our Approach doc (what we actually implemented):** `Part03/MetaFiles/Approach/01-ui-workstream.md`.
- **Our design decisions (Q1–Q10):** `Part03/MetaFiles/DesignDecisions.md`.
- **Our coordination + contracts:** `Part03/MetaFiles/Approach/00-coordination-and-contracts.md`.
- **Our shipped MVP plan + tracker:** `Part03/MetaFiles/plans/01-ui-workstream-plan.md`.
- **Existing Future-State workstream docs:** `Part03/MetaFiles/Approach/Future-State-*.md` (8 docs at audit start; may grow per Phase 4 triage).
- **Andrew's source files (raw drop, preserved):** `Part03/ClaudeDesignDrop/raw/MBAi-460/src/` (13 files: jsx + css).

---

## Bucket legend

| Symbol | Meaning |
|---|---|
| ✅ | **Implemented** — in our shipped MVP. Cross-ref names the implementing file. |
| ⏳ | **Future-State** — captured in an existing `Approach/Future-State-*.md` doc. Cross-ref names the doc + relevant section. |
| 📋 | **TODO** — captured in `Part03/MetaFiles/TODO.md` or `MBAi460-Group1/MetaFiles/TODO.md`. Cross-ref names the TODO entry. |
| 🚩 | **Gap-to-triage** — not yet in any of the above. Becomes Phase 4 input. |
| ❌ | **Out-of-scope (rejected)** — explicitly descoped. Cross-ref names the descope decision (e.g., R1 reviewer remediation; Q9/Q10 deferral). |

---

## Audit table

Audit sweep proceeds section-by-section through `UI-Design-Requirements.md`. Each major claim or specified item gets a row. Sub-section groups commit at checkpoint boundaries per Phase 2 plan structure.

| # | Source (§ / line) | Item / claim | Bucket | Cross-ref | Notes |
|---|---|---|---|---|---|
| _(rows added in Phases 2.2–2.5)_ | | | | | |

---

## Triage queue (🚩 gaps surfacing — Phase 4 input)

_(Populated as 🚩 rows are added to the audit table. Phase 4 takes this list to a ⚠️ PAUSE gate for Erik routing confirmation.)_

| # | Item | Audit row ref | Suggested routing | Rationale |
|---|---|---|---|---|
| _(empty — populated during audit)_ | | | | |

---

## Accelerators inventory (Phase 4 output)

_(Populated post-Phase-4 triage. Lists `Accelerators/ArtifactsFor<X>/` subfolders confirmed by routing + the source files copied into each.)_

| Subfolder | Target Future-State workstream | Files (copied from `raw/src/`) | Created in commit |
|---|---|---|---|
| _(empty — populated during Phase 4)_ | | | |

---

## Closeout summary (filled at Phase 8)

_(Captured at Sub-A Phase 8 close. Includes total row count, bucket distribution, Phase 4 triage outcomes, Accelerators populated, Future-State docs cross-referenced, sub-A closeout commit hash.)_

- Audit row count: __
- Bucket distribution: ✅ __ / ⏳ __ / 📋 __ / ❌ __ / 🚩 __ → triaged to TODO __ / Future-State __ / rejected __
- Accelerators subfolders: __
- Future-State docs cross-ref'd: __ / 8 (or more if new workstream docs created)
- Sub-A closeout commit: __
