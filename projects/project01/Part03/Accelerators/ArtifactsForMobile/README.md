# ArtifactsForMobile

Curated copies of Andrew Tapple's mobile-specific source files from his Frontend MVP (commit `1f3c067`, `ClaudeDesignDrop/raw/MBAi-460/src/`). Originals stay preserved in `raw/` per the drop-zone contract; these are the working copies.

## Files

| File | Size | Source role | Acceleration value |
|---|---|---|---|
| `mobile-core.jsx` | 32 KB | Mobile core layout + nav primitives | Largest mobile file; likely contains the mobile-shell composition + state hooks |
| `mobile-screens.jsx` | 29 KB | Mobile per-screen views | Likely contains mobile-adapted Library / Asset Detail / Upload screens |
| `mobile-shell.jsx` | 10 KB | Mobile shell wrapper (mobile equivalent of Andrew's desktop `shell.jsx`) | Mobile TopBar + LeftRail equivalents |
| `mobile.css` | 8 KB | Mobile-specific CSS tokens / overrides | Pairs with `tokens.css` (already translated to `tailwind.config.ts`) |
| `ios-frame.jsx` | 15 KB | iOS-frame visual mockup component | Possibly a development-time frame for iOS preview, or a real iOS-PWA shell |

## Target workstream

`MetaFiles/Approach/Future-State-mobile-workstream.md` (STANDARD priority).

When that workstream activates, the executing agent reads these files to decide:
1. Migrate as a parallel mobile shell (matches Andrew's design intent; more divergence)
2. OR enhance desktop components for responsiveness (lighter touch; single codebase)

Either path uses these files as starting reference, not literal `.jsx` to `.tsx` ports — Andrew's mobile components were written before our Part 03 stack was finalized; some patterns won't translate directly.

## Provenance

- **Original location:** `Part03/ClaudeDesignDrop/raw/MBAi-460/src/{mobile-core, mobile-screens, mobile-shell, ios-frame}.jsx + mobile.css`
- **Copied to:** `Part03/Accelerators/ArtifactsForMobile/` (this dir)
- **Copy date:** 2026-04-27 (Outstanding Integrations sub-A Phase 4.3 — commit TBD post this commit)
- **Audit cross-refs:** rows 109 (mobile <768 hamburger), 134 (browser+device support) in `MetaFiles/Andrew-MVP-Integration.md`
- **Originals:** preserved in `raw/` (do not modify); these copies are modifiable.
