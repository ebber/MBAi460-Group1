# Lab02 Retrospective

**Date:** 2026-04-16
**Result:** 100/100 ✅ — 4/4 autograder test suites fully passed
**Agent:** Claude Code (claude-sonnet-4-6)

---

## What Worked Well

### The planning phase paid dividends
The 3-round external review caught real issues before a single line was written:
- D7 (test isolation): `test_basic_api` leaving the table empty after `put_reset()` was a happy
  coincidence, not a contract. Renaming or reordering tests would have silently broken subsequent
  not-found assertions. The setUp/tearDown fix made test isolation an explicit contract.
- D2 (UPDATE-before-SELECT optimization): validated by the external reviewer as sound before
  implementation. Made it into the codebase with confidence.

### Architecture split
Mixing platform infrastructure with per-assignment Gradescope flows in one diagram created
maintenance risk. Splitting into a living platform doc (`lab-architecture-v2.md`) and frozen
per-project files (`lab01-part01-architecture.md`, `lab02-architecture.md`) keeps each file
relevant and prevents stale cross-contamination as the lab evolves.

### `utils/run-sql` — discovery over invention
The migration runner already existed with admin credentials wired in. The right move was to
discover and use it, not reinvent it. Pattern holds: explore utils/ before writing new tooling.

### D5 (dbConn = None) applied cleanly
The unbound variable bug in the stub's finally block was caught during planning and fixed in
implementation. A clean D5 pass across all 4 functions means no `UnboundLocalError` risk on
connection failure.

### Test coverage surface (3g) found real value
- `test_count_increment`: verifies count tracks exactly, not just "increments somehow"
- `test_put_reset_empty`: verifies robustness — reset on an already-empty table returns True
- `test_put_shorturl_conflict` verifies DB is unchanged after a conflict (not just False returned)
- `test_put_shorturl_case_sensitive`: live-verified that `utf8mb4_bin` collation is actually
  doing its job — `/Abc` and `/abc` resolve to different longing URLs

---

## What to Do Differently Next Time

### `gs results` doesn't exist
The `gs` tool only supports `submit`. Build the polling loop around asking Erik directly rather
than trying to poll programmatically. Updated in APPROACH.md for future agents.

### Context compaction during execution
This lab ran long enough to hit context compaction. The APPROACH.md + visualizations as
savepoints worked well — the reconstructed agent reoriented cleanly from those artifacts.
Lesson: structured plan files are the best compaction safety net.

---

## Patterns Established (carry forward to Project01-P2)

| Pattern | Detail |
|---------|--------|
| `dbConn = None` before try | Prevents `UnboundLocalError` if `get_dbConn()` raises |
| `begin()` / `commit()` / `rollback()` | Explicit transaction control — no auto-commit assumption |
| `%s` parameterized queries | No f-strings in SQL — SQL injection prevention |
| `setUp` + `tearDown` both call reset | Start clean AND end clean — not just one or the other |
| UPDATE-before-SELECT in get_url | Avoids second round-trip on miss; atomic in one transaction |
| SELECT-then-INSERT in put_shorturl | Idempotent: same longurl re-insert returns True, not False |
| `@'%'` explicit host in MySQL users | Required when source IP is unpredictable via Docker NAT |
| FLUSH PRIVILEGES omitted intentionally | CREATE USER + GRANT are self-effecting in MySQL 8 |
| `utf8mb4_bin` for URL path keys | Case-sensitive by design; MySQL default is case-insensitive |
| Migration via `utils/run-sql` | Version-controlled, repeatable, uses existing admin credentials |
| Gitignored config + `.example` template | Live creds never in git; template shows structure to fill |

---

## Plan Refinements Made During Execution

These are mid-plan updates — places where the plan changed after initial write. High-signal
because they reveal where our planning process has blind spots and how it's evolving.

