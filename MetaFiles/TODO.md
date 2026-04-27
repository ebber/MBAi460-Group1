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

- [ ] **[Security] Scan for potentially exposed credentials (17 hits found by cred-sweep util); also consider refreshing the util itself** — `utils/cred-sweep` flagged 17 hits for `abc123!!` / `def456!!` patterns during 2026-04-27 pre-push hygiene (Project 01 Part 03 MVP closeout). None introduced by recent commits (verified via `git diff origin/main..HEAD` → empty). Hits cluster as: (a) course-mandated content (Lab 01 Requirements/Steps, project03 SQL — class-provided, not removable), (b) historical/triage refs in TODO/security-findings/triage-table docs, (c) visualization annotations marked as rotated, (d) self-reference in `cred-sweep` script's own pattern definition (false positive). Triage each: keep / strikethrough / move to gitignored historical doc / refactor inline. **Also refresh `utils/cred-sweep` itself** — consider (1) allowlist for course-mandated paths + script self-reference, (2) severity tiers (LEAK vs INFO vs ALLOWLISTED) so legitimate course content doesn't drown the signal, (3) markdown-context awareness (downgrade strikethrough / "rotated" annotations from LEAK to INFO), (4) optional `--strict` flag for CI use that fails on LEAK only.

- [ ] **[Project01/Hygiene] Investigate and consolidate SQL artifacts in `projects/project01/`** — `create-photoapp.sql` and `create-photoapp-labels.sql` coexist at project01 root. Investigate whether the labels file should remain split or fold into the main schema; document the relationship (when each is run, by whom, why split). Memory currently references only the main file. (Spin-up env scan, 2026-04-26)

- [ ] **[Project01/Part03] Correctly deprecate Part 02 Python from Part 03 backend** — Part 03 backend committed to Express/Node (2026-04-26 design pivot); Part 02 `projects/project01/client/photoapp.py` is no longer imported at runtime. Decide & execute: (a) keep `client/photoapp.py` as a behavioral reference with a deprecation banner, or (b) move it to a `Reference/` location, or (c) delete it after Part 03 reaches feature parity. Includes review of client config file consumption (Part 03 server reads `photoapp-config.ini` directly via `ini` package). (Express pivot Q2, 2026-04-26)

- [ ] **[Docs] Elaborate purpose of `MBAi460-Group1/learnings/`** — directory exists (last touched 2026-04-24) but is not described in memory, project_overview, or README. Capture: what belongs there, who writes to it, lifecycle, audience. (Spin-up env scan, 2026-04-26)

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
