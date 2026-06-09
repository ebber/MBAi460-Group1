# Project 03 · Part 01 (authsvc) — Approach Memo

*For collaborators reading cold. What we built, how, and how to run it.*
**Status:** deployed + live-verified (4/4) + submitted to Gradescope (#416305568). Service left **live** for grading.

> **Scope note:** Instructor **cancelled Part 02** (chat / `register`). This work is **Part 01 only** — the authentication microservice. Part 02 artifacts are left in place but out-of-scope (see `scratch/part02-cancelled/`).

## What it is
A single endpoint — **`POST /auth`** — on API Gateway, backed by the **`authenticate`** Lambda, talking to a MySQL **`authsvc`** database on the shared backbone RDS. Two modes (JSON body):
- **Login** `{username, password, [duration]}` → `200` + token string.
- **Verify** `{token}` → `200` + userid string.
- Errors: `400` (bad/missing body), `401` (`invalid username|password|token`, `expired token`), `500`.

## Architecture (Terraform-native)
- **API Gateway** REST `authsvc-api`, route `POST /auth`, stage `prod`, Lambda-proxy (`AWS_PROXY`) integration.
- **Lambda** `authenticate` — python3.12, **x86_64**, 300s timeout, layers `authsvc-bcrypt-layer` + `authsvc-pymysql-layer` (committed zips).
- **DB** `authsvc` on backbone RDS `photoapp-db` (**Path A** — reuse the shared server; no new RDS). Tables `users` + `tokens`, seed users, `authsvc-read-write` DB user.
- **Config is file-based:** Terraform templates `authsvc-config.ini` (real RDS endpoint injected) **into the deployment zip** — not Lambda env-vars.
- **IAM:** role `lab-project-authenticate-role` + `LabProjectPermissionsBoundary` + `lambda.amazonaws.com` trust + `AWSLambdaBasicExecutionRole`. DB auth is **not** IAM — it's the MySQL user/password in the packaged INI.

Open the diagrams in a browser: **`6_8_Part1_Architecture.html`**, **`6_8_Part1_IAM.html`**.

## How to operate (`make` from `projects/project03/`)
| Target | Does |
|--------|------|
| `make db-init` | apply `create-authsvc.sql` to the backbone RDS (idempotent) |
| `make init` / `plan` / `apply` | deploy the Lambda + layers + API Gateway |
| `make config` | generate the two Gradescope INIs from live outputs |
| `make test-api` | live cURL smoke (wrong-pwd → login → verify) |
| `make submit` | Gradescope submit via the instructor Docker image |
| `make destroy` | tear down **Project 03** resources only — **never** the backbone RDS |

> The Makefile points AWS at `claude-workspace/secrets/` (the lab's real creds path). Generated INIs (`authsvc-config.ini`, `authsvc-client-config.ini`) carry DB creds / live URLs and are **gitignored** — regenerate with `make config`.

## Key decisions
Path A backbone RDS · committed layer zips (no Docker layer build) · public RDS endpoint (no VPC-attached Lambda) · `rds_address` as a Terraform variable · one **generic `lambda-layer` module instantiated twice** (DRY).

## Where the detail lives
- `6_8_Part1_Approach.md` — full runbook + embedded spec (the source of truth).
- `6_8_Part1_Hosting_Plan.md` — design decisions + module layout.
- `6_8_Part1_ExecutionMap.md` — checkpoint-by-checkpoint execution log + decision-point ledger.
