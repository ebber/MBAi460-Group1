# Utils Path Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 7 bash utility scripts so they work correctly when invoked from any directory — repo root, subdirectory, or via an invoking script.

**Architecture:** Every bash script currently computes paths relative to CWD or uses a REPO_ROOT that goes two levels up (correct when nested inside the lab repo, wrong for the standalone Class Project repo). The fix is a single consistent pattern: compute `CLASS_ROOT` from the script's own location using `$(dirname "$0")`, not from CWD. Credential paths switch from the hardcoded `claude-workspace/secrets/` layout to the standalone-repo `secrets/` layout with an env-var fallback so Erik's existing workflow is undisturbed. `docker/run` and `docker/run-8080` get the same script-relative fix for the image-name read; their `-v .:/home/user` mount is intentional and stays.

**Tech Stack:** bash, Docker, AWS CLI, Python 3

---

## Context for implementers

**Repo root:** `/Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/`
All commands in this plan run from there unless stated otherwise.

**The broken pattern (in most scripts):**
```bash
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"   # goes TWO levels up — wrong for standalone repo
# then references ${REPO_ROOT}/MBAi460-Group1/...  # adds back the prefix that no longer applies
```

**The fix pattern:**
```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"        # absolute path to the script's directory
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"       # one level up = repo root ✅
# references ${CLASS_ROOT}/... directly — no MBAi460-Group1/ prefix needed
```

**The credentials fix pattern (smoke-test-aws, aws-inventory):**
```bash
# Respect env var if already set (Erik's workflow: export AWS_SHARED_CREDENTIALS_FILE=...)
# Fall back to secrets/ inside the repo (collaborator layout per QUICKSTART Step 1)
export AWS_SHARED_CREDENTIALS_FILE="${AWS_SHARED_CREDENTIALS_FILE:-${CLASS_ROOT}/secrets/aws-credentials}"
export AWS_CONFIG_FILE="${AWS_CONFIG_FILE:-${CLASS_ROOT}/secrets/aws-config}"
```

**Testing approach:** bash scripts can't use unit test frameworks. Each task verifies the fix by:
1. Running the script from `infra/terraform/` (a subdirectory) before the fix and observing failure
2. Applying the fix
3. Running again from `infra/terraform/` and observing success

---

## File map

| File | Change |
|------|--------|
| `utils/docker-status` | Replace CWD guard with CLASS_ROOT-based check |
| `utils/docker-up` | Same + update informational path output |
| `utils/docker-down` | Same as docker-status |
| `utils/run-sql` | REPO_ROOT → CLASS_ROOT; SQL arg resolution; Docker invocation path |
| `utils/validate-db` | REPO_ROOT → CLASS_ROOT; Docker invocation path |
| `utils/smoke-test-aws` | REPO_ROOT → CLASS_ROOT; credentials env-var fallback |
| `utils/aws-inventory` | REPO_ROOT → CLASS_ROOT; credentials env-var fallback |
| `docker/run` | Script-relative image-name read |
| `docker/run-8080` | Script-relative image-name read |
| `MetaFiles/QUICKSTART.md` | Remove ⚠️ warning; update Test 2; update Step 6; update Teardown |

---

## Task 1: Fix docker-status, docker-up, docker-down

**Files:**
- Modify: `utils/docker-status`
- Modify: `utils/docker-up`
- Modify: `utils/docker-down`

- [ ] **Step 1: Verify current failure from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/docker-status 2>&1 | head -3; cd ../..
```
Expected: `[FAIL] Must run from repo root (missing ./MBAi460-Group1/docker directory)`

- [ ] **Step 2: Fix `utils/docker-status`**

Replace the entire file with:
```bash
#!/usr/bin/env bash
# utils/docker-status — Docker/Colima health check.
# Runnable from any directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE_NAME="${LAB_IMAGE:-mbai460-client}"

pass()    { printf "[PASS] %s\n" "$1"; }
warn()    { printf "[WARN] %s\n" "$1"; }
fail()    { printf "[FAIL] %s\n" "$1"; }
section() { printf "\n== %s ==\n" "$1"; }

