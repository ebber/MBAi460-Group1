#!/usr/bin/env bash
# Phase 4: Positive capability tests for Plane 2 IAM delegation.
# Verifies Claude-Conjurer can create and clean up allowed lab-project-* runtime IAM.
#
# Usage (from plane2-iam-delegation root after bootstrap apply):
#   export BOUNDARY_ARN="$(terraform output -raw lab_project_permissions_boundary_arn)"
#   ./scripts/phase4-positive-capability-tests.sh
#
# Credentials: Claude-Conjurer (not Erik SSO admin).
# Optional: PLANE2_SKIP_AWS_ENV=1 if AWS_PROFILE is already set.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/plane2-test-lib.sh
source "${SCRIPT_DIR}/lib/plane2-test-lib.sh"

plane2_maybe_source_conjurer_env
plane2_assert_conjurer_caller

BOUNDARY_ARN="$(plane2_resolve_boundary_arn)"
ACCOUNT_ID="$(plane2_resolve_account_id)"

TRUST_LAMBDA='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

ROLE_NAME="lab-project-sandbox-boundary-test-role"
POLICY_NAME="lab-project-sandbox-boundary-test-policy"
PROFILE_NAME="lab-project-sandbox-boundary-test-profile"
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

POLICY_DOC="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOwnRoleForTest",
      "Effect": "Allow",
      "Action": ["iam:GetRole"],
      "Resource": "arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
    }
  ]
}
EOF
)"

cleanup() {
  aws iam detach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true
  aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY_ARN" 2>/dev/null || true
  aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE_NAME" --role-name "$ROLE_NAME" 2>/dev/null || true
  aws iam delete-instance-profile --instance-profile-name "$PROFILE_NAME" 2>/dev/null || true
  plane2_delete_lab_role "$ROLE_NAME"
  aws iam delete-policy --policy-arn "$POLICY_ARN" 2>/dev/null || true
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

echo "== 1. Caller identity"
aws sts get-caller-identity
echo ""

echo "== 2. Bootstrap resources visible (list-policies; do not modify)"
aws iam list-policies --scope Local \
  --query 'Policies[?PolicyName==`LabProjectPermissionsBoundary` || PolicyName==`ClaudeConjurerPlane2IAMDelegation`].{PolicyName:PolicyName,Arn:Arn,AttachmentCount:AttachmentCount}' \
  --output table
echo ""

echo "== 3. Create disposable test role with boundary"
aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$TRUST_LAMBDA" \
  --permissions-boundary "$BOUNDARY_ARN" \
  --tags Key=ManagedBy,Value=manual-test Key=Scope,Value=LabProject Key=Project,Value=sandbox \
    Key=AuthorityPlane,Value=Runtime Key=CreatedBy,Value=ClaudeConjurer \
  --description "Phase 4 positive test - disposable sandbox role" >/dev/null
pass "CreateRole with LabProjectPermissionsBoundary"
echo ""

echo "== 4. Attach harmless runtime policies"
aws iam attach-role-policy --role-name "$ROLE_NAME" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document "$POLICY_DOC" \
  --description "Phase 4 positive test - minimal harmless policy" \
  --tags Key=ManagedBy,Value=manual-test Key=Scope,Value=LabProject Key=Project,Value=sandbox \
    Key=AuthorityPlane,Value=Runtime Key=CreatedBy,Value=ClaudeConjurer >/dev/null
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY_ARN"
pass "Attach AWSLambdaBasicExecutionRole and customer policy"
echo ""

echo "== 5. Create instance profile and add role"
aws iam create-instance-profile \
  --instance-profile-name "$PROFILE_NAME" \
  --tags Key=ManagedBy,Value=manual-test Key=Scope,Value=LabProject Key=Project,Value=sandbox \
    Key=AuthorityPlane,Value=Runtime Key=CreatedBy,Value=ClaudeConjurer >/dev/null
aws iam add-role-to-instance-profile --instance-profile-name "$PROFILE_NAME" --role-name "$ROLE_NAME"
pass "CreateInstanceProfile and AddRoleToInstanceProfile"
echo ""

echo "== 6. Verify allowed path"
BOUNDARY_ON_ROLE="$(aws iam get-role --role-name "$ROLE_NAME" \
  --query 'Role.PermissionsBoundary.PermissionsBoundaryArn' --output text)"
[[ "$BOUNDARY_ON_ROLE" == "$BOUNDARY_ARN" ]] || fail "permissions boundary not attached"
ATTACHED_COUNT="$(aws iam list-attached-role-policies --role-name "$ROLE_NAME" \
  --query 'length(AttachedPolicies)' --output text)"
[[ "$ATTACHED_COUNT" == "2" ]] || fail "expected 2 attached policies, got ${ATTACHED_COUNT}"
IP_ROLE="$(aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" \
  --query 'InstanceProfile.Roles[0].RoleName' --output text)"
[[ "$IP_ROLE" == "$ROLE_NAME" ]] || fail "instance profile missing role"
LAB_ROLES="$(aws iam list-roles --query 'Roles[?starts_with(RoleName, `lab-project-`)].RoleName' --output text)"
echo "lab-project-* roles: $LAB_ROLES"
pass "Role, boundary, policies, tags, instance profile verified"
echo ""

echo "== 7. Cleanup (trap runs on exit)"
echo "Phase 4 positive tests completed successfully."