### D7 — tearDown added to complement setUp
**Original plan:** setUp calls put_reset(); tearDown omitted.
**What changed:** Reviewer caught that test_basic_api ends with put_reset() — coincidence, not
contract. tearDown added to make "start clean AND end clean" an explicit guarantee.
**Pattern:** Isolation contracts must be both entry and exit conditions, not just one.

### D7 — "tearDown clears only what this test put there" removed
**Original plan language:** "tearDown calls shorten.put_reset() — clears only what this test put
there."
**What changed:** Erik caught this was wrong — put_reset() deletes the entire table, not just
this test's rows. The plan was corrected to reflect that this is safe *because* unittest runs
tests sequentially and fresh UUIDs prevent cross-contamination.
**Pattern:** Precise language in plans matters. "Clears only X" implies a scoped delete;
"deletes the whole table, which is safe because Y" is the accurate framing.

### FLUSH PRIVILEGES — removed from plan
**Original plan:** included FLUSH PRIVILEGES after GRANT.
**What changed:** Reviewer flagged it as unnecessary in MySQL 8 — FLUSH PRIVILEGES is only
needed when modifying grant tables directly (UPDATE mysql.user). CREATE USER + GRANT are
self-effecting. Removed from create-shorten.sql and APPROACH.md.
**Pattern:** MySQL 8 behavior differs from older versions here; don't copy-paste older SQL
idioms without checking version-specific semantics.

### `@'%'` host — added explicit callout
**Original plan:** used @'%' but didn't document why.
**What changed:** Reviewer asked for explicit documentation. Added a comment in the SQL and
in APPROACH.md: source IP is unpredictable when connecting via Docker --network host through
NAT to the RDS public endpoint.
**Pattern:** Any "looks weird" choice (why @'%' not @'localhost'?) needs a comment explaining
the constraint that makes it the right answer. Future agents and reviewers will ask.

### `gs results` — polling strategy corrected
**Original plan:** Phase 4 implied programmatic polling of autograder results.
**What changed:** Discovered mid-execution that gs only has submit — no results command.
Updated APPROACH.md: results require human web UI check; ask Erik directly.
**Pattern:** Verify tool capabilities (gs --help) before building workflows around assumed
subcommands. Discovered-during-execution corrections should be written back into the plan
immediately so future agents don't repeat the discovery.

### Autograder results note added to lab02-architecture.md
**Original plan:** lab02-architecture.md submission table had no note about result retrieval.
**What changed:** After discovering gs results doesn't exist, added "Human check only" note
to the architecture doc so the constraint is visible alongside the submit command.
**Pattern:** Submission docs should capture both how to submit AND how to retrieve results.

---

## Observations

The Gradescope grader for Lab02 works fundamentally differently than Lab01:
- Lab01: grader hits AWS directly (RDS TCP 3306, S3 HTTPS) — pure infrastructure test
- Lab02: grader imports `shorten.py` and calls functions — code + infrastructure test

This distinction matters for failure diagnosis: Lab02 failures can be logic errors, infra errors,
or config errors. Lab01 failures are always infra/config.

### Phase 4c loop — zero iterations

The submit-review-fix loop in Phase 4c didn't fire once. One submission, 100/100, done.
This is worth naming explicitly: plans that survive execution intact are rare. The planning
investment (3-round external review, D1–D7 documented, setUp/tearDown fixed before
implementation) paid off as front-loaded correctness rather than back-loaded iteration.
Phase 4c exists because iteration is expected and healthy — not firing means the plan was
tight enough that no behavioral gap surfaced at submission time. That's the goal.

---

The 4/4 autograder pass aligning with our 7 internal tests implies the internal suite was
comprehensive against the autograder's behavioral coverage — bounded, naturally, by what the
autograder itself exercises. Unicode URLs, concurrency, and very long paths (approaching the
512-char VARCHAR limit) weren't exercised by either suite. What is known: every behavioral axis
the grader tested (get/stats/put/reset, miss handling, idempotency, collision, case-sensitivity)
had at least one internal test. That alignment, not the score alone, is the signal.
