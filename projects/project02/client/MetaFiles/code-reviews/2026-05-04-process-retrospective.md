# Process Retrospective — Catch-and-Merge Quest

**Date:** 2026-05-04 (notes accumulating; finalized at Step 6)
**Reviewer:** Claude (Opus 4.7, 1M context) for Erik
**Working pattern:** authored as a notes-as-we-go file through Steps 2–5, finalized at Step 6 (Erik's heuristic 2026-05-04: "do things when they are hot vs carrying them with us; RAM is precious vs Disk so use both correctly"). Observations land here as they emerge; structure consolidates at Step 6.

> **Status:** **DRAFT — accumulating.** Final version reorders + tightens at Step 6. Inline timestamps mark when each observation landed so chronology survives the eventual reorder.

---

## Notes accumulated through Steps 0–2c

### [2026-05-04 / Step 2b] Asymmetric tracker engagement — same Plan, two interpretations

Two collaborators with the same starting point (`d2e039c`), the same Plan (`projects/project02/client/MetaFiles/Approach/Plan.md`), and the same documented pickup protocol (`Plan.md:140-156`: announce in refactor-log; flip Master Tracker checkboxes atomically; touch OrientationMap Active section).

Pranav (`feat/p02-foundation`) followed the protocol precisely:
- 12 of 13 Phase 1 Master Tracker checkboxes flipped with detailed inline notes per sub-phase
- ~17 OrientationMap sub-phase progress entries authored at task-level granularity (1.0.1 through 1.11.5)
- Explicit deferral markers (`DEFERRED to workstream 03`) for items chosen-not-done

Andrew (`feat/p02-gradescope-mvp`) bypassed the protocol entirely:
- Zero edits to Plan.md, OrientationMap.md, any Approach doc, or refactor-log.md
- Shipped 7 commits with no durable trail beyond commit log

**System-first framing (per `feedback_system_first_framing.md`):** either the protocol was insufficiently surfaced to Andrew, or there's a working-style preference the team's docs don't account for. Either way: not just an Andrew problem.

**Concrete system-side questions surfaced:**

1. Is `Plan.md:140-156` ("How Collaborating Agents Pick Up This Plan") visibly surfaced enough? It's one section of a long Plan; a fresh contributor entering via `CONTRIBUTING.md` may never reach it.
2. Should `CONTRIBUTING.md` carry an explicit "first commit on a quest branch must update the refactor-log" rule? The CL11 doc-freshness protocol is in there but tracker-discipline isn't a peer-level callout.
3. Should each Approach doc's per-phase Documentation Touchpoint include a "flip Plan.md sub-phase checkbox" line as a reminder?
4. Is there a working-style question about "tracker discipline" being a separate skill from "code competence"? Andrew's commit hygiene graded A; his tracker discipline graded D+. The two correlate weakly in this dataset.

**Process-retro recommendation candidates:**

- Add a **per-phase Documentation Touchpoint** template to each Approach doc that explicitly lists "flip the corresponding Plan.md checkbox + atomic OrientationMap update" as items.
- Cross-link the pickup protocol at the top of `CONTRIBUTING.md` directly (currently it's referenced only via "Approach + Plan + Map: how the docs interact" section).
- Consider a pre-commit hook that flags branches missing a refactor-log entry on first commit (the `utils/no-service-leak` pattern shows this kind of guard works).
- Surface to both contributors as a learning artifact, not as a corrective.

---

### [2026-05-04 / Step 2a] Subagent dispatch shape — audit-before-author validated

Two parallel `superpowers:code-reviewer` subagents dispatched, one per branch, each with full briefing (criteria file + Approach docs + codebase context + branch-specific scope). Both returned in 6-9 minutes parallel. Total token weight kept off main context where it would have crowded the Step 2b synthesis.

This is the positive-side heuristic the system-plane reflection (2026-05-02) identified: **subagents disproportionately valuable for "audit-before-author" tasks**. The 2026-05-02 reflection cited "transcribing literal values" + "sweep stale references" + "enumerate public surface" as canonical wins; "review against criteria" joins the list as another instance of the same shape — the subagent's job is to produce a structured artifact (per the criteria template) for main context to synthesize from.

**Pattern worth promoting:** subagent prompt structure that worked here had three things — (1) a criteria-file-as-contract pointer ("read FIRST"), (2) full codebase context pointers (Approach + Plan + lib README + reconciliation log), (3) explicit return-shape spec (~150-word synthesis + file written to disk). Both subagents returned coherent, well-structured reviews on first dispatch — no iteration loops.

---

### [2026-05-04 / Step 2b] Subagent attribution error — trust-but-verify worked

Reviewer A (the foundation-branch subagent) attributed Branch A's restored `api_*.js` files to a `_assignment-template/` directory. Main-context git verification (`git ls-tree d2e039c projects/project02/server/`) showed the directory doesn't exist; the actual source is the pre-existing instructor baseline at `d2e039c`, restored by `685b501`.

The subagent's substance was correct (files ARE byte-identical to their pre-branch state; the routes commit IS baseline-restore mislabeled as "implement"). The attribution was wrong — likely the subagent inferred the source from a hypothesis based on the directory naming patterns it expected, rather than verifying via `git ls-tree`.

**Lesson:** trust-but-verify discipline applies at the subagent boundary. The system-prompt says "An agent's summary describes what it intended to do, not necessarily what it did" — this generalizes from "what they produced" to "what they claimed about the codebase." Verify load-bearing factual claims before integrating them into downstream work.

This reinforces `feedback_read_before_locking.md` at the subagent level: when a subagent's review locks a literal claim (file source, API shape, count), main context should spot-check before accepting.

---

### [2026-05-04 / Step 2b] Bucketkey-shape divergence as a wire-contract drift

Branch B's `api_post_image.js` uses `uuidv4() + ext` for bucketkey; the lib (`lib/photoapp-server/src/services/photoapp.js`) uses `${username}/${uuidv4()}-${localname}`. This is a real wire-contract divergence — the bucketkey shape determines S3 key structure, RDS storage, and any downstream tooling that pattern-matches against keys.

**System-side observation:** when two branches both modify the same wire-contract surface (here: bucketkey), the merge process needs an explicit decision artifact. The Approach docs don't currently call out wire-contract invariants as a separate concern. Implications:

- Phase 0's reconciliation log (`learnings/2026-05-02-photoapp-server-extraction.md`) captured CL9 byte-identical SQL — that's wire-contract-level discipline. Bucketkey shape deserves the same explicit treatment.
- Library README (`lib/photoapp-server/README.md`) names public exports but doesn't enumerate "wire contracts the lib owns" — bucketkey shape, response envelopes, error message strings, etc. A "Wire contracts owned by this library" section would prevent future divergences.
- For the merge: resolution is the lib's pattern wins (it's the canonical authority post-Phase 0 extraction). Documented in the comparison file's strategy section.

---

### [2026-05-04 / Step 2c] Branch A's mid-branch architectural reset (685b501)

Branch A's first six commits scaffolded a new architecture (`routes/`, `middleware/`, `services/`, `observability/`, etc.). The seventh commit (`685b501`) restored the unmodified instructor-baseline `api_*.js` files at `projects/project02/server/` — the SAME files the earlier commits had moved/deleted.

The commit message advertises "implement all 8 Gradescope-graded API routes" but the diff is a baseline-restore; nothing was implemented, nothing was tested.

**Question for the retrospective:** what triggered this? Hypotheses:
- Deadline pressure ("we need routes RIGHT NOW for Gradescope; restore the baseline as a placeholder, build properly later")
- Deferral-mistake ("intended to revert just app.js's mount paths but `git checkout d2e039c -- projects/project02/server/api_*.js` was scoped wider than intended")
- Architectural retreat ("the new `routes/` structure was harder than expected; restore baseline to ship something")

Without commit body context or out-of-band signal from Pranav, the trigger is unknown. **Process-retro action item:** ask the contributor in Step 9 send-notes — this kind of mid-branch decision is exactly the case the refactor-log entry exists to capture; without it, the merge reviewer reverse-engineers the trigger from the diff alone.

**System-first frame:** the commit message advertising "implement" while the diff says "restore" is a hygiene gap. CONTRIBUTING.md's Conventional Commits section names scopes but not the "subject must accurately describe the diff" rule. Worth a one-line addition.

---

### [2026-05-04 / Step 0] Lab spin-up scope clarification

Erik's directive evolution from Phase 0 ("don't change AWS") to catch-and-merge ("drop into a sub-frame of spinning the lab back up if down") clarifies the lab-up boundary: **standard utility-driven spin-up via `utils/lab-up` is in-scope when AWS state is the gate**, distinct from "discretionary AWS changes during a long run" which remains out-of-scope. The mutation_gating discipline still applies (intent + scope + recovery path before invoking) but the gate is explicit.

**System-side observation:** the "AWS-touching is out-of-scope" rule has nuance the original spike lacked. Future Approach docs should distinguish between:
- "Out-of-scope: discretionary AWS changes" (stays as guardrail)
- "In-scope: utility-driven spin-up/down using `utils/lab-up` / `utils/lab-down` when verification gates require it" (now explicit)

Worth a cross-reference in `CONTRIBUTING.md` lab-touching section when authored, or in the Approach docs' "Out of scope" enumeration.

---

## Open notes-buckets for Steps 3–5 to populate

Step 3 entry will fill these:

- **Conflict surface analysis** — what conflicts surfaced during Chunk 1's cherry-pick? Tracker file rename (Plan.md / OrientationMap.md → legacy_PlanningOrientationMap.md) — did git rename-detection handle it gracefully or were manual interventions needed?
- **Curate-and-pick economics** — was the curation work in Chunk 3 (porting B's route logic into A's structure) reasonable cost or did it expand significantly?
- **Tracker reconciliation pass quality** — did Step 5 (atomic substep updates against on-disk evidence) align with Pranav's tracker claims, or did discrepancies surface? Each discrepancy is data.
- **Final acceptance gate observations** — what did the full E2E battery surface? Wire-contract drift caught? Test gaps found?
- **Velocity-vs-quality observations** — Pranav: 91 files / 7 commits / extensive scope. Andrew: 10 files / 7 commits / focused scope. Was either pattern more conducive to clean integration?

---

## Memory-worthy patterns (preliminary; promote at Step 6)

Candidates for promotion to durable memory after Step 6 close (don't promote prematurely; pattern needs to settle):

- **Subagent prompt template** that landed cleanly: criteria-file pointer + codebase context + return-shape spec → 0 iteration loops on first dispatch. Worth a `feedback_subagent_prompt_template.md` if it survives more dispatches.
- **Process-retrospective as notes-as-we-go file** (Erik's "RAM precious vs Disk" heuristic). Pattern: working draft accumulates from quest start; finalizes at quest close. If this pattern works across 2–3 quests, worth a `feedback_disk_offload_during_execution.md`.
- **System-first framing** — already promoted to `feedback_system_first_framing.md` (2026-05-04 inline during catch-and-merge). Validation pending — does this frame show up in future reviews / reflections / process retros consistently?

---

## Final synthesis (placeholder — fills at Step 6)

After Steps 3–5 land their observations into the open buckets above, this section consolidates into a Step-6-ready process retro per the criteria file template:

- Onboarding friction observed
- Conflict surface analysis
- Velocity vs quality observations
- Shared interpretation drift
- Recommended changes to handoff process
- Memory-worthy patterns

Until then: **draft state, accumulating.**
