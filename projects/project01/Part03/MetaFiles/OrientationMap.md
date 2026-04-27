# Orientation Map

> **For:** Post-compaction orientation + cross-workstream navigation. Read this first when resuming after a context break.
> **Updated atomically** at each substep close-out, never from prediction (per `claude-workspace/memory/feedback_atomic_substep_updates.md`).
> **Complements (does not replace)** plan documents: plans are specs (stable); this Map is execution state (mutable).
> **Lifecycle:** This Map is grounded in the current Part 03 session. When the session/workstream-context closes, Erik will guide archival.
> **Compass relationship:** there is NO Compass section in this Map. The lite Compass (`← Back / ● Now / → Next / ⬆ Up`) is in-chat only, printed at the end of in-conversation responses during active execution, and is derived on-the-fly from this Map's Active section. The Map is the authoritative durable state; the Compass is its ephemeral conversational echo. Compaction loses the Compass (convenience), not the Map (authority).
> **Last updated:** 2026-04-27 — created at lab-root, relocated to Part 03 per Q1; sub-workstream C relocated to Class Project queue per Q3; status legend added (R1); Compass section removed (R3 — kept in-chat only).

---

## Status legend

| Symbol | Meaning |
|---|---|
| ⏳ | Queued / planned — not yet started |
| 🔄 | In progress — actively being worked by this agent |
| 🟡 | In-flight async — work is happening but outside this agent's direct execution (collaborators, Erik handles outside, async humans, background processes) |
| ✅ | Complete — work confirmed via file evidence + commit |
| 🚩 | Blocked / flagged for attention (also used for continuity-discrepancy flags per `feedback_flag_emoji.md`) |
| ⚠️ | Executed pre-approval — reverification required at next resumption |

---

## Active

### Workstream — Outstanding Integrations

