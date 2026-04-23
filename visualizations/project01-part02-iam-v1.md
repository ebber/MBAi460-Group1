# Project 01 Part 02 — IAM Target State

**Generated:** 2026-04-20
**Scope:** IAM identity model after Part 02 Phase 1 Terraform apply
**Status:** ✅ APPLIED — Phase 1 terraform apply complete (2026-04-20)
**Related diagrams:** `lab01-iam-design-v1.md`, `lab-architecture-v2.md`
**Filename:** `project01-part02-iam-v1.md`

---

## Target IAM State (post-apply)

```mermaid
flowchart TB

    subgraph account["☁️  AWS Account  772360735396"]

        subgraph iam_existing["IAM — Existing (Part 01)"]
            u_conjurer["Claude-The-Conjurer\nPowerUserAccess\nstatic key in secrets/"]
        end

        subgraph iam_new["IAM — New (Part 02 — Terraform-managed)"]
            u_ro["s3readonly\nProgrammatic only\naccess key → photoapp-config.ini [s3readonly]"]
            u_rw["s3readwrite\nProgrammatic only\naccess key → photoapp-config.ini [s3readwrite]"]
        end

        subgraph policies["Policies"]
            p_s3ro["AWS Managed:\nAmazonS3ReadOnlyAccess"]
            p_s3rw["aws_iam_policy.s3_read_write\nCustom — inline from\ns3-read-write-policy.json.txt\nscoped to var.bucket_name"]
            p_rekog["AWS Managed:\nAmazonRekognitionFullAccess"]
        end

        subgraph resources["Resources accessed"]
            s3["S3 Bucket\nphotoapp-erik-mbai460"]
            rekog["Rekognition\nus-east-2"]
        end

        u_ro --> p_s3ro --> s3
        u_rw --> p_s3rw --> s3
        u_rw --> p_rekog --> rekog
        rekog -- "reads from\n(same-region)" --> s3
    end

    subgraph local["🖥️  Local — photoapp-config.ini (gitignored)"]
        ini_ro["[s3readonly]\naws_access_key_id = ...\naws_secret_access_key = ..."]
        ini_rw["[s3readwrite]\naws_access_key_id = ...\naws_secret_access_key = ..."]
    end

    u_ro -.->|"terraform output\n→ piped into ini"| ini_ro
    u_rw -.->|"terraform output\n→ piped into ini"| ini_rw
```

---

## Access Key Flow

`initialize(config_file, s3_profile, mysql_user)` sets:
```
os.environ['AWS_SHARED_CREDENTIALS_FILE'] = config_file
boto3.setup_default_session(profile_name=s3_profile)
```

`photoapp-config.ini` doubles as **both** app config and AWS credentials file.
The `[s3readonly]` and `[s3readwrite]` sections are read as if they were `~/.aws/credentials` entries.

| `s3_profile` arg | INI section used | IAM user | Permissions |
|---|---|---|---|
| `'s3readonly'` | `[s3readonly]` | s3readonly | S3 list + get only |
| `'s3readwrite'` | `[s3readwrite]` | s3readwrite | S3 full + Rekognition |

The grader calls `initialize(..., 's3readwrite', 'photoapp-read-write')`.

---

## Terraform resources added (Phase 1)

```hcl
aws_iam_user.s3readonly
aws_iam_user_policy_attachment.s3readonly_managed     # AmazonS3ReadOnlyAccess
aws_iam_access_key.s3readonly                         # output: sensitive = true

aws_iam_policy.s3_read_write                          # templatefile() over s3-read-write-policy.json.txt
aws_iam_user.s3readwrite
aws_iam_user_policy_attachment.s3readwrite_custom     # custom s3 policy
aws_iam_user_policy_attachment.s3readwrite_rekognition # AmazonRekognitionFullAccess
aws_iam_access_key.s3readwrite                        # output: sensitive = true
```

---

## What does NOT change

- `photoapp-read-only` / `photoapp-read-write` MySQL users — unchanged
- `Claude-The-Conjurer` — unchanged (runs terraform)
- RDS, S3 bucket, security group — unchanged
