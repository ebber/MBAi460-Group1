# ArtifactsForLibraryPolish

Curated copy of Andrew Tapple's `asset.jsx` from his Frontend MVP (commit `1f3c067`, `ClaudeDesignDrop/raw/MBAi-460/src/`). Original stays preserved in `raw/`.

## Files

| File | Size | Source role | Acceleration value |
|---|---|---|---|
| `asset.jsx` | 19 KB | Andrew's asset-detail component | **3× larger than our shipped `frontend/src/pages/AssetDetail.tsx` (5.9 KB)** — likely contains features ours lacks: pan/zoom image viewer, full metadata panel (uploaded date / type / size / bucket / key / asset id), Re-analyze button, deletion flow with type-the-name confirm, possibly OCR extracted-text panel for document branch |

## Target workstream

`MetaFiles/Approach/Future-State-library-polish-workstream.md` (**HIGH** priority — most user-visible Future-State work).

When that workstream activates, the executing agent should:

1. Diff `asset.jsx` against our shipped `frontend/src/pages/AssetDetail.tsx` + `AssetDetailPage.tsx` to identify which features are present in Andrew's version and missing in ours.
2. Migrate the missing features (pan/zoom image viewer, metadata panel, re-analyze action, etc.) to TypeScript, matching our shipped MVP's stack (no shadcn per R1; custom Tailwind primitives).
3. Cross-reference `MetaFiles/archive/Andrew-MVP-Integration.md` rows 62–65, 84, 85, 87, 96 for the specific audit-row-level commitments.

## Provenance

- **Original location:** `Part03/ClaudeDesignDrop/raw/MBAi-460/src/asset.jsx`
- **Copied to:** `Part03/Accelerators/ArtifactsForLibraryPolish/asset.jsx` (this dir)
- **Copy date:** 2026-04-27 (Outstanding Integrations sub-A Phase 4.3)
- **Audit cross-refs:** rows 62-65 (Asset Detail Photo layout + data + states + acceptance), 84 (FR-ASSET-4 inline rename), 85 (FR-ASSET-5 per-asset delete), 87 (FR-ASSET-7 multi-select), 96 (FR-AI-6 manual re-run) in `MetaFiles/archive/Andrew-MVP-Integration.md`
- **Originals:** preserved in `raw/` (do not modify); this copy is modifiable.
