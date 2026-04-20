# Project 01 Part 02 — implementation plan

Source: `project01-part02.pdf` (26 pages). Cross-referenced against
`MBAi460-Group1/MetaFiles/Manifesto-AWS-Lab-Sanctum.md` and
`MBAi460-Group1/MetaFiles/Future-State-Ideal-Lab.md`.

## Goal

Build the Python API layer `photoapp.py` on top of Part 01 infra (RDS + S3),
add AWS Rekognition, expose 7 API functions usable by a desktop / web / mobile
client. Gradescope target: **70 / 70**.

## Invariants every API function must satisfy (per PDF)

- `try / except / finally`, `logging.*` (never `print`), close every resource.
- `tenacity.retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30), reraise=True)`
  on every pymysql code path. Use an inner function when the outer call also
  touches S3 / Rekognition so retries don't re-upload.
- Do **not** decorate S3 / Rekognition calls — `boto3` already retries via
  `Config(retries={'max_attempts': 3, 'mode': 'standard'})`.
- Wrap every write path in a transaction (`post_image`, `delete_images`,
  Rekognition label inserts).

## Assignment-faithful step list

| # | Step | Touches |
|---|---|---|
| 0 | Copy valid `photoapp-config.ini` from Part 01 into `projects/project01/client/`; confirm `get_ping()` returns `(error, 3)` | config |
| 1 | IAM: user `s3readonly` + `AmazonS3ReadOnlyAccess`; access key → `[s3readonly]` | AWS |
| 2 | IAM: custom policy from `projects/project01/s3-read-write-policy.json.txt`; user `s3readwrite`; access key → `[s3readwrite]` | AWS |
| 3 | Add `log.txt` logging config in `client.py` | `client.py` |
| 4 | `get_users()` — decorate `@retry`, list of `(userid, username, givenname, familyname)` | `photoapp.py`, `tests.py` |
| 5 | `get_images(userid=None)` — decorate `@retry` | `photoapp.py`, `tests.py` |
| 6 | `post_image(userid, local_filename)` — inner fns for MySQL, `bucket.upload_file`, `uuid4` bucketkey, txn + `LAST_INSERT_ID()` | `photoapp.py`, `tests.py` |
| 7 | `get_image(assetid, local_filename=None)` — inner fn lookup, `bucket.download_file` | `photoapp.py`, `tests.py` |
| 8 | `delete_images()` — DB truncate in txn, `bucket.delete_objects` (skip empty) | `photoapp.py`, `tests.py` |
| 9 | Schema extension for Rekognition labels — one or two tables keyed on `assetid`, store `label` + `int(confidence)` | SQL |
| 10 | IAM: attach `AmazonRekognitionFullAccess` to `s3readwrite` | AWS |
| 11 | Extend `post_image` → `rekognition.detect_labels(MaxLabels=100, MinConfidence=80)`, bulk insert in one txn | `photoapp.py` |
| 12 | Extend `delete_images` → truncate labels table(s) | `photoapp.py` |
| 13 | `get_image_labels(assetid)` | `photoapp.py`, `tests.py` |
| 14 | `get_images_with_label(label)` — `LIKE '%…%'`, two-level `ORDER BY` | `photoapp.py`, `tests.py` |
| 15 | Submit `*.py *.ini` to Gradescope `1288073 / 7983365`; iterate to 70 / 70 | Gradescope |
| 16 | Pause RDS post-submit (`aws rds stop-db-instance`) | AWS CLI |

## Future-state overlay (sanctum augmentations)

These keep the assignment passing while moving the sanctum toward
`Future-State-Ideal-Lab.md`. Each bullet here pairs a PDF step with the
manifesto-aligned improvement.

1. **Terraformize IAM** (maps to PDF steps 1, 2, 10 — replaces ~30 console
   clicks). Sits naturally next to the existing resources in
   `infra/terraform/main.tf`. Ticks *"replace broad console policies with
   task-scoped policies"*. Sketch:
   - `aws_iam_user.s3readonly` + `aws_iam_user_policy_attachment` →
     `arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess`.
   - `aws_iam_policy.s3_read_write` sourced from
     `projects/project01/s3-read-write-policy.json.txt` via `templatefile()`,
     substituting `var.bucket_name` for `YOUR_BUCKET_NAME`.
   - `aws_iam_user.s3readwrite` + attachments for the custom policy *and*
     `arn:aws:iam::aws:policy/AmazonRekognitionFullAccess`.
   - `aws_iam_access_key` resources marked with
     `lifecycle { ignore_changes = [...] }` so re-apply doesn't rotate
     unexpectedly.
