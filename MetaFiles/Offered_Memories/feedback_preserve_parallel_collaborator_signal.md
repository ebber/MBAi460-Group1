---
name: Preserve parallel-collaborator signal in git history (prefer merge over rebase)
description: When divergent work comes from different agents/actors/collaborators, preserve the merge commit; don't rebase the parallel-stream signal away
type: feedback
originSessionId: 1e15db51-7353-4e14-aeea-749705958a24
---
When local and origin (or two branches) have diverged because of *different agents/actors/collaborators* working in parallel — even if they all authenticate under the same GitHub identity — **prefer `git merge` over `git rebase` for reconciliation**, and write a merge commit message that names the actors and what each stream brought.

**Why:** The signal that work happened in parallel via multiple agents is more important to this project than a clean linear `git log`. Erik runs MBAi460-Group1 with multi-agent collaboration as a first-class pattern — different Claude sessions in different clones, different humans, different roles converging. That parallel-stream shape is information future-readers may need (debugging, archaeology, understanding how a piece of work came together). Rebasing erases it. Merge commits are first-class artifacts that capture *when* and *how* divergence resolved, and the merge message is where the actor-level provenance lives.

The "rebase for clean history" argument carries less weight here than usual because:
- Merges are expected to become common as PR-based infrastructure stands up
- Same GitHub handle does NOT mean same author for this project's purposes — agent identity / clone of origin / role matter
- `git log --first-parent` still reads cleanly when needed

**How to apply:**
- When local + origin diverge from work by different agents (this is the default assumption), reach for `git merge --no-ff origin/main`, not `git rebase`
- Author the merge commit message deliberately: list each side's commits, name the actor / clone / role for each side, briefly describe what each stream brought, note conflict status
- The merge commit message is load-bearing — without good metadata, the merge artifact is just glue. Treat it as a real artifact, not boilerplate
- Reserve rebase for cases where local commits are clearly *one author's* in-flight work that hasn't yet been published — i.e., classic "polish before pushing"
- Reserve squash-merge for the rare case where collapsing N WIP commits into one logical unit is genuinely the right thing — never to erase parallel-collaborator structure
- This preference is established 2026-04-30 by Erik; revisit if/when the project's collaboration pattern changes
