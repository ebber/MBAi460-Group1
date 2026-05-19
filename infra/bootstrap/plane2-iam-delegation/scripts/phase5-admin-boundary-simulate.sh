#!/usr/bin/env bash
# Admin-only follow-up for Phase 5 tests 7/8: verify LabProjectPermissionsBoundary
# denies security-substrate actions even when AdministratorAccess is attached.
#
# Run with Erik SSO / admin credentials (NOT Claude-Conjurer).
# Creates a disposable lab-project-* role, simulates, then cleans up.
#
# Usage:
#   export BOUNDARY_ARN="$(terraform output -raw lab_project_permissions_boundary_arn)"
#   ./scripts/phase5-admin-boundary-simulate.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/plane2-test-lib.sh
source "${SCRIPT_DIR}/lib/plane2-test-lib.sh"

PLANE2_SKIP_AWS_ENV=1
BOUNDARY_ARN="$(plane2_resolve_boundary_arn)"
ACCOUNT_ID="$(plane2_resolve_account_id)"

TRUST_LAMBDA='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
ROLE_NAME="lab-project-negative-admin-simulate-role"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

cleanup() { plane2_delete_lab_role "$ROLE_NAME"; }
trap cleanup EXIT

echo "Admin caller:"
aws sts get-caller-identity
echo ""

aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST_LAMBDA" \
  --permissions-boundary "$BOUNDARY_ARN" >/dev/null
aws iam attach-role-policy --role-name "$ROLE_NAME" \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

ACTIONS=(
  cloudtrail:DeleteTrail
  cloudtrail:StopLogging
  config:DeleteConfigurationRecorder
  config:DeleteDeliveryChannel
  guardduty:DeleteDetector
  securityhub:DisableSecurityHub
  access-analyzer:DeleteAnalyzer
)

FAIL=0
for action in "${ACTIONS[@]}"; do
  decision="$(aws iam simulate-principal-policy \
    --policy-source-arn "$ROLE_ARN" \
    --action-names "$action" \
    --resource-arns "*" \
    --query 'EvaluationResults[0].EvalDecision' --output text)"
  echo "$action => $decision"
  if [[ "$decision" == "allowed" || "$decision" == "explicitAllow" ]]; then
    FAIL=1
  fi
done

if [[ $FAIL -eq 0 ]]; then
  echo "PASS: all simulated substrate actions denied on bounded role with AdministratorAccess attached"
else
  echo "FAIL: at least one substrate action was allowed"
  exit 1
fi
