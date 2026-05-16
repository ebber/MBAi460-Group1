#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PREFLIGHT="${PROJECT_DIR}/tools/eb-preflight.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

TMP_PARENT="${PROJECT_DIR}/build/preflight-test"
rm -rf "$TMP_PARENT"
mkdir -p "$TMP_PARENT"
trap 'rm -rf "$TMP_PARENT"' EXIT

OUT="$("$PREFLIGHT" --project-dir "$TMP_PARENT" --skip-aws 2>&1 || true)"

echo "$OUT" | grep -q "client/photoapp-config.ini" \
  || fail "preflight should mention missing photoapp-config.ini"
echo "$OUT" | grep -q "infra/envs/dev/terraform.tfvars" \
  || fail "preflight should mention missing terraform.tfvars"
echo "$OUT" | grep -q "make eb-bundle" \
  || fail "preflight should guide user toward make eb-bundle"
echo "$OUT" | grep -q "AWS check skipped" \
  || fail "preflight should report skipped AWS check"

if "$PREFLIGHT" --project-dir "$TMP_PARENT" --skip-aws >/tmp/eb-preflight.test.log 2>&1; then
  fail "preflight should fail while required local files are missing"
fi

echo "PASS eb-preflight"
