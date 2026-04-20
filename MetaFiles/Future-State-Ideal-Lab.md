# Future state: toward an ideal lab (post-assignment / when allowed)

Items here are **deliberately out of scope** for the current handout unless the course says otherwise. Pull work from this list when Erik green-lights and the architecture still matches the class trajectory.

Use checkboxes as you **complete** or **reject** items (rejected: note why).

## Security — data plane

- [ ] **S3**: private bucket, **no** public ACLs; CloudFront or signed URLs for any public read need.
- [ ] **S3**: **SSE-KMS** or default encryption; bucket policies denying insecure transport (`aws:SecureTransport`).
- [ ] **RDS**: not publicly accessible; access via **VPN**, **Session Manager tunnel**, **bastion**, or **VPC-attached app tier** only.
- [ ] **RDS**: **Security group** scoped to known CIDRs or SG references, not `0.0.0.0/0`.
- [ ] **RDS**: **automated backups** and a **snapshot / restore** drill.
- [ ] **Secrets Manager** or **Parameter Store** for app credentials instead of long-lived plaintext on disk.
- [ ] **MySQL**: rotate app passwords; consider **IAM DB auth** for apps that support it.
- [ ] **Least privilege IAM**: replace broad console policies with **task-scoped** policies; periodic **access advisor** review.

## Security — identity and audit

- [ ] **MFA** on root and human IAM users.
- [ ] **AWS Organizations / Control Tower** (if this account graduates to “real” workloads).
- [ ] **CloudTrail** org-wide; log integrity / Object Lock for evidence-grade audit (may imply cost).
- [ ] **IAM Access Analyzer** on an ongoing basis.

## Operations and reliability

- [ ] **Infrastructure as Code** (Terraform / CDK) for reproducible environments.
- [ ] **Separate accounts** per environment (lab / staging / prod) when cost and complexity justify.
- [ ] **Runbooks** for: RDS restore, rotating keys, revoking a leaked key, incident “who had access.”

## Observability (intentionally deferred for now)

- [ ] **CloudWatch** dashboards: RDS CPU, free storage, connections.
- [ ] **Alarms** on anomaly spend, RDS storage full, and **burst balance** if applicable.
- [ ] **Synthetic checks** for app health (later parts of the course).

## Cost and governance

- [ ] **Budgets** refined per service (RDS vs S3 vs data transfer).
- [ ] **Cost Anomaly Detection** enabled with alert destination.
- [ ] **Resource tags** standard (`Owner`, `Course`, `Environment`, `AgentSafe: yes|no`).

## Human + agent ergonomics

- [ ] **IAM dashboard** (script or markdown generator) listing humans vs agents vs service principals — your human notes called this out; automate when stable.
- [ ] **Separate agent policies** for “read-only recon” vs “mutate infra” if agents keep gaining tooling.

## Developer tooling (3x rule)

> **Principle:** If an action is done more than 3 times ad-hoc, it belongs in `utils/`. The scripts below were identified as candidates from repeated patterns in the lab workflow.

- [ ] **`utils/cred-sweep`** — scan all git-tracked + staged files for sensitive patterns before committing.
  Patterns: `IDENTIFIED BY '<literal>'`, `AKIA[A-Z0-9]{16}` (AWS key format), `aws_secret_access_key = <value>`, known password strings.
  Output: PASS/FAIL per file:line. Natural fit as a git pre-commit hook so the check is automatic.
  *Triggered by: running cred sweeps manually 3+ times across sessions.*

- [ ] **`utils/rebuild-db`** — run all `create-*.sql` files against RDS then validate in one command.
  Currently requires two `run-sql` invocations + `validate-db` by hand. Should auto-discover SQL files (`create-photoapp.sql`, `create-shorten.sql`) and run them in dependency order.
  *Triggered by: rebuilding the DB 3+ times this session alone.*

- [ ] **`utils/rotate-passwords`** — end-to-end password rotation in a single command.
  Flow: generate N random passwords → update all gitignored config files → call `rebuild-db` → print summary of what changed (for recordkeeping, not logged to file).
  Removes all manual steps from the rotation process: no hand-editing configs, no separate rebuild invocation.
  *Triggered by: doing a full manual rotation this session — config edits, SQL rebuild, validate — as a sequence of ad-hoc steps.*

- [ ] **`utils/session-health`** — single command combining Docker status + AWS identity + smoke test.
  Currently run as three separate commands at session open. Unified output: green/red per layer.
  *(Also tracked in lab-environment workstream.)*

- [ ] **`utils/db-connect [user]`** — open an interactive MySQL shell as a named app user (`read-only`, `read-write`, `admin`), pulling credentials from the appropriate gitignored config file.
  Eliminates the need to look up or paste passwords for ad-hoc queries.

---

*Review this file at major milestones (e.g. after Part 01, after Part 02, end of quarter).*
