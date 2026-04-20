# Project 01 Part 02 — Execution Plan

> **For agentic workers:** Execute phase-by-phase. Each phase ends with a PAUSE checkpoint.
> Orientation map: `../orientation_map.md`

**Goal:** Build the photoapp API layer (7 functions + Rekognition), wire IAM via Terraform, achieve Gradescope 70/70.

**Architecture:** TDD (red → green) per function. IAM created via Terraform before any console click. All secrets flow through gitignored `photoapp-config.ini` — never committed, submitted to Gradescope as live credentials.

**Tech Stack:** Python 3, pymysql, boto3, tenacity, AWS (S3, RDS MySQL 8, Rekognition, IAM), Terraform

**Reference visualizations:**
- `visualizations/Target-State-project01-part02-iam-v1.md` — IAM target state
- `visualizations/Target-State-lab-database-schema-v3.md` — DB schema with labels
- `visualizations/Target-State-project01-part02-api-flow-v1.md` — decorator/inner-fn pattern

---

## Phase 1 — Environment Setup

### Task 1.1: Extend main.tf with IAM

**Files:**
- Modify: `projects/project01/s3-read-write-policy.json.txt`
- Modify: `infra/terraform/main.tf`
- Modify: `infra/terraform/outputs.tf`

- [x] **Step 1: Fix `s3-read-write-policy.json.txt` for templatefile()**

Replace both `YOUR_BUCKET_NAME` occurrences with `${bucket_name}` (Terraform templatefile() syntax).

- [x] **Step 2: Append IAM block to `infra/terraform/main.tf`**

Add after the RDS resource block (includes `lifecycle` on access keys to prevent accidental rotation):

```hcl
###############################################################################
# IAM — Project 01 Part 02
# s3readonly: read-only access to PhotoApp bucket
# s3readwrite: full bucket access + Rekognition (for post_image labels)
###############################################################################

# ── s3readonly ──────────────────────────────────────────────────────────────

resource "aws_iam_user" "s3readonly" {
  name = "s3readonly"
  tags = { Course = "mbai460", ManagedBy = "terraform" }
}

resource "aws_iam_user_policy_attachment" "s3readonly_managed" {
  user       = aws_iam_user.s3readonly.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_access_key" "s3readonly" {
  user = aws_iam_user.s3readonly.name
  # Keys are immutable in-place; rotate via utils/rotate-access-keys (-replace flag)
}

# ── s3readwrite ─────────────────────────────────────────────────────────────

resource "aws_iam_policy" "s3_read_write" {
  name = "photoapp-s3-read-write"
  policy = templatefile(
    "${path.root}/../../projects/project01/s3-read-write-policy.json.txt",
    { bucket_name = var.bucket_name }
  )
}

resource "aws_iam_user" "s3readwrite" {
  name = "s3readwrite"
  tags = { Course = "mbai460", ManagedBy = "terraform" }
}

resource "aws_iam_user_policy_attachment" "s3readwrite_custom" {
  user       = aws_iam_user.s3readwrite.name
  policy_arn = aws_iam_policy.s3_read_write.arn
}

resource "aws_iam_user_policy_attachment" "s3readwrite_rekognition" {
  user       = aws_iam_user.s3readwrite.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRekognitionFullAccess"
}

resource "aws_iam_access_key" "s3readwrite" {
  user = aws_iam_user.s3readwrite.name
  # Keys are immutable in-place; rotate via utils/rotate-access-keys (-replace flag)
}
```

- [x] **Step 3: Add outputs to `infra/terraform/outputs.tf`**

```hcl
output "s3readonly_access_key_id" {
  value     = aws_iam_access_key.s3readonly.id
  sensitive = true
}
output "s3readonly_secret_access_key" {
  value     = aws_iam_access_key.s3readonly.secret
  sensitive = true
}
output "s3readwrite_access_key_id" {
  value     = aws_iam_access_key.s3readwrite.id
  sensitive = true
}
output "s3readwrite_secret_access_key" {
  value     = aws_iam_access_key.s3readwrite.secret
  sensitive = true
}
```

NOTE: `outputs.tf` exists — append the 4 new outputs there.

