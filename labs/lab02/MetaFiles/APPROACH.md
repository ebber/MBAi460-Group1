# Approach — Lab02: URL Shortener

> Implementation plan and design decisions for Lab02.
> Written during Planning phase (2026-04-16). Governs execution.
> Status: COMPLETE — 100/100 ✅ (2026-04-16)

---

## Our Path vs. The Instructor's

The instructor teaches to a non-technical audience using an ad-hoc, one-time approach
(manual MySQL console, minimal tests). We apply production-grade practices aligned with
the long-term Lab goals: version-controlled, repeatable, multi-contributor ready.

| Layer | Instructor's path | Our path |
|-------|------------------|----------|
| DB + user creation | Manual MySQL console | SQL migration script — version-controlled, repeatable |
| Credential hygiene | Fill `.ini` manually | Gitignored config, `.example` template committed |
| Transactions | Implement as taught | Explicit `begin()`/`commit()`/`rollback()` on every write — no auto-commit assumption |
| Testing | 1 per function minimum | 1 per behavioral case + full coverage review |
| Code quality | Fill in TODO stubs | Fix unbound `dbConn` pattern, clean error handling |
| Pattern reuse | One-time exercise | Reference implementation for Project01-P2 |

---

## Design Decisions

**D1 — Table name: `shorten`**
Follows the instructor's example SQL (`SELECT longurl FROM shorten WHERE shorturl = %s`).
Lower deviation risk with Gradescope autograder. Overrides `urls` preference.

**D2 — `get_url()` transaction strategy: UPDATE then SELECT**
`UPDATE shorten SET count = count + 1 WHERE shorturl = %s` first.
If 0 rows affected → URL not found → return `""` without a second query.
If 1 row affected → `SELECT longurl WHERE shorturl = %s` → return longurl.
Atomic in one transaction. Efficient — avoids second query on miss.

**D3 — `put_shorturl()` idempotency logic**
```
begin()
SELECT shorturl →
  not found          → INSERT → commit() → True
  found + same long  → rollback() → True   (idempotent re-registration)
  found + diff long  → rollback() → False  (shorturl taken)
exception            → rollback() → False
```

**D4 — Migration execution: `utils/run-sql`**
Existing utility connects as `admin` (RDS master), reads endpoint from
`projects/project01/photoapp-config.ini`, reads admin password from
`labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt`.
Both confirmed present. Command: `utils/run-sql labs/lab02/create-shorten.sql` from repo root.
No new credential management required.

**D5 — Fix unbound `dbConn` pattern**
Initialize `dbConn = None` before each try block.
Use `if dbConn: dbConn.close()` in finally.
Applied to all 4 functions during implementation.

**D6 — Case-sensitive shorturl collation**
MySQL 8 default (`utf8mb4_0900_ai_ci`) is case-insensitive — wrong for a URL shortener
where `/Abc` ≠ `/abc`. Fix: `COLLATE utf8mb4_bin` on the `shorturl` column.
Binary collation = byte-for-byte comparison. Appropriate for URL path components
(non-ASCII is percent-encoded anyway).

**D7 — Test isolation via setUp / tearDown**
Python unittest runs methods alphabetically. `test_basic_api` ending with `put_reset()`
leaving the table empty for subsequent not-found tests is a happy coincidence, not a
contract. Renaming or reordering breaks it silently.

Fix: `setUp` generates UUIDs stored as `self.longurl` / `self.shorturl` instance variables
AND calls `shorten.put_reset()` to start clean. `tearDown` also calls `shorten.put_reset()`
to end clean. Contract: start clean AND end clean.

Note: `put_reset()` deletes the entire table — not just this test's rows. This is safe
because unittest runs tests sequentially; by the time tearDown fires, the table contains
only what this test inserted (fresh UUIDs per setUp ensure no cross-contamination).

---

## Execution Plan

### Phase 0 — Visualizations: Examine + Target State
```
0a. Read existing visualizations in visualizations/:
      - lab01-database-schema-v1.md
      - lab01-iam-design-v1.md
      - lab01-target-architecture-v1.md
0b. Assess which are affected by Lab02 additions
      (URL_Shortener DB + shorten-app user will touch schema + architecture at minimum)
0c. Create target-state visualizations:
      - Prepend "target-state-" to filename for any new or modified viz
      - New viz files go in visualizations/
      - Show all target-state visualizations to Erik
0d. Await Erik's approval on target state before proceeding to Phase 1
```

