# Class Project — ActionQueue

## Active

- [x] **[Tooling] utils/ path fix** — all bash wrapper scripts use CWD-relative or wrong-depth REPO_ROOT paths; broken for standalone repo clones and non-root CWDs. Target: runnable from any directory. Scripts affected:
  - `utils/docker-status` — CWD check `./MBAi460-Group1/docker` fails outside lab repo root
  - `utils/docker-up` — same CWD check + hardcoded `./MBAi460-Group1/docker/run` paths in output
  - `utils/docker-down` — same CWD check
  - `utils/run-sql` — REPO_ROOT two levels up + `MBAi460-Group1/` prefix + SQL file path validation against REPO_ROOT
  - `utils/validate-db` — REPO_ROOT + `MBAi460-Group1/` Docker invocation (works for Erik only via lab repo layout)
  - `utils/smoke-test-aws` — REPO_ROOT + `claude-workspace/secrets/` credential path (works for Erik only)
  - `utils/aws-inventory` — same credential path issue as smoke-test-aws
  - `utils/Erik-AWS-Scan` — ✅ no path issues; uses explicit `--profile` flags; personal-use only

- [x] **[Tooling] Validate utils/ path fix plan** — CLOSED 2026-04-25: all 7 scripts verified using correct `SCRIPT_DIR`/`CLASS_ROOT` pattern. Stale plan file deleted. (1B structural audit, 2026-04-24)

