"""
utils/_run_sql.py — SQL file runner, called by utils/run-sql via Docker.
Usage: python3 MBAi460-Group1/utils/_run_sql.py <path-to-sql-file>
Reads endpoint from MBAi460-Group1/infra/config/photoapp-config.ini
Reads admin password from MBAi460-Group1/labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt
Substitutes ${VAR} placeholders in SQL from gitignored config files before execution.
"""
import sys, os, configparser, pymysql

_CLASS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if len(sys.argv) != 2:
    print("Usage: _run_sql.py <path-to-sql-file>")
    sys.exit(1)

SQL_FILE = sys.argv[1]
CONFIG   = os.path.join(_CLASS_ROOT, "infra/config/photoapp-config.ini")
PWD_FILE = os.path.join(_CLASS_ROOT, "labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt")

cfg = configparser.ConfigParser(interpolation=None)
cfg.read(CONFIG)
host = cfg["rds"]["endpoint"]

with open(PWD_FILE) as f:
    password = f.read().strip()

print(f"Connecting to {host}:3306 as admin...")
conn = pymysql.connect(
    user="admin", passwd=password, host=host,
    port=3306, database="sys",
    connect_timeout=15, autocommit=True
)
print("Connected.\n")

with open(SQL_FILE) as f:
    sql = f.read()

# Build substitution map from gitignored config files
_vars = {}

cfg_ro = configparser.ConfigParser(interpolation=None)
cfg_ro.read(os.path.join(_CLASS_ROOT, "infra/config/photoapp-config.ini"))
if cfg_ro.has_option("rds", "user_pwd"):
    _vars["PHOTOAPP_RO_PWD"] = cfg_ro["rds"]["user_pwd"]

cfg_rw = configparser.ConfigParser(interpolation=None)
cfg_rw.read(os.path.join(_CLASS_ROOT, "projects/project01/client/photoapp-config.ini"))
if cfg_rw.has_option("rds", "user_pwd"):
    _vars["PHOTOAPP_RW_PWD"] = cfg_rw["rds"]["user_pwd"]

cfg_sh = configparser.ConfigParser(interpolation=None)
cfg_sh.read(os.path.join(_CLASS_ROOT, "labs/lab02/shorten-config.ini"))
if cfg_sh.has_option("rds", "user_pwd"):
    _vars["SHORTEN_APP_PWD"] = cfg_sh["rds"]["user_pwd"]

for k, v in _vars.items():
    sql = sql.replace("${" + k + "}", v)

# Warn if any unresolved placeholders remain
import re
unresolved = re.findall(r'\$\{[^}]+\}', sql)
if unresolved:
    print(f"WARNING: unresolved placeholders in SQL: {unresolved}")
    print("Check that required config files exist and contain the expected keys.")
    sys.exit(1)

cursor = conn.cursor()
passed = 0
failed = 0

for stmt in sql.split(";"):
    clean = stmt.strip()
    if not clean:
        continue
    non_comment = [l for l in clean.splitlines() if not l.strip().startswith("--")]
    if not "".join(non_comment).strip():
        continue
    preview = " ".join(clean.split())[:90]
    print(f">> {preview}{'...' if len(preview) == 90 else ''}")
    try:
        cursor.execute(clean)
        print(f"   [OK]  (rows affected: {cursor.rowcount})")
        passed += 1
    except Exception as e:
        print(f"   [ERROR] {e}")
        failed += 1

cursor.close()
conn.close()

print(f"\nStatements: {passed + failed} | OK: {passed} | Errors: {failed}")
if failed:
    print("ONE OR MORE STATEMENTS FAILED")
    sys.exit(1)
else:
    print("All statements executed successfully.")
