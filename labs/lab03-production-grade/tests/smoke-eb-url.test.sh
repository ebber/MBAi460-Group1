#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SMOKE="${ROOT}/bin/smoke-eb-url.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

TMP_PARENT="${ROOT}/.tmp"
mkdir -p "$TMP_PARENT"
WORK="$(mktemp -d "$TMP_PARENT/smoke.XXXXXXXX")"
cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

cat >"$WORK/server.py" <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/healthz", "/users"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"message":"success"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, *_args):
        pass

HTTPServer(("127.0.0.1", 18083), Handler).serve_forever()
PY

python3 "$WORK/server.py" &
SERVER_PID=$!
sleep 1

OUTPUT="$("$SMOKE" \
  --base-url "http://127.0.0.1:18083" \
  --path /healthz \
  --path /users \
  --expect /healthz=200 \
  --expect /users=200)"

echo "$OUTPUT" | grep -q "PASS /healthz 200" || fail "missing /healthz pass output"
echo "$OUTPUT" | grep -q "PASS /users 200" || fail "missing /users pass output"

if "$SMOKE" \
  --base-url "http://127.0.0.1:18083" \
  --path /missing \
  --expect /missing=200 >/tmp/smoke-eb-url.fail.log 2>&1; then
  fail "expected smoke helper to fail when status does not match"
fi

grep -q "FAIL /missing expected=200 actual=404" /tmp/smoke-eb-url.fail.log \
  || fail "missing status mismatch diagnostic"

echo "PASS smoke-eb-url"
