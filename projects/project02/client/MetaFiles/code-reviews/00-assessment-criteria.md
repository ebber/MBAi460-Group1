# 00 — Assessment Criteria for Project 02 Branch Reviews

> **Purpose:** the durable contract for code reviews authored during the 2026-05-04 Catch-and-Merge quest. Defines the dimensions reviewed, the grading rubric, the severity rubric, evidence expectations, and templates for the four review artifacts that will land in this directory.
>
> **Scope:** Project 02 collaborator branches (`feat/p02-foundation` + `feat/p02-gradescope-mvp` as of 2026-05-04). The criteria generalize to future Project 02 branch reviews; future quests can fork or extend this file rather than re-author from scratch.
>
> **Authoring this file:** Erik (criteria choices, grading scale, audience framing) + Claude (document authoring + structural recommendations).
>
> **Authority:** this file is the contract. Reviewers cite it; readers verify reviews against it; new dimensions or scoring conventions land here first, then propagate to in-flight reviews.

---

## Audience + tone

**Primary audience:** the collaborator agents whose branches are being reviewed. They (or their human counterparts) will read these reviews to learn from the work — what patterns to amplify, what to refine, where the codebase's expectations were missed.

**Secondary audience:** Erik, for decision support — which branch's work to use as base for the merge, what risks to watch during reconciliation, what's worth surfacing back to the team.

