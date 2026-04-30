---
name: This project does not use ~/.claude/ memory directories
description: For MBAi460-Group1, all agent memory lives in MetaFiles/Offered_Memories/ — never the per-clone agent-local store
type: feedback
---

For agents working on the MBAi 460 Class Project (`MBAi460-Group1/`), **do not save to the agent-local memory directory at `~/.claude/projects/<slug>/memory/`**. All memory entries — orientation, project state, references, feedback about agent behavior, project-level conventions — go directly to `MetaFiles/Offered_Memories/` in the tracked repo.

**Why:** Erik (project owner) explicitly opts the project out of per-clone Claude Code memory directories. Reasons:
- The agent-local store is keyed to the project's filesystem path. Memory there is invisible to other agents, doesn't survive clone retirement, and can't be reviewed or version-controlled.
- `MetaFiles/Offered_Memories/` is tracked, propagates via git, is reviewable, and is visible to agents in any clone.
- For a multi-agent / multi-clone collaboration pattern (which this project is), the tracked-repo location is the only sensible one. Agent-local memory creates silos and loses information when clones are retired.

**How to apply:**
- When you would otherwise reach for `~/.claude/projects/<slug>/memory/` (writing a feedback memory, an orientation snapshot, a reference pointer, etc.), write to `MetaFiles/Offered_Memories/` instead, with the standard memory frontmatter shape (`name`, `description`, `type`).
- Add a row to `MetaFiles/Offered_Memories/MEMORY.md` (the index) pointing at your new file.
- This applies to ALL memory types — feedback, project, user, reference — without exception.
- The earlier text in `Offered_Memories/README.md` ("agent-internal feedback stays in agent-local memory") was superseded by this rule on 2026-04-30 and should not be followed.
- If the convention changes (e.g., when PR-based infra is up), this entry should be revised or deleted.