2. **Version the Rekognition schema** (maps to PDF step 9). Add
   `projects/project01/create-photoapp-labels.sql` alongside
   `create-photoapp.sql` — reproducible via the future-state
   `utils/rebuild-db`, which wants auto-discovery in dependency order.
3. **Secrets hygiene on access keys** (PDF steps 1, 2, 10 paste access keys
   into `photoapp-config.ini`). Sanctum contract: plaintext lives under
   `secrets/`, never under `MetaFiles/`, config file is gitignored with an
   `.example` sibling. Terraform outputs for the two access / secret pairs
   must be `sensitive = true` and piped into the gitignored ini via a local
   script — never `terraform show` into a tracked file. State file itself is
   sensitive (root TODO: "Terraform remote state (S3 + DynamoDB lock)").
4. **Deferred, explicitly out of scope for this submission** (manifesto:
   *"we accept intentionally insecure posture only inside this lab contract"*):
   KMS on the bucket, private bucket + CloudFront / signed URLs, RDS
   `publicly_accessible = false`, Secrets Manager for `photoapp-config.ini`,
   IAM DB auth. Stay tracked in `Future-State-Ideal-Lab.md`; do not pull
   forward for Gradescope.

## 3x-rule triggers surfaced by Part 02

- `utils/rebuild-db` — moves from "nice-to-have" to **required** once
  `create-photoapp-labels.sql` exists next to `create-photoapp.sql`.
- `utils/rotate-passwords` — still backlog; prerequisite for submission is
  the existing root-TODO item *"Reset photoapp users + passwords"* (briefly
  exposed `abc123!!` / `def456!!`).

## Phased execution

### Phase 1 — Environment setup (IaC first)

1. **Rotate exposed DB passwords** — `photoapp-read-only` /
   `photoapp-read-write` (blocker from root `MetaFiles/TODO.md`); regenerate
   `photoapp-config.ini` from `.example`; confirm `get_ping()` returns
   `(error, 3)`.
2. **Extend `infra/terraform/main.tf`** with the IAM the PDF walks by hand:
   - `aws_iam_user.s3readonly` + attachment to
     `arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess`.
   - `aws_iam_policy.s3_read_write` via `templatefile()` over
     `projects/project01/s3-read-write-policy.json.txt` with
     `var.bucket_name`.
   - `aws_iam_user.s3readwrite` + attachments for the custom policy **and**
     `AmazonRekognitionFullAccess` (PDF step 10 pulled forward so Phase 2
     never blocks on a console click).
   - `aws_iam_access_key` for both users; outputs `sensitive = true`.
3. **`terraform plan` → review → `terraform apply`** under the
   `Claude-The-Conjurer` profile.
4. **Pipe TF outputs into the gitignored `photoapp-config.ini`** via a tiny
   `utils/` script (no hand-pasting; nothing under `MetaFiles/` ever touches
   plaintext keys).
5. **Ship the Rekognition label schema now**: author
   `projects/project01/create-photoapp-labels.sql` (tables keyed on
   `assetid`, storing `label` + `int(confidence)`); apply against RDS.
   Unblocks the future-state `utils/rebuild-db`.
6. **Verify**: `client.py` → `get_ping()` returns `(M, 3)` with real `M`;
   swap to `s3readonly` and confirm it still works.

### Phase 2 — API implementation (TDD: red → green → refactor)

Order per function: **write the failing test first in `tests.py`
(`test_0N`), then implement in `photoapp.py`, then confirm green.**
Invariants on every function: `try / except / finally`, `logging.*`,
`@retry(stop_after_attempt(3), wait_exponential(multiplier=1, min=2, max=30),
reraise=True)` on every pymysql path, transactions on writes, no decoration
around `boto3` calls.

#### 2.0 — Logging scaffold first

Add to `client.py` near the top:

```python
logging.basicConfig(
    filename='log.txt',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filemode='w',
)
```

Every red test from here on produces a useful log artifact.

#### 2.1 — `test_02_get_users` → `get_users()`

```python
def get_users() -> list[tuple[int, str, str, str]]
```

