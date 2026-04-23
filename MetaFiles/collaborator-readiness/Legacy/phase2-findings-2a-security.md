# Phase 2 — 2A Security Sweep Findings

**Swept:** 2026-04-23
**Scope:** `.gitignore` coverage, committed credential patterns, `.example` templates, untracked sensitive files, secrets directory

---

## ✅ Clean — No Action Required

| Area | Finding |
|------|---------|
| AWS access keys | `git ls-files` scan for `AKIA*` — zero hits |
| Live RDS endpoint | No hardcoded endpoint values in tracked code files (code reads from gitignored config) |
| `.env` / `.pem` / `.key` | None committed or untracked on disk |
| `secrets/` directory | Not present in Class Project root — correct |
| `.example` placeholders | All use `<angle-bracket>` format throughout (B10 done Phase 1) |
| viz schema annotation | `lab-database-schema-v2.md` has "original — rotated 2026-04-20" annotation (T3/B4 done Phase 1) |
| `.gitignore` core coverage | AWS credentials, Terraform secrets, lab configs, `.env`/`*.key`/`*.pem` all covered |

---

## Findings

### S2A-1 — 🟠 Risk — All Phase 1 work is uncommitted

`git status` shows 19 modified + 8 untracked files. All Phase 1 execution (LE1, B7–B14, T3/B4, T7–T9, T16, A3–A8, QUICKSTART.md, quest artifacts) is on disk but not committed. A collaborator cloning `origin/main` today gets pre-Phase-1 state — missing QUICKSTART.md, utils scripts, .gitignore hardening, README fixes, and all other Phase 1 improvements.

**Files affected:** `.gitignore`, `MetaFiles/TODO.md`, `README.md`, `infra/MetaFiles/TODO.md`, `infra/README.md`, `infra/config/photoapp-config.ini.example`, `infra/terraform/main.tf`, `infra/terraform/variables.tf`, `labs/lab01/Part 01 - AWS Setup/MetaFiles/Steps-for-initial-AWS-Lab-setup-while-completing-the-assignment.md`, `projects/project01/Part02/MetaFiles/TODO.md`, `projects/project01/Part02/MetaFiles/plans/execution-plan.md`, `projects/project01/README.md`, `projects/project01/client/photoapp-config.ini.example`, `projects/project02/client/photoapp-client-config.ini`, `utils/aws-inventory`, `utils/smoke-test-aws`, `visualizations/lab-database-schema-v2.md`, `visualizations/lab-database-schema-v3.md`, `visualizations/project01-part02-iam-v1.md` + untracked: `MetaFiles/collaborator-readiness/`, `QUICKSTART.md`, `projects/project01/Part02/MetaFiles/code-quality-review.md`, `projects/project01/Part03/`, `utils/cred-sweep`, `utils/docker-run`, `utils/docker-run-8080`, `utils/rebuild-db`, `utils/rotate-passwords`

**Route:** Phase 3 commit — all Phase 1 + Phase 2 Act items land in one clean commit at the end of the quest.

---

### S2A-2 — ⬜ Ownership Ambiguity — `labs/lab01/Part 00 - Client Setup/s3-config.ini` tracked with class bucket

