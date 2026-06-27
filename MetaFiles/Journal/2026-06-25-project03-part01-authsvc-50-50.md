# Project 03 Part 01 — authsvc microservice → 50/50

**Date:** 2026-06-09 (build) → 2026-06-25 (score confirmed + cleanup)
**Outcome:** Gradescope **50/50** (submission #416305568). Infrastructure since destroyed (cost cleanup); fully reproducible via `make apply`.

## What was done
Built and deployed the Part 01 authentication microservice — `POST /auth` on API Gateway → `authenticate` Lambda → MySQL `authsvc` DB on the shared backbone RDS. Login (username/password → token) and token-verify (token → userid) modes, with the assignment's exact 400/401/500 error contract. Terraform-native: generic `lambda-layer` module ×2 (bcrypt, pymysql), `lambda-authenticate`, `api-authsvc`.

## Key decisions (the "why")
- **Path A (reuse backbone RDS), not a new instance** — assignment assumes an existing MySQL server; we added only the `authsvc` *database* via `create-authsvc.sql`. Never touched the shared RDS instance.
- **File-based config, not env-vars** — the starter handler reads a packaged `authsvc-config.ini`; Terraform templates the live RDS endpoint into that INI inside the deployment zip.
- **Committed layer zips** (no Docker layer build) + **public RDS endpoint** (no VPC-attached Lambda) — simplest path that works for the lab.
- **IAM**: role `lab-project-authenticate-role` under `LabProjectPermissionsBoundary` (Plane-2 contract); DB auth is the MySQL user, not IAM.

## How it was verified
Full assignment oracle flow confirmed **live** before submit: wrong-password→401, login→200+token, verify→200+userid, expired-token→401. The deployed service answered correctly end-to-end.

## Open threads
- `authsvc` **database remains on the backbone RDS** (created via `make db-init`, not Terraform-managed, so `make destroy` left it). Harmless/free; drop with a one-line SQL if a spotless server is wanted.
- Part 02 (chat/register) is **cancelled** (instructor) — out of scope; artifacts left in place (`scratch/part02-cancelled/`).

## Where the detail lives
`projects/project03/MetaFiles/`: `6_8_Part1_Memo.md` (approach), `6_8_Part1_Hosting_Plan.md` (design), `6_8_Part1_Architecture.html` + `6_8_Part1_IAM.html` (diagrams), `6_8_Part1_ExecutionMap.md` (checkpoint-by-checkpoint log). Operate via `make` from `projects/project03/`.