- **Goal**: return every row in `users` as
  `(userid, username, givenname, familyname)` ordered by `userid` ASC.
- **Side effects**: none (read-only).
- **Errors**: raises on any DB error.
- **Decoration**: annotate the whole function with `@retry(...)`; no inner
  function needed.

#### 2.2 — `test_03_get_images` → `get_images(userid=None)`

```python
def get_images(userid: int | None = None) -> list[tuple[int, int, str, str]]
```

- **Goal**: return `(assetid, userid, localname, bucketkey)` tuples ordered
  by `assetid` ASC. If `userid` is given, filter to that user.
- **Side effects**: none.
- **Errors**: raises on DB error. Invalid `userid` is **not** an error —
  returns an empty list (PDF is explicit: validity is not checked).
- **Decoration**: annotate the whole function with `@retry(...)`.

#### 2.3 — `test_04_post_image_no_rekognition` → `post_image(userid, local_filename)`

```python
def post_image(userid: int, local_filename: str) -> int
```

- **Goal**: upload `local_filename` to S3 under
  `{username}/{uuid4}-{local_filename}`, insert a row into `assets`,
  return the new `assetid` (from `SELECT LAST_INSERT_ID()`).
- **Side effects**: new S3 object in the photoapp bucket; new row in
  `assets` (txn). Rekognition wiring lands in 2.6 — keep this test scoped
  to upload + DB for now.
- **Errors**: invalid `userid` → `ValueError("no such userid")` (look up
  `username` first — the lookup doubles as validation). File-not-found
  from `bucket.upload_file` → raise. Per PDF: not required to roll back a
  partial success, but prefer the **safer ordering** — upload first, DB
  second. A leaked S3 object is harmless (unique keys); a DB row with no
  object is not.
- **Decoration**: **no** `@retry` on the outer function (would re-upload).
  Put username-lookup and insert in inner fns and decorate **those**.
  Leave `bucket.upload_file` undecorated (boto retries already).

#### 2.4 — `test_05_get_image` → `get_image(assetid, local_filename=None)`

```python
def get_image(assetid: int, local_filename: str | None = None) -> str
```

- **Goal**: download the S3 object for `assetid` to local disk; return the
  filename actually written.
- **Side effects**: writes / overwrites a local file. If `local_filename`
  is omitted, use the `localname` stored in `assets` at upload time.
- **Errors**: invalid `assetid` → `ValueError("no such assetid")`.
  S3 download failure → raise.
- **Decoration**: inner fn for bucketkey / localname lookup, decorated
  with `@retry`. `bucket.download_file` undecorated.

#### 2.5 — `test_06_delete_images` → `delete_images()`

```python
def delete_images() -> bool
```

- **Goal**: empty the assets table (and label tables, once 2.6 lands) and
  clear the S3 bucket.
- **Side effects**: truncates `assets` (+ labels) inside a transaction with
  this exact SQL body (PDF-supplied — preserves the `1001` auto-increment
  contract):

  ```sql
  SET foreign_key_checks = 0;
  TRUNCATE TABLE assets;
  SET foreign_key_checks = 1;
  ALTER TABLE assets AUTO_INCREMENT = 1001;
  ```

  Then `bucket.delete_objects(Delete={'Objects': [{'Key': k}, ...]})` —
  up to 1,000 keys per call, which the PDF says is enough.
- **Errors**: returns `True` on full success; raises on error. Ordering
  contract (from the header comment): **DB first, S3 second**. If DB
  fails → no changes anywhere. If DB succeeds but S3 fails → some
  leftover objects in S3 (acceptable because keys are unique).
- **Edge case**: `delete_objects` fails on an empty list — check length
  before calling.
- **Decoration**: inner fn for the DB side, decorated. S3 calls
  undecorated.

#### 2.6 — `test_07_post_image_with_rekognition`

Extend `post_image` (same signature as 2.3) to call Rekognition after the
S3 upload and persist labels:

```python
rekognition.detect_labels(
    Image={'S3Object': {'Bucket': bucket.name, 'Name': bucketkey}},
    MaxLabels=100,
    MinConfidence=80,
)
```

- **Goal**: for each entry in `response['Labels']`, persist
  `(assetid, label_name, int(confidence))` into the label table from the
  Phase 1 DDL.
