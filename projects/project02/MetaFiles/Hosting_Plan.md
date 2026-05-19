# Hosting plan — platform team (Elastic Beanstalk + local verification)

Audience: **platform / EB** owners who ship the **Node PhotoApp web service**. This doc lists **what to deploy**, **runtime requirements on AWS**, and **how to test locally** before or after EB, using repo-native tooling.

The **Python / Streamlit client** and **`make client-*`** flows are **not** part of EB hosting; they consume the same HTTP API once it is live.

---

## 1. What you are hosting

**One artifact:** the **Express API** under `projects/project02/server/` — same process as `node server.js`, listening on **`PORT`** (Elastic Beanstalk sets this).

**Not in the classic course EB bundle:** Docker image from `server/Dockerfile` (that path is for local Compose). Part 02 per the handout is a **directory of `.js` + `photoapp-config.ini` + `package.json`** run by the **Node** platform on EB, unless you deliberately adopt a container-based EB variant (out of scope for the PDF flow).

### 1.1 Lab IAM naming (Plane-2)

For the shared lab account where **`Claude-Conjurer`** uses **`ClaudeConjurerPlane2IAMDelegation`**, **new** EB/Lambda **roles**, **instance profiles**, and **customer** IAM policies **must** follow the **`lab-project-*`** prefix and **`LabProjectPermissionsBoundary`** on roles. **Canonical rules:** **`infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md`**. EB-focused detail and acceptance criteria: **`MetaFiles/5_18_IAM_Requirements.md`**. Terraform examples in this doc use **`lab-project-eb-service-role`** / **`lab-project-eb-ec2-role`** for that reason; course PDFs may still say **`aws-elasticbeanstalk-*`** — treat PDF names as generic assignment text, not this account’s enforced prefix.

**First-time account setup (Path A — recommended):** an admin runs the bootstrap with `create_lab_project_eb_roles = true` so the shared EB service role, EC2 role, and instance profile exist before any Project02 apply. **Path B** (Project02 module creates the roles) is supported but reserved for accounts that should not have a shared bootstrap state — never enable both. See **`5_18_IAM_Requirements.md` § Path A vs Path B**.

**IAM contract preflight:** before `terraform apply`, run

```bash
projects/project02/tools/eb-preflight.sh --aws-profile <profile> --check-iam-contract
```

to verify the EB role and instance profile exist under the expected names (override with `EB_SERVICE_ROLE_NAME` / `EB_EC2_INSTANCE_PROFILE_NAME` for documented exceptions).

---

## 2. Files and directories to include in the EB `app/` bundle

Copy everything required for **`npm install`** (or `npm ci`) and **`npm start`** → **`node server.js`**.

### 2.1 Must ship (runtime)

| Path (under `server/`) | Purpose |
|------------------------|---------|
| `server.js` | Process entry; graceful shutdown; uses `PORT`. |
| `app.js` | Express application. |
| `package.json` | Dependencies and `"start": "node server.js"`. Prefer **`package-lock.json`** from the monorepo root workspace if your EB build runs `npm ci`. |
| `routes/` | HTTP handlers (`v1`, `_internal/readyz`). |
| `middleware/` | Request ID, logging, validation, errors. |
| `services/` | DB pool, breakers. |
| `observability/` | Pino (and tracing if used). |
| `schemas/` | Request validation modules used by routes. |
| `src/photoapp-core/` | **Required** — config, services, repositories, middleware, schemas. |

### 2.2 Omit (typical)

| Path | Reason |
|------|--------|
| `tests/` | Jest only; not needed on EC2. |
| `jest.config.js`, `eslint.config.js`, `commitlint.config.cjs` | Dev tooling. |
| `Dockerfile` | Local / Compose image build. |
| `_assignment-template/` | Instructor starter; exclude from production bundle. |
| Root-level `api_*.js` | Legacy; **canonical app** mounts `routes/v1/*` — omit if nothing requires them. |

### 2.3 Server config on the instance

| File | Notes |
|------|--------|
| **`photoapp-config.ini`** | **Production-shaped** RDS, S3, region, credentials (or IAM pattern your loader supports). Source of truth in-repo: `client/photoapp-config.ini` (gitignored); **do not** ship LocalStack example values to EB. |

**Path resolution:** `server/src/photoapp-core/config.js` uses:

