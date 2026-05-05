---
name: Descriptive metadata as deferred-decisions surface — package.json description, manifest fields, etc.
description: Use package.json description (or analogous metadata fields like setup.cfg description, Cargo.toml description) as a capture surface for current scope + deferred work; future contributors running `cat <manifest>` learn both in 30 seconds
type: feedback
---

The `description` field in `package.json` (and analogous metadata fields in `pyproject.toml`, `Cargo.toml`, `setup.cfg`, etc.) is usually filled with marketing text or omitted. **Use it instead as a deferred-decisions capture surface** — describe both current scope AND known deferred work.

**Why:** A future contributor running `cat package.json` or browsing the package metadata gets the dual signal in 30 seconds: what's currently true + what's intentionally not yet done. Without this use, the deferred work is either invisible (lost in commit messages, scattered in TODOs) or requires reading multiple files to assemble. With it, the manifest itself becomes a navigation surface.

**Pattern source:** `feat/p02-gradescope-mvp` branch (andrew-apple, 2026-05-04). `projects/project02/server/package.json` description:

> *"Project 02 Part 01 PhotoApp Node.js/Express web service — Gradescope MVP path. Standalone (does not yet consume @mbai460/photoapp-server; that wiring is Phase 1+ per Plan.md)."*

Captures: current scope (MVP), current architectural state (standalone), the deferred decision (lib consumption), and where to look for more (Plan.md).

**How to apply:**
- For package.json / pyproject.toml / Cargo.toml / setup.cfg description fields: write description as `<current scope> — <key deferral with pointer to where it's tracked>`
- Format suggestion: `<scope statement>. <Architectural state>. <Deferral with pointer to canonical tracking>.`
- Keep it short (one-to-three sentences); the manifest description has a length norm
- Update when scope changes (a deferred decision becoming current; a new deferral surfacing)
- This pattern complements (not replaces) Plan / TODO / refactor-log tracking — those are canonical; the manifest description is the *navigation surface* pointing to them
- Pairs well with `feedback_spec_citation_pattern.md` for code-side context (manifest = where you're going; comments = where you are)

**Adjacent memories:**
- `feedback_decision_surface_diversity.md` — multiple valid surfaces for capturing deferred decisions; this memory describes one such surface
- `feedback_atomic_substep_updates.md` — close-out discipline; manifest description updates are part of the close-out checklist when scope changes
