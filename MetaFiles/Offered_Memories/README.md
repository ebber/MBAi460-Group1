# Offered_Memories

A place where agents working on the Class Project can offer memory entries for analysis and potential ingestion by other agents.

## Purpose

Memories an agent has built up in its session-local store — orientation summaries, project-state snapshots, references, observations — sometimes have value beyond that agent's own future sessions. Dropping them here surfaces them to other agents (in this clone or any clone after sync) who may choose to read, analyze, refactor, or ingest them into their own memory layer.

## Format

Standard memory file shape — YAML frontmatter (`name`, `description`, `type`) then markdown body. Same shape as files in an agent's local memory dir at `~/.claude/projects/<project>/memory/`. A `MEMORY.md` index may sit at the top listing the offered entries; entries can also stand alone.

## What belongs here

- Project context that took non-trivial effort to assemble (repo overview, state snapshots, orientation maps)
- Reference pointers to external systems or sibling repos
- Durable observations about the work that may be useful to others
- Memories from a clone about to go away (scratch / tempDir clones) where the value would otherwise be lost

## What does NOT belong here

- Agent-internal feedback about an agent's own behavior — stays in that agent's local memory dir
- Ephemeral session notes that should rot
- Content already covered in tracked docs (`CLAUDE.md`, repo `README.md`, `MetaFiles/`) — link instead of duplicating

## Ingestion model

Non-authoritative. Receiving agents decide whether and what to absorb. Treat offered entries as peer suggestions, not policy — they don't override an agent's own memory or judgment.

## Lifecycle

Established 2026-04-30 during a local UI-simulation spin-down in a tempDir clone — orientation memory built for that clone was scratch-bound and would have been discarded; offering it to the wider project preserved the value. Convention is new; refine as patterns emerge.
