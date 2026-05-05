---
name: Per-sub-phase refactor-log structure — Outcome / Numbered Decisions / Optional Steps routing / Push posture
description: Refactor-log entries should follow a consistent per-sub-phase shape with four named sections; numbered decisions force separation, per-sub-phase Optional Steps routing applies the Plan-level mechanic at workstream-pickup granularity
type: feedback
---

For per-sub-phase refactor-log entries (the kind that close out a step within a workstream), use a consistent four-section shape:

1. **Outcome** — one paragraph summarizing what landed
2. **Decisions** — numbered list (1, 2, 3, ...) of judgment calls made during execution, each with rationale + evidence pointer (filename:line + commit hash where applicable)
3. **Optional Steps routing** — per-item ✅ executed / 📋 queued / ⏭️ skipped, each with rationale
4. **Push posture** — one line on the close state (clean, ready for review, blocked, etc.)

**Why:** Numbered decisions force the writer to separate concerns rather than blending them into prose. A reader skimming the log can find a specific decision in seconds + reach for it without parsing surrounding text. Per-sub-phase Optional Steps routing applies the Plan-level Optional Steps Registry mechanic at workstream-pickup granularity — keeps optional-vs-mandatory accounting visible at the moment of close-out, not deferred to a quest-end accounting pass.

**Pattern source:** `feat/p02-foundation` branch (pranavvaranasi1254, 2026-05-04). Sub-phase 1.0 closeout had 5 numbered decisions; sub-phase 1.9 had 7 including "Husky wire-up deferred" with 100-word rationale + future-action template (`npx husky init && ...`). Sub-phase 1.5–1.11 closeout had per-item Optional Steps routing with rationale.

**How to apply:**
- When closing a sub-phase in any refactor-log, structure the entry as the four sections above
- For Decisions: each gets a number, a one-line summary, and a paragraph of rationale + evidence; cite specific lines/commits where applicable
- For Optional Steps routing: list each Optional Step touched + the routing decision (✅/📋/⏭️) + one-line rationale
- For Push posture: name the close state explicitly ("Clean; ready for next sub-phase," "Blocked on X," "Tests green; lint clean")
- Useful adjuncts: per-decision "future action template" (the exact command to execute when un-deferring); links to the corresponding Plan tracker rows

**Adjacent memories:**
- `feedback_atomic_substep_updates.md` — close-out per substep before moving on (the discipline this structure operationalizes)
- `feedback_checkbox_verification.md` — checkboxes are claims, not evidence (per-decision evidence pointers honor this)
