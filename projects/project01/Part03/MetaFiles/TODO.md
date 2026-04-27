# Project 01 Part 03 — ActionQueue

Part 03-scoped TODOs. For project-wide concerns, see [`MBAi460-Group1/MetaFiles/TODO.md`](../../../../MetaFiles/TODO.md). For visualization-specific concerns, see [`visualizations/MetaFiles/TODO.md`](../../../../visualizations/MetaFiles/TODO.md).

**Decision record:** Part 03 design decisions (Q1–Q6 from the Express pivot, plus any future architectural calls) live in [`DesignDecisions.md`](DesignDecisions.md). New collaborators — read that doc first to understand the *why* behind Part 03's structure.

## Active

- [ ] **[Cleanup] Decide final disposition of legacy `server/api_*.js` files** — kept as a behavioral reference during Server Foundation (02) and API Routes (03) execution, per design-agent recommendation 2026-04-26. At end of Part 03, decide one of: (a) delete — behavior fully replicated in `routes/` + `services/` + `middleware/` and covered by tests; (b) archive — move to `MetaFiles/Reference/legacy/` for posterity; (c) keep in place — explicitly documented as inert reference. Record the decision in `MetaFiles/refactor-log.md`. (Express pivot, design-agent review 2026-04-26)
  - **Status note (2026-04-26 production polish):** the legacy `api_post_image.js` requires `uuid`, which has now been removed from `dependencies` until workstream 03 reinstalls it. The legacy file is therefore *require-broken* and remains as a **textual** reference only. Workstream 03 should re-add `uuid` (and pick `uuid@14` with jest `transformIgnorePatterns` OR `uuid@9.x` for CJS compat) when wiring the new service module — see `install-log.md` 2026-04-26 production-polish entry.

- [ ] **[UI] Fill `ClaudeDesignDrop/notes/export-notes.md` with metadata for Andrew's Frontend MVP** — Andrew shipped the Claude Design export as commit `1f3c067` ("Frontend MVP"). The export was placed at the repo-root `MBAi-460/` directory (out of contract); a separate task will relocate it under `ClaudeDesignDrop/raw/`. Once relocated, fill the export-notes template with: source = Andrew Tapple, date = 2026-04-26, file types = HTML + JSX + CSS + uploads/, dependencies = React 18.3.1 from unpkg CDN, integration notes pointing at `MBAi-460/uploads/UI-Design-Requirements.md`. (Andrew MVP integration, 2026-04-26)

- [ ] **[Coordination] Surface Express pivot + Q1–Q6 decisions to Andrew** — Andrew branched from `863db9f` (pre-pivot); his Frontend MVP independently picked Express + React, but he hasn't seen our pivot record. First touch: journal entry written 2026-04-26 in `MBAi460-Group1/MetaFiles/Journal/` pointing him at `Part03/MetaFiles/DesignDecisions.md`. Erik will also point Andrew at this TODO queue. Keep open as the active coordination thread — close when Andrew has acknowledged + the path forward is agreed. (Express pivot + Andrew MVP, 2026-04-26)

- [ ] **[UI/Coordination] Reconcile Andrew's design into the approach docs and other structures** — Andrew's `MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines) is broader than Part 03 (covers P01+P02+P03, mentions Textract for documents, auth + chat from Project 03). Reconcile: (a) distill the Part-03-relevant subset and link from `01-ui-workstream.md`; (b) preserve the broader vision in a Future-State doc rather than discarding; (c) update `Target-State-project01-part03-photoapp-architecture-v1.md` if his UI structure implies architectural updates; (d) reconcile any naming-convention drift (`MBAi-460/` hyphenated vs. our `MBAi460-Group1` etc.). (Andrew MVP integration, 2026-04-26)

- [ ] **[Tooling] Make an Orientation Map for Part 03** — A separate artifact from `plans/03-api-routes-plan.md` that tracks the live execution point (Phase → Task → Step) and serves as the post-compaction orientation file. **Triggered when the 03 plan is complete and approved.** During this session, the plan's Master Tracker + checkbox state plays the dual Plan + Map role; once the plan is finalized, split the orientation surface into its own file so the plan stays a stable spec while the Map tracks mutable execution state. Decision pending on (a) file location: `Part03/MetaFiles/orientation-map-03.md` (workstream-scoped) vs. richer cross-workstream Map at lab-workspace level; (b) update cadence: per-substep (per `feedback_atomic_substep_updates.md`). (Refresh ritual surface 2026-04-27)

## Backlog

- [ ] **[Cleanup] Prune unused `response_page_size` from `server/config.js`** — `response_page_size: 12` is a leftover from the Project 2 baseline; not referenced by any post-Phase-9 server code. Workstream 03 will revisit `config.js` when adding the service module — fold this prune into that pass (or address standalone if 03 stalls). (Production review 2026-04-26)

## Closed / Confirmed

- [x] **[Reference] Bucketkey shape confirmed** — CONFIRMED 2026-04-26: `<username>/<uuid>-<localname>` per Part 2 convention. The literal `-` between uuid and localname is the intended separator (not `_` or `/`). Documented in `00-coordination-and-contracts.md` (`POST /api/images` implementation note) and used by `uploadImage` in `server/services/photoapp.js` (`03-api-routes.md` Phase 5). Kept here for cold-read context.
