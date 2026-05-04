# Orientation Map

> **For:** Post-compaction orientation + cross-workstream navigation. Read this first when resuming after a context break.
> **Updated atomically** at each substep close-out, never from prediction (per `claude-workspace/memory/feedback_atomic_substep_updates.md`).
> **Complements (does not replace)** plan documents: plans are specs (stable); this Map is execution state (mutable).
> **Lifecycle:** This Map is grounded in the current Part 03 session. When the session/workstream-context closes, Erik will guide archival.
> **Compass relationship:** there is NO Compass section in this Map. The lite Compass (`← Back / ● Now / → Next / ⬆ Up`) is in-chat only, printed at the end of in-conversation responses during active execution, and is derived on-the-fly from this Map's Active section. The Map is the authoritative durable state; the Compass is its ephemeral conversational echo. Compaction loses the Compass (convenience), not the Map (authority).
> **Last updated:** 2026-05-04 — Future-State Playwright E2E activated (surfaced from Pending → Active); Phase 04 plan written + self-approved + committed `8f17d76` on branch `feat/p01p03-playwright-e2e`. Prior update 2026-04-27.

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

**Future-State Playwright E2E** | 🔄 In progress (Phase A bootstrap) | `Part03/MetaFiles/plans/04-playwright-e2e-plan.md` | branch `feat/p01p03-playwright-e2e` (commit `8f17d76`).

Activated 2026-05-04 (surfaced from Pending). Targets 12 of 15 unticked browser-based human-walk rows in `MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md`. 3 rows (LIB1 perf, LIB2 responsive, A11Y1 a11y) explicitly deferred to other workstreams — see plan §"Test scope reminder".

Phase A pre-flight (P.1) confirmed live: `/health` 200, `/api/ping` returns `{user_count: 3, s3_object_count: 14}`, `/api/images` returns asset list. Required dependencies installed: backend `npm install` (workspaces hoist to root); frontend `npm install` + `npm run build` (188 MB node_modules, 214 KB bundle). Config files copied from sibling `mbai460-client/MBAi460-Group1/` checkout (gitignored — no commit leak).

**Sequencing:** Phase A → B → B-sidecar (destructive) → C → D → E (CI) → F (DOC-FRESHNESS + PR open). Erik reviews at phase boundaries.

**Other Tier 1 candidates remain queued in Pending** (Form Library, Library Polish, Sweep-for-drift) — engaged after this workstream closes.

---

## Pending (queued, not active)

| Workstream | State | Pointer | Notes |
|---|---|---|---|
| Sweep Class Project for drift | ⏳ Eligible for activation (Outstanding Integrations closed 2026-04-27) | TBD | **Scope: all-of-above per Q2** — doc drift (plans vs. reality, approach docs vs. implementation), code drift (stale tests, untracked files, gitignore gaps), tracker drift (TODOs that should be closed, completed-but-not-flipped items). Sub-E's "single-best-bet absent context" recommendation (`eeb4be2`) suggests this as the next workstream — clean substrate gate before any major Future-State activation |
| [TBD #3] — anchor | ⏳ Placeholder | — | Per Q4: an explicit anchor we get to in a centered way, then assess in-place to choose direction. Not pre-filled. |
| Project 01 Part 03 — collaborator browser walk | 🟡 In-flight async | `Part03/MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md` | Collaborators walking L1–A11Y1 this afternoon (Erik 2026-04-27 routing); will tick checkboxes 8.1.1–15 + commit 8.1.19 |
| Future-State Auth + Account Management | ⏳ Queued | `Part03/MetaFiles/Approach/Future-State-auth-and-account-management-workstream.md` | Visual scaffolds shipped (Q10 non-blocking); real auth deferred |
| Future-State Chat | ⏳ Queued | `Future-State-chat-workstream.md` | |
| Future-State Command Palette (⌘K) | ⏳ Queued | `Future-State-command-palette-workstream.md` | |
| Future-State Documents + Textract (OCR) | ⏳ Queued | `Future-State-documents-and-textract-workstream.md` | Q9 — placeholder shipped in MVP |
| ~~Future-State Playwright E2E~~ | 🔄 **MOVED TO ACTIVE 2026-05-04** | `Part03/MetaFiles/plans/04-playwright-e2e-plan.md` | See Active section above |
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
| Outstanding Integrations workstream | ✅ COMPLETE 2026-04-27 | sub-A `1c4d2aa` (16 commits) + sub-B `324e855` (9 commits) + sub-D `a365807` + sub-E `eeb4be2` + this commit Action 3 | All 4 active sub-workstreams closed; sub-C moved to Class Project queue. Sub-A: Andrew MVP audit + Accelerators + 6 NEW Future-State docs + 9 TODOs. Sub-B: 23-row contract audit + 1 drift fix + type tightening (post-remediation: 22 ✅ / 0 🚩 / 1 ⏳). Sub-D: viz update queued for Erik external. Sub-E: 14-workstream priority recommendation in Future-State-roadmap.md (Tier 1: Playwright E2E + Form Library + Library Polish). |
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
| Part 03 queue | Andrew MVP reconciliation suite (3 entries) | ✅ CLOSED at sub-A 2026-04-27 (`1c4d2aa`) |
| Part 03 queue | Visualization update | ✅ CLOSED at sub-D 2026-04-27 (`a365807`) — viz TODO entry now in `visualizations/MetaFiles/TODO.md` for Erik's external execution |
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