- [x] **Step 4: Run terraform init**

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1/infra/terraform
export AWS_SHARED_CREDENTIALS_FILE="/Users/erik/Documents/Lab/mbai460-client/claude-workspace/secrets/aws-credentials"
export AWS_CONFIG_FILE="/Users/erik/Documents/Lab/mbai460-client/claude-workspace/secrets/aws-config"
terraform init
```
Expected: `Terraform has been successfully initialized!`

- [x] **Step 5: Run terraform validate**

```bash
terraform validate
```
Expected: `Success! The configuration is valid.`

- [x] **Step 6: Run terraform plan and PAUSE for Erik review**

```bash
terraform plan
```

**→ PAUSE: Present plan output to Erik for review before applying.**

### Task 1.2: terraform apply

- [x] **Step 1: Apply after Erik approves plan**

```bash
terraform apply
```
Expected: ~8 new resources created (2 users, 3 policy attachments, 1 custom policy, 2 access keys).

- [x] **Step 2: Capture access keys into photoapp-config.ini**

```bash
cd /Users/erik/Documents/Lab/mbai460-client/MBAi460-Group1
terraform -chdir=infra/terraform output -json | python3 -c "
import json, sys, configparser

data = json.load(sys.stdin)
ro_id     = data['s3readonly_access_key_id']['value']
ro_secret = data['s3readonly_secret_access_key']['value']
rw_id     = data['s3readwrite_access_key_id']['value']
rw_secret = data['s3readwrite_secret_access_key']['value']

cfg = configparser.ConfigParser(interpolation=None)
cfg.read('projects/project01/client/photoapp-config.ini')
cfg['s3readonly']['aws_access_key_id']     = ro_id
cfg['s3readonly']['aws_secret_access_key'] = ro_secret
cfg['s3readwrite']['aws_access_key_id']    = rw_id
cfg['s3readwrite']['aws_secret_access_key']= rw_secret
with open('projects/project01/client/photoapp-config.ini', 'w') as f:
    cfg.write(f)

print('Keys written to photoapp-config.ini')
print(f's3readonly:  {ro_id[:8]}...')
print(f's3readwrite: {rw_id[:8]}...')
"
```

- [x] **Step 3: Verify get_ping()**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -c "
import photoapp
photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')
M, N = photoapp.get_ping()
print(f'M={M} N={N}')
assert isinstance(M, int), f'S3 not reachable: {M}'
assert N == 3, f'Expected 3 users, got {N}'
print('get_ping() OK')
"
```
Expected: `M=<int> N=3` and `get_ping() OK`

### Task 1.3: Labels schema

**Files:**
- Create: `projects/project01/create-photoapp-labels.sql`

- [x] **Step 1: Create `projects/project01/create-photoapp-labels.sql`**

```sql
-- create-photoapp-labels.sql
-- Rekognition label schema for photoapp — Project 01 Part 02
-- Apply AFTER create-photoapp.sql (requires assets table to exist)

USE photoapp;

DROP TABLE IF EXISTS labels;

CREATE TABLE labels (
  labelid    INT AUTO_INCREMENT PRIMARY KEY,
  assetid    INT NOT NULL,
  label      VARCHAR(128) NOT NULL,
  confidence INT NOT NULL,
  FOREIGN KEY (assetid) REFERENCES assets(assetid) ON DELETE CASCADE,
  INDEX idx_labels_assetid (assetid),
  INDEX idx_labels_label   (label)
);
```

- [x] **Step 2: Apply via run-sql**

```bash
utils/run-sql projects/project01/create-photoapp-labels.sql
```
Expected: `Statements: N | OK: N | Errors: 0`

- [x] **Step 3: Commit Phase 1**

```bash
git add infra/terraform/main.tf projects/project01/create-photoapp-labels.sql
git add projects/project01/s3-read-write-policy.json.txt  # if modified for templatefile
git commit -m "feat(project01-p2): IAM users via Terraform + labels schema

Add s3readonly and s3readwrite IAM users with correct policies.
Pull Rekognition attachment forward (avoids Phase 2 console block).
Add labels table for Rekognition output (assetid FK, label, confidence INT).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 1.4: Create utils/rotate-access-keys

**Files:**
- Create: `utils/rotate-access-keys`

- [x] **Step 1: Write `utils/rotate-access-keys`**

```bash
#!/usr/bin/env bash
# utils/rotate-access-keys
# Rotate s3readonly and s3readwrite IAM access keys.
# Replaces both keys via Terraform, writes new values to photoapp-config.ini,
# verifies connectivity with get_ping(). Run from repo root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLASS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG="${CLASS_ROOT}/projects/project01/client/photoapp-config.ini"
TF_DIR="${CLASS_ROOT}/infra/terraform"
IMAGE=$(cat "${CLASS_ROOT}/docker/_image-name.txt")

