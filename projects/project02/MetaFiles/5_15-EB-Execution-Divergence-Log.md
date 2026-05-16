# Project02 EB Execution Divergence Log

Running log of places where execution diverged from the apparent repo pull,
the written approach, or the first obvious path. This is intentionally
practical rather than polished: entries should preserve the reasoning trail for
future humans and agents.

## 2026-05-15 — Phase 1 / Phase 2 Execution

### Branch instead of worktree

- **Repo / skill pull:** superpowers execution guidance prefers an isolated git worktree before implementation.
- **Actual path:** created branch `feat/lab03-production-grade-scaffold` in the existing checkout.
- **Reason:** Erik said this repo has not used worktrees and preferred the current IDE/terminal workflow. A normal branch provided enough isolation without forcing a second checkout.

### Built lab03-production-grade before Project02 wiring

- **Repo pull:** Project02 hosting docs originally centered on Project02-specific EB/hosting needs.
- **Actual path:** created reusable `labs/lab03-production-grade/` first, then added Project02 wrapper consumption.
- **Reason:** Conversation clarified that Lab03 had reusable EB deployment mechanics. Extracting a generic scaffold first keeps Project02 from hard-coding class-script assumptions and gives later projects a reusable utility.

### Added Project02 preflight after local/cloud inputs were missing

- **Repo pull:** after scaffold + Terraform wiring, the next path looked like `make eb-bundle` then Terraform plan/apply.
- **Actual path:** added `tools/eb-preflight.sh` and `make eb-preflight` before proceeding to Terraform.
- **Reason:** execution discovered missing `infra/envs/dev/terraform.tfvars`, missing/unclear AWS auth, and initially missing Project02 runtime config. A preflight makes those operator-owned prerequisites explicit and avoids confusing Terraform/AWS failures.

### Used lab-root Claude workspace secrets

- **Repo pull:** Project02 `terraform.tfvars.example` defaulted to `Claude-Conjurer`, while AWS CLI initially saw only an expired `ErikTheWizard` SSO profile.
- **Actual path:** looked in `/Users/erik/Documents/Lab/mbai460-client/claude-workspace/secrets/` and `/Users/erik/Documents/Lab/mbai460-client/claude-workspace/aws-env.sh`.
- **Reason:** user explicitly pointed to the lab-root Claude workspace secrets. This path provides `AWS_SHARED_CREDENTIALS_FILE`, `AWS_CONFIG_FILE`, and `AWS_PROFILE=Claude-Conjurer` without printing secrets.

### Ignored Terraform working cache

- **Repo pull:** Project02 `.gitignore` already covered credentials and prior generated/archived artifacts.
- **Actual path:** added `**/.terraform/` to Project02 `.gitignore`.
- **Reason:** `terraform init -backend=false` created `infra/envs/dev/.terraform/`; ignoring Terraform cache directories avoids polluting review/commit state while keeping lockfiles tracked.

### Documented Node platform mismatch instead of guessing

- **Repo pull:** `server/package.json` declares Node `>=24`; the initial EB Terraform example used a known-looking Node.js 20 solution stack string.
- **Actual path:** documented the need to list available EB Node platforms in-region and choose the newest available before apply.
- **Reason:** EB platform names are region/time dependent. Guessing Node 24 availability in Terraform would be brittle; better to make the operator check explicit before cloud mutation.

### Stopped before cloud mutation until plan inputs are known

- **Repo pull:** greenlight allowed robust execution toward deployment.
- **Actual path:** completed local wiring and validation, staged real bundle, then paused at missing `terraform.tfvars` / AWS auth rather than forcing Terraform apply.
- **Reason:** Terraform could create or change paid AWS resources. Without confirmed tfvars and read-only inventory of existing RDS/S3/EB state, applying would risk duplicate resources or drift.

### Stopped hung aws-probe smoke and switched to targeted read-only inventory

- **Repo pull:** `utils/README.md` points to `utils/aws-probe` as the front door for diagnosing AWS state.
- **Actual path:** ran `utils/aws-probe` after sourcing `claude-workspace/aws-env.sh`; it reported empty root Terraform state and an available RDS instance, then hung inside its delegated `utils/smoke-test-aws --mode live` step. Stopped the process and switched to targeted AWS CLI inventory.
- **Reason:** The probe was read-only but stalled long enough to block execution. Targeted AWS calls can gather the specific EB/RDS/S3/VPC inputs needed for Terraform without waiting on the broader smoke path.

### Added enable_core_infra toggle before Terraform plan

- **Repo pull:** Project02 `infra/envs/dev` originally always instantiated RDS, S3, IAM, and CloudWatch modules.
- **Actual path:** added `enable_core_infra` so EB can be deployed against existing lab infrastructure without creating duplicate RDS/S3/IAM resources.
- **Reason:** targeted AWS inventory found existing RDS `photoapp-db` and S3 bucket `photoapp-erik-mbai460`, while Terraform state appeared empty. Planning against always-on core modules would likely try to create resources that already exist or create an unnecessary second database.

### Added existing EB IAM role mode

- **Repo pull:** the first EB Terraform module created EB service and EC2 roles directly.
- **Actual path:** added `eb_create_iam_roles = false` path with existing role/profile names (`aws-elasticbeanstalk-service-role`, `aws-elasticbeanstalk-ec2-role`).
- **Reason:** the lab/assignment path expects those roles to exist, and the Claude-Conjurer identity is not guaranteed to have IAM mutation permissions. Reusing existing roles is lower-risk for this assignment deploy while preserving a `create_iam_roles = true` path for future platform hardening.

### First EB apply failed on iam:PassRole

- **Repo pull:** after EB-only Terraform plan showed `6 to add, 0 to change, 0 to destroy`, applying with Claude-Conjurer looked constrained enough to proceed.
- **Actual path:** apply created the EB app, app version, artifact bucket/object, and encryption config, then EB environment creation failed and auto-terminated.
- **Evidence:** EB event: `Unable to assign role. Please verify that you have permission to pass this role: aws-elasticbeanstalk-service-role.`
- **Reason:** Claude-Conjurer can authenticate and manage some AWS resources, but lacks `iam:PassRole` for the EB service role. Next apply should use a role-capable profile (likely `ErikTheWizard` after SSO login) or have IAM grant `iam:PassRole` on the EB service/EC2 roles to the deployment identity.
- **State note:** Terraform state now tracks the partial EB resources and terminated environment. Prefer retrying from this state with a role-capable profile over deleting/recreating by hand.
