#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAGER="${PROJECT_DIR}/tools/stage-eb-bundle.sh"
OUT="${PROJECT_DIR}/build/eb-test"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

rm -rf "$OUT"
mkdir -p "$OUT"
trap 'rm -rf "$OUT"' EXIT

"$STAGER" \
  --config-file "${PROJECT_DIR}/client/photoapp-config.ini.example" \
  --output-dir "$OUT" \
  --bundle-name project02-photoapp-test

ZIP="$OUT/project02-photoapp-test.zip"
MANIFEST="$OUT/project02-photoapp-test.manifest.txt"

[ -f "$ZIP" ] || fail "expected EB bundle zip at $ZIP"
[ -f "$MANIFEST" ] || fail "expected EB bundle manifest at $MANIFEST"

for required in \
  package.json \
  server.js \
  app.js \
  photoapp-config.ini \
  routes/v1/ping.js \
  routes/_internal/readyz.js \
  src/photoapp-core/index.js \
  src/photoapp-core/services/photoapp.js
do
  grep -qx "$required" "$MANIFEST" || fail "manifest missing runtime file: $required"
done

for forbidden in \
  Dockerfile \
  _assignment-template/app.js \
  tests/unit/healthz.test.js \
  jest.config.js
do
  if grep -qx "$forbidden" "$MANIFEST"; then
    fail "manifest contains forbidden file: $forbidden"
  fi
done

unzip -Z1 "$ZIP" >"$OUT/zip-list.txt"
grep -qx "photoapp-config.ini" "$OUT/zip-list.txt" || fail "zip missing root photoapp-config.ini"
grep -qx "src/photoapp-core/index.js" "$OUT/zip-list.txt" || fail "zip missing nested local core"

echo "PASS project02 stage-eb-bundle"
