# Claude Design Export Notes

## Source

Exported from Claude Design by: **Andrew Tapple** (MBAi 460 Spring 2026, Group 1)

Date: **2026-04-26** (commit `1f3c067` "Frontend MVP" in `MBAi460-Group1` repo)

## File Type

Hybrid — multiple file types in one drop:

- [x] Plain HTML/CSS/JS — 9 HTML files at `raw/MBAi-460/` (Console + Mobile variants — Standalone, print, src, base) totaling ~17 MB
- [x] React/JSX — 13 files at `raw/MBAi-460/src/`: `asset.jsx`, `auth.jsx`, `data.jsx`, `icons.jsx`, `ios-frame.jsx`, `library.jsx`, `mobile-core.jsx`, `mobile-screens.jsx`, `mobile-shell.jsx`, `screens.jsx`, `shell.jsx`, plus `tokens.css` + `mobile.css`
- [ ] Tailwind classes — N/A (Andrew uses inline styles + custom CSS via `tokens.css`; we adapted the tokens into `tailwind.config.ts` during Part 03 UI MVP)
- [x] External CDN dependencies — HTML files use React via unpkg CDN (not bundled)
- [x] Other — supporting files at `raw/MBAi-460/uploads/`: `UI-Design-Requirements.md` (1609 lines, scope = P01+P02+P03) + 1 PNG (`draw-f976e4f9-...png`, ~178 KB)

## Known Issues

- **Original location violated drop-zone contract.** Andrew initially placed the export at the repo-root `MBAi-460/` directory (out-of-contract per `ClaudeDesignDrop/README.md`'s "preserve in `raw/`" rule). Relocated 2026-04-26 to `ClaudeDesignDrop/raw/MBAi-460/`. Repo-root `MBAi-460/` no longer exists.
- **Standalone HTML files use React via unpkg CDN** rather than a built bundle. Files are openable locally if the network is up; offline use requires bundling.
- **`src/` mixes desktop and mobile concerns.** Desktop components (`shell.jsx`, `library.jsx`, `auth.jsx`, `screens.jsx`, plus `tokens.css`) were largely migrated to TypeScript during the Part 03 UI MVP execution (see `01-ui-workstream-plan.md`). Mobile components (`mobile-shell.jsx`, `mobile-core.jsx`, `mobile-screens.jsx`, `mobile.css`, `ios-frame.jsx`) are Future-State — not yet integrated into our shipped MVP.
- **Naming drift.** Andrew uses "MBAi 460" (with space) and "MBAi-460" (hyphenated) as brand/folder names; our repo is `MBAi460-Group1` (no space, no hyphen). All refer to the same lab — see Sub-A Phase 6 reconciliation note.
- **Spec scope is broader than Part 03.** `UI-Design-Requirements.md` covers Project 01 + Project 02 + Project 03; mentions Textract for documents (Q9 — Future-State for us); auth + chat from Project 03 (also Future-State for us). Phase 2 audit triages each spec item.

## Integration Notes

**Canonical spec:** `raw/MBAi-460/uploads/UI-Design-Requirements.md` (1609 lines, 15 sections — Andrew's owner-approved requirements doc).

**What landed in our shipped MVP:** see `Part03/MetaFiles/Approach/01-ui-workstream.md` for Part-03 implementation notes; `Part03/MetaFiles/plans/01-ui-workstream-plan.md` Master Tracker for execution status.

**Audit table (per-section accountability):** see `Part03/MetaFiles/Andrew-MVP-Integration.md` (created during Sub-A Phase 2). Each functional/visual item from UI-Design-Requirements.md is routed to a bucket: ✅ implemented / ⏳ Future-State / 📋 TODO / ❌ out-of-scope-rejected.

**Accelerators for Future-State workstreams:** see `Part03/Accelerators/` for curated copies of relevant Andrew artifacts (e.g., `ArtifactsForMobile/` populated post-Phase-4 triage). Originals stay preserved in `raw/` per the drop-zone contract; Accelerators is the curated copy layer.

**Components in our MVP** (mapping to Andrew's `src/` files):

| Andrew's source | Our migrated TypeScript |
|---|---|
| `shell.jsx` | `frontend/src/components/TopBar.tsx`, `LeftRail.tsx`, `PageHeader.tsx`, `ToastProvider.tsx`, `Modal.tsx` |
| `library.jsx` | `frontend/src/components/Library.tsx`, `AssetCard.tsx`, `ListView.tsx`, `EmptyLibrary.tsx` |
| `auth.jsx` | `frontend/src/components/LoginScreen.tsx`, `RegisterScreen.tsx` (Q10 non-blocking) |
| `screens.jsx` | `frontend/src/components/UploadScreen.tsx` |
| `asset.jsx` | `frontend/src/pages/AssetDetail.tsx` (partial — Andrew's is larger; audit will reveal feature gaps) |
| `icons.jsx` | `frontend/src/components/Icon.tsx` (lucide-react named imports) |
| `tokens.css` | `frontend/tailwind.config.ts` (token translation per R1 descope of shadcn) |
| `data.jsx` | N/A — superseded by live API (`frontend/src/api/photoappApi.ts`) |
| `mobile-*.jsx`, `ios-frame.jsx`, `mobile.css` | Future-State (Mobile workstream not yet active) |

## Integration Status

✅ **COMPLETE** 2026-04-27 — Sub-A closed. All 1609 lines of `UI-Design-Requirements.md` audited via `Part03/MetaFiles/Andrew-MVP-Integration.md` (147 audit rows / 13 routing themes); 7 source files curated to `Part03/Accelerators/` (5 mobile + asset.jsx + screens.jsx); 6 NEW Future-State workstream docs created + 2 existing docs extended; 9 standalone TODOs added; all 8 existing Future-State workstream docs have cross-reference sections back to Accelerators + audit table.