if [[ ! -d "${CLASS_ROOT}/docker" ]]; then
  fail "Cannot locate docker/ directory under ${CLASS_ROOT}"
  exit 1
fi

COLIMA_RUNNING=false
DOCKER_REACHABLE=false

if colima status >/dev/null 2>&1; then COLIMA_RUNNING=true; fi
if docker ps >/dev/null 2>&1; then DOCKER_REACHABLE=true; fi

section "Docker Lab Status"

section "Colima"
if [[ "$COLIMA_RUNNING" == true ]]; then pass "Colima is running"
else warn "Colima is not running"; fi

section "Docker"
if [[ "$COLIMA_RUNNING" == true ]]; then
  if [[ "$DOCKER_REACHABLE" == true ]]; then pass "Docker daemon reachable"
  else fail "Docker daemon NOT reachable (unexpected)"; echo "Try: colima restart"; exit 1; fi
else
  pass "Docker daemon not reachable (Colima stopped)"
fi
CONTEXT="$(docker context show 2>/dev/null || true)"
if [[ -n "$CONTEXT" ]]; then pass "Docker context: $CONTEXT"
else warn "Could not determine Docker context"; fi

section "Images"
if [[ "$DOCKER_REACHABLE" == true ]]; then
  if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}:latest$"; then
    pass "Image ${IMAGE_NAME}:latest exists"
  else warn "Image ${IMAGE_NAME}:latest not found"; fi
else warn "Skipping image check (Docker daemon not reachable)"; fi

section "Containers"
if [[ "$DOCKER_REACHABLE" == true ]]; then
  RUNNING="$(docker ps --format '{{.Names}} ({{.Image}})')"
  if [[ -n "$RUNNING" ]]; then warn "Running containers:"; echo "$RUNNING" | sed 's/^/  - /'
  else pass "No running containers"; fi
  STOPPED="$(docker ps -a -f status=exited --format '{{.Names}} ({{.Image}})')"
  if [[ -n "$STOPPED" ]]; then warn "Stopped containers:"; echo "$STOPPED" | sed 's/^/  - /'
  else pass "No stopped containers"; fi
else warn "Skipping container check (Docker daemon not reachable)"; fi

section "Summary"
if [[ "$COLIMA_RUNNING" == true && "$DOCKER_REACHABLE" == true ]]; then pass "Lab is operational"
elif [[ "$COLIMA_RUNNING" == false ]]; then warn "Lab is powered down"
else warn "Lab is not fully operational"; fi

echo
echo ":)"
```

- [ ] **Step 3: Fix `utils/docker-up`**

Replace the entire file with:
```bash
#!/usr/bin/env bash
# utils/docker-up — Start Docker/Colima runtime.
# Runnable from any directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE_NAME="${LAB_IMAGE:-mbai460-client}"
RUN_CMD="${CLASS_ROOT}/docker/run"
RUN_8080_CMD="${CLASS_ROOT}/docker/run-8080"

pass()    { printf "[PASS] %s\n" "$1"; }
warn()    { printf "[WARN] %s\n" "$1"; }
fail()    { printf "[FAIL] %s\n" "$1"; }
section() { printf "\n== %s ==\n" "$1"; }

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    fail "Required command not found: $cmd"; exit 1
  fi
}

if [[ ! -d "${CLASS_ROOT}/docker" ]]; then
  fail "Cannot locate docker/ directory under ${CLASS_ROOT}"; exit 1
fi

section "Docker Lab Startup"
require_cmd colima
require_cmd docker

section "Runtime"
if colima status >/dev/null 2>&1; then pass "Colima already running"
else echo "Starting Colima..."; colima start; pass "Colima started"; fi

if docker ps >/dev/null 2>&1; then pass "Docker daemon reachable"
else fail "Docker daemon not reachable"; echo; echo "Try:"; echo "  colima status"; echo "  docker context ls"; exit 1; fi

section "Health Check"
CURRENT_CONTEXT="$(docker context show 2>/dev/null || true)"
if [[ -n "${CURRENT_CONTEXT}" ]]; then pass "Docker context: ${CURRENT_CONTEXT}"
else warn "Could not determine Docker context"; fi

if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}:latest$"; then
  pass "Image ${IMAGE_NAME}:latest exists"
