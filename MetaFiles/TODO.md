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

- [x] **[Security] Reset photoapp users + passwords** — `photoapp-read-only` (abc123!!) and `photoapp-read-write` (def456!!) passwords were briefly exposed in initial commit before history rewrite; rotate both in RDS + update local `infra/config/photoapp-config.ini` and `projects/project01/client/photoapp-config.ini` (recreate from `.example` templates)
- [x] **[Hygiene] photoapp-config.ini gitignore gap** — resolved: removed from history via git filter-repo, gitignored, `.example` templates added
- [ ] **[Design] VCS strategy** — branching model, what gets committed, tfstate remote backend, multi-collaborator gitignore policy (see Lab-root MetaFiles/TODO.md)
- [x] **[Tuning] IAM diagram mismatch** — CLOSED 2026-04-20: `lab01-iam-design-v1.md` updated — Claude-Conjurer now shows PowerUserAccess, Mermaid diagram fixed, README updated.
- [ ] **[Security/IAM] Consider upgrading Claude-Conjurer permissions for IAM creation** — currently PowerUserAccess (no IAM); blocked `terraform apply` for IAM resources; options: add scoped `iam:CreateUser/Policy/AttachUserPolicy` permissions, or keep IAM as Erik-only human gate (current pattern). Decide before next IAM-touching Terraform work.
- [ ] **[IaC] main.tf AWS profile hardcoded to ErikTheWizard** — Claude-Conjurer cannot run `terraform plan/apply` until this is resolved; options: (a) change to `Claude-Conjurer`, (b) parameterize via `TF_VAR_aws_profile` / env var, (c) use `-chdir` + env override. Decide before next Terraform work.
- [ ] **[Tooling] Credential path gap in utils/** — `smoke-test-aws`, `aws-inventory`, `rotate-access-keys` look for `${CLASS_ROOT}/secrets/aws-credentials` but `MBAi460-Group1/secrets/` doesn't exist in standalone repo; scripts fall back to `~/.aws` silently and fail. Fix: update scripts to use `claude-workspace/secrets/` path or accept `AWS_SHARED_CREDENTIALS_FILE` env var override.

## Backlog

### Tooling candidates (3x rule — see Future-State-Ideal-Lab.md for full list)
- [ ] **[Design] Move `docker/run` and `docker/run-8080` to `utils/`** — `docker/` should be build artifacts only (`Dockerfile`, `_image-name.txt`); entry points belong in `utils/` alongside the other operational scripts. Requires script-relative image-name read fix.
- [ ] **`utils/cred-sweep`** — pre-commit scan for committed secrets; candidate for git hook
- [ ] **`utils/rebuild-db`** — single command: run all create-*.sql files + validate-db
- [ ] **`utils/rotate-passwords`** — generate + update configs + rebuild-db in one shot

- [ ] Terraform remote state (S3 + DynamoDB lock) — prerequisite for multi-collaborator GitHub use
- [ ] Visualization naming convention cleanup (see visualizations/MetaFiles/TODO.md)
- [ ] **[Low/Security] `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`** — plaintext credential inside Class Project tree; untracked now but unprotected against broad `git add`; needs gitignore coverage at MBAi460-Group1/ level (Lab-layer .gitignore change)
- [ ] **[Low/Security] `MBAi460-Group1/labs/lab02/shorten-config.ini`** — gitignore covers old path only (`labs/lab02/`); new path unprotected (Lab-layer .gitignore change)
- [ ] **[Low/Clarity] Gradescope submission vs backbone co-location in project01/** — `create-photoapp.sql` (backbone, never remove) and `client/photoapp.py` (submit to Gradescope) share a directory; consider a structural signal or comment distinguishing them as projects accumulate
- [x] **[Low/Consistency] Profile name mismatch** — RESOLVED: `main.tf` was updated to `ErikTheWizard` (IAM-touching ops require Erik's SSO credentials); shell utils correctly use `Claude-Conjurer`. Two separate profiles for two separate identities — intentional, not a consistency issue.
- [x] **[Cleanup/EndOfProject] infra/terraform/ artifact cleanup** — CLOSED 2026-04-20: `ErikPlanOutArtifact` and `main.tf~` deleted from disk + untracked; `*.tfplan` and `*~` patterns added to `infra/terraform/.gitignore`.
