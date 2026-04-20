# Lab Database Schema — v2

**Generated:** 2026-04-16
**Scope:** All databases on the shared RDS MySQL 8.0 instance — Lab01 (photoapp) + Lab02 (URL_Shortener)
**Status:** Current — approved
**Related diagrams:** `lab-architecture-v2.md`

---

## RDS Instance — Database Inventory

```mermaid
flowchart TB
    rds[("RDS MySQL 8.0\nphotoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com")]

    subgraph db_photoapp["📦 database: photoapp (Lab01 / Project01)"]
        t_users["users\nuserid PK · username UK\npwdhash · givenname · familyname"]
        t_assets["assets\nassetid PK · userid FK\nlocalname · bucketkey UK"]
        t_users -- "1 → many" --> t_assets
    end

    subgraph db_shorten["📦 database: URL_Shortener (Lab02)"]
        t_shorten["shorten\nshorturl VARCHAR(512) PK\n  COLLATE utf8mb4_bin ← case-sensitive\nlongurl VARCHAR(512)\ncount INT DEFAULT 0"]
    end

    rds --> db_photoapp & db_shorten
```

---

## photoapp — Entity-Relationship Detail

```mermaid
erDiagram
    users {
        int userid PK "AUTO_INCREMENT from 80001"
        varchar username UK "unique login handle"
        varchar pwdhash "bcrypt hash"
        varchar givenname
        varchar familyname
    }

    assets {
        int assetid PK "AUTO_INCREMENT from 1001"
        int userid FK "owner"
        varchar localname "original filename"
        varchar bucketkey UK "S3 object key"
    }

    users ||--o{ assets : "owns"
```

### Seed Data (3 rows — exact values required by Gradescope)

| userid | username | givenname | familyname |
|--------|----------|-----------|------------|
| 80001 | p_sarkar | Pooja | Sarkar |
| 80002 | e_ricci | Emanuele | Ricci |
| 80003 | l_chen | Li | Chen |

---

## URL_Shortener — Entity-Relationship Detail

```mermaid
erDiagram
    shorten {
        varchar shorturl PK "COLLATE utf8mb4_bin — case-sensitive by design"
        varchar longurl "up to 512 chars"
        int count "lookup counter, DEFAULT 0"
    }
```

**Design notes:**
- `shorturl` is the natural PK — it is the lookup key; no surrogate ID needed
- `utf8mb4_bin` collation enforces case-sensitivity: `/Abc` ≠ `/abc`
- No foreign keys — standalone mapping table

---

## MySQL Application Users — All Databases

```mermaid
flowchart LR
    subgraph mysql["MySQL on RDS"]
        db_pa[("photoapp")]
        db_us[("URL_Shortener")]
    end

    ro["photoapp-read-only\npwd: abc123!! (grader-checked)"]
    rw["photoapp-read-write\npwd: def456!! (grader-checked)"]
    sa["shorten-app@'%'\npwd: see shorten-config.ini"]

    ro -- "SELECT · SHOW VIEW" --> db_pa
    rw -- "SELECT · SHOW VIEW\nINSERT · UPDATE · DELETE\nDROP · CREATE · ALTER" --> db_pa
    sa -- "SELECT · INSERT\nUPDATE · DELETE" --> db_us
```

| User | Host | Database | Permissions | Source |
|------|------|----------|-------------|--------|
| `photoapp-read-only` | `%` | `photoapp` | SELECT, SHOW VIEW | `create-photoapp.sql` |
| `photoapp-read-write` | `%` | `photoapp` | SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER | `create-photoapp.sql` |
| `shorten-app` | `%` | `URL_Shortener` | SELECT, INSERT, UPDATE, DELETE | `create-shorten.sql` |
| `admin` | RDS master | all | full | RDS provisioned via Terraform |

**Note on `@'%'`:** All app users specify `@'%'` (any host) explicitly. Source IP is unpredictable
when connecting through Docker `--network host` via NAT to RDS public endpoint.

---

## Provisioning Notes

- `photoapp` DB: created via `projects/project01/create-photoapp.sql` → `utils/run-sql`
- `URL_Shortener` DB: created via `labs/lab02/create-shorten.sql` → `utils/run-sql`
- `FLUSH PRIVILEGES` is **not used** — `CREATE USER` + `GRANT` are self-effecting in MySQL 8
- Verification: connect as each app user and confirm table access before submitting
