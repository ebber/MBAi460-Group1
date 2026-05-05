# Class Project utils

Operational scripts for the MBAi 460 Class Project — Docker lifecycle, AWS scanning, database management, security/rotation, and Phase 0 library-extraction validation.

> **CWD:** all scripts run from the Class Project repo root (`MBAi460-Group1/`).
>
> **Self-documentation:** every script (one outlier — `Erik-AWS-Scan`, queued for fix) carries a leading comment header documenting purpose, behavior, and caveats. When something here is unclear, `head -25 utils/<name>` is faster than searching this README. A `--help` flag harmonization that prints these headers automatically is also queued.

## Quickstart

| Goal | Command |
|---|---|
| Diagnose lab health | `utils/aws-probe` |
| Verify infra is up after `terraform apply` | `utils/smoke-test-aws --mode live` |
| Verify infra is gone after `terraform destroy` | `utils/smoke-test-aws --mode dead` |
| Run a SQL file against RDS | `utils/run-sql <file>` |
| Validate DB schema (26 checks) | `utils/validate-db` |
| Pre-commit credential scan | `utils/cred-sweep` |
| Get a shell inside the lab Docker image | `utils/docker-run` |

## Reference

### Docker lifecycle

Mac/Colima only — hard-fail on Linux or Docker Desktop.

| Script | Purpose | Notes |
|---|---|---|
| `docker-status` | Docker/Colima health check | Standard preflight gate; canonical implementation behind lab-sphere `lab-status` |
| `docker-up` | Start Docker/Colima runtime | |
| `docker-down` | Stop Docker/Colima + cleanup containers | |
| `docker-run` | Interactive container, default mounts | Mounts `.` into `/home/user`; `--network host`; runs as user `user` |
| `docker-run-8080` | Same with port 8080 exposed | For testing services that bind to 8080 |

### AWS scanning

| Script | Purpose | Auth | Notes |
|---|---|---|---|
| `aws-probe` | Read-only diagnostic — composes Terraform state list + RDS describe + `smoke-test-aws --mode live` + recommended next action | profile chain (caller env > ErikTheWizard SSO > Claude-Conjurer fallback) | Front door for "something's wrong, diagnose" |
| `aws-inventory` | Full AWS estate scan; labels resources `[TF]` (Terraform-managed) vs `[MANUAL]` | `Claude-Conjurer` | IAM section reports "PowerUserAccess — IAM not visible" (expected) |
| `Erik-AWS-Scan` | Resource Explorer + S3/RDS/SG scan | `ErikTheWizard` SSO only | Personal scan; complements aws-inventory |
| `smoke-test-aws` | S3 + RDS smoke test; `--mode live` (post-apply) or `--mode dead` (post-destroy) | env-aware credential resolution | Auto-falls-back to `~/.aws/{config,credentials}` if repo `secrets/` files absent |

### Database (Docker-dependent)

All require Colima/Docker running — preflight via `lab-status` first.

| Script | Purpose | Notes |
|---|---|---|
| `run-sql <file>` | Run a SQL file against the live RDS instance via Docker | Reads endpoint from `infra/config/photoapp-config.ini`; reads admin password from `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt` |
| `validate-db` | 26-check photoapp DB validation suite | Uses same config sources as run-sql |
| `rebuild-db` | ⚠️ Drop + recreate all photoapp tables; runs `create-photoapp.sql` → `create-photoapp-labels.sql` → `validate-db` | **Destructive.** Prompts `type 'rebuild'` to confirm |

### Security / rotation

| Script | Purpose | Auth | Notes |
|---|---|---|---|
| `cred-sweep` | Pre-commit credential scan — greps tracked files for AWS access key IDs, lab passwords, committed `terraform.tfvars`, RDS master password file | — | Exit 1 on any hit; wireable as pre-commit hook |
| `rotate-passwords` | Rotate `photoapp-read-only` + `photoapp-read-write` MySQL passwords; updates configs + revalidates | RDS master password | ⚠️ Prompts `type 'rotate'`. Does NOT rotate IAM keys |
| `rotate-access-keys` | Rotate `s3readonly` + `s3readwrite` IAM access keys via `terraform apply -replace`; writes new keys to client config | requires `iam:CreateAccessKey` + `iam:DeleteAccessKey` | 🔒 Erik-only — `Claude-Conjurer` (PowerUserAccess) cannot run |

### Phase 0 — library extraction validation

Built during the Project 02 Part 01 library extraction (Phase 0, 2026-05-02). All read-only sanity checks.

| Script | Purpose | Notes |
|---|---|---|
| `freshclone-smoke` | Verify the documented setup commands work from a clean clone | Clones current branch via `git clone --shared` to a tmp dir, runs `npm install` + canonical test commands; preserves tmp on failure for inspection |
| `lib-symlink-check` | Workspace install-state probe for `@mbai460/photoapp-server` — asserts symlink + `require()` resolution + version alignment across consumers | One-shot replacement for ad-hoc `ls`/`cat`/`node -e` debugging |
| `no-service-leak` | Pre-commit guard against re-introduction of library-resident files in `projects/*/server/` | Detects accidental copy of lib service core into consumers |

### Helpers — not invoked directly

| File | Used by | Purpose |
|---|---|---|
| `_run_sql.py` | `run-sql` | SQL file runner; reads endpoint + admin password; substitutes `${VAR}` placeholders |
| `_validate_db.py` | `validate-db` | 26-check validation logic |
| `boto_test.py` | (manual) | Docker sanity check — `python3 utils/boto_test.py` from inside container; verifies boto3 install (returns version string) |

## Conventions

- **Working directory.** All scripts run from the Class Project repo root (`MBAi460-Group1/`); they self-locate via `$0`. Terraform commands run from `infra/terraform/` instead.
- **Auth split.**
  - Most AWS-facing utils use the `Claude-Conjurer` profile (PowerUserAccess; cannot manage IAM)
  - `Erik-AWS-Scan` uses `ErikTheWizard` SSO exclusively
  - `aws-probe` chains: caller-set `AWS_PROFILE` > `ErikTheWizard` from `~/.aws/config` > `Claude-Conjurer` fallback
  - `smoke-test-aws` falls back to `~/.aws/{config,credentials}` when the repo's `secrets/` files are absent (SSO-friendly)
- **Docker preflight.** Database utils (`run-sql`, `validate-db`, `rebuild-db`, `rotate-passwords`) and `boto_test.py` require Docker/Colima. Run `utils/docker-status` first (or the lab-sphere wrapper `utils/lab-status`).
- **Destructive-confirmation pattern.** `rebuild-db` and `rotate-passwords` prompt for explicit `type 'rebuild'` / `type 'rotate'` strings before mutating state.
- **IAM gating.** `rotate-access-keys` requires IAM permissions; only Erik can run it.

## Related

- [`MetaFiles/QUICKSTART.md`](../MetaFiles/QUICKSTART.md) — collaborator setup walkthrough that exercises several of these utils in sequence
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — conventional-commits scopes (`feat(utils)` / `fix(utils)`) for changes to this directory
- [`infra/README.md`](../infra/README.md) — backbone configs consumed by `run-sql`, `validate-db`, `smoke-test-aws`
