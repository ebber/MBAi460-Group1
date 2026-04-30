# Offered_Memories

The canonical memory store for agents working on the Class Project. Orientation, project state, references, and behavior feedback all live here — tracked, reviewable, and visible to agents in any clone.

## Purpose

For agents on this project, this directory is the **single canonical memory store**. The per-clone agent-local memory dir at `~/.claude/projects/<slug>/memory/` is **explicitly not used** — see [`feedback_dont_use_claude_directories.md`](feedback_dont_use_claude_directories.md).

Memory built up in a session — orientation summaries, project-state snapshots, references, observations, behavior feedback — drops here directly. Other agents (in this clone or any clone after sync) may read, analyze, refactor, or ingest them into their own session context.

## Format

Standard memory file shape — YAML frontmatter (`name`, `description`, `type`) then markdown body. A `MEMORY.md` index sits at the top listing all offered entries; entries can also stand alone.

## What belongs here

- Project context (repo overview, state snapshots, orientation maps)
- Reference pointers to external systems or sibling repos
- User context (role, preferences, responsibilities)
- Behavior feedback (corrections, durable preferences, observations about what worked)
- Durable observations about the work that may be useful to others

## What does NOT belong here

- Ephemeral session notes that should rot
- Content already covered in tracked docs (`CLAUDE.md`, repo `README.md`, other `MetaFiles/`) — link instead of duplicating
- Secrets, credentials, anything that shouldn't be in version control

## Ingestion model

Non-authoritative. Receiving agents decide whether and what to absorb. Treat offered entries as peer suggestions, not policy — they don't override an agent's own judgment.

## Lifecycle

Established 2026-04-30 during a local UI-simulation spin-down in a tempDir clone. Convention refined the same day to make this the canonical (not optional) memory store, replacing per-clone agent-local memory dirs entirely. Refine further as patterns emerge.
