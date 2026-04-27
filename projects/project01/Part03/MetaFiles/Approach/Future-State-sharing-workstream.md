# Future-State Workstream — Sharing + Guest Mode

**Status:** Aspirational. **Not committed to Part 03.** No sharing or guest-mode in shipped MVP.
**Priority:** **LOW** / long-term (per Erik routing 2026-04-27)
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §4.4 (Prof. Hummel guest reviewer persona), §9.4 (asset shareable by link if public), §7.2 (asset detail "Shareable by link if asset is marked public").
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`Andrew-MVP-Integration.md` rows 21, 22 partial).

---

## Goal

Allow asset owners to mark assets as publicly shareable; non-authenticated visitors can view those assets via a direct URL with a "guest mode" banner. No upload, no chat, no delete from guest view — strict read-only access.

## Scope

1. **Public/private flag on assets.** Add `is_public BOOLEAN` to `assets` schema; default false. Owners toggle via Asset Detail action.
2. **Shareable URL pattern.** `/asset/:id?guest=1` (or just `/asset/:id` works if asset's `is_public = true` and no auth header).
3. **Guest-mode UI banner.** Banner at top of Asset Detail in guest mode: "You're viewing as a guest. Sign in for full access."
4. **Server-side gating.** `GET /api/images/:id` checks: if requester has token + is owner OR is_public — serve. Otherwise 404 (NOT 403, per spec §9.5 A1 to avoid revealing existence).
5. **Hide all interactive controls in guest mode.** No upload button, no chat icon, no delete, no rename. Display + download (of the public asset) only.

## Cross-refs

- **Andrew's spec:** §4.4 Prof. Hummel persona, §7.2 route table, §9.4 asset shareable by link, §9.5 A1 cross-user 404
- **Audit rows:** 21 (Prof. Hummel guest reviewer), 22 (J1 first-time onboarding includes shareable patterns implicitly)
- **Dependencies:**
  - Future-State auth must define how requests-without-tokens are handled (current MVP non-blocking, so guest-mode pattern would shift when real auth lands)
  - Asset schema migration (add `is_public` column) — coordinate with backend workstream
  - May depend on Future-State Library Polish if shareable links surface in the right-click context menu

## Implementation sketch

**Phase A — Schema + server.** Add `is_public` column. Update `GET /api/images/:id` access logic. Owner toggle via PATCH /api/images/:id.

**Phase B — UI: Asset Detail toggle.** Add "Make public" / "Make private" action in the Asset Detail actions row. Coordinate with Future-State Library Polish to land the actions row.

**Phase C — Guest-mode UI.** Detect missing/invalid token + is_public asset → render guest banner; hide non-public actions.

**Phase D — Shareable link UI.** "Copy public link" action; show only when asset is public.

## Open questions

- **Q-SHARE-1:** Time-bounded share links (expiry) — basic `is_public` boolean or signed-URL with expiry? Spec implies simple boolean; expiry adds significant complexity. Defer to phase 2 of this workstream if needed.
- **Q-SHARE-2:** Guest-mode tracking — do we count guest visits? (Production-Hardening observability question.) Defer.
- **Q-SHARE-3:** Public asset discoverability — anonymous Library at `/public`? Spec doesn't say; recommend out-of-scope (link-only sharing keeps URL-as-the-token).

## Status

⏳ Queued (LOW / long-term). Activate after auth + library polish stabilize; until then, sharing isn't a near-term need (class-internal demos work fine without it).
