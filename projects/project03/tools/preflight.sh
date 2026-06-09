#!/usr/bin/env bash
# Local preflight for Project 03 Part 01 (no cloud mutation).
set -uo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
PROJ03="$(cd "${TOOLS}/.." && pwd)"
LAB_ROOT="$(cd "${PROJ03}/../../.." && pwd)"
echo "== project03 preflight =="
[ -f "${LAB_ROOT}/claude-workspace/secrets/aws-credentials" ] && echo "  [PASS] aws-credentials present" || echo "  [WARN] aws-credentials missing"
for c in terraform docker aws curl; do
  command -v "$c" >/dev/null 2>&1 && echo "  [PASS] ${c} available" || echo "  [WARN] ${c} not found"
done
[ -f "${PROJ03}/layers/bcrypt-layer.zip" ]  && echo "  [PASS] bcrypt layer zip"  || echo "  [WARN] bcrypt zip missing"
[ -f "${PROJ03}/layers/pymysql-layer.zip" ] && echo "  [PASS] pymysql layer zip" || echo "  [WARN] pymysql zip missing"
[ -f "${PROJ03}/lambda/lambda_function.py" ] && echo "  [PASS] lambda source extracted" || echo "  [WARN] lambda/ not extracted"
echo "  (AWS identity: 'aws sts get-caller-identity' with creds env exported by the Makefile)"