**Goal:** Close the open integration threads between recently-shipped components (Andrew's MVP / backend / frontend / Class-Project / Lab-Root) before opening the next major arc.

**Status:** 🔄 Sub-A in flight — plan v3 greenlit + Phase 0 + Phase 1 complete 2026-04-27 (`outstanding-integrations-sub-A-plan.md` Master Tracker for execution detail).

**Sub-workstreams:**

| # | Sub-workstream | State | Pointer / source | Notes |
|---|---|---|---|---|
| A | Andrew's MVP — final handshakes | 🔄 (Phase 1/8) | `Part03/MetaFiles/plans/outstanding-integrations-sub-A-plan.md` (v3 greenlit 2026-04-27; execution started) | Phase 0 ✅ + Phase 1 ✅ (export-notes filled); Phase 2 (audit) next; ⚠️ PAUSE gate at Phase 4 for triage routing |
| B | Frontend ↔ Backend ↔ Approach-doc coherence audit | ⏳ | `Part03/frontend/src/api/types.ts` + `Part03/server/schemas.js` + `Part03/MetaFiles/Approach/00-coordination-and-contracts.md` | Cross-check envelope shape, route table, and contracts; surface drift if any |
| ~~C~~ | ~~Class Project ↔ Lab Root coordination~~ | **MOVED** | — | Relocated to Class Project queue 2026-04-27 per Q3 — see `MBAi460-Group1/MetaFiles/TODO.md` |
| D | Visualization handoff | ⏳ | `Part03/MetaFiles/TODO.md` (visualization entry, deferred to Erik per 2026-04-27 routing) | Update `Target-State-project01-part03-photoapp-architecture-v1.md` with actual stack |
| E | Future-State workstream prioritization | ⏳ | `Part03/MetaFiles/Approach/Future-State-*.md` (8 workstreams) | Decision point — which (if any) activates next; sequencing. *Note: this sub-workstream might warrant promotion to its own top-level workstream — see refinement notes.* |

---

## Pending (queued, not active)

| Workstream | State | Pointer | Notes |
|---|---|---|---|
| Sweep Class Project for drift | ⏳ Queued (next after Outstanding Integrations) | TBD | **Scope: all-of-above per Q2** — doc drift (plans vs. reality, approach docs vs. implementation), code drift (stale tests, untracked files, gitignore gaps), tracker drift (TODOs that should be closed, completed-but-not-flipped items) |
| [TBD #3] — anchor | ⏳ Placeholder | — | Per Q4: an explicit anchor we get to in a centered way, then assess in-place to choose direction. Not pre-filled. |
| Project 01 Part 03 — collaborator browser walk | 🟡 In-flight async | `Part03/MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md` | Collaborators walking L1–A11Y1 this afternoon (Erik 2026-04-27 routing); will tick checkboxes 8.1.1–15 + commit 8.1.19 |
| Future-State Auth + Account Management | ⏳ Queued | `Part03/MetaFiles/Approach/Future-State-auth-and-account-management-workstream.md` | Visual scaffolds shipped (Q10 non-blocking); real auth deferred |
| Future-State Chat | ⏳ Queued | `Future-State-chat-workstream.md` | |
| Future-State Command Palette (⌘K) | ⏳ Queued | `Future-State-command-palette-workstream.md` | |
| Future-State Documents + Textract (OCR) | ⏳ Queued | `Future-State-documents-and-textract-workstream.md` | Q9 — placeholder shipped in MVP |
| Future-State Playwright E2E | ⏳ Queued | `Future-State-playwright-e2e-workstream.md` | |
| Future-State Production Hardening | ⏳ Queued | `Future-State-production-hardening-workstream.md` | RDS lockdown, S3 ACL tighten, VPC scoping |
| Future-State shadcn Primitive Migration | ⏳ Queued | `Future-State-shadcn-primitive-migration-workstream.md` | Descoped 2026-04-27 R1 from MVP; could revisit |
| Future-State Tweaks Panel | ⏳ Queued | `Future-State-tweaks-panel-workstream.md` | |
| Project 03 (Auth Service + Chat App) | ⏳ Course-mandated | `projects/project03/create-authsvc.sql`, `create-chatapp.sql` | SQL scaffolds present; implementation not started |
| Lab 03, Lab 04 | ⏳ Course-mandated | `labs/lab03/`, `labs/lab04/` | |
| Lab Environment maturation | 🔄 Background | `claude-workspace/workstreams/lab-environment.md` | Agent-only |
| Agent Development | 🔄 Background | `claude-workspace/workstreams/agent-development.md` | Agent-only |

---

## Closed (recent — Class Project)

| Workstream | State | Closeout | Notes |
|---|---|---|---|
| Project 01 Part 03 — UI MVP (workstream 01) | ✅ DEV-COMPLETE 2026-04-27 | `378c8f3` (closeout) + `8f29463` (CLI-5 polish post-closeout) | Collaborator acceptance walk in flight |
| Project 01 Part 03 — Server Foundation (workstream 02) | ✅ Closed prior | `dbe05d3` + `080456f` (SPA hotfix) | |
| Project 01 Part 03 — API Routes (workstream 03) | ✅ Closed prior | (multi-commit Apr 26-27) | |
| Project 01 Part 02 — PhotoApp Python client | ✅ Closed | First-submission 70/70 | |
| Lab 02 — URL Shortener | ✅ Closed | 100/100 | |
| Lab 01 — AWS Setup | ✅ Closed | 10/10 | |

---

## Live findings + small queues

(Pointers only — see source TODO files for canonical entries.)

| Source | Entry | Status |
|---|---|---|
| Class Project queue | Cred-sweep noise floor + util refresh (17 hits) | ⏳ Open (added `f014f85`) |
| Class Project queue | Project 03 SQL committed passwords (B5) | ⏳ Open |
| Class Project queue | VCS strategy / multi-collaborator gitignore | ⏳ Open |
| Part 03 queue | Andrew MVP reconciliation suite (3 entries) | ⏳ Open — flows into Outstanding Integrations sub-A |
| Part 03 queue | Visualization update | ⏳ Open — Outstanding Integrations sub-D |
| Part 03 queue | Morgan request logging middleware | ⏳ Open — small-polish backlog |
| Part 03 queue | `utils/_run_sql.py` parser hardening | ⏳ Open |
| Part 03 queue | `utils/validate-db` empty-assets assertion drift | ⏳ Open |
| Part 03 queue | AssetCard live document metadata | ⏳ Open |
| Part 03 queue | Vitest oxc/esbuild noise | ⏳ Open |
| Part 03 queue | Centralize `deriveKind()` shared util | ⏳ Open |

---

## Update protocol

1. **At each substep close-out:** flip status (⏳ → 🔄 → ✅), update pointer/notes, add commit hash if applicable. Update *only after confirmation*, never from prediction.
2. **At workstream completion:** move row from Active to Closed (recent).
3. **At new workstream start:** add row to Active (or surface from Pending).
4. **The lite Compass is in-chat only.** Print at the end of every active-execution response, deriving directly from the Active section of this Map. There is no on-disk Compass to keep in sync.
5. **Before any forward execution after compaction:** re-read this Map, then perform the Refresh Ritual against it (per `feedback_refresh_ritual.md`). The Active section IS the execution-position claim — verify it against file state per the ritual's adversarial stance.

---

## Notes for cold-pickup readers

- This Map intentionally has overlap with `MBAi460-Group1/MetaFiles/TODO.md` (Class Project queue) and `Part03/MetaFiles/TODO.md` (Part 03 queue). Those remain canonical for individual TODO content; this Map is for *navigation* — picking which surface to engage with next.
- The lite Compass (`← Back / ● Now / → Next / ⬆ Up`) appended at the end of in-conversation responses is **derived on-the-fly from this Map's Active section** — there is no on-disk Compass section to keep in sync. The Compass is ephemeral conversational orientation; the Map is durable authoritative state.
- Plans (`Part03/MetaFiles/plans/*.md`) are still the source of truth for *how* to execute a workstream. This Map is the source of truth for *which* workstream is active and *where* execution is within it.
