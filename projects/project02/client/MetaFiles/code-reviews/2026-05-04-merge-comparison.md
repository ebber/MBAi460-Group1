# Branch Comparison — feat/p02-foundation vs feat/p02-gradescope-mvp

**Date:** 2026-05-04
**Reviewer:** Claude (Opus 4.7, 1M context) for Erik
**Both branched from:** `d2e039c` (`library-1.0.0-extraction-complete` — Phase 0 merge commit)
**Per-branch reviews:** [`2026-05-04-feat-p02-foundation-review.md`](2026-05-04-feat-p02-foundation-review.md) (pranavvaranasi1254) + [`2026-05-04-feat-p02-gradescope-mvp-review.md`](2026-05-04-feat-p02-gradescope-mvp-review.md) (andrew-apple)

---

## At a glance

| | Branch A — `feat/p02-foundation` | Branch B — `feat/p02-gradescope-mvp` |
|---|---|---|
| Author | **pranavvaranasi1254** (Pranav Varanasi) | **andrew-apple** (Andrew Apple) |
| Tip SHA | `685b501` | `e3d9a58` |
| Commits | 7 | 7 |
| Files changed | 91 | 10 |
| Insertions / deletions | +7,261 / −582 | +400 / −160 |
| Claimed scope | Phase 1 Foundation (sub-phases 1.0–1.12) + all 8 routes | PDF-spec route corrections + Python client alignment + client tests |
| Architectural posture | New `routes/` + `middleware/` + `services/` + `observability/` + full test pyramid; lib-consumer | Surgical fixes to instructor-baseline `api_*.js` at server root + Python client; lib-bypassing |
| Lib consumption | Yes (extensive — services.photoapp / middleware factories / schemas / config / repositories) | No (parallel `helper.js` re-implements lib's AWS clients) |
| Test surface (new) | Six-layer pyramid (contract / happy_path / integration / live / smoke / unit), ~17 test files | `tests.py` extended (Python only); zero new JS tests |
| Phase 1 cross-cutting threads engaged | Testing pyramid ✅ / Library governance ✅ / Mermaids 1 viz / Doc-freshness partial | None directly |
| Touches Python client | No | Yes — `photoapp.py` rewritten + `tests.py` extended |
| Per-branch dimension grade summary | 1 A, 4 A-/B+, 2 B, 1 C+, **1 D+** | 0 A+, 3 A's, 1 B+, **3 C's, 1 D+** |
| Severity totals | 4 🚩 / 8 ⚠️ / 4 💡 / 14 ✨ | 0 🚩 / 18 ⚠️ / 12 💡 / 22 ✨ |

**The asymmetry that drives the strategy:** Branch A built Phase 1 Foundation strongly but did not implement Phase 2 routes (its `685b501` commit restored the unmodified instructor baseline files and wired them at off-spec paths — verified via `git ls-tree d2e039c projects/project02/server/`). Branch B built Phase 2 route corrections + Phase 3 Python client work strongly but skipped Phase 1 Foundation entirely. **They are complementary, not redundant.**

---

## Per-dimension comparison

For each dimension: which branch graded higher + the differentiating evidence.

### 1. Functional completeness — **Branch B higher (A- vs C+)**

Branch B's seven commits delivered exactly what they advertised: PDF-spec wire conformance for 5 routes (`POST /image/:userid` body shape, `GET /image_labels/:assetid` URL shape, `GET /images_with_label/:label` URL shape, `DELETE /images` ordering + `AUTO_INCREMENT=1001` reset, `GET /image/:assetid` projection) + a Python client aligned to those server changes + test extensions. Each commit is a unit of work that clearly executes.

Branch A's `685b501` advertises "implement all 8 Gradescope-graded API routes" but the diff is a restore of the instructor baseline at three non-spec paths (`/image/:assetid/labels`, `/images/search?label=`, `POST /image` with body-userid). Foundation commits (e6923d3..2e88078) deliver what they advertise; the routes commit does not.

### 2. Code elegance — **Branch A higher (B vs B+)**, modestly

Branch A's middleware factories, error-handling layering, and OpenAPI yaml are idiomatic and well-structured. Branch B's surgical fixes are clear and direct (e.g., `api_post_image.js` transaction wrapping is well-shaped). Branch B graded slightly higher on elegance at the file level because each surgical commit is atomic and reads cleanly; Branch A's elegance is broader (architecture-level) but masked by the `685b501` regression.

### 3. Supporting work completeness — **Branch A meaningfully higher (A- vs C+)**

Branch A built the full six-layer test pyramid (~17 test files), an OpenAPI 3.1 yaml, docker-compose + Terraform modules + LocalStack bootstrap script, a Mermaid visualization, and Plan/Map/refactor-log atomic updates per sub-phase. Branch B added `tests.py` (Python only); no JS test files; no docs; no Plan/Map updates.

### 4. Codebase alignment — **Branch A higher (B+ vs C)**, with `685b501` caveat

Branch A's Foundation work is deeply lib-consumption-aware: middleware factories DI'd from `@mbai460/photoapp-server`, services consumed at the right boundary, error middleware mount-prefix-aware (`/v1` vs `/v2`). Branch A's `685b501` then *abandons* this alignment — the restored `api_*.js` files use `helper.js` which duplicates the library's AWS factories. Branch B's `api_*.js` *also* uses `helper.js` and bypasses the lib — but never claimed to do otherwise; Branch A's misalignment is an authorship contradiction within a single branch.

### 5. Plan progress updates — **Branch A higher (A- vs D+)**

Branch A updated Plan + (predecessor) OrientationMap atomically per sub-phase across 7 commits — visible per-commit in the diff. Branch B did not update Plan/Map/refactor-log at all. The 7-commit narrative is in the commit subjects only.

### 6. Test quality — **Branch A higher (B+ vs C+)**, with caveats

Branch A's pyramid covers the right behavioral surfaces (envelopes, error middleware, request_id, breakers, pool, validate middleware, library resolution, healthz). Branch B's `tests.py` extension is reasonable for Python integration testing but doesn't cover the surgical server-side fixes the same branch made.

Caveats on Branch A: the test files at `685b501` time are foundation-layer tests; **no test exists for any of the 8 actual routes Branch A claimed to implement**. Coverage of the foundation seams is genuine; coverage of the route handlers is zero.

### 7. Commit hygiene — **Branch A higher (A- vs A)**, both strong

Both branches use Conventional Commits scopes consistently. Branch B's commit messages are concise and accurate ("fix(p02-server): conform to PDF route spec (3 routes corrected)"). Branch A's foundation commits are similarly clean. Branch A graded slightly lower because `685b501`'s subject ("implement all 8 Gradescope-graded API routes") **misrepresents what the commit does** — flagged as ⚠️ in Branch A's review (line 91).

### 8. Cross-cutting thread engagement — **Branch A meaningfully higher (B+ vs C-)**

Branch A engaged Testing Pyramid (six layers built), Library Governance (consumer wiring), Mermaids (one architectural viz), Doc-Freshness (partial — Plan + Map updates). Branch B engaged none of the threads directly; it focused narrowly on PDF-spec wire correctness.

### 9. Strengths to amplify — **Branch B higher count (22 vs 14 ✨)**, both genuine

Branch A's strengths: middleware factory consumption discipline, mount-prefix-aware error mapping (a genuinely elegant DI seam), atomic Plan/Map/refactor-log triad (CL11 discipline visible), six-layer test pyramid scaffolding, OpenAPI 3.1 yaml authoring with full route table.

Branch B's strengths: surgical commit atomicity, transaction wrapping in `api_post_image.js`, `AUTO_INCREMENT=1001` reset awareness in `delete_images.js` (matches the lib's behavior; Phase 0 reconciliation log captured this seed value as load-bearing), Python client refactor matching the PDF-spec server, test coverage extension on the client side.

