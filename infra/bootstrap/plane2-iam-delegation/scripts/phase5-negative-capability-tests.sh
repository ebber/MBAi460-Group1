#!/usr/bin/env bash
# Phase 5: Negative capability tests for Plane 2 IAM delegation.
# Proves guardrails are enforced structurally (not self-policing).
#
# Usage:
#   export BOUNDARY_ARN="$(terraform output -raw lab_project_permissions_boundary_arn)"
#   ./scripts/phase5-negative-capability-tests.sh
#
# Credentials: Claude-Conjurer only. Do not use Erik SSO admin.
# Tests 7/8 effective-deny simulation: run phase5-admin-boundary-simulate.sh as admin.
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/plane2-test-lib.sh
source "${SCRIPT_DIR}/lib/plane2-test-lib.sh"

plane2_maybe_source_conjurer_env
plane2_assert_conjurer_caller || exit 1

BOUNDARY_ARN="$(plane2_resolve_boundary_arn)" || exit 1
ACCOUNT_ID="$(plane2_resolve_account_id)"
DELEG_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/ClaudeConjurerPlane2IAMDelegation"

TRUST_LAMBDA='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
FAKE_DOC='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}'

FAILURES=0
INCONCLUSIVE=0

run_neg() {
  local num="$1" title="$2"
  shift 2
  echo "======== TEST $num: $title ========"
  echo "CMD: $*"
  echo "EXPECTED: AccessDenied"
  local out rc
  out="$("$@" 2>&1)"
  rc=$?
  if [[ $rc -eq 0 ]]; then
    echo "ACTUAL: SUCCEEDED (unexpected)"
    echo "VERDICT: FAIL"
    echo "$out" | head -10
    FAILURES=$((FAILURES + 1))
    return 1
  elif plane2_is_access_denied "$out"; then
    echo "ACTUAL: AccessDenied"
    echo "$out" | grep -iE 'Error|denied|authorized' | head -2
    echo "VERDICT: PASS"
    return 0
  else
    echo "ACTUAL: rc=$rc (review)"
    echo "$out" | head -8
    echo "VERDICT: INCONCLUSIVE"
    INCONCLUSIVE=$((INCONCLUSIVE + 1))
    return 2
  fi
}

echo "Caller:"
aws sts get-caller-identity
echo ""

# --- Test 1 ---
aws iam delete-role --role-name lab-project-negative-no-boundary-role 2>/dev/null
run_neg 1 "Create lab-project-* role WITHOUT boundary" \
  aws iam create-role --role-name lab-project-negative-no-boundary-role \
  --assume-role-policy-document "$TRUST_LAMBDA"
aws iam delete-role --role-name lab-project-negative-no-boundary-role 2>/dev/null
echo "CLEANUP: role absent or deleted"
echo ""

# --- Test 2 ---
aws iam delete-role --role-name negative-outside-prefix-role 2>/dev/null
run_neg 2 "Create role OUTSIDE lab-project-* prefix (with boundary)" \
  aws iam create-role --role-name negative-outside-prefix-role \
  --assume-role-policy-document "$TRUST_LAMBDA" \
  --permissions-boundary "$BOUNDARY_ARN"
aws iam delete-role --role-name negative-outside-prefix-role 2>/dev/null
echo "CLEANUP: role absent or deleted"
echo ""

# --- Test 3 ---
run_neg 3a "CreateUser" aws iam create-user --user-name lab-project-negative-test-user
aws iam delete-user --user-name lab-project-negative-test-user 2>/dev/null
run_neg 3b "CreateAccessKey" aws iam create-access-key --user-name Claude-Conjurer
run_neg 3c "CreateLoginProfile" \
  aws iam create-login-profile --user-name Claude-Conjurer --password 'TempPass123!Temp'
echo "CLEANUP: no test user retained"
echo ""

