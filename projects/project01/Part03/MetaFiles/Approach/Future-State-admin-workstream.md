# Future-State Workstream — Admin Views + Roles

**Status:** Aspirational. **Not committed to Part 03.** No admin features in shipped MVP.
**Priority:** STANDARD
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §4.3 (Staff TA persona), §5.6 (J6 Admin audit journey), §9.12 (Admin Users), §9.13 (Admin Assets), §10.5 (FR-ADMIN-1..4).
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`Andrew-MVP-Integration.md` rows 20, 27, 77, 100).

---

## Goal

Add admin / staff capabilities to the PhotoApp UI: read-only user list with asset counts, cross-user asset browser with filters, CSV export. Gated by a staff allowlist surfaced via the auth service's `roles` field on `GET /me`.

## Scope

1. **Staff allowlist gating.** Routes `/admin/*` only render when `GET /me` returns a `roles` array containing `staff`. UI hides admin nav items for non-staff. Server enforces the same — UI gating is UX, not security.
2. **`/admin/users`** — paginated table of all users with asset counts (joined from `assets` GROUP BY userid). Cursor-based pagination (100/page).
3. **`/admin/users/:id`** — single user detail with all their assets. Read-only (admin can browse but not modify user data).
4. **`/admin/assets`** — cross-user asset browser. Same Library layout + an extra `owner` column. Server-side filters: owner, type, date, labels.
5. **CSV export.** Export current user list view as CSV.

## Cross-refs

- **Andrew's spec:** §4.3, §5.6, §9.12, §9.13, §10.5
- **Audit rows:** 20 (Staff TA persona), 27 (J6 admin journey), 77 (Admin Users + Assets layouts), 100 (FR-ADMIN-1..4 grouped)
- **Dependencies:** Future-State auth (roles field on /me); admin routes can't ship before real auth lands.

## Implementation sketch

**Phase A — Auth-dependency gating.** Wait for Future-State auth to land roles on /me. Until then, /admin/* routes don't exist.

**Phase B — /admin/users.** Server endpoint `GET /admin/users` (joined query). Frontend table component (sortable, paginated). Reuse generic Table primitive from Future-State Form Library workstream (or build inline if Form Library hasn't landed yet).

**Phase C — /admin/users/:id detail.** Per-user asset list. Reuse Library list-view component.

**Phase D — /admin/assets cross-user browser.** Same as Library but with `?all=true` query + owner column.

**Phase E — CSV export.** Client-side generation from in-memory rows; server can also stream-generate for large sets.

## Open questions

- **Q-ADM-1:** Allowlist storage — on `users.role` column or separate `staff` table? (Spec says "staff allowlist held in the auth service.")
- **Q-ADM-2:** Pagination model — cursor-based per spec, but our current asset endpoints don't paginate. Aligns with Future-State Library Polish work.
- **Q-ADM-3:** CSV with PII (usernames, given/family names) — fine in class context; consider redaction options for future external deployment.

## Status

⏳ Queued (not active). Activates after Future-State auth (roles on /me) lands. Could be a parallel sub-workstream of an "auth + admin" mega-workstream.
