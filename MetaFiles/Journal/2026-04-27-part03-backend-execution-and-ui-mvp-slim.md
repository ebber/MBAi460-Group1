# 2026-04-27 — Part 03 backend execution + UI MVP slim — retrospective

## What happened in this session

This session executed the entire Part 03 API Routes workstream end-to-end against live AWS+RDS, surfaced and fixed two reviewer findings, then turned to the UI workstream and slimmed it to a tight MVP scope (Playwright descoped to its own Future-State workstream + 3 deferred-primitive Future-State docs committed).

**Backend execution (Phases 0 → 8):**

- Phase 0 reverification — the pre-approval Phase 0 work (npm install + smoke from a prior auto-mode session) was reverified against package.json pins + retest + smoke + install-log audit. ⚠️ → ✅.
- Pre-Phase 1 — `kind ENUM('photo','document') NOT NULL DEFAULT 'photo'` ALTER on live RDS. Surfaced a side-finding: `utils/_run_sql.py` splits SQL on naked semicolons before filtering `--` comments, so semicolons inside SQL comments break the split. Rewrote the migration without comment-semicolons; ran cleanly.
- Phase 1+2+4 — Calibration Test #1: three subagents in parallel building `server/schemas.js`, `server/services/aws.js`, `server/middleware/upload.js` with their test files. ~109s wall (longest subagent), ~234s sequential estimate. **Parallel saved ~125s wall (~53% reduction).** All in scope, no merge friction. Confirmed hypothesis H1.
- Phase 3 (read use cases) + Phase 5 (write use cases) — main-thread, sequential, same-file work in `services/photoapp.js`. 5 commits each (one per task) per the atomic-doc-update gate. Phase 5.1 (uploadImage with photo/document branch) was the heaviest task; threaded Q9 (documents accepted) through correctly.
- Phase 6+7 — Calibration Test #2: route handler + error middleware in parallel. The reviewing agent had flagged the original "parallel + integration step" framing because the 03 doc had Phase 7 example tests using `supertest against real app` — which couples Phase 7's tests to Phase 6's routes existing. Rather than going sequential, redesigned the test factoring (see Patterns below) and dispatched. ~132s wall, ~229s sequential — saved ~42%. Confirmed hypothesis H2.
- Phase 8 — opt-in live integration tests against real S3 + RDS. **First live run failed** with `CredentialsProviderError: Could not resolve credentials using profile: [s3readwrite]`. Root cause: `AWS_SHARED_CREDENTIALS_FILE` env var was set inside `server.js`'s `app.listen()` callback (production path), but tests import `app` directly without going through `server.js`. **Architecture fix bundled into Phase 8:** `aws.js` now passes `filepath: config.photoapp_config_filename` explicitly to `fromIni({...})`; the env-var hack was removed from `server.js` entirely. Both mocked + live tests green post-fix.

**Reviewer fixes:**

- Fix #1: `GET /api/images/:assetid/file` was missing `Body.on('error', next)` before pipe. Without it, an S3 stream error mid-flight would crash the Node process via unhandled EventEmitter error. Added the listener; integration test asserts attachment via spy + invocationCallOrder. (Going through a real-stream simulation got tangled with pipe's Content-Type-flush mechanics — settled on the simpler spy-based contract test, which directly verifies the fix.)
- Fix #2: `deleteAll()` cleared rows but didn't reset MySQL's `assets.AUTO_INCREMENT`. Added `ALTER TABLE assets AUTO_INCREMENT = 1001` after `DELETE FROM assets`, matching `create-photoapp.sql`'s seed value.

**UI workstream:**

- Analyzed the slimming-agent's MVP-only `01-ui-workstream.md`; surfaced 7 burrs (2 medium, 5 nit), all patched.
- Descoped Playwright entirely to its own Future-State workstream — marked **🔥 HIGH PRIORITY** post-MVP. Reasoning: assignment-window E2E verification is covered by manual CLI smoke (`HumanTestInstructions/README.md`); the automated E2E gate is the cheapest insurance against post-MVP demo-path regressions, but adds non-trivial setup + maintenance cost during the assignment window.
- Committed the slimming-agent's three other deferred-primitive Future-State docs (CommandPalette, TweaksPanel, shadcn primitive migration) alongside Playwright's, completing the cohesive MVP slim.

## Patterns that worked well (especially with subagents)

### Brief structure that scales

Five-section template each subagent received:

1. **Working directory + scope context** (where you are, what the broader project is doing).
2. **Source-of-truth docs to read first** (specific approach doc sections; specific Q-numbers from DesignDecisions).
3. **Goal + required exports** (what to produce + the public API contract).
4. **TDD discipline** (failing test → run RED → impl → run GREEN, in order).
5. **Scope discipline as HARD constraints** (only modify these files; don't commit; don't run full test; don't touch other files; don't push).
6. **Return report shape** (under N words; specific fields).