else warn "Image ${IMAGE_NAME}:latest not found"; fi

RUNNING_COUNT="$(docker ps -q | wc -l | tr -d ' ')"
if [[ "${RUNNING_COUNT}" == "0" ]]; then pass "No containers currently running"
else warn "${RUNNING_COUNT} container(s) currently running"
  docker ps --format '  - {{.Names}} ({{.Image}})'; fi

STOPPED_COUNT="$(docker ps -aq -f status=exited | wc -l | tr -d ' ')"
if [[ "${STOPPED_COUNT}" == "0" ]]; then pass "No stopped containers lingering"
else warn "${STOPPED_COUNT} stopped container(s) lingering"
  docker ps -a -f status=exited --format '  - {{.Names}} ({{.Image}})'; fi

section "Next Steps"
echo "1. Open Cursor"
echo "2. Attach to running container when ready"
echo "3. Enter the class environment with:"
echo "   ${RUN_CMD}"
echo "   or"
echo "   ${RUN_8080_CMD}"
echo "4. Rebuild first with ${CLASS_ROOT}/docker/build if image needs refreshing"

echo
echo ":)"
```

- [ ] **Step 4: Fix `utils/docker-down`**

Replace the entire file with:
```bash
#!/usr/bin/env bash
# utils/docker-down — Stop Docker/Colima and clean up containers.
# Runnable from any directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

pass()    { printf "[PASS] %s\n" "$1"; }
warn()    { printf "[WARN] %s\n" "$1"; }
fail()    { printf "[FAIL] %s\n" "$1"; }
section() { printf "\n== %s ==\n" "$1"; }

if [[ ! -d "${CLASS_ROOT}/docker" ]]; then
  fail "Cannot locate docker/ directory under ${CLASS_ROOT}"; exit 1
fi

section "Docker Lab Shutdown"

section "Containers"
if docker ps >/dev/null 2>&1; then
  RUNNING_IDS="$(docker ps -q)"
  if [[ -n "$RUNNING_IDS" ]]; then
    warn "Stopping running containers..."
    docker stop $RUNNING_IDS >/dev/null
    pass "Running containers stopped"
  else pass "No running containers"; fi

  EXITED_IDS="$(docker ps -aq -f status=exited)"
  if [[ -n "$EXITED_IDS" ]]; then
    warn "Removing stopped containers..."
    docker rm $EXITED_IDS >/dev/null
    pass "Stopped containers removed"
  else pass "No stopped containers"; fi
else warn "Docker not reachable (skipping container cleanup)"; fi

section "Colima"
if colima status >/dev/null 2>&1; then
  echo "Stopping Colima..."; colima stop; pass "Colima stopped"
else pass "Colima already stopped"; fi

section "Final State"
if colima status >/dev/null 2>&1; then fail "Colima is still running"
else pass "Colima is not running"; fi
if docker ps >/dev/null 2>&1; then warn "Docker still reachable (unexpected)"
else pass "Docker daemon not reachable (expected)"; fi

echo
echo ":)"
```

- [ ] **Step 5: Verify fix from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/docker-status 2>&1 | head -5; cd ../..
```
Expected: `[PASS]` lines for Colima/Docker status — no "Must run from repo root" error.

- [ ] **Step 6: Verify fix from repo root (regression)**

Run:
```bash
utils/docker-status 2>&1 | tail -3
```
Expected: last line is `:)` — still works from repo root.

- [ ] **Step 7: Commit**

```bash
git add utils/docker-status utils/docker-up utils/docker-down
git commit -m "fix(utils): make docker-status/up/down runnable from any directory

Replace CWD-relative MBAi460-Group1/docker guard with CLASS_ROOT
computed from script location via dirname \$0.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Fix run-sql

**Files:**
- Modify: `utils/run-sql`

The key complexity here: the SQL file argument can be relative to CWD (any directory) or absolute. It must be converted to a path relative to CLASS_ROOT for the Docker invocation, since CLASS_ROOT is mounted at `/home/user`.

- [ ] **Step 1: Verify current failure from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/run-sql ../../projects/project01/create-photoapp.sql 2>&1 | head -3; cd ../..
```
Expected: `[ERROR] SQL file not found: ...`

