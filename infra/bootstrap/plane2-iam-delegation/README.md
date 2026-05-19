# Plane 2 IAM delegation (bootstrap)

Terraform root that installs the **LabProjectPermissionsBoundary** managed policy and attaches **ClaudeConjurerPlane2IAMDelegation** to the existing IAM user **Claude-Conjurer** (configurable).

## Intent

- Give the lab operator **scoped IAM administration** for **project-scoped runtime identities** without `AdministratorAccess`, `IAMFullAccess`, or unrestricted `iam:*`.
- Every **`lab-project-*`** role must be created with the lab permissions boundary attached.
- **PassRole** is limited to roles named **`lab-project-*`** and services **elasticbeanstalk / ec2 / lambda**.

## Prereqs

- An admin-ish caller (Erik) in the AWS credential chain — **not** the Claude-Conjurer user — because this stack creates policies and attaches them to another user.
- The target IAM user must already exist (`Claude-Conjurer` by default).

## Usage (plan-only during review)

From repo root or this directory:

```bash
cd infra/bootstrap/plane2-iam-delegation
export AWS_CONFIG_FILE=/path/to/aws-config      # optional
export AWS_SHARED_CREDENTIALS_FILE=/path/to/aws-credentials  # optional
terraform init
terraform plan -var="aws_profile=YourAdminProfile"
```

Do **not** apply until the policy documents are reviewed. After apply, inspect outputs (especially `delegation_capability_summary`).

## Variables

| Name | Default | Purpose |
|------|---------|---------|
| `aws_region` | `us-east-2` | Provider region |
| `aws_profile` | `null` | Admin profile name (optional) |
| `conjurer_user_name` | `Claude-Conjurer` | User receiving the delegation policy |
| `create_lab_project_eb_roles` | `false` | When `true`, this bootstrap creates shared EB IAM (Path A) |
| `lab_project_eb_service_role_name` | `lab-project-eb-service-role` | Shared EB service role name (Path A) |
| `lab_project_eb_ec2_role_name` | `lab-project-eb-ec2-role` | Shared EB EC2 role + instance profile basename (Path A) |

## Guardrails (permissions boundary)

**`LabProjectPermissionsBoundary`** uses (1) a broad **Allow** with **`NotAction`** for governance planes and (2) an **`Effect = Deny`** statement for the same planes **plus** security and audit services (CloudTrail, Config, GuardDuty, Security Hub, etc.). **Explicit Deny overrides mistaken Allows** on attached/inline policies, so runtime roles are not protected only by “please don’t attach `AdministratorAccess`.”

## AWS-managed policy attachment (wildcard) tradeoff

The delegation policy lets the operator **`AttachRolePolicy` / `DetachRolePolicy`** for **any** IAM AWS managed policy ARN matching `arn:<partition>:iam::aws:policy/*` onto roles named **`lab-project-*`**. That is intentionally broad: new services and ARNs appear frequently, and fighting ARN allow-lists slows the lab down.

**What that does *not* mean:** attaching e.g. `AdministratorAccess` does **not** let the **runtime role** escape the data-plane cap, because effective permissions are **intersected** with **`LabProjectPermissionsBoundary`**. The boundary (especially the explicit **Deny** block) is the **primary guardrail** for what a **`lab-project-*` runtime role** can actually do.

**What it *does* mean:** roles can still carry “noisy” or misleading policy attachments, and the **operator IAM user** (`Claude-Conjurer`) is **not** wearing `LabProjectPermissionsBoundary`—it is governed by **PowerUserAccess + delegation**. Wildcard attach is a **lab-project / role** convenience, not a statement that the **human or agent caller** is bounded the same way.

## Path A: optional shared EB runtime roles (recommended)

Set `create_lab_project_eb_roles = true` to have this bootstrap own:

- **`lab-project-eb-service-role`** (trust: `elasticbeanstalk.amazonaws.com`, attachments: `AWSElasticBeanstalkEnhancedHealth`, `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`)
- **`lab-project-eb-ec2-role`** (trust: `ec2.amazonaws.com`, attachment: `AWSElasticBeanstalkWebTier`)
- An instance profile with the **same basename** as the EC2 role

All three carry **`permissions_boundary = LabProjectPermissionsBoundary`** via partition-aware ARNs.

**Mutex with Project02:** If this bootstrap owns the EB roles, **leave `eb_create_iam_roles = false`** in `projects/project02/infra/envs/dev/terraform.tfvars`. Two Terraform states managing the same role names is the failure mode this flag is designed to prevent. The Project02 EB module (Path B) is for accounts where the operator wants the module itself to create those roles instead, never both.

## Naming convention

**Lab-wide contract:** **`../LAB_PROJECT_IAM_CONTRACT.md`** (prefix, boundary, PassRole, exceptions).

All IAM **roles**, **instance profiles**, and **customer-managed policies** created under this delegation pattern should use the **`lab-project-*`** name prefix so ARN patterns and PassRole lines up with the policy.

## Outputs

- `lab_project_permissions_boundary_arn`
- `claude_conjurer_plane2_iam_delegation_policy_arn`
- `delegation_capability_summary` — human-readable can/cannot list
- `lab_project_eb_service_role_name`, `lab_project_eb_ec2_role_name`, `lab_project_eb_ec2_instance_profile_name` — non-empty when Path A is enabled; copy into Project02 tfvars

## Post-apply capability tests (Phases 4 & 5)

After bootstrap is applied, run the **Claude-Conjurer** identity (PowerUserAccess + ClaudeConjurerPlane2IAMDelegation) through the scripts in **`scripts/`**:

| Script | Phase | Purpose |
|--------|-------|---------|
| `phase4-positive-capability-tests.sh` | 4 | Create/clean up allowed `lab-project-*` IAM with boundary |
| `phase5-negative-capability-tests.sh` | 5 | Prove guardrails block authority outside the lab runtime boundary |
| `phase5-admin-boundary-simulate.sh` | 5 (admin) | Close tests 7/8: simulate substrate denies on bounded role (Erik SSO only) |
| `post-apply-negative-tests.sh` | 5 | Wrapper → `phase5-negative-capability-tests.sh` |

```bash
cd infra/bootstrap/plane2-iam-delegation
export BOUNDARY_ARN="$(terraform output -raw lab_project_permissions_boundary_arn)"

# Optional: auto-source claude-workspace/aws-env.sh for Claude-Conjurer
export CLAUDE_WORKSPACE_AWS_ENV=/path/to/claude-workspace/aws-env.sh

./scripts/phase4-positive-capability-tests.sh
./scripts/phase5-negative-capability-tests.sh

# If Phase 5 tests 7/8 are inconclusive for conjurer (no SimulatePrincipalPolicy):
./scripts/phase5-admin-boundary-simulate.sh   # admin credentials
```

Requirements: AWS CLI v2, `jq` (Phase 5 admin script), conjurer credentials for phases 4–5. Set **`BOUNDARY_ARN`** from `terraform output` after apply, or **`BOUNDARY_POLICY_NAME=LabProjectPermissionsBoundary`** with conjurer credentials in the target account.
