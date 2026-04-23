# Phase 2 — 2B Infra & Tooling Sweep Findings

**Swept:** 2026-04-23
**Scope:** `utils/` scripts (path logic, Docker deps, CWD, credentials), `infra/terraform/` (profile, tfvars, state), `docker/` (cross-platform, CWD)

---

## ✅ Clean — No Action Required

| Script / File | Status |
|---------------|--------|
| `utils/run-sql` | `CLASS_ROOT` from `SCRIPT_DIR` — runnable from any dir; validates SQL file is inside repo ✅ |
| `utils/validate-db` | `CLASS_ROOT` from `SCRIPT_DIR`; `_image-name.txt` existence check ✅ |
| `utils/smoke-test-aws` | `CLASS_ROOT` from `SCRIPT_DIR`; `AWS_PROFILE` defaults to `Claude-Conjurer`; correct `secrets/` path ✅ |
| `utils/aws-inventory` | Same pattern as smoke-test-aws ✅ |
| `utils/cred-sweep` | `CLASS_ROOT` from `SCRIPT_DIR`; uses `git -C "$CLASS_ROOT"` correctly ✅ |
| `utils/rebuild-db` | `CLASS_ROOT` from `SCRIPT_DIR`; invokes sibling scripts via `${SCRIPT_DIR}/` ✅ |
| `utils/rotate-access-keys` | Correctly documented as Erik-only (IAM permissions); uses `CLASS_ROOT` ✅ |
| `utils/docker-run` / `docker-run-8080` | Uses `${SCRIPT_DIR}/../docker/_image-name.txt` — runnable from any dir ✅ |
| `infra/terraform/main.tf` | `aws_profile = var.aws_profile` (default `"Claude-Conjurer"`) — A3 complete ✅ |
| `infra/terraform/.gitignore` | Mirrors root `.gitignore` (belt-and-suspenders for sensitive files) ✅ |
| `infra/terraform/outputs.tf` | IAM access keys marked `sensitive = true` ✅ |
| `docker/` multi-platform | `.bash`, `.bat`, `.ps1` variants for build/run/run-8080 ✅ |

---

## Findings

### S2B-1 — 🟠 Risk — `rotate-passwords` only updates one config file; `validate-db` reads two

`_validate_db.py` reads credentials from **two** config files:
- `infra/config/photoapp-config.ini` → `[rds] user_pwd` = `photoapp-read-only` password
- `projects/project01/client/photoapp-config.ini` → `[rds] user_pwd` = `photoapp-read-write` password

`utils/rotate-passwords` rotates both passwords in RDS, then writes `NEW_RW_PWD` to `projects/project01/client/photoapp-config.ini` only. It does **not** update `infra/config/photoapp-config.ini` with `NEW_RO_PWD`.

**Result:** `validate-db` (called at the end of `rotate-passwords`) reads the stale `photoapp-read-only` password from `infra/config/` and fails to connect — the password was just changed in RDS.

**Fix required in `utils/rotate-passwords`:** After updating `projects/project01/client/photoapp-config.ini`, also write `NEW_RO_PWD` to `infra/config/photoapp-config.ini [rds] user_pwd`.

**Note:** `infra/README.md` also understates this relationship — it says `config/photoapp-config.ini` is consumed by validate-db but doesn't mention the second config file.

---

### S2B-2 — 🟠 Risk — `docker-status`, `docker-up`, `docker-down` hard-fail on non-Colima Docker

All three Docker lifecycle utils contain:
```bash
require_cmd colima
```
On any system without Colima (Linux with native Docker, Docker Desktop on Mac/Windows), the script exits immediately:
```
[FAIL] Required command not found: colima
```

A collaborator on Linux or using Docker Desktop cannot use `docker-up`, `docker-down`, or `docker-status`. The `docker/run.bash` and `docker/build` scripts work fine (no Colima dependency) — but there's no util-style wrapper for non-Colima Docker environments.

**Options:** (a) add a Colima check with graceful fallback for non-Colima Docker; (b) document this as Mac/Colima-specific in the script headers; (c) add a `docker-status-linux` equivalent. At minimum, headers should say "Mac/Colima only."

---

### S2B-3 — 🟡 Good Practice — No `terraform.tfvars.example` template (QUICKSTART covers it; .example adds consistency)

`infra/terraform/terraform.tfvars` is gitignored. There is no `.example` template.

A collaborator who clones the repo has no template showing:
- That `terraform.tfvars` must be created before `terraform apply`
- What variables are required (`bucket_name`, `db_identifier`, `db_master_password`)
- The expected format

They'd need to read `variables.tf` and infer the format themselves — high friction for a first-time setup.

**QUICKSTART.md may cover this** (to verify in 2C). If QUICKSTART.md provides the full content to copy, this is reduced to 🟡. If QUICKSTART.md only says "fill in terraform.tfvars," it's a blocker.

**Fix:** Add `infra/terraform/terraform.tfvars.example`:
```hcl
# Copy to terraform.tfvars and fill in your values.
# terraform.tfvars is gitignored — never commit it.

bucket_name        = "photoapp-<yourname>-mbai460"
db_identifier      = "photoapp-db"
db_master_username = "admin"
db_master_password = "<strong-password-min-8-chars>"

# Optional: override AWS profile (defaults to "Claude-Conjurer")
# aws_profile = "YourProfile"
```

---

### S2B-4 — 🟡 Good Practice — `docker/run.bash` and `docker/build` require CWD = repo root

These scripts use `read -r image < ./docker/_image-name.txt` — a CWD-relative path. They must be run from `MBAi460-Group1/` root. `docker-up`'s "Next Steps" output shows `${CLASS_ROOT}/docker/build` as an absolute path, but running that path from a non-root CWD would fail (the script itself uses `./docker/`).

These are class-provided scripts with known limitations — partly expected. But the headers don't document the CWD requirement clearly. The `utils/docker-run` wrapper correctly uses `SCRIPT_DIR`-relative paths and is the better entry point.

**Fix:** Add `# Must be run from MBAi460-Group1/ root` comment to `docker/build` and `docker/run.bash`; or update `docker-up` "Next Steps" to say: `cd <repo-root> && docker/build`.

---

### S2B-5 — 🟡 Good Practice — `smoke-test-aws` and `aws-inventory` require host-side `aws` CLI

These scripts run on the host (not inside Docker) and invoke `aws` directly. If a collaborator only has Docker set up but not the host-side AWS CLI, the scripts fail silently on the first `aws` command. There's no `require_cmd aws` check.

**Fix:** Add `require_cmd aws` at the top of both scripts (same pattern as `require_cmd colima` in docker scripts). Also note in QUICKSTART.md that some utils run host-side and require `aws` CLI on the host.

---

### S2B-6 — Already queued — `terraform.tfvars` plaintext on disk

Live `db_master_password` in gitignored `terraform.tfvars`. T15 from Phase 1 triage. No new action.

---

## Summary Counts

| Tag | Count |
|-----|-------|
| 🔴 Blocker | 0 |
| 🟠 Risk | 2 (S2B-1 rotate-passwords bug, S2B-2 Colima hard-fail) |
| 🟡 Good Practice | 3 (S2B-3 tfvars.example, S2B-4 docker CWD, S2B-5 aws CLI check) |
| ✨ Polish | 0 |
| Already queued | 1 (S2B-6 = T15) |
