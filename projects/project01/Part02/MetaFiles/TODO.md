# Project 01 Part 02 — Work Queue

Source plan: `plans/project01-part02-plan.md` (extracted from
`../project01-part02.pdf`, cross-walked against
`MBAi460-Group1/MetaFiles/Manifesto-AWS-Lab-Sanctum.md` +
`Future-State-Ideal-Lab.md`).

## Active — assignment-faithful

- [ ] **[Blocker]** Rotate `photoapp-read-only` / `photoapp-read-write`
  passwords (inherited from root `MetaFiles/TODO.md`); regenerate
  `photoapp-config.ini` from `.example` before any PDF step 0 test.
- [ ] **PDF step 3** — add `log.txt` `logging.basicConfig(...)` to
  `projects/project01/client/client.py`.
- [ ] **PDF steps 4–5** — `get_users()`, `get_images(userid=None)` in
  `photoapp.py`; decorate with `@retry(stop_after_attempt(3),
  wait_exponential(multiplier=1, min=2, max=30), reraise=True)`; add
  `test_02`, `test_03` in `tests.py`.
- [ ] **PDF step 6** — `post_image(userid, local_filename)`; inner fns
  for MySQL lookups + insert, transaction + `LAST_INSERT_ID()`;
  `bucket.upload_file` undecorated.
- [ ] **PDF step 7** — `get_image(assetid, local_filename=None)`.
- [ ] **PDF step 8** — `delete_images()`; truncate in txn; skip
  `bucket.delete_objects` when list is empty.
- [ ] **PDF step 9** — Rekognition label schema: one or two tables keyed
  on `assetid`; store `label` + `int(confidence)`. Save DDL at
  `projects/project01/create-photoapp-labels.sql`.
- [ ] **PDF step 11** — wire Rekognition into `post_image`
  (`detect_labels(MaxLabels=100, MinConfidence=80)`; bulk insert in txn).
- [ ] **PDF step 12** — extend `delete_images` to truncate label table(s).
- [ ] **PDF steps 13–14** — `get_image_labels(assetid)` and
  `get_images_with_label(label)` (`LIKE '%…%'`, two-level `ORDER BY`).
- [ ] **PDF step 15** — Gradescope submit
  (`/gradescope/gs submit 1288073 7983365 *.py *.ini`); iterate to 70 / 70.
- [ ] **PDF step 16** — `aws rds stop-db-instance` post-submit.

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