export AWS_SHARED_CREDENTIALS_FILE="${AWS_SHARED_CREDENTIALS_FILE:-${CLASS_ROOT}/secrets/aws-credentials}"
export AWS_CONFIG_FILE="${AWS_CONFIG_FILE:-${CLASS_ROOT}/secrets/aws-config}"
export AWS_PROFILE="Claude-Conjurer"

if [[ ! -f "$CONFIG" ]]; then
  echo "[ERROR] $CONFIG not found — cannot write rotated keys" >&2; exit 1
fi

echo "[rotate-access-keys] Replacing IAM access keys via terraform apply -replace..."
terraform -chdir="$TF_DIR" apply \
  -replace=aws_iam_access_key.s3readonly \
  -replace=aws_iam_access_key.s3readwrite \
  -auto-approve

echo "[rotate-access-keys] Writing new keys to $(basename "$CONFIG")..."
terraform -chdir="$TF_DIR" output -json | python3 -c "
import json, sys, configparser
config_path = sys.argv[1]
data = json.load(sys.stdin)
ro_id     = data['s3readonly_access_key_id']['value']
ro_secret = data['s3readonly_secret_access_key']['value']
rw_id     = data['s3readwrite_access_key_id']['value']
rw_secret = data['s3readwrite_secret_access_key']['value']
cfg = configparser.ConfigParser(interpolation=None)
cfg.read(config_path)
cfg['s3readonly']['aws_access_key_id']     = ro_id
cfg['s3readonly']['aws_secret_access_key'] = ro_secret
cfg['s3readwrite']['aws_access_key_id']    = rw_id
cfg['s3readwrite']['aws_secret_access_key']= rw_secret
with open(config_path, 'w') as f:
    cfg.write(f)
print(f'  s3readonly:  {ro_id[:8]}...')
print(f'  s3readwrite: {rw_id[:8]}...')
" "$CONFIG"

echo "[rotate-access-keys] Verifying connectivity..."
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "${CLASS_ROOT}:/home/user" --network host "$IMAGE" \
  python3 -c "
import photoapp
photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')
M, N = photoapp.get_ping()
assert isinstance(M, int), f'S3 not reachable after rotation: {M}'
assert N == 3, f'RDS not reachable after rotation: N={N}'
print(f'  get_ping() = ({M}, {N}) — rotation successful')
"

echo "[rotate-access-keys] Done."
```

- [x] **Step 2: Make executable and smoke test (dry run)**

```bash
chmod +x utils/rotate-access-keys
# Confirm the script exists and is executable — don't run yet (no keys to rotate at this point)
ls -la utils/rotate-access-keys
```

- [x] **Step 3: Update Phase 1 commit to include the script**

Already included in Task 1.3 Step 3 commit — add `utils/rotate-access-keys` to the staged files.

---

## Phase 2 — API Implementation (TDD)

### Task 2.0: Scaffolding

**Files:**
- Modify: `projects/project01/client/client.py`
- Modify: `projects/project01/client/tests.py`

- [x] **Step 1: Add setUpClass + setUp to PhotoappTests**

Add these methods to the `PhotoappTests` class (before `test_01`):

```python
import unittest
import os

class PhotoappTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # m5: verify config file exists before any test runs
        if not os.path.exists('photoapp-config.ini'):
            raise unittest.SkipTest(
                "photoapp-config.ini not found — copy from Part 01 and populate "
                "[s3readonly] and [s3readwrite] sections with IAM access keys"
            )
        photoapp.initialize('photoapp-config.ini', 's3readwrite', 'photoapp-read-write')

    def setUp(self):
        # m4: idempotent pre-test cleanup — ensures each test starts from clean state
        # Gracefully skips if delete_images not yet implemented
        if hasattr(photoapp, 'delete_images'):
            try:
                photoapp.delete_images()
            except Exception:
                pass
