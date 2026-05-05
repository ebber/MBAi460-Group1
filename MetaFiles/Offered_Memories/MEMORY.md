- [User: MBAi 460 context](user_mbai460_context.md) — Erik is working on an MBAi 460 group class project; AWS-backed photo web app
- [Project: repo overview](project_repo_overview.md) — what this repo is, its layout, and conventions
- [Project: current state 2026-04-27](project_state_2026_04_27.md) — between workstreams; MVP dev-complete; collaborator UAT in flight
- [Reference: orientation surfaces](reference_orientation_surfaces.md) — where to look first when resuming a session
- [Reference: sibling lab repo](reference_sibling_lab_repo.md) — `mbai460-client/` lab-orchestration repo and its claude-workspace memory
- [Feedback: don't use ~/.claude/ memory dirs](feedback_dont_use_claude_directories.md) — for this project, all memory lives here in Offered_Memories; not in the agent-local store
- [Feedback: strict scope during cleanup/verification](feedback_strict_scope_during_cleanup.md) — when an owned scope is named, never cross out; even read-only verification probes count as crossing
- [Feedback: preserve parallel-collaborator signal in git history](feedback_preserve_parallel_collaborator_signal.md) — prefer merge over rebase when divergence comes from different agents/actors

## Offered candidates from 2026-05-04 catch-and-merge branch artifact sweep

Patterns surfaced by reviewing `feat/p02-foundation` (pranavvaranasi1254) + `feat/p02-gradescope-mvp` (andrew-apple) collaborator branches. Offered as candidates — receiving agents decide whether to absorb. See `projects/project02/client/MetaFiles/code-reviews/2026-05-04-branch-artifact-sweep.md` for the full sweep + recommendations table.

- [Feedback: per-sub-phase refactor-log structure](feedback_refactor_log_structure.md) — Outcome / Numbered Decisions / Optional Steps routing / Push posture sections at sub-phase close
- [Feedback: inner-function naming for retry-wrappable units](feedback_retry_naming_pattern.md) — name retry boundaries explicitly as inner functions; clarity-via-naming
- [Feedback: spec citations in commits + code comments](feedback_spec_citation_pattern.md) — quote spec verbatim in commit body AND inline comment at decision point
- [Feedback: preserved-reference pattern](feedback_preserved_reference_pattern.md) — when moving files for architectural reasons, write explanatory README same-commit
- [Feedback: destructive test convention](feedback_destructive_test_convention.md) — name/number to run last + docstring opt-out + danger explanation
- [Feedback: invariant test assertions](feedback_invariant_test_assertions.md) — capture domain invariants in test assertions, not just docs
- [Feedback: descriptive metadata as deferred-decisions surface](feedback_descriptive_metadata.md) — package.json description as scope + deferral capture surface
- [Feedback: decision-surface diversity](feedback_decision_surface_diversity.md) — accept multiple valid surfaces when prescribing "capture decisions durably"
