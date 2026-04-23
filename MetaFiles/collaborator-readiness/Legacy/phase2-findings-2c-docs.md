# Phase 2 — 2C Documentation Sweep Findings

**Swept:** 2026-04-23
**Scope:** `QUICKSTART.md`, `MetaFiles/QUICKSTART.md`, `README.md`, `MetaFiles/README.md`, `MetaFiles/` coordination docs, `setup/`

---

## ✅ Clean — No Action Required

| File | Status |
|------|--------|
| `README.md` (root) | Structure table, key facts, orientation links — accurate and clean ✅ |
| `MetaFiles/README.md` | Correctly describes coordination layer; clear on what belongs/doesn't ✅ |
| `MetaFiles/Manifesto-AWS-Lab-Sanctum.md` | Governing principles — not checked line-by-line but expected to be stable ✅ |
| `MetaFiles/Future-State-Ideal-Lab.md` | Design target — long-lived reference doc ✅ |
| `MetaFiles/TODO.md` | ActionQueue — Phase 1 closures landed correctly (1E verified) ✅ |

---

## Findings

### S2C-1 — 🔴 Blocker — Two competing QUICKSTART files; better one is inaccessible from README

There are two QUICKSTART guides:

| File | Status | Quality |
|------|--------|---------|
| `QUICKSTART.md` (root) | **Untracked** — NOT in git; fresh clones don't have it | Less complete |
| `MetaFiles/QUICKSTART.md` | **Tracked** — committed; fresh clones have it | Comprehensive |

`README.md` links to `QUICKSTART.md` — which is untracked and absent for any collaborator who clones. The link is dead.

**Comparison — `MetaFiles/QUICKSTART.md` is better in every dimension:**
- Prerequisites include Colima explicitly (`brew install colima docker`) — root version says "Docker Desktop"
- Creates `rds-master-password.txt` in **Step 1** — avoids chicken-and-egg setup ordering issue
- Explains `${PLACEHOLDER}` password substitution mechanism clearly — root version is confusing on this
- Covers `labs/lab02/shorten-config.ini` setup — root version omits lab02
- Includes boto3 smoke test as first verification
- Includes Gradescope submission instructions
- Has Key file map table (tracked vs. gitignored)
- Covers teardown + `smoke-test-aws --mode dead`

**Root QUICKSTART.md** was created in Phase 1 (T16) to close a project01 client config gap. It accidentally created a competing, less complete version.

**Fix:** Delete root `QUICKSTART.md`. Make `MetaFiles/QUICKSTART.md` the canonical version. Update `README.md` to link to `MetaFiles/QUICKSTART.md`. Alternatively: merge root content's project01 client config note into `MetaFiles/QUICKSTART.md` (it already has this in Step 5) and delete the root file.

**Note:** `MetaFiles/QUICKSTART.md` Step 6 references `labs/lab02/create-shorten.sql` which is currently untracked. That step should be conditioned on lab02 assignment start.

---

### S2C-2 — 🟠 Risk — `MetaFiles/QUICKSTART.md` says `Claude-Conjurer` has PowerUserAccess; Step 2 says AdministratorAccess

The root QUICKSTART.md Step 2 says: *"Permissions: `AdministratorAccess` (or scope to S3/RDS/IAM/EC2/Rekognition for the lab)"*

But the actual model is PowerUserAccess (no IAM). A collaborator following the root QUICKSTART would provision IAM with too broad permissions. The MetaFiles/QUICKSTART.md correctly says "PowerUserAccess" in the Prerequisites.

This is resolved by fixing S2C-1 (delete root, use MetaFiles version), but worth noting explicitly as a security gap in the current root file.

---

### S2C-3 — 🟠 Risk — QUICKSTART (root) has confusing password setup ordering

Root QUICKSTART.md Step 4 has:
```ini
user_pwd = <password set in Step 5 — initialize DB first>
```

But Step 5 (`docker/build`) and Step 6 (`utils/rebuild-db`) don't say what password to set. A collaborator who copies the placeholder literally would run `rebuild-db` which invokes `_run_sql.py`, which substitutes the placeholder string verbatim into `CREATE USER ... IDENTIFIED BY '<password set in Step 5 — initialize DB first>'`. The user is created with that literal garbage string as a password.

`MetaFiles/QUICKSTART.md` resolves this correctly: Step 5 says "**You choose the passwords here** — whatever you put in the config files is what gets applied to RDS." Resolved by S2C-1 fix.

---

### S2C-4 — 🟡 Good Practice — `setup/mac.bash` not mentioned in QUICKSTART

`setup/mac.bash` (class-provided) makes Docker scripts executable and converts line endings — useful for fresh clones on Mac. Neither QUICKSTART version mentions it. A collaborator who clones on Mac would have to figure out themselves why `docker/build` isn't executable.

`MetaFiles/QUICKSTART.md` Step 2 shows `docker/build` without mentioning `chmod +x` or `setup/mac.bash`. If the file isn't executable, `docker/build` fails with permission denied.

**Fix:** Add to `MetaFiles/QUICKSTART.md` Step 2 (before `docker/build`):
```bash
# Make scripts executable (first clone only — Mac/Linux)
bash setup/mac.bash
```
Or at minimum add a note about executability.

---

### S2C-5 — ✨ Polish — `MetaFiles/README.md` doesn't list `QUICKSTART.md` or `plans/`

`MetaFiles/README.md` Contents table lists `Manifesto`, `Future-State`, `TODO.md` — but not `QUICKSTART.md` (the most important onboarding doc) or `plans/` (active implementation plans).

**Fix:** Add rows to MetaFiles/README.md Contents table:
```markdown
| `QUICKSTART.md` | New collaborator environment setup walkthrough |
| `plans/` | Implementation plans for in-progress work |
```

---

### S2C-6 — ✨ Polish — `MetaFiles/QUICKSTART.md` Step 6 references untracked file

Step 6 includes:
```bash
utils/run-sql labs/lab02/create-shorten.sql
```
`labs/lab02/create-shorten.sql` is currently untracked (unstarted lab02 extension). A collaborator would get a "file not found" error on this step.

**Fix:** Add a guard note:
```
# Only needed when starting lab02:
# utils/run-sql labs/lab02/create-shorten.sql
```
Or move lab02 schema setup to a separate "Lab 02 Setup" section.

---

### S2C-7 — 🟡 Good Practice — `MetaFiles/plans/2026-04-20-utils-path-fix.md` is an agent working doc in a tracked directory

`MetaFiles/plans/` contains `2026-04-20-utils-path-fix.md` — an implementation plan document generated during Phase 0 work. This is untracked but in a tracked directory. A collaborator would find an agent-style implementation plan ("REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development...") if they listed the plans/ directory. It could be confusing or look like unfinished work.

**Route:** Add `MetaFiles/plans/` to `.gitignore` (if plans are agent-internal), or commit the plan as part of project history (if plans are considered project artifacts), or delete old completed plans.

---

## Summary Counts

| Tag | Count |
|-----|-------|
| 🔴 Blocker | 1 (S2C-1 — two QUICKSTART files, root untracked, better one inaccessible) |
| 🟠 Risk | 2 (S2C-2 permission mismatch, S2C-3 password ordering) |
| 🟡 Good Practice | 2 (S2C-4 setup/mac.bash, S2C-7 agent plan doc) |
| ✨ Polish | 2 (S2C-5 MetaFiles README, S2C-6 untracked create-shorten.sql) |
