# Expected Outcomes — Lab02: URL Shortener

> Assignment deliverables, API contracts, and grading target.
> Source of truth for what "done" means on this assignment.

---

## Database (RDS — existing instance)

| Item | Value |
|------|-------|
| RDS instance | `photoapp-db.c5q4s860smqq.us-east-2.rds.amazonaws.com` |
| New database | `URL_Shortener` |
| Table | one table — longurl (VARCHAR 512), shorturl (VARCHAR 512, PK), count (INT, default 0) |
| App user | `shorten-app` — SELECT, INSERT, UPDATE, DELETE on `URL_Shortener.*` |

---

## Submitted Deliverables (Gradescope)

| File | Status | Notes |
|------|--------|-------|
| `shorten.py` | ⏳ To implement | 4 functions — stubs provided |
| `tests.py` | ⏳ To expand | 1 test provided; more required |
| `shorten-config.ini` | ✅ Filled | Gitignored; submit directly, do not commit |

Submission command (from inside Docker, CWD = `labs/lab02/`):
```
/gradescope/gs submit 1288073 7972436 *.py *.ini
```

---

## API Contracts

| Function | Inputs | Returns | Behavior |
|----------|--------|---------|----------|
| `get_url(shorturl)` | str | str | Returns longurl; `""` if not found; **increments count on every call** |
| `get_stats(shorturl)` | str | int | Returns count; `-1` if not found |
| `put_shorturl(longurl, shorturl)` | str, str | bool | `True` if new mapping inserted OR same mapping already exists (idempotent); `False` if shorturl taken by a **different** longurl |
| `put_reset()` | — | bool | Deletes all rows; `True` if successful; `False` on exception |

---

## Test Coverage Target

| Test case | Function | Required? |
|-----------|----------|-----------|
| Happy path end-to-end (provided) | all | ✅ provided |
| get_url — shorturl not in DB → `""` | get_url | add |
| get_stats — shorturl not in DB → `-1` | get_stats | add |
| put_shorturl — shorturl taken by different longurl → `False` | put_shorturl | add |

Minimum per assignment: 1 test per function. Our target: 1 per behavioral case.

---

## Grading Target

100/100 on Gradescope autograder.
Unlimited submissions. Last submission scored (not highest).
