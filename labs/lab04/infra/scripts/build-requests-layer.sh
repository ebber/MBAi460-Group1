#!/usr/bin/env bash
# Build Lambda layer zip with Linux x86_64 deps (works on macOS hosts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/build"
ZIP="${OUT}/requests-layer.zip"

rm -rf "${OUT}"
mkdir -p "${OUT}/python"

docker run --rm --platform linux/amd64 --entrypoint bash \
  -v "${OUT}:/out" \
  public.ecr.aws/lambda/python:3.12 \
  -c 'pip install requests typing_extensions==4.14.1 -t /out/python --quiet --root-user-action=ignore'

(cd "${OUT}" && zip -qr requests-layer.zip python)

echo "Built ${ZIP}"
unzip -l "${ZIP}" | head -10 || true
