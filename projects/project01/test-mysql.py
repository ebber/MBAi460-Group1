import configparser, os, pymysql

# Read endpoint from photoapp-config.ini (same dir as this script)
_cfg = configparser.ConfigParser()
_cfg.read(os.path.join(os.path.dirname(__file__), 'photoapp-config.ini'))
_host = _cfg['rds']['endpoint']

# Read admin password from project secrets (never hardcode)
_pwd_path = os.path.join(
    os.path.dirname(__file__),
    '../../labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt'
)
with open(os.path.normpath(_pwd_path)) as _f:
    _passwd = _f.read().strip()

dbConn = pymysql.connect(
  user='admin',
  passwd=_passwd,
  host=_host,
  port=3306,
  database='sys')

dbCursor = dbConn.cursor()

dbCursor.execute("SHOW DATABASES")

for dbname in dbCursor:
  print(dbname)

dbCursor.close()
dbConn.close()
