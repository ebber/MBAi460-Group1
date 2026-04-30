# Future-State Workstream: CI/CD Pipeline

> **Status:** Future State. Out of scope for Project 02 Part 01. Captured here so the design isn't lost; until this workstream lands, the same operations run locally as a pre-submit checklist using the existing utils (`utils/cred-sweep` before commit, `utils/smoke-test-aws` after `terraform apply`, `utils/validate-db` after schema changes, `utils/aws-inventory` for drift detection, etc.).
>
> **Aligns with `MBAi460-Group1/MetaFiles/TODO.md`** ("remote state for Terraform"; "cred-sweep `--delta` mode and allowlist") and `MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md` (CloudWatch dashboards + alarms; Secrets Manager). When this workstream lands, those upstream items must be coordinated — see "Dependencies on shared backbone" below.

## Goal

Build a GitHub Actions pipeline that takes the engineering surface from `04-engineering-surface.md` and turns it into a continuously-validated production pipeline: every PR runs the full P0 test pyramid, every merge to `main` builds and pushes a Docker image to ECR, applies Terraform on the dev account, deploys to Elastic Beanstalk with a health-gated rollback, and runs the post-deploy smoke + live regression. Production deploys gate on the smoke and live regression results from `04-engineering-surface.md`.

## Scope

This workstream owns:

- `.github/workflows/ci.yml` — PR + push validation (lint, unit, integration, contract).
- `.github/workflows/deploy-dev.yml` — auto-deploy to dev on `main` push.
- `.github/workflows/deploy-prod.yml` — manual-trigger production deploy with approval gate.
- `.github/workflows/nightly-live-regression.yml` — nightly cron against staging.
- `.github/actions/setup-node-py/` — composite action: install Node + Python + Terraform with caching.
- OIDC trust between GitHub Actions and AWS — long-lived static creds are forbidden.
- ECR repo + Terraform plumbing for image storage.
- Slack notifications on green / red builds (via `incoming-webhook`).
- PR ephemeral environment templates (optional Phase 2 below).

This workstream does **not** own:

- The actual test suites — owned by `01-foundation.md` (harness) + per-route workstreams (cases).
- The Terraform modules — owned by `01-foundation.md` + `04-engineering-surface.md`.
- The application code itself.

## Dependencies

Read first:

- `00-overview-and-conventions.md`
- `01-foundation.md` (acceptance complete; lint + test pyramid wired)
- `02-web-service.md` (Gradescope server 60/60)
- `03-client-api.md` (Gradescope client 30/30)
- `04-engineering-surface.md` (engineering surface complete; live regression runs cleanly on demand)

Required state:

- AWS account with permissions to create OIDC provider + IAM role + ECR repo + EB env.
- GitHub repo with Actions enabled.
- Slack workspace with an incoming webhook URL.
- Production-tier `photoapp-config.ini` materials available in AWS Secrets Manager (Part 02 work).

### Dependencies on shared backbone

Before this workstream can land cleanly, the following items from the shared `MBAi460-Group1/` backbone need to ship (most are tracked in `MBAi460-Group1/infra/MetaFiles/TODO.md` and `MBAi460-Group1/MetaFiles/TODO.md`):

- [ ] **Remote Terraform state** (S3 + DynamoDB lock). Local state in `infra/terraform/terraform.tfstate` won't survive multi-runner parallel `terraform apply`. Until this lands, dev-deploy serializes via a single workflow concurrency group.
- [ ] **`utils/cred-sweep --strict` / `--delta` modes** so a CI run can enforce strictly-clean staging without false-positive history scans.
- [ ] **Secrets Manager / Parameter Store** holding the production-tier `photoapp-config.ini` values. Until this lands, dev-deploy reads from the existing `infra/config/photoapp-config.ini` mounted via Terraform user-data (acceptable for the dev account; not for prod).
- [ ] **Resource tagging** (`Owner`, `Project`, `Env`, `AgentSafe`) on every Terraform-managed resource. Already on `infra/MetaFiles/TODO.md`. The CI gate `terraform-plan-tags-check` enforces this.
- [ ] Existing `utils/` are reused inside CI: `utils/cred-sweep` is the secret-scan step; `utils/aws-inventory` is the drift-check step (run nightly + post-deploy); `utils/smoke-test-aws` is the post-deploy smoke step; `utils/validate-db` is the post-migration step.

