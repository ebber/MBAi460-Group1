#!/usr/bin/env sh
# bootstrap-localstack.sh — provision the LocalStack S3 bucket for Project02.
#
# Operator-driven, NOT auto-invoked by `docker-up-aws`. The AWS lane assumes
# real AWS infrastructure exists (provisioned via Terraform or out-of-band).
# This script only matters in the LocalStack lane.
#
# Usage:
#   make bootstrap-localstack      # invoked automatically by `make docker-up-localstack`
#   sh tools/bootstrap-localstack.sh   # operator can also run it directly
#
# Implementation notes:
#   - Runs awslocal inside the localstack container (no aws CLI needed on host
#     or in the server image; awslocal ships with localstack/localstack:3).
#   - Reads bucket_name from client/photoapp-config.ini.example (the LocalStack-
#     shaped config the LocalStack lane uses at runtime).
#   - Idempotent: bucket creation skipped if already present.
#   - Portable POSIX sh: avoids bashisms so it can be invoked from anywhere.
set -eu
( set -o pipefail ) 2>/dev/null && set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${PHOTOAPP_LOCALSTACK_CONFIG:-${PROJECT_DIR}/client/photoapp-config.ini.example}"

# Parse bucket_name from the [s3] section of the LocalStack config.
BUCKET_NAME=$(awk -F'=' '/^\[s3\]/{in_s3=1} in_s3 && /^bucket_name/{gsub(/ /,"",$2); print $2; exit}' "$CONFIG_FILE")
if [ -z "$BUCKET_NAME" ]; then
  echo "[bootstrap-localstack] ERROR: could not read bucket_name from $CONFIG_FILE" >&2
  exit 1
fi

# All AWS calls go through awslocal inside the localstack container.
awslocal() {
  docker compose exec -T localstack awslocal "$@"
}

echo "[bootstrap-localstack] target bucket: ${BUCKET_NAME}"

# ── S3 bucket ─────────────────────────────────────────────────────────────────
if awslocal s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "[bootstrap-localstack] bucket '${BUCKET_NAME}' already exists — skipping create"
else
  awslocal s3api create-bucket --bucket "$BUCKET_NAME" >/dev/null
  echo "[bootstrap-localstack] created bucket '${BUCKET_NAME}'"
fi

# Disable block-public-access so presigned-URL downloads work in local tests.
awslocal s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  >/dev/null 2>&1 || true

echo "[bootstrap-localstack] done"
