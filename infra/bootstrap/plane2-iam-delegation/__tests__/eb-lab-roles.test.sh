#!/usr/bin/env bash
set -euo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "${BOOTSTRAP_DIR}/../.." && pwd)"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

# Variable + flag exist.
grep -q 'variable "create_lab_project_eb_roles"' "${BOOTSTRAP_DIR}/variables.tf" \
  || fail "bootstrap must expose create_lab_project_eb_roles variable"
grep -q 'default     = false' "${BOOTSTRAP_DIR}/variables.tf" \
  || fail "create_lab_project_eb_roles must default to false (opt-in)"

# Optional EB roles file.
EB_FILE="${BOOTSTRAP_DIR}/eb_lab_roles.tf"
[ -f "$EB_FILE" ] || fail "missing eb_lab_roles.tf (Path A bootstrap)"

grep -q 'count = var.create_lab_project_eb_roles ? 1 : 0' "$EB_FILE" \
  || fail "eb_lab_roles.tf resources must be gated by create_lab_project_eb_roles"
grep -q 'resource "aws_iam_role" "lab_project_eb_service"' "$EB_FILE" \
  || fail "eb_lab_roles.tf must define lab_project_eb_service role"
grep -q 'resource "aws_iam_role" "lab_project_eb_ec2"' "$EB_FILE" \
  || fail "eb_lab_roles.tf must define lab_project_eb_ec2 role"
grep -q 'resource "aws_iam_instance_profile" "lab_project_eb_ec2"' "$EB_FILE" \
  || fail "eb_lab_roles.tf must define lab_project_eb_ec2 instance profile"
grep -q 'permissions_boundary = aws_iam_policy.lab_project_permissions_boundary.arn' "$EB_FILE" \
  || fail "eb_lab_roles.tf roles must wear LabProjectPermissionsBoundary"
if grep -q 'arn:aws:iam::aws:policy' "$EB_FILE"; then
  fail "eb_lab_roles.tf must not hard-code arn:aws:iam::aws:policy/...; use local.partition"
fi
grep -q 'arn:${local.partition}:iam::aws:policy' "$EB_FILE" \
  || fail "eb_lab_roles.tf must use partition-aware managed-policy ARNs"

# Outputs surface the names Project02 needs.
grep -q 'output "lab_project_eb_service_role_name"' "${BOOTSTRAP_DIR}/outputs.tf" \
  || fail "outputs must include lab_project_eb_service_role_name"
grep -q 'output "lab_project_eb_ec2_role_name"' "${BOOTSTRAP_DIR}/outputs.tf" \
  || fail "outputs must include lab_project_eb_ec2_role_name"
grep -q 'output "lab_project_eb_ec2_instance_profile_name"' "${BOOTSTRAP_DIR}/outputs.tf" \
  || fail "outputs must include lab_project_eb_ec2_instance_profile_name"

# Path A / Path B mutex is documented.
CONTRACT="${ROOT_DIR}/bootstrap/LAB_PROJECT_IAM_CONTRACT.md"
[ -f "$CONTRACT" ] || fail "LAB_PROJECT_IAM_CONTRACT.md missing at ${CONTRACT}"
grep -q 'Path A' "$CONTRACT" || fail "contract must describe Path A"
grep -q 'Path B' "$CONTRACT" || fail "contract must describe Path B"
grep -qi 'mutex\|only one path\|do not.*both' "$CONTRACT" \
  || fail "contract must document the Path A / Path B single-ownership rule"

grep -q 'create_lab_project_eb_roles' "${BOOTSTRAP_DIR}/README.md" \
  || fail "bootstrap README must mention create_lab_project_eb_roles"

# Blueprint-level guardrails: validation + precondition.
grep -q 'validation {' "${BOOTSTRAP_DIR}/variables.tf" \
  || fail "bootstrap variables.tf must include validation { ... } blocks for lab-project-* naming"
grep -Eq 'startswith\(var\.lab_project_eb_service_role_name, "lab-project-"\)' "${BOOTSTRAP_DIR}/variables.tf" \
  || fail "bootstrap must validate lab_project_eb_service_role_name startswith lab-project-"
grep -Eq 'startswith\(var\.lab_project_eb_ec2_role_name, "lab-project-"\)' "${BOOTSTRAP_DIR}/variables.tf" \
  || fail "bootstrap must validate lab_project_eb_ec2_role_name startswith lab-project-"
grep -q 'lab_project_prefix' "$EB_FILE" \
  || fail "eb_lab_roles.tf must define a locals.lab_project_prefix single source"
grep -q 'precondition {' "$EB_FILE" \
  || fail "eb_lab_roles.tf must include lifecycle.precondition { ... } on the EB roles"

echo "PASS plane2 bootstrap EB roles contract"