# --- Test 4 ---
ROLE4="lab-project-negative-boundary-test-role"
plane2_delete_lab_role "$ROLE4"
echo "======== TEST 4 setup: create valid bounded role ========"
if ! aws iam create-role --role-name "$ROLE4" --assume-role-policy-document "$TRUST_LAMBDA" \
  --permissions-boundary "$BOUNDARY_ARN" \
  --tags Key=ManagedBy,Value=manual-test Key=CreatedBy,Value=ClaudeConjurer 2>&1; then
  echo "FAIL: could not create setup role for test 4"
  FAILURES=$((FAILURES + 1))
else
  run_neg 4a "DeleteRolePermissionsBoundary on lab role" \
    aws iam delete-role-permissions-boundary --role-name "$ROLE4"
  run_neg 4b "PutRolePermissionsBoundary with different policy" \
    aws iam put-role-permissions-boundary --role-name "$ROLE4" \
    --permissions-boundary "arn:aws:iam::aws:policy/AdministratorAccess"
fi
plane2_delete_lab_role "$ROLE4"
echo "CLEANUP test 4: $(aws iam get-role --role-name "$ROLE4" 2>&1 | head -1)"
echo ""

# --- Test 5 ---
run_neg 5a "CreatePolicyVersion on LabProjectPermissionsBoundary" \
  aws iam create-policy-version --policy-arn "$BOUNDARY_ARN" --policy-document "$FAKE_DOC" --set-as-default
run_neg 5b "SetDefaultPolicyVersion on LabProjectPermissionsBoundary" \
  aws iam set-default-policy-version --policy-arn "$BOUNDARY_ARN" --version-id v1
run_neg 5c "DeletePolicyVersion on LabProjectPermissionsBoundary" \
  aws iam delete-policy-version --policy-arn "$BOUNDARY_ARN" --version-id v1
run_neg 5d "DeletePolicy LabProjectPermissionsBoundary" \
  aws iam delete-policy --policy-arn "$BOUNDARY_ARN"
run_neg 5e "CreatePolicyVersion on ClaudeConjurerPlane2IAMDelegation" \
  aws iam create-policy-version --policy-arn "$DELEG_ARN" --policy-document "$FAKE_DOC" --set-as-default
run_neg 5f "DeletePolicy ClaudeConjurerPlane2IAMDelegation" \
  aws iam delete-policy --policy-arn "$DELEG_ARN"
echo ""

# --- Test 6 ---
IP6="lab-project-negative-passrole-test-profile"
aws iam delete-instance-profile --instance-profile-name "$IP6" 2>/dev/null
NON_LAB="${NON_LAB_ROLE:-}"
if [[ -z "$NON_LAB" ]]; then
  NON_LAB="$(aws iam list-roles --query 'Roles[?!(starts_with(RoleName, `lab-project-`))].RoleName | [0]' --output text 2>/dev/null)"
fi
echo "======== TEST 6: PassRole via instance profile ========"
echo "NON_LAB_ROLE=$NON_LAB"
if [[ -z "$NON_LAB" || "$NON_LAB" == "None" || "$NON_LAB" == "null" ]]; then
  echo "SKIP: set NON_LAB_ROLE to an existing non-lab-project-* role name"
  INCONCLUSIVE=$((INCONCLUSIVE + 1))
else
  if aws iam create-instance-profile --instance-profile-name "$IP6" >/dev/null 2>&1; then
    run_neg 6 "AddRoleToInstanceProfile non-lab role to lab-project profile" \
      aws iam add-role-to-instance-profile --instance-profile-name "$IP6" --role-name "$NON_LAB"
    aws iam remove-role-from-instance-profile --instance-profile-name "$IP6" --role-name "$NON_LAB" 2>/dev/null
    aws iam delete-instance-profile --instance-profile-name "$IP6" 2>/dev/null
    echo "CLEANUP: instance profile $IP6 removed"
  else
    echo "FAIL: could not create instance profile $IP6"
    FAILURES=$((FAILURES + 1))
  fi
