# Branch Artifact Sweep — what's worth learning from the collaborator branches

**Date:** 2026-05-04 (autonomous run while Erik stepped away)
**Reviewer:** Claude (Opus 4.7, 1M context)
**Scope:** `feat/p02-foundation` @ `685b501` (pranavvaranasi1254) + `feat/p02-gradescope-mvp` @ `e3d9a58` (andrew-apple). Both fresh-agent work — not derived from external sources, not copied from another team's repo. Whatever patterns surfaced here came from these specific agents engaging with this specific Approach + codebase.
**Treatment depth (per Erik 2026-05-04 Q4):** Deep. Looking past "what they did" to "what *style* / *protocol* / *defensive choice* did they show that's worth amplifying or formalizing."
**Output of this sweep:** durable record of patterns + recommendations for which to amplify, formalize as project conventions, or feed into memory / system-plane. Not a re-review of the work itself — that's in `2026-05-04-{feat-p02-foundation,feat-p02-gradescope-mvp}-review.md`.

---

## Why this sweep matters

The catch-and-merge curation focused on **integrating the right code** — Pranav's Foundation + Andrew's PDF-spec route logic. What didn't get the same attention: the **adjacent artifacts** each agent produced (READMEs, MetaFiles, naming conventions, comment styles, test design defaults, deferral-tracking surfaces). Two fresh agents, working on the same Approach against the same codebase, produced *visibly different working styles*. The system-first framing pattern (`feedback_system_first_framing.md`) says: **deviation is data about the system, not just the executor**. Same logic applies to *novel patterns* — when an agent does something well that the system didn't explicitly prescribe, that's a candidate for formalization.

This sweep captures the patterns. The recommendations section names which to promote, queue, or skip.

---

## Pranav's distinctive patterns (`feat/p02-foundation`)

10 patterns surfaced; ordered by leverage (most amplifiable first).

### 1. Tooling modernity defaults