## Target Files

```text
.github/
  workflows/
    ci.yml                              # PR + push validation
    deploy-dev.yml                      # main → dev account
    deploy-prod.yml                     # manual → prod account
    nightly-live-regression.yml         # cron 06:00 UTC
  actions/
    setup-node-py/
      action.yml
      README.md
projects/project02/infra/
  modules/
    ecr/                                # NEW
      main.tf
      variables.tf
      outputs.tf
      README.md
    github_oidc/                        # NEW
      main.tf
      variables.tf
      outputs.tf
      README.md
  envs/
    dev/                                # extended with ecr + github_oidc modules (composes existing rds/s3/iam from 01-foundation Phase 12)
    prod/                               # mirror
docs/
  ci-cd.md                              # operator runbook
```

## Design Decisions

- **CI1 — OIDC for AWS auth, never static keys.** Each workflow assumes a role via `aws-actions/configure-aws-credentials` with `role-to-assume` from `${{ secrets.AWS_ROLE_TO_ASSUME }}`. The role's trust policy pins `repo:<org>/<repo>:ref:refs/heads/main` for prod and `repo:<org>/<repo>:pull_request` for CI.
- **CI2 — Pyramid order matters.** Unit (fast, mocked) → integration (compose) → contract → smoke → happy-path → live (gated). Live runs on the nightly schedule and on manual `workflow_dispatch`, never on every PR.
- **CI3 — Cache by lockfile hash.** Node `node_modules`, Python venv, Terraform plugins, Docker layer cache (via `actions/cache` + buildx).
- **CI4 — Separate jobs for separate signals.** `lint`, `test-unit`, `test-integration`, `test-contract`, `terraform-plan` are independent jobs; failure in one doesn't mask another.
- **CI5 — Required status checks gate merges.** Branch protection on `main`: every PR must pass `lint`, `test-unit`, `test-integration`, `test-contract`, `terraform-plan`. The PR cannot merge red.
- **CI6 — Health-gated EB deploys.** `deploy-dev.yml` invokes `eb deploy` with `--timeout 10`; if the EB environment health goes `Yellow` or `Red` after deploy, the workflow rolls back via `eb rollback` and fails the build.
- **CI7 — Production gates on dev signal + manual approval.** `deploy-prod.yml` requires (a) the latest dev deploy passed, (b) a GitHub Environment approval reviewer, (c) explicit version selection.
- **CI8 — Nightly live regression on staging only.** Production traffic stays untouched. Failure pages the on-call (later workstream).
- **CI9 — Slack signal is concise.** Green builds: silent. Red builds: paging the responsible team via the Slack webhook.

> **Optional Mermaid Visualization Step (strongly recommended — branch-protection design)** — suggested file `visualizations/Target-State-project02-cicd-pipeline-v1.md`
>
> Before authoring any workflow YAML, render a `flowchart LR` of the **end-to-end pipeline** so the gates are unambiguous before they're written.
>
> - **Story**: "PR opens → CI fan-out (lint, unit, integration, contract, plan) → merge gate → dev deploy → smoke → manual approval → prod deploy → post-deploy live regression → rollback gate."
> - **Focus**: highlight the **two gates** in **red**: (a) the *required-status-checks* gate at merge (CI5), and (b) the *EB health-rollback* gate after deploy (CI6). These are the failure points that protect production. Highlight the **manual approval** in **amber** (CI7) so reviewers see the human-in-the-loop boundary.
> - **Shape vocab**: stadium `([...])` = trigger (PR / push / cron); rounded `(...)` = job; subgraph = workflow file (`ci.yml`, `deploy-dev.yml`, etc.); diamond `{...}` = gate / approval; cylinder `[(...)]` = registry / artifact (ECR, EB version).
> - **Brevity**: job name only on rounded; gate condition on diamonds.
> - **Direction**: `flowchart LR` so gates appear as vertical bars in a left-to-right read.

---

## Phase 1: AWS OIDC + ECR Plumbing