fi
echo ""

# --- Tests 7 & 8 ---
ROLE78="lab-project-negative-boundary-enforce-role"
plane2_delete_lab_role "$ROLE78"
echo "======== TEST 7/8 setup: bounded role + AdministratorAccess attach ========"
aws iam create-role --role-name "$ROLE78" --assume-role-policy-document "$TRUST_LAMBDA" \
  --permissions-boundary "$BOUNDARY_ARN" >/dev/null 2>&1
ATTACH_RC=0
aws iam attach-role-policy --role-name "$ROLE78" --policy-arn arn:aws:iam::aws:policy/AdministratorAccess >/dev/null 2>&1 || ATTACH_RC=$?
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE78}"
echo "Attach AdministratorAccess: rc=$ATTACH_RC"
if [[ $ATTACH_RC -eq 0 ]]; then
  echo "VERDICT test 8 (attach): PASS — scary policy attach allowed on bounded role"
else
  echo "VERDICT test 8 (attach): FAIL — expected attach to succeed"
  FAILURES=$((FAILURES + 1))
fi

simulate_role() {
  local action="$1" resource="${2:-*}"
  local out rc decision
  out="$(aws iam simulate-principal-policy \
    --policy-source-arn "$ROLE_ARN" \
    --action-names "$action" \
    --resource-arns "$resource" 2>&1)"
  rc=$?
  if [[ $rc -ne 0 ]]; then
    echo "  $action: simulate unavailable (conjurer cannot call SimulatePrincipalPolicy)"
    return 2
  fi
  decision="$(echo "$out" | jq -r '.EvaluationResults[0].EvalDecision // "unknown"')"
  echo "  $action => $decision"
  if [[ "$decision" == "allowed" || "$decision" == "explicitAllow" ]]; then
    return 1
  fi
  return 0
}

echo ""
echo "======== TEST 7: Security-substrate actions (via simulate on bounded role) ========"
SIM_FAIL=0
for pair in \
  "cloudtrail:DeleteTrail|*" \
  "cloudtrail:StopLogging|*" \
  "config:DeleteConfigurationRecorder|*" \
  "config:DeleteDeliveryChannel|*" \
  "guardduty:DeleteDetector|*" \
  "guardduty:DisassociateFromMasterAccount|*" \
  "securityhub:DisableSecurityHub|*" \
  "securityhub:DeleteMembers|*" \
  "access-analyzer:DeleteAnalyzer|*"; do
  IFS='|' read -r act res <<< "$pair"
  simulate_role "$act" "$res"
  sim_rc=$?
  [[ $sim_rc -eq 1 ]] && SIM_FAIL=1
  [[ $sim_rc -eq 2 ]] && INCONCLUSIVE=$((INCONCLUSIVE + 1))
done
if [[ $SIM_FAIL -eq 1 ]]; then
  echo "VERDICT test 7: FAIL — substrate action allowed on bounded role"
  FAILURES=$((FAILURES + 1))
elif [[ $INCONCLUSIVE -gt 0 ]]; then
  echo "VERDICT test 7: INCONCLUSIVE — run scripts/phase5-admin-boundary-simulate.sh as admin"
else
  echo "VERDICT test 7: PASS — substrate actions denied"
fi

echo ""
echo "Detach AdministratorAccess and cleanup role78"
aws iam detach-role-policy --role-name "$ROLE78" --policy-arn arn:aws:iam::aws:policy/AdministratorAccess 2>/dev/null
plane2_delete_lab_role "$ROLE78"
echo ""

plane2_final_negative_resource_scan
echo ""

echo "======== SUMMARY ========"
echo "Failures: $FAILURES"
echo "Inconclusive: $INCONCLUSIVE"
if [[ $FAILURES -gt 0 ]]; then
  exit 1
fi
exit 0
