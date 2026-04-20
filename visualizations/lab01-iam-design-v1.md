# Lab01 IAM Design — v1

**Generated:** 2026-04-13
**Last Updated:** 2026-04-20
**Scope:** Lab01 identity model — who has access, via what, to what
**Status:** Current
**Related diagrams:** `lab01-target-architecture-v1.md`

---

```mermaid
flowchart TB

    subgraph account["☁️  AWS Account  772360735396"]
        root["🔐 Root Account\n(break-glass only — not used operationally)"]

        subgraph sso_layer["IAM Identity Center (SSO)"]
            sso["AWS IAM Identity Center\nAWSInitialLabSetup session\n✅ modern · short-lived tokens · no static keys"]
            u_e_sso["SSO User: Wizard-Erik\nPermission Set: AdministratorAccess"]
            sso --> u_e_sso
        end

        subgraph iam_users["IAM Users (programmatic / agents only)"]
            u_a["Claude-Conjurer\nPowerUserAccess\nstatic access key · no IAM ops"]
        end

        subgraph policy["Policies"]
            admin["AWS Managed:\nAdministratorAccess\n(Erik SSO permission set)"]
            power_user["AWS Managed:\nPowerUserAccess\n(Claude-Conjurer — IAM denied by design)"]
        end

        u_e_sso --> admin
        u_a --> power_user
    end

    subgraph local["🖥️  Local — Mac Host"]
        direction TB

        subgraph erik_auth["Erik's Auth (SSO)"]
            sso_login["aws sso login\n--profile ErikTheWizard"]
            profile_e["~/.aws/config\n[profile ErikTheWizard]\nsso_session = AWSInitialLabSetup\nregion = us-east-2"]
            cli_e["AWS CLI\n--profile ErikTheWizard"]
            sso_login --> profile_e --> cli_e
        end

        subgraph agent_auth["Claude-Conjurer Auth (static keys)"]
            creds_a["claude-workspace/secrets/\naws-credentials  +  aws-config\n(project-local — not in ~/.aws/)"]
            env_script["export AWS_SHARED_CREDENTIALS_FILE\n+ AWS_CONFIG_FILE + AWS_PROFILE"]
            cli_a["AWS CLI\n--profile Claude-Conjurer"]
            tf["Terraform\n(uses ErikTheWizard profile\nfor IAM-touching ops)"]
            creds_a --> env_script --> cli_a & tf
        end
    end

    sso -. "federated access\n(temporary tokens)" .-> erik_auth
    u_a -. "static access key\n(project-local)" .-> agent_auth

    cli_e & cli_a & tf -. "authenticated ops\n(CloudTrail logged by identity)" .-> account
```

---

## Identity Summary

| Actor | Identity Type | AWS Identity | CLI Profile | Credentials | Runs Terraform |
|-------|--------------|--------------|-------------|-------------|----------------|
| Erik (Wizard) | SSO User | `Wizard-Erik` in IAM Identity Center | `ErikTheWizard` | `~/.aws/config` SSO session — no static keys on disk | No — reviews + approves |
| Claude Code | IAM User | `Claude-Conjurer` | `Claude-Conjurer` | `claude-workspace/secrets/` (project-local static key) | Yes (non-IAM ops); IAM-touching ops require ErikTheWizard |

**Note on Erik's setup:** Erik's AWS access is entirely through IAM Identity Center (SSO) — SSO username `Wizard-Erik`, permission set `AdministratorAccess`. No traditional IAM user with static keys. This is the recommended modern approach: credentials are short-lived, rotate automatically, and no secrets live on disk. `Claude-Conjurer` is the only traditional IAM user in the account (programmatic/agent access).

**Note on Claude-Conjurer permissions:** Claude-Conjurer has `PowerUserAccess` (not AdministratorAccess). IAM operations (`iam:CreateUser`, `iam:AttachUserPolicy`, etc.) are explicitly denied. IAM resources are managed by Erik via SSO. This is intentional — agent cannot escalate its own privileges.

## Future State (from Future-State-Ideal-Lab.md)
- [ ] Scope `Claude-Conjurer` further — PowerUserAccess is still broad; task-specific policies are the target
- [ ] IAM Groups for policy management as agent roster grows
- [ ] MFA on SSO / root
- [ ] Separate `agent-read-only` vs `agent-mutate` identities
- [ ] Replace static keys with IAM Role + OIDC for agent auth (production pattern)
- [ ] Periodic Access Advisor review
