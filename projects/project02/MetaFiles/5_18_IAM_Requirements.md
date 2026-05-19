# Project02 IAM Requirements

Date: 2026-05-18 (updated: lab **`lab-project-*`** contract aligned with Plane-2 bootstrap)

Purpose: define the IAM requirements needed to deploy Project02 Part 02 to Elastic Beanstalk cleanly, with the reusable `lab03-production-grade` scaffold and Terraform-native Project02 EB lane.

## Lab-wide contract (read this first)

**Canonical naming and PassRole rules** for the shared lab account live in:

**`infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md`**

All **new** EB (and Lambda-style) **roles**, **instance profiles**, and **customer-managed** policies **must** use the **`lab-project-*`** prefix and **`LabProjectPermissionsBoundary`** on roles. Project02 Terraform variables should default to those names, not legacy **`aws-elasticbeanstalk-*`** wizard defaults, when operating under **`ClaudeConjurerPlane2IAMDelegation`**.

## Context

Project02 deploys a Node/Express PhotoApp web service to Elastic Beanstalk. The application itself talks to:

- RDS MySQL
- S3
- Rekognition
- CloudWatch / EB platform logging

The current Project02 EB Terraform lane can create the EB app, application version, artifact bucket, and EB environment.

### Historical failure (pre–Plane-2 naming)

An early apply with the `Claude-Conjurer` identity failed during EB environment creation because the identity could not pass an **EB service role** that used the **default wizard name**:

```text
Unable to assign role. Please verify that you have permission to pass this role: aws-elasticbeanstalk-service-role.
```

That showed the gap was **`iam:PassRole`**, not general authentication. Under the **lab contract**, the **role name** must also match **`lab-project-*`** so delegation **`PassRole`** and role administration align; use something like **`lab-project-eb-service-role`** instead of relying on **`aws-elasticbeanstalk-service-role`** unless an **admin** exception is documented.

## IAM Philosophy

Elastic Beanstalk IAM should be treated as **account/bootstrap infrastructure**, not as an app-release concern.

Recommended ownership split:

- **Root lab / platform bootstrap:** shared IAM roles, instance profiles, deployer permissions (see **`infra/bootstrap/plane2-iam-delegation`** + **`LAB_PROJECT_IAM_CONTRACT.md`**).
- **Project02:** app-specific EB application, EB environment, app version, artifact bundle, RDS/S3 config, and cURL smoke validation.
- **`lab03-production-grade`:** reusable bundle/smoke/deploy scaffolding that can be consumed by Project02 and future projects.

The EB service role and EC2 instance profile should be **created once per account** (or account/environment family), **named per the lab contract**, then reused by Project02 and future deployments.

## Required IAM Roles (lab contract names)

### Elastic Beanstalk service role

**Contract name (preferred in this repo):**

```text
lab-project-eb-service-role
```

Why it is needed:

- Allows the Elastic Beanstalk control plane to manage EB environment resources.
- Required when creating or updating an EB environment.
- Referenced by Project02 Terraform through the EB environment `ServiceRole` setting.

Recommended managed policies:

- `AWSElasticBeanstalkEnhancedHealth`
- `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`

Trust relationship:

- Trusted service principal: `elasticbeanstalk.amazonaws.com`

**Role must** be created with permissions boundary **`LabProjectPermissionsBoundary`** (enforced for operator-created roles by **`ClaudeConjurerPlane2IAMDelegation`**).

### Elastic Beanstalk EC2 role / instance profile

**Contract name (preferred in this repo; role and instance profile often share this basename):**

```text
lab-project-eb-ec2-role
```

Why it is needed:

- Attached to the EC2 instance that runs the Node.js app.
- Lets EB-managed EC2 instances participate in the EB web tier.
- Can later become the preferred way for the app to access S3/Rekognition without static credentials in `photoapp-config.ini`.

Recommended managed policy:

- `AWSElasticBeanstalkWebTier`

Trust relationship:

- Trusted service principal: `ec2.amazonaws.com`

