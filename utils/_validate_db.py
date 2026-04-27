"""
utils/_validate_db.py — 26-check DB validation suite, called by utils/validate-db via Docker.
Reads endpoint from MBAi460-Group1/infra/config/photoapp-config.ini
Reads admin password from MBAi460-Group1/labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt
"""
import sys, os, configparser, pymysql

_CLASS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CONFIG   = os.path.join(_CLASS_ROOT, "infra/config/photoapp-config.ini")
PWD_FILE = os.path.join(_CLASS_ROOT, "labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt")

cfg = configparser.ConfigParser(interpolation=None)
cfg.read(CONFIG)
host          = cfg["rds"]["endpoint"]
ro_pwd        = cfg["rds"]["user_pwd"]  # photoapp-read-only password

CLIENT_CONFIG = os.path.join(_CLASS_ROOT, "projects/project01/client/photoapp-config.ini")
cfg_client = configparser.ConfigParser(interpolation=None)
cfg_client.read(CLIENT_CONFIG)
rw_pwd        = cfg_client["rds"]["user_pwd"]  # photoapp-read-write password

with open(PWD_FILE) as f:
    admin_pwd = f.read().strip()

passed = 0
failed = 0

def check(label, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  [PASS] {label}" + (f" — {detail}" if detail else ""))
        passed += 1
    else:
        print(f"  [FAIL] {label}" + (f" — {detail}" if detail else ""))
        failed += 1
    return condition

print(f"\nConnecting to {host}:3306 as admin...")
conn = pymysql.connect(user="admin", passwd=admin_pwd, host=host,
                       port=3306, database="photoapp", connect_timeout=15)
print("Connected.\n")

# ── SHOW DATABASES ────────────────────────────────────────────────────────────
print("=== Admin: SHOW DATABASES ===")
cur = conn.cursor()
cur.execute("SHOW DATABASES")
dbs = [r[0] for r in cur.fetchall()]
check("photoapp database exists", "photoapp" in dbs, str(dbs))

# ── users table ───────────────────────────────────────────────────────────────
print("\n=== Schema: users table ===")
cur.execute("DESCRIBE users")
cols = {r[0]: r for r in cur.fetchall()}
check("userid column exists",     "userid"     in cols)
check("username column exists",   "username"   in cols)
check("pwdhash column exists",    "pwdhash"    in cols)
check("givenname column exists",  "givenname"  in cols)
check("familyname column exists", "familyname" in cols)

cur.execute("SHOW CREATE TABLE users")
ddl = cur.fetchone()[1]
check("userid is PRIMARY KEY",  "PRIMARY KEY"   in ddl)
check("username is UNIQUE",     "UNIQUE"        in ddl)
check("AUTO_INCREMENT in DDL",  "AUTO_INCREMENT" in ddl)

# ── assets table ──────────────────────────────────────────────────────────────
print("\n=== Schema: assets table ===")
cur.execute("DESCRIBE assets")
cols = {r[0]: r for r in cur.fetchall()}
check("assetid column exists",   "assetid"   in cols)
check("userid column exists",    "userid"    in cols)
check("localname column exists", "localname" in cols)
check("bucketkey column exists", "bucketkey" in cols)
check(
    "assets.kind: ENUM('photo','document') NOT NULL",
    "kind" in cols
    and "enum('photo','document')" in (cols["kind"][1] or "").lower()
    and (cols["kind"][2] or "").upper() == "NO",
    detail=str(cols.get("kind"))
)

cur.execute("SHOW CREATE TABLE assets")
ddl = cur.fetchone()[1]
check("assetid is PRIMARY KEY", "PRIMARY KEY" in ddl)
check("FOREIGN KEY to users",   "FOREIGN KEY" in ddl)
check("bucketkey is UNIQUE",    "UNIQUE"      in ddl)

# ── AUTO_INCREMENT ────────────────────────────────────────────────────────────
print("\n=== AUTO_INCREMENT starting values ===")
cur.execute("""
    SELECT TABLE_NAME, AUTO_INCREMENT
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'photoapp'
""")
ai = {r[0]: r[1] for r in cur.fetchall()}
check("users AUTO_INCREMENT >= 80001", ai.get("users",  0) >= 80001, str(ai.get("users")))
check("assets AUTO_INCREMENT >= 1001", ai.get("assets", 0) >= 1001,  str(ai.get("assets")))

# ── Seed data ─────────────────────────────────────────────────────────────────
print("\n=== Seed data: users table ===")
cur.execute("SELECT userid, username, givenname, familyname FROM users ORDER BY userid")
rows = cur.fetchall()
check("exactly 3 seed rows", len(rows) == 3, f"got {len(rows)}")
usernames = [r[1] for r in rows]
check("p_sarkar present", "p_sarkar" in usernames)
check("e_ricci present",  "e_ricci"  in usernames)
check("l_chen present",   "l_chen"   in usernames)
userids = [r[0] for r in rows]
check("seed userids are 80001, 80002, 80003", userids == [80001, 80002, 80003], str(userids))
for row in rows:
    print(f"         userid={row[0]}  username={row[1]}  name={row[2]} {row[3]}")

print("\n=== Seed data: assets table (expect empty) ===")
cur.execute("SELECT COUNT(*) FROM assets")
count = cur.fetchone()[0]
check("assets table is empty", count == 0, f"got {count} rows")

cur.close()
conn.close()

# ── App users ─────────────────────────────────────────────────────────────────
print("\n=== App user: photoapp-read-only ===")
try:
    c = pymysql.connect(user="photoapp-read-only", passwd=ro_pwd,
                        host=host, port=3306, database="photoapp", connect_timeout=10)
    cur2 = c.cursor()
    cur2.execute("SELECT * FROM users")
    r = cur2.fetchall()
    check("photoapp-read-only can SELECT from users", True, f"{len(r)} rows")
    cur2.close(); c.close()
except Exception as e:
    check("photoapp-read-only can SELECT from users", False, str(e))

print("\n=== App user: photoapp-read-write ===")
try:
    c = pymysql.connect(user="photoapp-read-write", passwd=rw_pwd,
                        host=host, port=3306, database="photoapp", connect_timeout=10)
    cur3 = c.cursor()
    cur3.execute("SELECT * FROM users")
    r = cur3.fetchall()
    check("photoapp-read-write can SELECT from users", True, f"{len(r)} rows")
    cur3.close(); c.close()
except Exception as e:
    check("photoapp-read-write can SELECT from users", False, str(e))

# ── Summary ───────────────────────────────────────────────────────────────────
total = passed + failed
print(f"\n{'='*50}")
print(f"  Checks: {total} | Passed: {passed} | Failed: {failed}")
print(f"  {'ALL CHECKS PASSED' if failed == 0 else f'{failed} CHECK(S) FAILED'}")
print(f"{'='*50}\n")

if failed:
    sys.exit(1)
