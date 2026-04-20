# Implementation Notes — Project 01 Part 02

For the implementing agent. Everything here is **additive** to the phased
plan in `plans/project01-part02-plan.md`; read that first, then come back
here for the sharp edges that will eat Gradescope points if you miss them.

---

## Grader mental model (read this twice)

- **The autograder uses your AWS resources.** The PDF is explicit: "make
  sure they match the following: `user_name = photoapp-read-write` …
  user_pwd … so we can access your database when we test your code."
  Graders run their code against *your* RDS, *your* S3, *your*
  `s3readwrite` IAM user. Consequences:
  - Your RDS must be reachable (Phase 4 skips `stop-db-instance` on
    purpose — do not stop it before grading completes).
  - Your `photoapp-config.ini` committed in the submission must have
    real, working credentials — the `.example` template is for the repo,
    the submitted `.ini` is the live one.
  - The rotated passwords from Phase 1 must be in the submitted `.ini`.
- **Test ordering in `tests.py` matters.** PDF: *"to ensure that test_01
  runs first, be sure to name additional tests test_02, test_03, …"*
  Python's unittest loader is alphabetical over method names. Stick to
  two-digit suffixes.
- **Don't break `initialize()` or `get_ping()`.** These are provided code
  and are assumed to work unchanged. The autograder almost certainly
  calls them first.

---

## Contract fidelity — the fastest way to lose points

### Return shapes are tuples in the documented order, not dicts, not lists-of-lists

| Function | Element shape | Order |
|---|---|---|
| `get_users()` | `(userid, username, givenname, familyname)` | ASC by `userid` |
| `get_images(userid=None)` | `(assetid, userid, localname, bucketkey)` | ASC by `assetid` |
| `get_image_labels(assetid)` | `(label, confidence)` | ASC by `label` |
| `get_images_with_label(label)` | `(assetid, label, confidence)` | ASC by `assetid`, then `label` |

Python's default `dbCursor.fetchall()` already returns `tuple` per row —
don't wrap in `dict(...)` or `list(row)`.

### Error message strings are likely string-compared

The PDF explicitly specifies two exact strings. Use them verbatim:

```python
raise ValueError("no such userid")    # post_image
raise ValueError("no such assetid")   # get_image, get_image_labels
```

### Return types the grader will check

- `post_image` returns **`int`** (the new assetid), not a tuple.
- `get_image` returns **`str`** (the local filename actually written),
  not `True` / the asset id / bytes.
- `delete_images` returns **`True`** on success (boolean literal, not
  `1`, not `"ok"`).

### `get_images(userid)` — invalid userid is NOT an error

> *"validity of the userid is not checked, which implies that an empty
> list is returned if the userid is invalid"* — PDF, p.17

Don't raise. Don't pre-check. Just `WHERE userid = %s` and let the empty
resultset speak for itself.

---

## pymysql landmines

### Autocommit is OFF by default

`pymysql.connect(...)` does **not** autocommit. Every write path — the
insert in `post_image`, the bulk label insert, the truncate block in
`delete_images` — needs an explicit `dbConn.commit()` after the SQL, and
`dbConn.rollback()` in the `except` branch before re-raising. Forgetting
commit is a silent no-op: the insert "succeeds" locally, gets discarded
when the connection closes, and every downstream test fails with "no
rows."

### `MULTI_STATEMENTS` is already wired

`get_dbConn()` passes `client_flag=pymysql.constants.CLIENT.MULTI_STATEMENTS`.
That's what makes the 4-statement `delete_images` SQL work in a single
`execute()` call. Don't remove it.

### `LAST_INSERT_ID()` must run on the same connection

After `INSERT INTO assets ...`, run `SELECT LAST_INSERT_ID() AS assetid`
on the **same cursor / same connection** that did the insert. A new
connection will return `0`.

### `executemany` for the label bulk insert

```python
dbCursor.executemany(
    "INSERT INTO labels (assetid, label, confidence) VALUES (%s, %s, %s)",
    [(assetid, L['Name'], int(L['Confidence'])) for L in labels],
)
```

One network round-trip, one transaction. Handles the empty-labels case
cleanly (no-op).

### Cursor lifecycle inside `finally`

The PDF note is right — closing the connection also closes the cursor,
so you can drop the cursor-close block. But if you keep it, wrap each
close in its own `try/except/pass` so a connection-open failure doesn't
re-raise from the `finally`.

