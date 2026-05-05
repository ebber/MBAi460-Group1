# Note to andrew-apple — Catch-and-Merge close

**Date:** 2026-05-04
**Branch:** `feat/p02-gradescope-mvp` @ `e3d9a58`
**Quest:** Catch-and-Merge (closing 2026-05-04)
**Delivery:** drafted by agent; Erik to send via team channel

---

Hi Andrew,

Thanks for the surgical PDF-spec work. Your branch's spec-correct route logic + Python client + test patterns are shipping in this merge.

## What landed in main

Your spec-correct route logic became the wire-level implementation. The 8 route handlers (`/ping`, `/users`, `/images`, `/image/:userid` + `/image/:assetid`, `/image_labels/:assetid`, `/images_with_label/:label`, `/delete_images`) ported from your branch (Chunk 3) into Pranav's Foundation structure. The 17 integration tests (mocking lib services via `jest.requireActual` + spread pattern) covering happy path + key error envelopes shipped with the routes.

Your Python client work (`photoapp.py` + `tests.py` extension with smoke + lifecycle tests) shipped via Chunk 4 cherry-picks. The `test_99_lifecycle_destructive` convention you authored is now an offered memory at `MetaFiles/Offered_Memories/feedback_destructive_test_convention.md`.

## Per-branch review

Full review at `projects/project02/client/MetaFiles/code-reviews/2026-05-04-feat-p02-gradescope-mvp-review.md`. Highlights from the review:

- 7 atomic spec-correction commits (one concern per; bisect-friendly)
- Inner-function naming for retry-wrappable units (`validate_user`, `try_get_labels`, `insert_with_transaction`, ...) — clarity-via-naming for retry boundaries
- PDF spec citations in commit bodies + inline code comments — survives review years from now without external context
- Lightweight input validation (no zod) for trivial presence checks — dependency-frugality at the right level
- `test_99` destructive test convention with docstring + opt-out — defensive documentation prevents future mystery wipes
- Test invariant assertions (`assertGreaterEqual(assetid, 1001)`) — locks the AUTO_INCREMENT seed invariant in code, not docs

The recommendations preamble in your review uses **system-first framing** — when divergence from documented protocol appears (e.g., your Approach-unaware MVP path), the first frame is "what didn't the system surface clearly enough?" before "what did this person do differently?" This frame surfaces the next system improvement regardless of executor culpability. It's now a promoted memory (`feedback_system_first_framing.md`) based partly on the cross-branch dynamics this quest surfaced.

## Patterns extracted as offered memories

The branch artifact sweep at `2026-05-04-branch-artifact-sweep.md` identified 4 patterns from your branch worth offering as memories. All 4 are at `MetaFiles/Offered_Memories/`:

1. `feedback_retry_naming_pattern.md` — inner-function naming for retry-wrappable units
2. `feedback_spec_citation_pattern.md` — PDF quotes in commits + inline code comments
3. `feedback_destructive_test_convention.md` — test_99 docstring + opt-out
4. `feedback_invariant_test_assertions.md` — domain invariants in test assertions, not just docs

Plus `feedback_descriptive_metadata.md` (your `package.json` description as a deferred-decisions surface) — a really nice use of typically-marketing-only metadata.

## What didn't carry forward (with rationale)

- **`helper.js`** (parallel-implements lib's `services.aws`): dropped — lib provides equivalent. No value loss.
- **`pRetry` shim copy-paste across 6 files**: dropped — the merged routes use lib's `services.photoapp.*` which has retry handled (or doesn't need it for those paths). The duplication-pattern itself was a finding worth flagging (Recommendation #3 in your review).
- **`derive_kind` helper at top of `api_post_image.js`** (PHOTO_EXTENSIONS set): dropped — lib provides `schemas.rows.deriveKind` + `schemas.rows.PHOTO_EXTENSIONS`.
- **Your bucketkey shape** (`uuidv4() + ext`): dropped in favor of lib's canonical pattern (`${username}/${uuid}-${localname}`); your routes consume the lib version.

## New bridge code surfaced during integration

During end-to-end verification (Step 4), `tests.py` surfaced a config-path bug: lib's `services/aws.js` reads `../client/photoapp-config.ini` relative to consumer CWD; project02 has no such file. Fix landed in `projects/project02/server/server.js` as a boot-time bridge (`commit cf53d8a`) overriding the lib's path to absolute `project01/client/photoapp-config.ini`, mirroring `services/pool.js`'s pattern. The fix unblocked **5 of 6** of your pytest cases (was `0/6` routing-passing).

**Note on `test_02`**: it remains failing — but it's a fixture-vs-test mismatch, NOT a routing bug. `test_02` asserts `(M=0, N=3)` (empty users + 3 S3 photos); current fixture is `(M=3, N=0)` (3 seeded users + empty S3). It's also internally inconsistent with `test_03`, which depends on the 3 seeded users existing. Likely instructor-template legacy assertion that doesn't match this lab's `rebuild-db` seed. Three resolution paths queued in the Map's Live findings; out-of-scope for this merge per Erik's path-C 2026-05-04 ("accept 5/6 + queue").

Adjacent finding worth knowing: lib's `error.js:52` calls `logger.error('UNHANDLED ERROR:', err)` (console-style); pino silently discards the err arg, so route-handler errors are mostly invisible in logs. We needed a temporary diagnostic middleware in app.js to surface the actual `ENOENT` during diagnosis. CL9 candidate for the lib's next pass: `logger.error({ err }, 'UNHANDLED ERROR')`.

## Forward-going

- Your spec-correct routes + Python client are shipping in this merge
- Phase 2.9 (Gradescope server 60/60) + Phase 3.6 (client 30/30) are next; your spec-aligned implementations are positioned to score
- `test_02` fixture mismatch needs resolution before Gradescope submission — three paths queued in MergeOrientationMap Live findings; first pass is updating test_02's expectations to match seed (`M=3, N=0`) for internal consistency with test_03

Thanks for the spec-level depth. The merge ships your wire-correct implementations as the actual user-facing surface; curate-and-pick worked precisely because your branch's spec correctness was the right content layer above Pranav's structural correctness.

— Claude (with Erik)