- [ ] **Step 2: Fix `utils/run-sql`**

Replace the entire file with:
```bash
#!/usr/bin/env bash
# utils/run-sql <path-to-sql-file>
# Runs a SQL file against the live RDS instance via Docker.
# Reads endpoint from infra/config/photoapp-config.ini
# Reads admin password from labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt
# SQL file path may be absolute or relative to current working directory.
# Runnable from any directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE=$(cat "${CLASS_ROOT}/docker/_image-name.txt")

if [[ $# -ne 1 ]]; then
  echo "Usage: utils/run-sql <path-to-sql-file>"
  echo "Example: utils/run-sql projects/project01/create-photoapp.sql"
  exit 1
fi

# Resolve SQL file to an absolute path (works regardless of CWD)
if [[ "$1" = /* ]]; then
  SQL_ABS="$1"
else
  SQL_ABS="$(cd "$(dirname "$1")" 2>/dev/null && pwd)/$(basename "$1")"
fi

# Derive path relative to CLASS_ROOT for use inside Docker
SQL_REL="${SQL_ABS#${CLASS_ROOT}/}"
if [[ "$SQL_REL" = "$SQL_ABS" ]]; then
  echo "[ERROR] SQL file must be inside the repo (${CLASS_ROOT})"
  echo "        Got: $1"
  exit 1
fi

if [[ ! -f "${CLASS_ROOT}/${SQL_REL}" ]]; then
  echo "[ERROR] SQL file not found: ${CLASS_ROOT}/${SQL_REL}"
  exit 1
fi

echo "Running SQL file: ${SQL_REL}"
echo "Via Docker image: ${IMAGE}"
echo ""

docker run --rm -u user -w /home/user \
  -v "${CLASS_ROOT}:/home/user" \
  --network host \
  "$IMAGE" python3 utils/_run_sql.py "$SQL_REL"
```

- [ ] **Step 3: Verify fix — relative path from repo root**

Run:
```bash
utils/run-sql projects/project01/create-photoapp.sql 2>&1 | tail -4
```
Expected: `Statements: 20 | OK: 20 | Errors: 0` and `All statements executed successfully.`

- [ ] **Step 4: Verify fix — relative path from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/run-sql ../../projects/project01/create-photoapp.sql 2>&1 | tail -4; cd ../..
```
Expected: same success output.

- [ ] **Step 5: Verify fix — absolute path**

Run:
```bash
bash utils/run-sql "$(pwd)/projects/project01/create-photoapp.sql" 2>&1 | tail -4
```
Expected: same success output.

- [ ] **Step 6: Commit**

```bash
git add utils/run-sql
git commit -m "fix(utils): make run-sql runnable from any directory

Use CLASS_ROOT from script location. Convert SQL arg to absolute
path then derive CLASS_ROOT-relative path for Docker mount.
Accepts relative (any CWD) or absolute SQL file paths.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Fix validate-db

**Files:**
- Modify: `utils/validate-db`

- [ ] **Step 1: Verify current behavior from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/validate-db 2>&1 | tail -5; cd ../..
```
Expected: passes 26/26 for Erik (compensated by lab repo layout) but will fail for a fresh clone. Document the output.

- [ ] **Step 2: Fix `utils/validate-db`**

Replace the entire file with:
```bash
#!/usr/bin/env bash
# utils/validate-db
# Runs the 26-check photoapp database validation suite via Docker.
# Reads endpoint from infra/config/photoapp-config.ini
# Reads admin password from labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt
# Runnable from any directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE=$(cat "${CLASS_ROOT}/docker/_image-name.txt")

echo "Running photoapp DB validation suite..."
echo "Via Docker image: ${IMAGE}"
echo ""

docker run --rm -u user -w /home/user \
  -v "${CLASS_ROOT}:/home/user" \
  --network host \
  "$IMAGE" python3 utils/_validate_db.py
```

- [ ] **Step 3: Verify fix from repo root**

Run:
```bash
utils/validate-db 2>&1 | tail -5
```
Expected: `Checks: 26 | Passed: 26 | Failed: 0` and `ALL CHECKS PASSED`

- [ ] **Step 4: Verify fix from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/validate-db 2>&1 | tail -5; cd ../..
```
Expected: same 26/26 result.

