# Lab 04 — Serverless (Lambda + API Gateway)

Terraform-only deployment for the Lab 04 autograder: **analyze** (Rekognition) and **weather** (Open Meteo) behind API Gateway REST **`ServicesAPI`**.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Plane-2 IAM** | Roles `lab-project04-analyze-role`, `lab-project04-weather-role` with `LabProjectPermissionsBoundary`. See `infra/bootstrap/plane2-iam-delegation/` and `projects/project02/MetaFiles/5_18_IAM_Requirements.md`. |
| **Terraform** | `>= 1.5` |
| **Docker** | Required on macOS to build the **Linux** `requests` Lambda layer (`infra/scripts/build-requests-layer.sh`). |
| **AWS profile** | Default **`Claude-Conjurer`** via lab secrets (see below). **`ErikTheWizard`** works after `aws sso login` if you prefer SSO. |
| **Gradescope** | Token at `mbai460-client/.gradescope`; instructor image built from repo root (`./docker/build`). |

### AWS credentials (Claude-Conjurer)

From any shell:

```bash
# from MBAi460-Group1 repo root:
source ../claude-workspace/aws-env.sh

# from labs/lab04/:
source ../../../claude-workspace/aws-env.sh
```

Sets `AWS_PROFILE=Claude-Conjurer` and project-local credential files.

Or pass a profile on every Make/terraform invocation:

```bash
make -C labs/lab04 apply AWS_PROFILE=ErikTheWizard
```

Copy `infra/envs/dev/terraform.tfvars.example` → `terraform.tfvars` (gitignored) to override `aws_profile` permanently.

## Operator lifecycle

```text
preflight → init → plan → apply → config → test-api → submit → destroy
```

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `make -C labs/lab04 preflight` | Docker, Terraform, sources, optional STS (Gradescope token warned if missing) |
| 2 | `make -C labs/lab04 init` | Provider plugins |
| 3 | `make -C labs/lab04 plan` | Review IAM + Lambda + API creates |
| 4 | `make -C labs/lab04 apply` | Provision stack (~24 resources) |
| 5 | `make -C labs/lab04 config` | Write `lab04-client-config.ini` (`[client] webservice=…`) |
| 6 | `make -C labs/lab04 test-api` | cURL `GET /weather/US/Chicago` + `PUT /analysis` |
| 7 | `make -C labs/lab04 submit` | Docker Gradescope CLI submit |
| 8 | `make -C labs/lab04 destroy` | Cost cleanup when done |

In-repo tests (no AWS): `make -C labs/lab04 test` (run `make init` first so `terraform validate` is included)

### Re-apply after destroy

`terraform destroy` removes API Gateway and Lambdas. Gradescope scores are **not** affected by destroy. To spin up again:

```bash
make -C labs/lab04 apply
make -C labs/lab04 config
make -C labs/lab04 test-api
```

A destroyed API returns **403** on curl — that is expected until you re-apply.

## API (after apply)

| Method | Path | Lambda |
|--------|------|--------|
| `PUT` | `/analysis` | `analyze.py` — JSON `{"name","bytes"}` (base64 image) |
| `GET` | `/weather/{country}/{city}` | `weather.py` — Open Meteo |

`terraform output -raw invoke_url` → `[client] webservice` in INI (**no trailing slash**).

## Gradescope

Assignment config: `lab04-client-config.ini` (gitignored). Submit:

```bash
make -C labs/lab04 submit
```

Manual Docker (from lab04 dir) matches `scripts/submit-gradescope.sh`. Activate the best submission on Gradescope if you submit more than once.

## Implementation notes

- **Layer zip layout:** top-level `python/` directory inside `requests-layer.zip` (not flat `requests/`). Built with `public.ecr.aws/lambda/python:3.12` for **linux/amd64**.
- **Role names:** `lab-project04-*` per Plane-2 contract (not ad-hoc `lab04-*` policies).
- **State:** `infra/envs/dev/terraform.tfstate` is gitignored; lock file `.terraform.lock.hcl` is committed.

## Layout

```text
labs/lab04/
  analyze.py              # instructor Rekognition handler
  weather.py              # student Open Meteo handler
  lambda_common.py        # shared API Gateway JSON response helper
  infra/
    modules/              # lambda-function, lambda-layer-requests, api-services
    envs/dev/             # Terraform root
    scripts/              # layer build, write-client-config
    __tests__/            # module contract tests
  tools/
    preflight.sh          # operator gate
    test-api.sh           # live API smoke
    __tests__/            # script harness tests
  scripts/submit-gradescope.sh
  Makefile
```