- **Side effects**: one transaction containing all label inserts for the
  new asset (bulk is more efficient than per-row, and matches the PDF
  guidance).
- **Errors**: if Rekognition fails, the S3 object + assets row remain
  (not required to roll back per PDF). If the label insert fails, raise.
- **Decoration**: inner fn wrapping the bulk insert, `@retry`-decorated.
  `detect_labels` is boto, undecorated.
- **Also in this step**: extend `delete_images` to `TRUNCATE` the label
  table(s) in the same transaction; backfill `test_06` to assert labels
  are cleared.

#### 2.7 — `test_08_get_image_labels` → `get_image_labels(assetid)`

```python
def get_image_labels(assetid: int) -> list[tuple[str, int]]
```

- **Goal**: return `(label, confidence)` tuples for this asset, ordered
  by `label` ASC. `confidence` is an integer.
- **Side effects**: none.
- **Errors**: invalid `assetid` → `ValueError("no such assetid")`.
  Validate by checking the asset exists (either a pre-check on `assets`,
  or detect an empty label set combined with a missing asset — whichever
  matches your schema).
- **Decoration**: annotate directly with `@retry`.

#### 2.8 — `test_09_get_images_with_label` → `get_images_with_label(label)`

```python
def get_images_with_label(label: str) -> list[tuple[int, str, int]]
```

- **Goal**: case-insensitive substring search across stored labels.
  Return `(assetid, label, confidence)` tuples ordered by `assetid` ASC,
  then by `label` ASC (two-level `ORDER BY`).
- **Side effects**: none.
- **Errors**: raise on DB error. Empty result is not an error.
- **Implementation detail**: pattern goes through the execute parameters,
  not string interpolation:

  ```python
  search_pattern = "%" + str(label) + "%"
  dbCursor.execute(sql, [search_pattern])
  ```

- **Decoration**: annotate directly with `@retry`.

#### 2.9 — Retry-logic smoke check

Introduce a bogus SQL keyword (e.g. `SELECTALLTHEUSERS`) in one function,
run once, confirm `log.txt` shows **3** attempts from that function,
revert.

### Phase 3 — Testing and submission

1. Full `python tests.py` green locally (`test_01` → `test_09`).
2. End-to-end client walk: upload all 4 provided images, list, download
   one, search by label, delete, confirm empty.
3. Inspect `log.txt` — expect no `ERROR` lines from the happy path.
4. `terraform plan` → clean (no drift from console poking during testing).
5. Submit: `/gradescope/gs submit 1288073 7983365 *.py *.ini` from the
   `client/` folder.
6. Read Gradescope output; iterate until **70 / 70**. Re-submit as needed.

### Phase 4 — Post-submit

*(RDS stays running per Erik — skipping `stop-db-instance`.)*

1. **Do a spin to assess code quality** — re-read `photoapp.py` end to
   end: inner-fn placement, retry decoration coverage, transaction
   boundaries, `finally`-close correctness, log message signal-to-noise,
   naming. Capture anything worth fixing before it calcifies.
2. **Cleanup**:
   - Delete scratch artifacts (`log.txt`, stray test images under the
     user's S3 folder if testing left any).
   - Scrub experimental branches / uncommitted `print(...)` from
     debugging.
   - `cred-sweep`-style grep over the tree before commit:
     `IDENTIFIED BY '`, `AKIA[A-Z0-9]{16}`,
     `aws_secret_access_key =`, `def456!!`, `abc123!!`.
   - Confirm `photoapp-config.ini` is still gitignored; `.example` sibling
     has all keys with TODO placeholders.
   - `terraform plan` shows no drift.
3. **Update `MetaFiles/`**:
   - Check off completed items in root `MetaFiles/TODO.md` and
     `Future-State-Ideal-Lab.md` (IaC for IAM, schema in VCS).
   - Note anything pulled forward from Future-State, and anything new
     that got deferred to it.
4. **Write a retrospective** —
   `MBAi460-Group1/projects/project01/Part02/MetaFiles/retrospective.md`:
   what went well, what surprised us, where the PDF and the sanctum
   pulled in different directions, 3x-rule candidates that surfaced
   during the work, concrete items to pull into
   `Future-State-Ideal-Lab.md` or the next assignment.
5. **Smile.** :)

---

*Created from `project01-part02.pdf` analysis + manifesto / future-state
cross-walk. Update in the same session as any behavior change.*
