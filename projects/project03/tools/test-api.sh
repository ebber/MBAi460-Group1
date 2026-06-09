#!/usr/bin/env bash
# Live smoke for POST /auth (run after apply). test02 (fail) -> test01 (token) -> test03 (verify).
# Expiry check is a separate manual step (needs ~2 min wait).
set -uo pipefail
PROJ03="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_INI="${PROJ03}/authsvc-client-config.ini"
BASE="${BASE_URL:-$(grep -E '^webservice=' "$CLIENT_INI" 2>/dev/null | cut -d= -f2-)}"
if [ -z "${BASE:-}" ]; then echo "ERROR: no base URL (run 'make config' or set BASE_URL)" >&2; exit 1; fi
BASE="${BASE%/}"
AUTH="${BASE}/auth"
pass=0; fail=0
echo "== test-api against ${AUTH} =="

echo "-- test02: wrong password -> expect 401 invalid password"
R=$(curl -sS -o /tmp/p3_t2.body -w '%{http_code}' -X POST "$AUTH" -H 'Content-Type: application/json' -d '{"username":"p_sarkar","password":"fred123","duration":2}' 2>&1)
echo "   HTTP ${R} · body: $(cat /tmp/p3_t2.body 2>/dev/null)"
[ "$R" = "401" ] && { echo "   [PASS]"; pass=$((pass+1)); } || { echo "   [FAIL] expected 401"; fail=$((fail+1)); }

echo "-- test01: valid login (duration 2) -> expect 200 + token"
R=$(curl -sS -o /tmp/p3_t1.body -w '%{http_code}' -X POST "$AUTH" -H 'Content-Type: application/json' -d '{"username":"p_sarkar","password":"abc123!!","duration":2}' 2>&1)
echo "   HTTP ${R} · body: $(cat /tmp/p3_t1.body 2>/dev/null)"
TOKEN=$(tr -d '"' < /tmp/p3_t1.body 2>/dev/null)
{ [ "$R" = "200" ] && [ -n "$TOKEN" ]; } && { echo "   [PASS]"; pass=$((pass+1)); } || { echo "   [FAIL] expected 200 + token"; fail=$((fail+1)); }

echo "-- test03: verify token -> expect 200 + userid"
R=$(curl -sS -o /tmp/p3_t3.body -w '%{http_code}' -X POST "$AUTH" -H 'Content-Type: application/json' -d "{\"token\":\"${TOKEN}\"}" 2>&1)
echo "   HTTP ${R} · body: $(cat /tmp/p3_t3.body 2>/dev/null)"
[ "$R" = "200" ] && { echo "   [PASS]"; pass=$((pass+1)); } || { echo "   [FAIL] expected 200 + userid"; fail=$((fail+1)); }

echo
echo "Passed: ${pass} | Failed: ${fail}"
echo "Token (for manual expiry test after 2+ min): ${TOKEN}"
[ "$fail" -eq 0 ] && exit 0 || exit 1
