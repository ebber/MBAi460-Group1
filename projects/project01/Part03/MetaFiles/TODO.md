# Project 01 Part 03 — ActionQueue

Part 03-scoped TODOs. For project-wide concerns, see [`MBAi460-Group1/MetaFiles/TODO.md`](../../../../MetaFiles/TODO.md). For visualization-specific concerns, see [`visualizations/MetaFiles/TODO.md`](../../../../visualizations/MetaFiles/TODO.md).

## Active

- [ ] **[Cleanup] Decide final disposition of legacy `server/api_*.js` files** — kept as a behavioral reference during Server Foundation (02) and API Routes (03) execution, per design-agent recommendation 2026-04-26. At end of Part 03, decide one of: (a) delete — behavior fully replicated in `routes/` + `services/` + `middleware/` and covered by tests; (b) archive — move to `MetaFiles/Reference/legacy/` for posterity; (c) keep in place — explicitly documented as inert reference. Record the decision in `MetaFiles/refactor-log.md`. (Express pivot, design-agent review 2026-04-26)
  - **Status note (2026-04-26 production polish):** the legacy `api_post_image.js` requires `uuid`, which has now been removed from `dependencies` until workstream 03 reinstalls it. The legacy file is therefore *require-broken* and remains as a **textual** reference only. Workstream 03 should re-add `uuid` (and pick `uuid@14` with jest `transformIgnorePatterns` OR `uuid@9.x` for CJS compat) when wiring the new service module — see `install-log.md` 2026-04-26 production-polish entry.

## Backlog

- [ ] **[Cleanup] Prune unused `response_page_size` from `server/config.js`** — `response_page_size: 12` is a leftover from the Project 2 baseline; not referenced by any post-Phase-9 server code. Workstream 03 will revisit `config.js` when adding the service module — fold this prune into that pass (or address standalone if 03 stalls). (Production review 2026-04-26)

## Closed / Confirmed

- [x] **[Reference] Bucketkey shape confirmed** — CONFIRMED 2026-04-26: `<username>/<uuid>-<localname>` per Part 2 convention. The literal `-` between uuid and localname is the intended separator (not `_` or `/`). Documented in `00-coordination-and-contracts.md` (`POST /api/images` implementation note) and used by `uploadImage` in `server/services/photoapp.js` (`03-api-routes.md` Phase 5). Kept here for cold-read context.
