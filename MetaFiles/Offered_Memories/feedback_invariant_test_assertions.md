---
name: Invariant test assertions — capture domain invariants in test assertions, not just docs
description: When fixing a bug whose correctness depends on a domain invariant (e.g., AUTO_INCREMENT seed value, ID range, schema contract), add a test assertion that locks the invariant explicitly; assertions are mechanical, doc paragraphs are honor-system
type: feedback
---

When fixing a bug whose correctness depends on a domain invariant — `AUTO_INCREMENT` seed value, ID range constraint, schema column ordering, env-var format expectation, version-pin contract — **add a test assertion that locks the invariant explicitly**, not just a doc paragraph.

**Why:** A test assertion is mechanical: the next contributor who silently changes the invariant value sees the assertion fail and is forced to re-engage with the decision. A doc paragraph is honor-system: the next contributor either reads it or doesn't, and changes the invariant unaware. Test assertions are the load-bearing form of invariant capture; docs are decoration.

**Pattern source:** `feat/p02-gradescope-mvp` branch (andrew-apple, 2026-05-04). `tests.py:99` uses `self.assertGreaterEqual(assetid, 1001)` — captures the AUTO_INCREMENT seed value invariant the branch's `delete_images` fix preserved. Without the assertion, a future schema change resetting the seed to 1 would silently break the lifecycle's expected ID range; with the assertion, the test fails + forces decision-engagement.

**How to apply:**
- After fixing a bug, ask: "what domain invariant did this fix depend on? Could a future change silently break it?"
- For each load-bearing invariant, add a test assertion that locks it
- Use bounded assertions where appropriate: `assertGreaterEqual(id, 1001)` (locks the seed without over-specifying); `assertIn(env_var, valid_set)` (locks the contract); `assertRegex(version, r"^\d+\.\d+\.\d+$")` (locks the format)
- Distinct from characterization tests — characterization tests lock current behavior verbatim; invariant assertions lock domain constraints that *must* hold for correctness
- Especially load-bearing for: DB schema invariants (PKs, AUTO_INCREMENT seeds, FK constraints); env contract expectations; version pins; protocol invariants (HTTP status codes, response shapes)

**Adjacent memories:**
- `feedback_read_before_locking.md` — characterization-test version (lock literal values from source, not memory)
- `feedback_test_coverage_review.md` — post-TDD coverage discipline (invariant assertions often surface during the coverage-review step)
