#!/usr/bin/env bash
# Shared helpers for Plane 2 IAM delegation post-apply tests.
# shellcheck disable=SC2034

plane2_resolve_boundary_arn() {
  if [[ -n "${BOUNDARY_ARN:-}" ]]; then
    echo "$BOUNDARY_ARN"
    return 0
  fi
  if [[ -n "${BOUNDARY_POLICY_NAME:-}" ]]; then
    local account_id partition
    account_id="$(aws sts get-caller-identity --query Account --output text)"
    partition="$(aws sts get-caller-identity --query Arn --output text | cut -d: -f2)"
    echo "arn:${partition}:iam::${account_id}:policy/${BOUNDARY_POLICY_NAME}"
    return 0
  fi
  echo "Set BOUNDARY_ARN or BOUNDARY_POLICY_NAME (default: LabProjectPermissionsBoundary)" >&2
  return 1
}

plane2_resolve_account_id() {
  aws sts get-caller-identity --query Account --output text
}

plane2_maybe_source_conjurer_env() {
  if [[ -n "${PLANE2_SKIP_AWS_ENV:-}" ]]; then
    return 0
  fi
  local env_script="${CLAUDE_WORKSPACE_AWS_ENV:-}"
  if [[ -z "$env_script" ]]; then
    local repo_root
    repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../.." && pwd)"
    env_script="$(dirname "$repo_root")/claude-workspace/aws-env.sh"
    if [[ ! -f "$env_script" ]]; then
      env_script="/Users/erik/Documents/Lab/mbai460-client/claude-workspace/aws-env.sh"
    fi
  fi
  if [[ -f "$env_script" ]]; then
    # shellcheck source=/dev/null
    source "$env_script"
  fi
}

plane2_assert_conjurer_caller() {
  local arn
  arn="$(aws sts get-caller-identity --query Arn --output text)"
  if [[ "$arn" != *":user/Claude-Conjurer" && "$arn" != *":user/ClaudeConjurer" ]]; then
    echo "WARN: expected Claude-Conjurer IAM user; got: $arn" >&2
    if [[ "${PLANE2_REQUIRE_CONJURER:-1}" == "1" ]]; then
      return 1
    fi
  fi
  echo "$arn"
}

plane2_is_access_denied() {
  echo "$1" | grep -qiE 'AccessDenied|not authorized|UnauthorizedOperation|ExplicitDeny|explicit deny'
}

plane2_detach_role_policies() {
  local role_name="$1"
  local arns
  arns="$(aws iam list-attached-role-policies --role-name "$role_name" \
    --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null || true)"
  for arn in $arns; do
    [[ -n "$arn" && "$arn" != "None" ]] || continue
    aws iam detach-role-policy --role-name "$role_name" --policy-arn "$arn" 2>/dev/null || true
  done
}

plane2_delete_lab_role() {
  local role_name="$1"
  plane2_detach_role_policies "$role_name"
  aws iam delete-role-permissions-boundary --role-name "$role_name" 2>/dev/null || true
  aws iam delete-role --role-name "$role_name" 2>/dev/null || true
}

plane2_final_negative_resource_scan() {
  echo "======== FINAL CLEANUP SCAN ========"
  aws iam list-roles --query 'Roles[?starts_with(RoleName, `lab-project-negative`)].RoleName' --output text 2>/dev/null || true
  aws iam list-policies --scope Local \
    --query 'Policies[?starts_with(PolicyName, `lab-project-negative`)].PolicyName' --output text 2>/dev/null || true
  aws iam list-instance-profiles \
    --query 'InstanceProfiles[?starts_with(InstanceProfileName, `lab-project-negative`)].InstanceProfileName' \
    --output text 2>/dev/null || true
  aws iam get-user --user-name lab-project-negative-test-user 2>&1 | head -1 || true
}
