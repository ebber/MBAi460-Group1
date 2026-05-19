#!/usr/bin/env bash
# Submit lab04-client-config.ini via instructor Docker image (mbai460-client).
#
# Prerequisites:
#   - Docker image built: from MBAi460-Group1 repo root, run ./docker/build
#   - Gradescope token: mbai460-client/.gradescope (sibling of MBAi460-Group1)
#   - lab04-client-config.ini with live [client] webservice (no trailing slash)
#
# Usage (from anywhere):
#   make -C labs/lab04 submit
#   labs/lab04/scripts/submit-gradescope.sh

set -euo pipefail

LAB04="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${LAB04}/../.." && pwd)"
LAB_CLIENT_ROOT="$(cd "${REPO_ROOT}/.." && pwd)"
CONFIG="${LAB04}/lab04-client-config.ini"
IMAGE="$(cat "${REPO_ROOT}/docker/_image-name.txt")"

COURSE_ID=1288073
ASSIGNMENT_ID=8138322

if [[ ! -f "${CONFIG}" ]]; then
  echo "ERROR: missing ${CONFIG}" >&2
  exit 1
fi

if [[ ! -f "${LAB_CLIENT_ROOT}/.gradescope" ]]; then
  echo "ERROR: Gradescope token not found at ${LAB_CLIENT_ROOT}/.gradescope" >&2
  exit 1
fi

if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
  echo "ERROR: Docker image '${IMAGE}' not found. Build from repo root:" >&2
  echo "  ./docker/build" >&2
  exit 1
fi

if grep -q 'placeholder.execute-api' "${CONFIG}" 2>/dev/null; then
  echo "WARNING: config still has placeholder URL" >&2
fi

echo "Submitting via Docker (${IMAGE})..."
docker run --rm -u user \
  -e HOME=/home/user \
  -w "/home/user/MBAi460-Group1/labs/lab04" \
  -v "${LAB_CLIENT_ROOT}:/home/user" \
  --network host \
  "${IMAGE}" \
  /gradescope/gs submit "${COURSE_ID}" "${ASSIGNMENT_ID}" lab04-client-config.ini
