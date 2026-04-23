# Retrospective: Triage and Batch Execution of Large Task Sets

**Written:** 2026-04-23
**Context:** Collaborator Readiness Quest — 26 findings across 4 sweeps, triaged and executed across multiple sessions

---

## The Fundamental Rule: Surface First, Execute Second

When facing a large number of tasks — especially in a cleanup or audit context — the instinct is to fix things as you find them. Resist this.

**Why surfacing first is better:**
- A later finding might change the priority of an earlier one
- Executing item N might make item N+3 irrelevant (or reveal it was wrong)
- You can't batch intelligently if you don't see the full shape of the work
- Triage decisions improve with context; context accumulates across the sweep

The correct sequence is always: **Sweep → Surface → Triage → Execute**.

---

## The Triage Framework

Every found item gets exactly one of four dispositions:

| Bucket | Meaning | Action |
|--------|---------|--------|
| **Act** | Must be done this session | Assign LoE, batch by cluster, execute |
| **Ack** | Real finding, accepted as-is | Document the reason explicitly |
| **Queue** | Valid but not now | Route to the right permanent backlog |
| **Drop** | Resolved by another item or moot | Note what resolves it |

**The Ack bucket is underused and undervalued.** Many agents skip it and either act on everything (doing unnecessary work) or silently ignore things (creating undocumented decisions). Acking something explicitly — with a reason — is a first-class decision. It tells future you: "I saw this, I thought about it, and I consciously chose not to act."

**The Queue bucket needs routing to be useful.** "Queue" without a destination is just deferral without accountability. Every queued item needs: a home (which backlog), a trigger (when to pick it up), and enough context to act without re-researching.

---

## Level of Effort Tiers

Assign LoE before executing — it changes the order and approach:

| Tier | Time | Strategy |
|------|------|----------|
| **Trivial** | < 5 min | Execute in-line, no planning needed |
| **Quick** | 5–15 min | Brief orient before each item |
| **Involved** | 15+ min | May need a sub-plan; consider whether it belongs in this session |

**Execute in LoE order: Trivial first.** Trivials are high velocity — completing 10 items in 30 minutes builds momentum and clears the board. Involved items done first create risk (you spend an hour on one item, then run out of context for the 15 trivials that follow).

**Blockers are the exception.** If a Trivial or Quick item is a 🔴 Blocker — something that breaks basic functionality for collaborators — it jumps the queue regardless of LoE.

---

## Batching by Cluster

Within a LoE tier, group items by domain/cluster before executing. Good clusters:
- Docs (README, QUICKSTART, MetaFiles)
- Utils / Infra (scripts, terraform, docker)
- Codebase / Artifacts (SQL, Python, visualizations)

**Why clustering matters:** Each cluster has a shared mental model. Switching between "fix a SQL file" and "fix a bash script" and "fix a Mermaid diagram" in sequence burns more context than doing all three bash scripts at once, then all SQL files, then all diagrams.

**Cluster size sweet spot:** 3–8 items. Fewer than 3 and you're not getting batching benefits. More than 8 and the cluster itself becomes a session — break it down.

---

## The Atomic Update Rule

Every time you execute an item, update its status in the tracking artifact **before moving to the next item.** Not at the end of the batch. Not at the end of the session. **Now.**

**Why:** If a context compaction hits mid-batch, you lose everything after the last update. With atomic updates, the worst case is "one item redone." Without them, the worst case is "half a session redone — but which half?"

In practice this means:
- Triage table row: strikethrough + ✅ DONE timestamp immediately after the edit lands
- Orientation map sub-step: ✅ COMPLETE with date immediately after the sub-step closes

The 15 seconds this costs per item is insurance against hours of reconstruction.

---

## The Orientation Map Pattern

For a large multi-session task, maintain a single file that answers:
- What phase/step are we on right now?
- What just completed?
- What comes next?
- What are the invariants / scope decisions?

This file is the **ground truth for execution state** — more reliable than git history, more reliable than session summaries, more reliable than your own memory after a break.

**The orientation map works because:**
- It's updated atomically (if you follow the rule above)
- It lives in the repo alongside the work
- It can be read by any agent or person picking up the work cold
- It captures decisions, not just status — "why we're here" not just "where we are"

**Common failure mode:** Not updating the map between sub-steps. After a context compaction, a stale map is worse than no map — it gives false confidence about what's done.

---

## Handling Discoveries Mid-Execution

During execution, you will find things that weren't in the original sweep. New items.

**The correct response:**
1. Write it down immediately — don't let it live only in working memory
2. Triage it on the spot (Act/Ack/Queue/Drop)
3. If Act: decide whether to execute now (interrupts flow, but prevents forgetting) or add to End-of-Session queue
4. Continue with the current item

**Do not:** interrupt the current execution batch to go down a rabbit hole. Do not let "while I'm here" turn into an unplanned two-hour detour. The discipline of "finish this cluster, then assess new findings" protects the momentum of the batch.

---

## Multi-Session Continuity

Large task sets span sessions. Session compaction happens. Context is lost.

**What to do at each session end (or when compaction is likely):**
1. Ensure the orientation map is up to date — if you had to stop mid-sub-step, note where exactly
2. Ensure the triage table is up to date — all executed items marked, all remaining items visible
3. Write an End-of-Session note if anything is mid-flight

**What to do at the next session start:**
- Load the orientation map (ground truth, not the session summary)
- Load the triage table (current execution state)
- Run the Refresh Ritual before any execution (see `context-continuity.md`)

**The trap:** Session summaries are AI-generated reconstructions. They frequently imply things are complete that are not. Never act on a session summary as if it were ground truth. Always verify against file state.

---

## Signs That Your Triage Is Working

- You can look at the triage table and immediately know what's left without re-reading any source material
- The Ack and Queue buckets are populated with reasoning, not just items
- You don't find yourself re-discussing decisions that were already made
- Context compactions are recoverable in under 10 minutes

## Signs That Your Triage Is Broken

- You're executing items as you find them in the sweep
- The "Queue" column is empty (you're doing everything or dropping everything)
- You've re-opened something that was ACKed without a documented reason to revisit
- After a compaction, you're not sure which items have been done
