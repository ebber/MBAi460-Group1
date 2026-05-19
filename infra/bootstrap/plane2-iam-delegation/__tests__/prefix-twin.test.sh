#!/usr/bin/env bash
# Drift guard for the lab_project_prefix local that lives in two Terraform
# roots/modules (Path A bootstrap + Path B EB module). HCL cannot share locals
# across configurations, so both files must define the same literal.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BOOTSTRAP_TF="${ROOT_DIR}/bootstrap/plane2-iam-delegation/eb_lab_roles.tf"
MODULE_TF="${ROOT_DIR}/../projects/project02/infra/modules/elastic-beanstalk/main.tf"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[ -f "$BOOTSTRAP_TF" ] || fail "missing ${BOOTSTRAP_TF}"
[ -f "$MODULE_TF" ]    || fail "missing ${MODULE_TF}"

extract_prefix() {
  local path="$1"
  grep -E '^\s*lab_project_prefix\s*=' "$path" \
    | head -n 1 \
    | sed -E 's/^[^=]+=\s*//' \
    | tr -d ' \t'
}

A="$(extract_prefix "$BOOTSTRAP_TF")"
B="$(extract_prefix "$MODULE_TF")"

if [ -z "$A" ]; then
  fail "lab_project_prefix not found in ${BOOTSTRAP_TF}"
fi
if [ -z "$B" ]; then
  fail "lab_project_prefix not found in ${MODULE_TF}"
fi

if [ "$A" != "$B" ]; then
  echo "FAIL: lab_project_prefix drift detected" >&2
  echo "  bootstrap : ${BOOTSTRAP_TF} => ${A}" >&2
  echo "  module    : ${MODULE_TF} => ${B}" >&2
  exit 1
fi

echo "PASS lab_project_prefix twin (${A})"
