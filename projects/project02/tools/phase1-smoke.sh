#!/usr/bin/env bash
#
# phase1-smoke.sh - Phase 1 test gate runner for the
# `docker-native-deployment` plan. Defined in
# scratch/phase1-test-suite.md.
#
# Lane: AWS (production-shape). Talks to real RDS + S3 + Rekognition via
# `make docker-up-aws`. The Phase 1 smoke deliberately targets the AWS
# lane because that is what gets hosted on Elastic Beanstalk; LocalStack
# smoke is a separate concern and is queued as a TODO in
# scratch/phase2-codebase-test-alignment-stub.md (Workstream P2.E).
#
# Layers exercised (in order):
#   1. server unit tests             (jest tests/unit)
#   2. server integration tests      (jest tests/integration)
#   3. server contract tests         (jest tests/contract)
#   4. server smoke tests            (jest tests/smoke)
#   5. Docker image build            (server/Dockerfile from monorepo root)
#   6. Compose config validation     (docker compose config)
#   7. AWS-lane runtime + HTTP probes (make docker-up-aws + curl)
#      Includes early /readyz envelope check so an infra-missing failure
#      surfaces with a specific diagnostic instead of a generic curl FAIL.
#   8. Container source layout       (docker compose exec)
#
# Usage:
#   bash tools/phase1-smoke.sh                # full suite
#   SKIP_DOCKER=1 bash tools/phase1-smoke.sh  # only layers 1-4
#   SKIP_RUNTIME=1 bash tools/phase1-smoke.sh # layers 1-6 (no docker-up)
#
# Exits 0 only if every selected layer passes. Logs to
# scratch/phase1-smoke.log AND stdout via tee.
#
# Exit codes:
#   0  GREEN — all selected layers passed
#   1  RED   — one or more layers failed
#   2  AWS-INFRA-MISSING — Layer 7 detected /readyz returned a structured
#                          "unavailable" envelope; the server is healthy
#                          but real AWS infrastructure (RDS or S3) is
#                          unreachable. Investigate AWS state, not code.
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
    # Layer 7: AWS-lane runtime + HTTP probes.
    # First bring up the AWS lane and probe /healthz (server liveness).
    # Then introspect /readyz: a 503 with structured `{checks:{rds,s3}}`
    # means the server is alive but AWS infra is unreachable — distinct from
    # a generic probe failure. Promote that to AWS-INFRA-MISSING so the
    # operator knows to investigate AWS state, not Project02 code.
    if ! run_layer "Layer: docker-up-aws + /healthz" \
      "cd '${PROJECT_DIR}' && make docker-up-aws && sleep 8 \
       && curl -fsS http://localhost:8080/healthz"; then
      GATE_FAIL=1
    else
      # Probe /readyz once and inspect the structured envelope.
      READYZ_BODY="$(curl -sS -o - -w '\nHTTP_STATUS:%{http_code}\n' http://localhost:8080/readyz 2>&1 || true)"
      echo "${READYZ_BODY}" >>"${LOG}"
      READYZ_STATUS="$(printf '%s' "${READYZ_BODY}" | sed -n 's/^HTTP_STATUS://p')"

      if [ "${READYZ_STATUS}" = "503" ] && printf '%s' "${READYZ_BODY}" | grep -q '"status":"unavailable"'; then
        echo "" | tee -a "${LOG}"
        echo "==> Phase 1 smoke AWS-INFRA-MISSING" | tee -a "${LOG}"
        echo "    /readyz returned 503 with structured envelope:" | tee -a "${LOG}"
        printf '%s\n' "${READYZ_BODY}" | grep -E '"checks"|"status"' | tee -a "${LOG}"
        echo "    The server is alive but real AWS infra is unreachable." | tee -a "${LOG}"
        echo "    Investigate AWS state (RDS endpoint, S3 bucket name, IAM keys)" | tee -a "${LOG}"
        echo "    in client/photoapp-config.ini before re-running." | tee -a "${LOG}"
        run_layer "Layer: compose teardown" "cd '${PROJECT_DIR}' && make docker-down" || true
        echo "Phase 1 test gate: AWS-INFRA-MISSING (exit 2)" | tee -a "${LOG}"
        exit 2
      fi

      if ! run_layer "Layer: AWS-lane HTTP probes (/readyz /ping /users /images)" \
        "curl -fsS http://localhost:8080/readyz \
         && curl -fsS http://localhost:8080/ping \
         && curl -fsS http://localhost:8080/users \
         && curl -fsS http://localhost:8080/images"; then
        GATE_FAIL=1
      fi
    fi

    # Layer 8: Container source layout
    if ! run_layer "Layer: container source layout + node ./app" \
      "cd '${PROJECT_DIR}' && docker compose exec -T server ls /app/projects/project02/server \
       && docker compose exec -T server node -e \"require('./app'); console.log('app load OK');\""; then
      GATE_FAIL=1
    fi

    # Always tear down so subsequent runs are clean.
    run_layer "Layer: compose teardown" "cd '${PROJECT_DIR}' && make docker-down" || true

    # NOTE: A LocalStack-lane smoke is intentionally NOT run here. That
    # smoke needs careful design (deterministic seed reset between runs,
    # bootstrap-localstack idempotency verification, fixture isolation)
    # to avoid being brittle. Tracked in
    # scratch/phase2-codebase-test-alignment-stub.md (Workstream P2.E).
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