- [ ] **Step 5: Commit**

```bash
git add utils/validate-db
git commit -m "fix(utils): make validate-db runnable from any directory

Use CLASS_ROOT from script location. Mount CLASS_ROOT directly
at /home/user — removes MBAi460-Group1/ indirection.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Fix smoke-test-aws and aws-inventory

**Files:**
- Modify: `utils/smoke-test-aws`
- Modify: `utils/aws-inventory`

Both scripts hardcode `${REPO_ROOT}/claude-workspace/secrets/` for credentials, which only works in Erik's lab-repo layout. The fix respects `AWS_SHARED_CREDENTIALS_FILE` if already set (Erik's workflow), otherwise falls back to `${CLASS_ROOT}/secrets/` (collaborator layout per QUICKSTART).

- [ ] **Step 1: Verify current credential path in smoke-test-aws**

Run:
```bash
grep "AWS_SHARED_CREDENTIALS_FILE\|REPO_ROOT" utils/smoke-test-aws | head -5
```
Expected: shows `REPO_ROOT=.../../..` and `claude-workspace/secrets/aws-credentials`

- [ ] **Step 2: Fix the REPO_ROOT block in `utils/smoke-test-aws`**

Find and replace this block near the top of the file (lines 9–14):
```bash
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONFIG="${REPO_ROOT}/MBAi460-Group1/infra/config/photoapp-config.ini"
TF_DIR="${REPO_ROOT}/MBAi460-Group1/infra/terraform"

export AWS_SHARED_CREDENTIALS_FILE="${REPO_ROOT}/claude-workspace/secrets/aws-credentials"
export AWS_CONFIG_FILE="${REPO_ROOT}/claude-workspace/secrets/aws-config"
export AWS_PROFILE="Claude-Conjurer"
```

Replace with:
```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG="${CLASS_ROOT}/infra/config/photoapp-config.ini"
TF_DIR="${CLASS_ROOT}/infra/terraform"

export AWS_SHARED_CREDENTIALS_FILE="${AWS_SHARED_CREDENTIALS_FILE:-${CLASS_ROOT}/secrets/aws-credentials}"
export AWS_CONFIG_FILE="${AWS_CONFIG_FILE:-${CLASS_ROOT}/secrets/aws-config}"
export AWS_PROFILE="Claude-Conjurer"
```

- [ ] **Step 3: Fix the REPO_ROOT block in `utils/aws-inventory`**

Find and replace this block near the top of the file (lines 9–14):
```bash
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TF_DIR="${REPO_ROOT}/MBAi460-Group1/infra/terraform"

export AWS_SHARED_CREDENTIALS_FILE="${REPO_ROOT}/claude-workspace/secrets/aws-credentials"
export AWS_CONFIG_FILE="${REPO_ROOT}/claude-workspace/secrets/aws-config"
export AWS_PROFILE="Claude-Conjurer"
```

Replace with:
```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TF_DIR="${CLASS_ROOT}/infra/terraform"

export AWS_SHARED_CREDENTIALS_FILE="${AWS_SHARED_CREDENTIALS_FILE:-${CLASS_ROOT}/secrets/aws-credentials}"
export AWS_CONFIG_FILE="${AWS_CONFIG_FILE:-${CLASS_ROOT}/secrets/aws-config}"
export AWS_PROFILE="Claude-Conjurer"
```

- [ ] **Step 4: Verify smoke-test-aws from repo root**

Run:
```bash
utils/smoke-test-aws --mode live 2>&1 | tail -6
```
Expected: `Mode: live | Checks: 10 | Passed: 10 | Failed: 0` and `ALL CHECKS PASSED`

- [ ] **Step 5: Verify smoke-test-aws from subdirectory**

Run:
```bash
cd infra/terraform && bash ../../utils/smoke-test-aws --mode live 2>&1 | tail -6; cd ../..
```
Expected: same 10/10 result.

- [ ] **Step 6: Verify aws-inventory from repo root (spot check — AWS call, just check it starts)**

Run:
```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"  # these are at lab level for Erik
utils/aws-inventory 2>&1 | head -8
```
Expected: header banner with account ID, no credential errors.

- [ ] **Step 7: Commit**

```bash
git add utils/smoke-test-aws utils/aws-inventory
git commit -m "fix(utils): make smoke-test-aws and aws-inventory runnable from any directory