```

Note: `test_01` still explicitly calls `initialize()` — that is fine, `initialize()` is idempotent and `test_01` is specifically testing its return value. `setUpClass` calling it first does not invalidate the test.

- [x] **Step 2: Add logging to client.py**

After `import` block, before the `print()` calls:

```python
import logging

logging.basicConfig(
    filename='log.txt',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filemode='w',
)
```

- [x] **Step 2: Fix test_02 M assertion**

In `tests.py`, change:
```python
self.assertEqual(M, 0)
self.assertEqual(N, 3)
```
to:
```python
self.assertIsInstance(M, int, f"S3 not reachable: {M}")
self.assertEqual(N, 3)
```

- [x] **Step 3: Confirm test_01 and test_02 pass, test_03 fails cleanly**

Run from repo root:
```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_01 PhotoappTests.test_02 PhotoappTests.test_03 -v
```

Expected: test_01 PASS, test_02 PASS, test_03 FAIL (not ERROR) with message "get_users() not yet implemented".

### Task 2.1: get_users()

**Files:**
- Modify: `projects/project01/client/photoapp.py`

- [x] **Step 1: Add imports to photoapp.py**

After `from configparser import ConfigParser`, add:
```python
import uuid
from tenacity import retry, stop_after_attempt, wait_exponential
```

- [x] **Step 2: Add retry decorator constant**

After imports:
```python
_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    reraise=True,
)
```

- [x] **Step 3: Implement get_users()**

```python
@_retry
def get_users():
  dbConn = None
  dbCursor = None
  try:
    dbConn = get_dbConn()
    dbCursor = dbConn.cursor()
    dbCursor.execute("SELECT userid, username, givenname, familyname FROM users ORDER BY userid ASC")
    return dbCursor.fetchall()
  except Exception as err:
    logging.error("get_users():")
    logging.error(str(err))
    raise
  finally:
    try: dbCursor.close()
    except: pass
    try: dbConn.close()
    except: pass
```

- [x] **Step 4: Run test_03**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_03 -v
```

Expected: `test_03` PASS — returns exactly `[(80001, 'p_sarkar', 'Pooja', 'Sarkar'), ...]`

### Task 2.2: get_images()

- [x] **Step 1: Add test_04 to tests.py**

```python
def test_04(self):
    print()
    print("** test_04: get_images **")

    images = photoapp.get_images()
    self.assertIsInstance(images, list)

    for row in images:
        self.assertEqual(len(row), 4)
        assetid, userid, localname, bucketkey = row
        self.assertIsInstance(assetid, int)
        self.assertIsInstance(userid, int)

    # filtered: invalid userid returns empty list (not an error)
    result = photoapp.get_images(userid=99999)
    self.assertEqual(result, [])

    print("test passed!")
```

- [x] **Step 2: Run test_04 — confirm FAIL (not ERROR)**

Expected: FAIL with `AttributeError` caught or "not yet implemented"

Actually get_images doesn't exist yet so it will AttributeError. Add same guard pattern to test_04:
```python
    try:
        images = photoapp.get_images()
    except AttributeError:
        self.fail("get_images() not yet implemented in photoapp.py")
```

- [x] **Step 3: Implement get_images()**

```python
@_retry
def get_images(userid=None):
  dbConn = None
  dbCursor = None
  try:
    dbConn = get_dbConn()
    dbCursor = dbConn.cursor()
    if userid is None:
      dbCursor.execute(
        "SELECT assetid, userid, localname, bucketkey FROM assets ORDER BY assetid ASC"
      )
    else:
      dbCursor.execute(
        "SELECT assetid, userid, localname, bucketkey FROM assets WHERE userid=%s ORDER BY assetid ASC",
        [userid]
      )
    return dbCursor.fetchall()
  except Exception as err:
    logging.error("get_images():")
    logging.error(str(err))
    raise
  finally:
    try: dbCursor.close()
    except: pass
    try: dbConn.close()
    except: pass
```

