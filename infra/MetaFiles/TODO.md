# infra/ — ActionQueue

## Active

- [x] **[Hygiene] photoapp-config.ini is git-tracked** — contains RDS endpoint + credentials; add `config/photoapp-config.ini.example` template, gitignore the live file
- [ ] **[Growth] Terraform remote state** — `terraform.tfstate` is currently local (gitignored, not shared); migrate to S3 backend + DynamoDB lock before multi-collaborator use
- [ ] **[IaC] main.tf profile hardcoded** — `provider "aws" { profile = "ErikTheWizard" }` means Claude-Conjurer cannot run terraform ops; parameterize via `TF_VAR` or env var before next Terraform-heavy session
- [ ] **[Low/Security] `terraform.tfvars` is plaintext on disk** — gitignored correctly, but live RDS password sits adjacent to codebase; consider moving to `claude-workspace/secrets/` and referencing via `-var-file`

## Backlog

- [ ] Tag all Terraform resources with Owner, Course, Environment, AgentSafe labels
