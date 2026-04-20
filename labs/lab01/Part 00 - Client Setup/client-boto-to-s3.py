#
# Downloads image from S3 using AWS's boto3 library
#
import sys

import boto3  # access to Amazon Web Services (AWS)
from botocore import UNSIGNED
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from configparser import ConfigParser
from pathlib import Path

from s3_mime_map import CONTENT_TYPE_TO_EXT

CONFIG_FILE = "s3-config.ini"
_UI_BANNER_START = "**Starting**"
_UI_BANNER_DONE = "**Done**"
_UI_PROMPT_DOWNLOAD = "Enter image to download without extension>"

sys.tracebacklimit = 0


def _ui_get(configur, key, default):
  if configur.has_section("ui"):
    return configur.get("ui", key, fallback=default)
  return default


def _download_prompt(configur):
  return _ui_get(configur, "prompt_download", _UI_PROMPT_DOWNLOAD).rstrip() + " "


def print_formatted_error(bucket_name, region_name, msg):
  print("ERROR:")
  print(" Bucket:", bucket_name)
  print(" Region:", region_name)
  print(" Msg:", msg)


def head_object_not_found(exc):
  """True if ClientError looks like missing object for HeadObject."""
  if not isinstance(exc, ClientError):
    return False
  r = exc.response
  code = r.get("Error", {}).get("Code", "")
  status = r.get("ResponseMetadata", {}).get("HTTPStatusCode")
  return code in ("404", "NoSuchKey", "NotFound") or status == 404


def local_filename_for_download(resolved_key, raw_content_type):
  """
  If the object key has no extension, name the local file stem + ext from
  Content-Type (same rules as client-web-to-s3). Otherwise keep key basename.
  """
  path_key = Path(resolved_key)
  if path_key.suffix:
    return path_key.name
  mime = (raw_content_type or "").split(";", 1)[0].strip().lower()
  ext = CONTENT_TYPE_TO_EXT.get(mime, ".unknown")
  return path_key.stem + ext


try:
  configur = ConfigParser()
  configur.read(CONFIG_FILE)

  print(_ui_get(configur, "banner_start", _UI_BANNER_START))
  print()

  bucket_name = configur.get("bucket", "bucket_name")
  region_name = configur.get("bucket", "region_name")

  s3 = boto3.resource(
    "s3",
    region_name=region_name,
    config=Config(
      signature_version=UNSIGNED,
      retries={"max_attempts": 3, "mode": "standard"},
    ),
  )

  bucket = s3.Bucket(bucket_name)

  imagename = input(_download_prompt(configur)).strip()
  print()
  stem = imagename

  resolved_key = None
  content_type = None
  try:
    head = s3.meta.client.head_object(Bucket=bucket_name, Key=stem)
    resolved_key = stem
    content_type = head.get("ContentType")
  except ClientError as exc:
    if not head_object_not_found(exc):
      raise
    try:
      candidates = list(bucket.objects.filter(Prefix=f"{stem}."))
    except ClientError:
      print_formatted_error(bucket_name, region_name, str(exc))
    else:
      if len(candidates) == 1:
        resolved_key = candidates[0].key
        head = s3.meta.client.head_object(Bucket=bucket_name, Key=resolved_key)
        content_type = head.get("ContentType")
      elif len(candidates) == 0:
        print_formatted_error(bucket_name, region_name, str(exc))
      else:
        keys_preview = ", ".join(c.key for c in candidates[:10])
        more = " …" if len(candidates) > 10 else ""
        print_formatted_error(
          bucket_name,
          region_name,
          f"Multiple keys match '{stem}.*': {keys_preview}{more}",
        )

  if resolved_key is not None:
    local_filename = local_filename_for_download(resolved_key, content_type)
    s3.Object(bucket_name, resolved_key).download_file(local_filename)
    print(f"Success, image downloaded to '{local_filename}'")
    print()
    print(_ui_get(configur, "banner_done", _UI_BANNER_DONE))

except ClientError as err:
  print_formatted_error(bucket_name, region_name, str(err))
except BotoCoreError as err:
  print_formatted_error(bucket_name, region_name, str(err))
