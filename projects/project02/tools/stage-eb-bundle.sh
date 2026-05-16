#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  stage-eb-bundle.sh --config-file PATH [--output-dir PATH] [--bundle-name NAME]

Stages the Project02 Node/Express app as an Elastic Beanstalk Node platform
bundle by delegating to labs/lab03-production-grade/bin/stage-eb-node-app.sh.

Required:
  --config-file PATH    Real or example photoapp-config.ini to place at bundle root.

Optional:
  --output-dir PATH     Defaults to projects/project02/build/eb.
  --bundle-name NAME    Defaults to project02-photoapp-<UTC timestamp>.
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${PROJECT_DIR}/../.." && pwd)"
SCAFFOLD="${REPO_ROOT}/labs/lab03-production-grade/bin/stage-eb-node-app.sh"

CONFIG_FILE=""
OUTPUT_DIR="${PROJECT_DIR}/build/eb"
BUNDLE_NAME="project02-photoapp-$(date -u +%Y%m%dT%H%M%SZ)"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --config-file)
      CONFIG_FILE="${2:-}"; shift 2 ;;
    --output-dir)
      OUTPUT_DIR="${2:-}"; shift 2 ;;
    --bundle-name)
      BUNDLE_NAME="${2:-}"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2 ;;
  esac
done

[ -n "$CONFIG_FILE" ] || { echo "ERROR: --config-file is required" >&2; exit 2; }
[ -x "$SCAFFOLD" ] || { echo "ERROR: scaffold stager missing or not executable: $SCAFFOLD" >&2; exit 2; }

"$SCAFFOLD" \
  --source-dir "${PROJECT_DIR}/server" \
  --config-file "$CONFIG_FILE" \
  --output-dir "$OUTPUT_DIR" \
  --bundle-name "$BUNDLE_NAME" \
  --entrypoint server.js