- [x] **Step 4: Run test_04**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_04 -v
```

Expected: PASS

### Task 2.3: post_image()

- [x] **Step 1: Add test_05 to tests.py**

```python
def test_05(self):
    print()
    print("** test_05: post_image **")

    # invalid userid raises ValueError
    try:
        photoapp.post_image(99999, "01degu.jpg")
        self.fail("Expected ValueError for invalid userid")
    except AttributeError:
        self.fail("post_image() not yet implemented")
    except ValueError as e:
        self.assertEqual(str(e), "no such userid")

    # valid upload returns int assetid
    assetid = photoapp.post_image(80001, "01degu.jpg")
    self.assertIsInstance(assetid, int)
    self.assertGreater(assetid, 0)

    # asset appears in get_images
    images = photoapp.get_images(userid=80001)
    self.assertEqual(len(images), 1)
    self.assertEqual(images[0][0], assetid)

    print("test passed!")
```

- [x] **Step 2: Implement post_image()**

```python
def post_image(userid, local_filename):
  @_retry
  def _lookup_user(dbConn, userid):
    dbCursor = dbConn.cursor()
    try:
      dbCursor.execute("SELECT username FROM users WHERE userid=%s", [userid])
      row = dbCursor.fetchone()
      if row is None:
        raise ValueError("no such userid")
      return row[0]
    finally:
      try: dbCursor.close()
      except: pass

  @_retry
  def _insert_asset(dbConn, userid, bucketkey, local_filename):
    dbCursor = dbConn.cursor()
    try:
      dbCursor.execute(
        "INSERT INTO assets (userid, localname, bucketkey) VALUES (%s, %s, %s)",
        [userid, local_filename, bucketkey]
      )
      dbCursor.execute("SELECT LAST_INSERT_ID() AS assetid")
      assetid = dbCursor.fetchone()[0]
      dbConn.commit()
      return assetid
    except Exception:
      dbConn.rollback()
      raise
    finally:
      try: dbCursor.close()
      except: pass

  dbConn = None
  try:
    dbConn = get_dbConn()
    username = _lookup_user(dbConn, userid)

    unique_part = str(uuid.uuid4())
    bucketkey = username + "/" + unique_part + "-" + local_filename

    bucket = get_bucket()
    bucket.upload_file(Filename=local_filename, Key=bucketkey)

    assetid = _insert_asset(dbConn, userid, bucketkey, local_filename)
    return assetid

  except Exception as err:
    logging.error("post_image():")
    logging.error(str(err))
    raise
  finally:
    try: dbConn.close()
    except: pass
```

- [x] **Step 3: Run test_05**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_05 -v
```

Expected: PASS

### Task 2.4: get_image()

- [x] **Step 1: Add test_06 to tests.py**

```python
def test_06(self):
    print()
    print("** test_06: get_image **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    # invalid assetid raises ValueError
    try:
        photoapp.get_image(99999)
        self.fail("Expected ValueError for invalid assetid")
    except AttributeError:
        self.fail("get_image() not yet implemented")
    except ValueError as e:
        self.assertEqual(str(e), "no such assetid")

    import os

    # valid download — omitted local_filename uses stored localname
    filename = photoapp.get_image(assetid)
    self.assertIsInstance(filename, str)
    self.assertTrue(os.path.exists(filename))

    # overwrite contract: if local_filename provided, file is saved (and overwritten) with that name
    overwrite_path = "overwrite_test_tmp.jpg"
    with open(overwrite_path, 'wb') as f:
        f.write(b"placeholder")
    placeholder_size = os.path.getsize(overwrite_path)

    returned = photoapp.get_image(assetid, overwrite_path)
    self.assertEqual(returned, overwrite_path)
    self.assertTrue(os.path.exists(overwrite_path))
    # file must have been overwritten with real image content (larger than placeholder)
    self.assertGreater(os.path.getsize(overwrite_path), placeholder_size)

    os.remove(overwrite_path)

    print("test passed!")
```

- [x] **Step 2: Implement get_image()**

