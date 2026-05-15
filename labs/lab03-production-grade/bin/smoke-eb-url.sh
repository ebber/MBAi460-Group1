#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  smoke-eb-url.sh --base-url URL --path PATH [--path PATH ...] [--expect PATH=STATUS ...]

Examples:
  smoke-eb-url.sh --base-url http://example.elasticbeanstalk.com \
    --path /healthz --path /users --expect /healthz=200 --expect /users=200

Options:
  --base-url URL        Base URL, with or without trailing slash.
  --path PATH           Path to probe. May be repeated.
  --expect PATH=STATUS  Expected HTTP status for a path. Defaults to 200.
  --timeout SECONDS     Per-request curl timeout. Default: 10.
  --retry-count N       Attempts per path. Default: 1.
USAGE
}

BASE_URL=""
TIMEOUT="10"
RETRY_COUNT="1"
declare -a PATHS=()
declare -a EXPECTATIONS=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --base-url)
      BASE_URL="${2:-}"; shift 2 ;;
    --path)
      PATHS+=("${2:-}"); shift 2 ;;
    --expect)
      pair="${2:-}"
      [[ "$pair" == *=* ]] || { echo "ERROR: --expect must be PATH=STATUS" >&2; exit 2; }
      EXPECTATIONS+=("$pair")
      shift 2 ;;
    --timeout)
      TIMEOUT="${2:-}"; shift 2 ;;
    --retry-count)
      RETRY_COUNT="${2:-}"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2 ;;
  esac
done

[ -n "$BASE_URL" ] || { echo "ERROR: --base-url is required" >&2; exit 2; }
[ "${#PATHS[@]}" -gt 0 ] || { echo "ERROR: at least one --path is required" >&2; exit 2; }

BASE_URL="${BASE_URL%/}"
FAILURES=0

probe_once() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000"
}

expected_for_path() {
  local path="$1"
  local pair key value
  for pair in "${EXPECTATIONS[@]}"; do
    key="${pair%%=*}"
    value="${pair#*=}"
    if [ "$key" = "$path" ]; then
      echo "$value"
      return 0
    fi
  done
  echo "200"
}

for path in "${PATHS[@]}"; do
  [[ "$path" == /* ]] || path="/$path"
  expected="$(expected_for_path "$path")"
  url="${BASE_URL}${path}"
  actual="000"

  for ((attempt = 1; attempt <= RETRY_COUNT; attempt++)); do
    actual="$(probe_once "$url")"
    if [ "$actual" = "$expected" ]; then
      break
    fi
    if [ "$attempt" -lt "$RETRY_COUNT" ]; then
      sleep 1
    fi
  done

  if [ "$actual" = "$expected" ]; then
    echo "PASS ${path} ${actual}"
  else
    echo "FAIL ${path} expected=${expected} actual=${actual}" >&2
    FAILURES=$((FAILURES + 1))
  fi
done

if [ "$FAILURES" -ne 0 ]; then
  exit 1
fi
