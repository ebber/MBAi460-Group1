# Future-State Workstream — Library Polish

**Status:** Aspirational. **Not committed to Part 03.** Shipped MVP has the Library page working with grid+list toggle + search by label; this workstream adds the spec's full set of browse/filter/multi-select features.
**Priority:** **HIGH** (per Erik routing 2026-04-27 — most user-visible Future-State work in the queue)
**Source:** distilled from Andrew's `UI-Design-Requirements.md` §5.4 (J4 browse + search journey), §9.4 (Library/Dashboard screen), §9.5 (Asset detail Photo), §10.2 (FR-ASSET-2..9).
**Provenance:** Surfaced 2026-04-27 during Outstanding Integrations sub-A audit (`MetaFiles/archive/Andrew-MVP-Integration.md` rows 23, 25, 35, 38, 57, 58, 60, 62-65, 82-89, 96, 123 — 15+ row cluster).

---

## Goal

Bring the Library page from "MVP grid + label search" to spec — full filter bar, sort controls, multi-select with batch actions, cursor pagination, inline rename, per-asset delete with confirmation, signed thumbnail URLs, OCR-text search (gated on Textract). Touch the Asset Detail page to add the missing metadata fields + actions (Re-analyze, per-asset Delete) that match Andrew's §9.5 spec.

## Scope

1. **Filter bar (date / type / labels).** Type = photo/document, Date range, Label multi-select. Server-side filtering via query params. Per spec §9.4, §10.2 FR-ASSET-2.
2. **Sort controls.** "Newest ▾" dropdown with options: newest, oldest, by name, by size. Per spec §9.4.
3. **Multi-select + batch actions.** Shift-click to select multiple cards; batch actions appear: Download zip, Delete, Move to (folders deferred). Per spec §5.4 J4, §9.4 interactions, §10.2 FR-ASSET-7.
4. **Cursor-based pagination.** Replace "load all" with `GET /api/images?limit=50&cursor=…` (or page-number variant for admin). Per spec §6.4, §9.4 pagination, §10.2 FR-ASSET-2.
5. **Signed thumbnail URLs.** Replace direct `/api/images/:id/file` with presigned S3 URLs for thumbnails (15-min expiry). Per spec §9.4 data shape, §13.10. (Intersects Production-Hardening workstream.)
6. **Inline rename.** Click localname → editable text → save via `PATCH /api/images/:id` (new endpoint). Per spec §5.2 J2, §10.2 FR-ASSET-4.
7. **Per-asset delete with type-the-name confirmation.** Replace global delete-all (or augment) with per-asset delete via `DELETE /api/images/:id`. Per spec §9.5, §10.2 FR-ASSET-5.
8. **Right-click context menu.** Rename, Delete, Copy link. Per spec §9.4 interactions.
9. **"u" key opens upload modal.** Keyboard shortcut. Per spec §9.4 interactions. (Intersects Future-State Command Palette for ⌘K.)
10. **Asset Detail polish.** Two-pane layout already present; add full metadata panel (uploaded date, type, size, bucket, key, asset id) + actions (Download, Re-analyze, Delete with type-the-name confirm). Per spec §9.5.
11. **OCR-text search.** When Textract lands, extend `searchImages` to fuzzy-match OCR excerpts. (Intersects Future-State Documents+Textract.)
12. **Empty / error / partial-failure states.** Loading 12 skeleton cards; empty-state illustration + CTA; partial-failure retry banner at bottom. Per spec §9.4 states.
13. **Sticky table headers + row-hover + selected-highlight.** ListView refinements. Per spec §12.3 table patterns.

## Cross-refs

- **Andrew's spec:** §5.4 (J4), §9.4, §9.5, §10.2 (FR-ASSET-2..9), §12.3 (table patterns)
- **Audit rows:** 23, 25, 35, 38, 57, 58, 60, 62-65, 82-89, 96, 123
- **Accelerators:** `Part03/Accelerators/ArtifactsForLibraryPolish/asset.jsx` — Andrew's 19KB asset-detail file (3× our shipped AssetDetail.tsx); examine for pan/zoom image viewer, full metadata panel, re-analyze button, etc.
- **Dependencies:**
  - Many items need new server endpoints (PATCH /api/images/:id, DELETE /api/images/:id, signed thumbnail URL generation, cursor pagination); coordinate with API workstream.
  - "u" key + ⌘K depend on Future-State Command Palette.
  - Multi-select + batch + zip depends on a server-side zip-stream endpoint.
  - OCR text search depends on Future-State Documents + Textract.

## Implementation sketch

**Phase A — Server endpoints (foundation).** PATCH /api/images/:id, DELETE /api/images/:id, cursor pagination on GET /api/images, presigned-thumbnail URL generation. Tests on backend.

**Phase B — Frontend filter bar + sort.** UI elements; wire to query params.

**Phase C — Multi-select + per-asset delete.** Selection state in Zustand; batch-action bar.

**Phase D — Inline rename.** Editable text component; PATCH integration.

**Phase E — Asset Detail polish.** Pull from `Accelerators/ArtifactsForLibraryPolish/asset.jsx` for inspiration on metadata panel + actions.

**Phase F — Right-click + keyboard shortcuts.** Lower-priority polish.

**Phase G — Multi-select zip download.** Requires server-side zip-stream endpoint; deferred until earlier phases stabilize.

**Phase H — OCR text search.** Activate when Textract workstream lands.

## Open questions

- **Q-LIB-1:** Cursor format — opaque base64 of (assetid, timestamp) or simple offset? Affects API contract.
- **Q-LIB-2:** Folders/tags (FR-ASSET-10 MAY) — defer to a separate "Folders + Tags" workstream or include here? Recommend defer.
- **Q-LIB-3:** Multi-select + zip — significant server work (zip streaming). Worth it for a class project? Andrew's spec says SHOULD priority; user value is real.
- **Q-LIB-4:** Andrew's `asset.jsx` may have desktop-only patterns (pan/zoom for large images) that conflict with mobile-first sizing. Reconcile during Phase E.

## Status

⏳ Queued (HIGH priority). Most user-facing Future-State work; activate when Erik wants to evolve the Library experience past the MVP minimum.
