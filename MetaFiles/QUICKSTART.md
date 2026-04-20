# QUICKSTART — New Contributor Environment Setup

Stand up the full AWS environment from scratch: secrets → Docker → Terraform → DB schema → verified.

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Docker + Colima | Container runtime for all utils | `brew install colima docker` |
| Terraform ≥ 1.0 | IaC — manages S3, RDS, SG | `brew install terraform` |
| Claude-Conjurer IAM credentials | AWS ops identity (PowerUserAccess) | Obtain from project owner |

All commands below assume **repo root** as your working directory:
```bash
cd /path/to/MBAi460-Group1   # wherever you cloned the repo
```

---

## Step 1 — Create secrets/

These files are gitignored. Create them once locally and never commit them.

```bash
mkdir -p secrets
mkdir -p "labs/lab01/Part 01 - AWS Setup/secrets"
```

**`secrets/aws-credentials`** — IAM credentials for Terraform and AWS CLI utils:
```ini
[Claude-Conjurer]
aws_access_key_id     = <ACCESS_KEY_ID>
aws_secret_access_key = <SECRET_ACCESS_KEY>
```

**`secrets/aws-config`** — AWS region/profile config:
```ini
[profile Claude-Conjurer]
region = us-east-2
output = json
```

**`labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`** — RDS admin password (used by `run-sql` and `validate-db`):
```
<your-rds-master-password>
```
> This must match `db_master_password` in `terraform.tfvars` (Step 3). Pick it now and use it consistently.

---

## Step 2 — Build Docker image

Run from repo root:
```bash
docker/build
```
Expected: image `mbai460-client` built successfully.

---

## ✅ Test 1 — Verify Docker + boto3

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -v "$(pwd):/home/user" -w /home/user "$IMAGE" python3 utils/boto_test.py
```
Expected: a boto3 version string (e.g. `1.42.83`). If this fails, the Docker image is broken — stop here.

---

## Step 3 — Create Terraform variables

Create `infra/terraform/terraform.tfvars` (gitignored — never committed):

```hcl
bucket_name        = "photoapp-<yourname>-mbai460"   # globally unique, lowercase
db_identifier      = "photoapp-db"
db_master_username = "admin"
db_master_password = "<your-rds-master-password>"    # same value as Step 1
```

---

## Step 4 — Stand up AWS infrastructure

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"

cd infra/terraform
terraform init
terraform plan      # review before applying
terraform apply     # ~5 min — RDS takes longest
cd ../..
```

---

## Step 5 — Populate config files

After `apply` completes, read the outputs:

```bash
terraform -chdir=infra/terraform output rds_address
terraform -chdir=infra/terraform output s3_bucket_name
```

Copy all three example templates and fill in real values:

```bash
cp infra/config/photoapp-config.ini.example        infra/config/photoapp-config.ini
cp projects/project01/client/photoapp-config.ini.example  projects/project01/client/photoapp-config.ini
cp labs/lab02/shorten-config.ini.example           labs/lab02/shorten-config.ini
```

> **How passwords work:** The SQL schema files use `${PLACEHOLDER}` variables instead of
> hardcoded passwords. When you run `run-sql`, it reads these config files and substitutes
> the placeholders before executing. **You choose the passwords here** — whatever you put
> in the config files is what gets applied to RDS.

### `infra/config/photoapp-config.ini`
Backbone config — used by `validate-db` and AWS utils.
```ini
[rds]
endpoint    = <rds_address output>
port_number = 3306
region_name = us-east-2
user_name   = photoapp-read-only
user_pwd    = <choose a password for photoapp-read-only>
db_name     = photoapp

[s3]
bucket_name = <s3_bucket_name output>
region_name = us-east-2
```

