#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  preflight.sh [--aws-profile NAME] [--region REGION] [--skip-aws]

Checks local Lab 04 prerequisites before terraform apply or Gradescope submit.
Does not print secrets.

Options:
  --aws-profile NAME   AWS CLI profile (default: Claude-Conjurer when lab secrets exist)
  --region REGION      AWS region (default: us-east-2)
  --skip-aws           Skip STS and IAM role checks
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB04="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${LAB04}/../.." && pwd)"
LAB_CLIENT_ROOT="$(cd "${REPO_ROOT}/.." && pwd)"

if [ -z "${AWS_SHARED_CREDENTIALS_FILE:-}" ] && [ -f "${LAB_CLIENT_ROOT}/claude-workspace/secrets/aws-credentials" ]; then
  export AWS_SHARED_CREDENTIALS_FILE="${LAB_CLIENT_ROOT}/claude-workspace/secrets/aws-credentials"
fi
if [ -z "${AWS_CONFIG_FILE:-}" ] && [ -f "${LAB_CLIENT_ROOT}/claude-workspace/secrets/aws-config" ]; then
  export AWS_CONFIG_FILE="${LAB_CLIENT_ROOT}/claude-workspace/secrets/aws-config"
fi

if [ -n "${AWS_PROFILE:-}" ]; then
  DEFAULT_AWS_PROFILE="$AWS_PROFILE"
elif [ -f "${LAB_CLIENT_ROOT}/claude-workspace/secrets/aws-credentials" ]; then
  DEFAULT_AWS_PROFILE="Claude-Conjurer"
else
  DEFAULT_AWS_PROFILE="ErikTheWizard"
fi

AWS_PROFILE="$DEFAULT_AWS_PROFILE"
AWS_REGION="${AWS_REGION:-us-east-2}"
SKIP_AWS=0
FAILURES=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --aws-profile) AWS_PROFILE="${2:-}"; shift 2 ;;
    --region) AWS_REGION="${2:-}"; shift 2 ;;
    --skip-aws) SKIP_AWS=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

check_file() {
  local path="$1"
  local hint="$2"
  if [ -f "${LAB04}/${path}" ]; then
    echo "PASS ${path}"
  else
    echo "MISSING ${path}"
    echo "  ${hint}"
    FAILURES=$((FAILURES + 1))
  fi
}

check_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "PASS command: ${cmd}"
  else
    echo "MISSING command: ${cmd}"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "Lab 04 preflight (${LAB04})"

check_file "analyze.py" "Instructor analyze Lambda source (repo root of lab04/)"
check_file "weather.py" "Student weather Lambda source"
check_file "infra/envs/dev/.terraform.lock.hcl" "Run: make -C labs/lab04 init"
check_file "infra/scripts/build-requests-layer.sh" "Layer build script missing"
check_file "scripts/submit-gradescope.sh" "Gradescope submit script missing"
check_cmd terraform
check_cmd docker
check_cmd zip

IMAGE_FILE="${REPO_ROOT}/docker/_image-name.txt"
if [ -f "${IMAGE_FILE}" ]; then
  IMAGE="$(tr -d '[:space:]' < "${IMAGE_FILE}")"
  if docker image inspect "${IMAGE}" >/dev/null 2>&1; then
    echo "PASS docker image: ${IMAGE}"
  else
    echo "WARN docker image: ${IMAGE} (needed for make submit only)"
    echo "  Build from ${REPO_ROOT}: ./docker/build"
  fi
else
  echo "WARN ${IMAGE_FILE} missing (make submit needs ./docker/build)"
fi

if [ -f "${LAB04}/lab04-client-config.ini" ]; then
  if grep -q 'placeholder.execute-api' "${LAB04}/lab04-client-config.ini" 2>/dev/null; then
    echo "WARN lab04-client-config.ini still has placeholder URL (run: make config after apply)"
  else
    echo "PASS lab04-client-config.ini"
  fi
else
  echo "NOTE lab04-client-config.ini absent (expected before first apply; make config after apply)"
fi

if [ -f "${LAB_CLIENT_ROOT}/.gradescope" ]; then
  echo "PASS Gradescope token (${LAB_CLIENT_ROOT}/.gradescope)"
else
  echo "WARN Gradescope token missing at ${LAB_CLIENT_ROOT}/.gradescope (required for make submit)"
fi

if [ "${SKIP_AWS}" -eq 1 ]; then
  echo "AWS check skipped"
else
  if aws sts get-caller-identity --profile "${AWS_PROFILE}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo "PASS AWS profile ${AWS_PROFILE} in ${AWS_REGION}"
  else
    echo "MISSING usable AWS profile ${AWS_PROFILE} in ${AWS_REGION}"
    echo "  source ${LAB_CLIENT_ROOT}/claude-workspace/aws-env.sh"
    echo "  or: aws sso login --profile ${AWS_PROFILE}"
    FAILURES=$((FAILURES + 1))
  fi

  for role in lab-project04-analyze-role lab-project04-weather-role; do
    if aws iam get-role --role-name "${role}" --profile "${AWS_PROFILE}" --region "${AWS_REGION}" >/dev/null 2>&1; then
      echo "PASS IAM role ${role}"
    else
      echo "NOTE IAM role ${role} not found (terraform apply creates it, or bootstrap already ran)"
    fi
  done
fi

if [ "${FAILURES}" -gt 0 ]; then
  echo ""
  echo "Lab 04 preflight: RED (${FAILURES} issue(s))"
  exit 1
fi

echo ""
echo "Lab 04 preflight: GREEN"
exit 0
