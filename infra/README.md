# infra/

AWS infrastructure backbone for the MBAi 460 Class Project.

## Structure

| Directory | Purpose |
|-----------|---------|
| `terraform/` | Terraform IaC — manages S3, RDS, Security Groups; run from this directory |
| `config/` | Backbone runtime configs — RDS endpoints and credentials used by utils |

## Terraform

CWD for all terraform commands: `MBAi460-Group1/infra/terraform/`

Credentials are not hardcoded — set these env vars before running:

```bash
export AWS_SHARED_CREDENTIALS_FILE=<repo-root>/secrets/aws-credentials
export AWS_CONFIG_FILE=<repo-root>/secrets/aws-config
cd infra/terraform
terraform plan
terraform apply
terraform destroy
```

The AWS profile defaults to `Claude-Conjurer`. To use a different profile, add `aws_profile = "YourProfile"` to `terraform.tfvars` (gitignored) or set `TF_VAR_aws_profile=YourProfile` before running terraform.

See `MetaFiles/QUICKSTART.md` for the full collaborator setup walkthrough.

## Config Graduation Policy

Configs may live inside a lab or project folder during active development.
When the assignment closes, backbone configs (those consumed by shared utils) graduate here.

Current backbone configs:
- `config/photoapp-config.ini` — RDS endpoint + read-only credentials; consumed by run-sql, validate-db, smoke-test-aws