Potential future app policies:

- S3 read/write access scoped to the PhotoApp bucket.
- Rekognition access required by the PhotoApp upload path.

Current assignment note:

- Project02 may still rely on explicit `[s3readwrite]` credentials in `photoapp-config.ini`.
- Moving app AWS access fully to the EB instance profile is a later hardening step.

## Required deployer permissions (Plane-2 operator)

The identity running Terraform for Project02 EB deployment needs **`iam:PassRole`** for the configured service role and instance profile **and** those resources must match **`arn:<partition>:iam::<ACCOUNT_ID>:role/lab-project-*`**.

Example resource ARNs (commercial partition shown; use your account ID and partition):

```text
arn:aws:iam::<ACCOUNT_ID>:role/lab-project-eb-service-role
arn:aws:iam::<ACCOUNT_ID>:role/lab-project-eb-ec2-role
```

Recommended condition guard when expressing a custom policy (matches delegation intent):

```text
iam:PassedToService = elasticbeanstalk.amazonaws.com
```

The EC2 role is also passable for **`ec2.amazonaws.com`** when wiring instance profiles. **`ClaudeConjurerPlane2IAMDelegation`** already encodes **EB / EC2 / Lambda** **`PassedToService`** and **`lab-project-*`** role prefix; keep Terraform role names inside that envelope.

## Terraform bootstrap (implemented path)

**Implemented location:**

```text
infra/bootstrap/plane2-iam-delegation/
```

**Contract reference:**

```text
infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md
```

This bootstrap installs **`LabProjectPermissionsBoundary`**, **`ClaudeConjurerPlane2IAMDelegation`**, and attaches the latter to **`Claude-Conjurer`** (configurable).

### Path A vs Path B — who owns the EB roles

Exactly one Terraform state owns `lab-project-eb-service-role`, `lab-project-eb-ec2-role`, and the matching instance profile. The contract (`LAB_PROJECT_IAM_CONTRACT.md`) formalizes the mutex; this section is the Project02-facing rendering.

**Path A — bootstrap owns EB roles (recommended for the shared lab).** In `infra/bootstrap/plane2-iam-delegation`:

```hcl
create_lab_project_eb_roles = true
```

Apply with the admin profile. Read the bootstrap outputs:

```text
lab_project_eb_service_role_name
lab_project_eb_ec2_role_name
lab_project_eb_ec2_instance_profile_name
```

Then Project02 stays on reuse mode:

```hcl
eb_create_iam_roles                   = false
eb_existing_service_role_name         = "lab-project-eb-service-role"
eb_existing_ec2_instance_profile_name = "lab-project-eb-ec2-role"
```

**Path B — Project02 module owns EB roles.** Bootstrap keeps `create_lab_project_eb_roles = false`. In `projects/project02/infra/envs/dev/terraform.tfvars`:

```hcl
eb_create_iam_roles = true
```

The `elastic-beanstalk` module then creates `lab-project-eb-service-role` / `lab-project-eb-ec2-role` (configurable via `service_role_name` / `ec2_role_name`), attaches `LabProjectPermissionsBoundary` via the `aws_iam_policy` data source lookup (Plane-2 bootstrap must already be applied for the boundary to exist), and uses partition-aware managed-policy ARNs.

**Do not enable both paths at once.** The role names collide and Terraform will fight itself.

### Integration test sequence (manual)

Run these in order whenever the EB IAM contract changes:

1. Admin: apply `infra/bootstrap/plane2-iam-delegation` with `create_lab_project_eb_roles = true` (Path A) **or** leave at default (Path B).
2. Conjurer: run `infra/bootstrap/plane2-iam-delegation/scripts/post-apply-negative-tests.sh` — must report all OK / SKIP (no FAIL).
3. Conjurer: run `make eb-preflight` (or `projects/project02/tools/eb-preflight.sh --check-iam-contract`) — must end **GREEN**.
4. Conjurer: `terraform plan` in `projects/project02/infra/envs/dev` with `enable_elastic_beanstalk = true` and the staged bundle present — must not raise `Unable to assign role` and must show the EB roles as data-source reads (Path A) or new resources with `permissions_boundary` set (Path B).
5. Conjurer: `terraform apply` and `make eb-smoke EB_URL=...` against the resulting CNAME.

