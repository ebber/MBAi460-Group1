# Project 03 — Part 01 · Execution Map

**Quest:** Complete Project 03 Part 01 — deploy `POST /auth` authentication microservice → **50/50 Gradescope**
**Status:** 🟢 EXECUTING — **Checkpoint 2: Gradescope pipe PROVEN** (submission accepted); awaiting HCP UI score check
**Last Updated:** 2026-06-09 (Execution Agent — CP-2: submission #416301527 landed; DP-4/DP-5 resolved)
**Authoritative roadmap:** `MetaFiles/6_8_Part1_Approach.md` (sole spec; PDF is off-limits to Execution Agent)

> This Map is the durable execution-state surface (compaction-recovery anchor). The in-chat Compass is its conversational echo. Update the relevant checkpoint/DP row at each substep close-out — and bump `Last Updated` in the same edit (SpinDown SD-3/SD-6 discipline).

---

## Roles
- **Execution Agent** — me (Claude). Executes checkpoints; stops at every Decision Point.
- **OverSeer Agent** — plan author; escalate *structural/plan ambiguity* here.
- **Human CoPilot** — Erik. Owns AWS account access, all sign-offs, Gradescope UI, greenlights.

## Active position
- **● Now:** **Checkpoint 2 — Gradescope pipe PROVEN.** Placeholder INIs submitted via Docker `gs` → accepted (submission #416301527). DP-4/DP-5 resolved. Awaiting HCP UI check for the ~0/50 baseline score + autograder error strings (oracle for CP-4/5).
- **→ Next:** Checkpoint 3 — Hosting infra: plan → architecture viz + IAM viz (Visual Companion; DP-6/DP-7 sign-offs) → Tier-A tests → Terraform → apply → Tier-B smoke.

---

## Checkpoint ledger
| # | Checkpoint | Status | One-line |
|---|-----------|--------|----------|
| 1 | Set Up (greenfield readiness) | ✅ COMPLETE | 1.1✅ 1.4✅ 1.3✅ 1.2✅ · db-init ✅ (17/17 OK) · Gate 1.5 met |
| 2 | Hello World submission (~0/50) | ✅ pipe proven | INIs submitted (#416301527); DP-4/5 resolved; baseline score = HCP UI check |
| 3 | Hosting Infrastructure | ⏳ | plan → arch viz → IAM viz → Tier-A tests → Terraform → apply → Tier-B smoke |
| 4 | Complete Application Logic (TDD) | ⏳ | 5 TODOs in `lambda_function.py`; oracle tests pass |
| 5 | Submit (iterate to 50/50) | ⏳ | Gradescope 50/50, Human CoPilot confirms |
| 6 | Clean up / sharpen / polish | ⏳ | docs, hygiene, scoped AWS destroy (NOT backbone RDS) |
| 7 | END QUEST 🥂 | ⏳ | 50/50 secured; reproducible via `make apply` |

## Decision-Point register (stop-and-check-in)
| DP | CP | Trigger | Owner | Status |
|----|----|---------|-------|--------|
| DP-0 | boot | AWS profile/secrets/`sts` fail | Human CoPilot | 🟢 RESOLVED — `Claude-Conjurer` sts OK (creds at `claude-workspace/secrets/`) |
| DP-1 | 1 | Backbone RDS missing / `tf output` fails | HCP→OverSeer | 🟢 RESOLVED — Path A: RDS `available`, endpoint confirmed via `photoapp-config.ini`; no Path B |
| DP-2 | 1 | `make db-init` fails | Human CoPilot | 🟡 AT GATE — SQL verified safe (isolated `authsvc` db, no placeholder issue, clean recovery); awaiting go + exec-path choice |
| DP-3 | 1 | Move Part 02 files to scratch/ | Human CoPilot | ⏳ default: leave in place |
| DP-4 | 2 | Gradescope assignment ID ≠ 8159384 | HCP+OverSeer | 🟢 RESOLVED — assignment 8159384 accepted the submission (valid ID) |
| DP-5 | 2 | `gs submit` fails | Human CoPilot | 🟢 RESOLVED — Docker `gs submit` channel works (login + upload OK) |
| DP-6 | 3 | Architecture diagram sign-off | Human CoPilot | ⏳ (Visual Companion) |
| DP-7 | 3 | IAM diagram sign-off | Human CoPilot | ⏳ (Visual Companion) |
| DP-8 | 3 | `tf plan` unexpected destroys/new RDS | Human CoPilot | ⏳ |
| DP-9 | 3 | `tf apply` | Human CoPilot | ⏳ explicit approval |
| DP-10 | 3 | Lambda can't reach RDS | Human CoPilot | ⏳ |
| DP-11 | 4 | Same test fails after 3 attempts | HCP+OverSeer | ⏳ |
| DP-12 | 4 | Error-string mismatch vs oracle | OverSeer | ⏳ |
| DP-13 | 5 | Gradescope <50/50 w/ local green | Human CoPilot | ⏳ |
| DP-14 | 5 | Best score ≠ last submission | Human CoPilot | ⏳ |
| DP-15 | 6 | `make destroy` scope | Human CoPilot | ⏳ never destroy backbone RDS w/o approval |

---

## Pre-flight findings carried from this session's AWS verification
1. **Cred-path caveat (affects DP-0 + `_run_sql.py`/`make db-init`).** `Claude-Conjurer` auth WORKS, but only with `AWS_SHARED_CREDENTIALS_FILE` → `claude-workspace/secrets/aws-credentials`. The repo-documented path (`MBAi460-Group1/secrets/`) **does not exist** — the logged util cred-path bug (`claude-workspace/TODO.md` line-21). Any Project 03 script reading the documented path will silently fail the same way.
2. **Backbone RDS is UP (Path A viable).** `photoapp-db` — MySQL 8.0, db.t3.micro, **available**, public=True, endpoint `photoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com`. BUT `terraform state list` returns empty locally (not init'd) → the Approach's `terraform output rds_address` preflight will likely fail; endpoint is available via `aws rds describe` or `infra/config/photoapp-config.ini` instead.
3. **`ClaudeConjurerPlane2IAMDelegation` policy exists** (seen in live inventory) → Plane-2 IAM delegation likely permits scoped creation of `lab-project-*` roles under the boundary, *despite* Claude-Conjurer being PowerUserAccess (which normally denies IAM). To verify when Checkpoint 3 IAM creation runs.

## Default path (v1)
Path A backbone RDS · committed `layers/*.zip` · `make db-init` via `utils/_run_sql.py` · Terraform scoped to **Lambda + layers + API Gateway only** (no new RDS, no VPC-Lambda, no TF-managed SQL).

## Standing guardrails (internalized)
Do NOT: read the PDF · edit instructor `test01–03.txt` or exact error strings (w/o approval) · weaken tests to green (3-strike→DP-11) · commit live secrets (gitignore INIs) · destroy backbone RDS · mutate `labs/lab04` (copy patterns only). IAM roles MUST be `lab-project-*` + `LabProjectPermissionsBoundary`.

## CP-1 progress log
- **1.1 inventory ✅** — plan claims verified (bcrypt 273K · pymysql 5.2M · `authenticate.zip` = 8 files). Part 02 artifacts present → left in place (DP-3 default). PDF present, not opened. `requests-layer.zip` = harmless extra.
- **1.4 extract ✅** — unpacked to `lambda/`; **5 TODOs confirmed**. Verified from source:
  - Handler `lambda_handler`; reads `authsvc-config.ini` `[rds]` (endpoint/port_number/user_name/user_pwd/db_name).
  - **Error strings (exact, locked from source):** `no body in request` · `missing credentials in body` · `duration must be an integer` · `invalid token` · `expired token` · `invalid username` · `invalid password` · 500→`str(err)` (TODO#5 fail → `INTERNAL ERROR: insert failed to modify database`).
  - duration: default 30, override iff 1–60, non-int→400. token=`uuid4()`, expiry=`utcnow+duration`.
  - TODOs use `datatier.retrieve_one_row` (#1,#3) + `datatier.perform_action` (#5). Seed-user `userid` PK starts 80001.
  - ⚠️ Starter line 53 `os.environ['AWS_SHARED_CREDENTIALS_FILE']=config_file` — vestigial (datatier = pure pymysql); plan says do NOT remove. Leave it.
- **Cred-path clarification:** Lambda `authsvc-config.ini` = **MySQL DB creds**, not AWS creds. `claude-workspace/secrets/` wiring (Q3) is for **AWS-API tooling (Terraform)**. `_run_sql.py`/`make db-init` reach RDS via **MySQL admin** (rds-master-password) — confirm its exact cred dependency at 1.2 before assuming the AWS cred-path bug affects it.
- **1.3 houseclean ✅** — created `infra/ tools/ scripts/` scaffolding (+ `lambda/`), `.gitignore` (guards `/authsvc-config.ini` + tfstate/tfplan), `scratch/part02-cancelled/README.md`. Part-02 files left in place (DP-3 default).
- **1.2 preflight ✅ → DP-1 RESOLVED (Path A):** `_run_sql.py` reaches RDS as MySQL `admin` via pymysql (endpoint from `photoapp-config.ini` = `photoapp-db…amazonaws.com`; pwd from `rds-master-password.txt` ✅ present) — **no AWS creds used** → cred-path caveat does NOT affect db-init (Pre-flight #1 corrected). RDS `available` (verified this session).
- **create-authsvc.sql verified (pre-mutation):** no `${VAR}` placeholders (pwds hardcoded; bcrypt `$2y$` hashes don't match `${...}`) → db-init runs clean. Scope = `CREATE DATABASE authsvc` + `users`/`tokens` tables + 3 seed users + MySQL users `authsvc-read-only`/`-read-write`, GRANTs scoped to `authsvc.*` only. **Does NOT touch `photoapp`/`URL_Shortener`.** Recovery = `DROP DATABASE authsvc; DROP USER 'authsvc-read-only','authsvc-read-write';` (idempotent re-run safe).
- **db-init = MUTATION GATE (DP-2):** HELD for Human CoPilot go + exec-path choice (Docker `utils/run-sql` vs direct `python3 _run_sql.py`).
- **db-init ✅ DONE (Path a/Docker, 2026-06-09):** HCP restarted Colima → `utils/run-sql create-authsvc.sql` → **17/17 statements OK**. Ground-truth verified via per-statement DB rowcounts (CREATE DATABASE rows:1 · 3× INSERT rows:1 · CREATE USER ×2 · GRANT ×2). `authsvc` live on backbone RDS. **DP-2 resolved → CP-1 Gate 1.5 met.**

## CP-2 progress log
- **Placeholder INIs ✅** — `authsvc-config.ini` + `authsvc-client-config.ini` (assignment-shaped placeholders; local, not committed — real values generated at CP-3). `scripts/submit-gradescope.sh` created (mirrors lab04; submits BOTH INIs; course 1288073 / assignment 8159384).
- **Gradescope pipe PROVEN ✅ (2026-06-09):** Docker `gs submit` → logged in (erik.beitel@…), both files uploaded, **accepted**. **Submission #416301527** → `https://www.gradescope.com/courses/1288073/assignments/8159384/submissions/416301527`. DP-4 (valid ID) + DP-5 (channel) resolved.
- **Gate 2.4 remaining:** baseline **score + autograder error strings** require the Gradescope **UI** (`gs results` doesn't exist) → **Human CoPilot** check. Expect ~0/50; capture autograder messages as oracle for CP-4/5.

## Links
- Roadmap: `MetaFiles/6_8_Part1_Approach.md`
- To-create during execution: `6_8_Part1_Hosting_Plan.md`, `6_8_Part1_Architecture.md`, `6_8_Part1_IAM.md`, `6_8_Part1_Submission_Plan.md`
- Format refs only: `MetaFiles/Examples/`