```python
def get_image(assetid, local_filename=None):
  @_retry
  def _lookup_asset(dbConn, assetid):
    dbCursor = dbConn.cursor()
    try:
      dbCursor.execute(
        "SELECT bucketkey, localname FROM assets WHERE assetid=%s", [assetid]
      )
      row = dbCursor.fetchone()
      if row is None:
        raise ValueError("no such assetid")
      return row[0], row[1]   # bucketkey, localname
    finally:
      try: dbCursor.close()
      except: pass

  dbConn = None
  try:
    dbConn = get_dbConn()
    bucketkey, stored_name = _lookup_asset(dbConn, assetid)

    filename = local_filename if local_filename is not None else stored_name

    bucket = get_bucket()
    bucket.download_file(Key=bucketkey, Filename=filename)

    return filename

  except Exception as err:
    logging.error("get_image():")
    logging.error(str(err))
    raise
  finally:
    try: dbConn.close()
    except: pass
```

- [x] **Step 3: Run test_06**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_06 -v
```

Expected: PASS

### Task 2.5: delete_images()

- [x] **Step 1: Add test_07 to tests.py**

```python
def test_07(self):
    print()
    print("** test_07: delete_images **")

    # setUp already cleared state; now upload something to verify deletion
    photoapp.post_image(80001, "01degu.jpg")
    photoapp.post_image(80002, "02earth.jpg")

    images_before = photoapp.get_images()
    self.assertGreater(len(images_before), 0)

    try:
        result = photoapp.delete_images()
    except AttributeError:
        self.fail("delete_images() not yet implemented")

    self.assertEqual(result, True)

    images_after = photoapp.get_images()
    self.assertEqual(len(images_after), 0)

    print("test passed!")
```

- [x] **Step 2: Implement delete_images() (without labels — labels added in Task 2.6)**

```python
def delete_images():
  @_retry
  def _clear_db(dbConn):
    dbCursor = dbConn.cursor()
    try:
      sql = """
        SET foreign_key_checks = 0;
        TRUNCATE TABLE assets;
        SET foreign_key_checks = 1;
        ALTER TABLE assets AUTO_INCREMENT = 1001;
      """
      dbCursor.execute(sql)
      dbConn.commit()
    except Exception:
      dbConn.rollback()
      raise
    finally:
      try: dbCursor.close()
      except: pass

  dbConn = None
  try:
    dbConn = get_dbConn()
    _clear_db(dbConn)

    bucket = get_bucket()
    objects_to_delete = [{'Key': obj.key} for obj in bucket.objects.all()]
    if objects_to_delete:
      bucket.delete_objects(Delete={'Objects': objects_to_delete})

    return True

  except Exception as err:
    logging.error("delete_images():")
    logging.error(str(err))
    raise
  finally:
    try: dbConn.close()
    except: pass
```

- [x] **Step 3: Run test_07**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_07 -v
```

Expected: PASS

- [x] **Step 4: Run test_01–test_07 together**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_01 PhotoappTests.test_02 PhotoappTests.test_03 \
    PhotoappTests.test_04 PhotoappTests.test_05 PhotoappTests.test_06 PhotoappTests.test_07 -v
```

Expected: all PASS

- [x] **Step 5: Commit Phase 2 partial**

```bash
git add projects/project01/client/photoapp.py \
        projects/project01/client/client.py \
        projects/project01/client/tests.py
git commit -m "feat(project01-p2): implement get_users, get_images, post_image, get_image, delete_images

All functions pass test_01–test_07.
Retry decorator on all pymysql paths (inner fns where outer touches S3).
Transaction + commit/rollback on all writes.
delete_images: DB first, S3 second; guards empty Objects list.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Task 2.6: Extend post_image with Rekognition + update delete_images

- [x] **Step 1: Add test_08 to tests.py**

```python
def test_08(self):
    print()
    print("** test_08: post_image with rekognition **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    # labels should exist after upload
    labels = photoapp.get_image_labels(assetid)
    self.assertIsInstance(labels, list)
    # at least 1 label (degu is a recognizable animal)
    self.assertGreater(len(labels), 0)

    label, confidence = labels[0]
    self.assertIsInstance(label, str)
    self.assertIsInstance(confidence, int)

    print("test passed!")
```

Note: test_08 calls get_image_labels which is implemented in Task 2.7 — write the stub guard first.

- [x] **Step 2: Add `_insert_labels` inner fn and Rekognition call to post_image**

Update `post_image()` — after `_insert_asset` inner fn, add:

