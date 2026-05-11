# `modules/eb/` — Elastic Beanstalk infrastructure

Terraform module that provisions the AWS resources needed to deploy the
Project 02 PhotoApp web service via Elastic Beanstalk per
[`project02-part02-EB.pdf`](../../../project02-part02-EB.pdf).

Replaces the manual IAM-console + bash-script path the PDF describes,
giving us one `terraform apply` + one `terraform destroy` lifecycle.

## What this module owns

### Phase 1 — IAM (current; in `iam.tf`)

- `aws-elasticbeanstalk-service-role` — assumed by the EB platform for
  environment management + health monitoring. Attached managed policies:
  - `AWSElasticBeanstalkEnhancedHealth`
  - `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`
- `aws-elasticbeanstalk-ec2-role` — assumed by EC2 instances inside the
  EB env for runtime AWS access. Attached managed policies:
  - `AWSElasticBeanstalkWebTier`
  - `AWSElasticBeanstalkWorkerTier`
  - `AWSElasticBeanstalkMulticontainerDocker`
- `aws_iam_instance_profile` wrapping the EC2 role (referenced by the EB
  env's `IamInstanceProfile` setting in Phase 2)

### Phase 2 — EB Application + Environment (pending)

- `aws_elastic_beanstalk_application.photoapp` — application: `photoapp-web-service`
- `aws_elastic_beanstalk_environment.photoapp_env` — environment with
  `setting` blocks for VPC, subnets, instance type, service role,
  instance profile, basic health monitoring, `PHOTOAPP_CONFIG_PATH`,
  Node.js 24 platform
- (Optional) `aws_s3_bucket` for application versions, plus
  `aws_elastic_beanstalk_application_version` if we go pure-Terraform on
  bundle deployment (vs hybrid `eb deploy`)

## What this module does NOT own

| Concern | Owner |
|---|---|
| Application bundle (`app.zip`) | Pushed via `eb deploy` after `terraform apply`, OR via `aws_elastic_beanstalk_application_version` (Phase 3 decision) |
| `photoapp-config.ini` (server config with AWS creds) | Bundled into `app.zip`, sourced from `client/photoapp-config.ini` (gitignored) |
| RDS, S3, Rekognition (backbone) | Pre-existing; managed by `modules/{rds,s3,iam,cloudwatch}` |
| App-runtime IAM users (`s3readonly`, `s3readwrite`) | `modules/iam/` |
| `photoapp-client-config.ini` flip to CNAME | Manual / scripted; output here makes it easy |

## Usage

Wired in `infra/envs/dev/main.tf` (and `envs/prod/main.tf` when prod lands):

```hcl
module "eb" {
  source = "../../modules/eb"
  tags   = local.common_tags
  # Phase 2 additions:
  # vpc_id              = var.vpc_id
  # subnet_ids          = var.subnet_ids
  # solution_stack_name = var.eb_solution_stack
  # ...
}
```

## Pre-existing role caveat (PDF §1 NOTE)

> Some students have reported these security roles already exist, so this step may be optional.

If `terraform apply` errors with `EntityAlreadyExistsException` on any
of the three resources below, import them into state instead of
recreating:

```sh
cd projects/project02/infra/envs/dev
terraform import module.eb.aws_iam_role.eb_service_role aws-elasticbeanstalk-service-role
terraform import module.eb.aws_iam_role.eb_ec2_role aws-elasticbeanstalk-ec2-role
terraform import module.eb.aws_iam_instance_profile.eb_ec2_profile aws-elasticbeanstalk-ec2-role
```

After import, attached policies will show up as drift in the next
`terraform plan`; let Terraform reconcile them (it'll attach the
declared policies, no-op the ones already attached).

## Provenance

- Authored 2026-05-11 during Project 02 Part 02 (EB deployment) sprint
- Replaces the manual IAM-console + Lab-03-bash path described in
  `project02-part02-EB.pdf` and Pranav's
  [`feat/lab03-eb-scripting`](https://github.com/ebber/MBAi460-Group1/tree/feat/lab03-eb-scripting) branch
- Plan: `MetaFiles/Hosting_Plan.md` (Project 02-level), this module's
  README (per-module reference)