Use CLASS_ROOT from script location. Credentials: respect
AWS_SHARED_CREDENTIALS_FILE env var if set (existing workflow),
fall back to secrets/ inside repo (collaborator layout).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Fix docker/run and docker/run-8080

**Files:**
- Modify: `docker/run`
- Modify: `docker/run-8080`

Only the image-name read is broken — `./docker/_image-name.txt` is CWD-relative. The `-v .:/home/user` mount is intentional design and stays unchanged.

- [ ] **Step 1: Verify current failure from lab root**

Run (from lab root, one level above MBAi460-Group1/):
```bash
cd .. && bash MBAi460-Group1/docker/run 2>&1 | head -3; cd MBAi460-Group1
```
Expected: `bash: ./docker/_image-name.txt: No such file or directory` or similar error reading the image name.

- [ ] **Step 2: Fix `docker/run`**

Replace the entire file with:
```bash
#!/bin/bash
#
# BASH script to run docker image in a docker container.
# Mounts the current working directory as /home/user inside Docker.
# Run from the directory you want as your Docker home (typically repo root).
#
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
read -r image < "${SCRIPT_DIR}/_image-name.txt"
#
#  -it  => interactive
#  -u   => run as this user
#  -w   => home dir inside container
#  -v   => map current dir (.) to home dir
#  --rm => remove container when done
#
docker run -it -u user -w /home/user -v .:/home/user --network host --rm "$image" bash
```

- [ ] **Step 3: Fix `docker/run-8080`**

Replace the entire file with:
```bash
#!/bin/bash
#
# BASH script to run docker image in a docker container with port 8080 exposed.
# Mounts the current working directory as /home/user inside Docker.
# Run from the directory you want as your Docker home (typically repo root).
#
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
read -r image < "${SCRIPT_DIR}/_image-name.txt"
#
#  -it  => interactive
#  -u   => run as this user
#  -w   => home dir inside container
#  -v   => map current dir (.) to home dir
#  -p   => expose port 8080
#  --rm => remove container when done
#
docker run -it -u user -w /home/user -v .:/home/user -p 8080:8080 --rm "$image" bash
```

- [ ] **Step 4: Verify fix — image name resolves from lab root**

Run (from the lab root, one level above MBAi460-Group1/):
```bash
cd .. && MBAi460-Group1/docker/run --help 2>&1 | head -3; cd MBAi460-Group1
```
Expected: Docker usage output or interactive prompt start (not a file-not-found error). Ctrl-C if it opens a shell.

- [ ] **Step 5: Verify fix — still works from repo root (regression)**

Run from `MBAi460-Group1/`:
```bash
echo "dry run — image name reads correctly:"
bash -c 'SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"; read -r img < "${SCRIPT_DIR}/_image-name.txt"; echo "$img"' docker/run
```
Expected: prints `mbai460-client` (or the current image name from `docker/_image-name.txt`).

- [ ] **Step 6: Commit**

```bash
git add docker/run docker/run-8080
git commit -m "fix(docker): make run scripts work regardless of CWD

Use script-relative path for _image-name.txt read.
The -v .:/home/user Docker mount is intentional (CWD = Docker home).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Update QUICKSTART.md

**Files:**
- Modify: `MetaFiles/QUICKSTART.md`

With all utils fixed, the top-level warning, Test 2, and Step 6 need to be updated to reflect that utils now work correctly.

- [ ] **Step 1: Remove the top-level ⚠️ warning block**

Remove these lines from the top of the file (lines 5–11):
```
> **⚠️ Known issue: `utils/` bash wrapper scripts are broken for fresh standalone clones.**
> They compute paths assuming `MBAi460-Group1/` is a *subdirectory* of the repo root, which was
> true in the original lab layout but is not true after the standalone repo split.
> **Workaround:** use the direct `docker run` commands shown in each step below — they work
> correctly from the repo root of a fresh clone.
> The underlying Python helpers (`utils/_run_sql.py`, `utils/_validate_db.py`) are fine.
> Fix tracked in `MetaFiles/TODO.md`.
```

- [ ] **Step 2: Restore Test 2 (smoke-test-aws)**

Replace the Test 2 section:
```markdown
## ✅ Test 2 — Smoke test AWS

