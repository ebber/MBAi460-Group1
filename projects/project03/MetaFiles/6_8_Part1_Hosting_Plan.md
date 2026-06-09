# Project 03 — Part 01 · Hosting Plan (Checkpoint 3.1)

**Date:** 2026-06-09 · **Status:** Design — for **DP-6 (architecture) + DP-7 (IAM)** sign-off before any Terraform.
**Grounding:** lab04 infra pattern audit (verified) + `LAB_PROJECT_IAM_CONTRACT.md` + backbone `infra/terraform/outputs.tf` + the starter `lambda/` source. See `6_8_Part1_ExecutionMap.md` CP-3 log.

---

## Approved resource names (Erik 2026-06-09)
| Resource | Name | Source |
|----------|------|--------|
| Lambda function | `authenticate` | assignment-fixed |
| Lambda IAM role | `lab-project-authenticate-role` | IAM contract `lab-project-*` glob |
| API Gateway (REST) | `authsvc-api` | free choice (autograder uses invoke URL) |
| bcrypt layer | `authsvc-bcrypt-layer` | free (layers not IAM-prefixed) |
| pymysql layer | `authsvc-pymysql-layer` | free |
| API stage | `prod` | invoke URL ends `/prod` |

## Design decisions (verified vs. backbone reality)
| Decision | Choice | Why |
|----------|--------|-----|
| **RDS** | **Path A** — consume backbone `photoapp-db` for the `authsvc` DB (already created in CP-1) | RDS verified `available`; assignment expects an existing server |
| **RDS address into TF** | **input variable** `rds_address` (from `infra/config/photoapp-config.ini` / verified endpoint) | backbone terraform not init'd locally → `terraform_remote_state` unreliable; a var is simpler + explicit |
| **Config injection** | **templated `authsvc-config.ini` packaged into the zip** (`templatefile()` injects `rds_address`) | starter `lambda_function.py` does `configur.read('authsvc-config.ini')` — file-based, **not** env-vars |
| **Layers** | committed `layers/{bcrypt,pymysql}-layer.zip` → plain `aws_lambda_layer_version` (`filename` + `filebase64sha256`) | zips already in repo; drop lab04's Docker/`null_resource` build |
| **VPC** | **none** | backbone RDS is `public=True` (verified; TCP 3306 reachable) → Lambda reaches it on the public endpoint |
| **Lambda** | `python3.12`, **x86_64**, timeout **300s**, layers = [bcrypt, pymysql] | assignment spec |
| **API** | REST (`aws_api_gateway_*`), one `/auth` POST, `AWS_PROXY` integration, deployment + `prod` stage | mirrors lab04; assignment wants Lambda-proxy `POST /auth` |
| **DB schema** | `make db-init` via `utils/_run_sql.py` (done in CP-1) | not Terraform-managed (approach "middle path") |

## Module layout (`projects/project03/infra/`)
```
infra/
├── modules/
│   ├── lambda-layer/          # GENERIC — instantiated twice (bcrypt, pymysql). DRY vs. approach's 2 modules.
│   ├── lambda-authenticate/   # archive_file zip (.py + templated INI) + IAM role/boundary/trust + log group + function
│   └── api-authsvc/           # rest_api + /auth resource + POST method + AWS_PROXY integration + permission + deployment + stage
├── envs/dev/
│   ├── main.tf  variables.tf  outputs.tf  versions.tf  terraform.tfvars.example
├── scripts/
│   ├── write-authsvc-config.sh         # server INI from tf outputs (gitignored output)
│   └── write-authsvc-client-config.sh  # client INI from invoke_url (no trailing slash)
└── __tests__/
    └── project03-modules.test.sh       # Tier-A grep-contract + fmt/validate
```
> **Deviation from approach §3.1 (surfaced):** approach lists separate `lambda-layer-bcrypt` + `lambda-layer-pymysql` modules; I propose **one generic `lambda-layer` module instantiated twice** (DRY; matches lab04's single-layer-module shape). Flag if you prefer two.

## IAM (DP-7)
- Role `lab-project-authenticate-role`, `permissions_boundary = arn:aws:iam::772360735396:policy/LabProjectPermissionsBoundary`, trust `lambda.amazonaws.com`.
- Managed policy: `AWSLambdaBasicExecutionRole` (CloudWatch logs). **No VPC policy** (public RDS). **No RDS IAM** — MySQL auth is username/password (`authsvc-read-write`/`def456!!` in the packaged INI).
- `aws_lambda_permission` (principal `apigateway.amazonaws.com`, source_arn `${execution_arn}/*/*`) lives in the `api-authsvc` module.
- Caller is `Claude-Conjurer` (PowerUserAccess + `ClaudeConjurerPlane2IAMDelegation`) — permitted to create `lab-project-*` roles with the boundary + PassRole to `lambda.amazonaws.com` (contract §4).

## Config templating (the key adaptation)
`lambda-authenticate` packages the zip via `archive_file` with: `lambda_function.py`, `datatier.py`, `auth.py`, `api_utils.py`, and a **`templatefile()`-rendered `authsvc-config.ini`**:
```
[rds]
endpoint = ${rds_address}      # injected
port_number = 3306
region_name = us-east-2
user_name = authsvc-read-write
user_pwd = def456!!
db_name = authsvc
```
The rendered INI is gitignored (never committed); the `.tftpl` template IS committed.

## Test plan
- **Tier-A (pre-apply):** `infra/__tests__/project03-modules.test.sh` — module dirs exist; `terraform fmt -check`; `terraform validate` (post-init); grep-contract for role name `lab-project-authenticate-role`, `path_part = "auth"`, POST method, layer names.
- **Tier-B (post-apply, live):** `tools/test-api.sh` drives `POST /auth` (login → token verify → expiry); reachability/wiring smoke. Full pass requires CP-4 TODOs.

## Operator surface (Makefile — mirrors lab04)
`help · preflight · test · db-init · init · validate · plan · apply · config · test-api · submit · destroy`

## DP gates
- **DP-6** architecture diagram sign-off · **DP-7** IAM diagram sign-off — **both required before Terraform**.
- **DP-8** `terraform plan` review · **DP-9** apply approval · **DP-10** Lambda↔RDS reachability.