This structure reproduced cleanly across both calibration tests. Subagents stayed strictly in scope, surfaced ambiguities for main-thread reconciliation, and produced clean structured reports.

### Three-tier test factoring (Calibration Test #2 redesign)

The original Phase 6+7 dispatch had test coupling: Phase 6 route tests asserted error-envelope shapes that come from Phase 7 middleware; Phase 7 tests (per 03's example) used supertest against real `app` which requires Phase 6 routes to exist.

Redesign:

| Tier | Owner | Dependencies |
|---|---|---|
| Phase 6 unit tests | Subagent A | None — happy paths + inline-route-validation 400s only; no error-mw envelope assertions |
| Phase 7 unit tests | Subagent B | None — tiny self-contained Express app inside the test file; never loads `app.js` |
| Integration test | Main thread, post-merge | Both — real `app` + mocked services; verifies route → mw flow end-to-end |

Three test surfaces with disjoint dependencies. Each subagent passed pre-merge; main-thread integration verified wiring post-merge. The reviewer's coupling concern was *dissolved by the redesign*, not bypassed by going sequential.

**Heuristic:** when a reviewer flags coupling on a parallel dispatch, treat it as a test-factoring redesign signal rather than a fall-back-to-sequential signal. Proper unit/integration separation often makes the coupling go away.

### Subagent productivity is uncapped on simple tasks; integration friction is the bottleneck

Calibration Test #1 — Subagent A (schemas) finished in 60s. Subagent C (upload) in 65s. Subagent B (aws) in 109s — significantly longer because of an `@aws-sdk/token-providers` + `jest.mock('fs')` interaction (the full auto-mock breaks at module load when token-providers destructures `fs.promises.writeFile`). Subagent B resolved it via partial mock with `jest.requireActual('fs')` + override only `readFileSync`.

**Three parallel subagents complete in roughly the wall time of the longest single one — not the average.** Friction comes from integration surprises, not task count.

### Same-file work stays main-thread

Phases 3 (5 read use cases) and 5 (3 write use cases) all landed on `server/services/photoapp.js`. Each task = one TDD cycle = one commit. Sequential, single-thread. No subagent dispatch attempted. Hypothesis H3 confirmed: same-file sequential work doesn't benefit from subagents — the round-trip cost of briefing + verifying outweighs the per-task work.

### Subagents surface scope-adjacent findings; main-thread reconciles

Subagent A in Phase 6 noticed that replacing the placeholder body of `routes/photoapp_routes.js` superseded the existing `server/tests/api_placeholder.test.js`. Correctly stayed in scope (didn't touch the test) and surfaced it in the return report. Main thread deleted the obsolete test as part of the integration commit.

This is the pattern: subagents don't unilaterally fix things outside their remit; they flag, main thread reconciles. Keeps the merge state predictable.

## System-layer insights

### Atomic doc-update gate worked across the entire backend

Per Erik's standing instruction: every task's tests-green signal was followed immediately by plan-tracker `[x]` flip + commit. Across ~25 commits in this session, the gate caught two near-stale-doc moments where I almost typed `[x]` before seeing the green signal. The discipline IS the prevention. Heuristic for future agents: **never type `[x]` without having just *seen* the success signal in the same response.**

### Auto-mode toggle as a natural checkpoint signal

The session started post-compaction with the prior session's auto mode having been toggled off mid-Phase-0. The agent (correctly) paused before Pre-Phase 1 — the most consequential mutating step (live RDS ALTER). Captured this as a new memory: when auto mode toggles off mid-execution, treat it as a checkpoint — finish the in-flight close-out, then pause for direction before any new mutating step. Avoids surprising the user with continued momentum after they've signaled intent to re-engage.

### ⚠️ state for "executed pre-approval" survives compaction

Phase 0 was prematurely executed during plan-writing (auto mode + atomic gate together rolled the agent into the install task before Erik could review). The Refresh Ritual surfaced this as EOR-5; resolution was a **durable plan edit** introducing a new state symbol (`⚠️ Executed pre-approval (reverification required)`) into the State Legend + Master Tracker. When execution resumed, the plan itself reminded the agent to reverify rather than skip Phase 0. The pre-approval framing survived the compaction boundary cleanly.

**Insight:** for any state that needs to survive compaction, encode it in a durable artifact (file edit) rather than mental-note-only. The next agent reads the artifact; the prior agent's mental notes are lost.

### Refresh Ritual depth-over-speed paid off

The ritual's adversarial stance (read each file asking "where is the summary wrong?" not "where does it match?") caught the premature-Phase-0 issue. The summary said Phase 0 was complete; ground truth said the work happened on disk but bypassed the approval gate. The depth-over-speed cadence — one step per response, surface findings before moving on — was what made the catch possible. A fast batch ritual would have validated the summary's claim and missed the pre-approval problem.

### Architecture issues surface during live testing

Phase 8 (opt-in live integration tests) caught the AWS credential-resolution issue that mocked tests couldn't see. The legacy pattern of setting `AWS_SHARED_CREDENTIALS_FILE` inside `app.listen()`'s callback worked in production (`npm start`) but failed in tests (which import `app` directly). Live testing is the cheapest way to surface this class of architecture friction. Mocked tests + manual smoke can't replace it.

**Implication for the Playwright Future-State workstream:** an automated E2E gate post-MVP would catch this same class of issue early in any future evolution. That's the priority case for the Playwright descope.

### Multi-agent collaboration handoffs need care

The session involved at least three agents: me, the slimming agent (who reduced 01-ui-workstream.md to MVP), and the reviewer agent (who flagged the two backend reviewer fixes). The slimming agent left their work uncommitted (3 new Future-State docs + roadmap update + an *unintentional* refactor-log deletion). The deletion was caught by surfacing the working-tree state to Erik and reverting. Without that surface, useful documentation would have been lost silently.

**Heuristic:** when picking up a session with uncommitted multi-agent work, scan the diff for unexpected deletions before any commit. Particularly in `refactor-log.md` and other shared logs — these accumulate context that gets thinner over time.

## Bugs / friction surfaced this session

| Surface | Where | Fix |
|---|---|---|
| `_run_sql.py` naive `;`-split | Comment-internal semicolons broke the migration | Removed semicolons from comments in the migration SQL; future polish: harden the parser |
| `jest.mock('fs')` × `@aws-sdk/token-providers` | Full auto-mock breaks at module load (token-providers destructures `fs.promises.writeFile`) | Partial mock pattern: `jest.requireActual('fs')` + override only the targeted method |
| `AWS_SHARED_CREDENTIALS_FILE` env var in `app.listen` callback | Worked in production; failed in tests | Pass `filepath` explicitly to `fromIni({filepath, profile})` in `aws.js`; remove env-var hack from `server.js` |
| Phase 6 route was missing `Body.on('error', next)` | S3 stream errors mid-flight would crash via unhandled EventEmitter | Attached listener before pipe |
| `deleteAll()` didn't reset `assets.AUTO_INCREMENT` | Subsequent uploads picked up at last-ever assetid + 1, not seed value 1001 | Added `ALTER TABLE assets AUTO_INCREMENT = 1001` after `DELETE FROM assets` |
| `validate-db` expects empty assets table | Live RDS has 10 rows from prior testing; pre-existing assertion failure | Surfaced as out-of-scope soft flag; not fixed in Pre-Phase 1 |
| `api_placeholder.test.js` obsolescence | Phase 6 routes superseded the placeholder body | Deleted; the 16 new route tests inherently guard the `/api` mount order |

## What I'd do differently

- **Pre-write the integration test for parallel-with-coupled-tests dispatches before dispatching the subagents.** Calibration Test #2 worked because of the three-tier factoring, but the integration test was written *post-merge* on main thread. Pre-writing it would have given subagents a clearer contract for what they don't need to test.
- **Document side-findings earlier in the commit.** Several discoveries (jest+fs mock pattern, parser bug, env-var fragility) were captured in commit messages + refactor-log entries, but always *after* the fact. A "side-findings" surface at execution time would help future agents pick them up faster.
- **The slimming-agent's refactor-log deletion** was caught only because I noticed the diff before committing. A more systematic diff scan at every multi-agent handoff would catch this category earlier.

## Open opportunities

- **`_run_sql.py` parser hardening** — skip semicolons inside `--` and `/* */` comments before splitting. Out-of-scope for Part 03, but worth a small follow-on.
- **`utils/validate-db` empty-assets assertion** — live RDS has 10 rows from prior testing; the assertion is now stale. Either reset the live DB to the create-photoapp.sql baseline OR loosen the assertion. Soft flag.
- **Memory consolidation** — the patterns in this retrospective should distill into 2-3 new feedback memories. Candidates: "Three-tier test factoring for separate-but-coupled subagents," "Brief structure for parallel-dispatch subagents," "Architecture issues surface during live testing." Worth surfacing during the next SD-5 / spindown pass.

## Cross-refs

- Plan tracker: `Part03/MetaFiles/plans/03-api-routes-plan.md` (full per-phase + subagent calibration evidence)
- Refactor log: `Part03/MetaFiles/refactor-log.md` (chronological decisions + side-findings)
- Install log: `Part03/MetaFiles/install-log.md` (dependency history)
- Approach docs: `Part03/MetaFiles/Approach/{00..03,Future-State-*}.md`
- Design decisions: `Part03/MetaFiles/DesignDecisions.md` (Q1–Q10)
- Manual test guide: `Part03/MetaFiles/HumanTestInstructions/README.md`
- System-plane notes (agent-only): `claude-workspace/scratch/system-plane-notes.md`
