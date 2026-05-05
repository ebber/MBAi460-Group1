---
name: Decision-surface diversity — accept multiple valid surfaces for capturing deferred decisions
description: When prescribing "capture decisions somewhere durable" as a team convention, accept multiple valid surfaces (refactor-log, commit-body, package.json description, README sidebar); working-style preference is allowed under a goal-level convention
type: feedback
---

When establishing a team convention around capturing deferred decisions / scope notes / architectural intent durably, **prescribe the goal, not the specific surface**. Accept multiple valid capture surfaces.

**Why:** Different agents and contributors gravitate toward different surfaces — refactor-log entries with numbered decisions, commit-body PDF citations, package.json description fields, README sidebars, MetaFiles markdown notes. Each surface is valid for the goal (capturing deferred decisions durably). Mandating one surface forces working-style preference to align around tooling rather than rigor. The convention should require *that* decisions are captured durably; it should not require *which* surface they live on.

**Pattern source (cross-branch, 2026-05-04 catch-and-merge):**
- `feat/p02-foundation` (Pranav): per-branch refactor-log with numbered decisions (substantial; documentation-first)
- `feat/p02-gradescope-mvp` (Andrew): package.json description + commit-body PDF citations (lightweight; metadata-as-doc)

Both captured deferred decisions durably. Both surfaces are valid. The cross-branch comparison showed: convergent goal, divergent surface. A team convention mandating "use refactor-log entries" would have penalized Andrew's working style without producing better outcomes; mandating "use commit bodies" would have penalized Pranav's depth.

**How to apply:**
- When writing CONTRIBUTING.md or similar conventions, prescribe the goal (e.g., "capture deferred decisions durably; cite specific lines/commits where applicable") not the surface ("use refactor-log entries").
- List multiple valid surfaces as examples: refactor-log, commit-body, manifest description, README sidebar, MetaFiles note. Make clear the list is non-exhaustive.
- For deferred decisions, the requirement is that they're (a) findable later (greppable, in a known location), (b) attributed (who, when, why), (c) actionable (the trigger condition for un-deferring is visible).
- This pattern composes with `feedback_descriptive_metadata.md` (manifest as one valid surface) and `feedback_refactor_log_structure.md` (refactor-log as another valid surface) — both are legal forms of the same goal.
- The diversity-acceptance pattern is itself a form of `feedback_system_first_framing.md` — the system accommodates multiple working styles rather than forcing compliance.

**Adjacent memories:**
- `feedback_descriptive_metadata.md` — one specific surface (manifest description)
- `feedback_refactor_log_structure.md` — another specific surface (refactor-log entries)
- `feedback_spec_citation_pattern.md` — another specific surface (commit body + code comments)
- `feedback_system_first_framing.md` — meta-principle (system accommodates rather than forces)
