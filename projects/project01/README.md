# Project 01 — PhotoApp

S3 + RDS photo application. Introduces the core AWS backbone used by all subsequent projects.

## Key Files

| File | Purpose |
|------|---------|
| `create-photoapp.sql` | **Canonical photoapp DB schema** — users + assets tables, seed data, IAM users; run via `utils/run-sql` |
| `create-photoapp-labels.sql` | **Labels table extension** (Part 02) — Rekognition output schema; apply after `create-photoapp.sql` |
| `client/photoapp.py` | PhotoApp client implementation |
| `client/tests.py` | Gradescope submission tests |
| `client/photoapp-config.ini` | Client RDS config (read-write user) — assignment-specific |
| `s3-read-write-policy.json.txt` | IAM policy for S3 read/write access |
| `test-mysql.py` | Ad-hoc MySQL connectivity test |

## Config Note

The backbone RDS config (used by `utils/run-sql`, `utils/validate-db`, `utils/smoke-test-aws`) lives at:
`MBAi460-Group1/infra/config/photoapp-config.ini`

The `client/photoapp-config.ini` here is the assignment client config (different credentials — read-write user).

## DB Schema

`create-photoapp.sql` defines the canonical photoapp database structure.
All projects (project02, project03) assume this schema is in place.
To rebuild the DB: `utils/rebuild-db`
To validate: `utils/validate-db`