`s3-config.ini` is committed and contains:
```
bucket_name = nu-cs-msa-s3-photoapp
endpoint = https://nu-cs-msa-s3-photoapp.s3.us-east-2.amazonaws.com
```
This is the class/staff S3 bucket (not Erik's). No credentials — just endpoint config. Appears class-provided. For a collaborator, this would need to point to their own bucket, but since it's in `Part 00 - Client Setup/` it may be intentional lab scaffolding.

**Route:** Assess — is this class-provided and expected? If so, Ack. If not, should become a `.example` template.

---

### S2A-3 — ⬜ Ownership Ambiguity / 🟠 Risk — `authsvc-client-config-staff.ini` contains live staff API endpoint

`projects/project03/client/authsvc-client-config-staff.ini` contains:
```
webservice=https://yj0vnhj23h.execute-api.us-east-2.amazonaws.com/test
```
This is a live staff API endpoint. Class-provided, committed. Already tracked as B6 in Phase 1 triage (routed to Phase 2 structural audit). The endpoint being public and class-provided may be intentional — but it's a real live URL in source.

**Route:** Assess with Erik — class-provided intentional (Ack/Deprioritize) or should be gitignored with `.example` replacement (Act)?

---

### S2A-4 — 🟡 Good Practice — `create-photoapp.sql` seed data comment contains plaintext password

`projects/project01/create-photoapp.sql` line 48:
```sql
INSERT INTO users(username, pwdhash, givenname, familyname)  -- pwd = abc123!!
```
The actual `pwdhash` value is a bcrypt hash — not the plaintext password. This is a documentation comment on seed data for application-tier users (not DB users). The password shown is the seed user's original password, not rotated (seed users are app-tier, not infra). Low risk but visible in git history.

**Route:** 🟡 Good Practice — could remove or redact the `-- pwd = abc123!!` comment from seed inserts. Not urgent.

---

### S2A-5 — 🟠 Risk — `project03` SQL files contain `CREATE USER` with plaintext passwords

`projects/project03/create-authsvc.sql` lines 62–63:
```sql
CREATE USER 'authsvc-read-only' IDENTIFIED BY 'abc123!!';
CREATE USER 'authsvc-read-write' IDENTIFIED BY 'def456!!';
```
`projects/project03/create-chatapp.sql` lines 25–26: same pattern.

These are class-provided SQL files. Running them creates DB users with known lab passwords. Already tracked as T4/B5 in Phase 1 triage. No immediate mitigation since these are class-provided, but worth noting for any collaborator who runs them — they should rotate after setup.

**Route:** Already in MetaFiles/TODO.md Active as B5. No new action — confirm routing is still correct.

---

### S2A-6 — ✨ Polish — `.example` files contain partial live RDS endpoint

Both `infra/config/photoapp-config.ini.example` and `projects/project01/client/photoapp-config.ini.example` use:
```
endpoint = <rds-identifier>.c5q4s860smqq.us-east-2.rds.amazonaws.com
```
`c5q4s860smqq` is the AWS-assigned instance-specific suffix from Erik's RDS instance. A collaborator's endpoint would be `<their-id>.<completely-different-suffix>.us-east-2.rds.amazonaws.com`. This template implies "fill in the first part" but the suffix is also instance-specific — a collaborator following the template literally would have a broken endpoint.

**Better pattern:**
```
endpoint = <full-rds-endpoint-from: terraform output rds_endpoint_host>
```
Or: `<rds-id>.<aws-assigned-suffix>.us-east-2.rds.amazonaws.com`

**Route:** ✨ Polish — update both `.example` files to use a fully generic placeholder or direct collaborator to `terraform output`.

---

### S2A-7 — 🟡 Good Practice — `projects/project01/Part03/` untracked with assignment PDF

`projects/project01/Part03/project01-part03.pdf` (595KB, created 2026-04-22) is on disk and untracked. Not sensitive. Follows the same pattern as `labs/lab02/lab02.pdf` (also untracked). Neither is gitignored — they're just not staged. The Phase 3 commit sweep should decide: track the PDFs or explicitly gitignore `*.pdf` / `*/Part*/assignment.pdf`.

**Route:** 🟡 Good Practice — decide at Phase 3 commit time: track or gitignore PDFs consistently.

---

## Summary Counts

| Tag | Count |
|-----|-------|
| 🟠 Risk | 2 (S2A-1 uncommitted work, S2A-5 project03 SQL passwords) |
| ⬜ Ownership Ambiguity | 2 (S2A-2 s3-config.ini, S2A-3 staff endpoint) |
| 🟡 Good Practice | 2 (S2A-4 seed comment, S2A-7 untracked PDFs) |
| ✨ Polish | 1 (S2A-6 RDS endpoint template) |
| 🔴 Blocker | 0 |

*No live credentials committed. No access keys. Core gitignore coverage solid.*
