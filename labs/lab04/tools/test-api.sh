#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  test-api.sh [--base-url URL]

Smoke-test the Lab 04 API Gateway stage after terraform apply.

  --base-url URL   Invoke URL (no trailing slash). Default: terraform output invoke_url,
                   else [client] webservice from lab04-client-config.ini.

Exits 0 when GET /weather and PUT /analysis return HTTP 200.
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB04="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_DIR="${LAB04}/infra/envs/dev"
CONFIG="${LAB04}/lab04-client-config.ini"

# 1x1 PNG (valid Rekognition input for smoke tests)
TINY_PNG_B64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

BASE_URL=""
TIMEOUT=30
FAILURES=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --base-url) BASE_URL="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

resolve_base_url() {
  if [ -n "${BASE_URL}" ]; then
    return
  fi
  if [ -f "${CONFIG}" ]; then
    local line
    line="$(grep -E '^[[:space:]]*webservice=' "${CONFIG}" | tail -1 || true)"
    if [ -n "${line}" ]; then
      BASE_URL="${line#webservice=}"
      BASE_URL="${BASE_URL%%$'\r'}"
    fi
  fi
  if [ -z "${BASE_URL}" ] && [ -d "${ENV_DIR}/.terraform" ]; then
    BASE_URL="$(cd "${ENV_DIR}" && terraform output -raw invoke_url 2>/dev/null || true)"
  fi
  BASE_URL="${BASE_URL%/}"
  BASE_URL="$(printf '%s' "${BASE_URL}" | tr -d '[:space:]')"
}

resolve_base_url

if [ -z "${BASE_URL}" ]; then
  echo "ERROR: no base URL. Pass --base-url or run terraform apply && make config" >&2
  exit 1
fi

echo "Lab 04 API smoke: ${BASE_URL}"

curl_check() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local url="${BASE_URL}${path}"
  local body_file body code

  body_file="$(mktemp)"

  if [ "${method}" = "GET" ]; then
    code="$(curl -sS -m "${TIMEOUT}" -o "${body_file}" -w '%{http_code}' "${url}" || true)"
  else
    code="$(curl -sS -m "${TIMEOUT}" -o "${body_file}" -w '%{http_code}' -X "${method}" \
      -H 'Content-Type: application/json' \
      -d "${data}" \
      "${url}" || true)"
  fi
  code="${code:-000}"
  body="$(cat "${body_file}" 2>/dev/null || true)"
  rm -f "${body_file}"

  if [ "${code}" = "200" ]; then
    echo "PASS ${method} ${path} → ${code}"
    echo "  body: $(echo "${body}" | tr -d '\n' | head -c 120)"
  else
    echo "FAIL ${method} ${path} → ${code}"
    echo "  body: ${body}"
    FAILURES=$((FAILURES + 1))
  fi
}

curl_check GET "/weather/US/Chicago"

analysis_payload="$(cat <<EOF
{"name":"smoke.png","bytes":"${TINY_PNG_B64}"}
EOF
)"
curl_check PUT "/analysis" "${analysis_payload}"

if [ "${FAILURES}" -gt 0 ]; then
  echo ""
  echo "Lab 04 API smoke: RED (${FAILURES} failure(s))"
  echo "If the stack was destroyed, run: make -C labs/lab04 apply && make -C labs/lab04 config"
  exit 1
fi

echo ""
echo "Lab 04 API smoke: GREEN"
exit 0
