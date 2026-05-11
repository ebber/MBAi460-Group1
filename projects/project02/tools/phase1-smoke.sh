#!/usr/bin/env bash
#
# phase1-smoke.sh - Phase 1 test gate runner for the
# `docker-native-deployment` plan. Defined in
# scratch/phase1-test-suite.md.
#
# Layers exercised (in order):
#   1. server unit tests             (jest tests/unit)
#   2. server integration tests      (jest tests/integration)
#   3. server contract tests         (jest tests/contract)
#   4. server smoke tests            (jest tests/smoke)
#   5. Docker image build            (server/Dockerfile from monorepo root)
#   6. Compose config validation     (docker compose config)
#   7. Compose runtime + HTTP probes (make up + curl)
#   8. Container source layout       (docker compose exec)
#
# Usage:
#   bash tools/phase1-smoke.sh                # full suite
#   SKIP_DOCKER=1 bash tools/phase1-smoke.sh  # only layers 1-4
#   SKIP_RUNTIME=1 bash tools/phase1-smoke.sh # layers 1-6 (no make up)
#
# Exits 0 only if every selected layer passes. Logs to
# scratch/phase1-smoke.log AND stdout via tee.
set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${PROJECT_DIR}/../.." && pwd)"
SERVER_DIR="${PROJECT_DIR}/server"
LOG="${PROJECT_DIR}/scratch/phase1-smoke.log"

mkdir -p "${PROJECT_DIR}/scratch"
: >"${LOG}"

declare -a RESULTS=()

run_layer() {
  local label="$1"; shift
  local cmd="$*"
  echo "" | tee -a "${LOG}"
  echo "==> ${label}" | tee -a "${LOG}"
  echo "    \$ ${cmd}" | tee -a "${LOG}"
  if bash -c "${cmd}" >>"${LOG}" 2>&1; then
    echo "    OK" | tee -a "${LOG}"
    RESULTS+=("PASS  ${label}")
    return 0
  else
    echo "    FAIL" | tee -a "${LOG}"
    RESULTS+=("FAIL  ${label}")
    return 1
  fi
}

GATE_FAIL=0

# Layer 1-4 (npm jest layers)
for layer in unit integration contract smoke; do
  if ! run_layer "Layer: server ${layer} tests" \
    "cd '${SERVER_DIR}' && npm run --silent test:${layer}"; then
    GATE_FAIL=1
  fi
done

if [ "${SKIP_DOCKER:-0}" = "1" ]; then
  echo "" | tee -a "${LOG}"
  echo "==> SKIP_DOCKER=1, stopping after npm layers" | tee -a "${LOG}"
else
  # Layer 5: Docker build
  if ! run_layer "Layer: docker build mbai460-project02:phase1" \
    "cd '${REPO_ROOT}' && docker build -t mbai460-project02:phase1 -f projects/project02/server/Dockerfile ."; then
    GATE_FAIL=1
  fi

  # Layer 6: Compose config
  if ! run_layer "Layer: docker compose config validation" \
    "cd '${PROJECT_DIR}' && docker compose config --services >/dev/null && docker compose config --quiet"; then
    GATE_FAIL=1
  fi

  if [ "${SKIP_RUNTIME:-0}" = "1" ]; then
    echo "" | tee -a "${LOG}"
    echo "==> SKIP_RUNTIME=1, stopping before runtime probes" | tee -a "${LOG}"
  else
    # Layer 7: Compose runtime + HTTP
    if ! run_layer "Layer: compose runtime up + HTTP probes" \
      "cd '${PROJECT_DIR}' && make up && sleep 12 \
       && curl -fsS http://localhost:8080/healthz \
       && curl -fsS http://localhost:8080/readyz \
       && curl -fsS http://localhost:8080/ping \
       && curl -fsS http://localhost:8080/users \
       && curl -fsS http://localhost:8080/images"; then
      GATE_FAIL=1
    fi

    # Layer 8: Container source layout
    if ! run_layer "Layer: container source layout + node ./app" \
      "cd '${PROJECT_DIR}' && docker compose exec -T server ls /app/projects/project02/server \
       && docker compose exec -T server node -e \"require('./app'); console.log('app load OK');\""; then
      GATE_FAIL=1
    fi

    # Always tear down so subsequent runs are clean.
    run_layer "Layer: compose teardown" "cd '${PROJECT_DIR}' && make down" || true
  fi
fi

echo "" | tee -a "${LOG}"
echo "==> Phase 1 smoke summary" | tee -a "${LOG}"
for r in "${RESULTS[@]}"; do
  echo "    ${r}" | tee -a "${LOG}"
done

if [ "${GATE_FAIL}" -ne 0 ]; then
  echo "" | tee -a "${LOG}"
  echo "Phase 1 test gate: RED (one or more layers failed; see ${LOG})" | tee -a "${LOG}"
  exit 1
fi

echo "" | tee -a "${LOG}"
echo "Phase 1 test gate: GREEN" | tee -a "${LOG}"
exit 0
