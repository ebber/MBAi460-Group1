---
name: Destructive test convention — name/number to run last + docstring opt-out
description: Tests that wipe shared state (DB, S3, filesystem) should be named/numbered to run last + carry the convention in the docstring + provide an opt-out command; defensive documentation prevents future "why did my data get wiped?" mystery
type: feedback
---

Tests that mutate or wipe shared state (database tables, S3 objects, filesystem directories, external service state) need three pieces of defensive documentation:

1. **Run order discipline:** name or number the test to run LAST under the test runner's natural ordering (e.g., `test_99_lifecycle_destructive` runs last alphabetically under unittest)
2. **Docstring convention notice:** the test's docstring explicitly explains the destructive behavior + names the convention used
3. **Opt-out command:** docstring includes the exact command to skip the test (e.g., `pytest -k 'not test_99'`)

**Why:** A test that wipes the DB is dangerous. Defensive documentation prevents the future "why did my DB get wiped?" mystery — the convention + opt-out command are visible at the docstring, not buried in a separate doc. Without these, contributors discovering the destructive test mid-run lose state + waste time learning what hit them.

**Pattern source:** `feat/p02-gradescope-mvp` branch (andrew-apple, 2026-05-04). `projects/project02/client/tests.py:test_99_lifecycle_destructive`:
- Numbered 99 → runs last under unittest's alphabetical ordering
- Docstring explicitly explains the convention + provides the opt-out flag (`-k 'not test_99'`)
- Behavior: clears DB + S3 before exercising the full lifecycle

**How to apply:**
- For any test that wipes / resets / destroys shared state, follow the three pieces above
- Numbering convention: `test_99_*` (or test runner's equivalent for "runs last") for destructive tests; reserve high numbers for destruction
- Docstring template:
  ```
  """
  DESTRUCTIVE: <what this wipes>.
  Convention: numbered 99 to run last in alphabetical ordering.
  Opt-out: pytest -k 'not test_99'  (or equivalent for your runner)
  Why this exists: <legitimate test purpose>
  """
  ```
- The pattern applies beyond pytest: any test framework with deterministic ordering supports a "runs last" convention
- Especially load-bearing for: integration tests against real DB/S3/external services; CI-vs-local environment differences; tests that exercise full lifecycle including teardown

**Adjacent memories:**
- `feedback_mutation_gating.md` — mutation gate at execution time; destructive-test-convention is the test-design analog
- `feedback_confirmation_gate.md` — local-file-op flavor; same principle applied to test discipline