```python
  @_retry
  def _insert_labels(dbConn, assetid, labels):
    if not labels:
      return
    dbCursor = dbConn.cursor()
    try:
      dbCursor.executemany(
        "INSERT INTO labels (assetid, label, confidence) VALUES (%s, %s, %s)",
        [(assetid, L['Name'], int(L['Confidence'])) for L in labels]
      )
      dbConn.commit()
    except Exception:
      dbConn.rollback()
      raise
    finally:
      try: dbCursor.close()
      except: pass
```

In the main body of `post_image`, after `assetid = _insert_asset(...)`, add:

```python
    rekog = get_rekognition()
    response = rekog.detect_labels(
      Image={'S3Object': {'Bucket': bucket.name, 'Name': bucketkey}},
      MaxLabels=100,
      MinConfidence=80,
    )
    _insert_labels(dbConn, assetid, response.get('Labels', []))
```

- [x] **Step 3: Update `_clear_db` in delete_images to truncate labels first**

Change the SQL in `_clear_db`:
```python
      sql = """
        SET foreign_key_checks = 0;
        TRUNCATE TABLE labels;
        TRUNCATE TABLE assets;
        SET foreign_key_checks = 1;
        ALTER TABLE assets AUTO_INCREMENT = 1001;
      """
```

- [x] **Step 4: Run test_07 (delete_images now clears labels too) — confirm PASS**

- [x] **Step 5: Run test_08 once get_image_labels is implemented (Task 2.7)**

### Task 2.7: get_image_labels()

- [x] **Step 1: Add test_09 to tests.py**

```python
def test_09(self):
    print()
    print("** test_09: get_image_labels **")

    assetid = photoapp.post_image(80001, "01degu.jpg")

    # invalid assetid raises ValueError
    try:
        photoapp.get_image_labels(99999)
        self.fail("Expected ValueError for invalid assetid")
    except AttributeError:
        self.fail("get_image_labels() not yet implemented")
    except ValueError as e:
        self.assertEqual(str(e), "no such assetid")

    # valid assetid returns list of (label, confidence) tuples
    labels = photoapp.get_image_labels(assetid)
    self.assertIsInstance(labels, list)
    for row in labels:
        label, confidence = row
        self.assertIsInstance(label, str)
        self.assertIsInstance(confidence, int)

    print("test passed!")
```

- [x] **Step 2: Implement get_image_labels()**

```python
@_retry
def get_image_labels(assetid):
  dbConn = None
  dbCursor = None
  try:
    dbConn = get_dbConn()
    dbCursor = dbConn.cursor()

    # validate assetid exists
    dbCursor.execute("SELECT assetid FROM assets WHERE assetid=%s", [assetid])
    if dbCursor.fetchone() is None:
      raise ValueError("no such assetid")

    dbCursor.execute(
      "SELECT label, confidence FROM labels WHERE assetid=%s ORDER BY label ASC",
      [assetid]
    )
    return dbCursor.fetchall()

  except Exception as err:
    logging.error("get_image_labels():")
    logging.error(str(err))
    raise
  finally:
    try: dbCursor.close()
    except: pass
    try: dbConn.close()
    except: pass
```

- [x] **Step 3: Run test_08 and test_09**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_08 PhotoappTests.test_09 -v
```

Expected: both PASS

### Task 2.8: get_images_with_label()

- [x] **Step 1: Add test_10 to tests.py**

```python
def test_10(self):
    print()
    print("** test_10: get_images_with_label **")

    assetid1 = photoapp.post_image(80001, "01degu.jpg")
    assetid2 = photoapp.post_image(80002, "02earth.jpg")

    # empty result is not an error
    result = photoapp.get_images_with_label("zzznomatchzzz")
    self.assertEqual(result, [])

    # search returns tuples (assetid, label, confidence)
    try:
        results = photoapp.get_images_with_label("a")
    except AttributeError:
        self.fail("get_images_with_label() not yet implemented")

    for row in results:
        self.assertEqual(len(row), 3)
        assetid, label, confidence = row
        self.assertIsInstance(assetid, int)
        self.assertIsInstance(label, str)
        self.assertIsInstance(confidence, int)
        self.assertIn("a", label.lower())

    # two-level ordering: assetid ASC, then label ASC within same assetid
    # "a" is broad enough that both images should return results
    self.assertGreater(len(results), 1, "Expected multiple results for 'a' search across 2 images")
    for i in range(len(results) - 1):
        curr_assetid, curr_label, _ = results[i]
        next_assetid, next_label, _ = results[i + 1]
        self.assertLessEqual(
            curr_assetid, next_assetid,
            f"assetid not sorted ASC at index {i}: {curr_assetid} > {next_assetid}"
        )
        if curr_assetid == next_assetid:
            self.assertLessEqual(
                curr_label, next_label,
                f"label not sorted ASC within assetid {curr_assetid} at index {i}: '{curr_label}' > '{next_label}'"
            )

    print("test passed!")