> **⚠️ Blocked on utils path fix.** `smoke-test-aws` hardcodes credential paths using `REPO_ROOT`
> and cannot be overridden from outside. Skip this test for now.
> Substitute: confirm in the AWS console that your S3 bucket and RDS instance exist and are available.
> Then proceed — Test 3 (`validate-db`) directly confirms DB connectivity with the app user credentials.
> Tracked in `MetaFiles/TODO.md`.
```

With:
```markdown
## ✅ Test 2 — Smoke test AWS

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"
utils/smoke-test-aws --mode live
```
Expected: `Mode: live | Checks: 10 | Passed: 10 | Failed: 0`
```

- [ ] **Step 3: Update Step 6 to use utils/ commands (preferred) with docker run as fallback**

Replace the Step 6 section body:
```markdown
> Uses direct `docker run` commands — these work correctly from repo root without the bash wrapper.

```bash
IMAGE=$(cat docker/_image-name.txt)

# PhotoApp database (users, assets tables + seed data + photoapp-read-only/read-write users)
docker run --rm -u user -v "$(pwd):/home/user" -w /home/user --network host \
  "$IMAGE" python3 utils/_run_sql.py projects/project01/create-photoapp.sql

# URL Shortener database (shorten table + shorten-app user)
docker run --rm -u user -v "$(pwd):/home/user" -w /home/user --network host \
  "$IMAGE" python3 utils/_run_sql.py labs/lab02/create-shorten.sql
```
```

With:
```markdown
```bash
utils/run-sql projects/project01/create-photoapp.sql
utils/run-sql labs/lab02/create-shorten.sql
```
```

- [ ] **Step 4: Update Test 3 to use utils/ command**

Replace the Test 3 section body:
```markdown
```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -v "$(pwd):/home/user" -w /home/user --network host \
  "$IMAGE" python3 utils/_validate_db.py
```
```

With:
```markdown
```bash
utils/validate-db
```
```

- [ ] **Step 5: Update Teardown smoke test**

Replace:
```markdown
Verify resources are gone: check the AWS console (S3 + RDS) or — if you have applied the utils path fix — run:
```bash
utils/smoke-test-aws --mode dead
```
```

With:
```markdown
```bash
utils/smoke-test-aws --mode dead
```
```

- [ ] **Step 6: Verify QUICKSTART reads cleanly**

Read through the full file and confirm:
- No remaining references to "utils path fix"
- No remaining `docker run --rm -u user ...` workaround blocks in Steps 6 and Test 3
- Test 2 has a working smoke-test command
- Teardown has a clean smoke-test command

- [ ] **Step 7: Mark TODO item resolved**

In `MetaFiles/TODO.md`, mark the utils path fix item as done:
```
- [x] **[Tooling] utils/ path fix** — ...
```

- [ ] **Step 8: Commit**

```bash
git add MetaFiles/QUICKSTART.md MetaFiles/TODO.md
git commit -m "docs: update QUICKSTART now that utils path fix is complete

Remove workaround warnings. Restore utils/ commands throughout.
Mark TODO item resolved.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Final verification

After all tasks complete, run the full end-to-end check from a subdirectory to confirm everything works:

```bash
cd infra/terraform

# Docker
bash ../../utils/docker-status 2>&1 | tail -3

# DB
bash ../../utils/validate-db 2>&1 | tail -5

# SQL rebuild
bash ../../utils/run-sql ../../projects/project01/create-photoapp.sql 2>&1 | tail -3
bash ../../utils/run-sql ../../labs/lab02/create-shorten.sql 2>&1 | tail -3

# AWS
bash ../../utils/smoke-test-aws --mode live 2>&1 | tail -5

cd ../..
```

All should pass with no path errors.
