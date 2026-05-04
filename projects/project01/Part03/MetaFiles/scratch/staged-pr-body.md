# Staged PR body — Playwright E2E workstream

> **Purpose:** Ready-to-use PR body for `feat/p01p03-playwright-e2e` against `main`. Copy the content below the divider into `gh pr create --body-file <thisfile>` or paste into the GitHub UI. **Edit before submitting** if anything needs Erik-specific tone/refinement.
> **Branch state at staging:** 19 commits, working tree clean, full lifecycle re-verified post-DOC-FRESHNESS.

---

## Summary

Tier 1 Future-State workstream — Playwright E2E test suite — landed. 12 of 15 browser-based human-walk rows now under automated regression. Single-command lifecycle ships as `utils/e2e-smoke`.

**Not library-touching** (Part 03 frontend + utils only — `lib/photoapp-server` unchanged).

## What landed

- **5 Playwright specs** under `projects/project01/Part03/frontend/e2e/specs/`:
  - `sanity.spec.ts` — wordmark renders
  - `routing-and-auth.spec.ts` — L1, L2, L3
  - `library-happy-path.spec.ts` — U1, LIB3, A1, A3 (serial, count-before/after assertion)
  - `document-upload.spec.ts` — U3, LIB4, A2 (PDF branch)
  - `error-paths.spec.ts` — U4, missing-file, 2 distinct 404 surfaces (catch-all + asset-detail)
  - `destructive-deleteall.spec.ts` — opt-in destructive cleanup, gated by Playwright project filter
- **`utils/e2e-smoke`** — single-command lifecycle (start server + run default + run destructive + clean up). Linked from CONTRIBUTING.md Quick reference and QUICKSTART.md Test 4.
- **3 component testid additions** (additive only; Vitest 74/74 still pass): `card-label` on AssetCard label spans, `asset-preview` on AssetDetail img, `label-confidence` on AssetDetail confidence span.
- **Plan + workstream-doc + OrientationMap + roadmap + Human-Feature-Test-Suite + install-log** all updated atomically with the work.
- **2 new feedback memories** in `MetaFiles/Offered_Memories/`:
  - `feedback_environment_separation.md` — cp-not-symlink, env-agnostic doc language
  - `feedback_inspect_before_writing.md` — read source/config before authoring artifacts

## Coverage

| Surface | Before | After |
|---|---|---|
| Browser human-walk rows | 0 / 15 automated | 12 / 15 automated |
| Default Playwright suite | does not exist | 15 tests, ~12s wall |
| Destructive cleanup | manual via UI | 1 test, opt-in only |
| End-to-end lifecycle | multi-terminal manual | `utils/e2e-smoke` single command |

3 deferred rows (LIB1 perf, LIB2 responsive, A11Y1 a11y) remain manual — explicitly routed to Future-State Production Hardening / Mobile workstreams.

## Out of scope (queued for follow-up)

- **`[CI/Future-State]` Phase E GHA workflow** — drafted in plan, deferred per VCS scope-out 2026-05-04. Queued in `MetaFiles/TODO.md` Active. When activated, calls `utils/e2e-smoke --no-destructive` from a `pull_request` trigger with path filter on Part 03 + lib + the workflow itself + the util. Requires scoped IAM identity + GHA secrets.
- **`[API/Library Polish]` `DELETE /api/images/:id`** — surfaced during inspect-before-writing of B-sidecar; the API has only `DELETE /api/images` (deleteAll). Single-asset delete is queued in `MetaFiles/TODO.md` Active for the Library Polish workstream.

## Verification

Single command, end-to-end (just re-ran post-final-doc-freshness):

```bash
utils/e2e-smoke
```

Result: pre-flight 6/6 PASS → default 15/15 passed (~12s) → destructive 1/1 passed (~3s) → server stopped via trap → final state CLEAN.

## Test plan

- [x] `utils/e2e-smoke` from a fresh shell verifies pre-flight + default + destructive
- [x] `npm run e2e` (from `Part03/frontend/`) runs default suite only
- [x] `npm run e2e:destructive` runs destructive only (opt-in)
- [x] `npx playwright show-report` opens HTML report (post-fix in commit `00ef859`)
- [x] Vitest 74/74 still pass (`cd projects/project01/Part03/frontend && npm test`)
- [x] Backend Jest unaffected (no source changes outside frontend)
- [ ] Reviewer manual walk of the 3 deferred rows (LIB1, LIB2, A11Y1) — still required

## Notes for reviewer

1. **AWS shared-stack acknowledged**: each default-suite run uploads 1 degu + 1 PDF; destructive wipes them. Full lifecycle ends clean.
2. **Branch hasn't been pushed yet** — pre-PR review in this state per Erik's staging directive.
3. **Two adversarial self-reviews** ran during plan-writing (commit `8f17d76`); 13 issues fixed inline before any execution.
4. The "Inspect before writing, always" memory was demonstrated load-bearing intra-session via the `show-report` config-mismatch incident (commit `00ef859`).

---

## Push commands (Erik to invoke when ready)

```bash
# from anywhere — tested working from tempDir/MBAi460-Group1/
cd /Users/erik/Documents/Lab/tempDir/MBAi460-Group1

# 1. Push the branch (first push — creates remote tracking)
git push -u origin feat/p01p03-playwright-e2e

# 2. Open the PR (uses the body content above — edit before running if you want changes)
gh pr create \
  --base main \
  --head feat/p01p03-playwright-e2e \
  --title "feat(part03): Playwright E2E test suite (Tier 1 Future-State workstream)" \
  --body-file projects/project01/Part03/MetaFiles/scratch/staged-pr-body.md
```

> **Heads-up:** the `--body-file` includes everything in this document including this Push commands section. Either trim before running (`sed -n '1,/^---$/p' staged-pr-body.md` to keep only the section above the first divider), or paste the relevant section into the GitHub UI manually.
> Cleaner alternative: extract just the PR-body section to a temp file:
> ```bash
> awk '/^## Summary/,/^---$/' projects/project01/Part03/MetaFiles/scratch/staged-pr-body.md > /tmp/pr-body.md
> gh pr create --base main --head feat/p01p03-playwright-e2e --title "..." --body-file /tmp/pr-body.md
> ```
