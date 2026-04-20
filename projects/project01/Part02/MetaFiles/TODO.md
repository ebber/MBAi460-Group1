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