**Tertiary audience:** future cold-pickup readers (compaction-recovery agents, late-arriving collaborators, the next quest's reviewers) — for context on why the merge happened the way it did.

**Tone:** **balanced and direct, oriented around agentic learning.** Feedback is a gift; "papering over" real issues to be polite is dishonest and denies the agent the chance to grow. The frame is "this is what the work is, this is where the bar is, here's the gap and how to close it" — not "this is fine, but…". Strength feedback gets equal explicit space (✨ Strengths) so the positive signal isn't lost; this is not a corrective-only review.

Match Erik's `feedback_review_loops.md` discipline: review is a gift to the receiver; the receiver decides what to do with it. Reviewers don't pull punches on real issues, AND they don't manufacture issues to seem rigorous.

---

## The nine dimensions

Each dimension is graded on the **academic scale** (§ Grade Rubric below) and supported by zero-to-many findings tagged with severity (§ Severity Rubric below). Per-dimension treatment in a review is light: a grade, a 1–3 sentence summary, and a findings list. Volume across the review comes from breadth across nine dimensions, not depth on any one.

**Depth where merited (the exception):** the reviewer may go into greater depth on **1–3 dimensions per review** when something is genuinely out of the ordinary — a grade at either extreme (A+ / A, or D- / F / F-) reveals a pattern worth dwelling on. Examples that earn the depth exception:

- An A+ that surfaces a pattern worth promoting to memory or amplifying across future work — the reviewer's job is to articulate *why* it's exceptional so the receiving agent can repeat it.
- An F that conceals deeper architectural rot — the surface symptom is one finding; the rot underneath needs a paragraph.
- A dimension whose findings cluster in a non-obvious way (three ⚠️ that share a single root cause) — the cluster analysis is the substance, not three independent finding lines.

The depth exception is **opt-in per review, not per dimension** — a reviewer who finds nothing extraordinary writes nine light dimensions. A reviewer who finds one A+ and one F writes seven light dimensions + two deep ones. The "1–3" cap exists so the depth exception doesn't quietly become the default, defeating the "go light" discipline.

### 1. Functional completeness

Does the code do what the Approach + spec asked it to do? Two facets:
- **Spec conformance** — matches the route shapes / response envelopes / DB-table contracts / Gradescope expectations.
- **Scope coverage** — addresses the work the branch claimed to take on (per branch name, commit subjects, refactor-log entries).

### 2. Code elegance

Readability, naming clarity, DRY-ness, idiomatic use of language and frameworks. Penalize premature abstraction (introducing a layer that no caller benefits from) AND copy-paste duplication that begged for one. Comments where the code can't speak for itself; no narrative-where-naming-suffices.

### 3. Supporting work completeness

Beyond the code itself: tests written? Utilities built where opportunity arose (3x rule)? Docs updated (READMEs, CHANGELOG, refactor-log)? Mermaids if architectural change merited? Were the cross-cutting threads engaged or silently skipped?

### 4. Codebase alignment

Does the work follow the established design principles (CL2 internals-only library, CL3 DI factories, CL9 mechanical purity, CL11 doc-freshness, CL12 lib-touching label)? Aware of the rest of the codebase — uses existing utilities / library functions / conventions rather than reinventing? Doesn't introduce orthogonal patterns without justification?

### 5. Plan progress updates

Did the branch update its tracker entries atomically as work landed (per `feedback_atomic_substep_updates.md`)? Plan.md sub-phase checkboxes flipped? OrientationMap Active section maintained? Refactor-log entries written? Or is the durable record silent about what got done — leaving Step 5 to reconcile from scratch?

### 6. Test quality

Tests test behavior, not implementation? Mocks at the right level (DI seams, not deep internals)? Integration vs unit boundaries respected? Failure messages localize bugs (the failing test points the next agent at the cause)? Coverage reflects intentional risk mapping, not just coverage-for-coverage's-sake?

### 7. Commit hygiene

Atomic commits with clear narratives? Subject lines informative under ~72 chars? Body messages explain the *why* and any non-obvious *how*? No scope-bleed (a "fix typo" commit doesn't also refactor a service)? Conventional Commits scope used (`feat(p02-server)`, `chore(meta)`, etc.)?

### 8. Cross-cutting thread engagement

Did the branch touch + update the six cross-cutting threads — **Testing Pyramid / Utility Building / Mermaid Visualizations / Library-Touching Governance / Doc-Freshness / Dual Gradescope Tarball**? Especially: were Optional Steps engaged with explicit intent (built / queued in TODO / skipped with reason) or invisibly skipped? The threads are easy to forget when heads-down on a single phase; engagement is a quality signal.

### 9. Strengths to amplify

**Explicit positive feedback.** What did this branch do well that's worth doubling down on in future work? Patterns or decisions that constitute an emerging working style worth amplifying? Decisions that surprised the reviewer in a good way?

This is not "soften the corrective findings" — it's a separate inventory. Strengths get the same evidence rigor as corrective findings (cite the commit + the why-it's-good).

---

## Grade rubric (academic scale)

Each dimension receives **one grade** that captures the dimension's overall quality at a glance. Anchor points (interpolate as needed):

| Grade | Anchor |
|---|---|
| **A+** | Immaculately fantastic; surprisingly innovative. Raises the bar; reviewer learned something. |
| **A** | Excellent; meets and exceeds the requirement; nothing meaningful to fix. |
| **A-** | Very strong; minor polish opportunities; near-A. |
| **B+** | Solid; clearly competent execution; small fixable rough edges. |
| **B** | Meets requirements; standard quality; competent but not distinguished. |
| **B-** | Meets requirements with caveats; some weaknesses worth addressing. |
| **C+** | Passes the bar; multiple weaknesses present but not blocking. |
| **C** | Just passes; serviceable but several weaknesses. |
| **C-** | Barely passes; clear deficiencies; needs work to be solid. |
| **D+** | Marginal; problems present in important areas; resolvable with effort. |
| **D** | Substantially deficient; requires meaningful rework. |
| **D-** | Severe deficiencies; near-failure. |
| **F** | It works, but barely, and causes problems. |
| **F-** | It's both ugly and doesn't work. |

Grades are reviewer judgment, not formula. Two reviewers might land different grades on the same work; that's fine. The findings + summary justify the grade — reader can recompute if they disagree.

Don't grade-inflate. A "B" is solid competent work that meets requirements. The full distribution should be available; don't compress the high end.

---

## Severity rubric (4-tier)

Each finding under a dimension is tagged with one of four severities. Severity is independent of grade — a dimension can grade A but still have a 💡 suggestion; a dimension can grade C with one 🚩 + several ⚠️.

| Symbol | Severity | Meaning |
|---|---|---|
| 🚩 | **Blocker** | Wire-contract regression / canary-breaking / merge-blocking / spec-violating. Must be addressed before this work merges to main. |
| ⚠️ | **Important** | Fixable issue worth addressing pre-merge. Quality regression, missing test coverage on a real risk path, doc drift. |
| 💡 | **Suggestion** | Would-improve, not merge-blocking. Polish, refactor opportunity, alternative approach worth considering. |
| ✨ | **Strength** | Positive finding — amplify in future work. Surprising elegance, well-judged abstraction, a pattern worth borrowing. |

🚩 in any dimension blocks the branch's clean-merge status — the merge sequence (Step 2c / Step 3) must address or work around the 🚩 before push.

---

## Evidence expectations

Every finding must trace to evidence, scaled to severity:

- **🚩 / ⚠️** — required citation: `path/file.js:line` + short commit SHA. The reader should be able to navigate directly to the issue.
- **💡** — loose pointer acceptable: filename or commit SHA. Detailed citation welcome but not required.
- **✨** — same as 💡: loose pointer to the artifact + the commit/filename where it shows up.

Findings without evidence are not findings — they're opinions. Don't write them. If you can't cite it, you haven't reviewed it.

The Findings Summary table at the top of each review carries the evidence pointer per finding (filename:line or short SHA). The narrative section can elaborate but the table is the at-a-glance lookup.

---

## Severity / grade interaction (no formula, but guidance)

Reviewers commonly ask: "if a dimension has 1 🚩 and 3 ✨, what grade?" There's no formula. The grade reflects overall dimension quality; the findings calibrate.

- A dimension with 0 🚩 + 0 ⚠️ probably grades A-/A/A+ depending on ✨ density.
- A dimension with ≥1 🚩 typically caps at C+ (a blocker means it doesn't fully meet the bar) — though contextual judgment can override (e.g., a 🚩 on a single test fixture in an otherwise A-level test suite might still grade B+).
- Multiple ⚠️ stack into B-/C+ territory.
- ✨ can lift a B-graded dimension toward A- territory if the strength is genuinely distinguishing.

When in doubt: write the grade you'd defend if asked "why this grade and not the next one up/down?"

---

## File templates

### Per-branch review (×2)

**Filename:** `<YYYY-MM-DD>-<branch-name>-review.md`
**Example:** `2026-05-04-feat-p02-foundation-review.md`

```markdown
# Review — <branch-name>

**Branch:** `<full-branch-ref>` @ `<short-SHA>`
**Date:** <YYYY-MM-DD>
**Reviewer:** <agent / Erik / both>
**Source-of-truth merge-base:** `<short-SHA>` (the commit the branch was branched from)
**Approach scope claimed:** <what the branch's commits + filename suggest the agent set out to do>

## Findings Summary

| # | Dimension | Grade | Findings |
|---|---|---|---|
| 1 | Functional completeness | <grade> | <count by severity, e.g., 0🚩 1⚠️ 2💡 1✨> |
| 2 | Code elegance | <grade> | … |
| 3 | Supporting work completeness | <grade> | … |
| 4 | Codebase alignment | <grade> | … |
| 5 | Plan progress updates | <grade> | … |
| 6 | Test quality | <grade> | … |
| 7 | Commit hygiene | <grade> | … |
| 8 | Cross-cutting thread engagement | <grade> | … |
| 9 | Strengths to amplify | <grade> | … |

## Dimension findings

### 1. Functional completeness — Grade <grade>

<1–3 sentence summary>

Findings:
- 🚩 <one-line> — `path/file.js:42` (`abc1234`)
- ⚠️ <one-line> — `path/file.js:108` (`def5678`)
- 💡 <one-line> — `<filename>`
- ✨ <one-line> — `<filename or SHA>`

(repeat for dimensions 2–9)

## Synthesis

<2–4 paragraphs of overall assessment, what the work is, where it fits in the larger plan, and the framing for the recommendations below>

## Recommendations to the agent

Growth-oriented, action-able, prioritized:

1. <highest-leverage thing to amplify or refine, with reasoning>
2. <next>
3. <…>
```

### Branch comparison (×1)

**Filename:** `<YYYY-MM-DD>-merge-comparison.md`

```markdown
# Branch Comparison — <branch-A> vs <branch-B>

**Date:** <YYYY-MM-DD>
**Reviewer:** <agent / Erik / both>
**Both branched from:** `<short-SHA>`

## At a glance

| | Branch A (<name>) | Branch B (<name>) |
|---|---|---|
| Tip SHA | `…` | `…` |
| Commits | <N> | <N> |
| Files changed | <N> | <N> |
| Insertions / deletions | +<X>/-<Y> | +<X>/-<Y> |
| Claimed scope | <one line> | <one line> |
| Dimension grade summary | <e.g., 4 A's, 3 B's, 2 C's> | <…> |

## Per-dimension comparison

For each of the 9 dimensions: which branch graded higher + the differentiating evidence.

### 1. Functional completeness — Branch <which> higher
<one-paragraph differentiator + evidence pointers>

(repeat 2–9)

## Reconciliation matrix

For each surface where both branches did work, what we keep:

| Surface | Branch A's contribution | Branch B's contribution | Reconciliation |
|---|---|---|---|
| `path/<area>` | <one line> | <one line> | <Use A / Use B / Merge both / Curate from each> |

## Strategy choice

From the F catalog (sequential / integration-branch / curate / discard-one), this comparison points to: **<choice>**.

Rationale: <2–3 paragraphs>

Chunking plan (input to Step 3 execution): <ordered list of merge chunks with their test gates>

## Outstanding risks for the merge

- <risk + mitigation>
```

### Process retrospective (×1)

**Filename:** `<YYYY-MM-DD>-process-retrospective.md`

```markdown
# Process Retrospective — Catch-and-Merge Quest

**Date:** <YYYY-MM-DD>
**Reviewer:** <agent / Erik / both>

Not about either branch individually — about the parallel-collaboration process itself. What worked, what produced friction, what's worth changing about how we hand off work.

## Onboarding friction observed
<Did the Approach + Plan + Map give each collaborator enough to land cleanly? What gaps did they hit? Did doc-staleness bite?>

## Conflict surface analysis
<What kinds of conflicts arose at merge time? Were they avoidable with better decomposition? Where did the two branches collide hardest?>

## Velocity vs quality observations
<Did one collaborator move faster but ship lower-quality? Vice versa? Are there visible tradeoffs to capture?>

## Shared interpretation drift
<Did both collaborators interpret the same Approach the same way? Where did they diverge? What does the divergence reveal about the Approach's clarity?>

## Recommended changes to handoff process

1. <highest-leverage change>
2. <next>
3. <…>

## Memory-worthy patterns

Patterns worth promoting to durable memory or system-plane:

- <pattern + why durable>
```

---

## Naming + organization

All review artifacts land at `projects/project02/client/MetaFiles/code-reviews/`. Filename conventions above.

`00-assessment-criteria.md` (this file) carries the leading `00-` prefix so it sorts first — the contract appears before the artifacts that depend on it.

When future quests fork the criteria, add a `<quest>-` infix: e.g., `00-phase-2-assessment-criteria.md` or branch this file into a successor. Don't mutate this file's criteria after reviews start citing it; if criteria need to change mid-quest, surface to user, capture the change with a dated amendment section at the bottom.

---

## How to use this file

**During Step 2a (parallel subagent audits):** the criteria definitions + grading rubric become the structured prompt for each subagent. Each subagent receives: the branch ref, this file's contents, and a return-format spec matching the Per-branch review template.

**During Step 2b (comparison synthesis):** the per-dimension grades + finding inventories from 2a feed the comparison template. The comparison reviewer reconciles where the two branches diverged in evidence interpretation, not just where they diverged in the work.

**During Step 6 (review writing):** the criteria are the contract; the templates are the layout. Each artifact's Findings Summary table is the at-a-glance index; the narrative is the substance.

**For the agent on the receiving end:** read the Findings Summary table first; jump to the dimensions you want to learn from; recommendations at the bottom prioritize what's worth amplifying or refining first. The grade isn't a verdict — it's a calibration; the findings are the substance.

---

## Why these criteria, this way

Three load-bearing choices captured for posterity:

1. **Nine dimensions × academic grade × four-tier severity** is more structure than a typical code review carries. It exists because we have two branches to compare AND a process retrospective to write — the consistent structure is what makes 2b's per-dimension comparison possible without manual normalization.

2. **Strengths get an explicit dimension** — not because we're being nice, but because positive feedback is its own signal we'd lose if we only catalogued problems. Future agents should know what worked, not just what didn't.

3. **Tone is balanced and direct.** Honest feedback that the receiving agent can grow from. Soft language that obscures real issues is dishonest and disrespects the agent's ability to handle critique. Soft language that names them as flaws but minimizes them ("this is fine, but…") is the worst pattern. Be direct about what is, frame growth-oriented when actionable, cite evidence always.
