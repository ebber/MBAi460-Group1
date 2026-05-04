#!/usr/bin/env bash
# bootstrap-localstack.sh — Approach 01-foundation.md § Phase 10 Task 10.2.
#
# Idempotent: creates the S3 bucket named in photoapp-config.ini, plus an
# IAM user for the server. Safe to run multiple times.
#
# Called from docker-compose `server` service after LocalStack is healthy,
# or run manually: LOCALSTACK_HOST=localhost bash tools/bootstrap-localstack.sh
set -euo pipefail

ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"
CONFIG_FILE="${PHOTOAPP_CONFIG_PATH:-$(dirname "$0")/../client/photoapp-config.ini}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# Parse bucket_name from config.
BUCKET_NAME=$(awk -F'=' '/^\[s3\]/{in_s3=1} in_s3 && /^bucket_name/{gsub(/ /,"",$2); print $2; exit}' "$CONFIG_FILE")
if [[ -z "$BUCKET_NAME" ]]; then
  echo "[bootstrap-localstack] ERROR: could not read bucket_name from $CONFIG_FILE" >&2
  exit 1
fi

aws_local() {
  aws --endpoint-url "$ENDPOINT" \
      --region "$REGION" \
      --no-sign-request \
      "$@" 2>/dev/null
}

echo "[bootstrap-localstack] endpoint=$ENDPOINT bucket=$BUCKET_NAME"

# ── S3 bucket ────────────────────────────────────────────────────────────────
if aws_local s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "[bootstrap-localstack] bucket '$BUCKET_NAME' already exists — skipping create"
else
  aws_local s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --create-bucket-configuration "LocationConstraint=$REGION" \
    || aws_local s3api create-bucket --bucket "$BUCKET_NAME"
  echo "[bootstrap-localstack] created bucket '$BUCKET_NAME'"
fi

# Disable block-public-access so presigned-URL downloads work in local tests.
aws_local s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  || true

# ── IAM user (photoapp-readwrite) ────────────────────────────────────────────
if aws_local iam get-user --user-name photoapp-readwrite > /dev/null 2>&1; then
  echo "[bootstrap-localstack] IAM user 'photoapp-readwrite' already exists — skipping"
else
  aws_local iam create-user --user-name photoapp-readwrite
  echo "[bootstrap-localstack] created IAM user 'photoapp-readwrite'"
fi

echo "[bootstrap-localstack] done"
