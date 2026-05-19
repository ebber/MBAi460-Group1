#!/usr/bin/env bash
set -euo pipefail

ENV_DIR="$(cd "$(dirname "$0")/../envs/dev" && pwd)"
OUT="$(cd "$(dirname "$0")/../.." && pwd)/lab04-client-config.ini"

URL="$(cd "${ENV_DIR}" && terraform output -raw invoke_url 2>/dev/null || true)"
URL="${URL%/}"

if [ -z "${URL}" ]; then
  echo "ERROR: invoke_url is empty. Run terraform apply in ${ENV_DIR} first." >&2
  exit 1
fi

cat > "${OUT}" <<EOF
[client]
webservice=${URL}
EOF

echo "Wrote ${OUT}"
echo "webservice=${URL}"
