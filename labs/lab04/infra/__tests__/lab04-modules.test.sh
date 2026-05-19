#!/usr/bin/env bash
set -euo pipefail

LAB04="$(cd "$(dirname "$0")/../.." && pwd)"
MODULE_ROOT="${LAB04}/infra/modules"
DEV_MAIN="${LAB04}/infra/envs/dev/main.tf"
DEV_VARS="${LAB04}/infra/envs/dev/variables.tf"
LAYER_SCRIPT="${LAB04}/infra/scripts/build-requests-layer.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

grep -q 'resource "aws_lambda_function"' "${MODULE_ROOT}/lambda-function/main.tf" \
  || fail "lambda-function module must define aws_lambda_function"

grep -q 'permissions_boundary' "${MODULE_ROOT}/lambda-function/main.tf" \
  || fail "lambda-function must set permissions_boundary"

grep -q 'lab-project04-analyze-role' "${DEV_MAIN}" \
  || fail "dev main must use lab-project04-analyze-role"

grep -q 'lab-project04-weather-role' "${DEV_MAIN}" \
  || fail "dev main must use lab-project04-weather-role"

grep -q 'resource "aws_api_gateway_rest_api"' "${MODULE_ROOT}/api-services/main.tf" \
  || fail "api-services must define REST API"

grep -q 'path_part   = "analysis"' "${MODULE_ROOT}/api-services/main.tf" \
  || fail "api-services must expose /analysis"

grep -q 'path_part   = "weather"' "${MODULE_ROOT}/api-services/main.tf" \
  || fail "api-services must expose /weather"

grep -q 'default = "ServicesAPI"' "${MODULE_ROOT}/api-services/variables.tf" \
  || fail "api-services must default api_name to ServicesAPI (autograder contract)"

grep -q 'lab-project04-requests-layer' "${LAB04}/infra/modules/lambda-layer-requests/main.tf" \
  || fail "requests layer must use lab-project04-requests-layer name"

grep -q 'trimsuffix' "${LAB04}/infra/modules/api-services/outputs.tf" \
  || fail "invoke_url output must strip trailing slash for Gradescope INI"

grep -q 'invoke_url is empty' "${LAB04}/infra/scripts/write-client-config.sh" \
  || fail "write-client-config must fail clearly when stack is not applied"

grep -q 'docker run' "${LAYER_SCRIPT}" \
  || fail "layer build must use Docker for Linux wheels on macOS hosts"

grep -q 'head -10 || true' "${LAYER_SCRIPT}" \
  || fail "layer build must guard zip listing pipe (exit 141 in terraform local-exec)"

grep -q 'output "invoke_url"' "${LAB04}/infra/envs/dev/outputs.tf" \
  || fail "dev outputs must include invoke_url for Gradescope INI"

grep -q 'Claude-Conjurer' "${DEV_VARS}" \
  || fail "dev variables should document default Claude-Conjurer profile"

echo "PASS lab04 module contract"
