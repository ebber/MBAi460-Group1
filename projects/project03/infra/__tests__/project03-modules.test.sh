#!/usr/bin/env bash
# Tier-A contract tests for Project 03 Part 01 infra (pre-apply; no cloud).
set -uo pipefail
INFRA="$(cd "$(dirname "$0")/.." && pwd)"
pass=0; fail=0
ok(){ echo "  [PASS] $1"; pass=$((pass+1)); }
no(){ echo "  [FAIL] $1"; fail=$((fail+1)); }
exists(){ [ -f "$1" ] && ok "$2" || no "$2"; }
greps(){ grep -qE "$1" "$2" 2>/dev/null && ok "$3" || no "$3"; }

echo "== Project 03 infra module contract =="
exists "$INFRA/modules/lambda-layer/main.tf"                                "lambda-layer module"
exists "$INFRA/modules/lambda-authenticate/main.tf"                        "lambda-authenticate module"
exists "$INFRA/modules/api-authsvc/main.tf"                                "api-authsvc module"
exists "$INFRA/envs/dev/main.tf"                                           "env dev"
exists "$INFRA/modules/lambda-authenticate/templates/authsvc-config.ini.tftpl" "config template"

greps 'aws_lambda_function'                "$INFRA/modules/lambda-authenticate/main.tf"      "lambda function declared"
greps 'permissions_boundary'               "$INFRA/modules/lambda-authenticate/main.tf"      "permissions_boundary set"
greps 'lab-project-authenticate-role'      "$INFRA/modules/lambda-authenticate/variables.tf" "role name lab-project-authenticate-role"
greps 'x86_64'                             "$INFRA/modules/lambda-authenticate/variables.tf" "architecture x86_64"
greps '300'                                "$INFRA/modules/lambda-authenticate/variables.tf" "timeout 300"
greps 'path_part[[:space:]]*=[[:space:]]*"auth"' "$INFRA/modules/api-authsvc/main.tf"        "API path_part auth"
greps 'http_method[[:space:]]*=[[:space:]]*"POST"' "$INFRA/modules/api-authsvc/main.tf"      "API POST method"
greps 'AWS_PROXY'                          "$INFRA/modules/api-authsvc/main.tf"              "AWS_PROXY integration"
greps 'trimsuffix'                         "$INFRA/modules/api-authsvc/outputs.tf"           "invoke_url trimsuffix"
greps 'bcrypt_layer'                       "$INFRA/envs/dev/main.tf"                         "env wires bcrypt layer"
greps 'pymysql_layer'                      "$INFRA/envs/dev/main.tf"                         "env wires pymysql layer"

if command -v terraform >/dev/null 2>&1; then
  if terraform -chdir="$INFRA/envs/dev" fmt -check -recursive >/dev/null 2>&1; then
    ok "terraform fmt clean"
  else
    echo "  [WARN] terraform fmt would reformat (run: terraform -chdir=$INFRA/envs/dev fmt -recursive)"
  fi
fi

echo
if [ "$fail" -eq 0 ]; then echo "PASS project03 module contract ($pass checks)"; exit 0; else echo "FAIL project03 module contract ($fail failed)"; exit 1; fi
