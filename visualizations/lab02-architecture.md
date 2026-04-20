# Lab02 — Architecture

**Generated:** 2026-04-16
**Scope:** Lab02 — URL Shortener API, submission flow, and Gradescope grader pattern
**Status:** Current — approved (frozen)
**Platform:** See `lab-architecture-v2.md` for infrastructure details
**Related:** `lab-database-schema-v2.md`

---

```mermaid
flowchart TB

    subgraph docker["🐳 Docker — mbai460-client"]
        direction TB
        cfg_sh["shorten-config.ini\n[rds] endpoint · shorten-app · URL_Shortener\n(gitignored — submit directly)"]

        subgraph api["shorten.py — URL Shortener API"]
            f1["get_url(shorturl)\n→ longurl or ''"]
            f2["get_stats(shorturl)\n→ count or -1"]
            f3["put_shorturl(longurl, shorturl)\n→ True / False"]
            f4["put_reset()\n→ True / False"]
        end

        tests["tests.py\nunittest suite\nsetUp · tearDown (put_reset)\nhappy path · edge cases · case-sensitivity"]
        gs_sh["Gradescope tool\n/gradescope/gs submit *.py *.ini"]
    end

    subgraph aws["☁️ AWS — us-east-2"]
        db_sh[("RDS MySQL 8.0\nURL_Shortener database\nshorten table\nshorturl PK · utf8mb4_bin")]
    end

    subgraph grader["Gradescope — Lab02"]
        g_import["imports shorten.py\ncalls API functions directly"]
        g_note["⚠️ No direct RDS/S3 check\ninfra reached via shorten.py only"]
    end

    cfg_sh -. "read by" .-> api
    api -- "pymysql\nbegin · execute · commit/rollback" --> db_sh
    tests -- "calls API functions" --> api
    gs_sh -- "submits *.py *.ini" --> grader
    grader --> g_import
    g_import -- "exercises all 4 functions\nvia Python import" --> api
```

---

## Grader Pattern — Critical Distinction vs Lab01

| Dimension | Lab01 / Project01-P1 | Lab02 |
|-----------|---------------------|-------|
| How grader tests | Direct MySQL 3306 + S3 HTTPS | Imports `shorten.py`, calls functions |
| Infrastructure dependency | Grader hits AWS directly | Grader hits AWS *through* our code |
| What must be correct | Live infra + config values | Python logic + live infra + config |
| Failure mode | Wrong endpoint/bucket → fail | Wrong logic OR wrong infra → fail |

## Submission Details

| Item | Value |
|------|-------|
| Submit command (from labs/lab02/ inside Docker) | `/gradescope/gs submit 1288073 7972436 *.py *.ini` |
| Files submitted | `shorten.py` · `tests.py` · `shorten-config.ini` |
| Config note | `shorten-config.ini` is gitignored — submit directly, do not rely on git |
| Result | **100/100** ✅ |
| Autograder results | Human check only — `gs` tool has no `results` command |

## Transaction Model

| Function | Transaction? | Pattern |
|----------|-------------|---------|
| `get_stats` | No | Read-only SELECT |
| `get_url` | Yes | `begin` → UPDATE count+1 → SELECT longurl → `commit` |
| `put_reset` | Yes | `begin` → DELETE FROM shorten → `commit` |
| `put_shorturl` | Yes | `begin` → SELECT → INSERT or no-op → `commit` / `rollback` |

## Key Design Decisions

| Decision | Choice |
|----------|--------|
| Table name | `shorten` — follows instructor example (autograder safety) |
| Collation | `utf8mb4_bin` on `shorturl` — case-sensitive by design |
| DB user | `shorten-app@'%'` — least privilege, SELECT/INSERT/UPDATE/DELETE only |
| Test isolation | `setUp` + `tearDown` both call `put_reset()` — start AND end clean |