1. `process.env.PHOTOAPP_CONFIG_PATH` if set  
2. else a monorepo path under `client/photoapp-config.ini` (**will not exist** on EB unless you mirror that layout)

**Platform action:** set **Elastic Beanstalk environment property** `PHOTOAPP_CONFIG_PATH` to the **absolute path** of the deployed INI (commonly under `var/app/current/…`; confirm with your EB Node layout), e.g. the file copied next to `server.js` as `./photoapp-config.ini` resolved to full path if your platform documents it.

### 2.4 Environment variables (EB)

| Variable | Role |
|----------|------|
| `PORT` | Set by EB; **must** be honored (already used in code). |
| `PHOTOAPP_CONFIG_PATH` | **Required** if the bundle does not include `projects/project02/client/photoapp-config.ini` at the hard-coded fallback path. |
| `NODE_ENV` | Optional; `production` for EB. |
| AWS SDK | Prefer **instance profile** on EC2; align with how `photoapp-config.ini` supplies or omits static keys. |

---

## 3. Course / Lab 03 workflow (reference)

Official steps live in **`project02-part02-EB.pdf`** and **Lab 03** materials:

- IAM roles: course materials often reference **`aws-elasticbeanstalk-service-role`** and **`aws-elasticbeanstalk-ec2-role`**. **This repo / Plane-2 lab account** standard is **`lab-project-*`** (see **`MetaFiles/5_18_IAM_Requirements.md`** and **`infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md`**).
- Copy of Lab **create / update / delete** scripts; **`app/`** filled with the bundle above.
- **`eb create`** with correct service role and instance profile; health reporting **basic** per handout.
- **`eb status`** → CNAME for `http://…elasticbeanstalk.com`.

This repo does **not** replace those scripts; it supplies **which source tree** to package.

---

## 4. Terraform-native Project02 flow

The preferred Project02 path consumes the reusable scaffold at
`labs/lab03-production-grade/` and then lets Terraform own the EB resources.

### 4.1 Stage the EB bundle

From `projects/project02/`:

```bash
make eb-preflight
```

If preflight is red, fix the missing local inputs first. It checks for:

- real `client/photoapp-config.ini`
- `infra/envs/dev/terraform.tfvars`
- staged EB bundle
- usable AWS profile
- (with `--check-iam-contract`) the existence of `lab-project-eb-service-role` and the `lab-project-eb-ec2-role` instance profile in the caller's account

Then stage the bundle:

```bash
make eb-bundle
```

This requires the real, gitignored `client/photoapp-config.ini` and writes:

- `build/eb/project02-photoapp-dev.zip`
- `build/eb/project02-photoapp-dev.manifest.txt`

For a non-secret dry run:

```bash
make eb-bundle-example
```

### 4.2 Wire Terraform variables

Copy `infra/envs/dev/terraform.tfvars.example` to `terraform.tfvars`, then set:

- `enable_elastic_beanstalk = true`
- `eb_solution_stack_name` to the newest Node.js EB platform available in the target region
- `eb_vpc_id`
- `eb_subnet_ids`
- `eb_artifact_bucket_name`
- `eb_bundle_path = "../../../build/eb/project02-photoapp-dev.zip"`
- `eb_version_label = "project02-photoapp-dev"`
- `eb_create_iam_roles = false` unless the active AWS identity can manage IAM **and** respects **`lab-project-*`** + permissions boundary (see contract).
- `eb_existing_service_role_name = "lab-project-eb-service-role"`
- `eb_existing_ec2_instance_profile_name = "lab-project-eb-ec2-role"`

Use **`aws-elasticbeanstalk-service-role`** / **`aws-elasticbeanstalk-ec2-role`** only if the account still uses legacy wizard names and an **admin** exception is documented—not the default for Plane-2 contract accounts.

Check available Node platforms with:

```bash
aws elasticbeanstalk list-available-solution-stacks \
  --region us-east-2 | grep -i "Node.js"
```

Project02 currently declares `node >=24` in `server/package.json`; if EB does
not offer Node 24, use the newest available Node.js platform and rely on
post-deploy smoke tests to prove compatibility.

If `enable_core_infra = false`, Terraform deploys only the EB lane and reuses
the RDS/S3/IAM values already referenced by `client/photoapp-config.ini`. This
is the safer default when the class lab infrastructure already exists.