> **Optional Mermaid Visualization Step (strongly recommended — IAM trust topology)** — suggested file `visualizations/Target-State-project02-github-aws-oidc-trust-v1.md`
>
> Before authoring `github_oidc/main.tf`, render a `flowchart LR` of the **OIDC trust topology** so the principal/role/permission boundaries are visible before any IAM is provisioned.
>
> - **Story**: "GitHub Actions workflow → OIDC token (sub-claim varies by env) → AWS STS AssumeRoleWithWebIdentity → one of three roles (CI / dev-deploy / prod-deploy) → scoped AWS resources."
> - **Focus**: highlight the **three roles** with their **distinct trust-policy `sub` claims** in **red**: `pull_request` for CI, `ref:refs/heads/main` for dev-deploy, `environment:prod` for prod-deploy. Highlight the **prod role's resource scope** (broadest blast radius) in **amber**.
> - **Shape vocab**: rounded rect = role / workflow / resource; trapezoid = trust policy; cloud-style subgraph = AWS account; subgraph = role boundary; diamond `{...}` = sub-claim match.
> - **Brevity**: role name + sub-claim suffix only.
> - **Direction**: `flowchart LR`, with GitHub on the left, the three roles in a column in the middle, and the AWS resources fanning out on the right.

### Task 1.1: `projects/project02/infra/modules/github_oidc`

**Files:**

- Create: `projects/project02/infra/modules/github_oidc/main.tf`

**Resources:**

- `aws_iam_openid_connect_provider.github` with `https://token.actions.githubusercontent.com`.
- `aws_iam_role.github_actions_ci` — limited to read/list across the account, plus the specific resources tests touch (S3 test bucket, RDS describe-only, etc.).
- `aws_iam_role.github_actions_deploy_dev` — broader, scoped to dev resources (`eb:*` on the dev env, ECR push, `terraform plan/apply` on dev workspace).
- `aws_iam_role.github_actions_deploy_prod` — broadest, scoped to prod resources; trust policy requires `aud: sts.amazonaws.com` and `sub: repo:org/repo:environment:prod`.

**Checklist:**

- [ ] Module created; `terraform plan` clean.
- [ ] Output role ARNs surfaced for use as GitHub secrets.

### Task 1.2: `projects/project02/infra/modules/ecr`

**Files:**

- Create: `projects/project02/infra/modules/ecr/main.tf`

**Resources:**

- `aws_ecr_repository.photoapp_server` with image scanning enabled.
- Lifecycle policy: keep last 30 images.
- IAM policy attached to deploy roles for `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`.

**Checklist:**

- [ ] Module created; `terraform plan` clean.
- [ ] Repository URL output.

### Task 1.3: Wire modules into `envs/dev` and `envs/prod`

**Files:**

- Modify: `projects/project02/infra/envs/dev/main.tf`
- Mirror: `projects/project02/infra/envs/prod/main.tf`

**Checklist:**

- [ ] `terraform plan` reports the new resources.
- [ ] `terraform apply` (manual, one-time, in Part 02) creates the OIDC provider + roles + ECR repo.
- [ ] Role ARNs added as repo-level GitHub secrets (`AWS_ROLE_CI`, `AWS_ROLE_DEPLOY_DEV`, `AWS_ROLE_DEPLOY_PROD`).

---

## Phase 2: Composite Setup Action

### Task 2.1: `.github/actions/setup-node-py`

**Files:**

- Create: `.github/actions/setup-node-py/action.yml`

**Behavior:**

- `using: composite`.
- Steps: `actions/setup-node@v4` with `.nvmrc`, `actions/cache@v4` for `~/.npm` keyed on `package-lock.json`; `actions/setup-python@v5` with `pyproject.toml`-derived version, `actions/cache@v4` for `~/.cache/pip` keyed on `pyproject.toml` hash; `hashicorp/setup-terraform@v3` pinned to `1.7.x`.
- Inputs: `working-directory` (default repo root), `install-deps` (default `true`).

**Checklist:**

- [ ] Action invoked from a hello-world workflow; runs in < 90 s on a cold cache, < 10 s on a warm cache.

---

## Phase 3: CI Workflow

### Task 3.1: `ci.yml`

**Files:**

- Create: `.github/workflows/ci.yml`

**Triggers:**

- `pull_request` against `main`.
- `push` to non-`main` branches.

**Jobs (parallel where independent):**

1. `lint`:
   - `make lint` (ESLint + Prettier + ruff + black + mypy + tflint).
2. `test-unit`:
   - `cd server && npm install && npm run test:unit`.
   - `cd client && pip install -e .[dev] && pytest tests/unit -m "not live"`.
