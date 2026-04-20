# Class Project — ActionQueue

## Active

- [ ] **[Security] Reset photoapp users + passwords** — `photoapp-read-only` (abc123!!) and `photoapp-read-write` (def456!!) passwords were briefly exposed in initial commit before history rewrite; rotate both in RDS + update local `infra/config/photoapp-config.ini` and `projects/project01/client/photoapp-config.ini` (recreate from `.example` templates)
- [x] **[Hygiene] photoapp-config.ini gitignore gap** — resolved: removed from history via git filter-repo, gitignored, `.example` templates added
- [ ] **[Design] VCS strategy** — branching model, what gets committed, tfstate remote backend, multi-collaborator gitignore policy (see Lab-root MetaFiles/TODO.md)
- [ ] **[Tuning] IAM diagram mismatch** — `visualizations/lab01-iam-design-v1.md` shows Claude-Conjurer as AdministratorAccess; actual is PowerUserAccess; update diagram

## Backlog

- [ ] Terraform remote state (S3 + DynamoDB lock) — prerequisite for multi-collaborator GitHub use
- [ ] Visualization naming convention cleanup (see visualizations/MetaFiles/TODO.md)
- [ ] **[Low/Security] `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`** — plaintext credential inside Class Project tree; untracked now but unprotected against broad `git add`; needs gitignore coverage at MBAi460-Group1/ level (Lab-layer .gitignore change)
- [ ] **[Low/Security] `MBAi460-Group1/labs/lab02/shorten-config.ini`** — gitignore covers old path only (`labs/lab02/`); new path unprotected (Lab-layer .gitignore change)
- [ ] **[Low/Clarity] Gradescope submission vs backbone co-location in project01/** — `create-photoapp.sql` (backbone, never remove) and `client/photoapp.py` (submit to Gradescope) share a directory; consider a structural signal or comment distinguishing them as projects accumulate
- [ ] **[Low/Consistency] Profile name mismatch** — `main.tf` uses `Claude-The-Conjurer`; shell utils use `Claude-Conjurer`; verify both resolve to the same profile entry in the credentials file
