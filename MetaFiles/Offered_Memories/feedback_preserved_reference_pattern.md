---
name: Preserved reference pattern — when moving files for architectural reasons, write an explanatory README same-commit
description: When relocating files (instructor template, reference implementation, archived spec) for architectural reasons, author a same-commit README explaining why they live there + their lifecycle; prevents next contributor from misinterpreting as live code or dead leftover
type: feedback
---

When you move a directory of files for architectural reasons — instructor template into a sibling directory, reference implementation into an `_archive/`, deprecated module into a `legacy/` — **write an explanatory README in the target directory in the same commit**.

**Why:** The next contributor opening the moved directory has three possible interpretations: (a) this is live code I should import from; (b) this is dead code I should delete; (c) this is preserved-reference material with a defined lifecycle. Without a README, (a) and (b) are the natural defaults — (c) is invisible. The README captures intent + lifecycle, making (c) explicit.

**Pattern source:** `feat/p02-foundation` branch (pranavvaranasi1254, 2026-05-04). When the instructor-baseline `api_*.js` files were moved from `projects/project02/server/` to `projects/project02/server/_assignment-template/`, a README was authored explaining: *why they live here* (rebuilding tree as lib consumer; flat layout incompatible with layered architecture) + *reference value* (documents the wire contract Gradescope expects) + *do not import from this directory* (read-only) + *lifecycle* (deletes after Phase 2 Gradescope acceptance).

**How to apply:**
- When moving files for architectural reasons, the same commit must include a README in the target directory containing:
  - **Why these files live here** (architectural rationale)
  - **Reference value** (what they document or preserve)
  - **Import policy** (do/don't import from this directory)
  - **Lifecycle** (when they get deleted, archived further, or superseded)
- The README is part of the move, not a follow-up — same commit + atomic.
- Pattern applies at multiple scales: per-directory archives (instructor templates, deprecated modules), per-file preserved references (legacy fixtures), per-commit reasoning (when leaving a noticeable transitional artifact in the tree).
- The README's lifecycle paragraph is critical: without it, the directory becomes permanent ambiguity. Include a deletion trigger ("delete after X happens") even if X is years away.

**Adjacent memories:**
- `feedback_atomic_substep_updates.md` — close-out completeness (the README is part of the move's definition of done)
- `feedback_doc_workflow_alignment.md` — current vs aspirational state in docs (the lifecycle paragraph distinguishes the two)
