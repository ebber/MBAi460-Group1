#!/usr/bin/env bash
# Write the Gradescope client INI (authsvc-client-config.ini) from terraform invoke_url.
# webservice = base invoke URL, no trailing slash; client appends /auth.
set -euo pipefail
ENV_DIR="$(cd "$(dirname "$0")/../envs/dev" && pwd)"
OUT="$(cd "$(dirname "$0")/../.." && pwd)/authsvc-client-config.ini"

URL="$(cd "${ENV_DIR}" && terraform output -raw invoke_url 2>/dev/null || true)"
URL="${URL%/}"

if [ -z "${URL}" ]; then
  echo "ERROR: invoke_url is empty. Run 'make apply' first." >&2
  exit 1
fi

cat > "${OUT}" <<EOF
[client]
webservice=${URL}
EOF

echo "Wrote ${OUT}"
echo "webservice=${URL}"
