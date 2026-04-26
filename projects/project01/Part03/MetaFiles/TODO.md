# Project 01 Part 03 — ActionQueue

Part 03-scoped TODOs. For project-wide concerns, see [`MBAi460-Group1/MetaFiles/TODO.md`](../../../../MetaFiles/TODO.md). For visualization-specific concerns, see [`visualizations/MetaFiles/TODO.md`](../../../../visualizations/MetaFiles/TODO.md).

## Active

- [ ] **[Cleanup] Decide final disposition of legacy `server/api_*.js` files** — kept as a behavioral reference during Server Foundation (02) and API Routes (03) execution, per design-agent recommendation 2026-04-26. At end of Part 03, decide one of: (a) delete — behavior fully replicated in `routes/` + `services/` + `middleware/` and covered by tests; (b) archive — move to `MetaFiles/Reference/legacy/` for posterity; (c) keep in place — explicitly documented as inert reference. Record the decision in `MetaFiles/refactor-log.md`. (Express pivot, design-agent review 2026-04-26)

## Backlog

(empty)

## Closed / Confirmed

- [x] **[Reference] Bucketkey shape confirmed** — CONFIRMED 2026-04-26: `<username>/<uuid>-<localname>` per Part 2 convention. The literal `-` between uuid and localname is the intended separator (not `_` or `/`). Documented in `00-coordination-and-contracts.md` (`POST /api/images` implementation note) and used by `uploadImage` in `server/services/photoapp.js` (`03-api-routes.md` Phase 5). Kept here for cold-read context.
