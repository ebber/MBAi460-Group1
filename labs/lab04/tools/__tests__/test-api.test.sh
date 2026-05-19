#!/usr/bin/env bash
set -euo pipefail

LAB04="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_API="${LAB04}/tools/test-api.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[ -x "${TEST_API}" ] || fail "test-api.sh must be executable"

"${TEST_API}" -h >/dev/null 2>&1 || fail "test-api.sh -h should succeed"

if OUT="$("${TEST_API}" --base-url "http://127.0.0.1:1" 2>&1)"; then
  echo "${OUT}" >&2
  fail "test-api should fail against unreachable host"
fi

echo "${OUT}" | grep -q "RED" || fail "test-api should report RED on failure"

echo "PASS lab04 test-api harness"