---

## Reconciliation matrix

For each surface where both branches did work, what we keep:

| Surface | Branch A's contribution | Branch B's contribution | Reconciliation |
|---|---|---|---|
| `projects/project02/server/package.json` | Created with full dep set + lib consumer + dev deps for testing | Created with minimal deps; workspace member | **Use A's** (more complete; covers Phase 1 + 2 deps) |
| `projects/project02/server/app.js` | Lib-consumer; mounts new `routes/` structure; uses lib middleware factories | Modified instructor baseline; mounts `api_*.js`; minimal lib touch | **Use A's** (architecture-defining; the routes mount point) |
| `package-lock.json` | Updated for full Phase 1 dep set | Updated for minimal additions | **Take A's; re-resolve via `npm install` after merge to consolidate** |
| `projects/project02/server/middleware/` `services/` `observability/` `routes/_internal/` `schemas/` `tests/` | Created (full Foundation) | Not touched | **Use A's** (only A has it) |
| `projects/project02/server/api_*.js` (route handlers) | Restored byte-identically from baseline at `685b501` (no implementation) | Surgically corrected to PDF spec (5 of 8 fixed) | **Use B's PDF-spec-correct logic, BUT port into A's `routes/` structure with lib consumption** (curation work; not a raw cherry-pick) |
| `projects/project02/server/helper.js` | Restored from baseline at `685b501` (lib-bypassing) | Modified for spec corrections (lib-bypassing) | **Drop both** (lib provides equivalent via `services.aws`); routes consume lib instead |
| `projects/project02/client/photoapp.py` | Not touched | Aligned to PDF-conformant server | **Use B's** |
| `projects/project02/client/tests.py` | Not touched | Extended with smoke + lifecycle | **Use B's** |
| OpenAPI yaml (Branch A's at e.g. `projects/project02/server/openapi/...`) | Authored; spec-correct | Not authored | **Use A's** (the contract source-of-truth) |
| Plan + (legacy) OrientationMap updates | Atomic per-sub-phase | None | **Use A's** but reconcile in Step 5 against actual landed state |
| Docker-compose + Terraform modules + LocalStack bootstrap | Authored | Not authored | **Use A's** |
| Mermaid viz `Target-State-project02-foundation-consumer-bootstrap-v1.md` | Authored | Not authored | **Use A's** |

---

## Strategy choice

**CURATE-AND-PICK** (option from the F catalog: "both did same work differently / divergent value with overlap → cherry-pick the best of each into a new branch, then merge that").

### Rationale

The two branches divide cleanly along architectural lines: Branch A built the *foundation surface* (Phase 1's full-Approach scaffolding) and Branch B built the *route surface* (Phase 2's PDF-spec route logic) + *client surface* (Phase 3's Python client alignment). Sequential merge would conflict massively on `app.js` / `package.json` / `package-lock.json` AND ship Branch A's flawed `685b501` route restoration. Discarding either branch loses real value (A has Phase 1; B has Phase 2 + 3 substance). Integration-branch alone doesn't solve the curation question — it just consolidates the conflict workspace; we still need explicit decisions about which contribution to keep at each surface.

Curate-and-pick is more work than sequential merge, but the alternative ships either off-spec routes (Branch A's `685b501`) or skips the foundation (Branch B's posture). **The merge sequence reflects the actual decision: "keep A's Foundation, drop A's `685b501`, port B's route logic into A's structure, take B's Python client, resolve the bucketkey divergence."**

### What this strategy looks like in practice

1. Create a clean integration branch from `main` (`merge/collab-reconciliation`). All work happens here until verified, then a single `--no-ff` merge to `main`.
2. **Cherry-pick Branch A's Foundation commits *code-only* (e6923d3..2e88078) onto the integration branch in order.** Per Erik's 2026-05-04 directive ("merge the code in, update the approach/plan ourselves; don't merge plan/approach files like code"): each cherry-pick gets the tracker files (Plan.md, OrientationMap files, refactor-log) restored to their pre-cherry-pick state, leaving only code changes. Pranav's tracker edits are preserved in Branch A's git history as the input to Step 5's "compare what we checked off vs what was checked off" comparison; we just don't carry them forward as merged commits.
3. **Skip `685b501` from Branch A.** Document the skip in the chunk-3-prep commit message. Reason verified main-context: 685b501's diff is byte-identical baseline restoration of `api_*.js`, mislabeled "implement"; replaced by Chunk 3's port from Branch B's spec-correct logic.
4. **Port Branch B's PDF-spec-correct route handlers into Branch A's `routes/` structure**, consuming the lib's `services.photoapp.*` instead of `helper.js`. This is reconciliation work, not raw cherry-pick — it requires writing/editing route handlers that:
   - Live at `projects/project02/server/routes/_internal/<handler>.js` (or wherever Branch A's structure puts them)
   - Use spec-correct paths (`POST /image/:userid`, `GET /image_labels/:assetid`, `GET /images_with_label/:label`, etc.)
   - Consume `services.photoapp.uploadImage / downloadImage / etc.` from the lib
   - Use the validate middleware + error middleware factory for 400s + sentinel errors
   - Resolve the bucketkey-shape divergence in favor of the lib's pattern (`${username}/${uuidv4()}-${localname}` per `lib/photoapp-server/src/services/photoapp.js`)
5. Cherry-pick Branch B's Python client commits **code-only** (`acc4063` + `e3d9a58`). These should be conflict-free — they touch `projects/project02/client/` which Branch A didn't.
6. Run the full verification battery (Step 4 of the quest) including lab spin-up sub-frame.
7. **Step 5 reconciliation owns tracker authoring.** Update Plan + Map atomically against on-disk reality from the merged work, not by merging contributor tracker claims. Pranav's tracker claims (visible at `git show 685b501:projects/project02/client/MetaFiles/Approach/Plan.md`) are consulted as one input to a "what we checked off vs what was checked off" comparison; the on-disk file state at the integration branch is the authoritative truth.
8. Author the missing route tests (the Foundation pyramid was scaffolded but route-specific tests didn't ship in either branch — they need to land here for the merge to be acceptable).
9. Single `--no-ff` merge of `merge/collab-reconciliation` → `main`.

**State verifications (2026-05-04 main-context, before Step 3 entry):**

- ✅ **`app.js` at `2e88078` (last Foundation commit before 685b501): 57 lines; NO `/v1/*` routes mounted.** Only `/healthz` + `/readyz` + 404 + error middleware. The Foundation cherry-picks land a clean app.js with **no route-spec drift inherited**; routes come purely via Chunk 3's port from Branch B's spec-correct logic. Ideal handoff — no un-mounting required.
- 🟡 **AWS lab status: NOT healthy.** `utils/smoke-test-aws --mode live` returns 3/10 PASS as of 2026-05-04 (RDS missing, S3 ACLs absent, security group inbound rule missing). Erik's "I just got the lab unblocked (I think)" 2026-05-04 was hopeful; verification confirms the unblock didn't translate to actual `terraform apply`. **Lab spin-up via `utils/lab-up` is the Step 4 sub-frame trigger** (Chunk 6); non-blocking for Chunks 1–5 which are code-only / docker-compose / unit-test work. If `utils/lab-up` fails when invoked → drop into troubleshooting sub-frame per Erik directive, do NOT proceed to push-readiness with lab gates unresolved.

### Chunking plan (input to Step 3 execution)

The cherry-pick mechanic per Chunks 1, 5 (code-only filter pattern):

```sh
git cherry-pick --no-commit <orig-sha>
# Restore tracker / approach / plan / map / refactor-log files to their pre-cherry-pick state
git restore --staged --worktree \
  projects/project02/client/MetaFiles/Approach/Plan.md \
  projects/project02/legacy_PlanningOrientationMap.md \
  projects/project02/MetaFiles/refactor-log.md \
  projects/project01/Part03/MetaFiles/refactor-log.md
# Commit code-only delta with a message that references the original commit + flags the deferral
git commit -m "..."
```

| # | Chunk | Test gate at chunk close |
|---|---|---|
| 1 | Create `merge/collab-reconciliation` from `main`; cherry-pick A's Foundation commits **code-only** in order (e6923d3 → 6347c95 → 78fb7db → 7a5131c → 5581051 → 2e88078) per the mechanic above. Watch for Plan.md rename conflicts (predecessor renamed to `legacy_PlanningOrientationMap.md` in commit `dddd713`; git rename-following SHOULD handle, but if it doesn't, treat as expected friction and resolve via the restore step). | `npm test --workspaces` green; `cd projects/project02/server && npm test` green (Pranav's pyramid: 64 passed / 13 skipped per Step 2 verification); `npm install` clean; `utils/lib-symlink-check` clean |
| 2 | **Skip A's `685b501`.** Documented in Chunk 3's commit message body (no separate empty commit). | (no test change; skip == omission documented in Chunk 3's commit) |
| 3 | Port B's route handlers into A's `routes/_internal/` structure, consuming the lib + middleware factories + validate. Resolve bucketkey-shape to lib's pattern. Author route-specific tests (unit + integration via `aws-sdk-client-mock` — lab not required for either layer). | `npm test` green at workspace; route-handler tests green; OpenAPI contract tests green; lib regression check green (104/104 carries from Chunk 1) |
| 4 | Cherry-pick B's Python client commits **code-only** (`acc4063` + `e3d9a58`). Adjust if needed for the routes' new shapes. | **Test gate split by lab availability:** (a) syntactic — `cd projects/project02/client && python -c "import photoapp; import tests"` succeeds (no import / parse errors); (b) integration tests — `pytest -m "not live"` deferred to Chunk 6, because B's tests are integration-shaped (require running server via docker-compose OR the actual AWS lab). The minimum syntactic gate at Chunk 4 close validates the cherry-pick landed cleanly; the integration gate folds into Chunk 6's full E2E. |
| 5 | Final consolidation pass: ensure no duplicate dependencies, lockfile clean, `app.js` mount order correct (404 fallback after `/v1/*` mounts; error middleware last), all Plan/Map references updated as part of Step 5 reconciliation. | `npm test --workspaces`; `utils/freshclone-smoke`; `docker build` per Phase 1.10 if applicable; lockfile rebuild if conflicts surface (`rm -rf node_modules package-lock.json && npm install` per CONTRIBUTING.md) |
| 6 | Step 4 of the quest — full E2E verification including `utils/lab-up` sub-frame. **Lab is currently DOWN per Step-3-prep verification 2026-05-04** (3/10 smoke-test-aws PASS); spin-up is non-optional for Chunk 6. If `utils/lab-up` fails (terraform apply errors / IAM gates / billing) → drop into troubleshooting sub-frame per Erik directive; do NOT proceed to push-readiness with lab gates unresolved. Once lab healthy, run: `PHOTOAPP_RUN_LIVE_TESTS=1 cd projects/project01/Part03 && npm test`; `PHOTOAPP_RUN_LIVE_TESTS=1 cd projects/project02/server && npm test`; `cd projects/project02/client && pytest` (full battery including B's integration tests deferred from Chunk 4); `utils/smoke-test-aws --mode live` 10/10. | All Step 4 gates per `MergeOrientationMap.md` Step 4 checklist; lab healthy at 10/10 |
| **6.5** | **🛑 PAUSE — Erik checkpoint before Chunk 7 (Mermaid-checkpoint-pattern, Choice 1)**. Print to chat: (a) test results across all Chunk 6 gates (workspace tests / freshclone-smoke / docker build / live regression both branches / pytest full battery / smoke-test-aws 10/10); (b) lab state confirmation (healthy or troubleshooting outcome); (c) diff summary — file-level changes since main's d2e039c (this is the "what actually landed" picture); (d) anything surprising surfaced during full E2E that wasn't in the chunking plan; (e) memory candidates accumulated (the 4 in the retrospective + any new ones from Chunk 6); (f) tracker state — currently "stale" (Pranav's tracker edits NOT in tree per code-only filter); about to be authored fresh in Chunk 7. **Hold for Erik greenlight before Chunk 7 entry.** Why: trackers are durable; verifying the on-disk reality (which IS the input to Chunk 7's authoring) before authoring is exactly the verification-as-its-own-work pattern Erik validated 2026-05-04. | Erik greenlight on the print summary; OR redirect / additional verification as needed before Chunk 7 |
| 7 | Step 5 reconciliation pass on Plan + Map. **Authoring tracker entries from scratch** against on-disk evidence per Erik's "merge the code, then update approach/plan ourselves" directive. Consult Pranav's tracker claims at `git show 685b501:projects/project02/client/MetaFiles/Approach/Plan.md` as one input + cite divergences in the comparison file's "what we checked off vs what was checked off" thread (Step 6 process retro material). | atomic substep updates land; `MergeOrientationMap.md` reflects on-the-ground reality; Plan.md Phase 1 Master Tracker checkboxes routed (✅ for verified-landed, 🌗 for partial, 📋 for queued, ⏭️ for skipped-with-reason) |
| 8 | Steps 6–8 of the quest (review writing if anything new surfaced; push-readiness; merge to main) | full push-readiness battery (workspace tests green; freshclone-smoke green; docker build green; cred-sweep delta clean; working tree clean) |

### Why not sequential merge

If we merged A first then B onto `main`:
- B's `package.json` / `app.js` / `package-lock.json` changes would conflict with A's. Conflict resolution would be manual at the file level, with no clear "which version wins" guidance baked into the merge — Step 3 chunking handles this explicitly via the curate matrix above instead.
- Branch A's `685b501` would land on `main` as part of A's merge, requiring a follow-up revert + re-implementation before B's better routes go in. That's strictly more work than just not cherry-picking `685b501` in the first place.

### Why not discard one

Both branches contain real value the other lacks. Discarding either ships an incomplete merge.

---

## Outstanding risks for the merge

| Risk | Severity | Mitigation |
|---|---|---|
| **Bucketkey-shape divergence** — B's `uuidv4()+ext` vs lib's `${username}/${uuid}-${localname}` (Reviewer B 🚩) | Wire-contract regression risk if not resolved before live regression | Resolve in Chunk 3 by using the lib's `services.photoapp.uploadImage()` directly rather than reimplementing bucketkey logic in route handlers. Verified by adding/extending an integration test that asserts bucketkey shape matches the lib's pattern. |
| **Route paths still need verification against PDF spec** | All routes must match the spec at merge time | Chunk 3 includes contract tests against the OpenAPI yaml (Branch A's contract); contract test failure → resolve route path before progressing to Chunk 4. |
| **No route-specific tests existed in either branch** | Acceptance gate for Phase 2 (60/60) requires route coverage | Author route tests during Chunk 3, not deferred. The Foundation pyramid scaffolds the layer (test directories exist); route-handler tests are the next-deepest cell. |
| **`helper.js` removal may surface other consumers** | Latent refactor risk | Grep for `require.*helper` after Chunks 1–3 land; if anything else in `projects/project02/server/` imports `helper.js`, surface as an additional finding before Chunk 4. |
| **Lockfile churn in Chunks 1 + 4** | Conflict surface | Run `rm -rf node_modules && npm install` from monorepo root after Chunks 1, 3, and 5; let npm reconcile the lockfile fresh. (Documented in `CONTRIBUTING.md` lockfile-survival section.) |
| **Plan/Map stale reflects Phase 0; says nothing about collaborator work** | Step 5 reconciliation work | Step 5's atomic substep updates are designed exactly for this case — flip Phase 1 sub-phase checkboxes against Branch A's actual landed work; flag any inversions. |
| **Reviewer A's original `_assignment-template/` attribution was wrong** (corrected in-place 2026-05-04) | Already mitigated | Verified via `git ls-tree d2e039c projects/project02/server/`; the substance of the finding stands; attribution corrected. Documented at the top of Branch A's review file. |

---

## Summary for Erik

The two branches are **complementary, not competing**. The right merge keeps **A's Foundation** (genuinely A-grade Phase 1 work — middleware factories, observability, pool/breakers, OpenAPI, full test pyramid, Terraform modules, docker-compose), **drops A's `685b501`** (a baseline-restore mislabeled as "implement" — verified by git ls-tree), **ports B's PDF-spec-correct route logic** into A's `routes/` structure with lib consumption (the curation step that makes this strategy more work than a raw merge but the right merge), **takes B's Python client work** (Phase 3 territory; clean addition), and **resolves the bucketkey divergence** using the lib's canonical pattern.

This lands Phase 1 ✅ + Phase 2 ~partial ✅ + Phase 3 partial ✅ — the most progress any single commit chain on `main` could achieve from these two branches' content.

**Greenlight on this strategy → I proceed to Step 3 execution per the chunking plan above.**
