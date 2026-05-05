# 2026-05-04 — Playwright E2E Workstream Landing

> **Audience:** future agent (or future Erik) wanting context on the 2026-05-04 session that landed the Tier 1 Playwright E2E workstream.
> **Scope:** session-arc summary + key decisions + spin-down close. Not a substitute for the per-task evidence in `projects/project01/Part03/MetaFiles/plans/04-playwright-e2e-plan.md`.
> **PR:** [#2 — feat(part03): Playwright E2E test suite](https://github.com/ebber/MBAi460-Group1/pull/2)

---

## What Was Done

Tier 1 Future-State Playwright E2E workstream landed end-to-end:

- **Plan + branch** (`8f17d76`): 1213-line plan, 2 adversarial self-reviews, 13 fixes inline before any execution. Branch `feat/p01p03-playwright-e2e` from `main` (post-Phase-0 monorepo).
- **Phase A — Bootstrap** (5 commits): @playwright/test + chromium installed; `playwright.config.ts` with two projects (default + destructive); fixture infrastructure (degu.jpg copied, PDF + 51 MB blob runtime-generated via pdfkit globalSetup); sanity spec green.
- **Phase B — Happy path** (3 commits): `routing-and-auth.spec.ts` (L1, L2, L3) + `library-happy-path.spec.ts` (U1, LIB3, A1, A3, serial mode, count-before/after assertion).
- **Environment-separation refactor** (`9fb1cd4`): scrubbed cross-checkout path references after Erik's directive — "make clear separations between the two environments."
- **Phase B-sidecar — Destructive** (`be55385`): opt-in deleteAll spec gated by Playwright project filter; verified end-to-end (20 → 0 wipe).
- **Phase C — Document branch** (`102b888`): `document-upload.spec.ts` (U3, LIB4, A2). Zero source changes — all needed testids already existed.
- **Phase D — Error surfaces** (`9fade3c`): `error-paths.spec.ts` (U4, missing-file, 2 distinct 404 surfaces).
- **`utils/e2e-smoke`** (`be4e9e4`): single-command lifecycle (start server → default suite → destructive → trap-cleanup); linked from CONTRIBUTING + QUICKSTART.
- **Phase F — DOC-FRESHNESS closeout** (`19ba471` + `e28a99c`): all surfaces propagated (workstream doc, OrientationMap, roadmap, Human-Walk, install-log, plan tracker); 2 memories promoted; PR body staged.
- **PR #2 opened**, then post-PR cleanup commit (`b95e989`) deleted the now-redundant scratch staging file.

Final coverage: **12 of 15 browser-based human-walk rows** (`Human-Feature-Test-Suite.md`) automated; 3 deferred to Production Hardening (LIB1 perf, LIB2 responsive, A11Y1 a11y).

## Key Decisions

- **Phase E (CI/GHA workflow) deferred** per Erik 2026-05-04 — VCS scope-out for current arc; queued in `MetaFiles/TODO.md`. Workflow shape documented (calls `utils/e2e-smoke --no-destructive`) but not committed.
- **Per-test specific-asset cleanup deferred** — surfaced API gap during inspect-before-writing of B-sidecar; only `DELETE /api/images` (deleteAll) exists, no single-asset endpoint. Queued as `[API/Library Polish] DELETE /api/images/:id` in TODO.
- **Resequenced execution** to A → B → D → C → B-sidecar (destructive last) per Erik's "before destructive, are other tests complete?" prompt. Lower flake risk; cleaner debugging.
- **Memory location**: 2 memories promoted to `MetaFiles/Offered_Memories/` (`feedback_environment_separation`, `feedback_inspect_before_writing`); 1 spin-down memory placed in newly-created `MetaFiles/Recommended_Memories/` (`feedback_playwright_async_data_load_race`) — the latter directory is for proposals pending review before promotion.

## What Worked

- **Adversarial self-review at plan stage** caught 13 issues before execution (pdfkit ESM/CJS interop, wordmark exact-match brittleness, serial-mode missing on happy-path describe, etc.). Several would have been mid-execution debugging cycles otherwise.
- **Inspect-before-writing as a discipline** — Erik's instruction at the B↔B-sidecar boundary. Demonstrated load-bearing the same session via the `playwright show-report` config-mismatch incident: I had instructed Erik to run `show-report` without first inspecting whether the config enabled the HTML reporter. Self-suppressed the same failure mode several times after.
- **Atomic doc-update gate held over 19 commits** — every task committed plan-tracker + source + install-log together. Zero drift between plan claims and reality.
- **`utils/e2e-smoke` single-command lifecycle** — wrapped multi-step (start server, wait, run default, run destructive, kill cleanly) into one command. Made the final validation cycle effortless and lowered the barrier for any future contributor to run E2E.

## What I'd Refine

- **Multi-step CLI instructions need bundling, not chaining.** I gave Erik two commands (extract awk → gh pr create); only the second ran first time. Should have either (a) bundled both into a script up-front, or (b) flagged the dependency more loudly. Inspect-before-writing applies to one's own multi-step instructions too.
- **Race condition on Playwright async data-load** — caught in destructive run #1; should have anticipated at write-time given the async-fetch pattern of the React app. Captured as memory candidate (see `Recommended_Memories/`).
- **Earlier framing of "outstanding" routing** included stale options (A/B/C for the staged-pr-body.md patch) that didn't reflect the post-PR-open reality. Should have surfaced "delete the now-redundant artifact" as the cleanest 4th option immediately. Erik gently called this out; corrected.

## Surprises

- **Workspaces hoist** — Phase 0 made the monorepo workspaces structure; backend deps live at root `node_modules/`, not Part03's. Pre-flight P.1 caught it; would have been a confusing failure otherwise.
- **`photoapp-config.ini` accumulation drift** — gitignored config files don't transfer across checkouts; Erik named "use cp not symlink" as the principle, which became the environment-separation memory.
- **`pdfkit` default-import worked under TS loader** without the documented CJS fallback (R1.1 risk). The plan documented the fallback for safety; reality didn't need it.
- **Single shared AWS stack worked fine for E2E** with full-wipe destructive cleanup at session end. Erik's call to accept this (Q4 routing) saved significant infra work that would have otherwise needed S3 prefix scoping + RDS schema namespacing.

## Notes For Cold-Pickup Readers

- **The PR body** (`feat(part03): Playwright E2E test suite (Tier 1 Future-State workstream)`) is the single best place to start for context — it's structured for review.
- **`utils/e2e-smoke`** is the ground-truth "does this still work?" check — runs in ~20s, exits 0 on full pass.
- **Two follow-up TODOs** were queued during this session: Phase E GHA workflow + `DELETE /api/images/:id`. Both in `MetaFiles/TODO.md` Active section.
- **Tier 1 reduced** from 3 (Playwright + Form Library + Library Polish) to 2 (Form Library + Library Polish remaining). Sub-E recommendation in `Future-State-roadmap.md` was the source.
- **Branch is mergeable** at session close; awaiting collaborator review.

## Spin-Down Status

- ✅ All planned phases complete (E deferred, all others ✅)
- ✅ PR #2 open + body landed + post-PR cleanup pushed
- ✅ Memory captured (1 in `Recommended_Memories/`; 2 already in `Offered_Memories/`)
- ✅ Working tree clean (after this commit)
- ✅ /tmp artifacts removed
- ✅ Scratch dir empty
