#
# Calls S3 to download images from bucket
#
# Prof. Joe Hummel
# Northwestern University
#

import random
import re
import time
import requests
from configparser import ConfigParser
from pathlib import Path

from s3_mime_map import CONTENT_TYPE_TO_EXT

CONFIG_FILE = "s3-config.ini"

# Defaults if [ui] is missing or a key is absent (must match assignment output).
_UI_BANNER_START = "**Starting**"
_UI_BANNER_DONE = "**Done**"
_UI_PROMPT_DOWNLOAD = "Enter image to download without extension>"

# Transient errors: wait a short random interval, then retry (max this many retries).
MAX_TRANSIENT_RETRIES = 3
BACKOFF_SECONDS = (0.6, 2.4)  # inclusive range for uniform delay


def _ui_get(configur, key, default):
  if configur.has_section("ui"):
    return configur.get("ui", key, fallback=default)
  return default


def _download_prompt(configur):
  """Exact input prompt: text ending with '> ' for graded stdout."""
  return _ui_get(configur, "prompt_download", _UI_PROMPT_DOWNLOAD).rstrip() + " "


def error_message_for_display(response):
  """Human-readable detail for failures (e.g. S3 XML Message, else body or HTTP reason)."""
  body = (response.text or "").strip()
  if body:
    m = re.search(r"<Message>([^<]+)</Message>", body, re.IGNORECASE)
    if m:
      return m.group(1).strip()
    line = body.splitlines()[0].strip()
    return line if line else response.reason or str(response.status_code)
  return (response.reason or "").strip() or f"HTTP {response.status_code}"


def http_get_with_retries(url):
  """
  GET url with backoff retries. Returns (response, request_exception).
  response is None only if every attempt raised RequestException.
  """
  response = None
  request_exception = None
  attempt = 0
  while attempt <= MAX_TRANSIENT_RETRIES:
    try:
      response = requests.get(url)
    except requests.RequestException as exc:
      request_exception = exc
      if attempt >= MAX_TRANSIENT_RETRIES:
        return None, exc
      delay = random.uniform(BACKOFF_SECONDS[0], BACKOFF_SECONDS[1])
      print(
        f"Network error ({exc.__class__.__name__}); retrying in {delay:.1f}s "
        f"({attempt + 1} of {MAX_TRANSIENT_RETRIES})..."
      )
      time.sleep(delay)
      attempt += 1
      continue

    request_exception = None
    if response.status_code in (200, 404):
      return response, None
    if attempt >= MAX_TRANSIENT_RETRIES:
      return response, None
    delay = random.uniform(BACKOFF_SECONDS[0], BACKOFF_SECONDS[1])
    print(
      f"HTTP {response.status_code}; retrying in {delay:.1f}s "
      f"({attempt + 1} of {MAX_TRANSIENT_RETRIES})..."
    )
    time.sleep(delay)
    attempt += 1
  return response, None


configur = ConfigParser()
configur.read(CONFIG_FILE)

print(_ui_get(configur, "banner_start", _UI_BANNER_START))
print()

endpoint = configur.get("webserver", "endpoint")

imagename = input(_download_prompt(configur))
# Newline after prompt (input() does not write one); matches graded stdout layout.
print()

url = endpoint + "/" + imagename

response, request_exception = http_get_with_retries(url)

if request_exception is not None:
  print()
  print("status code:", "(no response)")
  print()
  print("ERROR:")
  print("  URL:", url)
  print(
    "  Msg:",
    str(request_exception).strip() or request_exception.__class__.__name__,
  )
else:
  status_code = response.status_code

  print("status code:", status_code)
  print()

  if status_code == 200:
    raw_ct = response.headers.get("Content-Type") or ""
    mime = raw_ct.split(";", 1)[0].strip().lower()
    ext = CONTENT_TYPE_TO_EXT.get(mime, ".unknown")
    local_name = Path(imagename).stem + ext
    Path(local_name).write_bytes(response.content)
    print(f"Success, image downloaded to '{local_name}'")

  else:
    print("ERROR:")
    print("  URL:", url)
    print("  Msg:", error_message_for_display(response))

print()
print(_ui_get(configur, "banner_done", _UI_BANNER_DONE))
