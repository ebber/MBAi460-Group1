# QUICKSTART — New Contributor Environment Setup

Stand up the full AWS environment from scratch: secrets → Docker → Terraform → DB schema → verified.

> **⚠️ Known issue:** `utils/` bash scripts have stale path references from a prior repo layout.
> They will not work until that fix is applied. Steps below call this out explicitly.
> Tracked in `MetaFiles/TODO.md`.

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Docker + Colima | Container runtime for all utils | `brew install colima docker` |
| Terraform ≥ 1.0 | IaC — manages S3, RDS, SG | `brew install terraform` |
| Claude-Conjurer IAM credentials | AWS ops identity (PowerUserAccess) | Obtain from project owner |

---

## Step 1 — Create secrets/

These files are gitignored. Create them once locally and never commit them.

```bash
mkdir -p secrets
```

**`secrets/aws-credentials`:**
```ini
[Claude-Conjurer]
aws_access_key_id     = <ACCESS_KEY_ID>
aws_secret_access_key = <SECRET_ACCESS_KEY>
```

**`secrets/aws-config`:**
```ini
[profile Claude-Conjurer]
region = us-east-2
output = json
```

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
db_master_password = "<choose-a-strong-password>"
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

## Step 5 — Populate config files from Terraform outputs

After `apply` completes, read the outputs:

```bash
terraform -chdir=infra/terraform output rds_address
terraform -chdir=infra/terraform output s3_bucket_name
```

Copy examples and fill in real values:

```bash
cp infra/config/photoapp-config.ini.example infra/config/photoapp-config.ini
cp projects/project01/client/photoapp-config.ini.example projects/project01/client/photoapp-config.ini
```

In **`infra/config/photoapp-config.ini`** set:
- `[rds] endpoint` → value of `rds_address`
- `[rds] user_pwd` → password for `photoapp-read-only` MySQL user (set when running create-photoapp.sql)
- `[s3] bucket_name` → value of `s3_bucket_name`

In **`projects/project01/client/photoapp-config.ini`** set:
- `[rds] endpoint` → same `rds_address`
- `[rds] user_name` → `photoapp-read-write`
- `[rds] user_pwd` → password for `photoapp-read-write` MySQL user
- `[s3] bucket_name` → same `s3_bucket_name`

---

## ✅ Test 2 — Smoke test AWS

> **Requires utils path fix** (see warning above). Skip if not yet applied.

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"
utils/smoke-test-aws --mode live
```
Expected: 10/10 checks pass (S3 public read, RDS reachable, Terraform state consistent).

---

## Step 6 — Create DB schema

> **Requires utils path fix** (see warning above).

```bash
utils/run-sql projects/project01/create-photoapp.sql
```

This creates the `photoapp` database, tables, seed data, and the `photoapp-read-only` / `photoapp-read-write` MySQL users with their passwords. The passwords set here are what goes into the config files in Step 5.

---

## ✅ Test 3 — Validate DB

> **Requires utils path fix** (see warning above).

```bash
utils/validate-db
```
Expected: 26/26 checks pass. All tables, users, and seed data present.

---

## Teardown (when done)

```bash
export AWS_SHARED_CREDENTIALS_FILE="$(pwd)/secrets/aws-credentials"
export AWS_CONFIG_FILE="$(pwd)/secrets/aws-config"
cd infra/terraform && terraform destroy && cd ../..
utils/smoke-test-aws --mode dead   # verify all resources gone
```

---

## Key file map

| File | Tracked? | Purpose |
|------|---------|---------|
| `secrets/aws-credentials` | ❌ gitignored | IAM credentials for Claude-Conjurer |
| `secrets/aws-config` | ❌ gitignored | AWS region/profile config |
| `infra/terraform/terraform.tfvars` | ❌ gitignored | Terraform variable values incl. DB master password |
| `infra/config/photoapp-config.ini` | ❌ gitignored | Backbone config — RDS + S3; used by utils |
| `projects/project01/client/photoapp-config.ini` | ❌ gitignored | Client config — read-write user; used by project01 tests |
| `infra/config/photoapp-config.ini.example` | ✅ committed | Template for backbone config |
| `projects/project01/client/photoapp-config.ini.example` | ✅ committed | Template for client config |
