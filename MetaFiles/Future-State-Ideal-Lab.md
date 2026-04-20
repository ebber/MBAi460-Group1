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

---

*Review this file at major milestones (e.g. after Part 01, after Part 02, end of quarter).*
