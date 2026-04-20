# Lab01 / Project01-Part01 — Architecture

**Generated:** 2026-04-16
**Scope:** Lab01 Part01 — PhotoApp setup, submission flow, and Gradescope grader pattern
**Status:** COMPLETE — 10/10 ✅ (frozen — future work does not modify this file)
**Platform:** See `lab-architecture-v2.md` for infrastructure details
**Related:** `lab-database-schema-v2.md` · `lab01-iam-design-v1.md`

---

```mermaid
flowchart TB

    subgraph docker["🐳 Docker — mbai460-client"]
        cfg_pa["photoapp-config.ini\n[rds] endpoint · user_name · db_name\n[s3] bucket_name"]
        py_pa["create-photoapp.sql\ntest-mysql.py"]
        gs_pa["Gradescope tool\n/gradescope/gs submit *.py *.ini"]
    end

    subgraph aws["☁️ AWS — us-east-2"]
        db_pa[("RDS MySQL 8.0\nphotoapp database\nusers · assets · 3 seed rows")]
        bucket["S3: photoapp-erik-mbai460\npublic-read · /test/degu.jpg"]
    end

    subgraph grader["Gradescope — Lab01 / Project01-P1"]
        g_rds["✅ Direct MySQL 3306\nqueries users + assets"]
        g_s3["✅ S3 public URL\nHTTP GET → 200 OK"]
    end

    py_pa -- "pymysql · CREATE DB · TABLE · USER\nINSERT seed data" --> db_pa
    cfg_pa -. "read by" .-> gs_pa
    gs_pa -- "submits *.py *.ini" --> grader
    grader --> g_rds & g_s3
    g_rds -- "TCP 3306" --> db_pa
    g_s3 -- "HTTPS" --> bucket
```

---

## Submission Details

| Item | Value |
|------|-------|
| Submit command (from labs/lab01/ inside Docker) | `/gradescope/gs submit 1288073 7972436 *.py *.ini` |
| Key submitted file | `photoapp-config.ini` — live RDS endpoint + S3 bucket name |
| Grader pattern | **Direct infrastructure check** — hits RDS MySQL 3306 + S3 public URL |
| Result | **10/10** ✅ |

## Key Design Decisions

| Decision | Choice |
|----------|--------|
| DB provisioning | `create-photoapp.sql` via `utils/run-sql` (not manual console) |
| IaC | Terraform (`infra/lab01/`) — provisions RDS + S3 + SG |
| Config bridge | TF outputs → `photoapp-config.ini` → submitted to Gradescope |
