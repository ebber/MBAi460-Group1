# Accelerators — Curated artifacts for Future-State workstreams

> **Purpose:** Curated copies of source artifacts (from external contributors, design exports, prior projects) organized by the **target Future-State workstream** they accelerate. When a Future-State workstream activates, the executing agent finds the relevant kickstarter material here instead of digging through raw drops.

---

## Pattern

Subfolder per target Future-State workstream, naming convention: **`ArtifactsFor<WorkstreamName>`** (mirroring the workstream's name in `Approach/Future-State-*.md`).

Each subfolder contains:

- The curated artifact files (jsx, css, html, etc.) — **copies**, not the originals (originals stay preserved per drop-zone contracts like `ClaudeDesignDrop/README.md`'s "preserve in `raw/`" rule).
- A subfolder `README.md` describing what's there + the target workstream.

## 1:1 mapping with Future-State workstream docs

| Subfolder | Target workstream doc |
|---|---|
| `ArtifactsForMobile/` | `Approach/Future-State-mobile-workstream.md` (may need creation per audit triage) |
| `ArtifactsFor<X>/` | `Approach/Future-State-<x>-workstream.md` |

The pattern is intentionally 1:1 — when Erik or an executing agent picks a Future-State workstream to activate, opening its docs and its accelerators is a single navigational hop.

## Distinction from `ClaudeDesignDrop/`

- **`ClaudeDesignDrop/raw/`** = raw export, **preserve as-is**. Don't modify; treat as immutable history of what came in.
- **`Accelerators/`** = curated, modifiable copies organized by purpose. Edit freely; refactor as Future-State work consumes them.

The two layers serve different purposes (preservation vs. usability) and intentionally hold duplicate content.

## Lifecycle

- Created when an audit + triage pass identifies artifacts useful for a future workstream (typically as part of a "MVP Integration" sub-workstream like Sub-A — see `MetaFiles/Andrew-MVP-Integration.md`).
- Stays until the target workstream consumes the artifacts (e.g., the mobile workstream activates, integrates `ArtifactsForMobile/` into its implementation, then the subfolder may be retired).
- Retirement is a deliberate close-out step — don't auto-delete.

## Provenance

Track each subfolder's origin in its own README so future readers can trace back to the audit row + the originating contributor / drop. Example: `ArtifactsForMobile/README.md` should reference the relevant rows in `MetaFiles/Andrew-MVP-Integration.md` and the source location in `ClaudeDesignDrop/raw/MBAi-460/src/`.