The preflight command:

```bash
projects/project02/tools/eb-preflight.sh \
  --aws-profile Claude-Conjurer \
  --check-iam-contract
```

Override the expected names via env vars when the account uses a documented exception:

```bash
EB_SERVICE_ROLE_NAME=custom-eb-service \
EB_EC2_INSTANCE_PROFILE_NAME=custom-eb-ip \
  projects/project02/tools/eb-preflight.sh --check-iam-contract
```

## Current Project02 state

Implemented Project02 behavior:

- `projects/project02/infra/modules/elastic-beanstalk` supports both paths: creating EB IAM roles (Path B, with `permissions_boundary` + partition-aware ARNs) or reusing existing role/profile names (Path A).
- `projects/project02/infra/envs/dev` defaults toward **reusing** the `lab-project-eb-*` names produced by Path A.
- `projects/project02/tools/eb-preflight.sh` checks local deploy inputs, AWS authentication, and (with `--check-iam-contract`) that the EB role and instance profile exist under the expected names.

Known gap:

- `eb-preflight` confirms AWS authentication and the presence of the EB role/instance profile, but it cannot prove `iam:PassRole` ahead of apply. The first `terraform apply` is still the canonical PassRole proof.

## Acceptance criteria

IAM setup is ready when:

- **`lab-project-eb-service-role`** exists (or equivalent **contract-approved** name) with **`LabProjectPermissionsBoundary`** if operator-managed.
- **`lab-project-eb-ec2-role`** exists as an instance profile usable by EB (same basename pattern).
- The Terraform deploy identity can **pass** those roles under **`lab-project-*`** + **`PassedToService`** rules.
- Project02 Terraform can create/update the EB environment without `Unable to assign role`.
- The EB environment reaches a live URL that can be cURL-smoked.
- Post-apply **`scripts/post-apply-negative-tests.sh`** passes for the Plane-2 operator where applicable.

## Request Response

The executing agent should write the IAM request, response, decision, and final action here.

### Lab 04 (2026-05-18) — Plane-2 validation for Lambda path

| Field | Value |
|-------|--------|
| **Date** | 2026-05-18 |
| **Request** | Confirm Plane-2 delegation satisfies Lab 04 Lambda IAM (no ad-hoc `lab04-*` policy); roles must be `lab-project04-*` with `LabProjectPermissionsBoundary` |
| **Identity** | `Claude-Conjurer` + PowerUserAccess + `ClaudeConjurerPlane2IAMDelegation` |
| **Admin action** | Bootstrap applied: `infra/bootstrap/plane2-iam-delegation/` (state in repo) |
| **Policy ARNs** | Boundary: `arn:aws:iam::772360735396:policy/LabProjectPermissionsBoundary`; Delegation: `arn:aws:iam::772360735396:policy/ClaudeConjurerPlane2IAMDelegation` |
| **Lab 04 role names (Terraform)** | `lab-project04-analyze-role`, `lab-project04-weather-role`, layer `lab-project04-requests-layer` |
| **PassRole service** | `lambda.amazonaws.com` (delegation § PassRoleLambda) |
| **Ground-truth checks** | Bootstrap tfstate **PASS**; Gradescope Lab 04 **100/100**; stack destroyed for cost cleanup (re-apply via `labs/lab04/Makefile`) |
| **Operator docs** | `labs/lab04/README.md` — preflight, test-api, destroy/re-apply lifecycle |

### Project 02 EB (template — fill when EB IAM requested)

Suggested content:

- Date/time of request.
- Requested IAM roles or permissions.
- Identity/profile used for the request.
- Human/admin response.
- Whether roles were created, reused, imported, or deferred.
- Any policy ARNs or role names selected.
- Result of the next Terraform plan/apply attempt.