3. `test-integration`:
   - Spin compose: `make up`.
   - `npm run test:integration`, `pytest tests/integration -m "not live"`.
   - `make down` always.
4. `test-contract`:
   - `npm run test:contract`, `pytest tests/contract`.
5. `terraform-plan`:
   - `terraform -chdir=infra/envs/dev init -backend=false`.
   - `terraform -chdir=infra/envs/dev validate`.
   - `terraform -chdir=infra/envs/dev plan -out plan.bin`.
   - Upload `plan.bin` as a workflow artifact.

**Checklist:**

- [ ] Workflow file created.
- [ ] All five jobs pass against a clean PR branch.
- [ ] Required status checks configured in branch protection.

> **Optional Utility Step** — suggested artifact `tools/preview-ci-locally` (Bash wrapper around `act`)
>
> The "push, wait for GHA, see what failed, fix, push" loop on CI authoring is the highest-friction part of this workstream. `nektos/act` runs the same workflow file locally in a Docker image that mirrors the GHA runner. Wrapping `act` with the right secrets-file convention + the right `--container-architecture` flag for arm64 macOS makes "preview the CI run before pushing" a one-command affordance.
>
> - **What it does**: `tools/preview-ci-locally lint` runs the `lint` job from `.github/workflows/ci.yml` locally; `tools/preview-ci-locally --all` runs the full workflow. Reads OIDC mocks from `.github/.act-secrets` (gitignored). Prints the per-job pass/fail summary in a format that mirrors the real GHA UI.
> - **Why now**: Phase 3 is when the workflow YAML is being authored and iterated on. Iterations 2–N either happen against `act` (fast, free) or against GHA (slow, count against minutes quotas). Same logic as `tools/gradescope-preview` from `02-web-service.md` Phase 9.
> - **Decision branches**: build now (recommended if you anticipate 3+ workflow iterations, which you will), queue (defer if you're authoring one workflow file in one shot — unlikely), skip (acceptable for trivial workflows; rapidly insufficient for matrix builds).

> **Optional Test Step** — suggested file `.github/workflows/ci.yml` self-test or `tools/__tests__/ci-yaml-validate.sh`
>
> A subtly malformed workflow YAML (wrong key indentation, unsupported expression syntax, `${{ secrets.X }}` typo) typically fails at *invocation time* in GHA — minutes after push, often only on the first PR after the workflow change. A local YAML+expression validator catches authoring errors at commit time.
>
> - **What to lock down**: every `.github/workflows/*.yml` parses as valid YAML; `actionlint` (or `npx @github/actionlint`) reports zero errors; every `${{ secrets.X }}` and `${{ env.X }}` reference points at a key actually defined somewhere in the repo's secret/env surface.
> - **Why this catches bugs**: the cost of a bad expression is a failed workflow run with a confusing error message ("the workflow is not valid: …Unrecognized named-value: 'foo'"). Local actionlint catches it in <1 second.
> - **Decision branches**: build now (recommended — actionlint is a single binary, ~5 minutes to wire into pre-commit), queue, skip (only if your CI authoring is one-shot — usually false).

---

## Phase 4: Dev Deploy

### Task 4.1: `deploy-dev.yml`

**Files:**

- Create: `.github/workflows/deploy-dev.yml`

**Triggers:**

- `push` to `main`.

**Jobs:**

1. `build-and-push`:
   - Login to ECR via OIDC.
   - `docker buildx build --push --tag $ECR/photoapp-server:${{ github.sha }} server/`.
2. `terraform-apply-dev`:
   - `terraform -chdir=infra/envs/dev apply -auto-approve` with the plan from CI as a sanity check.
3. `deploy-eb-dev`:
   - `eb deploy --timeout 10 --label ${{ github.sha }}` against the dev environment.
   - On non-Green health: `eb rollback`; fail the workflow.
4. `smoke-test-dev`:
   - `BASE_URL=$DEV_URL ./tools/smoke.sh`.
   - On any check failure: `eb rollback`; fail the workflow.
5. `notify-slack`:
   - Posts deploy result to `#photoapp-deploys`.

**Checklist:**

- [ ] Workflow file created.
- [ ] First successful run records the deploy SHA in `docs/ci-cd.md` deploy log.
- [ ] Rollback path verified by introducing a deliberate health check failure on a feature branch.

---

## Phase 5: Production Deploy

### Task 5.1: GitHub Environment `prod` with required reviewers

**Behavior:**

- Settings → Environments → New environment `prod`.
- Required reviewers: at least one repo admin.
- Wait timer: 5 min (cooling-off).
- Deployment branches: only `main`.

**Checklist:**

- [ ] Environment configured.
- [ ] Reviewers documented in `docs/ci-cd.md`.

### Task 5.2: `deploy-prod.yml`

**Files:**

- Create: `.github/workflows/deploy-prod.yml`

**Triggers:**

- `workflow_dispatch` only — manual.
- Inputs: `version_sha` (default: latest `main`), `confirm` (must be `yes`).

**Jobs:**

1. `verify-dev-green`:
   - Reads the most recent `deploy-dev.yml` run for the chosen SHA; fails if it didn't pass.
2. `verify-live-regression`:
   - Reads the most recent `nightly-live-regression.yml` run on dev; fails if it didn't pass within the last 24 h.
3. `terraform-apply-prod`:
   - `terraform -chdir=infra/envs/prod apply` (with the prod plan).
4. `deploy-eb-prod`:
   - `eb deploy --timeout 15 --label ${{ inputs.version_sha }}` against the prod environment.
   - Health-gated rollback on failure.
5. `smoke-test-prod`:
   - Same `tools/smoke.sh` against the prod URL.
6. `notify-slack`:
   - `#photoapp-deploys` plus `#photoapp-prod`.

**Checklist:**

- [ ] Workflow file created.
- [ ] Manual trigger gated on environment approval.
- [ ] First production deploy is a hands-on dry run with the team watching.

---

## Phase 6: Nightly Live Regression

### Task 6.1: `nightly-live-regression.yml`

**Files:**

- Create: `.github/workflows/nightly-live-regression.yml`

**Triggers:**

- `schedule: cron('0 6 * * *')` — 06:00 UTC daily.
- `workflow_dispatch` — manual.

**Jobs:**

1. `live-server-v1`:
   - `PHOTOAPP_RUN_LIVE_TESTS=1 npm run test:live` against staging.
2. `live-server-v2`:
   - Same with `STAGING_API_VERSION=v2`.
3. `live-client`:
   - `PHOTOAPP_RUN_LIVE_TESTS=1 pytest -m live` against staging.
4. `notify-slack`:
   - On any failure, page the on-call channel.

**Checklist:**

- [ ] Workflow created.
- [ ] First successful nightly recorded in `docs/ci-cd.md`.
- [ ] Cost per nightly run documented (target < $0.50 / night).

---

## Phase 7: Acceptance & Operator Runbook

### Task 7.1: `docs/ci-cd.md`

**Files:**

- Create: `docs/ci-cd.md`

**Sections:**

- "How a PR flows" — Mermaid diagram of CI jobs.
- "How a deploy happens" — Mermaid for dev / prod / nightly.
- "How to roll back" — `eb rollback` runbook + Terraform `state mv` cheatsheet.
- "How to add a new workflow" — pattern + secrets to add.
- "On-call runbook" — what to do when nightly live regression fails.

**Checklist:**

- [ ] Doc written.
- [ ] Linked from repo README.

### Task 7.2: Acceptance check

**Checklist:**

- [ ] PR open → CI runs → green within 8 minutes (cold) / 4 minutes (warm cache).
- [ ] Merge to `main` → dev deploy → smoke green within 12 minutes.
- [ ] Manual prod deploy → smoke green within 15 minutes.
- [ ] Nightly live regression runs at 06:00 UTC; first three nights recorded.
- [ ] Branch protection enforces: every PR must pass CI status checks.

> **Optional Utility Step** — suggested artifact `tools/runbook` (Bash launcher with named procedures)
>
> The runbook in `docs/ci-cd.md` documents the "how to roll back," "how to rotate the deploy role," "how to invalidate CloudFront," "how to bypass branch protection in an emergency" procedures. Each is a sequence of commands. A small launcher (`tools/runbook rollback dev`, `tools/runbook rotate-deploy-role`) turns "read the doc, copy commands into a terminal" into "run the procedure with a confirmation prompt and a transcript log." Each invocation appends a row to `docs/runbook-log.md` for after-action review.
>
> - **What it does**: `tools/runbook <procedure> [args]` looks up `docs/runbook-procedures/<procedure>.md`, prints a confirmation prompt with the resolved commands, executes on `y`, captures stdout+stderr to a timestamped log under `docs/runbook-log/`. Skeleton procedures: `rollback {env}`, `rotate-deploy-role`, `invalidate-cdn {env}`, `pause-nightly-live`, `force-merge-bypass <pr>` (this last one writes a *prominent* row to the log so the bypass is visible at audit time).
> - **Why now**: Phase 7 is when the procedures are being authored *as documents*. Adding the launcher hook is a 30-line script that promotes runbook entries from "find the doc, paste commands" to "named, audited, replayable procedures." Operational gold; the kind of thing you wish you had during an outage.
> - **Decision branches**: build now (recommended only if production deploys are going to happen — i.e., if Project 02 reaches Part 02; otherwise the runbook is aspirational), queue (acceptable — promote when the first real procedure is run from the doc), skip (acceptable for academic-grade work; not for production-grade).

## Suggested Commit Points

- After Phase 1: `feat(infra): github oidc + ecr modules`.
- After Phase 2: `feat(ci): composite setup-node-py action`.
- After Phase 3: `feat(ci): ci workflow with parallel lint/test/plan jobs`.
- After Phase 4: `feat(ci): deploy-dev workflow with health-gated rollback`.
- After Phase 5: `feat(ci): deploy-prod with environment approval`.
- After Phase 6: `feat(ci): nightly live regression workflow`.
- After Phase 7: `docs(ci): operator runbook + ci-cd diagrams`.

## Risks And Mitigations

- **Risk:** OIDC trust policy is too broad and a malicious PR can assume the deploy role.
  - **Mitigation:** Trust policy pins exact branch (`refs/heads/main`) for deploy roles; CI role is read-only and scoped to test resources.
- **Risk:** EB rollback misses a partial-deploy state where the new image is live but health is `Yellow`.
  - **Mitigation:** Smoke test runs after `eb deploy` returns Green; failure triggers an explicit `eb rollback` to the previous version.
- **Risk:** Terraform state lock collision when two workflows run simultaneously.
  - **Mitigation:** DynamoDB lock table per env; PR plans use `-lock=false` since they don't apply.
- **Risk:** Nightly live regression cost balloons.
  - **Mitigation:** Per-run cost is a documented budget item; alarm on AWS Cost Explorer when monthly CI spend exceeds the budget.
- **Risk:** Required status checks block urgent hotfixes.
  - **Mitigation:** Hotfix branch flow documented in `docs/ci-cd.md` — uses an admin override with explicit post-merge audit.
- **Risk:** Slack token leaks via workflow logs.
  - **Mitigation:** Use the official `slackapi/slack-github-action` which masks the webhook; never `echo` the secret.
- **Risk:** Workflow drift between dev and prod (e.g., dev uses `-auto-approve`, prod doesn't).
  - **Mitigation:** Both workflows source common steps from a reusable workflow `.github/workflows/_deploy-template.yml`; only the env-specific parameters differ.

## Footnote: Why CI/CD Is Future State

Project 02 Part 01's deliverable is a multi-tier app running locally with two Gradescope passes. Part 02 introduces real-AWS deployment via Lab 03 scripts. Once Part 02 lands and we have a stable EB environment + working `eb deploy` flow, *that* is the right time to wrap automation around it. Building CI/CD before the deploy itself is stable would mean automating an unstable target — automation amplifies whatever it touches, including instability.

Until this workstream lands, the local equivalents are:

| Pipeline step           | Local substitute                             |
| ----------------------- | -------------------------------------------- |
| Lint                    | `make lint`                                  |
| Unit tests              | `npm run test:unit`, `pytest tests/unit`     |
| Integration tests       | `make up && npm run test:integration`         |
| Contract tests          | `npm run test:contract`                       |
| Terraform plan          | `terraform -chdir=infra/envs/dev plan`        |
| Build image             | `docker compose build server`                 |
| Deploy                  | `cd server && eb deploy` (manual)             |
| Smoke                   | `BASE_URL=$DEV_URL ./tools/smoke.sh`          |
| Live regression         | `PHOTOAPP_RUN_LIVE_TESTS=1 npm run test:live` |

The `make submit-server` and `make submit-client` flows package those substitutes into a clean pre-submit checklist. Once this workstream lands, `make submit-*` becomes a sanity check rather than the only safety net.
