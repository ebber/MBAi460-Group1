---
name: Sibling lab repo (mbai460-client)
description: The lab-orchestration repo at ../mbai460-client/ and its claude-workspace memory
type: reference
originSessionId: 1e15db51-7353-4e14-aeea-749705958a24
---
This Class Project repo (`MBAi460-Group1/`) lives inside a parent lab-orchestration repo at `mbai460-client/` (sibling at `/Users/erik/Documents/Lab/tempDir/mbai460-client/` typically, though I have not confirmed it exists in this checkout — verify if needed).

**Two layers of TODO surface, two layers of memory:**

| Surface | Scope |
|---------|-------|
| `MBAi460-Group1/MetaFiles/TODO.md` (this repo) | Class Project main queue |
| `mbai460-client/MetaFiles/TODO.md` | Lab orchestration — VCS strategy, secrets layout, multi-repo coordination |
| `mbai460-client/claude-workspace/TODO.md` | Agent workspace queue — ritual maintenance, agent-internal tooling |
| `mbai460-client/claude-workspace/memory/` | The richer agent memory layer with feedback files (e.g. `feedback_atomic_substep_updates.md`, `feedback_flag_emoji.md`); Class Project journals reference it |

**Gradescope:** the `.gradescope` auth token lives at `mbai460-client/.gradescope` (parent lab repo root, gitignored, NOT inside this Class Project repo). Bind-mount path inside Docker container must be `/home/user/.gradescope`.