**What:** ESLint v9 flat config (`eslint.config.js`, not legacy `.eslintrc.cjs`); Node 24 in `.nvmrc` (caught + corrected the Approach's stale `20.11.1`); `node --watch` instead of nodemon; commitlint + lint-staged + scripts kit; `@eslint/js` + `globals` packages with explicit version pins.

**Why it's signal:** the Approach was authored before some of these became canonical. Pranav didn't accept the Approach's tooling choices as given — he detected staleness during the first lint run (deprecation message) and updated. **Pattern: when documented tooling fails, update both the tooling AND flag the Approach for revision.**

**Evidence:**
- Per-branch refactor-log entry (sub-phase 1.9 closeout): "ESLint v9.0.0 default config is now eslint.config.js. Rewrote as flat config." + ".nvmrc set to 24. The Approach text should be revised next time the Approach is touched; flagging here for future passes."
- Built-in Node 24 `--watch` replaces nodemon in `package.json` scripts — saves a transitive dep + the nodemon.json config surface.

**Recommendation:** **Amplify.** Add to project conventions: "tooling defaults should match what the local environment + downstream actually run; if the Approach prescribes something that conflicts with current canonical practice, update the tooling and flag the Approach update in your refactor-log entry." Maps to the system-first-framing pattern.

### 2. Per-branch refactor-log with numbered decisions + Optional Steps routing per sub-phase

**What:** Pranav authored a per-branch `projects/project02/client/MetaFiles/refactor-log.md` (different path from the project02-level one I created during catch-and-merge). Each sub-phase closeout has structure: Outcome / numbered Decisions (1, 2, 3, ...) / Optional Steps routing (✅/📋/⏭️) / Push posture.

**Why it's signal:** the structure itself is the signal. Numbered decisions force separation; "Optional Steps routing per sub-phase" is the Plan-level Optional Steps Registry mechanic *applied at workstream-pickup granularity*. A reader can skim the numbered decisions in 30 seconds + reach for a specific one without parsing prose.

**Evidence:** Pranav's sub-phase 1.0 closeout has 5 numbered decisions; sub-phase 1.9 has 7 numbered decisions including "Husky wire-up deferred" with a 100-word rationale + future-action template (`npx husky init && ...`). Sub-phase 1.5–1.11 closeout has Optional Steps routing for each item with rationale.

**Recommendation:** **Formalize as project convention.** This shape should land in the `feedback_atomic_substep_updates.md` family or as a new `feedback_refactor_log_structure.md`. The "numbered decisions + per-sub-phase Optional Steps routing" is reusable across any quest. Worth a memory candidate post-quest.

### 3. README with library wiring diagram (ASCII tree)

**What:** `projects/project02/server/README.md` includes a code-block ASCII tree showing the lib's public exports, organized by area:

```
@mbai460/photoapp-server (1.0.0)
├── config        — INI-driven configuration loader
├── services
│   ├── photoapp  — getPing / getUsers / getImages / ...
│   └── aws       — getBucket / getRekognition / getDbConn
├── repositories  — SQL access
├── middleware
│   ├── createErrorMiddleware({ statusCodeMap, errorShapeFor, logger })
│   └── createUploadMiddleware({ destDir, sizeLimit })
└── schemas
    └── envelopes.successResponse(data) / errorResponse(err)
```

**Why it's signal:** the wiring diagram makes the "consume this, not that" decision visible. A reader knows in 5 seconds where to look for any concern. Compare to the lib's own README which has the same content in prose — Pranav's tree is denser + faster to scan.

**Recommendation:** **Amplify in lib README.** The same tree shape would be a strong addition to `lib/photoapp-server/README.md`'s top section. Worth a follow-up when next touching the lib README.

### 4. `_assignment-template/README.md` — preserved-reference pattern

**What:** When Pranav moved the instructor-baseline `api_*.js` files from `projects/project02/server/` to `projects/project02/server/_assignment-template/`, he authored a README explaining: *why they live here* (rebuilding tree as lib consumer; flat layout incompatible with layered architecture) + *reference value* (documents wire contract Gradescope expects) + *do not import from this directory* (read-only) + *lifecycle* (deletes after Phase 2 Gradescope acceptance).

**Why it's signal:** "preserved reference, not source reuse" is a real architectural distinction that's easy to miss. Without the README, the next contributor sees `_assignment-template/api_*.js` and assumes either (a) it's live OR (b) it's leftover dead code to delete. The README captures the third option (intentionally preserved + lifecycle-bound).

**Recommendation:** **Formalize as project convention.** When moving files for architectural reasons, write the explanation README same-commit. The Approach's CL9 reconciliation discipline (Phase 0) is the same shape at a different scale. Worth a `feedback_preserved_reference_pattern.md` memory candidate.

### 5. Multi-project Jest config + Makefile target alignment

**What:** `projects/project02/server/jest.config.js` defines 6 named projects (unit / integration / contract / smoke / happy / live), each independently runnable. `package.json` scripts (`test:unit`, `test:integration`, etc.) match. `projects/project02/Makefile` targets (`test-unit`, `test-integration`, ...) call those scripts. **Three-layer alignment** — config / scripts / Makefile — names match exactly.

**Why it's signal:** when a contributor wants to run "just integration tests," they don't need to learn which level of abstraction owns the entry point. Any of the three works + maps consistently.

**Recommendation:** **Adopt as project convention.** This three-layer-alignment pattern should land in `CONTRIBUTING.md` for any future workspace that adds tests. Especially for the Project 02 client (Phase 3) — the Makefile already has `test-client` placeholder; aligning pytest's `-m` markers with the same names would extend the convention.

### 6. Visible-stubs Makefile pattern

**What:** Pranav's Makefile targets that aren't yet implemented (e.g., `make submit-server`, `make submit-client`) print a "wired in Approach Phase X" message and exit 1 — instead of silent missing-file errors.

**Why it's signal:** a contributor running `make submit-server` today gets "this lands in Phase 9; see Approach/02-web-service.md" instead of "command not found" or "no such target." Prevents folklore-where's-this-from confusion.

**Recommendation:** **Adopt as project convention.** Place stubs that lazily error are objectively better than missing targets. Could become a Makefile-target hygiene rule.

### 7. CL9 library-touching protocol applied opportunistically

**What:** Mid-Foundation work, Pranav surfaced that the lib's `successResponse(data)` shape didn't match Project 02's per-route variadic envelopes. Rather than rebuilding the envelope helper in Project 02, he made a **CL9 bounded library change** (variadic `successResponse({...extras})` + Part 03 callsite updates `successResponse(data) → successResponse({data})` in one commit) — exactly per Phase 0's CL9 reconciliation discipline.

**Why it's signal:** the Phase 0 CL9 protocol was authored for the library extraction itself; Pranav recognized the *same shape applies to forward library evolution* and invoked it without explicit instruction.

**Recommendation:** **Amplify.** This is the protocol-internalized-and-applied pattern — `feedback_system_first_framing.md` cousin. Pattern worth surfacing in the lib's README + the Plan's CL9 references explicitly: "CL9 isn't just for Phase 0 extraction; it applies to every consumer-driven library change."

### 8. Approach-doc-anomaly detection (system-first framing in action)

**What:** During sub-phase 1.9, Pranav detected the Approach's `.nvmrc` value (`20.11.1`) was stale relative to current main (Node 24 enforced via `engine-strict=true`). Refactor-log entry: "*The Approach text should be revised next time the Approach is touched; flagging here for future passes.*"

**Why it's signal:** he didn't just fix the issue locally + move on — he flagged the system gap (stale Approach text) for follow-up. **Treats the Approach as code that drifts**; a deviation between Approach + codebase reality is data about which to update.

**Recommendation:** **Already aligned with `feedback_system_first_framing.md`.** Pranav's behavior validates that memory at a second instance (we already promoted the memory based on tracker-discipline + Optional-Steps engagement). Pattern reinforced.

### 9. Mermaid visualization with explicit color conventions

**What:** `visualizations/Target-State-project02-foundation-consumer-bootstrap-v1.md` uses gray for the lib boundary, amber for DI seams, green for Project 02 net-new files. Forward-references (sub-phases 1.3–1.7) rendered dashed.

**Why it's signal:** color conventions encode domain semantics. A reader unfamiliar with the codebase can see "the gray box is what we don't touch; the green is what we author; the dashed lines are forward-looking."

**Recommendation:** **Adopt as visualization convention.** The pattern (gray=external/frozen / amber=DI-seam / green=net-new / dashed=forward-ref) should land in `feedback_visualization_naming.md` or a sibling memory.

### 10. Refactor-log decisions cite specific lines + commits

**What:** Pranav's refactor-log decisions consistently include `(filename:line `commit`)` citations. Allows a future reader to verify the claim against the actual code.

**Why it's signal:** matches `feedback_read_before_locking.md` discipline at the *authoring* of decision records. Citation precision is reviewer-friendly.

**Recommendation:** **Already aligned with existing memory.** Reinforces the pattern.

---

## Andrew's distinctive patterns (`feat/p02-gradescope-mvp`)

9 patterns surfaced; same ordering principle.

### 1. `package.json` description as deferred-decisions surface

**What:** Andrew's `projects/project02/server/package.json` description: *"Project 02 Part 01 PhotoApp Node.js/Express web service — Gradescope MVP path. Standalone (does not yet consume @mbai460/photoapp-server; that wiring is Phase 1+ per Plan.md)."*

**Why it's signal:** the description field is usually `"A web service"` or similar marketing text. Andrew used it as a **deferred-decision capture surface** — a future contributor running `cat package.json` learns about both the current scope (MVP) AND the deferred work (lib consumption) in 30 seconds.

**Recommendation:** **Amplify as project convention.** package.json descriptions should encode current scope + known deferrals. Worth a `feedback_descriptive_metadata.md` memory candidate.

### 2. Inner-function naming for retry-wrappable units

**What:** Andrew's handler files name every retry-wrappable unit explicitly: `validate_user()`, `insert_with_transaction()`, `clear_db()`, `try_get_labels()`, `try_search()`, `try_get_images()`. Each is then wrapped with `pRetry(() => fn(), {retries: 2})`.

**Why it's signal:** **clarity-via-naming** for *where retry happens*. The inner function names function as a docstring at the retry boundary — a reader sees `pRetry(() => validate_user())` and knows the retry scope is *just user validation*, not the entire request.

**Recommendation:** **Adopt as code convention.** The pattern (named inner-function for each retry boundary) should land in `CONTRIBUTING.md` § code-style or as a `feedback_retry_naming_pattern.md` memory.

### 3. PDF citations in commit body

**What:** Andrew's commits cite the PDF spec by quote: e.g., "*PDF: 'with Node.js's mysql library, you need to use the query() function — not the execute() function'*" in commit `8045533`'s body.

**Why it's signal:** mechanical link from code change → spec. Survives review years from now without external context. The reviewer doesn't need to context-switch to "is this what the spec asked for?" — the answer is in the commit.

**Recommendation:** **Amplify.** Already noted in the Andrew review's ✨ Strengths (Dim 9, finding #4). Pattern worth `feedback_spec_citation_in_commits.md` candidate. Combines well with Pranav's #10 (citation precision in decision records) — both are about *making claims auditable*.

### 4. test_99 destructive convention

**What:** `projects/project02/client/tests.py:test_99_lifecycle_destructive`:
- Numbered 99 → runs last under unittest's alphabetical ordering
- Docstring explicitly explains the convention + provides the opt-out flag (`-k 'not test_99'`)
- Behavior: clears DB + S3 before exercising the full lifecycle

**Why it's signal:** **defensive documentation prevents future "why did my DB get wiped?" mystery.** A test that wipes the DB is dangerous; making the danger plus the opt-out visible at the docstring is exactly the right design.

**Recommendation:** **Formalize as test design convention.** Destructive tests should: (a) be numbered or named to run last; (b) carry the convention in the docstring; (c) provide the opt-out command. Worth `feedback_destructive_test_convention.md`.

### 5. Atomic spec-correction commits

**What:** Andrew's 7 commits each fix ONE concern: `60f760d` package.json + workspace install / `0aba589` route-shape conformance / `4959c2d` post_image handler / `8045533` delete_images / `d132696` get_image + get_image_labels / `acc4063` Python client / `e3d9a58` tests.py.

**Why it's signal:** atomicity + bisect-friendliness. `git bisect` against a regression in any of these surfaces lands directly on the relevant commit. Compare to a hypothetical "fix several routes" mega-commit that would force the bisect to dig through the diff.

**Recommendation:** **Already aligned with Conventional Commits + atomic-commits discipline.** Reinforces existing convention.

### 6. Test invariant assertions

**What:** `tests.py:99` uses `self.assertGreaterEqual(assetid, 1001)` — captures the AUTO_INCREMENT seed value invariant the branch's `delete_images` fix preserved.

**Why it's signal:** **invariants captured in tests, not just docs.** A test assertion is mechanical; a doc paragraph is honor-system. The next contributor who silently changes the seed value to 1 will see this test fail; the doc paragraph would just go un-read.

**Recommendation:** **Amplify.** Pattern worth promoting: when fixing a bug that depends on a domain invariant (like AUTO_INCREMENT=1001), add a test assertion that locks the invariant explicitly. Distinct from Phase 0's SQL characterization tests — those locked SQL strings; this locks runtime values.

### 7. Spec-conformance renames

**What:** `api_get_images_search.js` → `api_get_images_with_label.js` — filename renamed to mirror the PDF spec's URL path.

**Why it's signal:** filename matches spec URL → grep for the spec route lands directly on the handler. Reduces lookup cost.

**Recommendation:** **Adopt as code convention.** Filenames should mirror their URL paths where possible. Worth a brief mention in `CONTRIBUTING.md`.

### 8. Lightweight input validation (no zod)

**What:** Andrew uses `if (data === undefined || local_filename === undefined)` instead of pulling in zod. Returns directly with PDF-shaped 400 envelope.

**Why it's signal:** **dependency-frugality at the right level.** zod is great for complex schemas; for two-field presence checks, plain JS is faster + cheaper. The MVP path doesn't need zod for trivial validations.

**Recommendation:** **Note as a working-style preference**, not a project convention. Each branch chose differently (Pranav has zod via validate middleware; Andrew has direct checks). Both are valid; Pranav's is more composable for complex schemas; Andrew's is more legible for trivial ones. The merged tree includes both — worth keeping that flexibility in `CONTRIBUTING.md`.

### 9. PDF-quoted rationale in code comments

**What:** Inline comments at decision points cite the PDF: e.g., `// PDF: 'images are not deleted from S3 unless the database is successfully cleared'`. Comments aren't "what this does" but "why this matches the spec."

**Why it's signal:** comment style aligned with spec, not implementation. Survives refactors — the *what* is in the code; the *why* is in the comment.

**Recommendation:** **Amplify.** Combines with #3 (PDF citations in commits). Worth a `feedback_spec_quoted_rationale.md` memory candidate that covers both.

---

## Cross-branch meta-patterns

Patterns that emerged from comparing both branches against each other.

### A. Convergent goal, divergent surface

Both branches captured deferred decisions / scope notes — but on **different surfaces**:
- Pranav: per-branch refactor-log with numbered decisions (substantial; documentation-first)
- Andrew: package.json description + commit-body PDF citations (lightweight; metadata-as-doc)

**Insight:** the goal (capture deferred decisions durably) is the same; the surface choice reflects working-style preference. **Both are valid.** A team-level convention should accept multiple valid surfaces rather than mandating one. Worth a meta-memory: `feedback_decision_surface_diversity.md` — when prescribing "capture decisions somewhere durable," accept multiple valid surfaces (refactor-log, commit-body, package.json description, README sidebar).

### B. Conventional Commits as default

Both used Conventional Commits scopes consistently, with the project's recommended scope additions (`feat(project02)`, `feat(p02-server)`, `fix(p02-server)`, `chore(meta)`, `test(p02-client)`). **Pattern: Conventional Commits is fully internalized in the team's default working style.** Already canonical via `CONTRIBUTING.md`; no action needed beyond noting it as evidence of doc-effectiveness.

### C. Co-Authored-By trailer hygiene

Both branches credit Claude (Sonnet/Opus) on every commit via `Co-Authored-By:` trailer. **Pattern: agent-authorship transparency.** Already canonical via `CONTRIBUTING.md` § Conventional Commits. Reinforces existing convention.

### D. Same start, different reactions to instructor-baseline

Both inherited `projects/project02/server/api_*.js` (instructor template). Different reactions:
- Pranav: **moved** to `_assignment-template/` with explanation README; declared incompatible with new architecture
- Andrew: **operated on in place**; surgical PDF-spec corrections within the existing structure

**Insight:** both reactions are defensible — Pranav's is the architecturally-correct choice (Phase 1 Foundation needs a clean tree); Andrew's is the deadline-correct choice (PDF-spec wire correctness with minimum delta). The merged tree handles both — the architecture is Pranav's, the route-handler logic is Andrew's spec-correct version ported into Pranav's structure.

**Recommendation:** capture this in the process retrospective — the catch-and-merge curate-and-pick succeeded **because** the two reactions were complementary at architectural levels, not in conflict at content levels.

### E. Test-design philosophy diverges along time-budget

- Pranav: full Jest 6-layer pyramid (every layer scaffolded; 64 tests + 13 skipped placeholders)
- Andrew: tests.py extension (3 new tests; integration-shaped; no JS unit tests)

**Insight:** both tracked-with-tests. Different time budgets produced different test-design philosophies. Pranav's pyramid is the long-term-correct shape (covers the test-pyramid Approach); Andrew's tests.py extension is the immediate-correct shape (covers exactly what changed). **Neither is wrong; the merge benefits from having both** — Pranav's pyramid scaffolding lets future Phase 2 route tests slot into the right layers; Andrew's tests.py captures invariants that Pranav's pyramid doesn't yet test.

---

## What we lost via curation

Curate-and-pick is lossy by design. The patterns that *didn't* get carried forward into the merged tree:

1. **Andrew's `helper.js`** (parallel-implements lib's services.aws). Dropped — lib provides equivalent. **Loss:** none.
2. **Andrew's `pRetry` shim copy-paste** (across 6 files). Dropped — the merged routes use the lib's services.photoapp.* which has retry handled internally (or doesn't need it for those paths). **Loss:** none for the spec routes; the duplication-pattern itself was a finding worth flagging in Andrew's review (Recommendation #3 in his review file).
3. **Andrew's `derive_kind` helper at top of api_post_image.js** (PHOTO_EXTENSIONS set). Dropped — lib provides equivalent (`schemas.rows.deriveKind` + `schemas.rows.PHOTO_EXTENSIONS`). **Loss:** none; the lib export is canonical.
4. **Pranav's `685b501` route restoration**. Skipped per Chunk 2. **Loss:** none — was baseline-restore mislabeled; substantively replaced by Chunk 3 port.
5. **Pranav's per-branch `client/MetaFiles/refactor-log.md`** (the file at the new path; not the project02-level one). Removed via `git rm` per the code-only filter. **Loss:** the per-sub-phase decision narrative. **Mitigation:** reachable via `git show 685b501:projects/project02/client/MetaFiles/refactor-log.md`. Step 7 reconciliation paragraph in `projects/project02/MetaFiles/refactor-log.md` references this for the comparison.

**Net assessment:** the lossy parts are *intended* losses (duplication / mislabeled / superseded) — not value loss. The narrative-record loss is mitigated by git history.

---

## Recommendations summary (ordered by leverage)

| # | Recommendation | Source | Action |
|---|---|---|---|
| 1 | **Three-layer alignment** (Jest config / npm scripts / Makefile targets) — names match across all three | Pranav #5 | Adopt as project convention; add to CONTRIBUTING.md |
| 2 | **Per-sub-phase Optional Steps routing** in refactor-log entries — ✅/📋/⏭️ per item with rationale | Pranav #2 | Memory candidate: `feedback_refactor_log_structure.md` |
| 3 | **Inner-function naming for retry-wrappable units** — clarity-via-naming for retry boundaries | Andrew #2 | Memory candidate: `feedback_retry_naming_pattern.md` |
| 4 | **PDF/spec quotes in commit bodies + code comments** — make spec-claims auditable | Andrew #3 + #9 | Memory candidate: `feedback_spec_citation_pattern.md` |
| 5 | **Visible-stubs Makefile pattern** — stubs print "wired in Phase X" + exit 1 | Pranav #6 | Adopt as Makefile convention; add to CONTRIBUTING.md if Makefiles proliferate |
| 6 | **Preserved-reference pattern** — when moving files for architectural reasons, write explanatory README same-commit | Pranav #4 | Memory candidate: `feedback_preserved_reference_pattern.md` |
| 7 | **Destructive test convention** — name/number to run last + docstring opt-out | Andrew #4 | Memory candidate: `feedback_destructive_test_convention.md` |
| 8 | **Test invariant assertions** — capture domain invariants in test assertions, not just docs | Andrew #6 | Memory candidate: `feedback_invariant_test_assertions.md` |
| 9 | **`package.json` description as deferred-decisions surface** | Andrew #1 | Memory candidate: `feedback_descriptive_metadata.md` |
| 10 | **Mermaid color conventions** — gray=external/frozen / amber=DI-seam / green=net-new / dashed=forward-ref | Pranav #9 | Add to existing `feedback_visualization_naming.md` |
| 11 | **CL9 protocol applies to forward library evolution** (not just Phase 0 extraction) | Pranav #7 | Add to lib README + Plan's CL9 references |
| 12 | **Tooling modernity defaults** — when Approach prescribes outdated tooling, update + flag | Pranav #1 | Already aligned with `feedback_system_first_framing.md` (validates pattern) |
| 13 | **Decision-surface diversity acceptance** — multiple valid surfaces for capturing deferred decisions | Cross-branch A | Memory candidate: `feedback_decision_surface_diversity.md` |
| 14 | **Filename mirrors URL path** for route handlers — reduces lookup cost | Andrew #7 | Add to CONTRIBUTING.md § code-style |
| 15 | **Lib README wiring diagram** — ASCII tree for public exports | Pranav #3 | Update lib README (next library-touching pass) |

---

## Memory promotion candidates from this sweep

The recommendations above include 8 candidates for new memory files. Per `feedback_memory_discipline.md`'s "earn the durability" principle, these need 2-3 more validations before formal promotion. Marking them in the catch-and-merge process retrospective for accumulating evidence:

1. `feedback_refactor_log_structure.md` — Pranav's per-sub-phase decision shape (Pattern #2)
2. `feedback_retry_naming_pattern.md` — Andrew's inner-function discipline (Pattern A.2)
3. `feedback_spec_citation_pattern.md` — Andrew's PDF citations in commits + comments (combines A.3 + A.9)
4. `feedback_preserved_reference_pattern.md` — Pranav's `_assignment-template/README` move-with-explanation (Pattern P.4)
5. `feedback_destructive_test_convention.md` — Andrew's test_99 docstring + opt-out (Pattern A.4)
6. `feedback_invariant_test_assertions.md` — Andrew's `assertGreaterEqual(assetid, 1001)` (Pattern A.6)
7. `feedback_descriptive_metadata.md` — Andrew's package.json description as deferred-decisions surface (Pattern A.1)
8. `feedback_decision_surface_diversity.md` — Cross-branch divergent-surfaces-for-same-goal (Pattern X.A)

Adding all 8 as memory candidates is heavy; I'd lean toward queuing them in `claude-workspace/memory/_candidates/` (or equivalent) for accumulation rather than promoting in this sweep's commit. Erik's call.

---

## What this sweep doesn't cover

- **The work itself** — covered in `2026-05-04-{feat-p02-foundation,feat-p02-gradescope-mvp}-review.md`
- **The merge strategy** — covered in `2026-05-04-merge-comparison.md`
- **Process retrospective findings** — covered in `2026-05-04-process-retrospective.md`

This sweep is **adjacent-artifact** focused: what each agent built that wasn't core code. The artifacts are durable; the patterns are extractable; the recommendations are actionable.

---

## Cross-references

- `2026-05-04-feat-p02-foundation-review.md` — per-branch review (graded) of Pranav's work
- `2026-05-04-feat-p02-gradescope-mvp-review.md` — per-branch review of Andrew's work
- `2026-05-04-merge-comparison.md` — branch comparison + curate-and-pick strategy
- `2026-05-04-process-retrospective.md` — process retro on parallel-collaboration
- `00-assessment-criteria.md` — assessment contract (for the per-branch reviews)