- [x] **[Security] Reset photoapp users + passwords** — `photoapp-read-only` (abc123!!) and `photoapp-read-write` (def456!!) passwords were briefly exposed in initial commit before history rewrite; rotate both in RDS + update local `infra/config/photoapp-config.ini` and `projects/project01/client/photoapp-config.ini` (recreate from `.example` templates)
- [x] **[Hygiene] photoapp-config.ini gitignore gap** — resolved: removed from history via git filter-repo, gitignored, `.example` templates added
- [x] **[Design] PDF tracking policy** — CLOSED 2026-04-23: track all PDFs. Part03 PDF staged and included in commit 745ea05. Both Part02 and Part03 PDFs now tracked. (Phase 2 Audit: S2A-7/S2D-5)
- [ ] **[Design] VCS strategy** — branching model, what gets committed, tfstate remote backend, multi-collaborator gitignore policy (see Lab-root MetaFiles/TODO.md)
- [x] **[Tuning] IAM diagram mismatch** — CLOSED 2026-04-20: `lab01-iam-design-v1.md` updated — Claude-Conjurer now shows PowerUserAccess, Mermaid diagram fixed, README updated.
- [ ] **[Security/IAM] Consider upgrading Claude-Conjurer permissions for IAM creation** — currently PowerUserAccess (no IAM); blocked `terraform apply` for IAM resources; options: add scoped `iam:CreateUser/Policy/AttachUserPolicy` permissions, or keep IAM as Erik-only human gate (current pattern). Decide before next IAM-touching Terraform work.
- [x] **[IaC] main.tf AWS profile hardcoded to ErikTheWizard** — CLOSED 2026-04-23: added `variable "aws_profile"` (default `"Claude-Conjurer"`) in variables.tf; main.tf now uses `profile = var.aws_profile`. Override via `terraform.tfvars` or `TF_VAR_aws_profile`. (A3)
- [x] **[Tooling] Credential path gap in utils/** — CLOSED 2026-04-23: `smoke-test-aws` and `aws-inventory` already use `${CLASS_ROOT}/secrets/` (correct for standalone). `AWS_PROFILE` hardcoding fixed to `${AWS_PROFILE:-Claude-Conjurer}` in both scripts — collaborators can `export AWS_PROFILE=theirprofile` before running, or name their profile `Claude-Conjurer`. QUICKSTART.md documents the setup. (A4)

- [x] **[Blocker/Docs] README.md absolute path** — CLOSED 2026-04-23: replaced personal absolute path with `MBAi460-Group1/`. (Phase 1B: B1)
- [x] **[Blocker/Docs] README.md broken orientation link** — CLOSED 2026-04-23: removed `../MetaFiles/orientation.md` reference; added in-repo links + QUICKSTART.md pointer. (Phase 1B: B2)
- [x] **[Risk/Security] Committed passwords in visualizations** — CLOSED 2026-04-23: assessed as historic (original schema passwords, rotated 2026-04-20); annotation added to `visualizations/lab-database-schema-v2.md` changing "grader-checked" label to "original — rotated 2026-04-20". No scrubbing required. (Phase 1B: T3/B4)
- [ ] **[Risk/Security] Committed passwords in project03 SQL** — `projects/project03/create-authsvc.sql` and `create-chatapp.sql` contain hardcoded `abc123!!` / `def456!!` passwords; class-provided but committed. Assess same as B4. (Phase 1B: B5)

- [ ] **[Security] Scan for potentially exposed credentials (17 hits found by cred-sweep util); also consider refreshing the util itself** — `utils/cred-sweep` flagged 17 hits for `abc123!!` / `def456!!` patterns during 2026-04-27 pre-push hygiene (Project 01 Part 03 MVP closeout). None introduced by recent commits (verified via `git diff origin/main..HEAD` → empty). Hits cluster as: (a) course-mandated content (Lab 01 Requirements/Steps, project03 SQL — class-provided, not removable), (b) historical/triage refs in TODO/security-findings/triage-table docs, (c) visualization annotations marked as rotated, (d) self-reference in `cred-sweep` script's own pattern definition (false positive). Triage each: keep / strikethrough / move to gitignored historical doc / refactor inline. **Also refresh `utils/cred-sweep` itself** — consider (1) allowlist for course-mandated paths + script self-reference, (2) severity tiers (LEAK vs INFO vs ALLOWLISTED) so legitimate course content doesn't drown the signal, (3) markdown-context awareness (downgrade strikethrough / "rotated" annotations from LEAK to INFO), (4) optional `--strict` flag for CI use that fails on LEAK only, (5) **`--delta <ref>` mode for pre-push hygiene** (added 2026-04-27 during sub-B Phase 6 cred-sweep assessment) — currently `cred-sweep` does a state scan (full tracked-content sweep). Pre-push hygiene needs a *delta check* — does the diff between `<ref>` (typically `origin/main`) and HEAD introduce NEW credential patterns? Sub-A + sub-B both used inline `git diff origin/main..HEAD | grep -E '^\+.*abc123|^\+.*def456'` as a fallback (works, but brittle/placeholder per reviewer). Design sketch: add `--delta <ref>` CLI flag; refactor `check()` input source from `git grep -rn --cached -E "$pattern" -- "$scope"` to `git diff <ref>..HEAD -- "$scope" | grep -E '^\+.*'$pattern` (filter to added lines only); exit 0 only if zero added matches. LoE ~50-60 min: CLI flag (~10) + refactor check() per mode (~15-20) + help text (~5) + smoke test (~5) + update `claude-workspace/memory/project_tools_index.md` (~5) + edge cases (~10-15). Catch during a dedicated utils refresh session per Erik 2026-04-27.

- [ ] **[Coordination] Class Project ↔ Lab Root sync sweep** — periodic coordination pass between the lab-root layer and the Class Project. Three-part scope: (1) **Memory + learning propagation** — review `claude-workspace/memory/` and lab-root `MetaFiles/` for content that should surface into Class Project docs/TODOs (and vice versa); (2) **Lab-root `utils/` tracking decision** — relates to the existing "Decide tracking status of lab-root utils/" backlog item — whether `mbai460-client/utils/` should be tracked in the lab repo or explicitly gitignored; (3) **TODO queue drift sync** — drift check between this Class Project queue and the Part 03 queue (`projects/project01/Part03/MetaFiles/TODO.md`); promote/close/relocate items as appropriate. Originally proposed as Outstanding Integrations sub-workstream C 2026-04-27 in `Part03/MetaFiles/OrientationMap.md`; relocated here per Erik's Q3 ruling so it sits as a Class-Project-level concern rather than a Part-03-scoped one.

- [ ] **[Docs/Structure] Create a structure that allows history to be flagged vs active components** — The Class Project now has durable historical planning artifacts, retrospectives, merge maps, and approach docs that intentionally preserve prior architectural states, alongside active docs that should reflect the current architecture. Design and document a lightweight convention for marking files/sections as historical, superseded, active, or current-source-of-truth so future sweeps do not confuse preserved history with stale operational guidance. Apply first to Project 02 shared-library-era docs after Project 01 split direction is clear.

- [ ] **[Project01/Hygiene] Investigate and consolidate SQL artifacts in `projects/project01/`** — `create-photoapp.sql` and `create-photoapp-labels.sql` coexist at project01 root. Investigate whether the labels file should remain split or fold into the main schema; document the relationship (when each is run, by whom, why split). Memory currently references only the main file. (Spin-up env scan, 2026-04-26)

- [ ] **[Project01/Part03] Correctly deprecate Part 02 Python from Part 03 backend** — Part 03 backend committed to Express/Node (2026-04-26 design pivot); Part 02 `projects/project01/client/photoapp.py` is no longer imported at runtime. Decide & execute: (a) keep `client/photoapp.py` as a behavioral reference with a deprecation banner, or (b) move it to a `Reference/` location, or (c) delete it after Part 03 reaches feature parity. Includes review of client config file consumption (Part 03 server reads `photoapp-config.ini` directly via `ini` package). (Express pivot Q2, 2026-04-26)

- [ ] **[Docs] Elaborate purpose of `MBAi460-Group1/learnings/`** — directory exists (last touched 2026-04-24) but is not described in memory, project_overview, or README. Capture: what belongs there, who writes to it, lifecycle, audience. (Spin-up env scan, 2026-04-26)

- [x] **[Hygiene/Onboarding] Disambiguate dual `photoapp-config.ini`** — CLOSED 2026-04-30: surfaced as H2 during a 2026-04-30 troubleshooting probe (collaborator load-failure incident; collaborator self-resolved as PEBAK, but H2 remains structurally real for future onboarding). Two files share the literal filename: `infra/config/photoapp-config.ini` (backbone, `photoapp-read-only`, consumed by `validate-db` / `smoke-test-aws` / `run-sql`) and `projects/project01/client/photoapp-config.ini` (client, `photoapp-read-write`, consumed by Part 02 Python client + Part 03 Express server). Mitigated in same commit via three reinforcing layers: (1) callout + verification `ls` in QUICKSTART step 5 after the cp commands; (2) `NOTE` header in both `.example` templates naming role + pointing at the sibling file; (3) this entry. Architectural alternatives (consolidate to single file; rename one file) deferred — high blast radius vs zero confirmed instances of the failure mode in practice.

- [ ] **[Tooling] `aws-probe` may have a bug when humans run it causing it to hang** — Erik observed this 2026-05-04 ("the smoke test appears to be hanging but I'm giving it some time"). Investigation: smoke-test-aws (which aws-probe delegates to) had no `--cli-connect-timeout` / `--cli-read-timeout` flags on its aws-cli calls; when CLI auth chain failed, individual calls retry-hung for 30+s each → cumulative hang of minutes. Fixed via commits (this session) — added `AWS_TIMEOUT="--cli-connect-timeout 10 --cli-read-timeout 30"` to smoke-test-aws's 5 aws calls. **Self-test from agent session post-fix: probe completes in ~15s (auto-detects ErikTheWizard profile from ~/.aws/config; smoke 8/10 PASS).** **Erik to verify** in his terminal that the hang is gone after the fix. If it still hangs in his shell, the issue is elsewhere (network / SSO refresh / a check we missed); reopen with output paste. (Catch-and-Merge AWS sub-frame, 2026-05-04)
- [ ] **[Tooling] `_run_sql.py` parser splits on `;` before comment-stripping** — Surfaced 2026-05-04 during catch-and-merge AWS sub-frame. Naïve `sql.split(";")` at `utils/_run_sql.py:70` doesn't respect comment boundaries; an inline `-- comment with ; semicolon` cuts the surrounding statement in half. Hit in `create-photoapp.sql:36` ENUM-comment; worked around by replacing the comment's `;` with `,` (commit `b2436ca`). Long-term fix: strip single-line `--` comments from each statement before splitting, OR use a proper SQL splitter library. Small patch (~15 lines); has no production urgency now that the offending SQL is fixed, but next SQL file with `;-in-comment` will hit the same trap. (Catch-and-Merge AWS sub-frame, 2026-05-04)
- [ ] **[Sample data] `s3://photoapp-erik-mbai460/test/degu.jpg` missing** — Surfaced 2026-05-04. `utils/smoke-test-aws --mode live` checks 4–5 (S3 object ACL has AllUsers READ + cURL public image URL → 200) both fail with 404 because the sample object doesn't exist in the bucket. Non-blocking for catch-and-merge live regression (route tests upload/download their own assets), but means smoke can't reach 10/10 even when the lab is otherwise healthy. Two paths forward: (a) re-upload `test/degu.jpg` with public-read ACL to bring smoke to 10/10, or (b) update smoke-test-aws to skip the sample-object checks when the object is genuinely absent (vs ACL-drifted on existing object). (Catch-and-Merge AWS sub-frame, 2026-05-04)
- [x] **[Test/DB] `validate-db` `assets`-empty assertion drift** — CLOSED 2026-05-05: resolved as a beneficial side effect of Phase 2.10 Step 13's `utils/rebuild-db` invocation (Project 02 Gradescope `kind` column schema-mismatch fix). Took option (b) — re-baselined by DROP+recreating the `assets` table; the 14 mystery rows (provenance never identified) were wiped. `validate-db` now reports 27/27 PASS including the assets-empty check. Schema also gained the `kind` column at the same time (it was missing from the deployed RDS despite being in `create-photoapp.sql:36` since the schema file's pre-Project-02 update — a separate drift class). AUTO_INCREMENT reset to 1001 (matches assignment template's expected starting assetid). All beneficial; no observed regressions. (Project 02 Phase 2.10 Step 13, 2026-05-05)

- [ ] **[Project02/Security] Full credential rotation post-Project-02 grading** — Iteration 12 (Phase 2.10 packaging closeout, 2026-05-05) reversed our defensive "don't ship real creds" stance after the Gradescope autograder definitively proved it reads our `photoapp-config.ini` verbatim (Test 2 pymysql side-effect verifications failed with `Can't connect to MySQL server on 'mysql'` — exact hostname from our shipped LocalStack template). The Northwestern contract is the opposite: students provision their own AWS infrastructure and ship credentials so the grader runs `OUR unit tests against YOUR web service` against `YOUR AWS test infrastructure`. The Project 02 server submission tarball (and, when rebuilt, client tarball) at `dist/p02-server-submission-<TS>.tar.gz` therefore contains the live contents of `projects/project01/client/photoapp-config.ini` — five secrets total: `[rds] user_pwd` (MySQL password for `photoapp-read-write` user) + four IAM credentials across `[s3readonly]` and `[s3readwrite]` (`aws_access_key_id` + `aws_secret_access_key` each). The submission tarball is ephemeral (not committed to git; gitignored under `projects/project02/dist/`) but Gradescope receives + retains it. **Rotate all five fields after the Project 02 submission window closes.** Two utilities — both must run, in either order:
  - `utils/rotate-passwords` — covers `[rds] user_pwd`. Generates new MySQL passwords for `photoapp-read-only` AND `photoapp-read-write` users; updates `projects/project01/client/photoapp-config.ini` (rw user) AND `infra/config/photoapp-config.ini` (ro user); validates via `validate-db`. Runnable from anywhere; uses RDS master password from `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`.
  - `utils/rotate-access-keys` — covers all four IAM fields. Replaces `s3readonly` + `s3readwrite` access keys via `terraform apply -replace=…`; writes new keys into `projects/project01/client/photoapp-config.ini`; verifies via `photoapp.get_ping()`. **Caveat: requires `iam:CreateAccessKey` + `iam:DeleteAccessKey` permissions** — Claude-Conjurer (PowerUserAccess) cannot run it; Erik must run this one personally (or grant Claude-Conjurer scoped IAM perms first; cross-references the existing `[Security/IAM] Consider upgrading Claude-Conjurer permissions for IAM creation` Active item).
  - **Trigger:** when Erik confirms Project 02 grading is finalized + posted (typically 1-2 weeks after submission deadline). Until then, the live creds in the tarball are equivalent in exposure to a routine class submission. Plan.md § Phase 2.10 Step 12 captures the contract reversal in detail. (Phase 2.10 Step 12 closeout, 2026-05-05)

- [ ] **[Tooling/Self-doc] Fix `Erik-AWS-Scan` leading comment header** — only util in the inventory (26 total) without a leading comment header. Other utils all carry purpose + when-to-use + caveats; `Erik-AWS-Scan` has just shebang + bash. ~5 min edit; restores 100% header-coverage baseline. Surfaced by self-doc audit during 2026-05-05 utils-README session (commit 9c80dac).

- [ ] **[Tooling/Self-doc] `--help` flag harmonization across utils** — currently 0/26 utils support `--help` / `-h`. Design options: (a) shared `_help.sh` that consuming scripts source for a standard `--help` printing the leading comment block; (b) lighter — `--help` runs `head -N "$0" | sed 's/^# //'`. Either approach turns 0/26 into 26/26 in one PR. Scope spans both spheres (5 Lab utils + 21 Class Project utils). Surfaced by self-doc audit during 2026-05-05 utils-README session (commit 9c80dac).

## Backlog

### Tooling candidates (3x rule — see Future-State-Ideal-Lab.md for full list)
- [x] **[Design] Move `docker/run` and `docker/run-8080` to `utils/`** — CLOSED 2026-04-23: created `utils/docker-run` and `utils/docker-run-8080` reading `_image-name.txt` from `../docker/`. Original `docker/run*` files retained for cross-platform parity (.bash/.bat/.ps1 also present). (A5)
- [x] **`utils/cred-sweep`** — CLOSED 2026-04-23: created; scans staged files for AWS key IDs, known lab passwords, committed tfvars/secrets. (A6)
- [x] **`utils/rebuild-db`** — CLOSED 2026-04-23: created; runs create-photoapp.sql → create-photoapp-labels.sql → validate-db with confirmation prompt. (A7)
- [x] **`utils/rotate-passwords`** — CLOSED 2026-04-23: created; generates new passwords, rotates in RDS via MySQL, updates photoapp-config.ini, runs validate-db. (A8)

- [ ] **[Tooling] Decide if `utils/boto_test.py` is still wanted** — confirmed purpose 2026-04-26: in-container sanity check for `boto3` install (`python3 MBAi460-Group1/utils/boto_test.py`, returns version string). It works as documented. Decide: keep as-is, expand into a fuller in-container smoke probe, or retire if redundant with other checks. (Spin-up env scan, 2026-04-26)
- [ ] **[Tooling/Lab-root] Decide tracking status of lab-root `utils/`** — `mbai460-client/utils/` (`lab-status`, `lab-up`, `lab-down`, `lock.sh`, `unlock.sh`) is untracked in the lab repo but not declared in `.gitignore` either — implicit untracked policy. Decide: track in lab repo, or add explicit gitignore entry. (Spin-up env scan, 2026-04-26)
- [ ] **[Tooling] `aws-inventory` ENI association traversal** — `aws-inventory` reports EIPs as `attached_to=(unattached)` when they're attached to an ENI (no `InstanceId`), e.g. RDS-managed ENIs. Verified 2026-04-26: EIP `3.146.129.20` is correctly attached to RDS via `eni-02d7750d55c8b998a` (`ServiceManaged: rds`); inventory script needs to render `NetworkInterfaceId` + `ServiceManaged` association, not just `InstanceId`. Cosmetic but causes false alarms. (Spin-up EOR-6, 2026-04-26)

- [ ] Terraform remote state (S3 + DynamoDB lock) — prerequisite for multi-collaborator GitHub use
- [ ] Visualization naming convention cleanup (see visualizations/MetaFiles/TODO.md)
- [x] **[Low/Security] `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`** — CLOSED 2026-04-23: verified already covered in `.gitignore` line 12. (T7)
- [x] **[Low/Security] `MBAi460-Group1/labs/lab02/shorten-config.ini`** — CLOSED 2026-04-23: verified already covered in `.gitignore` line 16. (T8)
- [ ] **[Low/Clarity] Gradescope submission vs backbone co-location in project01/** — `create-photoapp.sql` (backbone, never remove) and `client/photoapp.py` (submit to Gradescope) share a directory; consider a structural signal or comment distinguishing them as projects accumulate
- [x] **[Low/Consistency] Profile name mismatch** — RESOLVED: `main.tf` was updated to `ErikTheWizard` (IAM-touching ops require Erik's SSO credentials); shell utils correctly use `Claude-Conjurer`. Two separate profiles for two separate identities — intentional, not a consistency issue.
- [x] **[Cleanup/EndOfProject] infra/terraform/ artifact cleanup** — CLOSED 2026-04-20: `ErikPlanOutArtifact` and `main.tf~` deleted from disk + untracked; `*.tfplan` and `*~` patterns added to `infra/terraform/.gitignore`.

### Collaborator Readiness — Phase 1B Findings

- [x] **[Polish] visualizations/project01-part02-iam-v1.md stale filename metadata** — CLOSED 2026-04-23: line 7 updated to `project01-part02-iam-v1.md`. (Phase 1B: B7)
- [x] **[Polish] visualizations/lab-database-schema-v3.md stale cross-reference** — CLOSED 2026-04-23: updated to `project01-part02-iam-v1.md`. (Phase 1B: B8)
- [ ] **[GoodPractice] Open TODO items embedded in viz file** — `visualizations/lab01-iam-design-v1.md` contains 6 open `[ ]` items inside the diagram file itself; unusual placement — consider routing to MetaFiles/TODO.md or marking as resolved. (Phase 1B: B9)
- [x] **[Polish] .example files use TODO for IAM key placeholders** — CLOSED 2026-04-23: both `infra/config/photoapp-config.ini.example` and `projects/project01/client/photoapp-config.ini.example` updated; `TODO` replaced with `<your-access-key-id>` / `<your-secret-access-key>`. (Phase 1B: B10)
- [ ] **[OwnershipAmbiguity] project03/client/client.py TODO stubs** — `# TODO #1-3` in `projects/project03/client/client.py`; class-provided assignment stubs, expected — no action unless assignment work begins. (Phase 1B: B11)
- [ ] **[OwnershipAmbiguity] labs/lab03/app/app.js TODO stub** — `response.send("TODO")` in `labs/lab03/app/app.js`; class-provided assignment stub, expected — no action unless assignment work begins. (Phase 1B: B12)
- [x] **[OwnershipAmbiguity] project02/client/photoapp-client-config.ini tracked with localhost:8080** — CLOSED 2026-04-23: confirmed intentional placeholder; comment added: "update to deployed URL when starting project02". (Phase 1B: B13)
- [x] **[GoodPractice] Historical lab01 setup guide has open checkboxes** — CLOSED 2026-04-23: historical annotation added to `labs/lab01/Part 01 - AWS Setup/MetaFiles/Steps-for-initial-AWS-Lab-setup-while-completing-the-assignment.md` — banner at top marks file as historical reference, Lab01 complete (10/10), do not re-execute. (Phase 1B: B14)
- [ ] **[OwnershipAmbiguity] project03 staff API endpoint committed** — `projects/project03/client/authsvc-client-config-staff.ini` contains a live staff API endpoint URL committed to git; assess whether this is intentional (class-provided, expected) or should be gitignored. (Phase 1B: B6)

---

## Deferred Optional Steps

> Schema established 2026-05-02 by Phase 0.5.7 of the library extraction (Approach `projects/project02/client/MetaFiles/Approach/00-shared-library-extraction.md`). Format and protocol are deliberately constrained so the queue stays parseable. **Don't free-form here** — if a row doesn't fit the schema, route to the regular Class-Project Active/Backlog above instead.

Queue of Optional Test / Utility / Visualization Steps deferred from the Approach docs (see `projects/project02/client/MetaFiles/Approach/00-overview-and-conventions.md` § Optional Steps Convention). One row per deferred step; promote to `### Resolved` (with the resolving commit SHA) when built or formally retired.

### Format

- **Provenance** — `<workstream-doc>:<phase|task>` (e.g., `02-web-service.md:Phase 1`)
- **Type** — `Test` | `Utility` | `Visualization`
- **Suggested artifact** — file path, tool name, or visualization filename, verbatim from the callout
- **Decision date** — ISO date when "queue" was chosen (so stale entries are visible)
- **One-sentence intent** — verbatim from the callout's "What it does" / "What to lock down"
- **Trigger to revisit** — what event would make this worth promoting from queue to build (e.g., "second contributor onboards", "third repetition of this command sequence", "first live regression failure")

Row template (single line):

```markdown
- [ ] **`<workstream>:<phase>`** — `<Type>` | `<artifact>` | `<YYYY-MM-DD>` | `<intent>` | _Trigger: <event>_
```

### Open

(Empty — first entries land as Phase 1+ workstreams begin and route Optional-Step decisions through here.)

### Resolved

- [x] **`00-shared-library-extraction.md:Phase 0.5.7`** — `Schema` | `MetaFiles/TODO.md § Deferred Optional Steps` | `2026-05-02` | resolved by Phase 0.5 commit (this file's authorship)

### Retired (built consideration; decided not to pursue)

- [x] **`00-shared-library-extraction.md:Phase 3.1`** — `Utility` | `utils/run-extraction-canary` | `2026-05-02` | retired: assessed during Phase 0.3 close-out — Phase 0.x canary ran cleanly on every commit without iteration looping; the wrapper would have saved zero keystrokes. Revisit if Phase 1 Foundation work re-triggers the iteration shape this utility was designed for.

### Grooming

Re-read this section at the start of every workstream (it is listed as a Documentation touchpoint in each Approach doc). Promote anything whose Trigger fired; retire anything whose context evaporated. Stale entries (>90 days, no Trigger movement) are reviewed at workstream-acceptance time.
