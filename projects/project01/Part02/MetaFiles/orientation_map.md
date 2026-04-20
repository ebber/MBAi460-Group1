# Orientation Map — Project 01 Part 02

## Execution Arc

| Phase | Name | Status |
|-------|------|--------|
| 0 | Prep — Audit, divergence, target state, plan | ✅ COMPLETE |
| 1 | Execution — Environment setup + API implementation | ✅ COMPLETE |
| 2 | Submit Loop — Gradescope iteration to 70/70 | ✅ COMPLETE — 70/70 first shot |
| 3 | Cleanup — Artifacts, repo hygiene, retrospective | ✅ COMPLETE |

## Current State

- **Phase:** ALL PHASES COMPLETE
- **Score:** 70/70 Gradescope (2026-04-20, first submission, no iteration needed)
- **Outstanding:** PDF step 16 — `aws rds stop-db-instance` (awaiting Erik authorization)

## Key Decisions / Invariants

- Test numbering ground truth: existing `tests.py` (test_01=init, test_02=get_ping, test_03=get_users already there)
- New tests start at test_04 (not test_02 as plan's section headers suggest)
- test_02 M assertion must be fixed before submit (currently asserts M=0, broken after any S3 upload)
- IAM users created via Terraform (not console), Erik reviews `terraform plan` before apply
- RDS stays running through grading (do NOT stop-db-instance until Gradescope confirms 70/70)
- `photoapp-config.ini` is submitted to Gradescope with live credentials — never commit to git

## Phase 1 Execution Plan ✅

### Step 1.1 — Terraform IAM extension
- Extend `infra/terraform/main.tf`: aws_iam_user.s3readonly + attachment, aws_iam_policy.s3_read_write via templatefile(), aws_iam_user.s3readwrite + attachments (s3 custom + Rekognition), aws_iam_access_key x2, outputs sensitive=true
- PAUSE: Erik reviews terraform plan

### Step 1.2 — terraform apply
- After Erik approves plan output

### Step 1.3 — Populate access keys in photoapp-config.ini
- Pipe terraform output → [s3readonly] and [s3readwrite] sections
- Verify initialize() + get_ping() returns real (M, N)

### Step 1.4 — Labels schema DDL
- Write `projects/project01/create-photoapp-labels.sql`
- Apply via `utils/run-sql`

## Phase 2 Execution Plan (TDD)

| Step | Action | Test |
|------|--------|------|
| 2.0 | logging.basicConfig in client.py | — |
| 2.1 | Fix test_02 M=0 assertion | test_02 green |
| 2.2 | Implement get_users() | test_03 green |
| 2.3 | Implement get_images(userid=None) | test_04 green |
| 2.4 | Implement post_image() (no rekognition) | test_05 green |
| 2.5 | Implement get_image() | test_06 green |
| 2.6 | Implement delete_images() (no labels yet) | test_07 green |
| 2.7 | Extend post_image with Rekognition + delete_images label truncate | test_08 green |
| 2.8 | Implement get_image_labels() | test_09 green |
| 2.9 | Implement get_images_with_label() | test_10 green |
| 2.10 | Retry smoke check (inject bad SQL, confirm 3 attempts in log, revert) | — |
| 2.11 | Full test suite green: test_01–test_10 | all green |

## Phase 3 Submit Loop

- Submit: `/gradescope/gs submit 1288073 7983365 *.py *.ini` from `client/`
- Iterate until 70/70

## Phase 4 Cleanup

- Code quality review pass (photoapp.py end-to-end)
- Cred sweep
- MetaFiles updates (close TODO items)
- Retrospective

---
*Last updated: 2026-04-20. All phases complete. 70/70 Gradescope — first submission. RDS stop pending Erik authorization.*
