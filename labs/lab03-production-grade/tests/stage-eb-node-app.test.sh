#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGER="${ROOT}/bin/stage-eb-node-app.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

assert_zip_contains() {
  local zipfile="$1"
  local path="$2"
  local listing
  listing="$(unzip -Z1 "$zipfile")"
  printf '%s\n' "$listing" | grep -qx "$path" || fail "expected $zipfile to contain $path"
}

assert_zip_not_contains() {
  local zipfile="$1"
  local path="$2"
  local listing
  listing="$(unzip -Z1 "$zipfile")"
  if printf '%s\n' "$listing" | grep -qx "$path"; then
    fail "expected $zipfile to omit $path"
  fi
}

TMP_PARENT="${ROOT}/.tmp"
mkdir -p "$TMP_PARENT"
WORK="$(mktemp -d "$TMP_PARENT/stage.XXXXXXXX")"
trap 'rm -rf "$WORK"' EXIT

APP="$WORK/app"
CONFIG="$WORK/photoapp-config.ini"
OUT="$WORK/out"
mkdir -p "$APP/routes/v1" "$APP/src/photoapp-core" "$APP/tests" "$APP/_assignment-template" "$OUT"

cat >"$APP/package.json" <<'JSON'
{
  "name": "sample-node-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.0.0"
  }
}
JSON

cat >"$APP/server.js" <<'JS'
const app = require('./app');
const port = process.env.PORT || 8080;
app.listen(port);
JS

cat >"$APP/app.js" <<'JS'
module.exports = require('express')();
JS

cat >"$APP/routes/v1/ping.js" <<'JS'
module.exports = (_req, res) => res.json({ message: 'success' });
JS

cat >"$APP/src/photoapp-core/index.js" <<'JS'
module.exports = {};
JS

cat >"$APP/tests/should-not-ship.test.js" <<'JS'
throw new Error('tests should not be bundled');
JS

cat >"$APP/_assignment-template/starter.js" <<'JS'
throw new Error('assignment template should not be bundled');
JS

cat >"$APP/Dockerfile" <<'DOCKER'
FROM node:24-alpine
DOCKER

cat >"$CONFIG" <<'INI'
[s3]
bucket_name = sample
INI

"$STAGER" \
  --source-dir "$APP" \
  --config-file "$CONFIG" \
  --output-dir "$OUT" \
  --bundle-name sample-app \
  --entrypoint server.js

ZIP="$OUT/sample-app.zip"
MANIFEST="$OUT/sample-app.manifest.txt"

[ -f "$ZIP" ] || fail "expected bundle zip at $ZIP"
[ -f "$MANIFEST" ] || fail "expected manifest at $MANIFEST"

assert_zip_contains "$ZIP" "package.json"
assert_zip_contains "$ZIP" "server.js"
assert_zip_contains "$ZIP" "app.js"
assert_zip_contains "$ZIP" "routes/v1/ping.js"
assert_zip_contains "$ZIP" "src/photoapp-core/index.js"
assert_zip_contains "$ZIP" "photoapp-config.ini"

assert_zip_not_contains "$ZIP" "tests/should-not-ship.test.js"
assert_zip_not_contains "$ZIP" "_assignment-template/starter.js"
assert_zip_not_contains "$ZIP" "Dockerfile"

grep -qx "routes/v1/ping.js" "$MANIFEST" || fail "manifest missing nested route"
grep -qx "src/photoapp-core/index.js" "$MANIFEST" || fail "manifest missing nested core file"

echo "PASS stage-eb-node-app"
