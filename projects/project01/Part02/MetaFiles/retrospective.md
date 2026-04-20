# Retrospective — Project 01 Part 02

**Date:** 2026-04-20
**Outcome:** 70/70 Gradescope — first submission, no iteration.

---

## What was built

- 7 API functions in `photoapp.py`: `get_users`, `get_images`, `post_image`, `get_image`, `delete_images`, `get_image_labels`, `get_images_with_label`
- Full `tenacity` retry decorator on all pymysql inner functions
- Rekognition `detect_labels` integration in `post_image`; bulk label insert via `executemany`
- `labels` table (DDL in `create-photoapp-labels.sql`) with FK, indexes, and CASCADE
- Test suite test_01–test_10 with `setUpClass` + `setUp` isolation
- IAM users `s3readonly` + `s3readwrite` via Terraform; key rotation util
- `utils/rotate-access-keys` script for future credential rotation

---

## What went well

**Deep implementation notes paid off.** `Implementation-Notes.md` captured every contract detail from the PDF (exact error message strings, operation order for post/delete, `int(Confidence)` not `round()`, `list(fetchall())` for type consistency) before a line of code was written. Zero surprise failures at Gradescope.

**Inner-function pattern for retry was correct.** Decorating only the MySQL-touching inner functions — not the outer function that also calls S3/Rekognition — avoided re-upload on retry. This was a subtle requirement that the plan captured before implementation.

**TDD scaffolding (setUpClass + setUp) isolated every test.** `delete_images()` in `setUp` ensured each test starts from a clean DB + S3 state. No test-ordering dependencies, no accumulated state.

**Phase 0 planning investment removed all iteration.** Three execution sessions, zero Gradescope debugging rounds. The plan, implementation notes, and audit/divergence work in Phase 0 front-loaded the thinking.

**IAM via Terraform (not console) was the right call.** Reproducible, auditable, and avoidable for key rotation in the future. The `rotate-access-keys` util is a genuine asset.

---

## What was harder than expected

**`list(fetchall())` type mismatch.** pymysql returns tuple-of-tuples; `unittest.assertEqual` on `[(tuple), ...]` vs `((tuple), ...)` fails silently by type. Caught during test writing, not at Gradescope — but worth encoding as a known pymysql landmine.

**`@_retry` retrying on `ValueError`.** The retry fires on ALL exceptions, including `ValueError("no such assetid")`. Functionally correct (`reraise=True` propagates after 3 attempts), but generates 3 log lines per invalid-ID test. Noted as a quality item for future: add `retry_if_exception_type(pymysql.Error)` to filter.

**Gradescope `.gradescope` token not in the Class Project repo mount.** The token lives at the lab repo root (`mbai460-client/.gradescope`), outside the Docker volume mount. Fixed with an additional `-v` bind mount. Worth documenting in `QUICKSTART.md` for future submissions.

---

## Technical decisions that held up

| Decision | Outcome |
|----------|---------|
| S3 upload first, DB insert second in `post_image` | Correct — orphaned S3 keys are harmless; broken DB refs are not |
| DB truncate first, S3 delete second in `delete_images` | Correct — per PDF docstring contract |
| `MULTI_STATEMENTS` flag on the connection | Enabled 4-statement truncate block in a single `execute()` |
| `ON DELETE CASCADE` on labels FK | Belt-and-suspenders — explicit truncate is primary, cascade is safety net |
| `AUTO_INCREMENT = 1001` reset in `delete_images` | Kept test assetids predictable across runs |

---

## Open items carried forward

- **`@_retry` ValueError noise** — add `retry_if_exception_type(pymysql.Error)` in a future code quality pass (non-blocking; grading done)
- **PDF step 16** — `aws rds stop-db-instance` to pause RDS cost; confirm grading complete before running
- **`lab-architecture-v2.md`** — add Rekognition to diagram (noted in README as needed)
- **Gradescope token mount** — document in `QUICKSTART.md` for future assignment submissions

---

## Agent notes

Continuity checks after context compaction were critical. Two compressions occurred across Phase 1–3; structured reconstruction (execution plan + git history as ground truth) recovered correct execution state both times with no repeated work.

Test coverage review after Phase 2 surfaced one real concern (test_04 shape assertions running on empty DB → dead code) and several minor gaps. None affected Gradescope. The review was worth doing — it sharpened the submission confidence.
