#
# shorten.py
#
# Implements API for a URL shortening service
#
# Original author:
#   Prof. Joe Hummel
#   Northwestern University
#

import pymysql
from configparser import ConfigParser


###################################################################
#
# get_dbConn
#
# create and return connection object, based on configuration
# information in shorten-config.ini
#
def get_dbConn():
  """
  Reads the configuration info from shorten-config.ini, creates
  a pymysql connection object based on this info, and returns it

  Parameters
  ----------
  N/A

  Returns
  -------
  pymysql connection object
  """

  try:
    #
    # obtain database server config info:
    #
    config_file = 'shorten-config.ini'
    configur = ConfigParser()
    configur.read(config_file)

    endpoint = configur.get('rds', 'endpoint')
    portnum = int(configur.get('rds', 'port_number'))
    username = configur.get('rds', 'user_name')
    pwd = configur.get('rds', 'user_pwd')
    dbname = configur.get('rds', 'db_name')

    #
    # now create connection object and return it:
    #
    dbConn = pymysql.connect(host=endpoint,
                            port=portnum,
                            user=username,
                            passwd=pwd,
                            database=dbname)

    return dbConn

  except Exception as err:
    print("**ERROR in shorten.get_dbConn():")
    print(str(err))
    raise


###################################################################
#
# get_url
#
# Looks up the short url in the database, returning the associated
# long url. Each time this is done, the count for that url is
# incremented.
#
def get_url(shorturl):
  """
  Looks up the short url in the database, returning the associated
  long url. Each time this is done, the count for that url is
  incremented.

  Parameters
  ----------
  shorturl : the short URL to lookup (string)

  Returns
  -------
  long URL (string), or empty string if short URL not found
  """

  dbConn = None
  try:
    dbConn = get_dbConn()
    dbConn.begin()

    cursor = dbConn.cursor()

    #
    # Increment count first. If 0 rows affected the shorturl doesn't
    # exist — return early without a second query (D2 optimization).
    #
    sql = "UPDATE shorten SET count = count + 1 WHERE shorturl = %s"
    cursor.execute(sql, (shorturl,))

    if cursor.rowcount == 0:
      dbConn.rollback()
      return ""

    sql = "SELECT longurl FROM shorten WHERE shorturl = %s"
    cursor.execute(sql, (shorturl,))
    row = cursor.fetchone()

    dbConn.commit()
    return row[0]

  except Exception as err:
    print("**ERROR in shorten.get_url():")
    print(str(err))
    if dbConn:
      dbConn.rollback()
    return ""

  finally:
    if dbConn:
      dbConn.close()


##################################################################
#
# get_stats
#
# Returns the count for the given short url, which represents
# the # of times the short url has been looked up
#
def get_stats(shorturl):
  """
  Looks up the short url and returns the count

  Parameters
  __________
  shorturl : the short URL to lookup (string)

  Returns
  _______
  the count associated with the short url, -1 if short URL not found
  """

  dbConn = None
  try:
    dbConn = get_dbConn()

    cursor = dbConn.cursor()

    sql = "SELECT count FROM shorten WHERE shorturl = %s"
    cursor.execute(sql, (shorturl,))
    row = cursor.fetchone()

    if row is None:
      return -1

    return int(row[0])

  except Exception as err:
    print("**ERROR in shorten.get_stats():")
    print(str(err))
    return -1

  finally:
    if dbConn:
      dbConn.close()


##################################################################
#
# put_shorturl:
#
# Maps the long url to the short url by inserting both urls
# into the database, returning True if successful. If the
# short url already exists in the database (and is mapped to
# a different long url), the database is left unchanged and
# False is returned since the short url is already taken.
#
def put_shorturl(longurl, shorturl):
  """
  Maps the long url to the short url by inserting both urls
  into the database with a count of 0. Fails if the short
  url is already taken AND mapped to a different long url.

  Parameters
  __________
  the original long URL (string)
  the desired short URL (string)

  Returns
  _______
  True if successful, False if not
  """

  dbConn = None
  try:
    dbConn = get_dbConn()
    dbConn.begin()

    cursor = dbConn.cursor()

    #
    # Check whether shorturl already exists.
    #
    sql = "SELECT longurl FROM shorten WHERE shorturl = %s"
    cursor.execute(sql, (shorturl,))
    row = cursor.fetchone()

    if row is None:
      # Not found — insert new mapping.
      sql = "INSERT INTO shorten (shorturl, longurl, count) VALUES (%s, %s, 0)"
      cursor.execute(sql, (shorturl, longurl))
      dbConn.commit()
      return True

    if row[0] == longurl:
      # Already mapped to the same longurl — idempotent success (D3).
      dbConn.rollback()
      return True

    # Shorturl taken by a different longurl — leave DB unchanged.
    dbConn.rollback()
    return False

  except Exception as err:
    print("**ERROR in shorten.put_shorturl():")
    print(str(err))
    if dbConn:
      dbConn.rollback()
    return False

  finally:
    if dbConn:
      dbConn.close()


###############################################################
#
# put_reset
#
# Deletes all the urls from the database
#
def put_reset():
  """
  Deletes all the urls from the database

  Parameters
  __________
  N/A

  Returns
  _______
  True if successful, False if not
  """

  dbConn = None
  try:
    dbConn = get_dbConn()
    dbConn.begin()

    cursor = dbConn.cursor()

    cursor.execute("DELETE FROM shorten")

    dbConn.commit()
    return True

  except Exception as err:
    print("**ERROR in shorten.put_reset():")
    print(str(err))
    if dbConn:
      dbConn.rollback()
    return False

  finally:
    if dbConn:
      dbConn.close()
