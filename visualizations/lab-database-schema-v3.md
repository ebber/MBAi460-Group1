# Lab Database Schema — v3

**Generated:** 2026-04-20
**Scope:** All databases — photoapp (with Part 02 labels table) + URL_Shortener
**Status:** ✅ APPLIED — labels table created in RDS (2026-04-20)
**Supersedes:** `lab-database-schema-v2.md`
**Related diagrams:** `lab-architecture-v2.md`, `project01-part02-iam-v1.md`

---

## RDS Instance — Database Inventory

```mermaid
flowchart TB
    rds[("RDS MySQL 8.0\nphotoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com")]

    subgraph db_photoapp["📦 database: photoapp (Lab01 / Project01)"]
        t_users["users\nuserid PK · username UK\npwdhash · givenname · familyname"]
        t_assets["assets\nassetid PK · userid FK\nlocalname · bucketkey UK"]
        t_labels["labels ← NEW Part 02\nlabelid PK · assetid FK\nlabel · confidence INT"]
        t_users -- "1 → many" --> t_assets
        t_assets -- "1 → many" --> t_labels
    end

    subgraph db_shorten["📦 database: URL_Shortener (Lab02)"]
        t_shorten["shorten\nshorturl VARCHAR(512) PK\nlongurl VARCHAR(512)\ncount INT DEFAULT 0"]
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

    labels {
        int labelid PK "AUTO_INCREMENT"
        int assetid FK "references assets(assetid) ON DELETE CASCADE"
        varchar label "Rekognition label name, VARCHAR(128)"
        int confidence "truncated float: int(L['Confidence'])"
    }

    users ||--o{ assets : "owns"
    assets ||--o{ labels : "has"
```

### Indexes on labels
- `INDEX idx_labels_assetid (assetid)` — fast `get_image_labels(assetid)` lookup
- `INDEX idx_labels_label (label)` — fast `get_images_with_label(label)` LIKE search

### Seed Data (users — unchanged)

| userid | username | givenname | familyname |
|--------|----------|-----------|------------|
| 80001 | p_sarkar | Pooja | Sarkar |
| 80002 | e_ricci | Emanuele | Ricci |
| 80003 | l_chen | Li | Chen |

---

## delete_images() truncation order (FK-safe)

```sql
SET foreign_key_checks = 0;
TRUNCATE TABLE labels;
TRUNCATE TABLE assets;
SET foreign_key_checks = 1;
ALTER TABLE assets AUTO_INCREMENT = 1001;
```

`ON DELETE CASCADE` on `labels.assetid` is belt-and-suspenders — truncation above is explicit,
so cascades never fire in practice. Preserves the correct behaviour if someone later writes a
per-asset delete.

---

## URL_Shortener — unchanged

```mermaid
erDiagram
    shorten {
        varchar shorturl PK "COLLATE utf8mb4_bin — case-sensitive by design"
        varchar longurl "up to 512 chars"
        int count "lookup counter, DEFAULT 0"
    }
```

---

## MySQL Application Users

| User | Database | Permissions | Source |
|------|----------|-------------|--------|
| `photoapp-read-only` | `photoapp` | SELECT, SHOW VIEW | `create-photoapp.sql` |
| `photoapp-read-write` | `photoapp` | SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER | `create-photoapp.sql` |
| `shorten-app` | `URL_Shortener` | SELECT, INSERT, UPDATE, DELETE | `create-shorten.sql` |
| `admin` | all | full | RDS master (Terraform) |

---

## Provisioning Notes

- `photoapp` base schema: `projects/project01/create-photoapp.sql` → `utils/run-sql`
- `labels` schema extension: `projects/project01/create-photoapp-labels.sql` → `utils/run-sql` ← NEW
- `URL_Shortener`: `labs/lab02/create-shorten.sql` → `utils/run-sql`
