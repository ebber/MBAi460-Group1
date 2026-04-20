# Project 01 Part 02 — Work Queue

Source plan: `plans/project01-part02-plan.md` (extracted from
`../project01-part02.pdf`, cross-walked against
`MBAi460-Group1/MetaFiles/Manifesto-AWS-Lab-Sanctum.md` +
`Future-State-Ideal-Lab.md`).

## Active — assignment-faithful

- [x] **[Blocker]** Rotate `photoapp-read-only` / `photoapp-read-write`
  passwords — resolved via Phase 1 Terraform apply (2026-04-20).
- [x] **PDF step 3** — `logging.basicConfig` added to `client.py`.
- [x] **PDF steps 4–5** — `get_users()`, `get_images(userid=None)` implemented + tested.
- [x] **PDF step 6** — `post_image()` implemented with inner fns, transaction, LAST_INSERT_ID().
- [x] **PDF step 7** — `get_image()` implemented.
- [x] **PDF step 8** — `delete_images()` implemented.
- [x] **PDF step 9** — `create-photoapp-labels.sql` applied, labels table live.
- [x] **PDF step 11** — Rekognition wired into `post_image`.
- [x] **PDF step 12** — `delete_images` truncates labels first.
- [x] **PDF steps 13–14** — `get_image_labels()` + `get_images_with_label()` implemented.
- [x] **PDF step 15** — Gradescope submit **70/70** (2026-04-20, first submission).
- [ ] **PDF step 16** — `aws rds stop-db-instance` post-submit. ← READY (grading confirmed)

## Environment Validation — Ad-hoc Checks Log

> These checks were performed manually during Phase 1 verification (2026-04-20) because no util covers them yet.

- **Labels table existence + row count** — `run-sql projects/project01/check-labels-tmp.sql` (SHOW CREATE TABLE labels; SELECT COUNT(*) FROM labels) — ✅ table exists, 0 rows. *Gap: validate-db has no labels table check.*
- **End-to-end get_ping()** — Docker: `photoapp.initialize() + get_ping()` — ✅ M=1 (test/degu.jpg in S3), N=3 (3 seed users in RDS).
- **IAM resource presence** — `terraform state list` — ✅ 15 resources incl. all 8 Phase 1 IAM resources (s3readonly/s3readwrite users, custom policy, 3 policy attachments, 2 access keys). Direct IAM API verification blocked (Claude-Conjurer PowerUserAccess).
- **photoapp-config.ini live keys** — Python configparser check — ✅ `[s3readonly]` + `[s3readwrite]` both have live AKIA... access key IDs + secrets. `[rds]` user_name = photoapp-read-write.

- [ ] **[Enhancement] validate-db: add labels table checks** — table exists, FK to assets, label+confidence columns, indexes on assetid+label. Currently validate-db only checks users + assets.

## Active — sanctum overlays (from Future-State-Ideal-Lab.md)

- [ ] **[IaC]** Move PDF steps 1, 2, 10 (IAM console clicks for
  `s3readonly`, `s3readwrite`, custom bucket policy, Rekognition
  attachment) into `infra/terraform/main.tf`. Use `templatefile()` to
  render `projects/project01/s3-read-write-policy.json.txt` with
  `var.bucket_name`. Mark access-key outputs `sensitive = true`.
- [ ] **[Secrets]** Terraform must not write access keys into anything
  git-tracked. Script under `utils/` pipes `terraform output -json` into
  the gitignored `photoapp-config.ini` sections. State file itself stays
  sensitive (remote backend is a separate open item on root TODO).
- [ ] **[3x-rule]** `utils/rebuild-db` — becomes required once
  `create-photoapp-labels.sql` is added. Auto-discover SQL files in
  dependency order (`create-photoapp.sql` then
  `create-photoapp-labels.sql`).

## Backlog — deferred future-state (explicitly out of scope per manifesto)

- [ ] Private S3 bucket + CloudFront / signed URLs (replaces current
  `public-read` ACL).
- [ ] `aws_db_instance.publicly_accessible = false` + VPC / bastion or
  Session Manager tunnel.
- [ ] SSE-KMS on the bucket.
- [ ] Secrets Manager / Parameter Store for `photoapp-config.ini`.
- [ ] IAM DB auth for pymysql.
- [ ] Terraform remote state with S3 + DynamoDB lock (tracked on root TODO).
