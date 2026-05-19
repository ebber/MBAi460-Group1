#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  eb-preflight.sh [--aws-profile NAME] [--region REGION] [--skip-aws]
                  [--check-iam-contract] [--project-dir PATH]

Checks whether Project02 has the local inputs needed before attempting
Terraform-native Elastic Beanstalk deployment. Does not print secrets.

Options:
  --check-iam-contract  Verify that the lab-project EB roles and instance
                        profile exist in the caller's account. Names default
                        to lab-project-eb-service-role and
                        lab-project-eb-ec2-role; override with env vars
                        EB_SERVICE_ROLE_NAME and EB_EC2_INSTANCE_PROFILE_NAME.
                        Same flag can be turned on by setting
                        CHECK_IAM_CONTRACT=1 in the environment.

Note: STS auth alone does not prove iam:PassRole. If Terraform apply fails with
"Unable to assign role", switch to an AWS profile allowed to pass the EB roles.
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LAB_ROOT="$(cd "${PROJECT_DIR}/../../.." && pwd)"

if [ -z "${AWS_SHARED_CREDENTIALS_FILE:-}" ] && [ -f "${LAB_ROOT}/claude-workspace/secrets/aws-credentials" ]; then
  export AWS_SHARED_CREDENTIALS_FILE="${LAB_ROOT}/claude-workspace/secrets/aws-credentials"
fi

if [ -z "${AWS_CONFIG_FILE:-}" ] && [ -f "${LAB_ROOT}/claude-workspace/secrets/aws-config" ]; then
  export AWS_CONFIG_FILE="${LAB_ROOT}/claude-workspace/secrets/aws-config"
fi

if [ -n "${AWS_PROFILE:-}" ]; then
  DEFAULT_AWS_PROFILE="$AWS_PROFILE"
elif [ -f "${LAB_ROOT}/claude-workspace/secrets/aws-credentials" ]; then
  DEFAULT_AWS_PROFILE="Claude-Conjurer"
else
  DEFAULT_AWS_PROFILE="ErikTheWizard"
fi

AWS_PROFILE="$DEFAULT_AWS_PROFILE"
AWS_REGION="${AWS_REGION:-us-east-2}"
SKIP_AWS=0
CHECK_IAM_CONTRACT="${CHECK_IAM_CONTRACT:-0}"
EB_SERVICE_ROLE_NAME="${EB_SERVICE_ROLE_NAME:-lab-project-eb-service-role}"
EB_EC2_INSTANCE_PROFILE_NAME="${EB_EC2_INSTANCE_PROFILE_NAME:-lab-project-eb-ec2-role}"
FAILURES=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --aws-profile)
      AWS_PROFILE="${2:-}"; shift 2 ;;
    --region)
      AWS_REGION="${2:-}"; shift 2 ;;
    --skip-aws)
      SKIP_AWS=1; shift ;;
    --check-iam-contract)
      CHECK_IAM_CONTRACT=1; shift ;;
    --project-dir)
      PROJECT_DIR="$(cd "${2:-}" && pwd)"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2 ;;
  esac
done

check_file() {
  local path="$1"
  local hint="$2"
  if [ -f "${PROJECT_DIR}/${path}" ]; then
    echo "PASS ${path}"
  else
    echo "MISSING ${path}"
    echo "  ${hint}"
    FAILURES=$((FAILURES + 1))
  fi
}

check_file "client/photoapp-config.ini" \
  "Provision the real AWS-shaped server config. Do not commit it."

check_file "infra/envs/dev/terraform.tfvars" \
  "Copy infra/envs/dev/terraform.tfvars.example to terraform.tfvars and fill deploy values."

if [ -f "${PROJECT_DIR}/build/eb/project02-photoapp-dev.zip" ]; then
  echo "PASS build/eb/project02-photoapp-dev.zip"
else
  echo "MISSING build/eb/project02-photoapp-dev.zip"
  echo "  Run: make eb-bundle"
  FAILURES=$((FAILURES + 1))
fi

if [ "$SKIP_AWS" -eq 1 ]; then
  echo "AWS check skipped"
  if [ "$CHECK_IAM_CONTRACT" -eq 1 ]; then
    echo "NOTE --check-iam-contract requires AWS access; skipped with --skip-aws."
  fi
else
  if aws sts get-caller-identity --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "PASS AWS profile ${AWS_PROFILE} in ${AWS_REGION}"
    echo "NOTE iam:PassRole is not verified by preflight; EB apply may still require a role-capable profile."

    if [ "$CHECK_IAM_CONTRACT" -eq 1 ]; then
      if aws iam get-role --role-name "$EB_SERVICE_ROLE_NAME" \
          --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
        echo "PASS IAM role ${EB_SERVICE_ROLE_NAME}"
      else
        echo "MISSING IAM role ${EB_SERVICE_ROLE_NAME}"
        echo "  Run Path A bootstrap (create_lab_project_eb_roles=true) or set EB_SERVICE_ROLE_NAME."
        echo "  See: infra/bootstrap/LAB_PROJECT_IAM_CONTRACT.md"
        FAILURES=$((FAILURES + 1))
      fi

      if aws iam get-instance-profile --instance-profile-name "$EB_EC2_INSTANCE_PROFILE_NAME" \
          --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
        echo "PASS IAM instance profile ${EB_EC2_INSTANCE_PROFILE_NAME}"
      else
        echo "MISSING IAM instance profile ${EB_EC2_INSTANCE_PROFILE_NAME}"
        echo "  Run Path A bootstrap (create_lab_project_eb_roles=true) or set EB_EC2_INSTANCE_PROFILE_NAME."
        FAILURES=$((FAILURES + 1))
      fi
    fi
  else
    echo "MISSING usable AWS profile ${AWS_PROFILE} in ${AWS_REGION}"
    echo "  Run: aws sso login --profile ${AWS_PROFILE}"
    echo "  Then verify: aws sts get-caller-identity --profile ${AWS_PROFILE}"
    FAILURES=$((FAILURES + 1))
  fi
fi

if [ "$FAILURES" -ne 0 ]; then
  echo ""
  echo "EB preflight: RED (${FAILURES} issue(s))"
  exit 1
fi

echo ""
echo "EB preflight: GREEN"
