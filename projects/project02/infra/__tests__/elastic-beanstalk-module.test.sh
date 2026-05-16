#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULE_DIR="${PROJECT_DIR}/modules/elastic-beanstalk"
DEV_MAIN="${PROJECT_DIR}/envs/dev/main.tf"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[ -f "${MODULE_DIR}/main.tf" ] || fail "missing elastic-beanstalk module main.tf"
[ -f "${MODULE_DIR}/variables.tf" ] || fail "missing elastic-beanstalk module variables.tf"
[ -f "${MODULE_DIR}/outputs.tf" ] || fail "missing elastic-beanstalk module outputs.tf"

grep -q 'resource "aws_elastic_beanstalk_application"' "${MODULE_DIR}/main.tf" \
  || fail "module must define aws_elastic_beanstalk_application"
grep -q 'resource "aws_elastic_beanstalk_application_version"' "${MODULE_DIR}/main.tf" \
  || fail "module must define aws_elastic_beanstalk_application_version"
grep -q 'resource "aws_elastic_beanstalk_environment"' "${MODULE_DIR}/main.tf" \
  || fail "module must define aws_elastic_beanstalk_environment"
grep -q 'resource "aws_iam_role" "service_role"' "${MODULE_DIR}/main.tf" \
  || fail "module must define EB service role"
grep -q 'resource "aws_iam_instance_profile"' "${MODULE_DIR}/main.tf" \
  || fail "module must define EC2 instance profile"
grep -q 'create_iam_roles' "${MODULE_DIR}/variables.tf" \
  || fail "module must support existing IAM role/profile mode"
grep -q 'resource "aws_s3_object" "app_bundle"' "${MODULE_DIR}/main.tf" \
  || fail "module must upload app bundle artifact"
grep -q 'SystemType' "${MODULE_DIR}/main.tf" \
  || fail "module must configure EB health reporting SystemType"
grep -q 'PHOTOAPP_CONFIG_PATH' "${MODULE_DIR}/main.tf" \
  || fail "module must expose PHOTOAPP_CONFIG_PATH to EB"

grep -q 'module "elastic_beanstalk"' "$DEV_MAIN" \
  || fail "dev environment must call elastic_beanstalk module"
grep -q 'enable_core_infra' "${PROJECT_DIR}/envs/dev/variables.tf" \
  || fail "dev environment must expose enable_core_infra toggle"
grep -q 'count  = var.enable_core_infra ? 1 : 0' "$DEV_MAIN" \
  || fail "core infra modules must be count-gated for EB-only deploys"
grep -q 'eb_create_iam_roles' "${PROJECT_DIR}/envs/dev/variables.tf" \
  || fail "dev environment must expose EB IAM creation toggle"

echo "PASS elastic-beanstalk module contract"