### `projects/project01/client/photoapp-config.ini`
Client config — used by project01 code and `validate-db`.
```ini
[rds]
endpoint    = <same rds_address>
port_number = 3306
region_name = us-east-2
user_name   = photoapp-read-write
user_pwd    = <choose a password for photoapp-read-write>
db_name     = photoapp

[s3]
bucket_name = <same s3_bucket_name>
region_name = us-east-2
```

### `labs/lab02/shorten-config.ini`
URL Shortener config — used by lab02 code and `run-sql create-shorten.sql`.
```ini
[rds]
endpoint    = <same rds_address>
port_number = 3306
region_name = us-east-2
user_name   = shorten-app
user_pwd    = <choose a password for shorten-app>
db_name     = URL_Shortener
```

> **Password tips:** Use random 16-char passwords. Avoid `%` — Python's configparser treats
> it as an interpolation character. Safe charset: `A-Z a-z 0-9 ! @ # ^ & *`
> Quick generator: `python3 -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits+'!@#^&*') for _ in range(16)))"`

---

## ✅ Test 2 — Smoke test AWS

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"
utils/smoke-test-aws --mode live
```
Expected: `Mode: live | Checks: 10 | Passed: 10 | Failed: 0`

---

## Step 6 — Create DB schema

```bash
utils/run-sql projects/project01/create-photoapp.sql
utils/run-sql labs/lab02/create-shorten.sql
```

Passwords are read from the config files you created in Step 5 and substituted automatically.
Both commands should report `Statements: N | OK: N | Errors: 0`.

---

## ✅ Test 3 — Validate DB

```bash
utils/validate-db
```
Expected: `Checks: 26 | Passed: 26 | Failed: 0`. Validates schema, seed data, AUTO_INCREMENT values, and both app user connections.

---

## Gradescope submission

The `gs` CLI lives inside the Docker image. Submissions run from inside a container. The Gradescope auth token (`.gradescope`) is gitignored and lives **outside** the Class Project repo — typically at the lab repo root or wherever the project owner keeps it.

```bash
# The token file is NOT inside MBAi460-Group1/ — you must bind-mount it explicitly
docker run --rm -u user \
  -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" \
  -v "/path/to/.gradescope:/home/user/.gradescope:ro" \
  --network host \
  mbai460-client \
  bash -c '/gradescope/gs submit <course_id> <assignment_id> *.py *.ini'
```

> **Token location for this project:** `mbai460-client/.gradescope` (parent lab repo root).
> Mount path inside container must be `/home/user/.gradescope`.

---

## Teardown (when done)

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"

cd infra/terraform && terraform destroy && cd ../..
```

Verify resources are gone: check the AWS console (S3 + RDS) or run:
```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"
utils/smoke-test-aws --mode dead
```
Expected: 10/10 checks confirm all resources gone.

---

## Key file map

| File | Tracked? | Purpose |
|------|---------|---------|
| `secrets/aws-credentials` | ❌ gitignored | IAM credentials for Claude-Conjurer |
| `secrets/aws-config` | ❌ gitignored | AWS region/profile config |
| `infra/terraform/terraform.tfvars` | ❌ gitignored | Terraform variable values incl. DB master password |
| `labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt` | ❌ gitignored | RDS admin password; read by `run-sql` and `validate-db` |
| `infra/config/photoapp-config.ini` | ❌ gitignored | Backbone config — photoapp-read-only password + S3; used by validate-db |
| `projects/project01/client/photoapp-config.ini` | ❌ gitignored | Client config — photoapp-read-write password; used by project01 code |
| `labs/lab02/shorten-config.ini` | ❌ gitignored | URL Shortener config — shorten-app password; used by lab02 code |
| `.gradescope` | ❌ gitignored | Gradescope auth token — required for `gs submit`; NOT inside the repo |
| `infra/config/photoapp-config.ini.example` | ✅ committed | Template for backbone config |
| `projects/project01/client/photoapp-config.ini.example` | ✅ committed | Template for client config |
| `labs/lab02/shorten-config.ini.example` | ✅ committed | Template for URL Shortener config |