---

## boto3 / S3 landmines

### `bucketkey` format is non-negotiable

```python
unique_part = str(uuid.uuid4())
bucketkey = username + "/" + unique_part + "-" + local_filename
```

- `username` comes from the `users` table lookup (one of the fields
  `get_users()` returns). This is how `post_image` validates `userid`.
- Keep the literal `"/"` and `"-"` exactly. Graders likely assert the
  folder shape during cleanup or cross-user tests.
- Use `str(uuid.uuid4())` — not `uuid1`, not `uuid.uuid4().hex`, not
  `secrets.token_hex`. The PDF example is the canonical form.

### `post_image` operation order — upload first, then DB

The PDF asks you to think about it. The answer: **S3 upload first, DB
insert second.** Reasoning:

- Unique UUID means an orphaned S3 object is harmless (no key collision
  on re-upload, and `delete_images` will sweep it eventually).
- A DB row pointing to a non-existent S3 object is a broken reference
  that breaks `get_image` for that assetid forever.

You are explicitly **not required** to roll back the S3 upload if the DB
insert fails. Don't add complexity that isn't asked for.

### `delete_images` operation order — DB first, then S3

From the docstring: *"The images are not deleted from S3 unless the
database is successfully cleared."* That's the contract. Implement it in
that order. A leftover S3 object after a DB failure would mean the DB
still references it — bad. A leftover S3 object after DB success but S3
failure is fine (unique keys).

### `bucket.delete_objects` fails on an empty `Objects` list

```python
if not objects_to_delete:
    return True  # nothing in S3, we're done
bucket.delete_objects(Delete={'Objects': objects_to_delete})
```

### Region consistency

Rekognition reads from S3 via `S3Object`; the Rekognition client and the
bucket must be in the same region. Both read `region_name` from the
same `[s3]` section of the config — don't let them drift.

### Don't decorate S3 / Rekognition calls with `@retry`

boto's `Config(retries={'max_attempts': 3, 'mode': 'standard'})` already
gives you 3 attempts. Adding `@retry` on top means 9 attempts on a
genuinely broken call, and — worse — re-uploads the same image multiple
times in `post_image`.

---

## tenacity landmines

### `reraise=True` is not optional

