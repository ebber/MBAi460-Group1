#!/usr/bin/env bash
set -euo pipefail

LAB04="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PREFLIGHT="${LAB04}/tools/preflight.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[ -x "${PREFLIGHT}" ] || fail "preflight.sh must be executable"

if ! OUT="$("${PREFLIGHT}" --skip-aws 2>&1)"; then
  echo "${OUT}" >&2
  fail "preflight --skip-aws should be GREEN in a complete lab04 tree"
fi

echo "${OUT}" | grep -q "analyze.py" || fail "preflight should check analyze.py"
echo "${OUT}" | grep -q "weather.py" || fail "preflight should check weather.py"
echo "${OUT}" | grep -q "docker" || fail "preflight should check docker"
echo "${OUT}" | grep -q "preflight: GREEN" || fail "preflight should report GREEN"

echo "PASS lab04 preflight harness"