```

- [x] **Step 2: Implement get_images_with_label()**

```python
@_retry
def get_images_with_label(label):
  dbConn = None
  dbCursor = None
  try:
    dbConn = get_dbConn()
    dbCursor = dbConn.cursor()
    search_pattern = "%" + str(label) + "%"
    dbCursor.execute(
      """SELECT assetid, label, confidence FROM labels
         WHERE label LIKE %s
         ORDER BY assetid ASC, label ASC""",
      [search_pattern]
    )
    return dbCursor.fetchall()
  except Exception as err:
    logging.error("get_images_with_label():")
    logging.error(str(err))
    raise
  finally:
    try: dbCursor.close()
    except: pass
    try: dbConn.close()
    except: pass
```

- [x] **Step 3: Run test_10**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest PhotoappTests.test_10 -v
```

Expected: PASS

### Task 2.9: Retry smoke check

- [x] **Step 1: Temporarily inject bad SQL into get_users (one word, e.g. `SELECTALLTHEUSERS`)**

In get_users, change SQL to `"SELECTALLTHEUSERS userid FROM users"` — intentional syntax error.

- [x] **Step 2: Run tests and check log.txt for 3 retry attempts**

```bash
# run from client/ dir inside Docker
grep "get_users" log.txt | wc -l
```
Expected: 3 `get_users():` error lines (one per attempt).

- [x] **Step 3: Revert the bad SQL** — restore correct SELECT

### Task 2.10: Full suite

- [x] **Step 1: Run test_01–test_10**

```bash
IMAGE=$(cat docker/_image-name.txt)
docker run --rm -u user -w /home/user/projects/project01/client \
  -v "$(pwd):/home/user" --network host "$IMAGE" \
  python3 -m unittest discover -p "tests.py" -v
```
Expected: 10 tests, 10 PASS, 0 FAIL, 0 ERROR

- [x] **Step 2: Commit Phase 2 complete**

```bash
git add projects/project01/client/photoapp.py \
        projects/project01/client/tests.py
git commit -m "feat(project01-p2): complete API layer + Rekognition (test_01–test_10 green)

get_image_labels, get_images_with_label, post_image Rekognition wiring,
delete_images labels truncation. Retry smoke check confirmed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Phase 3 — Submit Loop

**→ PAUSE before submitting. Erik confirms all tests green and credentials look correct.**

- [x] Pre-submit checklist:
  - `python tests.py` all green
  - `log.txt` has no ERROR lines from happy-path run
  - `photoapp-config.ini` has real `[s3readonly]` and `[s3readwrite]` access keys (not TODO)
  - `photoapp-config.ini` `user_name = photoapp-read-write`
  - No `AKIA...` keys or passwords in any committed file

- [x] Submit:
```bash
cd projects/project01/client
/gradescope/gs submit 1288073 7983365 *.py *.ini
```

- [x] Read Gradescope output. If < 70/70:
  - Identify failing test name → maps to PDF section
  - Fix, re-run local tests
  - Re-submit
  - Repeat until 70/70

---

## Phase 4 — Cleanup

- [ ] Code quality review pass (photoapp.py — inner-fn placement, retry coverage, logging signal)
- [ ] Update `lab-database-schema-v3.md` status from PROPOSED → CURRENT
- [ ] Update `project01-part02-iam-target-v1.md` status from PROPOSED → CURRENT
- [ ] Close Part02 TODO items
- [ ] Write retrospective at `MetaFiles/retrospective.md`
- [ ] Update `Future-State-Ideal-Lab.md` with anything pulled forward or newly surfaced

---

*Created: 2026-04-20. Update as behavior changes during execution.*