Without it, `tenacity` wraps the final exception in `RetryError`, and
callers (including the grader's tests) see a different exception type
than the PDF promises. The decorator template is:

```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    reraise=True,
)
```

### Decorate the innermost pymysql function

For `post_image`, `get_image`, `delete_images`, the retry goes on an
**inner** function that only touches MySQL. Decorating the outer
function means retry fires for S3 errors too, and re-uploads the image.

### Exponential backoff will make failing tests slow

`wait_exponential(multiplier=1, min=2, max=30)` means a retry-triggering
test (the 2.9 smoke check) takes 2 + 4 = 6 seconds minimum, and 30+ on
capped runs. Expected — don't chase it as a bug.

---

## Rekognition landmines

### Empty `Labels` list is valid

A low-information image (or one where every detection fell below
`MinConfidence=80`) returns `response['Labels'] == []`. Don't raise.
The insert step becomes a no-op via `executemany([])`.

### Confidence is a float, the schema stores int

```python
int(L['Confidence'])   # NOT round(), NOT int(round(x))
```

PDF says *"truncate using the int() or floor() function"*. `int()` on
a positive float truncates toward zero — same as `floor` for the
positive range Rekognition returns. Be consistent.

### IAM: grant happens once, at Phase 1 apply time

If `detect_labels` returns `AccessDeniedException`, the cause is almost
always that the `AmazonRekognitionFullAccess` attachment on
`s3readwrite` didn't apply. Re-check `terraform state list | grep
rekognition`.

### Possible runtime errors worth logging cleanly

- `InvalidImageFormatException` — corrupted or non-image file.
- `ImageTooLargeException` — files >15 MB (none of the test images hit
  this).
- `InvalidS3ObjectException` — wrong bucket/key, or permission issue.

All three should just bubble up with a clean log line; don't try to
recover.

---

## Schema design for labels (Phase 1 DDL)

Single table is sufficient and simpler to grade:

```sql
CREATE TABLE labels (
  labelid    INT AUTO_INCREMENT PRIMARY KEY,
  assetid    INT NOT NULL,
  label      VARCHAR(128) NOT NULL,
  confidence INT NOT NULL,
  FOREIGN KEY (assetid) REFERENCES assets(assetid) ON DELETE CASCADE,
  INDEX idx_labels_assetid (assetid),
  INDEX idx_labels_label (label)
);
```

Index on `label` makes `get_images_with_label` fast; index on `assetid`
makes `get_image_labels` fast. `ON DELETE CASCADE` is belt-and-suspenders
— `delete_images` truncates both tables explicitly, so cascades never
actually fire, but it prevents ever-shipping an orphaned label if someone
later writes a per-asset delete.

In the `delete_images` truncate block, disable FK checks around *both*
tables:

```sql
SET foreign_key_checks = 0;
TRUNCATE TABLE labels;
TRUNCATE TABLE assets;
SET foreign_key_checks = 1;
ALTER TABLE assets AUTO_INCREMENT = 1001;
```

---

## Config / profile loading

### Profile names are load-bearing

`boto3.setup_default_session(profile_name=s3_profile)` reads the config
file as if it were `~/.aws/credentials`. That means the ini sections
**must be named exactly** `[s3readonly]` and `[s3readwrite]`, with keys
`aws_access_key_id` and `aws_secret_access_key`. The Phase 1 TF-output
script must write those exact section headers.

### `mysql_user` check is defensive

`initialize()` raises `ValueError` if `[rds].user_name !=
mysql_user`. Keep that guard — the grader's `initialize()` call will
pass `'photoapp-read-write'` and your `.ini` had better match.

---

## Logging landmines

### Never `print()` from `photoapp.py`

Provided code uses `logging.error(...)` exclusively. Stay consistent —
stray `print()` calls end up on stderr in the grader's run and can mask
real output.

### Log the function name and the exception as separate lines

Matches the provided pattern:

```python
except Exception as err:
    logging.error("post_image():")
    logging.error(str(err))
    raise
```

Makes the log greppable by function name.

---

## Test harness notes

### Use real AWS, not mocks

Lab contract. The provided `test_01` hits live `get_ping()`; follow that
pattern. Each `test_0N` should be idempotent — call `delete_images()` in
`setUp` (or at the start) so repeated runs don't accumulate state.

### TDD sequencing — which tests "count"

The PDF says you can write as many tests as you want as long as
`test_01` runs first. The autograder does **not** grade your tests; it
runs its own. Your tests exist to gate your implementation before
submission. Aim for:

- One happy-path test per API function.
- One error-path test per function that has a documented error
  (`ValueError` for `post_image`, `get_image`, `get_image_labels`).
- The retry smoke check from Phase 2.9 lives in a test file you
  **don't submit** (or delete before submission) — it injects a bug
  on purpose.

### `client.py` is a scratch pad

PDF says the grader does not run `client.py`. Feel free to leave calls
commented out, keep the logging setup at the top, ship whatever state
is most useful for debugging post-submit.

---

## Pre-submit checklist

1. `python tests.py` — all green, no warnings.
2. `get_ping()` from a fresh client run returns `(int, int)`, both real.
3. `log.txt` from the happy-path run has zero `ERROR` lines.
4. `cred-sweep`-style grep: no `AKIA[A-Z0-9]{16}`, no plaintext
   passwords outside the gitignored `.ini`.
5. `photoapp-config.ini` contains:
   - `[s3]` with real `bucket_name`, `region_name`.
   - `[s3readonly]` + `[s3readwrite]` with `aws_access_key_id` and
     `aws_secret_access_key`.
   - `[rds]` with `endpoint`, `port_number`, `user_name`
     (`photoapp-read-write`), `user_pwd`, `db_name`.
6. `terraform plan` → no drift.
7. Submit: `/gradescope/gs submit 1288073 7983365 *.py *.ini` from the
   `client/` folder.
8. Watch Gradescope output. If `<70/70`, read the failing test name —
   it usually maps 1:1 to the PDF section above. Fix, resubmit.

---

## "Don't touch" list

The following exist in `photoapp.py` and must continue to work unchanged:

- `get_dbConn()`
- `get_bucket()`
- `get_rekognition()`
- `initialize(config_file, s3_profile, mysql_user)`
- `get_ping()`

You can add imports, add module-level constants, and add new functions
freely — just don't refactor the signatures or behaviour of the five
above.

---

*Notes sourced from the PDF contract + provided code in
`projects/project01/client/photoapp.py` + sanctum conventions. Update
when grader behaviour surprises you.*
