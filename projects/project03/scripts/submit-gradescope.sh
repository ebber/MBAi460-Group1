#!/usr/bin/env bash
# Submit Project 03 Part 01 (authsvc) to Gradescope via instructor Docker image.
#
# Submits BOTH INIs: authsvc-config.ini + authsvc-client-config.ini
#
# Prerequisites:
#   - Docker image built: from MBAi460-Group1 repo root, run ./docker/build
#   - Gradescope token: mbai460-client/.gradescope (sibling of MBAi460-Group1)
#   - Both INIs present in projects/project03/ (placeholders for the ~0/50
#     hello-world baseline; real values after Checkpoint 3 `make config`)
#
# Usage (from anywhere):
#   projects/project03/scripts/submit-gradescope.sh
#
# Mirrors labs/lab04/scripts/submit-gradescope.sh (shell pattern only).

set -euo pipefail

PROJ03="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${PROJ03}/../.." && pwd)"
LAB_CLIENT_ROOT="$(cd "${REPO_ROOT}/.." && pwd)"
IMAGE="$(cat "${REPO_ROOT}/docker/_image-name.txt")"

COURSE_ID=1288073
ASSIGNMENT_ID=8159384   # Project 03, part 01 - authsvc (DP-4: confirm on Gradescope UI)

SERVER_INI="${PROJ03}/authsvc-config.ini"
CLIENT_INI="${PROJ03}/authsvc-client-config.ini"

for f in "${SERVER_INI}" "${CLIENT_INI}"; do
  if [[ ! -f "${f}" ]]; then
    echo "ERROR: missing ${f}" >&2
    exit 1
  fi
done

if [[ ! -f "${LAB_CLIENT_ROOT}/.gradescope" ]]; then
  echo "ERROR: Gradescope token not found at ${LAB_CLIENT_ROOT}/.gradescope" >&2
  exit 1
fi

if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
  echo "ERROR: Docker image '${IMAGE}' not found. Build from repo root: ./docker/build" >&2
  exit 1
fi

if grep -ql 'placeholder' "${SERVER_INI}" "${CLIENT_INI}" 2>/dev/null; then
  echo "NOTE: configs still have placeholder values (expected for the ~0/50 baseline)." >&2
fi

echo "Submitting via Docker (${IMAGE}) -> course ${COURSE_ID}, assignment ${ASSIGNMENT_ID}..."
docker run --rm -u user \
  -e HOME=/home/user \
  -w "/home/user/MBAi460-Group1/projects/project03" \
  -v "${LAB_CLIENT_ROOT}:/home/user" \
  --network host \
  "${IMAGE}" \
  /gradescope/gs submit "${COURSE_ID}" "${ASSIGNMENT_ID}" authsvc-config.ini authsvc-client-config.ini