### Phase 1 — Schema + Infrastructure
```
1a. Write create-shorten.sql:
      CREATE DATABASE IF NOT EXISTS URL_Shortener;
      USE URL_Shortener;
      CREATE TABLE shorten (
        shorturl  VARCHAR(512) NOT NULL COLLATE utf8mb4_bin,  ← D6: case-sensitive
        longurl   VARCHAR(512) NOT NULL,
        count     INT NOT NULL DEFAULT 0,
        PRIMARY KEY (shorturl)
      );
      DROP USER IF EXISTS 'shorten-app'@'%';
      -- @'%' = any host. Explicit by design: source IP is unpredictable when
      -- connecting via Docker --network host through a NAT boundary to RDS.
      CREATE USER 'shorten-app'@'%' IDENTIFIED BY '<pwd>';
      GRANT SELECT, INSERT, UPDATE, DELETE ON URL_Shortener.* TO 'shorten-app'@'%';
      -- Note: FLUSH PRIVILEGES omitted intentionally. Only required when modifying
      -- grant tables directly (e.g. UPDATE mysql.user). CREATE USER + GRANT are
      -- self-effecting in MySQL 8.
1b. Run: utils/run-sql labs/lab02/create-shorten.sql  (from repo root)
1c. Verify: connect as shorten-app, confirm DB + table + permissions live
```

### Phase 2 — API Implementation
```
2a. get_stats()     — SELECT count; return int or -1; no transaction (read-only)
2b. get_url()       — transaction: UPDATE count+1 → SELECT longurl (D2)
2c. put_reset()     — transaction: DELETE FROM shorten
2d. put_shorturl()  — transaction: SELECT → conditional INSERT (D3)
    [D5 dbConn fix applied across all 4 functions]
```

### Phase 3 — Test Suite
```
3a. Confirm existing test_basic_api still passes
3b. Add test_get_url_not_found          — get_url on missing shorturl → ""
3c. Add test_get_stats_not_found        — get_stats on missing shorturl → -1
3d. Add test_put_shorturl_conflict      — same shorturl, different longurl → False
3e. Add test_put_shorturl_case_sensitive — /Abc and /abc are independent mappings (D6)
3f. Apply setUp / tearDown across all tests (D7):
      setUp:    shorten.put_reset(); self.longurl = uuid URL; self.shorturl = uuid URL
      tearDown: shorten.put_reset()
3g. Step back: review full behavior surface for untested paths
      All possible behaviors, not just expected ones
      Candidates: put_reset on empty table, boundary-length URLs,
      double-lookup count accuracy, count increment isolation, etc.
      Add tests for any meaningful uncovered path found
```

### Phase 4 — Validate + Submit
```
4a. Full test run inside Docker from labs/lab02/
4b. Submit: /gradescope/gs submit 1288073 7972436 *.py *.ini
      Note: gs tool only supports submit — no results command exists.
      Results must be checked by a human at the Gradescope web UI.
      Ask Erik to share the score; do not attempt to poll programmatically.
4c. Review autograder — target 100/100 (human check)
    If < 100:
      · Identify which tests/behaviors failed
      · Augment internal test suite to reproduce the failing case
      · Update implementation
      · Check target-state visualizations for any changes to visualized layers;
        update and show updated target state to Erik for approval if so
      · Run internal suite — confirm fixed
      · Return to 4b
4d. Celebrate validated success 🥂
```

### Phase 5 — Clean Up
```
5a. Overwrite old visualization files with target-state counterparts
      (after this step, no target-state-* files should remain)
5b. Clean up any artifacts and temp files
      (check MetaFiles/APPROACH.md "Temp Files" section; remove scratch files)
5c. Mark APPROACH.md status as COMPLETE
5d. Write retrospective in MetaFiles/RETROSPECTIVE.md:
      - Notes for future agents working in this codebase
      - Lessons learned (what worked, what to do differently)
      - Patterns established that carry forward (esp. to Project01-P2)
      - Any cool observations worth preserving
5e. Update workstream trackers (lab-environment.md Last Updated; any new TODOs surfaced)
5f. Update memory if any new behavioral patterns or heuristics were learned
5g. Do a spin for completeness — verify environment is clean and consistent
5h. Smile 😊
```

---

## Files In Flight

| File | Status | Notes |
|------|--------|-------|
| `labs/lab02/create-shorten.sql` | ✅ Done | Migration — not submitted to Gradescope |
| `labs/lab02/shorten.py` | ✅ Done | 4 functions implemented |
| `labs/lab02/tests.py` | ✅ Done | 7 tests, 100/100 |
| `labs/lab02/shorten-config.ini` | ✅ Done | Gitignored, filled |
| `labs/lab02/shorten-config.ini.example` | ✅ Done | Template, committed |
| `MetaFiles/EXPECTED-OUTCOMES.md` | ✅ Done | Deliverables reference |
| `MetaFiles/NAMING-CONVENTIONS.md` | ✅ Done | Cross-agent naming standard |
| `MetaFiles/APPROACH.md` | ✅ Done | This file |
| `visualizations/lab-*.md` | ✅ Done | Promoted from target-state — no target-state-* files remain |

---

## Temp Files to Clean Up

None currently. If scratch files are created during execution, list them here.