**IAM caveat:** EB environment creation requires the caller to pass the EB
service role / EC2 instance profile. Names **must** match **`lab-project-*`** for **`Claude-ConjurerPlane2IAMDelegation`** (`PassRole` is scoped that way). If apply fails with `Unable to assign role`,
confirm the role ARNs in tfvars match the contract, switch `aws_profile` to a capable identity, or use an **admin** path for legacy **`aws-elasticbeanstalk-*`** roles. `make eb-preflight` verifies AWS authentication, but it does not prove
`iam:PassRole`.

### 4.3 Plan/apply with operator approval

```bash
cd infra/envs/dev
terraform init
terraform plan
```

Only run `terraform apply` after reviewing the plan for unexpected RDS/S3
replacement. EB should add an application, environment, version, artifact bucket,
service role, and EC2 instance profile.

### 4.4 Smoke the deployed URL

After Terraform outputs `elastic_beanstalk_url`, run:

```bash
make eb-smoke EB_URL=http://YOUR-EB-CNAME.elasticbeanstalk.com
```

The smoke helper checks `/healthz`, `/readyz`, `/ping`, `/users`, and `/images`.

---

## 5. How to test locally (same codebase, before or after EB)

Local testing uses **Docker Compose** from **`projects/project02/`**, **not** the EB CLI.

### 5.1 Prerequisites

- Docker Desktop (or equivalent).
- From repo root once: `npm install` at `MBAi460-Group1/` (workspace installs `projects/project02/server`).

### 5.2 AWS lane (closest to EB behavior)

**Requires** real `client/photoapp-config.ini` (RDS + S3 + credentials / IAM shape for real AWS).

```bash
cd projects/project02
make docker-up-aws
```

- API: **http://localhost:8080**
- Quick checks: `curl -s http://localhost:8080/healthz` → `{"status":"live"}`; `curl -s http://localhost:8080/readyz` if RDS/S3 are wired; `curl -s http://localhost:8080/users` (shape depends on data).

Logs: `docker compose logs -f server`

Stop: `make docker-down`

### 5.3 LocalStack lane (offline)

**Uses** `client/photoapp-config.ini.example` + local MySQL + LocalStack (no real AWS).

```bash
cd projects/project02
make docker-up-localstack
```

Same host port **8080**; good for **CI-shaped** validation when AWS is unavailable.

Stop: `make docker-down`

### 5.4 Host-only Node (optional, no Docker)

From monorepo root:

```bash
npm install
cd projects/project02/server
export PHOTOAPP_CONFIG_PATH=/absolute/path/to/photoapp-config.ini
export PORT=8080
npm start
```

Useful for quick debugging; **Compose** better matches “clean room” parity with containerized deps.

### 5.5 Optional automated gate

```bash
bash tools/phase1-smoke.sh
```

Runs Jest layers plus Compose/AWS-lane checks per project docs; use when validating **merge readiness**, not as a substitute for **EB** post-deploy checks.

---

## 6. After EB deploy — smoke checks

1. Browser or curl: `http://<CNAME>/users` and/or `/images` (handout).
2. Confirm **`photoapp-client-config.ini`** uses `webservice=http://<CNAME>` (no trailing slash, `http` per handout).
3. Run Python client or Streamlit **against the EB URL** if the team owns client verification.

**Known PDF caveat:** uploads **> 1MB** may fail with the course EB configuration.

---

## 7. Quick reference

| Question | Answer |
|----------|--------|
| What ships to EB? | `server/` runtime tree + **`photoapp-config.ini`** + **`package.json`** (+ lockfile if `npm ci`). |
| What sets config path on EB? | **`PHOTOAPP_CONFIG_PATH`** environment property (recommended). |
| What stages the EB bundle? | `make eb-bundle` via `labs/lab03-production-grade/bin/stage-eb-node-app.sh`. |
| What smokes the EB CNAME? | `make eb-smoke EB_URL=http://...`. |
| Does `make docker-up-aws` deploy EB? | **No** — local Compose only. |
| IAM names (Plane-2 lab)? | **`lab-project-*`** per **`infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md`**; EB examples **`lab-project-eb-service-role`**, **`lab-project-eb-ec2-role`**. |
| Entry command | `npm start` → `node server.js` |

Related: **`MetaFiles/Submission_Plan.md`** (Gradescope INIs for Part 02), **`README.md`** (Compose lanes), **`server/README.md`** (config + layout).
